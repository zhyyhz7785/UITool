/**
 * HyMd 里预设编辑区换不进去的整页。读取时整份换上。
 * 文案按对方 *.zh-CN.ts 抄，不在运行时解析对方仓库。
 * present 决定预览里这块怎么摆，和软件窗口的位置一致。
 */

function rows(id, labels, group) {
  return labels.map((label, i) => ({
    id: `${id}-${i + 1}`,
    label,
    ...(group ? { group } : {})
  }));
}

function region(id, title, present, labels, extra) {
  return { id, title, present, ...(extra ?? {}), items: rows(id, labels) };
}

function grouped(id, title, groups, extra) {
  const items = [];
  let n = 0;
  for (const g of groups) {
    for (const label of g.labels) {
      n += 1;
      items.push({ id: `${id}-${n}`, label, group: g.title });
    }
  }
  return { id, title, present: "ribbon", ...(extra ?? {}), items };
}

const DOC_BAR = ["目录", "缩小", "放大", "适合宽度", "页码", "查找", "撤销", "重做", "打印", "更多", "复制全文", "转成 Markdown", "用系统打开", "显示于资源管理器"];

const PAGE_MENU = ["剪切", "复制", "粘贴", "删除", "插入页面", "空白页", "从文件…", "提取页面…", "替换页面…", "裁剪页面…", "旋转页面", "创建副本", "上移", "下移", "属性"];

