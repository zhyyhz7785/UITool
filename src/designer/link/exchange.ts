import { buildConfig, workTypes } from "../presets";
import { design } from "../store";
import { jsonText, readText, writeText } from "./io";
import { readRoot, writeRoot } from "./paths";
import { applyHy3dSpecs, commitHy3dDesign, loadHy3dBundle, stampActive } from "hy3d-spec";
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

const readHy3dUi = (rel: string) => readText(`${readRoot("hy3d")}/ui/${rel}`);

function refuseDirty() {
  if (design.dirty()) throw new Error("当前设计还有未保存的修改，没有覆盖。先保存，或放弃这些修改后再读取。");
}

/** 预览过的写回路径。确认写入时不再重读，避免把外部改动当成自己的基线。 */
const armed = new Set<string>();

function arm(file: string) {
  armed.add(file.replace(/\\/g, "/"));
}

function assertArmed(file: string) {
  if (!armed.has(file.replace(/\\/g, "/"))) throw new Error("先预览写回，确认差异后再写入。");
}

/** 读 hy3d 的功能区、分析工作台和菜单，盖到 HY3D 上。不要求 Blender 文件。 */
export async function readHy3d() {
  refuseDirty();
  const cad = workTypes.find((t) => t.id === "cad2d");
  if (!cad) throw new Error("没有 HY3D");
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
  for (const scheme of config.schemes ?? []) scheme.palette = "acad-b";
  design.replace({ config, customThemes: [] });
  design.markSaved();
  design.captureBaseline();
  design.select(null);
  remember("hy3d");
}

export interface WritePreview {
  file: string;
  before: string;
  after: string;
}

/** 写回前先算出差异。不写盘。 */
export async function previewHy3d(): Promise<WritePreview[]> {
  const config = design.get().doc.config;
  const files: { rel: string; text: string }[] = [];
  await commitHy3dDesign(config, readHy3dUi, async (rel, text) => {
    files.push({ rel, text });
  });
  const root = writeRoot("hy3d");
  const out: WritePreview[] = [];
  for (const file of files) {
    const full = `${root}/ui/${file.rel}`;
    let before = "";
    try {
      before = await readText(full);
    } catch {
      before = "";
    }
    arm(full);
    out.push({ file: `ui/${file.rel}`, before, after: file.text });
  }
  return out;
}

/** 把当前 HY3D 设计写回授权工作树里的规格。命令对不上就中止，不写半份。 */
export async function writeHy3d() {
  const config = design.get().doc.config;
  const root = writeRoot("hy3d");
  const files: { rel: string; text: string }[] = [];
  await commitHy3dDesign(config, readHy3dUi, async (rel, text) => {
    files.push({ rel, text });
  });
  for (const file of files) {
    const full = `${root}/ui/${file.rel}`;
    assertArmed(full);
    await writeText(full, file.text);
  }
  armed.clear();
  design.markPublished();
  remember("hy3d");
}

/** 读 HyMd 三套皮肤和菜单，盖到 HyMdTauri 上。 */
export async function readHymd() {
  refuseDirty();
  const writing = workTypes.find((t) => t.id === "writing");
  if (!writing) throw new Error("没有 HyMdTauri");
  const root = readRoot("hymd");
  const config = buildConfig("writing", "writing-good", {
    name: "hymd-writing",
    title: "HyMd 文档写作",
    identifier: "com.hy.hymd-writing",
    version: "0.1.0",
    description: writing.summary,
    icon: "layout"
  });
  const menus = hymdMenusFrom(parse(await readText(`${root}/src/parts/design/menus.json`)), config.menus);
  for (const s of HYMD_SCHEMES) {
    const scheme = config.schemes?.find((x) => x.id === s.scheme);
    if (!scheme) throw new Error("没有方案 " + s.scheme);
    const spec = parse(await readText(`${root}/src/skins/design/${s.file}`));
    scheme.ui = stampExplorerGhost(overlayHymd(scheme.ui, spec)) as typeof scheme.ui;
    scheme.menus = menus as NonNullable<typeof scheme.menus>;
    scheme.skin = s.skin;
  }
  config.sidePages = hymdSidePages();
  design.replace({ config: stampActive(config), customThemes: [] });
  design.markSaved();
  design.captureBaseline();
  design.select(null);
  const first = config.sidePages?.[0]?.id;
  if (first) design.selectSidePage(first);
  remember("hymd");
}

function hymdPlanned() {
  const config = design.get().doc.config;
  if (config.workType !== "writing") throw new Error("当前不是 HyMdTauri，没有写入。");
  const planned: { rel: string; text: string }[] = [];
  for (const s of HYMD_SCHEMES) {
    const scheme = config.schemes?.find((x) => x.id === s.scheme);
    if (!scheme?.ui) throw new Error("没有方案 " + s.scheme);
    planned.push({ rel: `src/skins/design/${s.file}`, text: jsonText(specFromHymd(scheme)) });
  }
  planned.push({ rel: "src/parts/design/menus.json", text: jsonText(hymdMenuSpec(config.menus)) });
  return planned;
}

export async function previewHymd(): Promise<WritePreview[]> {
  const root = writeRoot("hymd");
  const out: WritePreview[] = [];
  for (const file of hymdPlanned()) {
    const full = `${root}/${file.rel}`;
    let before = "";
    try {
      before = await readText(full);
    } catch {
      before = "";
    }
    arm(full);
    out.push({ file: file.rel, before, after: file.text });
  }
  return out;
}

/** 把当前 HyMdTauri 设计写回授权工作树里的皮肤和菜单。 */
export async function writeHymd() {
  const root = writeRoot("hymd");
  const files = hymdPlanned();
  for (const file of files) {
    const full = `${root}/${file.rel}`;
    assertArmed(full);
    await writeText(full, file.text);
  }
  armed.clear();
  design.markPublished();
  remember("hymd");
}
