import type { SchemeChrome } from "@tpl/workbench/types";
import { useEffect, useState } from "react";
import { Field, TextField } from "./controls";
import { PRODUCT_TOKENS, tokenGroups } from "./productTokens";
import { design, useDesign } from "./store";

function setToken(id: string, value: string) {
  design.setConfig((c) => {
    const tokens = { ...(c.tokens ?? {}) };
    if (!value.trim()) delete tokens[id];
    else tokens[id] = value.trim();
    return { ...c, tokens };
  }, "token:" + id);
}

function setChrome(chrome: SchemeChrome | undefined) {
  design.setConfig((c) => ({
    ...c,
    schemes: c.schemes?.map((s) => (s.id === c.scheme ? { ...s, chrome } : s))
  }));
}

function RibbonMode({ mode, onCommit }: { mode: "full" | "compact" | "tabs"; onCommit: (mode: "full" | "compact" | "tabs") => void }) {
  const [text, setText] = useState<string>(mode);
  useEffect(() => setText(mode), [mode]);
  return (
    <TextField
      value={text}
      placeholder="full、compact 或 tabs"
      onChange={(value) => {
        setText(value);
        if (value === "full" || value === "compact" || value === "tabs") onCommit(value);
      }}
    />
  );
}

/** 三个预设共用。只改产品已有的 CSS 变量，以及 HY Ribbon 自己的常显状态。 */
export function ProductTokenFields() {
  const stored = useDesign((s) => s.doc.config.tokens);
  const tokens = stored ?? {};
  const scheme = useDesign((s) => s.doc.config.schemes?.find((item) => item.id === s.doc.config.scheme));
  const ribbon = scheme?.chrome?.hyRibbon;
  return (
    <div>
      <div className="ut-note">留空表示沿用产品里的值，不在这里另写一套默认。改完会反映到预览；连上开发窗口后，同一组值会写到真实界面。</div>
      {tokenGroups().map((group) => (
        <div key={group}>
          <div className="ut-group-title">{group}</div>
          {PRODUCT_TOKENS.filter((token) => token.group === group).map((token) => (
            <Field key={token.id} label={token.label}>
              <TextField value={tokens[token.id] ?? ""} placeholder={token.id} onChange={(value) => setToken(token.id, value)} />
            </Field>
          ))}
        </div>
      ))}
      {scheme?.skin === "hy-ribbon" && ribbon && (
        <>
          <div className="ut-group-title">HY Ribbon 常显</div>
          <Field label="显示方式">
            <RibbonMode
              mode={ribbon.mode}
              onCommit={(mode) => setChrome({ ...scheme.chrome, hyRibbon: { ...ribbon, mode } })}
            />
          </Field>
          <div className="ut-note">分组顺序和常显上限在连接真实窗口后，按组调整。这里记下的是 hy3d.ui.hyRibbon，不是另一份命令表。</div>
        </>
      )}
    </div>
  );
}