export const HYMD_SIDE_PAGES = [
  {
    id: "graph",
    title: "绘图",
    source: "src/editor/graph/GraphWorkbenchPane.tsx",
    regions: [
      grouped("toolbar", "工具条", [
        { title: "绘图", labels: ["直线", "多段线", "圆", "圆弧", "矩形", "多边形", "点", "构造线", "射线"] },
        { title: "修改", labels: ["移动", "复制", "旋转", "镜像", "缩放", "拉伸", "修剪", "圆角", "阵列", "偏移", "分解", "删除"] },
        { title: "注释", labels: ["文字", "标注"] },
        { title: "图层", labels: ["图层"] }
      ]),
      region("style", "样式条", "swatches", [
        "实心点", "叉", "圆圈", "加号", "实心菱形", "空心菱形", "三角形", "倒三角", "左三角", "右三角", "方形",
        "实线", "短虚线", "长虚线", "点线", "点划线", "显示标签", "隐藏", "删除"
      ]),
      region("side", "左侧", "tabs", ["图上", "目录"], { place: "start" }),
      region("source", "图上", "list", ["源码"], { tab: "图上", place: "start" }),
      region("library", "目录", "list", ["全部", "小学", "初中", "高中", "大学", "科研", "算术", "代数", "几何", "函数", "三角函数", "微积分"], { tab: "目录", place: "start" }),
      region("notes", "讲义", "aside", ["复制 Markdown", "插入到文档", "公式从哪来", "分步操作", "易错点"], { place: "end" }),
      region("board", "画板", "canvas", ["视角", "自动旋转", "背景墙", "底色", "标准视图", "全屏", "特性"]),
      grouped("calc", "底栏计算", [{ title: "计算", labels: ["不定积分", "定积分", "插入文档", "复制", "步骤"] }], { edge: "bottom" }),
      region("status", "状态条", "status", ["栅格", "内部栅格", "捕捉", "正交", "极轴", "对象捕捉", "视图后退", "视图前进", "存储视图"])
    ]
  },
  {
    id: "refs",
    title: "文献",
    source: "src/editor/refs/RefsPane.tsx",
    regions: [
      region("commands", "工具条", "ribbon", [
        "识别本文引用", "添加", "从文件导入", "用 DOI 添加", "新建一条", "从 Zotero 导入", "从 Zotero 插入引用",
        "全部抓取", "导出", "RIS", "BibTeX", "CSL-JSON", "更多", "抓取用的邮箱", "关联本机 PDF", "登录后下载 PDF", "存入 Zotero"
      ]),
      region("filter", "检索", "search", ["筛选文献"]),
      region("list", "条目", "list", ["本文引用", "插入引用", "打开"]),
      region("copy", "快速复制", "ribbon", ["复制为参考文献", "复制为引用", "复制为导出"], { edge: "bottom" })
    ]
  },
  {
    id: "image",
    title: "图片",
    source: "src/editor/image-view/ImagePreviewPane.tsx",
    regions: [
      {
        id: "tabs",
        title: "页签",
        present: "tabs",
        items: [
          ...rows("tabs", ["版式", "图片格式", "标注"]),
          ...rows("tabs-end", ["撤销", "重做", "保存", "完成"], "端")
        ]
      },
      region("layout", "版式", "ribbon", [
        "纸张", "横", "竖", "边距", "裁剪", "分辨率", "150 屏幕", "300 印刷", "600 线稿",
        "通栏", "上文下图", "左图右文", "左文右图", "并排", "四宫格", "一大两小", "三图一行",
        "插入图片", "标尺", "参考线", "预览窗格"
      ], { tab: "版式" }),
      region("picture", "图片格式", "ribbon", [
        "删除背景", "校正", "颜色", "灰度", "透明度", "重置", "图片边框", "边框粗细", "阴影",
        "位置", "上移一层", "下移一层", "选择窗格", "对齐", "右转", "左转", "垂直翻转", "水平翻转", "高度", "宽度"
      ], { tab: "图片格式" }),
      region("annot", "标注", "ribbon", [
        "箭头", "文字", "形状", "选择", "更多", "提取文字", "模糊", "简化", "魔棒", "抠出", "画笔", "直线", "荧光笔", "步骤", "橡皮擦", "笔画橡皮", "清除全部标注", "放大镜"
      ], { tab: "标注" }),
      region("board", "画板", "canvas", []),
      region("side", "版式侧栏", "aside", ["版式预览", "关闭预览", "横向", "纵向", "通栏", "并排", "左图右文", "左文右图", "上文下图", "四宫格", "一大两小", "三图一行"], { place: "end" })
    ]
  },
  {
    id: "pdf",
    title: "PDF",
    source: "src/editor/pdf-view/PdfPreviewPane.tsx",
    regions: [
      region("toolbar", "工具条", "ribbon", [...DOC_BAR, "旋转", "摘到笔记", "框选摘图", "高亮", "文本框", "画笔", "识别文字"]),
      region("outline", "目录", "aside", ["目录"]),
      region("page", "页面", "paper", PAGE_MENU)
    ]
  },
  {
    id: "docx",
    title: "Word",
    source: "src/editor/office-view/DocxEditorPane.tsx",
    regions: [
      region("toolbar", "工具条", "ribbon", [...DOC_BAR, "块类型", "插入", "表格", "图片", "分页符"]),
      region("page", "正文", "paper", [])
    ]
  },
  {
    id: "pptx",
    title: "PPT",
    source: "src/editor/office-view/PptxPreviewPane.tsx",
    regions: [
      region("toolbar", "工具条", "ribbon", DOC_BAR),
      region("outline", "缩略图", "aside", ["目录"]),
      region("page", "页面", "paper", ["剪切", "复制", "粘贴", "删除", "插入页面", "空白页", "旋转页面", "创建副本", "上移", "下移", "属性"])
    ]
  },
  {
    id: "sheet",
    title: "表格",
    source: "src/editor/sheet/SheetEditorPane.tsx",
    regions: [
      region("file", "文件", "ribbon", ["文件", "导入 xlsx", "导出 xlsx", "导出 JSON"]),
      region("grid", "表体", "grid", [])
    ]
  },
  {
    id: "deck",
    title: "幻灯",
    source: "src/editor/deck/DeckViewPane.tsx",
    regions: [
      region("toolbar", "工具条", "ribbon", ["主题", "默认", "Gaia", "Uncover", "尺寸", "16:9", "4:3", "切页级别", "按一级标题", "按二级标题", "按三级标题", "放映", "导出 pptx", "导出 pdf"]),
      region("adjust", "调整本页", "ribbon", ["隐藏本页", "从此切页", "前面插入", "后面插入", "替换"]),
      region("slides", "幻灯页", "paper", [])
    ]
  },
  {
    id: "layout",
    title: "排版预览",
    source: "src/editor/layoutPreview/LayoutPreviewPane.tsx",
    regions: [
      region("toolbar", "工具条", "ribbon", ["页码", "打印", "更多", "用系统打开", "显示于资源管理器"]),
      region("adjust", "调整本页", "ribbon", ["隐藏", "从此分页", "前面插入", "后面插入", "替换"]),
      region("paper", "纸面", "paper", [])
    ]
  },
  {
    id: "article",
    title: "论文视图",
    source: "src/editor/article/ArticleViewPane.tsx",
    regions: [
      region("toolbar", "工具条", "ribbon", ["模板", "中文期刊", "IEEE 样", "纸张", "信纸", "A4", "标引", "顺序编码", "著者-出版年", "变体", "打开变体", "导出 PDF"]),
      region("adjust", "调整本页", "ribbon", ["隐藏", "跨两栏", "前面插入", "后面插入", "替换"]),
      region("paper", "纸面", "paper", [])
    ]
  }
];

export function hymdSidePages() {
  return JSON.parse(JSON.stringify(HYMD_SIDE_PAGES));
}
