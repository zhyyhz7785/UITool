/* UITool shell only. All document editing and page layout belong to HyMdTauri. */
export async function createMtextLab(R, info) {
  const h=R.createElement, id="hy3d-mtext-advanced";
  const report=(status,message)=>{
    info.textContent=message;
    if(parent!==window)parent.postMessage({source:"uitool-dialog",id,status,message},"*");
  };
  report("pending","正在加载 HyMdTauri 原生编辑器与排版组件…");
  const [runtime,docs,editor,layout,registry,tabs,theme,crumb,core,panel,wheel]=await Promise.all([
    import("/src/app/AppRuntimeProvider.tsx"),
    import("/src/state/docStore.tsx"),
    import("/src/editor/hymd/HymdEditor.tsx"),
    import("/src/editor/layoutPreview/LayoutPreviewPane.tsx"),
    import("/src/editor/shared/editorRegistry.ts"),
    import("/src/core/tabs/viewTab.ts"),
    import("/src/editor/shared/theme/themeStore.ts"),
    import("/src/editor/shared/doc-viewer/docChromeCrumb.tsx"),
    import("/packages/hymd-webview-core/src/index.ts"),
    import("/src/editor/shared/panelStore.ts"),
    import("/src/editor/paper/numberWheel.ts")
  ]);
  theme.applyPersistedTheme();
  core.setPanelStorage(panel.panelStore);
  core.installScrollbarHover();
  wheel.installNumberWheel(document);
  const css=document.createElement("style");
  css.textContent="#state{display:none!important}html,body,#root{width:100%;height:100%;padding:0!important;margin:0!important;overflow:hidden}#root>.ut-md-native{height:100%;display:flex;flex-direction:column;background:var(--vscode-editor-background);color:var(--vscode-editor-foreground)}.ut-md-native-head{display:flex;align-items:center;gap:6px;min-height:32px;padding:3px 8px;border-bottom:1px solid var(--vscode-panel-border);flex:none}.ut-md-native-head>strong{flex:1;min-width:0;font-size:12px}.ut-md-native-head button{white-space:nowrap}.ut-md-native-body{flex:1;min-height:0;min-width:0;display:flex;position:relative;overflow:hidden}.ut-md-native-page{flex:1;min-width:0;min-height:0;height:100%;display:flex;flex-direction:column;overflow:hidden}.ut-md-native-page[hidden]{display:none!important}.ut-md-native-page>.hymd-editor-wrap,.ut-md-native-page>.view-adjust-wrap{flex:1;min-height:0;min-width:0;height:100%}.ut-md-native-message{padding:10px;font-size:12px}";
  document.head.appendChild(css);
  const NAME="UITool · 给排水设计说明.hy.md";
  const SAMPLE=[
    "# 给排水设计总说明",
    "## 一、设计依据",
    "1. 《建筑给水排水设计标准》GB 50015-2019",
    "2. 《消防设施通用规范》GB 55036-2022",
    "3. 《建筑防火通用规范》GB 55037-2022",
    "## 二、工程概况",
    "本工程为工业厂房，设计内容包括生活给水、排水与消防系统。给水由市政管网直接供给。",
    "## 三、给水设计",
    "设计工作压力为 0.20 MPa，室内管道按功能分区布置。",
    ["| 项目 | 单位 | 参数 |","| --- | --- | --- |","| 给水压力 | MPa | 0.20 |","| 管径 | mm | 100 |"].join("\n"),
    "## 四、排水设计",
    "生活污水与雨水分流，管道坡度按计算确定。"
  ].join("\n\n");
  function Workbench(){
    const a=docs.useDocs();
    const [mode,setMode]=R.useState("body"), [ready,setReady]=R.useState(false),[message,setMessage]=R.useState("");
    const seeded=R.useRef(false);
    const doc=a.docs.find(d=>d.name===NAME&&d.path.startsWith("untitled:"));
    const group=a.focusedGroupId;
    const instance="uitool-mtext-native";
    R.useEffect(()=>{
      if(seeded.current)return;
      seeded.current=true;
      a.openMarkdownDraft(NAME,SAMPLE);
    },[a.openMarkdownDraft]);
    const preview=mode==="paper";
    const view=doc?tabs.viewPathFor("paper",doc.path):null;
    function change(next){
      if(!doc||!ready||next===mode)return;
      if(next==="paper"){
        const handle=registry.getHymdEditorForPath(doc.path);
        if(handle?.isComposing?.()){setMessage("请先完成当前输入法组合，再进入排版。");return;}
        handle?.flushPending?.();
      }
      setMessage("");setMode(next);
    }
    const header=h("header",{className:"ut-md-native-head"},
      h("strong",null,"高级文字 · HyMdTauri"),
      h("button",{type:"button",className:"hy-btn"+(!preview?" on":""),"aria-pressed":!preview,onClick:()=>change("body")},"正文"),
      h("button",{type:"button",className:"hy-btn"+(preview?" on":""),"aria-pressed":preview,disabled:!ready,onClick:()=>change("paper")},"排版"));
    if(!doc)return h("div",{className:"ut-md-native"},header,h("p",{className:"ut-md-native-message"},"正在创建内存示例文档…"));
    return h("div",{className:"ut-md-native"},header,message&&h("div",{role:"status",className:"ut-md-native-message"},message),
      h("div",{className:"ut-md-native-body"},
        h("div",{className:"ut-md-native-page editor-content editor-content-hymd",hidden:preview},
          h(editor.HymdEditor,{key:doc.path,path:doc.path,groupId:group,instanceId:instance,
            frontmatter:doc.frontmatter,initialBody:doc.body,body:doc.body,extVersion:doc.extVersion,
            syncVersion:doc.syncVersion,syncOrigin:doc.syncOrigin,bodyRevision:doc.bodyRevision??0,
            active:!preview,focused:!preview,
            onEditBody:(body,patch)=>a.updateBody(doc.path,body,instance,patch),
            onReady:()=>{setReady(true);registry.setFocusedEditorGroup(group);report("opened","HyMdTauri 原生组件 · 左键选区 / 右键菜单 · 内存示例");}})),
        preview?h("div",{className:"ut-md-native-page editor-content editor-content-hymd"},
          h(crumb.DocChromeCrumbProvider,{crumb:null},
            h(layout.LayoutPreviewPane,{key:view,doc,tabPath:view,groupId:group}))):null));
  }
  return ()=>h(runtime.AppRuntimeProvider,null,h(Workbench));
}
