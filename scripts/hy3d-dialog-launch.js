/* UITool-only native dialog launcher. No real Tauri, no user files. */
(function(){
  "use strict";
  const q=new URLSearchParams(location.search),id=q.get("dialog");
  if(location.hostname!=="127.0.0.1"||location.port!=="1450"||q.get("uitool")!=="1"||!id||!window.Host||Host.hasTauri())return;
  const commands={
    "hy3d-options":"app.options","hy3d-textstyle":"cad.textstyle",
    "hy3d-dimstyle":"cad.dimstyle","hy3d-table":"cad.table",
    "hy3d-tablestyle":"cad.tablestyle","hy3d-hatch":"cad.hatch",
    "hy3d-mlstyle":"cad.mlstyle","hy3d-block":"cad.blockdef",
    "hy3d-layer":"cad.layer","hy3d-about":"ui.about",
    "hy3d-plot":"file.plot","hy3d-pagesetup":"file.pagesetup"
  };
  const origin=location.origin;
  function report(status,message){
    // Parent checks frame source and origin; no commands are received from it.
    if(parent!==window)parent.postMessage({source:"uitool-dialog",id,status,message},"*");
  }
  if(id==="hy3d-font-report"){
    const docId="uitool-font-demo";
    const identity={path:"X:/UITool/fonts/simplex.shx"};
    const recommended={name:"simplex.shx",identity,coverage:0.98,widthError:0.03,metricGrade:"estimated",approximate:true,
      preview:[[[0,0],[4,12],[8,0]],[[2,5],[6,5]],[[11,0],[11,12],[16,12],[19,9],[16,6],[11,6]]]};
    let outline=false;
    let fonts=[
      {key:"demo-shx",name:"hztxt.shx",kind:"eng",issue:"missing",affected:128,missingCount:16,usedMissingCount:16,state:"unresolved",recommendation:recommended},
      {key:"demo-big",name:"hzfs.shx",kind:"big",issue:"partial",affected:42,missingCount:8,usedMissingCount:8,state:"unresolved",recommendation:{...recommended,name:"gbcbig.shx",coverage:0.93}},
      {key:"demo-ttf",name:"工程字体.ttf",kind:"ttf",issue:"missing",affected:15,missingCount:5,usedMissingCount:5,state:"unresolved",recommendation:{...recommended,name:"示例替代字体",coverage:1}}
    ];
    // The browser fixture is installed only on the dedicated local preview origin,
    // before font_report.js registers listeners. No real Tauri bridge or disk access.
    if(!window.__hy3dFontOwned){report("error","当前镜像没有独立字体窗口");return;}
    const listeners=new Map();
    const settings={promptPolicy:"firstMissing",fontAlt:"",budgets:{bodyMib:0,glyphMib:0,layoutMib:0},files:[],directories:[],global:{}};
    const dto=()=>({docId,status:"ready",outline,fonts:JSON.parse(JSON.stringify(fonts)),restored:[],settings:JSON.parse(JSON.stringify(settings))});
    Host.hasTauri=()=>true;
    Host.on=async(name,cb)=>{listeners.set(name,cb);return ()=>listeners.delete(name);};
    Host.emit=async()=>null;
    Host.fontWindowReady=async()=>{
      listeners.get("font-window-open")?.({seq:1,tab:{id:docId,name:"UITool 示例图纸（模拟字体数据）",path:"X:/UITool/demo.dwg"}});
      report("opened","原生独立字体窗口 · 模拟字体检测与授权，不读写真实字体");
    };
    Host.fontWindowDone=async()=>{report("pending","已关闭原生字体窗口，可点击重开");};
    Host.fontReport=async(_doc,_force,manage)=>{
      if(manage?.action==="setPromptPolicy")settings.promptPolicy=manage.policy;
      if(manage?.action==="setCacheBudgets")settings.budgets={...manage.budgets};
      if(manage?.action==="removeSource"){
        const key=manage.kind==="directory"?"directories":"files";
        settings[key]=settings[key].filter(p=>p!==manage.path);
      }
      if(manage?.action==="revokeGlobal"){
        delete settings.global[manage.key];
        for(const row of fonts){if(row.key===manage.key&&row.scope==="global"){delete row.scope;delete row.used;row.state="unresolved";}}
      }
      return dto();
    };
    Host.fontSetOutline=async v=>{outline=!!v;};
    Host.fontPreviewReplacement=async()=>({...recommended,name:"自选示例字体"});
    Host.fontChooseSource=async(_doc,kind)=>{const key=kind==="directory"?"directories":"files";const value=kind==="directory"?"X:/UITool/fonts":"X:/UITool/fonts/example.shx";if(!settings[key].includes(value))settings[key].push(value);return true;};
    Host.fontSetMappings=async(_doc,changes,scope)=>{
      for(const change of changes){
        const row=fonts.find(f=>f.key===change.key);if(!row)continue;
        if(change.action==="revoke"){delete settings.global[row.key];delete row.scope;delete row.used;row.state="unresolved";}
        else{row.scope=scope;row.used=change.identity?.path?.split("/").pop()||row.recommendation.name;row.state="approximate";if(scope==="global")settings.global[row.key]={requested:row.name,replacement:change.identity||row.recommendation.identity};}
      }
      return dto();
    };
    return;
  }
  const command=commands[id];
  if(!command){report("error","未配置弹窗入口");return;}
  const visible=()=>Array.from(document.querySelectorAll('dialog,[role="dialog"],[aria-modal="true"],#bw-root,#settings-editor')).some(n=>!n.hidden&&n.getClientRects().length>0&&getComputedStyle(n).visibility!=="hidden");
  let tries=0;
  function tick(){
    if(window.hy3dApp&&window.Registry?.isDone?.(command)){
      try{
        if(id==="hy3d-table" && document.documentElement.dataset.uitoolThemeDesign==="1"){
          if(!window.hy3dTableInsertDialog?.tryStart(window.hy3dApp)){report("error","表格设计入口不可用");return;}
          if(document.getElementById("uitool-table-insert")?.open){report("opened","表格设计候选 · 示例样式 · 不写入图纸");return;}
          report("pending","表格设计未打开，已回退原生入口");return;
        }
        if(Registry.run(command)===false){report("error","原生命令未能启动");return;}
        let checks=0;
        function check(){
          if(visible()){report("opened","已打开原生组件（浏览器预览）");return;}
          if(++checks<25)setTimeout(check,160);
          else report("pending","已调用原生命令，但未检测到弹窗；可能需要图纸、对象或宿主");
        }
        check();
      }catch(e){report("error",String(e?.message||e));}
    }else if(++tries<100)setTimeout(tick,100);
    else report("error","当前产品镜像没有可用的命令入口："+command);
  }
  tick();
})();
