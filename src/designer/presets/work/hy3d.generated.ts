/** 由 scripts/gen-hy3d-template.mjs 从 hy3d ui/commands 和 ui/icons.svg 生成。勿手改。 */
export interface Hy3dCmd { id: string; title: string; category: string; icon: string; keybinding?: string }
export const hy3dFullCommands: Hy3dCmd[] = [
  { id: "file.import.dwg", title: "导入 DWG…", category: "文件", icon: "h3-import-dwg" },
  { id: "cad.import", title: "导入…", category: "文件", icon: "h3-import" },
  { id: "cad.recover", title: "恢复…", category: "文件", icon: "h3-recover" },
  { id: "cad.recoverall", title: "全部恢复…", category: "文件", icon: "h3-recover-all" },
  { id: "file.close", title: "关闭", category: "文件", icon: "h3-close", keybinding: "Ctrl+F4" },
  { id: "file.export", title: "输出…", category: "文件", icon: "h3-export" },
  { id: "file.new", title: "新建…", category: "文件", icon: "h3-new", keybinding: "Ctrl+N" },
  { id: "file.open", title: "打开…", category: "文件", icon: "h3-open", keybinding: "Ctrl+O" },
  { id: "file.plot", title: "打印…", category: "文件", icon: "h3-print", keybinding: "Ctrl+P" },
  { id: "file.preview", title: "打印预览…", category: "文件", icon: "h3-preview" },
  { id: "file.props", title: "图形特性…", category: "文件", icon: "h3-file-props" },
  { id: "file.save", title: "保存", category: "文件", icon: "h3-save", keybinding: "Ctrl+S" },
  { id: "file.saveas", title: "另存为…", category: "文件", icon: "h3-saveas", keybinding: "Ctrl+Shift+S" },
  { id: "hw.cmdbar", title: "命令栏 开/关", category: "视图", icon: "h3-terminal" },
  { id: "hw.toolbarpos", title: "工具栏 上侧/侧面", category: "视图", icon: "h3-rows2" },
  { id: "cad.hide", title: "隐藏对象", category: "视图", icon: "h3-hidden" },
  { id: "cad.isolate", title: "隔离对象", category: "视图", icon: "h3-solo" },
  { id: "cad.pan", title: "平移", category: "视图", icon: "h3-pan" },
  { id: "cad.regen", title: "重生成", category: "视图", icon: "h3-refresh" },
  { id: "cad.regenall", title: "全部重生成", category: "视图", icon: "h3-regen-all" },
  { id: "cad.redraw", title: "重画", category: "视图", icon: "h3-redraw" },
  { id: "cad.unisolate", title: "结束对象隔离", category: "视图", icon: "h3-visible" },
  { id: "cad.zoomext", title: "范围缩放", category: "视图", icon: "h3-extents" },
  { id: "cad.zoomprev", title: "上一个视图", category: "视图", icon: "h3-zoom-prev" },
  { id: "cad.zoomnext", title: "下一个视图", category: "视图", icon: "h3-zoom-next" },
  { id: "cad.zoomin", title: "放大", category: "视图", icon: "h3-zoomin" },
  { id: "cad.zoomout", title: "缩小", category: "视图", icon: "h3-zoomout" },
  { id: "cad.zoomsel", title: "缩放到选择", category: "视图", icon: "h3-zoomsel" },
  { id: "cad.zoomwin", title: "窗口缩放", category: "视图", icon: "h3-zoomwin" },
  { id: "ui.fullscreen", title: "全屏", category: "视图", icon: "h3-fullscreen", keybinding: "Ctrl+0" },
  { id: "ui.resetlayout", title: "重置布局", category: "视图", icon: "h3-layout-reset" },
  { id: "view.cursor", title: "光标", category: "视图", icon: "h3-cursor" },
  { id: "view.cursor.selected", title: "光标到选中", category: "视图", icon: "h3-cursel" },
  { id: "view.cursor.to", title: "选中移到光标", category: "视图", icon: "h3-cursorto" },
  { id: "view.cursor.origin", title: "光标归位", category: "视图", icon: "h3-origin" },
  { id: "view.toolshelf", title: "工具栏", category: "视图", icon: "h3-toolshelf" },
  { id: "view.sidebar", title: "侧栏", category: "视图", icon: "h3-sideright" },
  { id: "cad.model", title: "模型空间", category: "视图", icon: "h3-model" },
  { id: "cad.pspace", title: "图纸空间", category: "视图", icon: "h3-pspace" },
  { id: "cad.layout", title: "布局…", category: "视图", icon: "h3-layout-mgr" },
  { id: "cad.vports", title: "视口配置", category: "视图", icon: "h3-vports" },
  { id: "cad.mview", title: "布局视口", category: "视图", icon: "h3-mview" },
  { id: "cad.view", title: "命名视图", category: "视图", icon: "h3-view-named" },
  { id: "app.options", title: "选项…", category: "工具", icon: "h3-settings", keybinding: "Ctrl+," },
  { id: "cad.purge", title: "清理…", category: "工具", icon: "h3-purge" },
  { id: "cad.appload", title: "加载应用程序…", category: "工具", icon: "h3-plug" },
  { id: "cad.audit", title: "核查…", category: "工具", icon: "h3-audit" },
  { id: "cad.area", title: "面积", category: "工具", icon: "h3-area" },
  { id: "cad.cui", title: "自定义用户界面…", category: "工具", icon: "h3-wrench" },
  { id: "cad.dc", title: "设计中心", category: "工具", icon: "h3-library", keybinding: "Ctrl+2" },
  { id: "cad.dist", title: "测量距离", category: "工具", icon: "h3-dist" },
  { id: "cad.id", title: "点坐标", category: "工具", icon: "h3-id-point" },
  { id: "cad.list", title: "列表", category: "工具", icon: "h3-list-obj" },
  { id: "cad.netload", title: "NETLOAD hy-cad-tool", category: "工具", icon: "h3-netload" },
  { id: "cad.palettes", title: "工具选项板", category: "工具", icon: "h3-grid2", keybinding: "Ctrl+3" },
  { id: "cad.props", title: "特性", category: "工具", icon: "h3-props", keybinding: "Ctrl+1" },
  { id: "cad.wscur", title: "工作空间：草图与注释", category: "工具", icon: "h3-app" },
  { id: "cad.array", title: "矩形阵列", category: "修改", icon: "h3-array" },
  { id: "cad.copy", title: "复制", category: "修改", icon: "h3-copy-geom" },
  { id: "cad.erase", title: "删除", category: "修改", icon: "h3-delete", keybinding: "Del" },
  { id: "cad.explode", title: "分解", category: "修改", icon: "h3-explode" },
  { id: "cad.xplode", title: "分解并指定特性", category: "修改", icon: "h3-xplode" },
  { id: "cad.extend", title: "延伸", category: "修改", icon: "h3-extend" },
  { id: "cad.fillet", title: "圆角", category: "修改", icon: "h3-fillet" },
  { id: "cad.matchprop", title: "特性匹配", category: "修改", icon: "h3-matchprop" },
  { id: "cad.mirror", title: "镜像", category: "修改", icon: "h3-mirror" },
  { id: "cad.move", title: "移动", category: "修改", icon: "h3-move" },
  { id: "cad.offset", title: "偏移", category: "修改", icon: "h3-offset" },
  { id: "cad.rotate", title: "旋转", category: "修改", icon: "h3-rotate" },
  { id: "cad.scale", title: "缩放", category: "修改", icon: "h3-scale" },
  { id: "cad.trim", title: "修剪", category: "修改", icon: "h3-trim" },
  { id: "cad.to-layer", title: "移到图层", category: "修改", icon: "h3-tolayer" },
  { id: "edit.join", title: "合并", category: "修改", icon: "h3-join", keybinding: "Ctrl+J" },
  { id: "cad.chamfer", title: "倒角", category: "修改", icon: "h3-chamfer" },
  { id: "cad.break", title: "打断", category: "修改", icon: "h3-break" },
  { id: "cad.stretch", title: "拉伸", category: "修改", icon: "h3-stretch" },
  { id: "cad.arraypolar", title: "环形阵列", category: "修改", icon: "h3-array-polar" },
  { id: "cad.arraypath", title: "路径阵列", category: "修改", icon: "h3-patharray" },
  { id: "cad.overkill", title: "删除重复对象", category: "修改", icon: "h3-overkill" },
  { id: "cad.breakatpoint", title: "打断于点", category: "修改", icon: "h3-breakat" },
  { id: "cad.lengthen", title: "拉长", category: "修改", icon: "h3-lengthen" },
  { id: "cad.pedit", title: "多段线编辑", category: "修改", icon: "h3-pedit" },
  { id: "cad.align", title: "对齐", category: "修改", icon: "h3-align" },
  { id: "cad.group", title: "编组", category: "修改", icon: "h3-group" },
  { id: "cad.ungroup", title: "解除编组", category: "修改", icon: "h3-ungroup" },
  { id: "cad.draworder", title: "绘图次序", category: "修改", icon: "h3-front" },
  { id: "cad.block", title: "插入块…", category: "插入", icon: "h3-block-ins" },
  { id: "cad.blockdef", title: "创建块", category: "插入", icon: "h3-block" },
  { id: "cad.image", title: "图像管理器…", category: "插入", icon: "h3-image" },
  { id: "cad.imageclip", title: "图像剪裁", category: "插入", icon: "h3-image-clip" },
  { id: "cad.imageattach", title: "附着图像…", category: "插入", icon: "h3-image-attach" },
  { id: "cad.xref", title: "外部参照…", category: "插入", icon: "h3-xref" },
  { id: "cad.wblock", title: "写块…", category: "插入", icon: "h3-wblock" },
  { id: "cad.attdef", title: "定义属性…", category: "插入", icon: "h3-att-def" },
  { id: "cad.attedit", title: "编辑属性…", category: "插入", icon: "h3-att-edit" },
  { id: "cad.attsync", title: "同步属性", category: "插入", icon: "h3-att-sync" },
  { id: "cad.extref", title: "外部参照管理器…", category: "插入", icon: "h3-xref-mgr" },
  { id: "cad.eattedit", title: "增强属性编辑器…", category: "插入", icon: "h3-att-eatt" },
  { id: "cad.bedit", title: "块编辑器…", category: "插入", icon: "h3-pen" },
  { id: "cad.bsave", title: "保存块定义", category: "插入", icon: "h3-block-save" },
  { id: "cad.bclose", title: "关闭块编辑器", category: "插入", icon: "h3-block-close" },
  { id: "cad.circle", title: "圆", category: "绘图", icon: "h3-circle" },
  { id: "cad.circle.ttt", title: "相切、相切、相切", category: "绘图", icon: "h3-circle-ttt" },
  { id: "cad.arc", title: "圆弧", category: "绘图", icon: "h3-arc" },
  { id: "cad.arc.sce", title: "起点、圆心、端点", category: "绘图", icon: "h3-arc-sce" },
  { id: "cad.arc.sca", title: "起点、圆心、角度", category: "绘图", icon: "h3-arc-sca" },
  { id: "cad.arc.scl", title: "起点、圆心、弦长", category: "绘图", icon: "h3-arc-scl" },
  { id: "cad.arc.sea", title: "起点、端点、角度", category: "绘图", icon: "h3-arc-sea" },
  { id: "cad.arc.sed", title: "起点、端点、方向", category: "绘图", icon: "h3-arc-sed" },
  { id: "cad.arc.ser", title: "起点、端点、半径", category: "绘图", icon: "h3-arc-ser" },
  { id: "cad.arc.cse", title: "圆心、起点、端点", category: "绘图", icon: "h3-arc-cse" },
  { id: "cad.arc.csa", title: "圆心、起点、角度", category: "绘图", icon: "h3-arc-csa" },
  { id: "cad.arc.csl", title: "圆心、起点、弦长", category: "绘图", icon: "h3-arc-csl" },
  { id: "cad.arc.con", title: "连续圆弧", category: "绘图", icon: "h3-arc-con" },
  { id: "cad.polygon", title: "多边形", category: "绘图", icon: "h3-polygon" },
  { id: "cad.ellipse", title: "椭圆", category: "绘图", icon: "h3-ellipse" },
  { id: "cad.spline", title: "样条曲线", category: "绘图", icon: "h3-spline" },
  { id: "cad.point", title: "点", category: "绘图", icon: "h3-point" },
  { id: "cad.pointm", title: "多点", category: "绘图", icon: "h3-pointm" },
  { id: "cad.divide", title: "定数等分", category: "绘图", icon: "h3-divide" },
  { id: "cad.measure", title: "定距等分", category: "绘图", icon: "h3-measure" },
  { id: "cad.ray", title: "射线", category: "绘图", icon: "h3-ray" },
  { id: "cad.xline", title: "构造线", category: "绘图", icon: "h3-xline" },
  { id: "cad.donut", title: "圆环", category: "绘图", icon: "h3-donut" },
  { id: "cad.solid", title: "二维填充", category: "绘图", icon: "h3-solid" },
  { id: "cad.revcloud", title: "修订云线", category: "绘图", icon: "h3-revcloud" },
  { id: "cad.hatch", title: "图案填充…", category: "绘图", icon: "h3-hatch" },
  { id: "cad.line", title: "直线", category: "绘图", icon: "h3-line" },
  { id: "cad.pline", title: "多段线", category: "绘图", icon: "h3-pline" },
  { id: "cad.rect", title: "矩形", category: "绘图", icon: "h3-rect" },
  { id: "cad.text", title: "单行文字", category: "绘图", icon: "h3-text" },
  { id: "cad.mtext", title: "多行文字", category: "绘图", icon: "h3-mtext" },
  { id: "view.add", title: "添加", category: "绘图", icon: "h3-plus" },
  { id: "cad.deselect", title: "取消选择", category: "编辑", icon: "h3-none" },
  { id: "cad.qselect", title: "快速选择…", category: "编辑", icon: "h3-filter" },
  { id: "cad.select", title: "选择对象", category: "编辑", icon: "h3-select" },
  { id: "cad.selall", title: "全选", category: "编辑", icon: "h3-all", keybinding: "Ctrl+A" },
  { id: "edit.cut", title: "剪切", category: "编辑", icon: "h3-cut", keybinding: "Ctrl+X" },
  { id: "edit.find", title: "查找…", category: "编辑", icon: "h3-find", keybinding: "Ctrl+F" },
  { id: "ui.redo", title: "重做", category: "编辑", icon: "h3-redo", keybinding: "Ctrl+Y" },
  { id: "ui.undo", title: "撤销", category: "编辑", icon: "h3-undo", keybinding: "Ctrl+Z" },
  { id: "edit.copy", title: "复制", category: "编辑", icon: "h3-copy", keybinding: "Ctrl+C" },
  { id: "edit.paste", title: "粘贴", category: "编辑", icon: "h3-paste", keybinding: "Ctrl+V" },
  { id: "edit.pastespec", title: "选择性粘贴…", category: "编辑", icon: "h3-pastespec" },
  { id: "cad.select.invert", title: "反选", category: "编辑", icon: "h3-invert" },
  { id: "cad.selinvert", title: "反选", category: "编辑", icon: "h3-invert-all", keybinding: "Ctrl+I" },
  { id: "cad.select.box", title: "框选", category: "编辑", icon: "h3-boxsel" },
  { id: "cad.select.circle", title: "圈选", category: "编辑", icon: "h3-circlesel" },
  { id: "cad.select.cycle", title: "切换选择工具", category: "编辑", icon: "h3-cycle" },
  { id: "edit.mode", title: "切换对象/编辑模式", category: "编辑", icon: "h3-mode" },
  { id: "edit.rename", title: "重命名", category: "编辑", icon: "h3-rename" },
  { id: "edit.undo.history", title: "撤销历史", category: "编辑", icon: "h3-recent", keybinding: "Ctrl+Alt+Z" },
  { id: "edit.adjust", title: "调整上一步", category: "编辑", icon: "h3-sliders", keybinding: "F9" },
  { id: "edit.select.vert", title: "顶点选择", category: "编辑", icon: "h3-vert" },
  { id: "edit.select.edge", title: "边选择", category: "编辑", icon: "h3-edge" },
  { id: "edit.select.face", title: "面选择", category: "编辑", icon: "h3-face" },
  { id: "cad.textedit", title: "编辑文字", category: "修改", icon: "h3-text-edit" },
  { id: "cad.spell", title: "拼写检查", category: "修改", icon: "h3-spell" },
  { id: "cad.dimali", title: "对齐标注", category: "标注", icon: "h3-dimali" },
  { id: "cad.dimang", title: "角度标注", category: "标注", icon: "h3-dimang" },
  { id: "cad.dimarc", title: "弧长标注", category: "标注", icon: "h3-dimarc" },
  { id: "cad.dimbase", title: "基线标注", category: "标注", icon: "h3-dimbase" },
  { id: "cad.dimcont", title: "连续标注", category: "标注", icon: "h3-dimcont" },
  { id: "cad.dimdia", title: "直径标注", category: "标注", icon: "h3-dimdia" },
  { id: "cad.dimlin", title: "线性标注", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimord", title: "坐标标注", category: "标注", icon: "h3-dimord" },
  { id: "cad.qdim", title: "快速标注", category: "标注", icon: "h3-qdim" },
  { id: "cad.dim", title: "智能标注", category: "标注", icon: "h3-dim-auto" },
  { id: "cad.dimrad", title: "半径标注", category: "标注", icon: "h3-dimrad" },
  { id: "cad.leader", title: "多重引线", category: "标注", icon: "h3-leader" },
  { id: "cad.qleader", title: "快速引线", category: "标注", icon: "h3-leader-quick" },
  { id: "cad.dimedit", title: "标注编辑", category: "标注", icon: "h3-dim-edit" },
  { id: "cad.dimtedit", title: "标注文字位置", category: "标注", icon: "h3-dim-text" },
  { id: "cad.mleaderstyle", title: "多重引线样式", category: "标注", icon: "h3-leader-style" },
  { id: "cad.tablestyle", title: "表格样式", category: "标注", icon: "h3-table-style" },
  { id: "cad.table", title: "表格", category: "标注", icon: "h3-table" },
  { id: "cad.dimstyle", title: "标注样式…", category: "格式", icon: "h3-dimstyle" },
  { id: "cad.linetype", title: "线型…", category: "格式", icon: "h3-linetype" },
  { id: "cad.textstyle", title: "文字样式…", category: "格式", icon: "h3-text-style" },
  { id: "cad.units", title: "单位…", category: "格式", icon: "h3-ruler2" },
  { id: "cad.ltscale", title: "线型比例…", category: "格式", icon: "h3-ltscale" },
  { id: "cad.color", title: "颜色…", category: "格式", icon: "h3-color" },
  { id: "cad.lweight", title: "线宽…", category: "格式", icon: "h3-lweight" },
  { id: "cad.dyn", title: "动态输入", category: "草图", icon: "h3-dyn", keybinding: "F12" },
  { id: "cad.grid", title: "栅格", category: "草图", icon: "h3-grid", keybinding: "F7" },
  { id: "cad.lw", title: "显示线宽", category: "草图", icon: "h3-lw-show" },
  { id: "cad.ortho", title: "正交", category: "草图", icon: "h3-ortho", keybinding: "F8" },
  { id: "cad.osnap", title: "对象捕捉（F3）", category: "草图", icon: "h3-snap", keybinding: "F3" },
  { id: "cad.snapmode", title: "栅格捕捉（Shift+F9）", category: "草图", icon: "h3-snap-mode", keybinding: "Shift+F9" },
  { id: "cad.dsettings", title: "草图设置…", category: "草图", icon: "h3-draft-set" },
  { id: "cad.snap", title: "捕捉设置", category: "草图", icon: "h3-snap-set" },
  { id: "cad.otrack", title: "对象捕捉追踪", category: "草图", icon: "h3-otrack", keybinding: "F11" },
  { id: "cad.polar", title: "极轴追踪", category: "草图", icon: "h3-polar", keybinding: "F10" },
  { id: "cad.layer", title: "图层特性管理器", category: "图层", icon: "h3-layer" },
  { id: "cad.layiso", title: "图层隔离", category: "图层", icon: "h3-layer-iso" },
  { id: "cad.layuniso", title: "图层取消隔离", category: "图层", icon: "h3-layer-uniso" },
  { id: "cad.layoff", title: "图层关闭", category: "图层", icon: "h3-layer-off" },
  { id: "cad.layon", title: "图层打开", category: "图层", icon: "h3-layer-on" },
  { id: "cad.layfrz", title: "图层冻结", category: "图层", icon: "h3-layer-frz" },
  { id: "cad.laythw", title: "图层解冻", category: "图层", icon: "h3-layer-thw" },
  { id: "cad.laylck", title: "图层锁定", category: "图层", icon: "h3-layer-lck" },
  { id: "cad.laylulk", title: "图层解锁", category: "图层", icon: "h3-layer-ulk" },
  { id: "cad.laycur", title: "置为当前图层", category: "图层", icon: "h3-layer-cur" },
  { id: "cad.laymch", title: "图层匹配", category: "图层", icon: "h3-layer-mch" },
  { id: "cad.laywalk", title: "图层浏览", category: "图层", icon: "h3-layer-walk" },
  { id: "help.help", title: "帮助", category: "帮助", icon: "h3-help", keybinding: "F1" },
  { id: "help.hy", title: "hy-cad-tool 命令参考", category: "帮助", icon: "h3-book" },
  { id: "help.whatsnew", title: "新功能专题研习", category: "帮助", icon: "h3-sparkle" },
  { id: "ui.about", title: "关于", category: "帮助", icon: "h3-info" },
  { id: "ui.feedback", title: "反馈问题…", category: "帮助", icon: "h3-tip" },
  { id: "ui.info", title: "方案说明（规则 / 优缺点）", category: "帮助", icon: "h3-scheme-note" },
  { id: "ui.keys", title: "键盘快捷键…", category: "帮助", icon: "h3-keyboard", keybinding: "Ctrl+K Ctrl+S" },
  { id: "ui.notes", title: "通知中心", category: "帮助", icon: "h3-bell" },
  { id: "ui.palette", title: "命令面板", category: "帮助", icon: "h3-search", keybinding: "Ctrl+Shift+P" },
  { id: "hy.addload", title: "添加荷载…", category: "HY 结构", icon: "h3-load-add" },
  { id: "hy.beam", title: "梁分析（N7）…", category: "HY 结构", icon: "h3-member" },
  { id: "hy.bmd", title: "弯矩图", category: "HY 结构", icon: "h3-bmd" },
  { id: "hy.check", title: "构件验算", category: "HY 结构", icon: "h3-success" },
  { id: "hy.combo", title: "荷载组合…", category: "HY 结构", icon: "h3-loadcase" },
  { id: "hy.deform", title: "变形图", category: "HY 结构", icon: "h3-deform" },
  { id: "hy.envelope", title: "包络图", category: "HY 结构", icon: "h3-envelope" },
  { id: "hy.export", title: "导出内力图…", category: "HY 结构", icon: "h3-diagram-out" },
  { id: "hy.insert", title: "插入内力图到 CAD", category: "HY 结构", icon: "h3-diagram-in" },
  { id: "hy.moment", title: "集中力偶", category: "HY 结构", icon: "h3-moment" },
  { id: "hy.nfd", title: "轴力图", category: "HY 结构", icon: "h3-nfd" },
  { id: "hy.pick", title: "从 CAD 拾取梁", category: "HY 结构", icon: "h3-pick-beam" },
  { id: "hy.pload", title: "集中力", category: "HY 结构", icon: "h3-pload" },
  { id: "hy.reaction", title: "支座反力", category: "HY 结构", icon: "h3-reaction" },
  { id: "hy.report", title: "生成计算书…", category: "HY 结构", icon: "h3-report" },
  { id: "hy.settle", title: "沉降观测…", category: "HY 结构", icon: "h3-settle" },
  { id: "hy.settle.fit", title: "沉降预测（双曲线拟合）", category: "HY 结构", icon: "h3-graph" },
  { id: "hy.settle.import", title: "导入沉降观测数据…", category: "HY 结构", icon: "h3-settle-import" },
  { id: "hy.settle.report", title: "沉降报表…", category: "HY 结构", icon: "h3-settle-report" },
  { id: "hy.sfd", title: "剪力图", category: "HY 结构", icon: "h3-sfd" },
  { id: "hy.solve", title: "求解", category: "HY 结构", icon: "h3-solve", keybinding: "F5" },
  { id: "hy.sup.fixed", title: "固定端支座", category: "HY 结构", icon: "h3-fixed" },
  { id: "hy.sup.pin", title: "固定铰支座", category: "HY 结构", icon: "h3-pinsup" },
  { id: "hy.sup.roller", title: "活动铰支座", category: "HY 结构", icon: "h3-roller" },
  { id: "hy.sup.spring", title: "弹性支座…", category: "HY 结构", icon: "h3-spring" },
  { id: "hy.udl", title: "均布荷载", category: "HY 结构", icon: "h3-udl" },
  { id: "ui.density.comfortable", title: "舒适密度", category: "外观", icon: "h3-proportions" },
  { id: "ui.density.compact", title: "紧凑密度", category: "外观", icon: "h3-list" },
  { id: "ui.density.toggle", title: "切换紧凑 / 舒适密度", category: "外观", icon: "h3-density", keybinding: "Ctrl+K D" },
  { id: "ui.theme.dark", title: "深色主题", category: "外观", icon: "h3-moon" },
  { id: "ui.theme.light", title: "浅色主题", category: "外观", icon: "h3-light" },
  { id: "ui.theme.toggle", title: "切换深色 / 浅色主题", category: "外观", icon: "h3-contrast", keybinding: "Ctrl+K T" },
  { id: "ui.skin.acad-b", title: "皮肤：AutoCAD 原生", category: "外观", icon: "h3-skin-ribbon" },
  { id: "ui.skin.hy-e", title: "皮肤：B 色深色系", category: "外观", icon: "h3-skin-dark" },
  { id: "ui.palset.auto", title: "选项板自动隐藏", category: "窗口", icon: "h3-pin" },
  { id: "ui.palset.hide", title: "关闭 HY 选项板", category: "窗口", icon: "h3-pal-hide" },
  { id: "view.bottom", title: "命令行", category: "窗口", icon: "h3-bottom", keybinding: "Ctrl+9" },
  { id: "view.left", title: "HY 选项板", category: "窗口", icon: "h3-sideleft", keybinding: "Ctrl+B" },
  { id: "view.right", title: "特性选项板", category: "窗口", icon: "h3-side-props", keybinding: "Ctrl+Alt+B" },
  { id: "rsv.viewcube", title: "视图立方", category: "三维", icon: "h3-viewcube" },
  { id: "rsv.view-front", title: "前视", category: "三维", icon: "h3-view-front" },
  { id: "rsv.view-top", title: "俯视", category: "三维", icon: "h3-view-top" },
  { id: "rsv.view-bottom", title: "仰视", category: "三维", icon: "h3-view-bottom" },
  { id: "rsv.backview", title: "后视", category: "三维", icon: "h3-backview" },
  { id: "rsv.leftview", title: "左视", category: "三维", icon: "h3-leftview" },
  { id: "rsv.rightview", title: "右视", category: "三维", icon: "h3-rightview" },
  { id: "rsv.wireframe", title: "线框", category: "三维", icon: "h3-wireframe" },
  { id: "rsv.hidden-line", title: "隐藏线", category: "三维", icon: "h3-hidden-line" },
  { id: "rsv.shaded", title: "着色", category: "三维", icon: "h3-shaded" },
  { id: "rsv.solid-box", title: "长方体", category: "三维", icon: "h3-solid-box" },
  { id: "rsv.solid-cyl", title: "圆柱", category: "三维", icon: "h3-solid-cyl" },
  { id: "rsv.solid-extrude", title: "拉伸", category: "三维", icon: "h3-solid-extrude" },
  { id: "rsv.solid-revolve", title: "旋转成体", category: "三维", icon: "h3-solid-revolve" },
];

export const hy3dFullMenus: { id: string; title: string; items: (string | "sep")[] }[] = [
  {
    "id": "file",
    "title": "文件",
    "items": [
      "file.import.dwg",
      "cad.import",
      "cad.recover",
      "cad.recoverall",
      "file.close",
      "file.export",
      "file.new",
      "file.open",
      "file.plot",
      "file.preview",
      "file.props",
      "file.save",
      "file.saveas"
    ]
  },
  {
    "id": "edit",
    "title": "编辑",
    "items": [
      "view.cursor",
      "view.cursor.selected",
      "view.cursor.to",
      "view.cursor.origin",
      "cad.to-layer",
      "edit.join",
      "cad.break",
      "cad.deselect",
      "cad.qselect",
      "cad.select",
      "cad.selall",
      "edit.cut",
      "edit.find",
      "ui.redo",
      "ui.undo",
      "edit.copy",
      "edit.paste",
      "edit.pastespec",
      "cad.select.invert",
      "cad.selinvert",
      "cad.select.circle",
      "edit.rename",
      "edit.undo.history",
      "edit.adjust",
      "edit.select.vert",
      "edit.select.edge",
      "edit.select.face"
    ]
  },
  {
    "id": "view",
    "title": "视图",
    "items": [
      "hw.cmdbar",
      "hw.toolbarpos",
      "cad.hide",
      "cad.isolate",
      "cad.regenall",
      "cad.redraw",
      "cad.unisolate",
      "cad.zoomprev",
      "cad.zoomnext",
      "ui.fullscreen",
      "ui.resetlayout",
      "cad.model",
      "cad.pspace",
      "cad.layout",
      "cad.vports",
      "cad.mview",
      "cad.view",
      "sep",
      "cad.pan",
      "cad.regen",
      "cad.zoomext",
      "cad.zoomin",
      "cad.zoomout",
      "cad.zoomsel",
      "cad.zoomwin"
    ]
  },
  {
    "id": "insert",
    "title": "插入",
    "items": [
      "cad.block",
      "cad.blockdef",
      "cad.image",
      "cad.imageclip",
      "cad.imageattach",
      "cad.xref",
      "cad.wblock",
      "cad.attdef",
      "cad.attedit",
      "cad.attsync",
      "cad.extref",
      "cad.eattedit",
      "cad.bedit",
      "cad.bsave",
      "cad.bclose"
    ]
  },
  {
    "id": "draw",
    "title": "绘图",
    "items": [
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
      "cad.solid",
      "cad.revcloud",
      "cad.hatch",
      "cad.line",
      "cad.pline",
      "cad.rect",
      "cad.text",
      "cad.mtext",
      "cad.table"
    ]
  },
  {
    "id": "ann",
    "title": "标注",
    "items": [
      "cad.dimali",
      "cad.dimang",
      "cad.dimarc",
      "cad.dimbase",
      "cad.dimcont",
      "cad.dimdia",
      "cad.dimlin",
      "cad.dimord",
      "cad.qdim",
      "cad.dim",
      "cad.dimrad",
      "cad.leader",
      "cad.qleader",
      "cad.dimedit",
      "cad.dimtedit"
    ]
  },
  {
    "id": "modify",
    "title": "修改",
    "items": [
      "cad.array",
      "cad.copy",
      "cad.erase",
      "cad.explode",
      "cad.xplode",
      "cad.extend",
      "cad.fillet",
      "cad.matchprop",
      "cad.mirror",
      "cad.move",
      "cad.offset",
      "cad.rotate",
      "cad.scale",
      "cad.trim",
      "edit.join",
      "cad.chamfer",
      "cad.break",
      "cad.stretch",
      "cad.arraypolar",
      "cad.arraypath",
      "cad.overkill",
      "cad.breakatpoint",
      "cad.lengthen",
      "cad.pedit",
      "cad.align",
      "cad.group",
      "cad.ungroup",
      "cad.draworder",
      "cad.textedit"
    ]
  },
  {
    "id": "sketch",
    "title": "草图",
    "items": [
      "cad.dyn",
      "cad.grid",
      "cad.lw",
      "cad.ortho",
      "cad.osnap",
      "cad.snapmode",
      "cad.dsettings",
      "cad.snap",
      "cad.otrack",
      "cad.polar"
    ]
  },
  {
    "id": "format",
    "title": "格式",
    "items": [
      "cad.mleaderstyle",
      "cad.tablestyle",
      "cad.dimstyle",
      "cad.linetype",
      "cad.textstyle",
      "cad.units",
      "cad.ltscale",
      "cad.color",
      "cad.lweight"
    ]
  },
  {
    "id": "layer",
    "title": "图层",
    "items": [
      "cad.layer",
      "cad.layiso",
      "cad.layuniso",
      "cad.layoff",
      "cad.layon",
      "cad.layfrz",
      "cad.laythw",
      "cad.laylck",
      "cad.laylulk",
      "cad.laycur",
      "cad.laymch",
      "cad.laywalk"
    ]
  },
  {
    "id": "tool",
    "title": "工具",
    "items": [
      "app.options",
      "cad.purge",
      "cad.appload",
      "cad.audit",
      "cad.area",
      "cad.cui",
      "cad.dc",
      "cad.dist",
      "cad.id",
      "cad.list",
      "cad.netload",
      "cad.palettes",
      "cad.props",
      "cad.wscur",
      "cad.spell"
    ]
  },
  {
    "id": "hy",
    "title": "HY 结构",
    "items": [
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
    "id": "look",
    "title": "外观",
    "items": [
      "ui.density.comfortable",
      "ui.density.compact",
      "ui.density.toggle",
      "ui.theme.dark",
      "ui.theme.light",
      "ui.theme.toggle",
      "ui.skin.acad-b",
      "ui.skin.hy-e"
    ]
  },
  {
    "id": "window",
    "title": "窗口",
    "items": [
      "ui.palset.auto",
      "ui.palset.hide",
      "view.bottom",
      "view.left",
      "view.right"
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
    "id": "solid",
    "title": "三维",
    "items": [
      "rsv.viewcube",
      "rsv.view-front",
      "rsv.view-top",
      "rsv.view-bottom",
      "rsv.backview",
      "rsv.leftview",
      "rsv.rightview",
      "rsv.wireframe",
      "rsv.hidden-line",
      "rsv.shaded",
      "rsv.solid-box",
      "rsv.solid-cyl",
      "rsv.solid-extrude",
      "rsv.solid-revolve"
    ]
  },
  {
    "id": "icons",
    "title": "更多",
    "items": [
      "view.toolshelf",
      "view.sidebar",
      "view.add",
      "cad.select.box",
      "cad.select.cycle",
      "edit.mode"
    ]
  }
];

export const hy3dFullTabs: { id: string; title: string; panels: { id: string; title: string; ids: string[] }[] }[] = [
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
          "cad.xplode",
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
          "cad.stretch",
          "cad.arraypolar",
          "cad.arraypath",
          "cad.overkill",
          "cad.breakatpoint",
          "cad.lengthen",
          "cad.pedit",
          "cad.align",
          "cad.group",
          "cad.ungroup",
          "cad.draworder",
          "cad.textedit",
          "cad.spell"
        ]
      },
      {
        "id": "注释",
        "title": "注释",
        "ids": [
          "cad.hatch",
          "cad.text",
          "cad.dimali",
          "cad.dimang",
          "cad.dimlin",
          "cad.leader"
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
      },
      {
        "id": "状态",
        "title": "状态",
        "ids": [
          "cad.dyn",
          "cad.grid",
          "cad.lw",
          "cad.ortho",
          "cad.osnap",
          "cad.otrack",
          "cad.polar"
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
          "cad.blockdef",
          "cad.image",
          "cad.imageclip",
          "cad.imageattach",
          "cad.xref",
          "cad.wblock",
          "cad.attdef",
          "cad.attedit",
          "cad.attsync",
          "cad.extref",
          "cad.eattedit",
          "cad.bedit",
          "cad.bsave",
          "cad.bclose"
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
          "ui.fullscreen",
          "ui.resetlayout",
          "view.toolshelf",
          "view.sidebar",
          "ui.density.comfortable",
          "ui.density.compact",
          "ui.density.toggle",
          "ui.theme.dark",
          "ui.theme.light",
          "ui.theme.toggle",
          "ui.skin.acad-b",
          "ui.skin.hy-e",
          "ui.palset.auto",
          "ui.palset.hide",
          "view.bottom",
          "view.left",
          "view.right"
        ]
      },
      {
        "id": "三维",
        "title": "三维",
        "ids": [
          "rsv.viewcube",
          "rsv.view-front",
          "rsv.view-top",
          "rsv.view-bottom",
          "rsv.backview",
          "rsv.leftview",
          "rsv.rightview",
          "rsv.wireframe",
          "rsv.hidden-line",
          "rsv.shaded",
          "rsv.solid-box",
          "rsv.solid-cyl",
          "rsv.solid-extrude",
          "rsv.solid-revolve"
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
  },
  {
    "id": "更多",
    "title": "更多",
    "panels": [
      {
        "id": "绘图",
        "title": "绘图",
        "ids": [
          "cad.solid",
          "cad.revcloud",
          "cad.mtext"
        ]
      },
      {
        "id": "图层",
        "title": "图层",
        "ids": [
          "cad.layiso",
          "cad.layuniso",
          "cad.layoff",
          "cad.layon",
          "cad.layfrz",
          "cad.laythw",
          "cad.laylck",
          "cad.laylulk",
          "cad.laycur",
          "cad.laymch",
          "cad.laywalk"
        ]
      },
      {
        "id": "阶段 3",
        "title": "阶段 3",
        "ids": [
          "view.cursor",
          "view.cursor.selected",
          "view.cursor.to",
          "view.cursor.origin",
          "view.add",
          "edit.mode",
          "edit.select.vert",
          "edit.select.edge",
          "edit.select.face"
        ]
      },
      {
        "id": "以后再定",
        "title": "以后再定",
        "ids": [
          "cad.appload",
          "cad.dc",
          "cad.netload",
          "cad.palettes",
          "cad.props",
          "cad.wscur",
          "edit.rename",
          "edit.undo.history"
        ]
      },
      {
        "id": "编辑",
        "title": "编辑",
        "ids": [
          "cad.select",
          "cad.selinvert"
        ]
      },
      {
        "id": "标注",
        "title": "标注",
        "ids": [
          "cad.dimarc",
          "cad.dimbase",
          "cad.dimcont",
          "cad.dimdia",
          "cad.dimord",
          "cad.qdim",
          "cad.dim",
          "cad.dimrad",
          "cad.qleader",
          "cad.dimedit",
          "cad.dimtedit",
          "cad.mleaderstyle",
          "cad.tablestyle",
          "cad.table"
        ]
      },
      {
        "id": "草图",
        "title": "草图",
        "ids": [
          "cad.snapmode",
          "cad.dsettings",
          "cad.snap"
        ]
      },
      {
        "id": "格式",
        "title": "格式",
        "ids": [
          "cad.ltscale",
          "cad.color",
          "cad.lweight"
        ]
      },
      {
        "id": "工具",
        "title": "工具",
        "ids": [
          "cad.purge",
          "cad.audit",
          "cad.id",
          "cad.list"
        ]
      },
      {
        "id": "视图",
        "title": "视图",
        "ids": [
          "cad.regenall",
          "cad.redraw",
          "cad.zoomprev",
          "cad.zoomnext",
          "cad.model",
          "cad.pspace",
          "cad.layout",
          "cad.vports",
          "cad.mview",
          "cad.view"
        ]
      },
      {
        "id": "文件",
        "title": "文件",
        "ids": [
          "cad.import",
          "cad.recover",
          "cad.recoverall",
          "file.preview"
        ]
      }
    ]
  }
];
