import { CMD } from "@tpl/views/photoSession";
import { baseLayout, cmd, dialog, editor, look, menu, okCancel, viewMenu, zones, type WorkTypeDef } from "../kit";

const commands = [
  cmd(CMD.open, "添加图片", "文件", "open", { keybinding: "Ctrl+O" }),
  cmd(CMD.save, "保存", "文件", "save", { keybinding: "Ctrl+S" }),
  cmd(CMD.saveCopy, "另存副本", "文件", "saveas"),
  cmd(CMD.copyClip, "复制到剪贴板", "文件", "copy"),
  cmd(CMD.batch, "批量导出到文件夹…", "文件", "export", { keybinding: "Ctrl+Shift+E" }),
  cmd(CMD.undo, "撤销", "编辑", "undo", { keybinding: "Ctrl+Z" }),
  cmd(CMD.redo, "重做", "编辑", "redo", { keybinding: "Ctrl+Y" }),
  cmd(CMD.selectAll, "全选 / 取消全选", "队列", "list", { keybinding: "Ctrl+Shift+A" }),
  cmd(CMD.applySel, "应用到选中", "队列", "sync", { keybinding: "Ctrl+Shift+S" }),
  cmd(CMD.applyAll, "应用到全部", "队列", "sync", { keybinding: "Ctrl+Shift+L" }),
  cmd(CMD.copyParams, "复制参数", "队列", "copy", { keybinding: "Ctrl+Shift+C" }),
  cmd(CMD.pasteParams, "粘贴参数", "队列", "paste", { keybinding: "Ctrl+Shift+V" }),
  cmd(CMD.params, "参数范围与预设", "队列", "adjust", { keybinding: "Ctrl+Shift+P" }),
  cmd(CMD.replaceMd, "替换文稿中的图片引用", "队列", "mtext"),
  cmd(CMD.clearOthers, "清空队列中其他图片", "队列", "delete"),
  cmd(CMD.toggleQueue, "收起 / 展开队列", "队列", "sideleft", { keybinding: "Ctrl+B" }),
  cmd(CMD.modeCrop, "裁剪", "图像", "crop"),
  cmd(CMD.modeAdjust, "调整", "图像", "contrast"),
  cmd(CMD.modeFilter, "滤镜", "图像", "filter"),
  cmd(CMD.modeMarkup, "标记", "图像", "brush"),
  cmd(CMD.modeErase, "擦除", "图像", "eraser"),
  cmd(CMD.modeBg, "背景", "图像", "image"),
  cmd(CMD.modeScan, "扫描件", "图像", "search"),
  cmd(CMD.modeExport, "导出", "图像", "export"),
  cmd(CMD.rotL, "向左旋转 90°", "裁剪", "rotate"),
  cmd(CMD.rotR, "向右旋转 90°", "裁剪", "rotate"),
  cmd(CMD.flipH, "水平翻转", "裁剪", "rotate"),
  cmd(CMD.flipV, "垂直翻转", "裁剪", "rotate"),
  cmd(CMD.swap, "横竖互换", "裁剪", "sync"),
  cmd(CMD.cropDone, "完成裁剪", "裁剪", "save"),
  cmd(CMD.cropCancel, "取消裁剪", "裁剪", "close"),
  cmd(CMD.help, "快捷键", "帮助", "help")
];

const menus = [
  menu("file", "文件", [CMD.open, CMD.save, CMD.saveCopy, CMD.copyClip, "sep", CMD.batch]),
  menu("edit", "编辑", [CMD.undo, CMD.redo]),
  menu("image", "图像", [CMD.modeCrop, CMD.modeAdjust, CMD.modeFilter, CMD.modeMarkup, CMD.modeErase, CMD.modeBg, CMD.modeScan, CMD.modeExport]),
  menu("queue", "队列", [CMD.selectAll, CMD.applySel, CMD.applyAll, CMD.copyParams, CMD.pasteParams, CMD.params, CMD.replaceMd, CMD.clearOthers, CMD.toggleQueue]),
  menu("crop", "裁剪", [CMD.rotL, CMD.rotR, CMD.flipH, CMD.flipV, CMD.swap, "sep", CMD.cropDone, CMD.cropCancel]),
  menu("help", "帮助", [CMD.help]),
  viewMenu
];

const part = (id: string, label: string, value: boolean) => ({ id, label, type: "toggle" as const, group: "范围", value });

