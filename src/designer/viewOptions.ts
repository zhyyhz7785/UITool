import { views } from "@tpl/views";

const NAMES: Record<string, string> = {
  explorer: "资源管理器",
  search: "搜索",
  outline: "大纲",
  properties: "属性",
  problems: "问题",
  output: "输出",
  terminal: "终端",
  welcome: "欢迎页",
  text: "文本编辑器",
  placeholder: "占位"
};

/** 模板里已登记的视图，供各部件选择。 */
export const viewOptions = Object.keys(views).map((id) => ({ value: id, label: NAMES[id] ?? id }));
