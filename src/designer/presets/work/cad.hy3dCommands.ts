/** 由 scripts/gen-hy3d-commands.mjs 从 hy3d ui/commands.json 生成。勿手改。 */
export interface Hy3dCmd { id: string; title: string; category: string; icon: string; keybinding?: string }
export const hy3dCommands: Hy3dCmd[] = [
  { id: "file.import.dwg", title: "导入 DWG…", category: "文件", icon: "import" },
  { id: "hw.cmdbar", title: "命令栏 开/关", category: "视图", icon: "terminal" },
  { id: "hw.toolbarpos", title: "工具栏 上侧/侧面", category: "视图", icon: "rows2" },
  { id: "app.options", title: "选项…", category: "工具", icon: "settings", keybinding: "Ctrl+," },
  { id: "cad.appload", title: "加载应用程序…", category: "工具", icon: "plug" },
  { id: "cad.area", title: "面积", category: "工具", icon: "area" },
  { id: "cad.array", title: "矩形阵列", category: "修改", icon: "array" },
  { id: "cad.block", title: "插入块…", category: "插入", icon: "import" },
  { id: "cad.circle", title: "圆", category: "绘图", icon: "circle" },
  { id: "cad.circle.ttt", title: "相切、相切、相切", category: "绘图", icon: "circle" },
  { id: "cad.arc", title: "圆弧", category: "绘图", icon: "arc" },
  { id: "cad.arc.sce", title: "起点、圆心、端点", category: "绘图", icon: "arc" },
  { id: "cad.arc.sca", title: "起点、圆心、角度", category: "绘图", icon: "arc" },
  { id: "cad.arc.scl", title: "起点、圆心、弦长", category: "绘图", icon: "arc" },
  { id: "cad.arc.sea", title: "起点、端点、角度", category: "绘图", icon: "arc" },
  { id: "cad.arc.sed", title: "起点、端点、方向", category: "绘图", icon: "arc" },
  { id: "cad.arc.ser", title: "起点、端点、半径", category: "绘图", icon: "arc" },
  { id: "cad.arc.cse", title: "圆心、起点、端点", category: "绘图", icon: "arc" },
  { id: "cad.arc.csa", title: "圆心、起点、角度", category: "绘图", icon: "arc" },
  { id: "cad.arc.csl", title: "圆心、起点、弦长", category: "绘图", icon: "arc" },
  { id: "cad.arc.con", title: "连续圆弧", category: "绘图", icon: "arc" },
  { id: "cad.polygon", title: "多边形", category: "绘图", icon: "polygon" },
  { id: "cad.ellipse", title: "椭圆", category: "绘图", icon: "ellipse" },
  { id: "cad.spline", title: "样条曲线", category: "绘图", icon: "spline" },
  { id: "cad.point", title: "点", category: "绘图", icon: "point" },
  { id: "cad.pointm", title: "多点", category: "绘图", icon: "point" },
  { id: "cad.divide", title: "定数等分", category: "绘图", icon: "point" },
  { id: "cad.measure", title: "定距等分", category: "绘图", icon: "point" },
  { id: "cad.ray", title: "射线", category: "绘图", icon: "line" },
  { id: "cad.xline", title: "构造线", category: "绘图", icon: "line" },
  { id: "cad.donut", title: "圆环", category: "绘图", icon: "circle" },
  { id: "cad.copy", title: "复制", category: "修改", icon: "copy" },
  { id: "cad.cui", title: "自定义用户界面…", category: "工具", icon: "wrench" },
  { id: "cad.dc", title: "设计中心", category: "工具", icon: "library", keybinding: "Ctrl+2" },
  { id: "cad.deselect", title: "取消选择", category: "编辑", icon: "none" },
  { id: "cad.dimali", title: "对齐标注", category: "标注", icon: "dimali" },
  { id: "cad.dimang", title: "角度标注", category: "标注", icon: "dimang" },
  { id: "cad.dimlin", title: "线性标注", category: "标注", icon: "dimlin" },
  { id: "cad.dimstyle", title: "标注样式…", category: "格式", icon: "dimstyle" },
  { id: "cad.dist", title: "测量距离", category: "工具", icon: "dist" },
  { id: "cad.dyn", title: "动态输入", category: "草图", icon: "dyn", keybinding: "F12" },
  { id: "cad.erase", title: "删除", category: "修改", icon: "delete", keybinding: "Del" },
  { id: "cad.explode", title: "分解", category: "修改", icon: "explode" },
  { id: "cad.extend", title: "延伸", category: "修改", icon: "extend" },
  { id: "cad.fillet", title: "圆角", category: "修改", icon: "fillet" },
  { id: "cad.grid", title: "栅格", category: "草图", icon: "grid", keybinding: "F7" },
  { id: "cad.hatch", title: "图案填充…", category: "绘图", icon: "hatch" },
  { id: "cad.hide", title: "隐藏对象", category: "视图", icon: "hidden" },
  { id: "cad.image", title: "光栅图像参照…", category: "插入", icon: "image" },
  { id: "cad.isolate", title: "隔离对象", category: "视图", icon: "solo" },
  { id: "cad.layer", title: "图层特性管理器", category: "图层", icon: "layer" },
  { id: "cad.leader", title: "多重引线", category: "标注", icon: "leader" },
  { id: "cad.line", title: "直线", category: "绘图", icon: "line" },
  { id: "cad.linetype", title: "线型…", category: "格式", icon: "pline" },
  { id: "cad.lw", title: "显示线宽", category: "草图", icon: "pline" },
  { id: "cad.matchprop", title: "特性匹配", category: "修改", icon: "matchprop" },
  { id: "cad.mirror", title: "镜像", category: "修改", icon: "mirror" },
  { id: "cad.move", title: "移动", category: "修改", icon: "move" },
  { id: "cad.netload", title: "NETLOAD hy-cad-tool", category: "工具", icon: "plug" },
  { id: "cad.offset", title: "偏移", category: "修改", icon: "offset" },
  { id: "cad.ortho", title: "正交", category: "草图", icon: "ortho", keybinding: "F8" },
  { id: "cad.osnap", title: "对象捕捉", category: "草图", icon: "snap", keybinding: "F3" },
  { id: "cad.otrack", title: "对象捕捉追踪", category: "草图", icon: "otrack", keybinding: "F11" },
  { id: "cad.palettes", title: "工具选项板", category: "工具", icon: "grid2", keybinding: "Ctrl+3" },
  { id: "cad.pan", title: "平移", category: "视图", icon: "pan" },
  { id: "cad.pline", title: "多段线", category: "绘图", icon: "pline" },
  { id: "cad.polar", title: "极轴追踪", category: "草图", icon: "polar", keybinding: "F10" },
  { id: "cad.props", title: "特性", category: "工具", icon: "props", keybinding: "Ctrl+1" },
  { id: "cad.qselect", title: "快速选择…", category: "编辑", icon: "filter" },
  { id: "cad.rect", title: "矩形", category: "绘图", icon: "rect" },
  { id: "cad.regen", title: "重生成", category: "视图", icon: "refresh" },
  { id: "cad.rotate", title: "旋转", category: "修改", icon: "rotate" },
  { id: "cad.scale", title: "缩放", category: "修改", icon: "scale" },
  { id: "cad.selall", title: "全选", category: "编辑", icon: "all", keybinding: "Ctrl+A" },
  { id: "cad.text", title: "单行文字", category: "绘图", icon: "text" },
  { id: "cad.textstyle", title: "文字样式…", category: "格式", icon: "text" },
  { id: "cad.trim", title: "修剪", category: "修改", icon: "trim" },
  { id: "cad.unisolate", title: "结束对象隔离", category: "视图", icon: "visible" },
  { id: "cad.units", title: "单位…", category: "格式", icon: "ruler2" },
  { id: "cad.wscur", title: "工作空间：草图与注释", category: "工具", icon: "app" },
  { id: "cad.xref", title: "外部参照…", category: "插入", icon: "link" },
  { id: "cad.zoomext", title: "范围缩放", category: "视图", icon: "extents" },
  { id: "cad.zoomin", title: "放大", category: "视图", icon: "zoomin" },
  { id: "cad.zoomout", title: "缩小", category: "视图", icon: "zoomout" },
  { id: "cad.zoomsel", title: "缩放到选择", category: "视图", icon: "zoomsel" },
  { id: "cad.zoomwin", title: "窗口缩放", category: "视图", icon: "zoomwin" },
  { id: "edit.cut", title: "剪切", category: "编辑", icon: "cut", keybinding: "Ctrl+X" },
  { id: "edit.find", title: "查找…", category: "编辑", icon: "find", keybinding: "Ctrl+F" },
  { id: "file.close", title: "关闭", category: "文件", icon: "close", keybinding: "Ctrl+F4" },
  { id: "file.export", title: "输出…", category: "文件", icon: "export" },
  { id: "file.new", title: "新建…", category: "文件", icon: "new", keybinding: "Ctrl+N" },
  { id: "file.open", title: "打开…", category: "文件", icon: "open", keybinding: "Ctrl+O" },
  { id: "file.plot", title: "打印…", category: "文件", icon: "print", keybinding: "Ctrl+P" },
  { id: "file.props", title: "图形特性…", category: "文件", icon: "info" },
  { id: "file.save", title: "保存", category: "文件", icon: "save", keybinding: "Ctrl+S" },
  { id: "file.saveas", title: "另存为…", category: "文件", icon: "saveas", keybinding: "Ctrl+Shift+S" },
  { id: "help.help", title: "帮助", category: "帮助", icon: "help", keybinding: "F1" },
  { id: "help.hy", title: "hy-cad-tool 命令参考", category: "帮助", icon: "book" },
  { id: "help.whatsnew", title: "新功能专题研习", category: "帮助", icon: "sparkle" },
  { id: "hy.addload", title: "添加荷载…", category: "HY 结构", icon: "pload" },
  { id: "hy.beam", title: "梁分析（N7）…", category: "HY 结构", icon: "member" },
  { id: "hy.bmd", title: "弯矩图", category: "HY 结构", icon: "bmd" },
  { id: "hy.check", title: "构件验算", category: "HY 结构", icon: "success" },
  { id: "hy.combo", title: "荷载组合…", category: "HY 结构", icon: "loadcase" },
  { id: "hy.deform", title: "变形图", category: "HY 结构", icon: "deform" },
  { id: "hy.envelope", title: "包络图", category: "HY 结构", icon: "envelope" },
  { id: "hy.export", title: "导出内力图…", category: "HY 结构", icon: "export" },
  { id: "hy.insert", title: "插入内力图到 CAD", category: "HY 结构", icon: "import", keybinding: "Ctrl+I" },
  { id: "hy.moment", title: "集中力偶", category: "HY 结构", icon: "moment" },
  { id: "hy.nfd", title: "轴力图", category: "HY 结构", icon: "nfd" },
  { id: "hy.pick", title: "从 CAD 拾取梁", category: "HY 结构", icon: "pivot" },
  { id: "hy.pload", title: "集中力", category: "HY 结构", icon: "pload" },
  { id: "hy.reaction", title: "支座反力", category: "HY 结构", icon: "reaction" },
  { id: "hy.report", title: "生成计算书…", category: "HY 结构", icon: "report" },
  { id: "hy.settle", title: "沉降观测…", category: "HY 结构", icon: "settle" },
  { id: "hy.settle.fit", title: "沉降预测（双曲线拟合）", category: "HY 结构", icon: "graph" },
  { id: "hy.settle.import", title: "导入沉降观测数据…", category: "HY 结构", icon: "import" },
  { id: "hy.settle.report", title: "沉降报表…", category: "HY 结构", icon: "report" },
  { id: "hy.sfd", title: "剪力图", category: "HY 结构", icon: "sfd" },
  { id: "hy.solve", title: "求解", category: "HY 结构", icon: "solve", keybinding: "F5" },
  { id: "hy.sup.fixed", title: "固定端支座", category: "HY 结构", icon: "fixed" },
  { id: "hy.sup.pin", title: "固定铰支座", category: "HY 结构", icon: "pinsup" },
  { id: "hy.sup.roller", title: "活动铰支座", category: "HY 结构", icon: "roller" },
  { id: "hy.sup.spring", title: "弹性支座…", category: "HY 结构", icon: "spring" },
  { id: "hy.udl", title: "均布荷载", category: "HY 结构", icon: "udl" },
  { id: "ui.about", title: "关于", category: "帮助", icon: "info" },
  { id: "ui.density.comfortable", title: "舒适密度", category: "外观", icon: "proportions" },
  { id: "ui.density.compact", title: "紧凑密度", category: "外观", icon: "list" },
  { id: "ui.density.toggle", title: "切换紧凑 / 舒适密度", category: "外观", icon: "proportions", keybinding: "Ctrl+K D" },
  { id: "ui.feedback", title: "反馈问题…", category: "帮助", icon: "tip" },
  { id: "ui.fullscreen", title: "全屏", category: "视图", icon: "fullscreen", keybinding: "Ctrl+0" },
  { id: "ui.info", title: "方案说明（规则 / 优缺点）", category: "帮助", icon: "info" },
  { id: "ui.keys", title: "键盘快捷键…", category: "帮助", icon: "keyboard", keybinding: "Ctrl+K Ctrl+S" },
  { id: "ui.notes", title: "通知中心", category: "帮助", icon: "bell" },
  { id: "ui.palette", title: "命令面板", category: "帮助", icon: "search", keybinding: "Ctrl+Shift+P" },
  { id: "ui.palset.auto", title: "选项板自动隐藏", category: "窗口", icon: "pin" },
  { id: "ui.palset.hide", title: "关闭 HY 选项板", category: "窗口", icon: "close" },
  { id: "ui.redo", title: "重做", category: "编辑", icon: "redo", keybinding: "Ctrl+Y" },
  { id: "ui.resetlayout", title: "重置布局", category: "视图", icon: "refresh" },
  { id: "ui.theme.dark", title: "深色主题", category: "外观", icon: "moon" },
  { id: "ui.theme.light", title: "浅色主题", category: "外观", icon: "light" },
  { id: "ui.theme.toggle", title: "切换深色 / 浅色主题", category: "外观", icon: "contrast", keybinding: "Ctrl+K T" },
  { id: "ui.undo", title: "撤销", category: "编辑", icon: "undo", keybinding: "Ctrl+Z" },
  { id: "view.bottom", title: "命令行", category: "窗口", icon: "bottom", keybinding: "Ctrl+9" },
  { id: "view.left", title: "HY 选项板", category: "窗口", icon: "sideleft", keybinding: "Ctrl+B" },
  { id: "view.right", title: "特性选项板", category: "窗口", icon: "sideright", keybinding: "Ctrl+Alt+B" },
  { id: "edit.copy", title: "复制", category: "编辑", icon: "copy", keybinding: "Ctrl+C" },
  { id: "edit.paste", title: "粘贴", category: "编辑", icon: "paste", keybinding: "Ctrl+V" },
  { id: "edit.pastespec", title: "选择性粘贴…", category: "编辑", icon: "pastespec" },
  { id: "ui.skin.acad-b", title: "皮肤：AutoCAD 原生", category: "外观", icon: "contrast" },
  { id: "ui.skin.hy-e", title: "皮肤：B 色深色系", category: "外观", icon: "moon" },
  { id: "cad.select.invert", title: "反选", category: "编辑", icon: "lu:arrow-right-left" },
  { id: "cad.select.box", title: "框选", category: "编辑", icon: "lu:box-select" },
  { id: "cad.select.circle", title: "圈选", category: "编辑", icon: "lu:circle-dashed" },
  { id: "cad.select.cycle", title: "切换选择工具", category: "编辑", icon: "lu:iteration-ccw" },
  { id: "view.cursor", title: "光标", category: "视图", icon: "pivot" },
  { id: "view.cursor.selected", title: "光标到选中", category: "视图", icon: "lu:crosshair" },
  { id: "view.cursor.to", title: "选中移到光标", category: "视图", icon: "lu:crosshair" },
  { id: "view.cursor.origin", title: "光标归位", category: "视图", icon: "home" },
  { id: "edit.mode", title: "切换对象/编辑模式", category: "编辑", icon: "lu:box" },
  { id: "edit.rename", title: "重命名", category: "编辑", icon: "rename" },
  { id: "cad.to-layer", title: "移到图层", category: "修改", icon: "lu:layers" },
  { id: "edit.join", title: "合并", category: "修改", icon: "join", keybinding: "Ctrl+J" },
  { id: "cad.chamfer", title: "倒角", category: "修改", icon: "chamfer" },
  { id: "cad.break", title: "打断", category: "修改", icon: "break" },
  { id: "cad.stretch", title: "拉伸", category: "修改", icon: "stretch" },
  { id: "edit.undo.history", title: "撤销历史", category: "编辑", icon: "recent", keybinding: "Ctrl+Alt+Z" },
  { id: "view.toolshelf", title: "工具栏", category: "视图", icon: "sideleft" },
  { id: "view.sidebar", title: "侧栏", category: "视图", icon: "sideright" },
  { id: "view.add", title: "添加", category: "绘图", icon: "plus" },
  { id: "edit.adjust", title: "调整上一步", category: "编辑", icon: "sliders", keybinding: "F9" },
  { id: "edit.select.vert", title: "顶点选择", category: "编辑", icon: "lu:dot" },
  { id: "edit.select.edge", title: "边选择", category: "编辑", icon: "lu:minus" },
  { id: "edit.select.face", title: "面选择", category: "编辑", icon: "lu:triangle" },
];