const dialogs = [
  dialog({
    id: "batch",
    title: "批量导出到文件夹",
    command: CMD.batch,
    source: "原型 v6 批量导出",
    body: "格式、画质、尺寸、水印和压缩沿用右侧「导出」里的设置。",
    groups: ["位置", "命名", "覆盖"],
    fields: [
      { id: "dir", label: "文件夹", type: "text", group: "位置", value: "D:\\HyMd\\导出" },
      {
        id: "naming",
        label: "命名规则",
        type: "select",
        group: "命名",
        value: "suffix",
        options: [
          { value: "suffix", label: "保留原名 + 后缀" },
          { value: "seq", label: "序号" },
          { value: "date", label: "日期时间" }
        ]
      },
      { id: "suffix", label: "后缀 / 序号前缀", type: "text", group: "命名", value: "_edit" },
      { id: "overwrite", label: "覆盖原图", type: "toggle", group: "覆盖", value: false },
      { id: "backup", label: "覆盖前先备份为 .bak", type: "toggle", group: "覆盖", value: true }
    ],
    actions: okCancel("开始导出")
  }),
  dialog({
    id: "params",
    title: "参数范围与预设",
    command: CMD.params,
    source: "原型 v6 参数范围",
    body: "复制、粘贴、预设和应用只带勾选的部分。",
    groups: ["范围", "预设"],
    fields: [
      part("crop", "裁剪比例", false),
      part("color", "调色", true),
      part("detail", "细节", true),
      part("portrait", "人像", true),
      part("filter", "滤镜", true),
      part("scan", "扫描", true),
      part("marks", "标记", false),
      part("export", "导出与压缩", false),
      {
        id: "preset",
        label: "预设",
        type: "select",
        group: "预设",
        value: "scan-bw",
        options: [
          { value: "scan-bw", label: "扫描件黑白" },
          { value: "web", label: "公众号配图" }
        ]
      },
      { id: "name", label: "预设名", type: "text", group: "预设", placeholder: "如 扫描件黑白" }
    ],
    actions: okCancel("套用")
  }),
  dialog({
    id: "help",
    title: "快捷键",
    command: CMD.help,
    source: "原型 v6 快捷键",
    body: "图片编辑里的键位。",
    fields: [
      {
        id: "keys",
        label: "键位",
        type: "table",
        columns: ["快捷键", "作用"],
        rows: [
          ["Ctrl+Z / Ctrl+Y", "撤销 / 重做"],
          ["Ctrl+滚轮", "以指针为中心缩放"],
          ["按住空格拖动", "平移画布"],
          ["Ctrl+0 / Ctrl+1", "适应窗口 / 1:1"],
          ["Ctrl+S", "按导出设置保存当前图片"],
          ["Ctrl+O", "添加图片到队列"],
          ["Ctrl+B", "收起或展开队列"],
          ["Ctrl+Shift+A", "全选 / 取消全选"],
          ["Ctrl+Shift+S", "应用到选中"],
          ["Ctrl+Shift+L", "应用到全部"],
          ["Ctrl+Shift+E", "批量导出到文件夹"],
          ["Ctrl+Shift+C / V", "复制 / 粘贴参数"],
          ["Ctrl+Shift+P", "参数范围与预设"],
          ["裁剪 Enter / Esc", "完成 / 取消"],
          ["悬停 + 滚轮", "按步长改数值；Shift×10，Alt×0.1"],
          ["标记 F8", "正交，线与箭头吸附角度"],
          ["?", "打开或关闭本表"]
        ]
      }
    ],
    actions: [{ id: "ok", label: "知道了", primary: true }]
  })
];

function frame(bar: "top" | "side" | "stack") {
  const layout = baseLayout();
  layout.titleBar.right = [];
  layout.primarySideBar.visible = false;
  layout.auxiliaryBar.visible = false;
  layout.panel.visible = false;
  layout.statusBar.visible = false;
  layout.editor.tabs = true;
  layout.editor.breadcrumbs = false;
  layout.dialogStyle = "modal";
  return {
    ...look("hy-light"),
    layout,
    activity: [],
    auxiliary: [],
    panel: [],
    editors: [{ ...editor("art", "附图.png", "image", "photo"), data: { bar } }],
    statusBar: zones()
  };
}

/** HyMd 图片编辑面。信息架构照原型 v6，外观用主题变量和 28 / 24 / 22 按钮。 */
export const image: WorkTypeDef = {
  id: "image",
  name: "图像编辑",
  summary: "HyMd 图片编辑：顶栏八个模式、左队列、右参数、裁剪底栏。三套只改模式条放哪。",
  views: ["photo"],
  commands,
  menus,
  dialogs,
  schemes: [
    {
      id: "image-best",
      tier: "best",
      name: "顶栏八模式",
      desc: "模式横排在顶栏。裁剪时藏起右栏、露出底栏。这一套迁入 HyMd。",
      source: "原型 v6",
      reason: "八个模式一次看见，画布保持最宽",
      score: { efficiency: 56, aesthetic: 22, learn: 14 },
      ui: frame("top")
    },
    {
      id: "image-good",
      tier: "good",
      name: "侧栏模式",
      desc: "模式和队列工具改成左侧竖条，画布变窄。",
      source: "原型 v6 侧栏",
      reason: "竖条占掉一列，模式名称要折行",
      score: { efficiency: 48, aesthetic: 20, learn: 13 },
      ui: frame("side")
    },
    {
      id: "image-basic",
      tier: "basic",
      name: "右栏换模式",
      desc: "没有独立模式条。八个模式堆在右栏顶部，队列默认收起。",
      source: "原型 v6 的弱化排布",
      reason: "换模式要先看右栏，队列默认不在",
      score: { efficiency: 40, aesthetic: 16, learn: 11 },
      ui: frame("stack")
    }
  ]
};
