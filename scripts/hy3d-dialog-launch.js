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
    const dto=()=>({docId,status:"ready",outline,fonts:JSON.parse(JSON.stringify(fonts)),restored:[]});
    Host.fontReport=async()=>dto();
    Host.fontSetOutline=async v=>{outline=!!v;};
    Host.fontPreviewReplacement=async()=>({...recommended,name:"自选示例字体"});
    Host.fontChooseSource=async()=>false;
    Host.fontSetMappings=async(_doc,changes,scope)=>{
      for(const change of changes){
        const row=fonts.find(f=>f.key===change.key);if(!row)continue;
        if(change.action==="revoke"){delete row.scope;delete row.used;row.state="unresolved";}
        else{row.scope=scope;row.used=change.identity?.path?.split("/").pop()||row.recommendation.name;row.state="approximate";}
      }
      return dto();
    };
    let tries=0;
    const tick=()=>{
      if(window.hy3dFontReport&&window.hy3dApp&&document.getElementById("font-report")){
        hy3dFontReport.bind(()=>{});
        hy3dFontReport.activate({id:docId,name:"UITool 示例图纸（模拟字体数据）",path:"X:/UITool/demo.dwg"},[{id:docId}]);
        hy3dFontReport.open();
        report("opened","原生字体报告 · 模拟字体检测与授权，不读写真实字体");
      }else if(++tries<100)setTimeout(tick,100);
      else report("error","当前镜像未加载原生字体报告");
    };
    tick();return;
  }
  const command=commands[id];
  if(!command){report("error","未配置弹窗入口");return;}
  const visible=()=>Array.from(document.querySelectorAll('dialog,[role="dialog"],[aria-modal="true"],#bw-root,#settings-editor')).some(n=>!n.hidden&&n.getClientRects().length>0&&getComputedStyle(n).visibility!=="hidden");
  let tries=0;
  function tick(){
    if(window.hy3dApp&&window.Registry?.isDone?.(command)){
      try{
        if(!Registry.run(command)){report("error","原生命令未能启动");return;}
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
