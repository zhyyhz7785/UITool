import accents from "./accents.json";
import type { ThemeData } from "./resolve";

/** src/theme/themes/ 下的每个 .json 都是一套主题，文件名即 id。放进 VSCode 主题文件也能直接用。 */
const files = import.meta.glob<Omit<ThemeData, "id">>("./themes/*.json", { eager: true, import: "default" });

const ORDER = ["hy-dark", "hy-light", "hy-white", "autocad", "blender", "unreal-starship", "fluent", "mac"];

export const builtinThemes: ThemeData[] = Object.entries(files)
  .map(([file, data]) => ({ ...data, id: file.replace(/^.*\/|\.json$/g, "") }))
  .sort((a, b) => {
    const ia = ORDER.indexOf(a.id);
    const ib = ORDER.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.name.localeCompare(b.name);
  });

export const accentChoices: string[] = accents;

export function findTheme(themes: ThemeData[], id: string): ThemeData {
  return themes.find((t) => t.id === id) ?? themes[0];
}
