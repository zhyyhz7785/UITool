/* UITool browser-only filesystem. No path reaches the real machine. */
export function installMemoryPlatform(platform,info){
  if("__TAURI_INTERNALS__" in window)throw Error("高级文字预览必须在隔离浏览器中运行");
  const original=platform.getPlatform();
  const ROOT="/uitool-memory";
  const files=new Map(),dirs=new Set([ROOT]);
  const enc=new TextEncoder(),dec=new TextDecoder();
  function normalize(value){
    const raw=String(value??"").replace(/\\/g,"/");
    const parts=[];
    for(const piece of raw.split("/")){
      if(!piece||piece===".")continue;
      if(piece===".."){parts.pop();continue;}
      parts.push(piece);
    }
    return (raw.startsWith("/")?"/":"")+parts.join("/") || (raw.startsWith("/")?"/":".");
  }
  function dirname(value){
    const p=String(value??"").replace(/\\/g,"/");
    // Both command-side snapshot creation and the native editor bridge resolve
    // relative assets through this exact same per-document directory.
    if(/^untitled:[0-9]+$/.test(p))return ROOT+"/"+p.replace(":","-");
    const n=normalize(p),i=n.lastIndexOf("/");
    return i<0?".":n.slice(0,i)||"/";
  }
  function join(...parts){
    return normalize(parts.map(x=>String(x??"")).join("/"));
  }
  function scoped(p){
    const n=normalize(p);
    if(n!==ROOT&&!n.startsWith(ROOT+"/"))throw Error("预览只支持内存文件："+p);
    return n;
  }
  function mkdir(p){
    const n=scoped(p);
    const rest=n.slice(ROOT.length).split("/").filter(Boolean);
    let at=ROOT;
    for(const part of rest){at+="/"+part;if(files.has(at))throw Error("路径已是文件："+at);dirs.add(at);}
  }
  function read(p){
    const n=scoped(p),v=files.get(n);
    if(!v)throw Error("内存文件不存在："+n);
    return v.data.slice();
  }
  function write(p,data,options){
    const n=scoped(p);
    if(n===ROOT||dirs.has(n))throw Error("不能覆盖内存目录："+n);
    mkdir(dirname(n));
    const input=Uint8Array.from(data);
    let out=input;
    if(options?.append&&files.has(n)){
      const old=files.get(n).data;out=new Uint8Array(old.length+input.length);out.set(old);out.set(input,old.length);
    }
    files.set(n,{data:out,mtime:new Date()});
  }
  function exists(p){try{const n=scoped(p);return files.has(n)||dirs.has(n);}catch{return false;}}
  const unavailable=async()=>{throw Error("UITool 预览不连接本机文件或原生服务");};
  const notify=(message)=>{const s=String(message);info.textContent=s;window.alert(s);};
  const fake={
    ...original,
    ipc:{invoke:async(cmd,args)=>{
      if(cmd==="allow_scope"&&typeof args?.path==="string")return scoped(args.path);
      // Preserve the product's existing browser fallback, including its own license preview.
      throw Error("UITool 浏览器预览不支持 IPC："+cmd);
    }},
    fs:{
      readFile:async p=>read(p),
      readTextFile:async p=>dec.decode(read(p)),
      writeFile:async(p,b)=>write(p,b),
      writeTextFile:async(p,s,opts)=>write(p,enc.encode(s),opts),
      exists:async p=>exists(p),
      stat:async p=>{const n=scoped(p),v=files.get(n);if(v)return {isFile:true,isDirectory:false,size:v.data.length,mtime:v.mtime};if(dirs.has(n))return {isFile:false,isDirectory:true,size:0,mtime:null};throw Error("内存路径不存在："+n);},
      mkdir:async p=>mkdir(p),
      readDir:async p=>{const n=scoped(p);if(!dirs.has(n))throw Error("内存目录不存在："+n);return [...dirs,...files.keys()].filter(x=>x!==n&&dirname(x)===n).map(x=>({name:x.slice(n.length+1),isFile:files.has(x),isDirectory:dirs.has(x)}));},
      remove:async(p,opts)=>{const n=scoped(p);if(n===ROOT)throw Error("不能删除预览根目录");if(files.delete(n))return;const children=[...dirs,...files.keys()].filter(x=>x.startsWith(n+"/"));if(children.length&&!opts?.recursive)throw Error("内存目录非空");for(const x of children){files.delete(x);dirs.delete(x);}dirs.delete(n);},
      copyFile:async(a,b)=>write(b,read(a)),
      rename:async(a,b)=>{const data=read(a);write(b,data);files.delete(scoped(a));},
      watchImmediate:async()=>()=>{}
    },
    path:{
      join:async(...p)=>join(...p),dirname:async p=>dirname(p),
      basename:async(p,ext)=>{const n=normalize(p).split("/").pop()||"";return ext&&n.endsWith(ext)?n.slice(0,-ext.length):n;},
      extname:async p=>{const n=normalize(p).split("/").pop()||"",i=n.lastIndexOf(".");return i>0?n.slice(i):"";},
      isAbsolute:async p=>/^\/|^[A-Za-z]:[\\/]/.test(String(p)),
      tempDir:async()=>ROOT+"/temp",appDataDir:async()=>ROOT+"/appdata",
      resolveResource:unavailable
    },
    dialog:{
      open:async()=>{notify("当前为 UITool 内存预览，不选择本机文件。");return null;},
      save:async()=>{notify("当前为 UITool 内存预览，不写出本机文件。");return null;},
      message:async text=>{notify(text);return "Ok";},
      ask:async text=>window.confirm(String(text))
    },
    asset:{convertFileSrc:()=>""},
    opener:{revealItemInDir:unavailable,openUrl:unavailable},
    events:{listen:async()=>()=>{}}
  };
  platform.setPlatformForTest(fake);
}
