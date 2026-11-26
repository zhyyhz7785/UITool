// Read-only dialog inventory and allowlisted preview entries. No product files are written.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import http from "node:http";
export const HY3D_DIALOGS = [
  ["font-report","字体替换 / 原生字体报告","font_report.js",null],
  ["options","设置","settings-shell.js","app.options"],
  ["textstyle","文字样式","cmds/textstyle.js","cad.textstyle"],
  ["dimstyle","标注样式","cmds/dimstyle-cli.js","cad.dimstyle"],
  ["table","插入表格","cmds/table-dialog.js","cad.table"],
  ["tablestyle","表格样式","cmds/tablestyle-dialog.js","cad.tablestyle"],
  ["hatch","图案填充","cmds/hatch-dialog.js","cad.hatch"],
  ["mlstyle","多线样式","cmds/mlstyle-dialog.js","cad.mlstyle"],
  ["block","图块工作台","cmds/block-workbench.js","cad.blockdef"],
  ["layer","图层管理器","cmds/layer-tools.js","cad.layer"],
  ["about","关于","cmds/doc-view.js","ui.about"],
  ["plot","打印","cmds/plot.js","file.plot"],
  ["pagesetup","页面设置","cmds/plot.js","file.pagesetup"],
].map(([id,title,source,command])=>({id:"hy3d-"+id,title,source:"ui/"+source,command,product:"hy3d",mode:"native"}));
export const HYMD_DIALOGS = [
  ["about","关于","src/overlays/AboutDialog.tsx"],
  ["confirm","未保存文档确认","src/overlays/ConfirmSave.tsx"],
  ["license","注册 / 授权","src/overlays/LicenseDialog.tsx"],
  ["context","右键菜单 / 子菜单","src/ui/ContextMenu.tsx"],
].map(([id,title,source])=>({id:"hymd-"+id,title,source,product:"hymd",mode:"native"}));
const FONT={id:"hy3d-font-v2",title:"字体替换 / V2 设计候选",source:"public/hy3d-font-manager/index.html",product:"hy3d",mode:"prototype"};
export function dialogCatalog(product,root) {
  const fixed=product==="hy3d"?[FONT,...HY3D_DIALOGS]:HYMD_DIALOGS;
  const known=new Set(fixed.map(x=>x.source));
  const rows=[...fixed];
  const errors=[];
  const folders=product==="hy3d"?[["", "ui"]]:[["src","src"],["packages","packages"]];
  let scanned=0;
  const ignored=/(^|\/)(?:node_modules|dist|target|__tests__|tests?|fixtures?|\.git)(?:\/|$)|\.(?:test|spec|stories)\./i;
  function walk(abs,rel) {
    let entries;
    try {entries=readdirSync(abs,{withFileTypes:true});} catch(e){errors.push(rel+": "+e.code);return;}
    for(const item of entries){
      const file=path.join(abs,item.name),name=rel+"/"+item.name;
      if(ignored.test(name)||item.isSymbolicLink())continue;
      if(item.isDirectory()){walk(file,name);continue;}
      if(!item.isFile()||! /\.(?:tsx|jsx|js|ts|html)$/i.test(name)||known.has(name))continue;
      const candidate=/dialog|modal|popup|overlay|popover|confirm|font.report|settings|quickinput/i.test(item.name);
      if(!candidate&&!/\.(?:tsx|jsx|html)$/i.test(name))continue;
      try {
        if(statSync(file).size>512000)continue;
        const src=readFileSync(file,"utf8");scanned++;
        if(!candidate&&!/aria-modal|role\s*=\s*["'](?:dialog|alertdialog)["']|showModal\s*\(/.test(src))continue;
        if(candidate&&!/dialog|modal|popup|overlay|popover|confirm|quickinput|font.report/i.test(src))continue;
        rows.push({id:product+":source:"+name,title:item.name.replace(/\.[^.]+$/,""),source:name,product,mode:"source"});
      }catch(e){errors.push(name+": "+e.code);}
    }
  }
  for(const [dir,rel] of folders){const abs=path.join(root,dir);if(existsSync(abs))walk(abs,rel);else errors.push(rel+": 未找到镜像");}
  return {rows,scanned,errors};
}
// The HyMd component lab runs on its own loopback origin (1461), isolated
// from product localStorage and real Tauri. Proxy only GETs to the existing
// marked 1460 development service. No file writes or native IPC.
let labServer=null;
const ORIGIN="http://127.0.0.1:1460";
async function modulePaths(){
  const res=await fetch(ORIGIN+"/src/main.tsx",{headers:{accept:"application/javascript"},signal:AbortSignal.timeout(10000)});
  if(!res.ok)throw Error("无法加载 HyMd Vite 入口");
  const text=await res.text();
  const imports=Array.from(text.matchAll(/(?:from|import)\s*["']([^"']+)["']/g),m=>m[1]);
  const react=imports.find(x=>/\/react(?:\.js|\/index\.js)(?:\?|$)/.test(x));
  const dom=imports.find(x=>/\/react-dom(?:_client\.js|\/client(?:\.js)?)(?:\?|$)/.test(x));
  if(!react||!dom||!react.startsWith("/")||!dom.startsWith("/"))throw Error("当前 Vite React 模块入口无法识别");
  return {react,dom};
}
function labHtml(id,mods){
  const code = `
const info=document.getElementById("state");
try{
 const refresh=await import("/@react-refresh");
 refresh.default.injectIntoGlobalHook(window);
 window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;
 const ReactNS=await import(${JSON.stringify(mods.react)}), DOM=await import(${JSON.stringify(mods.dom)});
 const R=ReactNS.default||ReactNS, h=R.createElement;
 const createRoot=DOM.createRoot||DOM.default.createRoot;
 await import("/src/styles.css?import");
 const theme=await import("/src/editor/shared/colorTheme/store.ts");
 theme.applyPersistedColorTheme?.();
 const skin=await import("/src/state/skinStore.ts");
 skin.applyPersistedSkin?.();
 const id=${JSON.stringify(id)};
 let Component;
 if(id==="hymd-about"){
   const m=await import("/src/overlays/AboutDialog.tsx");
   function Trigger(){const a=m.useAbout();R.useEffect(()=>a.show(),[]);return h("button",{onClick:a.show},"重新打开关于");}
   Component=()=>h(m.AboutProvider,null,h(Trigger));
 }else if(id==="hymd-confirm"){
   const m=await import("/src/overlays/ConfirmSave.tsx");
   function Trigger(){const a=m.useConfirmSave();const run=()=>a.confirmClose([{path:"X:/UITool/示例.md",name:"示例.md",dirty:true},{path:"X:/UITool/设计说明.md",name:"设计说明.md",dirty:true}]).then(v=>{info.textContent="示例选择："+v;});R.useEffect(()=>{void run();},[]);return h("button",{onClick:run},"重新打开确认");}
   Component=()=>h(m.ConfirmSaveProvider,null,h(Trigger));
 }else if(id==="hymd-license"){
   const m=await import("/src/overlays/LicenseDialog.tsx");
   function Trigger(){const a=m.useLicense();R.useEffect(()=>a.show(),[]);return h("button",{onClick:()=>a.show()},"重新打开注册");}
   Component=()=>h(m.LicenseProvider,null,h(Trigger));
 }else if(id==="hymd-context"){
   const m=await import("/src/ui/ContextMenu.tsx");
   const sample=()=>({x:40,y:70,items:[{id:"copy",label:"复制",shortcut:"Ctrl+C"},{id:"sep",label:"",separator:true},{id:"more",label:"更多操作",children:[{id:"a",label:"示例子菜单"},{id:"b",label:"不可用",disabled:true,hint:"示例"}]}]});
   Component=()=>{const [menu,setMenu]=R.useState(sample);return h(R.Fragment,null,h("button",{onClick:()=>setMenu(sample())},"重新打开菜单"),h(m.ContextMenu,{menu,onClose:()=>setMenu(null)}));};
 }
 if(!Component)throw Error("没有对应的原生组件适配");
 class Boundary extends R.Component {constructor(p){super(p);this.state={error:""};}static getDerivedStateFromError(e){return {error:String(e?.message||e)};}render(){return this.state.error?h("p",{role:"alert"},"原生组件加载失败："+this.state.error):this.props.children;}}
 createRoot(document.getElementById("root")).render(h(Boundary,null,h(Component)));
 info.textContent="原生组件 · 示例数据 · 不连接真实文档";
}catch(e){info.textContent="原生组件加载失败："+String(e?.message||e);}
`;
  return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HyMd 弹窗设计</title><body><div id="state" style="padding:8px" role="status">正在加载真实组件…</div><div id="root" style="padding:12px"></div><script type="module">'+code.replaceAll("</script","<\\/script")+'</script></body></html>';
}
export async function startHymdDialogLab(){
  if(labServer?.listening)return true;
  const candidate=http.createServer(async(req,res)=>{
    if(req.socket.remoteAddress!=="127.0.0.1"||!["GET","HEAD"].includes(req.method)){res.writeHead(403);res.end();return;}
    let url;
    try{url=new URL(req.url,"http://127.0.0.1:1461");if(url.origin!=="http://127.0.0.1:1461")throw Error();}catch{res.writeHead(400);res.end();return;}
    if(url.pathname==="/"){
      const id=url.searchParams.get("dialog");
      if(!HYMD_DIALOGS.some(x=>x.id===id)){res.writeHead(404);res.end("未知弹窗");return;}
      try{const mods=await modulePaths();res.setHeader("content-type","text/html; charset=utf-8");res.setHeader("cache-control","no-store");res.end(labHtml(id,mods));}
      catch(e){res.writeHead(502,{"content-type":"text/plain; charset=utf-8"});res.end(String(e));}
      return;
    }
    const upstream=http.request({hostname:"127.0.0.1",port:1460,path:url.pathname+url.search,method:req.method,headers:{accept:req.headers.accept||"*/*"}},r=>{
      const headers={...r.headers};delete headers["set-cookie"];delete headers["connection"];delete headers["transfer-encoding"];res.writeHead(r.statusCode||502,headers);r.pipe(res);
    });
    upstream.setTimeout(20000,()=>upstream.destroy());upstream.on("error",()=>{if(!res.headersSent)res.writeHead(502);res.end();});upstream.end();
  });
  return new Promise(resolve=>{candidate.once("error",()=>resolve(false));candidate.listen(1461,"127.0.0.1",()=>{labServer=candidate;resolve(true);});});
}