export const hy3dMenus: { id: string; title: string; items: (string | "sep")[] }[] = [
  { id: "file", title: "文件", items: ["file.import.dwg","file.close","file.export","file.new","file.open","file.plot","file.props","file.save","file.saveas"] },
  { id: "edit", title: "编辑", items: ["cad.deselect","cad.qselect","cad.selall","edit.cut","edit.find","ui.redo","ui.undo","edit.copy","edit.paste","edit.pastespec","cad.select.invert","cad.select.box","cad.select.circle","cad.select.cycle","view.cursor","view.cursor.selected","view.cursor.to","view.cursor.origin","edit.mode","edit.rename","cad.to-layer","edit.join","cad.chamfer","cad.break","cad.stretch","edit.undo.history","view.toolshelf","view.sidebar","view.add","edit.adjust","edit.select.vert","edit.select.edge","edit.select.face"] },
  { id: "view", title: "视图", items: ["hw.cmdbar","hw.toolbarpos","cad.hide","cad.isolate","cad.unisolate","ui.fullscreen","ui.resetlayout","sep","cad.pan","cad.regen","cad.zoomext","cad.zoomin","cad.zoomout","cad.zoomsel","cad.zoomwin"] },
  { id: "insert", title: "插入", items: ["cad.block","cad.image","cad.xref"] },
  { id: "draw", title: "绘图", items: ["cad.circle","cad.circle.ttt","cad.arc","cad.arc.sce","cad.arc.sca","cad.arc.scl","cad.arc.sea","cad.arc.sed","cad.arc.ser","cad.arc.cse","cad.arc.csa","cad.arc.csl","cad.arc.con","cad.polygon","cad.ellipse","cad.spline","cad.point","cad.pointm","cad.divide","cad.measure","cad.ray","cad.xline","cad.donut","cad.hatch","cad.line","cad.pline","cad.rect","cad.text"] },
  { id: "ann", title: "标注", items: ["cad.dimali","cad.dimang","cad.dimlin","cad.leader"] },
  { id: "modify", title: "修改", items: ["cad.array","cad.copy","cad.erase","cad.explode","cad.extend","cad.fillet","cad.matchprop","cad.mirror","cad.move","cad.offset","cad.rotate","cad.scale","cad.trim"] },
  { id: "sketch", title: "草图", items: ["cad.dyn","cad.grid","cad.lw","cad.ortho","cad.osnap","cad.otrack","cad.polar"] },
  { id: "format", title: "格式", items: ["cad.dimstyle","cad.linetype","cad.textstyle","cad.units"] },
  { id: "layer", title: "图层", items: ["cad.layer"] },
  { id: "tool", title: "工具", items: ["app.options","cad.appload","cad.area","cad.cui","cad.dc","cad.dist","cad.netload","cad.palettes","cad.props","cad.wscur"] },
  { id: "hy", title: "HY 结构", items: ["hy.addload","hy.beam","hy.bmd","hy.check","hy.combo","hy.deform","hy.envelope","hy.export","hy.insert","hy.moment","hy.nfd","hy.pick","hy.pload","hy.reaction","hy.report","hy.settle","hy.settle.fit","hy.settle.import","hy.settle.report","hy.sfd","hy.solve","hy.sup.fixed","hy.sup.pin","hy.sup.roller","hy.sup.spring","hy.udl"] },
  { id: "look", title: "外观", items: ["ui.density.comfortable","ui.density.compact","ui.density.toggle","ui.theme.dark","ui.theme.light","ui.theme.toggle","ui.skin.acad-b","ui.skin.hy-e"] },
  { id: "window", title: "窗口", items: ["ui.palset.auto","ui.palset.hide","view.bottom","view.left","view.right"] },
  { id: "help", title: "帮助", items: ["help.help","help.hy","help.whatsnew","ui.about","ui.feedback","ui.info","ui.keys","ui.notes","ui.palette"] },
];

