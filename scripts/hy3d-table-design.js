/* UITool TABLE design adapter. The native argument mapper is the contract.
 * Candidate only; no drawing mutation in browser preview. */
(function(global){
  "use strict";
  const root=document.documentElement;
  if(root.dataset.uitoolThemeDesign!=="1")return;
  const api=global.hy3dTableInsertDialog;
  if(!api||typeof api.argsFromForm!=="function"||typeof api.tryStart!=="function")return;
  const fallback=api.tryStart;
  const SVG="http://www.w3.org/2000/svg";
  let active=null;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
  const append=(p,...nodes)=>{p.append(...nodes);return p;};
  const btn=(label,cls)=>{const b=el("button",cls,label);b.type="button";return b;};
  const positive=v=>String(v).trim()!==""&&Number.isFinite(Number(v))&&Number(v)>0;
  const integer=v=>positive(v)&&Number.isSafeInteger(Number(v));
  const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat("zh-CN",{maximumFractionDigits:4}).format(n):"—";
  const demo={current:"Standard",tablestyles:[
    {name:"Standard",title_hidden:false,header_hidden:false},
    {name:"工程明细表（示例）",title_hidden:true,header_hidden:false},
    {name:"纯数据表（示例）",title_hidden:true,header_hidden:true}
  ]};
  function line(parent,tag,attrs,text){
    const n=document.createElementNS(SVG,tag);
    for(const [key,val] of Object.entries(attrs))n.setAttribute(key,String(val));
    if(text!=null)n.textContent=text;
    parent.append(n);return n;
  }
  function open(App){
    if(active?.open){active.focus();return true;}
    const simulation=!global.Host?.hasTauri?.();
    const drawing=App.docKey?.()??null;
    const previous=document.activeElement;
    const d=el("dialog","uit-table-dialog");d.id="uitool-table-insert";d.setAttribute("aria-labelledby","uit-table-title");
    const form=el("form","uit-table-form");form.noValidate=true;
    const header=el("header","uit-table-header");
    const title=el("h2","","插入表格");title.id="uit-table-title";
    const x=btn("×","uit-table-close");x.setAttribute("aria-label","关闭");
    append(header,title,x);
    const content=el("div","uit-table-content"), left=el("div","uit-table-fields"), right=el("section","uit-table-preview");
    const section=(name)=>{const s=el("section","uit-table-section");s.append(el("h3","",name));left.append(s);return s;};
    function field(p,label,input,hint){
      const wrap=el("div","uit-table-field"), l=el("label","",label);
      l.htmlFor=input.id;append(wrap,l,input);
      if(hint){const h=el("span","uit-table-help",hint);h.id=input.id+"-hint";input.setAttribute("aria-describedby",h.id);wrap.append(h);}
      p.append(wrap);return input;
    }
    const input=(id,type,value)=>{const n=el("input");n.id="uit-table-"+id;n.name=id;n.type=type;n.value=String(value);if(type==="number"){n.min="0";n.step="any";}return n;};
    const styleSection=section("表格样式");
    const style=el("select");style.id="uit-table-style";style.name="style";
    const currentOption=el("option","","当前样式");currentOption.value="";style.append(currentOption);
    field(styleSection,"样式",style);
    const manual=input("style-name","text","");manual.placeholder="输入已有样式名称";manual.hidden=true;
    const manualRow=field(styleSection,"样式名称",manual).parentElement;manualRow.hidden=true;
    const styleNote=el("div","uit-table-note","正在读取样式…");styleSection.append(styleNote);
    const grid=section("行列设置");
    const cols=field(grid,"列数",input("cols","number",api.DEFAULTS?.cols??5));
    cols.min="1";cols.step="1";
    const rows=field(grid,"数据行数",input("rows","number",api.DEFAULTS?.rows??1),"不含标题和表头");
    rows.min="1";rows.step="1";
    const size=section("单元格尺寸");
    const width=field(size,"列宽",input("col_width","number",api.DEFAULTS?.col_width??25),"图形单位");
    const autoWrap=el("label","uit-table-check"), auto=input("auto-height","checkbox","");auto.checked=true;
    append(autoWrap,auto,document.createTextNode("行高随表格样式"));size.append(autoWrap);
    const height=field(size,"行高",input("row_height","number",""),"图形单位");height.disabled=true;height.placeholder="自动";
    const previewHead=el("div","uit-table-preview-head");
    append(previewHead,el("h3","","表格预览"),el("span","uit-table-muted","示意"));
    const viewport=el("div","uit-table-canvas");
    const svg=document.createElementNS(SVG,"svg");svg.setAttribute("viewBox","0 0 320 242");svg.setAttribute("role","img");svg.setAttribute("aria-label","表格行列示意");viewport.append(svg);
    const summary=el("dl","uit-table-summary");
    const values={};
    for(const [key,label] of [["cols","列数"],["rows","数据行"],["total","总行数"],["width","总宽"],["height","行高"]]){
      const dd=el("dd","","—");values[key]=dd;append(summary,el("dt","",label),dd);
    }
    const previewNote=el("div","uit-table-note","仅示意行列结构；文字、颜色、线宽以所选样式及内核为准。");
    append(right,previewHead,viewport,summary,previewNote);
    append(content,left,right);
    const footer=el("footer","uit-table-footer");
    const status=el("div","uit-table-status");status.setAttribute("role","status");
    const reset=btn("恢复默认","uit-table-reset"),cancel=btn("取消",""),ok=btn(simulation?"确认参数":"指定插入点","uit-table-primary");ok.type="submit";
    append(footer,status,reset,cancel,ok);
    append(form,header,content,footer);d.append(form);document.body.append(d);
    let data=null, closed=false;
    function selection(){
      const name=style.value==="__manual"?manual.value.trim():style.value;
      return {name, row:data?.tablestyles?.find(r=>r.name===(name||data.current))??null};
    }
    function formValues(){
      const s=selection();
      return {style:s.name,cols:cols.value,rows:rows.value,col_width:width.value,row_height:auto.checked?"":height.value};
    }
    function refresh(){
      const {row}=selection(), v=formValues();
      const manualOn=style.value==="__manual";manual.hidden=!manualOn;manualRow.hidden=!manualOn;
      height.disabled=auto.checked;
      const errors=[];
      const checks=[[cols,integer(v.cols),"列数须为正整数"],[rows,integer(v.rows),"数据行数须为正整数"],[width,positive(v.col_width),"列宽须大于 0"],[height,auto.checked||positive(v.row_height),"行高须大于 0"],[manual,!manualOn||!!v.style,"请输入样式名称"]];
      for(const [control,valid,msg] of checks){control.setAttribute("aria-invalid",String(!valid));if(!valid)errors.push(msg);}
      const totalWidth=Number(v.cols)*Number(v.col_width);
      if(!Number.isFinite(totalWidth))errors.push("总宽超出数值范围");
      ok.disabled=errors.length>0;
      status.textContent=errors[0]||(simulation?"示例预览 · 不修改图纸":"确认后在绘图区指定插入点");
      const c=integer(v.cols)?Number(v.cols):0,r=integer(v.rows)?Number(v.rows):0;
      const titleOn=row? !row.title_hidden:true, headOn=row?!row.header_hidden:true;
      const extra=Number(titleOn)+Number(headOn);
      values.cols.textContent=c?fmt(c):"—";values.rows.textContent=r?fmt(r):"—";
      values.total.textContent=row&&r?fmt(r+extra):"—";
      values.width.textContent=c&&positive(v.col_width)?fmt(totalWidth):"—";
      values.height.textContent=auto.checked?"随样式":positive(v.row_height)?fmt(Number(v.row_height)):"—";
      svg.replaceChildren();
      if(!c||!r||!positive(v.col_width)){line(svg,"text",{x:160,y:120,"text-anchor":"middle",fill:"currentColor"},"请输入有效参数");return;}
      const cc=Math.min(c,12),rr=Math.min(r,7),n=rr+extra;
      // Deliberately bound SVG work irrespective of requested CAD table size.
      // Use explicit row height / column width only for relative aspect ratio.
      const ratio=auto.checked?0.32:Math.max(.06,Math.min(3,Number(v.row_height)/Number(v.col_width)));
      const w=Math.min(288,Math.max(92,202*cc/(n*ratio))),h=Math.min(202,Math.max(46,w*n*ratio/cc));
      const xx=(320-w)/2,yy=(218-h)/2, rh=h/n,cw=w/cc;
      let kinds=[...(titleOn?["title"]:[]),...(headOn?["header"]:[]),...Array(rr).fill("data")];
      if(row?.flow_up)kinds=kinds.reverse();
      const group=line(svg,"g",{stroke:"var(--uit-table-grid)", "stroke-width":.9,fill:"none"});
      for(let i=0;i<kinds.length;i++){
        const kind=kinds[i],y=yy+i*rh;
        line(group,"rect",{x:xx,y,width:w,height:rh,fill:kind==="data"?"var(--uit-table-paper)":kind==="title"?"var(--uit-table-title-fill)":"var(--uit-table-head-fill)"});
        if(kind!=="title")for(let j=1;j<cc;j++)line(group,"path",{d:"M"+(xx+j*cw)+" "+y+"v"+rh});
        if(rh>=10){
          const attrs={y:y+rh/2+3,fill:"var(--uit-table-preview-ink)","text-anchor":"middle","font-size":Math.min(10,rh*.65),stroke:"none"};
          if(kind==="title")line(group,"text",{...attrs,x:xx+w/2},"标题");
          if(kind==="header")for(let j=0;j<cc;j++)line(group,"text",{...attrs,x:xx+(j+.5)*cw},"列"+(j+1));
          if(kind==="data"&&rr<=4&&cw>=26)for(let j=0;j<cc;j++)line(group,"text",{...attrs,x:xx+(j+.5)*cw},"—");
        }
      }
      line(svg,"text",{x:160,y:235,"text-anchor":"middle",fill:"currentColor","font-size":10},(c>cc||r>rr?"截取示意 · ":"")+(row?"按样式行结构":"标题 / 表头仅示意"));
    }
    function loadStyles(q){
      if(closed)return;
      data=q&&Array.isArray(q.tablestyles)?q:null;
      const old=style.value;style.replaceChildren();
      function option(value,label){const o=el("option","",label);o.value=value;style.append(o);}
      option("",data?.current?"当前样式 · "+data.current:"当前样式");
      for(const row of data?.tablestyles??[])if(row?.name&&row.name!==data.current&&row.name!=="__manual")option(row.name,row.name);
      option("__manual","输入已有样式名称…");
      if(Array.from(style.options).some(o=>o.value===old))style.value=old;
      styleNote.textContent=simulation?"示例样式，仅用于审核":data?"标题、表头、文字及边框沿用样式":"未读取样式列表；仍可输入已知样式名";
      refresh();
    }
    function finish(){
      if(closed)return;closed=true;active=null;
      if(d.open)d.close();
      global.Overlay?.close(d);d.remove();
      if(previous?.isConnected)previous.focus({preventScroll:true});
    }
    x.addEventListener("click",finish);cancel.addEventListener("click",finish);
    d.addEventListener("cancel",e=>{e.preventDefault();finish();});
    d.addEventListener("close",finish);
    form.addEventListener("input",refresh);form.addEventListener("change",refresh);
    style.addEventListener("change",()=>{if(style.value==="__manual")manual.focus();});
    reset.addEventListener("click",()=>{style.value="";manual.value="";cols.value=String(api.DEFAULTS?.cols??5);rows.value=String(api.DEFAULTS?.rows??1);width.value=String(api.DEFAULTS?.col_width??25);auto.checked=true;height.value="";refresh();});
    form.addEventListener("submit",e=>{
      e.preventDefault();refresh();if(ok.disabled)return;
      const args=api.argsFromForm(formValues());
      if(!simulation&&App.docKey?.()!==drawing){status.textContent="活动图纸已变化，请重开表格窗口";return;}
      finish();
      if(simulation){App.log?.("UITool TABLE 参数（示例，不插入图纸）："+JSON.stringify(args));App.setStatus?.("示例参数已确认："+args.cols+" 列 / "+args.rows+" 数据行");}
      else App.runDraw("cad.table",args);
    });
    // Keep modal keyboard events from leaking into the CAD command router.
    d.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();finish();}e.stopPropagation();});
    active=d;
    d.showModal();global.Overlay?.open(d);
    refresh();cols.focus({preventScroll:true});
    if(simulation)loadStyles(demo);
    else Promise.resolve().then(()=>App.query("tablestyles")).then(loadStyles,()=>loadStyles(null));
    return true;
  }
  api.tryStart=function(App){
    if(!App||!global.Host||typeof App.runDraw!=="function"||typeof HTMLDialogElement==="undefined"||!HTMLDialogElement.prototype.showModal)return fallback.call(api,App);
    try{return open(App);}
    catch(e){if(active){global.Overlay?.close(active);active.remove();active=null;}App.log?.("表格设计窗口不可用："+String(e?.message||e));return fallback.call(api,App);}
  };
})(window);
