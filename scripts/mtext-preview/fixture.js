/* UITool only: local sample, no native IPC or real document. */
(function(){
  "use strict";
  var id="hy3d-mtext-advanced", handlers=new Map(), seq=0, active=0, completed=false;
  var paragraphs=["给排水设计总说明","一、设计依据","建筑给水排水设计标准 GB 50015-2019","消防设施通用规范 GB 55036-2022","二、工程概况","本工程设计内容包括给水、排水及消防系统。","三、给水设计","给水由市政管网直接供给，工作压力为 0.20 MPa。"];
  function report(status,message){if(parent!==window)parent.postMessage({source:"uitool-dialog",id:id,status:status,message:message},"*");}
  function showResult(action,result){
    completed=true;
    var box=document.getElementById("uitool-md-result");
    if(!box){
      box=document.createElement("section");box.id="uitool-md-result";box.setAttribute("role","status");
      box.style.cssText="position:fixed;inset:36px 0 0;background:var(--bg-raised);color:var(--text);padding:24px;overflow:auto;font:var(--fs-ui)/1.6 var(--font-ui);z-index:9999";
      document.body.appendChild(box);
    }
    box.replaceChildren();
    var title=document.createElement("h3");title.textContent=result&&result.refused?"编辑器打开失败":action==="save"?"示例会话已完成":"示例会话已取消";box.appendChild(title);
    var detail=document.createElement("p");detail.textContent=result&&result.refused?(result.message||"无法加载"): "仅模拟保存/关闭，未修改任何图纸。";box.appendChild(detail);
    if(result&&!result.refused){
      var pre=document.createElement("pre");pre.style.whiteSpace="pre-wrap";pre.textContent=JSON.stringify(result,null,2);box.appendChild(pre);
    }
    var button=document.createElement("button");button.textContent="重新打开示例";button.addEventListener("click",function(){box.remove();open();});box.appendChild(button);
    report(result&&result.refused?"error":"opened",detail.textContent);
  }
  window.Host={
    on:function(name,fn){handlers.set(name,fn);return Promise.resolve(function(){handlers.delete(name);});},
    emit:function(name,payload){if(name==="text-window-ready"&&payload.seq===active){report("opened","HY3D #2237 实际源码 · HyMd SDK · 示例图纸（不写盘）");}return Promise.resolve();},
    textWindowDone:function(id,action,result){if(id===active&&!completed)showResult(action,result);return Promise.resolve();}
  };
  function open(){
    var cb=handlers.get("text-window-open");if(!cb){report("error","未绑定文字窗口事件");return;}
    completed=false;active=++seq;
    var content=paragraphs.join("\\P");
    cb({seq:active,spec:{editorMode:"markdown",kind:"mtext",documentId:"uitool-sample",revision:"demo-1",original:content,plain:paragraphs.join("\n"),px:2,view:"flow",geom:{type:"mtext",content:content,width:360,defined_height:180,height:3.5,column_type:0,column_count:0,column_width:0,column_gutter:0,column_height:0,column_auto:0,column_heights:[],style:"STANDARD"}}});
    report("pending","正在装载 HY3D 实际文字编辑窗口…");
  }
  window.addEventListener("DOMContentLoaded",open,{once:true});
  window.addEventListener("error",function(ev){if(!completed)report("error",String(ev.message||"编辑器资源加载失败"));});
})();
