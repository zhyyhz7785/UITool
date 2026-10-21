import type { AppMeta, UiConfig, UiScheme } from "@tpl/workbench/types";
import { assertWorkType, scoreTotal, type SchemeDef, type WorkTypeDef } from "./kit";
import { cad } from "./work/cad";
import { image } from "./work/image";
import { model3d } from "./work/model3d";
import { sheet } from "./work/sheet";
import { structure } from "./work/structure";
import { ocr } from "./work/ocr";
import { utility } from "./work/utility";
import { video } from "./work/video";
import { writing } from "./work/writing";

export type { SchemeDef, WorkTypeDef } from "./kit";
export { scoreTotal } from "./kit";

export const workTypes: WorkTypeDef[] = [writing, cad, structure, model3d, image, video, sheet, utility, ocr];

for (const type of workTypes) assertWorkType(type);

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function toScheme(s: SchemeDef, tuned: boolean): UiScheme {
  return { id: s.id, tier: s.tier, name: s.name, desc: s.desc, score: scoreTotal(s.score), source: s.source, tuned, ui: clone(s.ui), menus: s.menus ? clone(s.menus) : undefined };
}

/** 生成一份设计：选中的方案放在顶层，另外两套放进 schemes。保留传入的应用信息。 */
export function buildConfig(typeId: string, schemeId: string, keep?: AppMeta): UiConfig {
  const type = workTypes.find((t) => t.id === typeId) ?? workTypes[0];
  const scheme = type.schemes.find((s) => s.id === schemeId) ?? type.schemes[0];
  const app: AppMeta = keep ?? { name: type.id, title: type.name, identifier: `com.hy.${type.id}`, version: "0.1.0", description: type.summary, icon: "layout" };
  return {
    version: 2,
    app: { ...app },
    workType: type.id,
    scheme: scheme.id,
    schemes: type.schemes.map((s) => toScheme(s, s.id === scheme.id)),
    dialogs: clone(type.dialogs),
    commands: clone(type.commands),
    menus: clone(scheme.menus ?? type.menus),
    ...clone(scheme.ui)
  };
}
