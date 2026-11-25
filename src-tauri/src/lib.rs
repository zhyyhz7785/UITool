use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;

struct Product {
    main: String,
    worktree: String,
    authorized: bool,
}

fn policy_path() -> PathBuf {
    if let Ok(p) = std::env::var("UITOOL_POLICY") {
        return PathBuf::from(p);
    }
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .unwrap_or_else(|_| ".".into());
    PathBuf::from(home).join(".config").join("uitool").join("paths.json")
}

fn json_string_field(obj: &str, key: &str) -> String {
    let pat = format!("\"{key}\"");
    let Some(i) = obj.find(&pat) else { return String::new() };
    let rest = &obj[i + pat.len()..];
    let Some(q) = rest.find('"') else { return String::new() };
    let mut out = String::new();
    let mut esc = false;
    for ch in rest[q + 1..].chars() {
        if esc {
            out.push(ch);
            esc = false;
            continue;
        }
        if ch == '\\' {
            esc = true;
            continue;
        }
        if ch == '"' {
            break;
        }
        out.push(ch);
    }
    out
}

fn read_policy() -> Vec<Product> {
    let Ok(text) = fs::read_to_string(policy_path()) else { return Vec::new() };
    text.split("\"id\"")
        .skip(1)
        .map(|chunk| {
            let authorized = chunk
                .find("\"authorized\"")
                .map(|i| chunk[i..].contains("true"))
                .unwrap_or(false);
            Product {
                main: json_string_field(chunk, "main"),
                worktree: json_string_field(chunk, "worktree"),
                authorized,
            }
        })
        .collect()
}

fn norm(path: &str) -> String {
    Path::new(path).to_string_lossy().replace('\\', "/")
}

fn has_dot_dot(path: &str) -> bool {
    path.replace('\\', "/").split('/').any(|p| p == "..")
}

fn under(file: &str, root: &str) -> bool {
    if root.is_empty() {
        return false;
    }
    let n = norm(file);
    let r = norm(root);
    n == r || n.starts_with(&(r.trim_end_matches('/').to_string() + "/"))
}

fn is_linked_worktree(dir: &str) -> bool {
    if dir.is_empty() || !Path::new(dir).exists() {
        return false;
    }
    let run = |args: &[&str]| -> Option<String> {
        let out = Command::new("git").arg("-C").arg(dir).args(args).output().ok()?;
        if !out.status.success() {
            return None;
        }
        Some(String::from_utf8_lossy(&out.stdout).trim().to_string())
    };
    let (Some(git_dir), Some(common)) = (run(&["rev-parse", "--git-dir"]), run(&["rev-parse", "--git-common-dir"])) else {
        return false;
    };
    let base = Path::new(dir);
    let a = base.join(&git_dir);
    let b = base.join(&common);
    match (a.canonicalize(), b.canonicalize()) {
        (Ok(x), Ok(y)) => x != y,
        _ => a != b,
    }
}

fn product_of(file: &str) -> Option<Product> {
    read_policy().into_iter().find(|p| under(file, &p.main) || under(file, &p.worktree))
}

fn can_read(file: &str) -> bool {
    !has_dot_dot(file) && product_of(file).is_some()
}

fn can_write_product(file: &str) -> bool {
    if has_dot_dot(file) {
        return false;
    }
    let Some(hit) = product_of(file) else { return false };
    if !hit.authorized || hit.worktree.is_empty() || !under(file, &hit.worktree) {
        return false;
    }
    if !hit.main.is_empty() && norm(&hit.worktree) == norm(&hit.main) {
        return false;
    }
    is_linked_worktree(&hit.worktree)
}

fn can_write_user(file: &str) -> bool {
    if has_dot_dot(file) {
        return false;
    }
    for item in read_policy() {
        if item.main.is_empty() || !under(file, &item.main) {
            continue;
        }
        let in_worktree = !item.worktree.is_empty() && under(file, &item.worktree) && norm(&item.worktree) != norm(&item.main);
        if !in_worktree {
            return false;
        }
    }
    true
}

fn hash_text(text: &str) -> String {
    let mut h: i32 = 5381;
    for unit in text.encode_utf16() {
        h = h.wrapping_mul(33) ^ i32::from(unit);
    }
    format!("{:x}", h as u32)
}

fn atomic_write(path: &Path, data: &[u8]) -> Result<(), String> {
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(|e| format!("创建目录失败：{e}"))?;
    }
    let tmp = PathBuf::from(format!("{}.uitool-tmp", path.display()));
    let bak = PathBuf::from(format!("{}.uitool-bak", path.display()));
    {
        let mut file = fs::File::create(&tmp).map_err(|e| format!("写入临时文件失败：{e}"))?;
        file.write_all(data).map_err(|e| format!("写入临时文件失败：{e}"))?;
    }
    if path.exists() {
        fs::rename(path, &bak).map_err(|e| format!("挪开原文件失败：{e}"))?;
    }
    if let Err(e) = fs::rename(&tmp, path) {
        if bak.exists() && !path.exists() {
            let _ = fs::rename(&bak, path);
        }
        return Err(format!("替换失败：{e}"));
    }
    let _ = fs::remove_file(&bak);
    Ok(())
}

/// 用户在保存对话框里选的路径。不能落在产品主仓里。
#[tauri::command]
fn write_file(path: String, data: Vec<u8>) -> Result<(), String> {
    if !can_write_user(&path) {
        return Err("不能把文件写进产品主仓".into());
    }
    atomic_write(Path::new(&path), &data)
}

/// 写回已授权的开发工作树。expect 是读取时的内容摘要，对不上就停下。
#[tauri::command]
fn write_product(path: String, data: Vec<u8>, expect: Option<String>) -> Result<(), String> {
    if !can_write_product(&path) {
        return Err("只能写入已授权的开发工作树，主仓不能直接改".into());
    }
    if let Some(expect) = expect {
        let current = fs::read_to_string(&path).unwrap_or_default();
        if hash_text(&current) != expect {
            return Err(format!("文件已被外部修改：{path}"));
        }
    }
    atomic_write(Path::new(&path), &data)
}

#[tauri::command]
fn set_path_policy(products: String) -> Result<(), String> {
    let text = format!("{{\"products\":{products}}}\n");
    atomic_write(&policy_path(), text.as_bytes())
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    if !can_read(&path) {
        return Err("路径不在已登记的产品目录里".into());
    }
    fs::read_to_string(&path).map_err(|e| format!("读取 {path} 失败：{e}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![write_file, write_product, read_file, set_path_policy])
        .run(tauri::generate_context!())
        .expect("启动 UITool 失败");
}
