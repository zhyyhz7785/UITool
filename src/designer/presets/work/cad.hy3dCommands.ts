/** 由 scripts/gen-hy3d-commands.mjs 从 hy3d ui/design、ui/commands、ui/keymap.json 和 ui/icons.svg 生成。勿手改。 */
export interface Hy3dCmd { id: string; title: string; category: string; icon: string; keybinding?: string }
export const hy3dCommands: Hy3dCmd[] = [
  { id: "file.import.dwg", title: "导入 DWG…", category: "文件", icon: "h3-import-dwg" },
  { id: "cad.import", title: "导入…", category: "文件", icon: "h3-import" },
  { id: "cad.recover", title: "恢复…", category: "文件", icon: "h3-recover" },
  { id: "cad.recoverall", title: "全部恢复…", category: "文件", icon: "h3-recover-all" },
  { id: "cad.drawingrecovery", title: "图形修复管理器…", category: "文件", icon: "h3-open" },
  { id: "cad.drawingrecovery.cli", title: "-DRAWINGRECOVERY 命令行", category: "文件", icon: "h3-open" },
  { id: "file.close", title: "关闭", category: "文件", icon: "h3-close", keybinding: "Ctrl+F4" },
  { id: "file.export", title: "输出…", category: "文件", icon: "h3-export" },
  { id: "file.new", title: "新建…", category: "文件", icon: "h3-new", keybinding: "Ctrl+N" },
  { id: "file.open", title: "打开…", category: "文件", icon: "h3-open", keybinding: "Ctrl+O" },
  { id: "file.plot", title: "打印…", category: "文件", icon: "h3-print", keybinding: "Ctrl+P" },
  { id: "file.exportpdf", title: "输出 PDF…", category: "文件", icon: "h3-export" },
  { id: "file.pagesetup", title: "页面设置管理器…", category: "文件", icon: "h3-print" },
  { id: "file.publish", title: "批量打印…", category: "文件", icon: "h3-print" },
  { id: "file.preview", title: "打印预览…", category: "文件", icon: "h3-preview" },
  { id: "file.props", title: "图形特性…", category: "文件", icon: "h3-file-props" },
  { id: "file.props.cli", title: "-DWGPROPS 命令行", category: "文件", icon: "h3-info" },
  { id: "file.stylesmanager", title: "打印样式表管理器…", category: "文件", icon: "h3-print" },
  { id: "file.save", title: "保存", category: "文件", icon: "h3-save", keybinding: "Ctrl+S" },
  { id: "file.commit", title: "提交", category: "文件", icon: "h3-save", keybinding: "Ctrl+Alt+C" },
  { id: "file.hydconflict", title: "历史对不上时的选择", category: "文件", icon: "h3-save" },
  { id: "file.savecmd", title: "保存（SAVE，总问文件名）…", category: "文件", icon: "h3-saveas" },
  { id: "file.filedia", title: "FILEDIA（文件对话框开关）", category: "文件", icon: "h3-settings" },
  { id: "file.saveas", title: "另存为…", category: "文件", icon: "h3-saveas", keybinding: "Ctrl+Shift+S" },
  { id: "cad.recover.cli", title: "恢复（命令行）", category: "文件", icon: "h3-open" },
  { id: "cad.recoverall.cli", title: "全部恢复（命令行）", category: "文件", icon: "h3-open" },
  { id: "file.export.cli", title: "输出（命令行）", category: "文件", icon: "h3-export" },
  { id: "file.stylesmanager.cli", title: "打印样式表管理器（命令行）", category: "文件", icon: "h3-print" },
  { id: "file.timeline", title: "时间轴（只读）", category: "文件", icon: "h3-preview" },
  { id: "file.ledgerdiff", title: "账本比较（只读）", category: "文件", icon: "h3-preview" },
  { id: "file.historybrowse", title: "图纸历史（只读）", category: "文件", icon: "h3-preview" },
  { id: "cad.import.cli", title: "导入（命令行）", category: "文件", icon: "h3-import" },
  { id: "hw.cmdbar", title: "命令栏 开/关", category: "视图", icon: "h3-terminal" },
  { id: "hw.toolbarpos", title: "工具栏 上侧/侧面", category: "视图", icon: "h3-rows2" },
  { id: "cad.hide", title: "隐藏对象", category: "视图", icon: "h3-hidden" },
  { id: "cad.isolate", title: "隔离对象", category: "视图", icon: "h3-solo" },
  { id: "cad.pan", title: "平移", category: "视图", icon: "h3-pan" },
  { id: "cad.ucs", title: "UCS", category: "视图", icon: "h3-pan" },
  { id: "cad.pan.points", title: "两点平移", category: "视图", icon: "h3-pan" },
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
  { id: "cad.mspace", title: "视口模型空间", category: "视图", icon: "layout" },
  { id: "cad.layout", title: "布局…", category: "视图", icon: "h3-layout-mgr" },
  { id: "cad.layout.cli", title: "布局（命令行）", category: "视图", icon: "layout" },
  { id: "cad.vports", title: "视口配置", category: "视图", icon: "h3-vports" },
  { id: "cad.vpclip", title: "视口裁剪", category: "视图", icon: "h3-mview" },
  { id: "cad.vplayer", title: "视口图层控制", category: "视图", icon: "h3-mview" },
  { id: "cad.chspace", title: "转换模型与图纸空间", category: "视图", icon: "h3-mview" },
  { id: "cad.mview", title: "布局视口", category: "视图", icon: "h3-mview" },
  { id: "cad.view", title: "命名视图", category: "视图", icon: "h3-zoomwin" },
  { id: "cad.vpmax", title: "最大化视口", category: "视图", icon: "h3-zoomwin" },
  { id: "cad.vpmin", title: "最小化视口", category: "视图", icon: "h3-view-named" },
  { id: "cad.layoutvp", title: "视口设置…", category: "视图", icon: "h3-mview" },
  { id: "cad.script", title: "运行脚本…", category: "工具", icon: "h3-open" },
  { id: "cad.rscript", title: "重新运行脚本", category: "工具", icon: "h3-open" },
  { id: "cad.resume", title: "继续脚本", category: "工具", icon: "play" },
  { id: "app.options", title: "选项…", category: "工具", icon: "h3-settings", keybinding: "Ctrl+," },
  { id: "app.options.cli", title: "命令行选项（-OPTIONS）", category: "工具", icon: "h3-settings" },
  { id: "cad.aliasedit", title: "编辑别名（acad.pgp）…", category: "工具", icon: "h3-list" },
  { id: "cad.purge", title: "清理…", category: "工具", icon: "h3-purge" },
  { id: "cad.purge.cli", title: "清理（命令行）", category: "工具", icon: "h3-delete" },
  { id: "cad.appload", title: "加载应用程序…", category: "工具", icon: "h3-plug" },
  { id: "cad.audit", title: "核查…", category: "工具", icon: "h3-audit" },
  { id: "cad.massprop", title: "面域/质量特性（二维）", category: "工具", icon: "check" },
  { id: "cad.status", title: "图情", category: "工具", icon: "check" },
  { id: "cad.time", title: "时间", category: "工具", icon: "check" },
  { id: "cad.area", title: "面积", category: "工具", icon: "h3-area" },
  { id: "cad.cui", title: "界面设置…", category: "工具", icon: "h3-wrench" },
  { id: "cad.dc", title: "设计中心", category: "工具", icon: "h3-library", keybinding: "Ctrl+2" },
  { id: "cad.compare", title: "图形对比", category: "工具", icon: "h3-dist" },
  { id: "cad.diff", title: "图纸对比视图", category: "工具", icon: "h3-contrast" },
  { id: "cad.dist", title: "测量距离", category: "工具", icon: "h3-dist" },
  { id: "cad.id", title: "点坐标", category: "工具", icon: "h3-id-point" },
  { id: "cad.measuregeom", title: "测量", category: "工具", icon: "h3-dist" },
  { id: "cad.list", title: "列表", category: "工具", icon: "h3-list-obj" },
  { id: "cad.netload", title: "NETLOAD hy-cad-tool", category: "工具", icon: "h3-netload" },
  { id: "cad.palettes", title: "工具选项板", category: "工具", icon: "h3-grid2", keybinding: "Ctrl+3" },
  { id: "cad.props", title: "特性", category: "工具", icon: "h3-props", keybinding: "Ctrl+1" },
  { id: "cad.wscur", title: "工作空间：草图与注释", category: "工具", icon: "h3-app" },
  { id: "cad.wscur.cli", title: "保存工作空间（命令行）", category: "工具", icon: "h3-app" },
  { id: "cad.setvar", title: "设置变量", category: "工具", icon: "h3-settings" },
  { id: "cad.audit.cli", title: "核查（命令行）", category: "工具", icon: "check" },
  { id: "cad.arrayedit", title: "编辑阵列", category: "修改", icon: "h3-array" },
  { id: "cad.array", title: "矩形阵列", category: "修改", icon: "h3-array" },
  { id: "cad.arraytype", title: "阵列", category: "修改", icon: "h3-array" },
  { id: "cad.copy", title: "复制", category: "修改", icon: "h3-copy-geom" },
  { id: "cad.erase", title: "删除", category: "修改", icon: "h3-delete", keybinding: "Del" },
  { id: "cad.oops", title: "恢复删除", category: "修改", icon: "h3-undo" },
  { id: "cad.explode", title: "分解", category: "修改", icon: "h3-explode" },
  { id: "cad.xplode", title: "分解并指定特性", category: "修改", icon: "h3-xplode" },
  { id: "cad.extend", title: "延伸", category: "修改", icon: "h3-extend" },
  { id: "cad.blend", title: "光顺曲线", category: "修改", icon: "h3-fillet" },
  { id: "cad.fillet", title: "圆角", category: "修改", icon: "h3-fillet" },
  { id: "cad.matchprop", title: "特性匹配", category: "修改", icon: "h3-matchprop" },
  { id: "cad.mirror", title: "镜像", category: "修改", icon: "h3-mirror", keybinding: "Ctrl+M" },
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
  { id: "cad.overkill.cli", title: "删除重复对象（命令行）", category: "修改", icon: "h3-trim" },
  { id: "cad.splinedit", title: "编辑样条曲线", category: "修改", icon: "h3-spline" },
  { id: "cad.breakatpoint", title: "打断于点", category: "修改", icon: "h3-breakat" },
  { id: "cad.lengthen", title: "拉长", category: "修改", icon: "h3-lengthen" },
  { id: "cad.pedit", title: "多段线编辑", category: "修改", icon: "h3-pedit" },
  { id: "cad.align", title: "对齐", category: "修改", icon: "h3-align" },
  { id: "cad.group", title: "编组", category: "修改", icon: "h3-group" },
  { id: "cad.ungroup", title: "解除编组", category: "修改", icon: "h3-ungroup" },
  { id: "cad.draworder", title: "绘图次序", category: "修改", icon: "h3-front" },
  { id: "cad.texttofront", title: "文字前置", category: "修改", icon: "h3-front" },
  { id: "cad.txt2mtxt", title: "单行转多行", category: "修改", icon: "h3-mtext" },
  { id: "cad.hatchtoback", title: "填充置后", category: "修改", icon: "h3-hatch" },
  { id: "cad.setbylayer", title: "改随层", category: "修改", icon: "h3-layer" },
  { id: "cad.copytolayer", title: "复制到图层", category: "修改", icon: "h3-copy" },
  { id: "cad.chprop", title: "特性修改", category: "修改", icon: "h3-props" },
  { id: "cad.transparency", title: "透明度", category: "修改", icon: "h3-props" },
  { id: "cad.count", title: "计数", category: "修改", icon: "hash" },
  { id: "cad.hatchedit", title: "编辑图案填充…", category: "修改", icon: "h3-hatch" },
  { id: "cad.reverse", title: "反转", category: "修改", icon: "h3-rotate" },
  { id: "cad.block", title: "插入块…", category: "插入", icon: "h3-block-ins" },
  { id: "cad.blockdef", title: "创建块", category: "插入", icon: "h3-block" },
  { id: "cad.blockdef.cli", title: "创建块(命令行)", category: "插入", icon: "h3-block" },
  { id: "cad.image", title: "图像管理器…", category: "插入", icon: "h3-image" },
  { id: "cad.imageclip", title: "图像剪裁", category: "插入", icon: "h3-image-clip" },
  { id: "cad.imageclip.cli", title: "图像剪裁（命令行）", category: "插入", icon: "h3-image-clip" },
  { id: "cad.imageadjust", title: "调整图像…", category: "插入", icon: "h3-image" },
  { id: "cad.imageadjust.cli", title: "调整图像（命令行）", category: "插入", icon: "h3-image" },
  { id: "cad.imageattach", title: "附着图像…", category: "插入", icon: "h3-image-attach" },
  { id: "cad.imageattach.cli", title: "附着图像（命令行）", category: "插入", icon: "h3-image-attach" },
  { id: "cad.pdfattach", title: "附着 PDF 参考底图…", category: "插入", icon: "h3-image" },
  { id: "cad.xref", title: "外部参照…", category: "插入", icon: "h3-xref" },
  { id: "cad.xref.cli", title: "外部参照（命令行）", category: "插入", icon: "h3-xref" },
  { id: "cad.xbind", title: "绑定外部参照", category: "插入", icon: "link" },
  { id: "cad.xopen", title: "打开外部参照", category: "插入", icon: "link" },
  { id: "cad.rename", title: "重命名…", category: "插入", icon: "h3-pen" },
  { id: "cad.xclip", title: "裁剪外部参照", category: "插入", icon: "link" },
  { id: "cad.pdfimport", title: "PDF 导入", category: "插入", icon: "link" },
  { id: "cad.wblock", title: "写块…", category: "插入", icon: "h3-wblock" },
  { id: "cad.wblock.cli", title: "写块（命令行）", category: "插入", icon: "h3-wblock" },
  { id: "cad.attdef", title: "定义属性…", category: "插入", icon: "h3-att-def" },
  { id: "cad.attdef.cli", title: "定义属性（命令行）", category: "插入", icon: "h3-text" },
  { id: "cad.attedit", title: "编辑属性…", category: "插入", icon: "h3-att-edit" },
  { id: "cad.attedit.cli", title: "-ATTEDIT 命令行", category: "插入", icon: "h3-text" },
  { id: "cad.attsync", title: "同步属性", category: "插入", icon: "h3-att-sync" },
  { id: "cad.attsync.cli", title: "-ATTSYNC 命令行", category: "插入", icon: "h3-text" },
  { id: "cad.extref", title: "外部参照管理器…", category: "插入", icon: "h3-xref-mgr" },
  { id: "cad.eattedit", title: "增强属性编辑器…", category: "插入", icon: "h3-att-eatt" },
  { id: "cad.eattedit.cli", title: "增强属性编辑器（命令行）", category: "插入", icon: "h3-text" },
  { id: "cad.attdisp", title: "属性显示", category: "插入", icon: "h3-text" },
  { id: "cad.blockpalette", title: "块选项板…", category: "插入", icon: "h3-import" },
  { id: "cad.attipedit", title: "在位编辑属性", category: "插入", icon: "h3-text" },
  { id: "cad.battman", title: "块属性管理器…", category: "插入", icon: "h3-text" },
  { id: "cad.base", title: "基点", category: "插入", icon: "h3-pen" },
  { id: "cad.refedit", title: "在位编辑参照", category: "插入", icon: "h3-pen" },
  { id: "cad.refclose", title: "退出块编辑", category: "插入", icon: "h3-pen" },
  { id: "cad.block.inplace.remove", title: "移出块", category: "插入", icon: "h3-pen" },
  { id: "cad.block.inplace.edit", title: "编辑块定义", category: "插入", icon: "h3-pen" },
  { id: "cad.block.inplace.add", title: "加入块", category: "插入", icon: "h3-pen" },
  { id: "cad.block.inplace.close", title: "退出块编辑", category: "插入", icon: "h3-block-close" },
  { id: "cad.bedit", title: "块编辑器…", category: "插入", icon: "h3-pen" },
  { id: "cad.bsave", title: "保存块定义", category: "插入", icon: "h3-block-save" },
  { id: "cad.bsaveas", title: "块另存为…", category: "插入", icon: "check" },
  { id: "cad.bclose", title: "关闭块编辑器", category: "插入", icon: "h3-block-close" },
  { id: "cad.xattach", title: "附着外部参照", category: "插入", icon: "link" },
  { id: "cad.bsaveas.cli", title: "块另存为（命令行）", category: "插入", icon: "check" },
  { id: "cad.blockpalette.cli", title: "块选项板（命令行）", category: "插入", icon: "h3-import" },
  { id: "cad.region", title: "面域", category: "绘图", icon: "h3-hatch" },
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
  { id: "cad.wipeout", title: "区域覆盖", category: "绘图", icon: "h3-rect" },
  { id: "cad.revcloud", title: "修订云线", category: "绘图", icon: "h3-revcloud" },
  { id: "cad.gradient", title: "渐变色", category: "绘图", icon: "h3-hatch" },
  { id: "cad.hatch", title: "图案填充…", category: "绘图", icon: "h3-hatch" },
  { id: "cad.line", title: "直线", category: "绘图", icon: "h3-line" },
  { id: "cad.pline", title: "多段线", category: "绘图", icon: "h3-pline" },
  { id: "cad.rect", title: "矩形", category: "绘图", icon: "h3-rect" },
  { id: "cad.text", title: "单行文字", category: "绘图", icon: "h3-text" },
  { id: "cad.mtext", title: "多行文字", category: "绘图", icon: "h3-mtext" },
  { id: "view.add", title: "添加", category: "绘图", icon: "h3-plus" },
  { id: "cad.boundary", title: "边界…", category: "绘图", icon: "h3-pline" },
  { id: "cad.mline", title: "多线", category: "绘图", icon: "h3-pline" },
  { id: "cad.deselect", title: "取消选择", category: "编辑", icon: "h3-none" },
  { id: "cad.qselect", title: "快速选择…", category: "编辑", icon: "h3-filter" },
  { id: "cad.select", title: "选择对象", category: "编辑", icon: "h3-select" },
  { id: "cad.selall", title: "全选", category: "编辑", icon: "h3-all", keybinding: "Ctrl+A" },
  { id: "edit.cut", title: "剪切", category: "编辑", icon: "h3-cut", keybinding: "Ctrl+X" },
  { id: "edit.find", title: "查找…", category: "编辑", icon: "h3-find", keybinding: "Ctrl+F" },
  { id: "cad.find", title: "查找和替换", category: "编辑", icon: "h3-find" },
  { id: "ui.redo", title: "重做", category: "编辑", icon: "h3-redo", keybinding: "Ctrl+Y" },
  { id: "ui.undo", title: "撤销", category: "编辑", icon: "h3-undo", keybinding: "Ctrl+Z" },
  { id: "edit.copy", title: "复制", category: "编辑", icon: "h3-copy", keybinding: "Ctrl+C" },
  { id: "edit.copybase", title: "带基点复制", category: "编辑", icon: "h3-copy", keybinding: "Ctrl+Shift+C" },
  { id: "edit.paste", title: "粘贴", category: "编辑", icon: "h3-paste", keybinding: "Ctrl+V" },
  { id: "edit.pastespec", title: "粘贴到原坐标", category: "编辑", icon: "h3-pastespec" },
  { id: "edit.pasteblock", title: "粘贴为块", category: "编辑", icon: "h3-paste", keybinding: "Ctrl+Shift+V" },
  { id: "cad.select.invert", title: "反选", category: "编辑", icon: "h3-invert" },
  { id: "cad.selinvert", title: "反选", category: "编辑", icon: "h3-invert-all", keybinding: "Ctrl+I" },
  { id: "cad.select.box", title: "框选", category: "编辑", icon: "h3-boxsel" },
  { id: "cad.select.circle", title: "圈选", category: "编辑", icon: "h3-circlesel" },
  { id: "cad.select.cycle", title: "选择循环", category: "编辑", icon: "h3-cycle" },
  { id: "edit.mode", title: "切换对象/编辑模式", category: "编辑", icon: "h3-mode" },
  { id: "edit.rename", title: "重命名", category: "编辑", icon: "h3-rename" },
  { id: "edit.undo.history", title: "撤销历史", category: "编辑", icon: "h3-recent", keybinding: "Ctrl+Alt+Z" },
  { id: "edit.adjust", title: "调整上一步", category: "编辑", icon: "h3-sliders", keybinding: "F9" },
  { id: "edit.select.vert", title: "顶点选择", category: "编辑", icon: "h3-vert" },
  { id: "edit.select.edge", title: "边选择", category: "编辑", icon: "h3-edge" },
  { id: "edit.select.face", title: "面选择", category: "编辑", icon: "h3-face" },
  { id: "cad.ddedit", title: "命令行编辑文字", category: "修改", icon: "h3-text" },
  { id: "cad.textedit", title: "编辑文字", category: "修改", icon: "h3-text-edit" },
  { id: "cad.spell", title: "拼写检查", category: "修改", icon: "h3-spell" },
  { id: "cad.selectsimilar", title: "选择相似", category: "编辑", icon: "h3-filter" },
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
  { id: "cad.tolerance", title: "公差", category: "标注", icon: "h3-tolerance" },
  { id: "cad.leader", title: "多重引线", category: "标注", icon: "h3-leader" },
  { id: "cad.qleader", title: "快速引线", category: "标注", icon: "h3-leader-quick" },
  { id: "cad.mleaderalign", title: "多重引线对齐", category: "标注", icon: "h3-leader" },
  { id: "cad.mleaderedit", title: "多重引线编辑", category: "标注", icon: "h3-leader" },
  { id: "cad.mleadercollect", title: "合并多重引线", category: "标注", icon: "h3-leader" },
  { id: "cad.dimedit", title: "标注编辑", category: "标注", icon: "h3-dim-edit" },
  { id: "cad.dimtedit", title: "标注文字位置", category: "标注", icon: "h3-dim-text" },
  { id: "cad.dimupdate", title: "标注更新", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimregen", title: "更新关联标注", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimoverride", title: "标注替代", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimspace", title: "调整间距", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimbreak", title: "标注打断", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimjogged", title: "折弯半径标注", category: "标注", icon: "h3-dimlin" },
  { id: "cad.mleaderstyle", title: "多重引线样式", category: "标注", icon: "h3-leader-style" },
  { id: "cad.tablestyle", title: "表格样式", category: "标注", icon: "h3-table-style" },
  { id: "cad.table", title: "表格", category: "标注", icon: "h3-table" },
  { id: "cad.centermark", title: "中心标记（非关联）", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimcenter", title: "圆心标记（非关联）", category: "标注", icon: "h3-dimlin" },
  { id: "cad.centerline", title: "中心线（非关联）", category: "标注", icon: "h3-dimlin" },
  { id: "cad.tabledit", title: "编辑表格单元", category: "标注", icon: "h3-text" },
  { id: "cad.field", title: "域…", category: "标注", icon: "h3-text" },
  { id: "cad.updatefield", title: "更新域", category: "标注", icon: "h3-text" },
  { id: "cad.dimtol", title: "标注公差开关", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimlim", title: "极限尺寸开关", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimassoc", title: "标注关联", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimreassociate", title: "重新关联标注", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimdisassociate", title: "取消标注关联", category: "标注", icon: "h3-dimlin" },
  { id: "cad.dimstyle", title: "标注样式…", category: "格式", icon: "h3-dimstyle" },
  { id: "cad.mlstyle", title: "多线样式…", category: "格式", icon: "h3-pline" },
  { id: "cad.linetype", title: "线型…", category: "格式", icon: "h3-linetype" },
  { id: "cad.scaletext", title: "缩放文字…", category: "修改", icon: "h3-text" },
  { id: "cad.scaletext.cli", title: "-SCALETEXT 命令行缩放文字", category: "修改", icon: "h3-text" },
  { id: "cad.justifytext", title: "对正文字…", category: "修改", icon: "h3-text" },
  { id: "cad.textalign", title: "文字对齐…", category: "修改", icon: "h3-text" },
  { id: "cad.textalign.cli", title: "-TEXTALIGN 命令行文字对齐", category: "修改", icon: "h3-text" },
  { id: "cad.textstyle", title: "文字样式…", category: "格式", icon: "h3-text-style" },
  { id: "cad.units", title: "单位…", category: "格式", icon: "h3-ruler2" },
  { id: "cad.units.cli", title: "-UNITS 命令行单位", category: "格式", icon: "h3-ruler2" },
  { id: "cad.ltscale", title: "线型比例…", category: "格式", icon: "h3-ltscale" },
  { id: "cad.color", title: "颜色…", category: "格式", icon: "h3-color" },
  { id: "cad.color_cmdline", title: "颜色（命令行）", category: "格式", icon: "h3-layer" },
  { id: "cad.lweight", title: "线宽…", category: "格式", icon: "h3-lweight" },
  { id: "cad.lweight_cmdline", title: "线宽（命令行）", category: "格式", icon: "h3-pline" },
  { id: "cad.imageframe", title: "图像边框…", category: "格式", icon: "h3-image" },
  { id: "cad.wipeoutframe", title: "区域覆盖边框…", category: "格式", icon: "h3-wipeout" },
  { id: "cad.wipeoutframe.cli", title: "区域覆盖边框（命令行）", category: "格式", icon: "h3-wipeout" },
  { id: "cad.imagequality", title: "图像质量…", category: "格式", icon: "h3-image" },
  { id: "cad.imagequality.cli", title: "图像质量（命令行）", category: "格式", icon: "h3-image" },
  { id: "cad.fieldeval", title: "域求值…", category: "格式", icon: "h3-text" },
  { id: "cad.fielddisplay", title: "域显示…", category: "格式", icon: "h3-text" },
  { id: "cad.fontmap", title: "字体映射表…", category: "格式", icon: "h3-text" },
  { id: "cad.linetype.cli", title: "线型（命令行）", category: "格式", icon: "h3-pline" },
  { id: "cad.textstyle.cli", title: "文字样式（命令行）", category: "格式", icon: "h3-text" },
  { id: "cad.ltscale.cli", title: "线型比例（命令行）", category: "格式", icon: "h3-pline" },
  { id: "cad.imageframe.cli", title: "图像边框（命令行）", category: "格式", icon: "h3-image" },
  { id: "cad.justifytext.cli", title: "-JUSTIFYTEXT 命令行对正文字", category: "修改", icon: "h3-text" },
  { id: "cad.celtscale", title: "实体线型比例", category: "格式", icon: "h3-pline" },
  { id: "cad.psltscale", title: "图纸空间线型比例", category: "格式", icon: "h3-pline" },
  { id: "cad.dimstyle.cli", title: "标注样式（命令行）", category: "格式", icon: "h3-dimstyle" },
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
  { id: "cad.polarang", title: "极轴增量角…", category: "草图", icon: "h3-polar" },
  { id: "cad.layer", title: "图层特性管理器", category: "图层", icon: "h3-layer" },
  { id: "cad.layiso", title: "图层隔离", category: "图层", icon: "h3-layer-iso" },
  { id: "cad.layuniso", title: "图层取消隔离", category: "图层", icon: "h3-layer-uniso" },
  { id: "cad.layoff", title: "图层关闭", category: "图层", icon: "h3-layer-off" },
  { id: "cad.layon", title: "图层打开", category: "图层", icon: "h3-layer-on" },
  { id: "cad.layfrz", title: "图层冻结", category: "图层", icon: "h3-layer-frz" },
  { id: "cad.laythw", title: "图层解冻", category: "图层", icon: "h3-layer-thw" },
  { id: "cad.laylck", title: "图层锁定", category: "图层", icon: "h3-layer-lck" },
  { id: "cad.laylulk", title: "图层解锁", category: "图层", icon: "h3-layer-ulk" },
  { id: "cad.laylulk.cli", title: "图层解锁（命令行）", category: "图层", icon: "h3-layer" },
  { id: "cad.laycur", title: "更改为当前图层", category: "图层", icon: "h3-layer-cur" },
  { id: "cad.laymcur", title: "将对象的图层置为当前", category: "图层", icon: "h3-layer" },
  { id: "cad.laymch", title: "图层匹配", category: "图层", icon: "h3-layer-mch" },
  { id: "cad.laywalk", title: "图层浏览", category: "图层", icon: "h3-layer-walk" },
  { id: "cad.laydel", title: "删除图层", category: "图层", icon: "h3-delete" },
  { id: "cad.laydel.cli", title: "删除图层（命令行）", category: "图层", icon: "h3-delete" },
  { id: "cad.layerp", title: "上一个图层", category: "图层", icon: "h3-layer" },
  { id: "cad.layerpmode", title: "上一个图层模式", category: "图层", icon: "h3-layer" },
  { id: "cad.layer.cli", title: "图层（命令行）", category: "图层", icon: "h3-layer" },
  { id: "cad.laymrg", title: "图层合并", category: "图层", icon: "h3-layer" },
  { id: "cad.layerstate", title: "图层状态管理器", category: "图层", icon: "h3-layer" },
  { id: "cad.layerstate.cli", title: "图层状态（命令行）", category: "图层", icon: "h3-layer" },
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
  { id: "ui.theme.dark", title: "黑色主题", category: "外观", icon: "h3-moon" },
  { id: "ui.theme.blue", title: "蓝色主题", category: "外观", icon: "h3-contrast" },
  { id: "ui.theme.light", title: "浅色主题", category: "外观", icon: "h3-light" },
  { id: "ui.theme.toggle", title: "切换黑色 / 蓝色 / 浅色", category: "外观", icon: "h3-contrast", keybinding: "Ctrl+K T" },
  { id: "ui.skin.acad-b", title: "皮肤：AutoCAD 原生", category: "外观", icon: "h3-skin-ribbon" },
  { id: "ui.skin.hy-e", title: "皮肤：B 色深色系", category: "外观", icon: "h3-skin-dark" },
  { id: "ui.palset.auto", title: "选项板自动隐藏", category: "窗口", icon: "h3-pin" },
  { id: "ui.palset.hide", title: "关闭 HY 选项板", category: "窗口", icon: "h3-pal-hide" },
  { id: "view.bottom", title: "命令行", category: "窗口", icon: "h3-bottom", keybinding: "Ctrl+9" },
  { id: "view.left", title: "HY 选项板", category: "窗口", icon: "h3-sideleft", keybinding: "Ctrl+B" },
  { id: "view.right", title: "特性选项板", category: "窗口", icon: "h3-side-props", keybinding: "Ctrl+Alt+B" },
  { id: "manifest.highlight", title: "比对高亮", category: "窗口", icon: "layout" },
  { id: "manifest.commit", title: "提交规范文本", category: "窗口", icon: "layout" },
  { id: "cad.te.style", title: "样式", category: "文字编辑器", icon: "h3-text-style" },
  { id: "cad.te.height", title: "字高", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.mask", title: "背景遮罩", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.bold", title: "粗体", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.italic", title: "斜体", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.under", title: "下划线", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.over", title: "上划线", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.strike", title: "删除线", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.font", title: "字体", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.color", title: "颜色", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.oblique", title: "倾斜角", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.track", title: "追踪", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.width", title: "宽度因子", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.sup", title: "上标", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.sub", title: "下标", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.stack", title: "堆叠", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.clear", title: "清除格式", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.left", title: "左对齐", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.center", title: "居中", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.right", title: "右对齐", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.justify", title: "两端对齐", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.distribute", title: "分散对齐", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.columns", title: "分栏", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.colbreak", title: "分栏符", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.symbol", title: "符号", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.field", title: "字段", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.find", title: "查找替换", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.import", title: "输入文字", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.caps", title: "全部大写", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.case", title: "改变大小写", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.ruler", title: "标尺", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.view", title: "分页/流式", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.back", title: "撤销编辑", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.again", title: "重做编辑", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.more", title: "编辑器设置", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.te.close", title: "关闭文字编辑器", category: "文字编辑器", icon: "h3-text" },
  { id: "cad.geomconstraint", title: "几何约束", category: "参数", icon: "h3-dimlin" },
  { id: "cad.dimconstraint", title: "标注约束", category: "参数", icon: "h3-dimlin" },
  { id: "cad.autoconstrain", title: "自动约束", category: "参数", icon: "h3-dimlin" },
  { id: "cad.parameters", title: "参数管理器", category: "参数", icon: "h3-dimlin" },
  { id: "cad.delconstraint", title: "删除约束", category: "参数", icon: "h3-dimlin" },
  { id: "cad.constraintbar", title: "约束栏", category: "参数", icon: "h3-dimlin" },
];

export const hy3dMenus: { id: string; title: string; items: (string | "sep")[] }[] = [
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
      "file.exportpdf",
      "file.pagesetup",
      "file.publish",
      "file.preview",
      "file.props",
      "file.save",
      "file.saveas",
      "file.savecmd",
      "file.stylesmanager"
    ]
  },
  {
    "id": "edit",
    "title": "编辑",
    "items": [
      "cad.deselect",
      "cad.qselect",
      "cad.selall",
      "cad.select",
      "cad.selectsimilar",
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
      "view.cursor",
      "view.cursor.selected",
      "view.cursor.to",
      "view.cursor.origin",
      "edit.rename",
      "cad.to-layer",
      "edit.join",
      "cad.chamfer",
      "cad.break",
      "cad.stretch",
      "edit.undo.history",
      "edit.adjust",
      "edit.select.vert",
      "edit.select.edge",
      "edit.select.face",
      "cad.find"
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
      "cad.unisolate",
      "ui.fullscreen",
      "ui.resetlayout",
      "sep",
      "cad.pan",
      "cad.ucs",
      "cad.regen",
      "cad.zoomext",
      "cad.zoomin",
      "cad.zoomout",
      "cad.zoomprev",
      "cad.zoomnext",
      "cad.zoomsel",
      "cad.zoomwin",
      "sep",
      "cad.layout",
      "cad.mview",
      "cad.mspace",
      "cad.pspace",
      "cad.vpmax",
      "cad.vpmin"
    ]
  },
  {
    "id": "insert",
    "title": "插入",
    "items": [
      "cad.blockdef",
      "cad.block",
      "cad.wblock",
      "cad.bedit",
      "cad.bsave",
      "cad.bsaveas",
      "cad.bclose",
      "cad.base",
      "cad.image",
      "cad.imageattach",
      "cad.pdfattach",
      "cad.imageclip",
      "cad.imageadjust",
      "cad.xref",
      "cad.xattach",
      "cad.xbind",
      "cad.xopen",
      "cad.xclip",
      "cad.attdef",
      "cad.attedit",
      "cad.eattedit",
      "cad.attdisp"
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
      "cad.hatch",
      "cad.boundary",
      "cad.region",
      "cad.wipeout",
      "cad.mline",
      "cad.revcloud",
      "cad.line",
      "cad.pline",
      "cad.rect",
      "cad.text",
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
      "cad.dimedit",
      "cad.dimtedit",
      "cad.dimupdate",
      "cad.dimregen",
      "cad.dimoverride",
      "cad.dimspace",
      "cad.dimbreak",
      "cad.dimjogged",
      "cad.dimcenter",
      "cad.leader",
      "cad.mleadercollect",
      "cad.mleaderalign",
      "cad.mleaderedit",
      "cad.qleader",
      "cad.dimassoc",
      "cad.dimdisassociate",
      "cad.dimreassociate",
      "cad.dimlim",
      "cad.dimtol",
      "cad.tolerance",
      "cad.field",
      "cad.updatefield"
    ]
  },
  {
    "id": "modify",
    "title": "修改",
    "items": [
      "cad.arraytype",
      "cad.array",
      "cad.arrayedit",
      "cad.copy",
      "cad.draworder",
      "cad.erase",
      "cad.explode",
      "cad.extend",
      "cad.fillet",
      "cad.group",
      "cad.matchprop",
      "cad.txt2mtxt",
      "cad.mirror",
      "cad.move",
      "cad.offset",
      "cad.rotate",
      "cad.scale",
      "cad.trim",
      "edit.join",
      "cad.ungroup",
      "cad.count",
      "cad.lengthen",
      "cad.align",
      "cad.texttofront",
      "cad.copytolayer",
      "cad.overkill",
      "cad.pedit",
      "cad.hatchtoback",
      "cad.hatchedit",
      "cad.setbylayer",
      "cad.transparency",
      "cad.reverse",
      "cad.splinedit",
      "cad.justifytext",
      "cad.scaletext",
      "cad.textalign"
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
      "cad.dsettings",
      "cad.otrack",
      "cad.polar",
      "cad.snapmode"
    ]
  },
  {
    "id": "format",
    "title": "格式",
    "items": [
      "cad.dimstyle",
      "cad.mleaderstyle",
      "cad.mlstyle",
      "cad.tablestyle",
      "cad.linetype",
      "cad.lweight",
      "cad.textstyle",
      "cad.units",
      "cad.fieldeval",
      "cad.fielddisplay",
      "cad.fontmap",
      "cad.imageframe",
      "cad.imagequality",
      "cad.wipeoutframe"
    ]
  },
  {
    "id": "layer",
    "title": "图层",
    "items": [
      "cad.layer",
      "cad.layerstate",
      "cad.layiso",
      "cad.layuniso",
      "cad.layoff",
      "cad.layon",
      "cad.layfrz",
      "cad.laythw",
      "cad.laylck",
      "cad.laylulk",
      "cad.laycur",
      "cad.laymcur",
      "cad.laymch",
      "cad.laywalk"
    ]
  },
  {
    "id": "tool",
    "title": "工具",
    "items": [
      "app.options",
      "cad.appload",
      "cad.area",
      "cad.audit",
      "cad.massprop",
      "cad.script",
      "cad.rscript",
      "cad.resume",
      "cad.cui",
      "cad.dc",
      "cad.dist",
      "cad.measuregeom",
      "cad.netload",
      "cad.palettes",
      "cad.props",
      "cad.purge",
      "cad.spell",
      "cad.wscur",
      "cad.status",
      "cad.time",
      "cad.updatefield",
      "cad.id",
      "cad.aliasedit",
      "cad.list"
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
      "ui.theme.blue",
      "ui.theme.light",
      "ui.theme.toggle"
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
    "id": "param",
    "title": "参数",
    "items": [
      "cad.geomconstraint",
      "cad.dimconstraint",
      "cad.autoconstrain",
      "cad.parameters",
      "cad.delconstraint",
      "cad.constraintbar"
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
    "id": "uitool-unplaced",
    "title": "更多",
    "items": [
      "cad.drawingrecovery",
      "cad.drawingrecovery.cli",
      "file.props.cli",
      "file.commit",
      "file.hydconflict",
      "file.filedia",
      "cad.recover.cli",
      "cad.recoverall.cli",
      "file.export.cli",
      "file.stylesmanager.cli",
      "file.timeline",
      "file.ledgerdiff",
      "file.historybrowse",
      "cad.import.cli",
      "cad.pan.points",
      "cad.regenall",
      "cad.redraw",
      "view.toolshelf",
      "view.sidebar",
      "cad.model",
      "cad.layout.cli",
      "cad.vports",
      "cad.vpclip",
      "cad.vplayer",
      "cad.chspace",
      "cad.view",
      "cad.layoutvp",
      "app.options.cli",
      "cad.purge.cli",
      "cad.compare",
      "cad.diff",
      "cad.wscur.cli",
      "cad.setvar",
      "cad.audit.cli",
      "cad.oops",
      "cad.xplode",
      "cad.blend",
      "cad.arraypolar",
      "cad.arraypath",
      "cad.overkill.cli",
      "cad.breakatpoint",
      "cad.chprop",
      "cad.blockdef.cli",
      "cad.imageclip.cli",
      "cad.imageadjust.cli",
      "cad.imageattach.cli",
      "cad.xref.cli",
      "cad.rename",
      "cad.pdfimport",
      "cad.wblock.cli",
      "cad.attdef.cli",
      "cad.attedit.cli",
      "cad.attsync",
      "cad.attsync.cli",
      "cad.extref",
      "cad.eattedit.cli",
      "cad.blockpalette",
      "cad.attipedit",
      "cad.battman",
      "cad.refedit",
      "cad.refclose",
      "cad.block.inplace.remove",
      "cad.block.inplace.edit",
      "cad.block.inplace.add",
      "cad.block.inplace.close",
      "cad.bsaveas.cli",
      "cad.blockpalette.cli",
      "cad.solid",
      "cad.gradient",
      "cad.mtext",
      "view.add",
      "edit.copybase",
      "edit.pasteblock",
      "cad.select.box",
      "cad.select.cycle",
      "edit.mode",
      "cad.ddedit",
      "cad.textedit",
      "cad.centermark",
      "cad.centerline",
      "cad.tabledit",
      "cad.scaletext.cli",
      "cad.textalign.cli",
      "cad.units.cli",
      "cad.ltscale",
      "cad.color",
      "cad.color_cmdline",
      "cad.lweight_cmdline",
      "cad.wipeoutframe.cli",
      "cad.imagequality.cli",
      "cad.linetype.cli",
      "cad.textstyle.cli",
      "cad.ltscale.cli",
      "cad.imageframe.cli",
      "cad.justifytext.cli",
      "cad.celtscale",
      "cad.psltscale",
      "cad.dimstyle.cli",
      "cad.snap",
      "cad.polarang",
      "cad.laylulk.cli",
      "cad.laydel",
      "cad.laydel.cli",
      "cad.layerp",
      "cad.layerpmode",
      "cad.layer.cli",
      "cad.laymrg",
      "cad.layerstate.cli",
      "ui.skin.acad-b",
      "ui.skin.hy-e",
      "manifest.highlight",
      "manifest.commit",
      "cad.te.style",
      "cad.te.height",
      "cad.te.mask",
      "cad.te.bold",
      "cad.te.italic",
      "cad.te.under",
      "cad.te.over",
      "cad.te.strike",
      "cad.te.font",
      "cad.te.color",
      "cad.te.oblique",
      "cad.te.track",
      "cad.te.width",
      "cad.te.sup",
      "cad.te.sub",
      "cad.te.stack",
      "cad.te.clear",
      "cad.te.left",
      "cad.te.center",
      "cad.te.right",
      "cad.te.justify",
      "cad.te.distribute",
      "cad.te.columns",
      "cad.te.colbreak",
      "cad.te.symbol",
      "cad.te.field",
      "cad.te.find",
      "cad.te.import",
      "cad.te.caps",
      "cad.te.case",
      "cad.te.ruler",
      "cad.te.view",
      "cad.te.back",
      "cad.te.again",
      "cad.te.more",
      "cad.te.close"
    ]
  }
];

export const hy3dTabs: { id: string; title: string; hidden?: boolean; panels: { id: string; title: string; ids: string[]; face?: { id: string; size: "big" | "small"; menu?: string[]; text?: string }[]; launcher?: string }[] }[] = [
  {
    "id": "常用",
    "title": "常用",
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
          "cad.solid",
          "cad.revcloud",
          "cad.hatch",
          "cad.boundary",
          "cad.region",
          "cad.mline",
          "cad.line",
          "cad.pline",
          "cad.rect"
        ],
        "face": [
          {
            "id": "cad.line",
            "size": "big",
            "text": "直线"
          },
          {
            "id": "cad.pline",
            "size": "small",
            "text": "多段线"
          },
          {
            "id": "cad.circle",
            "size": "small",
            "menu": [
              "cad.circle.ttt"
            ],
            "text": "圆"
          },
          {
            "id": "cad.arc",
            "size": "small",
            "menu": [
              "cad.arc.sce",
              "cad.arc.sca",
              "cad.arc.scl",
              "cad.arc.sea",
              "cad.arc.sed",
              "cad.arc.ser",
              "cad.arc.cse",
              "cad.arc.csa",
              "cad.arc.csl",
              "cad.arc.con"
            ],
            "text": "圆弧"
          },
          {
            "id": "cad.rect",
            "size": "small",
            "menu": [
              "cad.polygon"
            ],
            "text": "矩形"
          },
          {
            "id": "cad.hatch",
            "size": "small",
            "menu": [
              "cad.solid",
              "cad.donut"
            ],
            "text": "填充"
          },
          {
            "id": "cad.boundary",
            "size": "small",
            "text": "边界"
          },
          {
            "id": "cad.spline",
            "size": "small",
            "text": "样条曲线"
          },
          {
            "id": "cad.region",
            "size": "small",
            "text": "面域"
          },
          {
            "id": "cad.mline",
            "size": "small",
            "text": "多线"
          },
          {
            "id": "cad.ellipse",
            "size": "small",
            "text": "椭圆"
          },
          {
            "id": "cad.revcloud",
            "size": "small",
            "text": "修订云线"
          }
        ],
        "launcher": "cad.hatch"
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
          "cad.setbylayer",
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
          "cad.texttofront",
          "cad.copytolayer",
          "cad.hatchtoback"
        ],
        "face": [
          {
            "id": "cad.move",
            "size": "big",
            "text": "移动"
          },
          {
            "id": "cad.copy",
            "size": "small",
            "text": "复制"
          },
          {
            "id": "cad.rotate",
            "size": "small",
            "text": "旋转"
          },
          {
            "id": "cad.trim",
            "size": "small",
            "menu": [
              "cad.extend",
              "cad.break",
              "cad.breakatpoint"
            ],
            "text": "修剪"
          },
          {
            "id": "edit.join",
            "size": "small",
            "text": "合并"
          },
          {
            "id": "cad.offset",
            "size": "small",
            "text": "偏移"
          },
          {
            "id": "cad.mirror",
            "size": "small",
            "text": "镜像"
          },
          {
            "id": "cad.fillet",
            "size": "small",
            "menu": [
              "cad.chamfer"
            ],
            "text": "圆角"
          },
          {
            "id": "cad.stretch",
            "size": "small",
            "menu": [
              "cad.scale",
              "cad.lengthen"
            ],
            "text": "拉伸"
          },
          {
            "id": "cad.array",
            "size": "small",
            "menu": [
              "cad.arraypolar",
              "cad.arraypath"
            ],
            "text": "阵列"
          },
          {
            "id": "cad.erase",
            "size": "small",
            "menu": [
              "cad.overkill"
            ],
            "text": "删除"
          },
          {
            "id": "cad.matchprop",
            "size": "small",
            "text": "特性匹配"
          },
          {
            "id": "cad.setbylayer",
            "size": "small",
            "text": "改随层"
          },
          {
            "id": "cad.align",
            "size": "small",
            "text": "对齐"
          },
          {
            "id": "cad.texttofront",
            "size": "small",
            "text": "文字前置"
          },
          {
            "id": "cad.copytolayer",
            "size": "small",
            "text": "复制到图层"
          },
          {
            "id": "cad.pedit",
            "size": "small",
            "text": "多段线编辑"
          },
          {
            "id": "cad.hatchtoback",
            "size": "small",
            "text": "填充置后"
          }
        ]
      },
      {
        "id": "注释",
        "title": "注释",
        "ids": [
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
          "cad.dimupdate",
          "cad.dimoverride",
          "cad.dimspace",
          "cad.dimbreak",
          "cad.dimjogged",
          "cad.hatch",
          "cad.leader",
          "cad.qleader",
          "cad.mleaderalign",
          "cad.dimedit",
          "cad.dimtedit",
          "cad.dimreassociate",
          "cad.mleaderstyle",
          "cad.tablestyle",
          "cad.table",
          "cad.mtext",
          "cad.text",
          "cad.textedit",
          "cad.textstyle",
          "cad.spell"
        ],
        "face": [
          {
            "id": "cad.mtext",
            "size": "big",
            "menu": [
              "cad.mtext",
              "cad.text",
              "cad.textedit",
              "cad.textstyle"
            ],
            "text": "文字"
          },
          {
            "id": "cad.dimlin",
            "size": "small",
            "menu": [
              "cad.dimali",
              "cad.dimang",
              "cad.dimarc",
              "cad.dimbase",
              "cad.dimcont",
              "cad.dimdia",
              "cad.dimord",
              "cad.qdim",
              "cad.dim",
              "cad.dimrad",
              "cad.dimedit",
              "cad.dimtedit",
              "cad.dimreassociate"
            ],
            "text": "线性标注"
          },
          {
            "id": "cad.leader",
            "size": "small",
            "menu": [
              "cad.qleader"
            ],
            "text": "引线"
          },
          {
            "id": "cad.table",
            "size": "small",
            "text": "表格"
          },
          {
            "id": "cad.mleaderalign",
            "size": "small",
            "text": "多重引线对齐"
          }
        ],
        "launcher": "cad.dimstyle"
      },
      {
        "id": "图层",
        "title": "图层",
        "ids": [
          "cad.layer",
          "cad.layerstate",
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
        ],
        "face": [
          {
            "id": "cad.layer",
            "size": "big",
            "text": "图层管理"
          },
          {
            "id": "cad.layerstate",
            "size": "small",
            "text": "图层状态"
          },
          {
            "id": "cad.laycur",
            "size": "small",
            "text": "置为当前"
          },
          {
            "id": "cad.layiso",
            "size": "small",
            "menu": [
              "cad.layuniso"
            ],
            "text": "隔离"
          },
          {
            "id": "cad.layoff",
            "size": "small",
            "menu": [
              "cad.layon",
              "cad.layfrz",
              "cad.laythw",
              "cad.laylck",
              "cad.laylulk"
            ],
            "text": "关闭"
          }
        ],
        "launcher": "cad.layer"
      },
      {
        "id": "块",
        "title": "块",
        "ids": [
          "cad.block",
          "cad.blockdef",
          "cad.wblock",
          "cad.attdef",
          "cad.attedit",
          "cad.attsync",
          "cad.eattedit",
          "cad.bedit",
          "cad.bsave",
          "cad.bclose",
          "cad.base"
        ],
        "face": [
          {
            "id": "cad.block",
            "size": "big",
            "menu": [
              "cad.blockdef",
              "cad.bedit",
              "cad.wblock"
            ],
            "text": "插入块"
          },
          {
            "id": "cad.base",
            "size": "small",
            "text": "基点"
          }
        ]
      },
      {
        "id": "实用工具",
        "title": "实用工具",
        "ids": [
          "cad.measuregeom",
          "cad.dist",
          "cad.area",
          "cad.id",
          "cad.list",
          "cad.props",
          "cad.select",
          "cad.selall",
          "cad.deselect",
          "cad.qselect",
          "cad.select.box",
          "cad.select.circle",
          "cad.select.invert",
          "cad.selinvert",
          "cad.select.cycle"
        ],
        "face": [
          {
            "id": "cad.measuregeom",
            "size": "small",
            "text": "快速"
          },
          {
            "id": "cad.measuregeom",
            "size": "small",
            "text": "距离"
          },
          {
            "id": "cad.measuregeom",
            "size": "small",
            "text": "半径"
          },
          {
            "id": "cad.measuregeom",
            "size": "small",
            "text": "角度"
          },
          {
            "id": "cad.measuregeom",
            "size": "small",
            "text": "面积"
          },
          {
            "id": "cad.measuregeom",
            "size": "small",
            "text": "体积"
          },
          {
            "id": "cad.dist",
            "size": "small",
            "menu": [
              "cad.area",
              "cad.id"
            ],
            "text": "测量"
          },
          {
            "id": "cad.qselect",
            "size": "small",
            "menu": [
              "cad.select",
              "cad.selall",
              "cad.deselect",
              "cad.select.box",
              "cad.select.circle",
              "cad.select.invert",
              "cad.selinvert",
              "cad.select.cycle"
            ],
            "text": "快速选择"
          },
          {
            "id": "cad.props",
            "size": "small",
            "menu": [
              "cad.list"
            ],
            "text": "特性"
          }
        ]
      },
      {
        "id": "剪贴板",
        "title": "剪贴板",
        "ids": [
          "edit.paste",
          "edit.pastespec",
          "edit.copy",
          "edit.cut",
          "cad.matchprop"
        ],
        "face": [
          {
            "id": "edit.paste",
            "size": "big",
            "menu": [
              "edit.copy",
              "edit.cut",
              "edit.pastespec",
              "cad.matchprop"
            ],
            "text": "粘贴"
          }
        ]
      }
    ]
  },
  {
    "id": "插入",
    "title": "插入",
    "panels": [
      {
        "id": "块",
        "title": "块",
        "ids": [
          "cad.block",
          "cad.blockdef",
          "cad.wblock",
          "cad.attdef",
          "cad.attedit",
          "cad.attsync",
          "cad.eattedit",
          "cad.bedit",
          "cad.bsave",
          "cad.bclose",
          "cad.base"
        ],
        "face": [
          {
            "id": "cad.block",
            "size": "big",
            "text": "插入块"
          },
          {
            "id": "cad.blockdef",
            "size": "small",
            "text": "创建块"
          },
          {
            "id": "cad.wblock",
            "size": "small",
            "text": "写块"
          },
          {
            "id": "cad.bedit",
            "size": "small",
            "menu": [
              "cad.bsave",
              "cad.bclose"
            ],
            "text": "编辑块"
          },
          {
            "id": "cad.base",
            "size": "small",
            "text": "基点"
          }
        ]
      },
      {
        "id": "块属性",
        "title": "块属性",
        "ids": [
          "cad.attdef",
          "cad.attedit",
          "cad.eattedit",
          "cad.attsync"
        ],
        "face": [
          {
            "id": "cad.attdef",
            "size": "big",
            "text": "定义属性"
          },
          {
            "id": "cad.eattedit",
            "size": "small",
            "menu": [
              "cad.attedit"
            ],
            "text": "编辑属性"
          },
          {
            "id": "cad.attsync",
            "size": "small",
            "text": "同步属性"
          }
        ]
      },
      {
        "id": "外部参照",
        "title": "外部参照",
        "ids": [
          "cad.xref",
          "cad.extref",
          "cad.xattach",
          "cad.image",
          "cad.imageattach",
          "cad.imageclip",
          "cad.xclip",
          "cad.xopen"
        ],
        "face": [
          {
            "id": "cad.xref",
            "size": "big",
            "text": "外部参照"
          },
          {
            "id": "cad.extref",
            "size": "small",
            "text": "参照管理"
          },
          {
            "id": "cad.xattach",
            "size": "small",
            "text": "附着外部参照"
          },
          {
            "id": "cad.imageattach",
            "size": "small",
            "menu": [
              "cad.image"
            ],
            "text": "附着图像"
          },
          {
            "id": "cad.imageclip",
            "size": "small",
            "text": "图像裁剪"
          },
          {
            "id": "cad.xclip",
            "size": "small",
            "text": "裁剪外部参照"
          },
          {
            "id": "cad.xopen",
            "size": "small",
            "text": "打开外部参照"
          }
        ]
      },
      {
        "id": "导入",
        "title": "导入",
        "ids": [
          "cad.import",
          "file.import.dwg"
        ],
        "face": [
          {
            "id": "cad.import",
            "size": "big",
            "text": "导入图形"
          },
          {
            "id": "file.import.dwg",
            "size": "small",
            "text": "导入 DWG"
          }
        ]
      }
    ]
  },
  {
    "id": "注释",
    "title": "注释",
    "panels": [
      {
        "id": "文字",
        "title": "文字",
        "ids": [
          "cad.mtext",
          "cad.text",
          "cad.textedit",
          "cad.textstyle",
          "cad.spell",
          "cad.justifytext",
          "cad.scaletext",
          "cad.textalign"
        ],
        "face": [
          {
            "id": "cad.mtext",
            "size": "big",
            "text": "多行文字"
          },
          {
            "id": "cad.text",
            "size": "small",
            "text": "单行文字"
          },
          {
            "id": "cad.textedit",
            "size": "small",
            "text": "编辑文字"
          },
          {
            "id": "cad.spell",
            "size": "small",
            "text": "拼写检查"
          },
          {
            "id": "cad.justifytext",
            "size": "small",
            "text": "对正文字"
          },
          {
            "id": "cad.scaletext",
            "size": "small",
            "text": "缩放文字"
          },
          {
            "id": "cad.textalign",
            "size": "small",
            "text": "文字对齐"
          }
        ],
        "launcher": "cad.textstyle"
      },
      {
        "id": "标注",
        "title": "标注",
        "ids": [
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
          "cad.dimedit",
          "cad.dimtedit",
          "cad.dimreassociate"
        ],
        "face": [
          {
            "id": "cad.dim",
            "size": "big",
            "text": "智能标注"
          },
          {
            "id": "cad.dimlin",
            "size": "small",
            "menu": [
              "cad.dimali",
              "cad.dimord"
            ],
            "text": "线性"
          },
          {
            "id": "cad.dimang",
            "size": "small",
            "menu": [
              "cad.dimarc"
            ],
            "text": "角度"
          },
          {
            "id": "cad.dimrad",
            "size": "small",
            "menu": [
              "cad.dimdia"
            ],
            "text": "半径"
          },
          {
            "id": "cad.dimcont",
            "size": "small",
            "menu": [
              "cad.dimbase"
            ],
            "text": "连续"
          },
          {
            "id": "cad.qdim",
            "size": "small",
            "text": "快速标注"
          },
          {
            "id": "cad.dimedit",
            "size": "small",
            "menu": [
              "cad.dimtedit",
              "cad.dimreassociate"
            ],
            "text": "编辑标注"
          }
        ],
        "launcher": "cad.dimstyle"
      },
      {
        "id": "引线",
        "title": "引线",
        "ids": [
          "cad.leader",
          "cad.qleader",
          "cad.mleaderalign",
          "cad.mleaderstyle"
        ],
        "face": [
          {
            "id": "cad.leader",
            "size": "big",
            "text": "多重引线"
          },
          {
            "id": "cad.qleader",
            "size": "small",
            "text": "快速引线"
          },
          {
            "id": "cad.mleaderalign",
            "size": "small",
            "text": "多重引线对齐"
          }
        ],
        "launcher": "cad.mleaderstyle"
      },
      {
        "id": "表格",
        "title": "表格",
        "ids": [
          "cad.table",
          "cad.tablestyle"
        ],
        "face": [
          {
            "id": "cad.table",
            "size": "big",
            "text": "插入表格"
          },
          {
            "id": "cad.tablestyle",
            "size": "small",
            "text": "表格样式"
          }
        ]
      }
    ]
  },
  {
    "id": "视图",
    "title": "视图",
    "panels": [
      {
        "id": "导航",
        "title": "导航",
        "ids": [
          "cad.pan",
          "cad.ucs",
          "cad.regen",
          "cad.regenall",
          "cad.redraw",
          "cad.zoomext",
          "cad.zoomprev",
          "cad.zoomnext",
          "cad.zoomin",
          "cad.zoomout",
          "cad.zoomsel",
          "cad.zoomwin",
          "cad.view"
        ],
        "face": [
          {
            "id": "cad.zoomext",
            "size": "big",
            "menu": [
              "cad.zoomwin",
              "cad.zoomsel",
              "cad.zoomin",
              "cad.zoomout"
            ],
            "text": "范围缩放"
          },
          {
            "id": "cad.pan",
            "size": "small",
            "text": "平移"
          },
          {
            "id": "cad.ucs",
            "size": "small",
            "text": "UCS"
          },
          {
            "id": "cad.zoomprev",
            "size": "small",
            "text": "上一视图"
          },
          {
            "id": "cad.zoomnext",
            "size": "small",
            "text": "下一视图"
          },
          {
            "id": "cad.regen",
            "size": "small",
            "menu": [
              "cad.regenall",
              "cad.redraw"
            ],
            "text": "重生成"
          },
          {
            "id": "cad.view",
            "size": "small",
            "text": "命名视图"
          }
        ]
      },
      {
        "id": "可见性",
        "title": "可见性",
        "ids": [
          "cad.hide",
          "cad.isolate",
          "cad.unisolate"
        ],
        "face": [
          {
            "id": "cad.isolate",
            "size": "big",
            "text": "隔离对象"
          },
          {
            "id": "cad.hide",
            "size": "small",
            "text": "隐藏对象"
          },
          {
            "id": "cad.unisolate",
            "size": "small",
            "text": "结束隔离"
          }
        ]
      },
      {
        "id": "对比",
        "title": "对比",
        "ids": [
          "cad.diff",
          "cad.compare"
        ],
        "face": [
          {
            "id": "cad.diff",
            "size": "big",
            "text": "图纸对比"
          },
          {
            "id": "cad.compare",
            "size": "small",
            "text": "差异报告"
          }
        ]
      },
      {
        "id": "视口与布局",
        "title": "视口与布局",
        "ids": [
          "cad.model",
          "cad.pspace",
          "cad.layout",
          "cad.vports",
          "cad.mview"
        ],
        "face": [
          {
            "id": "cad.vports",
            "size": "big",
            "text": "视口配置"
          },
          {
            "id": "cad.model",
            "size": "small",
            "text": "模型空间"
          },
          {
            "id": "cad.pspace",
            "size": "small",
            "text": "图纸空间"
          },
          {
            "id": "cad.layout",
            "size": "small",
            "menu": [
              "cad.mview"
            ],
            "text": "布局"
          }
        ]
      },
      {
        "id": "界面",
        "title": "界面",
        "ids": [
          "ui.fullscreen",
          "view.left",
          "view.right",
          "hw.cmdbar",
          "view.bottom",
          "hw.toolbarpos",
          "view.toolshelf",
          "view.sidebar",
          "cad.snap",
          "cad.dsettings",
          "ui.resetlayout",
          "ui.theme.dark",
          "ui.theme.blue",
          "ui.theme.light",
          "ui.theme.toggle",
          "ui.density.comfortable",
          "ui.density.compact",
          "ui.density.toggle",
          "ui.skin.acad-b",
          "ui.skin.hy-e",
          "ui.palset.auto",
          "ui.palset.hide"
        ],
        "face": [
          {
            "id": "ui.fullscreen",
            "size": "big",
            "text": "全屏"
          },
          {
            "id": "view.left",
            "size": "small",
            "text": "图形资源"
          },
          {
            "id": "view.right",
            "size": "small",
            "text": "特性面板"
          },
          {
            "id": "hw.cmdbar",
            "size": "small",
            "text": "命令行"
          },
          {
            "id": "ui.theme.toggle",
            "size": "small",
            "menu": [
              "ui.theme.dark",
              "ui.theme.blue",
              "ui.theme.light"
            ],
            "text": "颜色主题"
          },
          {
            "id": "ui.density.toggle",
            "size": "small",
            "menu": [
              "ui.density.comfortable",
              "ui.density.compact"
            ],
            "text": "界面密度"
          },
          {
            "id": "ui.resetlayout",
            "size": "small",
            "text": "重置布局"
          }
        ]
      }
    ]
  },
  {
    "id": "管理",
    "title": "管理",
    "panels": [
      {
        "id": "图层管理",
        "title": "图层管理",
        "ids": [
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
        ],
        "face": [
          {
            "id": "cad.layer",
            "size": "big",
            "text": "图层管理器"
          },
          {
            "id": "cad.laywalk",
            "size": "small",
            "text": "图层漫游"
          },
          {
            "id": "cad.laymch",
            "size": "small",
            "text": "匹配图层"
          },
          {
            "id": "cad.laylck",
            "size": "small",
            "menu": [
              "cad.laylulk"
            ],
            "text": "锁定"
          }
        ]
      },
      {
        "id": "样式",
        "title": "样式",
        "ids": [
          "cad.dimstyle",
          "cad.textstyle",
          "cad.mleaderstyle",
          "cad.tablestyle",
          "cad.mlstyle",
          "cad.linetype",
          "cad.units",
          "cad.ltscale",
          "cad.color",
          "cad.lweight"
        ],
        "face": [
          {
            "id": "cad.dimstyle",
            "size": "big",
            "text": "标注样式"
          },
          {
            "id": "cad.textstyle",
            "size": "small",
            "text": "文字样式"
          },
          {
            "id": "cad.linetype",
            "size": "small",
            "menu": [
              "cad.ltscale"
            ],
            "text": "线型"
          },
          {
            "id": "cad.units",
            "size": "small",
            "text": "图形单位"
          },
          {
            "id": "cad.color",
            "size": "small",
            "text": "颜色"
          },
          {
            "id": "cad.lweight",
            "size": "small",
            "text": "线宽"
          },
          {
            "id": "cad.mleaderstyle",
            "size": "small",
            "menu": [
              "cad.tablestyle"
            ],
            "text": "引线样式"
          },
          {
            "id": "cad.mlstyle",
            "size": "small",
            "text": "多线样式"
          }
        ]
      },
      {
        "id": "图形维护",
        "title": "图形维护",
        "ids": [
          "cad.purge",
          "cad.audit",
          "cad.recover",
          "cad.recoverall",
          "cad.overkill"
        ],
        "face": [
          {
            "id": "cad.purge",
            "size": "big",
            "text": "清理"
          },
          {
            "id": "cad.audit",
            "size": "small",
            "text": "核查"
          },
          {
            "id": "cad.recover",
            "size": "small",
            "menu": [
              "cad.recoverall"
            ],
            "text": "恢复"
          },
          {
            "id": "cad.overkill",
            "size": "small",
            "text": "删除重复"
          }
        ]
      },
      {
        "id": "自定义",
        "title": "自定义",
        "ids": [
          "app.options",
          "cad.cui",
          "cad.appload",
          "cad.netload",
          "cad.dc",
          "cad.palettes",
          "cad.wscur",
          "ui.keys",
          "view.add",
          "edit.mode",
          "help.help",
          "help.hy",
          "help.whatsnew",
          "ui.about",
          "ui.feedback",
          "ui.info",
          "ui.notes",
          "ui.palette"
        ],
        "face": [
          {
            "id": "app.options",
            "size": "big",
            "text": "选项"
          },
          {
            "id": "ui.keys",
            "size": "small",
            "text": "快捷键"
          },
          {
            "id": "cad.cui",
            "size": "small",
            "text": "自定义界面"
          },
          {
            "id": "help.help",
            "size": "small",
            "menu": [
              "help.hy",
              "help.whatsnew",
              "ui.about"
            ],
            "text": "帮助"
          }
        ]
      },
      {
        "id": "命令登记补全",
        "title": "命令登记补全",
        "ids": [
          "app.options.cli",
          "cad.aliasedit",
          "cad.align",
          "cad.arraypath",
          "cad.arraypolar",
          "cad.arraytype",
          "cad.attdef",
          "cad.attedit",
          "cad.attipedit",
          "cad.attsync",
          "cad.base",
          "cad.battman",
          "cad.bclose",
          "cad.bedit",
          "cad.blockpalette",
          "cad.breakatpoint",
          "cad.bsave",
          "cad.centerline",
          "cad.centermark",
          "cad.chprop",
          "cad.color",
          "cad.color_cmdline",
          "cad.compare",
          "cad.copytolayer",
          "cad.count",
          "cad.ddedit",
          "cad.dimcenter",
          "cad.drawingrecovery",
          "cad.eattedit",
          "cad.extref",
          "cad.hatchedit",
          "cad.hatchtoback",
          "cad.id",
          "cad.justifytext",
          "cad.laycur",
          "cad.laydel",
          "cad.laydel.cli",
          "cad.layer.cli",
          "cad.layerp",
          "cad.layerpmode",
          "cad.layfrz",
          "cad.layiso",
          "cad.laylck",
          "cad.laylulk",
          "cad.laymch",
          "cad.laymcur",
          "cad.laymrg",
          "cad.layoff",
          "cad.layon",
          "cad.layout",
          "cad.laythw",
          "cad.layuniso",
          "cad.lengthen",
          "cad.list",
          "cad.ltscale",
          "cad.lweight",
          "cad.mleaderalign",
          "cad.mleaderedit",
          "cad.model",
          "cad.mspace",
          "cad.mtext",
          "cad.mview",
          "cad.overkill",
          "cad.pan.points",
          "cad.pdfimport",
          "cad.pedit",
          "cad.polarang",
          "cad.pspace",
          "cad.redraw",
          "cad.refclose",
          "cad.refedit",
          "cad.regenall",
          "cad.rename",
          "cad.revcloud",
          "cad.scaletext",
          "cad.select",
          "cad.select.box",
          "cad.select.cycle",
          "cad.selectsimilar",
          "cad.setvar",
          "cad.snap",
          "cad.solid",
          "cad.splinedit",
          "cad.tabledit",
          "cad.textalign",
          "cad.textedit",
          "cad.texttofront",
          "cad.view",
          "cad.vports",
          "cad.wblock",
          "cad.wipeout",
          "cad.xplode",
          "edit.mode",
          "edit.pasteblock",
          "file.filedia",
          "view.add",
          "view.sidebar",
          "view.toolshelf"
        ]
      }
    ]
  },
  {
    "id": "输出",
    "title": "输出",
    "panels": [
      {
        "id": "打印",
        "title": "打印",
        "ids": [
          "file.plot",
          "file.preview",
          "file.pagesetup"
        ],
        "face": [
          {
            "id": "file.plot",
            "size": "big",
            "text": "打印"
          },
          {
            "id": "file.preview",
            "size": "big",
            "text": "打印预览"
          },
          {
            "id": "file.pagesetup",
            "size": "small",
            "text": "页面设置"
          }
        ]
      },
      {
        "id": "导出",
        "title": "导出",
        "ids": [
          "file.export",
          "file.props",
          "file.saveas"
        ],
        "face": [
          {
            "id": "file.export",
            "size": "big",
            "text": "导出"
          },
          {
            "id": "file.saveas",
            "size": "small",
            "text": "另存为"
          },
          {
            "id": "file.props",
            "size": "small",
            "text": "图形属性"
          }
        ]
      }
    ]
  },
  {
    "id": "HY结构",
    "title": "HY结构",
    "panels": [
      {
        "id": "结构建模",
        "title": "结构建模",
        "ids": [
          "hy.beam",
          "hy.pick",
          "hy.sup.fixed",
          "hy.sup.pin",
          "hy.sup.roller",
          "hy.sup.spring"
        ],
        "face": [
          {
            "id": "hy.beam",
            "size": "big",
            "text": "新建梁"
          },
          {
            "id": "hy.pick",
            "size": "small",
            "text": "拾取梁"
          },
          {
            "id": "hy.sup.pin",
            "size": "small",
            "menu": [
              "hy.sup.roller"
            ],
            "text": "铰支座"
          },
          {
            "id": "hy.sup.fixed",
            "size": "small",
            "menu": [
              "hy.sup.spring"
            ],
            "text": "固定支座"
          }
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
        ],
        "face": [
          {
            "id": "hy.addload",
            "size": "big",
            "text": "添加荷载"
          },
          {
            "id": "hy.pload",
            "size": "small",
            "text": "点荷载"
          },
          {
            "id": "hy.udl",
            "size": "small",
            "text": "均布荷载"
          },
          {
            "id": "hy.moment",
            "size": "small",
            "text": "集中力偶"
          },
          {
            "id": "hy.combo",
            "size": "small",
            "text": "荷载组合"
          }
        ],
        "launcher": "hy.combo"
      },
      {
        "id": "求解",
        "title": "求解",
        "ids": [
          "hy.solve",
          "hy.check"
        ],
        "face": [
          {
            "id": "hy.solve",
            "size": "big",
            "text": "求解"
          },
          {
            "id": "hy.check",
            "size": "big",
            "text": "校验"
          }
        ]
      },
      {
        "id": "结果",
        "title": "结果",
        "ids": [
          "hy.bmd",
          "hy.sfd",
          "hy.nfd",
          "hy.deform",
          "hy.envelope",
          "hy.reaction"
        ],
        "face": [
          {
            "id": "hy.bmd",
            "size": "big",
            "text": "弯矩图"
          },
          {
            "id": "hy.sfd",
            "size": "small",
            "text": "剪力图"
          },
          {
            "id": "hy.nfd",
            "size": "small",
            "text": "轴力图"
          },
          {
            "id": "hy.deform",
            "size": "small",
            "text": "变形图"
          },
          {
            "id": "hy.envelope",
            "size": "small",
            "text": "包络图"
          },
          {
            "id": "hy.reaction",
            "size": "small",
            "text": "支座反力"
          }
        ]
      },
      {
        "id": "交付",
        "title": "交付",
        "ids": [
          "hy.report",
          "hy.export",
          "hy.insert"
        ],
        "face": [
          {
            "id": "hy.report",
            "size": "big",
            "text": "计算书"
          },
          {
            "id": "hy.export",
            "size": "small",
            "text": "导出结果"
          },
          {
            "id": "hy.insert",
            "size": "small",
            "text": "插入 CAD"
          }
        ]
      }
    ]
  },
  {
    "id": "HY沉降",
    "title": "HY沉降",
    "panels": [
      {
        "id": "观测数据",
        "title": "观测数据",
        "ids": [
          "hy.settle",
          "hy.settle.import"
        ],
        "face": [
          {
            "id": "hy.settle",
            "size": "big",
            "text": "沉降观测"
          },
          {
            "id": "hy.settle.import",
            "size": "big",
            "text": "导入数据"
          }
        ]
      },
      {
        "id": "预测与报告",
        "title": "预测与报告",
        "ids": [
          "hy.settle.fit",
          "hy.settle.report"
        ],
        "face": [
          {
            "id": "hy.settle.fit",
            "size": "big",
            "text": "沉降预测"
          },
          {
            "id": "hy.settle.report",
            "size": "big",
            "text": "生成报告"
          }
        ]
      }
    ]
  },
  {
    "id": "文字编辑器",
    "title": "文字编辑器",
    "panels": [
      {
        "id": "样式",
        "title": "样式",
        "ids": [
          "cad.te.style",
          "cad.te.height",
          "cad.te.mask",
          "cad.textstyle"
        ]
      },
      {
        "id": "格式",
        "title": "格式",
        "ids": [
          "cad.te.bold",
          "cad.te.italic",
          "cad.te.under",
          "cad.te.over",
          "cad.te.strike",
          "cad.te.font",
          "cad.te.color",
          "cad.te.oblique",
          "cad.te.track",
          "cad.te.width",
          "cad.te.sup",
          "cad.te.sub",
          "cad.te.stack",
          "cad.te.clear"
        ]
      },
      {
        "id": "段落",
        "title": "段落",
        "ids": [
          "cad.te.left",
          "cad.te.center",
          "cad.te.right",
          "cad.te.justify",
          "cad.te.distribute"
        ]
      },
      {
        "id": "插入",
        "title": "插入",
        "ids": [
          "cad.te.columns",
          "cad.te.colbreak",
          "cad.te.symbol",
          "cad.te.field"
        ]
      },
      {
        "id": "拼写检查",
        "title": "拼写检查",
        "ids": [
          "cad.spell"
        ]
      },
      {
        "id": "工具",
        "title": "工具",
        "ids": [
          "cad.te.find",
          "cad.te.import",
          "cad.te.caps",
          "cad.te.case"
        ]
      },
      {
        "id": "选项",
        "title": "选项",
        "ids": [
          "cad.te.ruler",
          "cad.te.view",
          "cad.te.back",
          "cad.te.again",
          "cad.te.more"
        ]
      },
      {
        "id": "关闭",
        "title": "关闭",
        "ids": [
          "cad.te.close"
        ]
      }
    ],
    "hidden": true
  }
];