export const hy3dRibbon: { id: string; title: string; commands: string[] }[] = [
  {
    "id": "默认-文件",
    "title": "文件",
    "commands": [
      "file.import.dwg",
      "file.close",
      "file.export",
      "file.new",
      "file.open",
      "file.plot",
      "file.props",
      "file.save",
      "file.saveas"
    ]
  },
  {
    "id": "默认-绘图",
    "title": "绘图",
    "commands": [
      "cad.circle",
      "cad.circle.ttt",
      "cad.arc",
      "cad.polygon",
      "cad.ellipse",
      "cad.spline",
      "cad.point",
      "cad.ray",
      "cad.xline",
      "cad.donut",
      "cad.hatch",
      "cad.line",
      "cad.pline",
      "cad.rect",
      "cad.text"
    ]
  },
  {
    "id": "默认-修改",
    "title": "修改",
    "commands": [
      "cad.array",
      "cad.copy",
      "cad.erase",
      "cad.explode",
      "cad.extend",
      "cad.fillet",
      "cad.matchprop",
      "cad.mirror",
      "cad.move",
      "cad.offset",
      "cad.rotate",
      "cad.scale",
      "cad.trim"
    ]
  },
  {
    "id": "默认-注释",
    "title": "注释",
    "commands": [
      "cad.dimali",
      "cad.dimang",
      "cad.dimlin",
      "cad.leader"
    ]
  },
  {
    "id": "默认-插入",
    "title": "插入",
    "commands": [
      "cad.block",
      "cad.image",
      "cad.xref"
    ]
  },
  {
    "id": "默认-草图与注释",
    "title": "草图与注释",
    "commands": [
      "cad.dyn",
      "cad.grid",
      "cad.lw",
      "cad.ortho",
      "cad.osnap",
      "cad.otrack",
      "cad.polar"
    ]
  },
  {
    "id": "默认-图层",
    "title": "图层",
    "commands": [
      "cad.layer"
    ]
  },
  {
    "id": "默认-视图",
    "title": "视图",
    "commands": [
      "hw.cmdbar",
      "hw.toolbarpos",
      "cad.hide",
      "cad.isolate",
      "cad.pan",
      "cad.regen",
      "cad.unisolate",
      "cad.zoomext",
      "cad.zoomin",
      "cad.zoomout",
      "cad.zoomsel",
      "cad.zoomwin",
      "ui.density.comfortable",
      "ui.density.compact",
      "ui.density.toggle",
      "ui.fullscreen",
      "ui.palset.auto",
      "ui.palset.hide",
      "ui.resetlayout",
      "ui.theme.dark",
      "ui.theme.light",
      "ui.theme.toggle",
      "view.bottom",
      "view.left",
      "view.right"
    ]
  },
  {
    "id": "默认-工具",
    "title": "工具",
    "commands": [
      "app.options",
      "cad.appload",
      "cad.area",
      "cad.cui",
      "cad.dc",
      "cad.dist",
      "cad.netload",
      "cad.palettes",
      "cad.props",
      "cad.wscur"
    ]
  },
  {
    "id": "默认-编辑",
    "title": "编辑",
    "commands": [
      "cad.deselect",
      "cad.qselect",
      "cad.selall",
      "edit.cut",
      "edit.find",
      "ui.redo",
      "ui.undo",
      "edit.copy",
      "edit.paste",
      "edit.pastespec"
    ]
  },
  {
    "id": "默认-格式",
    "title": "格式",
    "commands": [
      "cad.dimstyle",
      "cad.linetype",
      "cad.textstyle",
      "cad.units"
    ]
  },
  {
    "id": "默认-帮助",
    "title": "帮助",
    "commands": [
      "help.help",
      "help.hy",
      "help.whatsnew",
      "ui.about",
      "ui.feedback",
      "ui.info",
      "ui.keys",
      "ui.notes",
      "ui.palette"
    ]
  },
  {
    "id": "HY结构-分析",
    "title": "分析",
    "commands": [
      "hy.addload",
      "hy.beam",
      "hy.bmd",
      "hy.check",
      "hy.combo",
      "hy.deform",
      "hy.envelope",
      "hy.export",
      "hy.insert",
      "hy.moment",
      "hy.nfd",
      "hy.pick",
      "hy.pload",
      "hy.reaction",
      "hy.report",
      "hy.settle",
      "hy.settle.fit",
      "hy.settle.import",
      "hy.settle.report",
      "hy.sfd",
      "hy.solve",
      "hy.sup.fixed",
      "hy.sup.pin",
      "hy.sup.roller",
      "hy.sup.spring",
      "hy.udl"
    ]
  },
  {
    "id": "HY沉降-观测",
    "title": "观测",
    "commands": [
      "hy.settle",
      "hy.settle.import"
    ]
  },
  {
    "id": "HY沉降-分析",
    "title": "分析",
    "commands": [
      "hy.settle.fit"
    ]
  },
  {
    "id": "HY沉降-输出",
    "title": "输出",
    "commands": [
      "hy.settle.report"
    ]
  }
];

