import { buildConfig, workTypes } from "../presets";
import { design } from "../store";
import { HY3D, HY3D_HAND, HYMD, jsonText, readText, writeText } from "./io";
import { menuSpec, menusFrom, overlayScheme, referencedIds, SCHEMES as HY3D_SCHEMES, specFromScheme, stampActive } from "hy3d-spec";
import { hymdMenuSpec, hymdMenusFrom, hymdSidePages, overlayHymd, SCHEMES as HYMD_SCHEMES, specFromHymd, stampExplorerGhost } from "hymd-spec";

const KEY = "uitool.link.from";

export type LinkFrom = "hy3d" | "hymd";

export function linkFrom(): LinkFrom | null {
  const v = sessionStorage.getItem(KEY);
  return v === "hy3d" || v === "hymd" ? v : null;
}

function remember(from: LinkFrom) {
  sessionStorage.setItem(KEY, from);
}

function parse<T>(text: string): T {
  return JSON.parse(text) as T;
}

/** 读 hy3d 五份规格，盖到 CAD 二维制图的三套方案上。 */
export async function readHy3d() {
  const cad = workTypes.find((t) => t.id === "cad2d");
  if (!cad) throw new Error("没有 CAD 二维制图");
  const dir = `${HY3D}/ui/design`;
  const config = buildConfig("cad2d", "cad2d-best", {
    name: "hy3d-cad",
    title: "hy3d 二维制图",
    identifier: "com.hy.hy3d",
    version: "0.1.0",
    description: cad.summary,
    icon: "layout"
  });
  const menuMain = menusFrom(parse(`${await readText(`${dir}/menus.json`)}`));
  const menuBlender = menusFrom(parse(await readText(`${dir}/menus.blender.json`)));
  for (const s of HY3D_SCHEMES) {
    const scheme = config.schemes?.find((x) => x.id === s.scheme);
    if (!scheme) throw new Error("没有方案 " + s.scheme);
    const spec = parse(await readText(`${dir}/${s.file}`));
    scheme.ui = overlayScheme(scheme.ui, spec, config.commands) as typeof scheme.ui;
    scheme.menus = s.menus === "blender" ? menuBlender : menuMain;
  }
  config.sidePages = [];
  design.replace({ config: stampActive(config), customThemes: [] });
  design.select(null);
  remember("hy3d");
}

/** 把当前 CAD 设计写回 hy3d，并更新手改文件。命令对不上就中止。 */
export async function writeHy3d() {
  const doc = design.get().doc;
  const config = doc.config;
  if (config.workType !== "cad2d") throw new Error("当前不是 hy3d 的二维制图，没有写入。");
  const known = new Set((parse(await readText(`${HY3D}/ui/commands.json`)) as { commands: { id: string }[] }).commands.map((c) => c.id));
  const specs = HY3D_SCHEMES.map((s) => {
    const scheme = config.schemes?.find((x) => x.id === s.scheme);
    if (!scheme?.ui) throw new Error("没有方案 " + s.scheme);
    const menus = scheme.menus ?? (config.scheme === scheme.id ? config.menus : []);
    return { ...s, spec: specFromScheme(scheme, s.skin), menus: menuSpec(menus) };
  });
  const mainMenus = specs.find((s) => s.scheme === "cad2d-best")!.menus;
  const blenderMenus = specs.find((s) => s.scheme === "cad2d-good")!.menus;
  const missing = [...referencedIds(specs.map((s) => s.spec), [mainMenus, blenderMenus])].filter((id) => !known.has(id));
  if (missing.length) throw new Error("缺少 hy3d 命令：" + missing.join(", "));
  const dir = `${HY3D}/ui/design`;
  for (const s of specs) await writeText(`${dir}/${s.file}`, jsonText(s.spec));
  await writeText(`${dir}/menus.json`, jsonText(mainMenus));
  await writeText(`${dir}/menus.blender.json`, jsonText(blenderMenus));
  await writeText(HY3D_HAND, jsonText({ kind: "uitool-design", version: 1, config, customThemes: doc.customThemes }));
  remember("hy3d");
}

/** 读 HyMd 三套皮肤和菜单，盖到文档写作上。 */
export async function readHymd() {
  const writing = workTypes.find((t) => t.id === "writing");
  if (!writing) throw new Error("没有文档写作");
  const config = buildConfig("writing", "writing-good", {
    name: "hymd-writing",
    title: "HyMd 文档写作",
    identifier: "com.hy.hymd-writing",
    version: "0.1.0",
    description: writing.summary,
    icon: "layout"
  });
  const menus = hymdMenusFrom(parse(await readText(`${HYMD}/src/parts/design/menus.json`)), config.menus);
  for (const s of HYMD_SCHEMES) {
    const scheme = config.schemes?.find((x) => x.id === s.scheme);
    if (!scheme) throw new Error("没有方案 " + s.scheme);
    const spec = parse(await readText(`${HYMD}/src/skins/design/${s.file}`));
    scheme.ui = stampExplorerGhost(overlayHymd(scheme.ui, spec)) as typeof scheme.ui;
    scheme.menus = menus as NonNullable<typeof scheme.menus>;
  }
  config.sidePages = hymdSidePages();
  design.replace({ config: stampActive(config), customThemes: [] });
  design.select(null);
  const first = config.sidePages?.[0]?.id;
  if (first) design.selectSidePage(first);
  remember("hymd");
}

/** 把当前文档写作写回 HyMd 的三份皮肤和一份菜单。 */
export async function writeHymd() {
  const config = design.get().doc.config;
  if (config.workType !== "writing") throw new Error("当前不是 HyMd 的文档写作，没有写入。");
  for (const s of HYMD_SCHEMES) {
    const scheme = config.schemes?.find((x) => x.id === s.scheme);
    if (!scheme?.ui) throw new Error("没有方案 " + s.scheme);
    await writeText(`${HYMD}/src/skins/design/${s.file}`, jsonText(specFromHymd(scheme)));
  }
  const menus = config.menus;
  await writeText(`${HYMD}/src/parts/design/menus.json`, jsonText(hymdMenuSpec(menus)));
  remember("hymd");
}
