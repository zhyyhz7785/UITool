import { buildConfig, workTypes } from "../presets";
import { design } from "../store";
import { HY3D, HY3D_HAND, HYMD, jsonText, readText, writeText } from "./io";
import { applyHy3dSpecs, commitHy3dDesign, handDocument, loadHy3dBundle, stampActive } from "hy3d-spec";
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

const readHy3dUi = (rel: string) => readText(`${HY3D}/ui/${rel}`);

/** 读 hy3d 的功能区、分析工作台和菜单，盖到 CAD 二维制图上。不要求 Blender 文件。 */
export async function readHy3d() {
  const cad = workTypes.find((t) => t.id === "cad2d");
  if (!cad) throw new Error("没有 CAD 二维制图");
  const bundle = await loadHy3dBundle(readHy3dUi);
  const config = applyHy3dSpecs(
    buildConfig("cad2d", "cad2d-best", {
      name: "hy3d-cad",
      title: "hy3d 二维制图",
      identifier: "com.hy.hy3d",
      version: "0.1.0",
      description: cad.summary,
      icon: "layout"
    }),
    bundle
  );
  design.replace({ config, customThemes: [] });
  design.select(null);
  remember("hy3d");
}

/** 把当前 CAD 设计写回 hy3d 的三份规格，并更新手改文件。命令对不上就中止，不写半份。 */
export async function writeHy3d() {
  const doc = design.get().doc;
  const config = doc.config;
  await commitHy3dDesign(config, readHy3dUi, (rel, text) => writeText(`${HY3D}/ui/${rel}`, text));
  await writeText(HY3D_HAND, jsonText(handDocument(config, doc.customThemes)));
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