export const BLENDER_TABS: { id: string; title: string; panels: { id: string; title: string; ids: string[] }[] }[] = [
  {
    "id": "默认",
    "title": "默认",
    "panels": [
      {
        "id": "绘图",
        "title": "绘图",
        "ids": [
          "cad.circle",
          "cad.circle.ttt",
          "cad.arc",
          "cad.arc.sce",
          "cad.arc.sca",
          "cad.arc.scl",
          "cad.arc.sea",
          "cad.arc.sed",
          "cad.arc.ser",
          "cad.arc.cse",
          "cad.arc.csa",
          "cad.arc.csl",
          "cad.arc.con",
          "cad.polygon",
          "cad.ellipse",
          "cad.spline",
          "cad.point",
          "cad.pointm",
          "cad.divide",
          "cad.measure",
          "cad.ray",
          "cad.xline",
          "cad.donut",
          "cad.line",
          "cad.pline",
          "cad.rect"
        ]
      },
      {
        "id": "修改",
        "title": "修改",
        "ids": [
          "cad.array",
          "cad.copy",
          "cad.erase",
          "cad.explode",
          "cad.extend",
          "cad.fillet",
          "cad.matchprop",
          "cad.mirror",
          "cad.move",
          "cad.offset",
          "cad.rotate",
          "cad.scale",
          "cad.trim",
          "cad.to-layer",
          "edit.join",
          "cad.chamfer",
          "cad.break",
          "cad.stretch"
        ]
      },
      {
        "id": "注释",
        "title": "注释",
        "ids": [
          "cad.dimali",
          "cad.dimang",
          "cad.dimlin",
          "cad.hatch",
          "cad.leader",
          "cad.text"
        ]
      },
      {
        "id": "图层",
        "title": "图层",
        "ids": [
          "cad.layer"
        ]
      },
      {
        "id": "实用工具",
        "title": "实用工具",
        "ids": [
          "cad.area",
          "cad.dist"
        ]
      },
      {
        "id": "剪贴板",
        "title": "剪贴板",
        "ids": [
          "edit.cut",
          "edit.find",
          "edit.copy",
          "edit.paste",
          "edit.pastespec"
        ]
      },
      {
        "id": "选择",
        "title": "选择",
        "ids": [
          "cad.deselect",
          "cad.qselect",
          "cad.selall",
          "cad.select.invert",
          "cad.select.box",
          "cad.select.circle",
          "cad.select.cycle"
        ]
      }
    ]
  },
  {
    "id": "插入",
    "title": "插入",
    "panels": [
      {
        "id": "参照",
        "title": "参照",
        "ids": [
          "cad.block",
          "cad.image",
          "cad.xref"
        ]
      }
    ]
  },
  {
    "id": "视图",
    "title": "视图",
    "panels": [
      {
        "id": "缩放与显示",
        "title": "缩放与显示",
        "ids": [
          "cad.hide",
          "cad.isolate",
          "cad.pan",
          "cad.regen",
          "cad.unisolate",
          "cad.zoomext",
          "cad.zoomin",
          "cad.zoomout",
          "cad.zoomsel",
          "cad.zoomwin"
        ]
      },
      {
        "id": "界面",
        "title": "界面",
        "ids": [
          "hw.cmdbar",
          "hw.toolbarpos",
          "ui.density.comfortable",
          "ui.density.compact",
          "ui.density.toggle",
          "ui.fullscreen",
          "ui.palset.auto",
          "ui.palset.hide",
          "ui.resetlayout",
          "ui.theme.dark",
          "ui.theme.light",
          "ui.theme.toggle",
          "view.bottom",
          "view.left",
          "view.right",
          "ui.skin.acad-b",
          "ui.skin.hy-e",
          "view.toolshelf",
          "view.sidebar"
        ]
      }
    ]
  },
  {
    "id": "管理",
    "title": "管理",
    "panels": [
      {
        "id": "样式与选项",
        "title": "样式与选项",
        "ids": [
          "app.options",
          "cad.cui",
          "cad.dimstyle",
          "cad.linetype",
          "cad.textstyle",
          "cad.units"
        ]
      }
    ]
  },
  {
    "id": "输出",
    "title": "输出",
    "panels": [
      {
        "id": "打印与导出",
        "title": "打印与导出",
        "ids": [
          "file.import.dwg",
          "file.export",
          "file.plot",
          "file.props"
        ]
      }
    ]
  },
  {
    "id": "文件",
    "title": "文件",
    "panels": [
      {
        "id": "文档",
        "title": "文档",
        "ids": [
          "file.close",
          "file.new",
          "file.open",
          "file.save",
          "file.saveas"
        ]
      }
    ]
  },
  {
    "id": "结构",
    "title": "结构",
    "panels": [
      {
        "id": "梁",
        "title": "梁",
        "ids": [
          "hy.beam",
          "hy.pick",
          "hy.sup.fixed",
          "hy.sup.pin",
          "hy.sup.roller",
          "hy.sup.spring"
        ]
      },
      {
        "id": "荷载",
        "title": "荷载",
        "ids": [
          "hy.addload",
          "hy.combo",
          "hy.moment",
          "hy.pload",
          "hy.udl"
        ]
      },
      {
        "id": "求解",
        "title": "求解",
        "ids": [
          "hy.bmd",
          "hy.check",
          "hy.deform",
          "hy.envelope",
          "hy.export",
          "hy.insert",
          "hy.nfd",
          "hy.reaction",
          "hy.report",
          "hy.sfd",
          "hy.solve"
        ]
      },
      {
        "id": "沉降",
        "title": "沉降",
        "ids": [
          "hy.settle",
          "hy.settle.fit",
          "hy.settle.import",
          "hy.settle.report"
        ]
      }
    ]
  },
  {
    "id": "帮助",
    "title": "帮助",
    "panels": [
      {
        "id": "帮助",
        "title": "帮助",
        "ids": [
          "help.help",
          "help.hy",
          "help.whatsnew",
          "ui.about",
          "ui.feedback",
          "ui.info",
          "ui.keys",
          "ui.notes",
          "ui.palette"
        ]
      }
    ]
  }
];
export const BLENDER_QUICK: string[] = ["ui.undo","ui.redo","edit.adjust"];
export const BLENDER_STATUS: string[] = ["cad.dyn","cad.grid","cad.lw","cad.ortho","cad.osnap","cad.otrack","cad.polar"];
export const BLENDER_MENUS: { id: string; title: string; items: (string | "sep")[] }[] = [
  {
    "id": "file",
    "title": "文件",
    "items": [
      "file.new",
      "file.open",
      "file.save",
      "file.saveas",
      "file.close"
    ]
  },
  {
    "id": "edit",
    "title": "编辑",
    "items": [
      "ui.undo",
      "ui.redo",
      "edit.adjust",
      "sep",
      "edit.cut",
      "edit.copy",
      "edit.paste",
      "edit.pastespec",
      "edit.find"
    ]
  },
  {
    "id": "window",
    "title": "窗口",
    "items": [
      "view.toolshelf",
      "view.sidebar",
      "view.left",
      "view.right",
      "hw.cmdbar",
      "view.bottom",
      "ui.fullscreen",
      "ui.resetlayout"
    ]
  },
  {
    "id": "help",
    "title": "帮助",
    "items": [
      "help.help",
      "help.hy",
      "help.whatsnew",
      "ui.about",
      "ui.feedback",
      "ui.info",
      "ui.keys",
      "ui.notes",
      "ui.palette"
    ]
  },
  {
    "id": "more",
    "title": "更多",
    "items": [
      "view.cursor",
      "view.cursor.selected",
      "view.cursor.to",
      "view.cursor.origin",
      "edit.mode",
      "view.add",
      "edit.select.vert",
      "edit.select.edge",
      "edit.select.face",
      "sep",
      "cad.appload",
      "cad.dc",
      "cad.netload",
      "cad.palettes",
      "cad.props",
      "cad.wscur",
      "edit.rename",
      "edit.undo.history"
    ]
  }
];
export const BENCH_TOP = ["file.new", "file.open", "file.save", "ui.undo", "ui.redo", "cad.zoomext", "cad.pan", "cad.selall"];
export const BENCH_DEF = ["hy.beam", "hy.solve", "hy.combo", "hy.addload", "cad.layer", "hy.insert", "hy.report", "hy.settle"];