export const hy3dQuick: string[] = [
  "file.new",
  "file.open",
  "file.save",
  "ui.undo",
  "ui.redo"
];

export const hy3dStatus: { id: string; short: string }[] = [
  {
    "id": "cad.osnap",
    "short": "捕捉"
  },
  {
    "id": "cad.grid",
    "short": "栅格"
  },
  {
    "id": "cad.snapmode",
    "short": "栅格捕捉"
  },
  {
    "id": "cad.ortho",
    "short": "正交"
  },
  {
    "id": "cad.polar",
    "short": "极轴"
  },
  {
    "id": "cad.otrack",
    "short": "追踪"
  },
  {
    "id": "cad.dyn",
    "short": "动态"
  },
  {
    "id": "cad.lw",
    "short": "线宽"
  }
];

export const hy3dBenchRows: { id: string; title: string; commands: string[] }[] = [
  {
    "id": "file",
    "title": "文件",
    "commands": [
      "file.new",
      "file.open",
      "file.save",
      "ui.undo",
      "ui.redo",
      "cad.zoomext",
      "cad.zoomprev",
      "cad.zoomnext",
      "cad.pan",
      "cad.selall"
    ]
  },
  {
    "id": "def",
    "title": "定义",
    "commands": [
      "hy.beam",
      "hy.solve",
      "hy.combo",
      "hy.addload",
      "cad.layer",
      "hy.insert",
      "hy.report",
      "hy.settle"
    ]
  }
];
