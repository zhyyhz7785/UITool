import type { AppMeta, UiConfig, UiScheme } from "@tpl/workbench/types";
import { assertWorkType, type SchemeDef, type WorkTypeDef } from "./kit";
import { cad } from "./work/cad";
import { general } from "./work/general";
import { writing } from "./work/writing";

export type { SchemeDef, WorkTypeDef } from "./kit";

export const workTypes: WorkTypeDef[] = [writing, cad, general];

export const KNOWN_WORK_TYPES = new Set(workTypes.map((t) => t.id));

for (const type of workTypes) assertWorkType(type);

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function toScheme(s: SchemeDef, tuned: boolean): UiScheme {
  return {
    id: s.id,
    name: s.name,
    desc: s.desc,
    source: s.source,
    skin: s.skin,
    palette: s.palette,
    listed: s.listed !== false,
    chrome: s.chrome ? clone(s.chrome) : undefined,
    tuned,
    ui: clone(s.ui),
    menus: s.menus ? clone(s.menus) : undefined
  };
}

/** 生成一份设计：选中的皮肤放在顶层，同产品的其他皮肤附在 schemes 里。保留传入的应用信息。 */
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
