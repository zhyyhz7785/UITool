import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@tpl/workbench/ui";
import { Section } from "../controls";
import { copyText } from "../platform";

type Product = "hy3d" | "hymd";
type Entry = { id: string; title: string; product: Product; source: string; mode: "native" | "prototype" | "source" };
type Catalog = { rows: Entry[]; scanned: number; errors: string[] };
const names: Record<Product,string> = {hy3d:"HY3D",hymd:"HyMdTauri"};
const advancedText: Entry = {id:"hy3d-mtext-advanced",title:"高级文字编辑器 / HyMdTauri 原生",product:"hy3d",source:"HyMdTauri2/src/editor/hymd/HymdEditor.tsx",mode:"native"};
const font: Entry = {id:"hy3d-font-v2",title:"字体替换 / V2 设计候选",product:"hy3d",source:"public/hy3d-font-manager/index.html",mode:"prototype"};
const printCandidate = (product:Product):Entry => ({id:product+"-print-workbench",title:"统一打印工作台 / 设计候选",product,source:"public/unified-print-workbench/index.html",mode:"prototype"});
const fallback: Record<Product,Entry[]> = {
  hy3d:[printCandidate("hy3d"),advancedText,font,{id:"hy3d-font-report",title:"字体替换 / 原生字体报告",product:"hy3d",source:"ui/font_report.js",mode:"native"}],
  hymd:[
    printCandidate("hymd"),
    {id:"hymd-about",title:"关于",product:"hymd",source:"src/overlays/AboutDialog.tsx",mode:"native"},
    {id:"hymd-confirm",title:"未保存文档确认",product:"hymd",source:"src/overlays/ConfirmSave.tsx",mode:"native"},
    {id:"hymd-license",title:"注册 / 授权",product:"hymd",source:"src/overlays/LicenseDialog.tsx",mode:"native"},
    {id:"hymd-context",title:"右键菜单 / 子菜单",product:"hymd",source:"src/ui/ContextMenu.tsx",mode:"native"}
  ]
};
let selected: Entry|null=null;
const listeners=new Set<()=>void>();
export function openDialogDesign(entry: Entry|null){selected=entry;listeners.forEach(fn=>fn());}
export function useDialogDesign(){return useSyncExternalStore(fn=>{listeners.add(fn);return ()=>{listeners.delete(fn);};},()=>selected);}
export function openFontDesign(){openDialogDesign(font);}

export function DialogDesignSection(){
  const active=useDialogDesign();
  const [product,setProduct]=useState<Product|"all">("all");
  const [query,setQuery]=useState("");
  const [catalog,setCatalog]=useState<Partial<Record<Product,Catalog>>>({});
  const [error,setError]=useState("");
  const [revision,setRevision]=useState(0);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let cancelled=false;
    setLoading(true);setError("");
    void Promise.allSettled((["hy3d","hymd"] as Product[]).map(async p=>{
      const r=await fetch("/__uitool/preview/dialogs?product="+p);
      if(!r.ok)throw Error(names[p]+" 目录读取失败");
      const c=await r.json() as Catalog;
      if(!Array.isArray(c.rows))throw Error(names[p]+" 目录格式不兼容");
      return {p,c};
    })).then(results=>{
      if(cancelled)return;
      const next:Partial<Record<Product,Catalog>>={};
      const errors:string[]=[];
      for(const result of results){
        if(result.status==="fulfilled")next[result.value.p]=result.value.c;
        else errors.push(String(result.reason));
      }
      setCatalog(next);setError(errors.join("；"));setLoading(false);
    });
    return ()=>{cancelled=true;};
  },[revision]);
  const q=query.trim().toLowerCase();
  const modeLabel=(e:Entry)=>e.id==="hy3d-dynamic-prompt"?"同源预览":e.mode==="native"?"原生":e.mode==="prototype"?"候选":"待适配";
  return <Section title="弹窗设计" actions={<Button onClick={()=>setRevision(n=>n+1)}>刷新</Button>}>
    <div className="ut-dialog-design-tools">
      <select className="wb-select" aria-label="弹窗产品" value={product} onChange={e=>setProduct(e.target.value as Product|"all")}>
        <option value="all">全部产品</option><option value="hy3d">HY3D</option><option value="hymd">HyMdTauri</option>
      </select>
      <input className="wb-input ut-grow" aria-label="搜索弹窗" placeholder="搜索弹窗 / 源码" value={query} onChange={e=>setQuery(e.target.value)}/>
    </div>
    {loading&&<div className="ut-note">正在读取产品界面目录…</div>}
    {error&&<div className="ut-note" role="alert">{error}；仍可打开已知入口。</div>}
    {(["hy3d","hymd"] as Product[]).filter(p=>product==="all"||product===p).map(p=>{
      const c=catalog[p], rows=c?.rows??fallback[p];
      const filtered=rows.filter(e=>!q||(e.title+" "+e.source).toLowerCase().includes(q));
      const ready=filtered.filter(e=>e.mode!=="source"), pending=filtered.filter(e=>e.mode==="source");
      const row=(e:Entry)=><button key={e.id} type="button" className={"ut-dialog-row"+(active?.id===e.id?" on":"")} title={e.source} onClick={()=>openDialogDesign(e)}>
        <span className="ut-grow">{e.title}</span><span className="ut-dialog-kind">{modeLabel(e)}</span>
      </button>;
      return <div key={p} className="ut-dialog-product">
        <div className="ut-dialog-product-head">{names[p]} <span className="ut-dim">{ready.length} 入口 · {pending.length} 待适配</span></div>
        {ready.map(row)}
        {pending.length>0&&<details open={q?true:undefined}><summary>源码候选（{pending.length}）</summary>{pending.map(row)}</details>}
        {filtered.length===0&&<div className="ut-note">无匹配弹窗</div>}
        {c?.errors.length? <div className="ut-note" title={c.errors.join("\n")}>部分目录未读取，点击刷新重试。</div>:null}
      </div>;
    })}
  </Section>;
}

