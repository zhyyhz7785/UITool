// Read-only snapshot of HY3D PR #2237; dependencies come from existing local product mirror.
import { readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE=path.join(path.dirname(fileURLToPath(import.meta.url)),"mtext-preview");
const manifest=JSON.parse(readFileSync(path.join(HERE,"assets.json"),"utf8"));
const UI=new Set(["text_window.html","text_window.js","text_window.css","md_workspace.js","text_sdk_session.js","owned_theme.js","owned_window.css","tokens.css","palettes/acad-b/palette.css","palettes/blender-dark/palette.css"]);
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff":"font/woff",".woff2":"font/woff2",".ttf":"font/ttf",".wasm":"application/wasm"};
const PREFIX="/__uitool-mtext/";
function gitBlob(bytes){return createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");}
function readDependency(root,rel){
  const file=path.join(root,rel);
  if(!existsSync(file)||!statSync(file).isFile())throw Error("产品镜像缺少 "+rel+"，请先同步 HY3D 界面");
  const bytes=readFileSync(file);
  if(gitBlob(bytes)===manifest.assets[rel])return bytes;
  // Windows checkout may apply autocrlf. Accept only the exact pinned LF content.
  if(/\.(?:js|css|json|svg)$/i.test(rel)){
    const normalized=Buffer.from(bytes.toString("utf8").replace(/\r\n/g,"\n"),"utf8");
    if(gitBlob(normalized)===manifest.assets[rel])return normalized;
  }
  throw Error("产品镜像版本不匹配："+rel+"；需要与 HY3D #2237 的 SDK 版本一致");
}
export function serveMtextPreview(raw,req,res,root){
  if(!raw.startsWith(PREFIX))return false;
  if(req.method!=="GET"&&req.method!=="HEAD"){res.writeHead(405);res.end();return true;}
  const rel=raw.slice(PREFIX.length)||"text_window.html";
  const send=(status,mime,body)=>{res.writeHead(status,{"content-type":mime,"cache-control":"no-store","x-content-type-options":"nosniff"});res.end(req.method==="HEAD"?undefined:body);};
  try{
    if(rel==="fixture.js"){send(200,MIME[".js"],readFileSync(path.join(HERE,"fixture.js")));return true;}
    if(UI.has(rel)){
      let body=readFileSync(path.join(HERE,"product",rel));
      if(rel==="text_window.html"){
        // Fail early with a readable message instead of silently showing an empty window.
        for(const dependency of ["sdk-text/index.js","sdk-text/chunks/index.js","sdk-text/chunks/editor.js","doc-dist/text-sdk-source.js"])readDependency(root,dependency);
        const html=body.toString("utf8"), anchor='<script src="host.js"></script>';
        if(html.split(anchor).length!==2)throw Error("固定版本 host 入口不匹配");
        body=html.replace(anchor,'<script src="fixture.js"></script>');
      }
      send(200,MIME[path.extname(rel)]||"application/octet-stream",body);return true;
    }
    if(Object.hasOwn(manifest.assets,rel)){send(200,MIME[path.extname(rel)]||"application/octet-stream",readDependency(root,rel));return true;}
    send(404,"text/plain; charset=utf-8","未配置的文字编辑器预览资源");
  }catch(err){send(502,"text/plain; charset=utf-8","UITool 高级文字预览："+String(err.message||err));}
  return true;
}