export function ProductDialogDesign({entry}:{entry:Entry}){
  const [reload,setReload]=useState(0);
  const [src,setSrc]=useState("");
  const [status,setStatus]=useState("");
  const [error,setError]=useState("");
  const frame=useRef<HTMLIFrameElement>(null);
  const p=entry.product;
  useEffect(()=>{
    let cancelled=false;
    setSrc("");setStatus("");setError("");
    if(entry.mode==="source")return;
    if(entry.mode==="prototype"){
      const route=entry.id===p+"-print-workbench"?"unified-print-workbench/index.html?product="+p:"hy3d-font-manager/index.html";
      setSrc(import.meta.env.BASE_URL+route);setStatus("独立交互候选 · 示例数据");return;
    }
    const start=async()=>{
      try{
        setStatus("正在启动独立预览…");
        const provider=entry.id===advancedText.id?"hymd":p;
        const route=provider==="hy3d"?"start":"dialog-lab";
        const r=await fetch("/__uitool/preview/"+route+"?product="+provider,{method:"POST"});
        const result=await r.json() as {up?:boolean;preview?:boolean;error?:string};
        if(!r.ok||!result.up||(provider==="hy3d"&&!result.preview))throw Error(result.error||"未能连接 UITool 专用前端，请同步产品工作树");
        if(cancelled)return;
        if(entry.id==="hy3d-dynamic-prompt"){
          setSrc("http://127.0.0.1:1450/prompt_preview.html?uitool=1");
          setStatus("HY3D 产品设计令牌 · 浏览器示例，不是 Windows 原生渲染");return;
        }
        if(entry.id===advancedText.id){
          setSrc("http://127.0.0.1:1461/?dialog="+encodeURIComponent(entry.id));
          setStatus("HyMdTauri 原生编辑器 · 等待组件装载");return;
        }
        setSrc(p==="hy3d"?"http://127.0.0.1:1450/index.html?uitool=1&style=layer&explorer=sample&dialog="+encodeURIComponent(entry.id):"http://127.0.0.1:1461/?dialog="+encodeURIComponent(entry.id));
        setStatus(p==="hy3d"?"等待原生弹窗…":"原生组件实验页 · 示例数据");
      }catch(e){if(!cancelled){setStatus("");setError(String(e instanceof Error?e.message:e));}}
    };
    void start();
    return ()=>{cancelled=true;};
  },[entry.id,entry.mode,p,reload]);
  useEffect(()=>{
    const receive=(event:MessageEvent)=>{
      if(event.source===frame.current?.contentWindow&&entry.id===p+"-print-workbench"&&entry.mode==="prototype"&&event.origin==="null"&&event.data?.source==="uitool-print-candidate"&&event.data?.action==="close"){openDialogDesign(null);return;}
      const origin=entry.id===advancedText.id?"http://127.0.0.1:1461":"http://127.0.0.1:1450";
      if(p!=="hy3d"||event.origin!==origin||event.source!==frame.current?.contentWindow)return;
      const d=event.data;
      if(d?.source!=="uitool-dialog"||d.id!==entry.id)return;
      if(d.status==="error")setError(String(d.message||"弹窗未打开"));
      else {setError("");setStatus(String(d.message||""));}
    };
    window.addEventListener("message",receive);return ()=>window.removeEventListener("message",receive);
  },[entry.id,entry.mode,p]);
  return <div className="ut-preview">
    <div className="ut-preview-bar ut-dialog-design-bar">
      <Button onClick={()=>openDialogDesign(null)}>返回产品</Button>
      <span className="ut-grow" title={entry.title}>{names[p]} · {entry.title}</span>
      <Button onClick={()=>void copyText(entry.source)}>复制源码路径</Button>
      {entry.mode!=="source"&&<Button onClick={()=>setReload(n=>n+1)}>重开</Button>}
    </div>
    <div className="ut-dialog-design-info"><span title={entry.source}>{entry.source}</span><span>{error||status}</span></div>
    <div className="ut-stage ut-product-stage">
      {entry.mode==="source"?<div className="ut-product-off"><strong>此组件尚未接入独立预览</strong><span>{entry.source}</span><span>源码已发现，需确认组件参数、宿主及示例数据后再接入；不使用伪造界面。</span></div>:
       src?<iframe key={entry.id+":"+reload} ref={frame} className="ut-product-frame" title={entry.title} src={src} sandbox={entry.mode==="prototype"?"allow-scripts":"allow-scripts allow-same-origin"}/>:
       <div className="ut-product-off">{error||status||"等待预览…"}</div>}
    </div>
  </div>;
}
