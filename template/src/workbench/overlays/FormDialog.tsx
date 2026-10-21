import { useState } from "react";
import { useWorkbench } from "../context";
import type { DialogDef, DialogField, DialogStyle } from "../types";
import { Button, Toggle } from "../ui";
import { Dialog } from "./Dialog";

/** 按配置画出的弹窗。form 走模态 / 抽屉 / 向导；其余种类各自一块预览。 */
export function FormDialog({ def }: { def: DialogDef }) {
  const kind = def.kind ?? "form";
  if (kind === "menu") return <MenuFace def={def} />;
  if (kind === "list") return <ListFace def={def} />;
  if (kind === "banner") return <BannerFace def={def} />;
  return <FormFace def={def} system={kind === "system"} />;
}

function MenuFace({ def }: { def: DialogDef }) {
  const wb = useWorkbench();
  const close = () => wb.openDialog(null);
  return (
    <div className="wb-menu-pop" role="menu" aria-label={def.title}>
      <div className="wb-menu-title">{def.title}</div>
      {def.body && <p className="wb-form-note wb-menu-note">{def.body}</p>}
      {def.actions.map((a, i) =>
        a.separator ? (
          <div key={a.id || i} className="wb-menu-sep" />
        ) : (
          <button key={a.id} type="button" onClick={close}>
            {a.label}
          </button>
        )
      )}
    </div>
  );
}

function ListFace({ def }: { def: DialogDef }) {
  const wb = useWorkbench();
  const [q, setQ] = useState("");
  const items = def.actions.filter((a) => !a.separator && (!q || a.label.includes(q)));
  return (
    <div className="wb-list-pop" role="dialog" aria-label={def.title}>
      <input className="wb-input" placeholder={def.body || def.title} value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      <div className="wb-list-items">
        {items.map((a) => (
          <button key={a.id} type="button" onClick={() => wb.openDialog(null)}>
            {a.label}
          </button>
        ))}
        {items.length === 0 && <div className="wb-form-note">没有匹配</div>}
      </div>
    </div>
  );
}

function BannerFace({ def }: { def: DialogDef }) {
  const wb = useWorkbench();
  const close = () => wb.openDialog(null);
  return (
    <div className="wb-banner" role="status">
      <strong>{def.title}</strong>
      {def.body && <span className="wb-banner-text">{def.body}</span>}
      <span className="wb-sp" />
      {def.actions
        .filter((a) => !a.separator)
        .map((a) => (
          <Button key={a.id} primary={a.primary} onClick={close}>
            {a.label}
          </Button>
        ))}
    </div>
  );
}

function FormFace({ def, system }: { def: DialogDef; system: boolean }) {
  const wb = useWorkbench();
  const style: DialogStyle = def.style ?? (system ? "modal" : wb.config.layout.dialogStyle ?? "modal");
  const groups = def.groups?.length ? def.groups : unique(def.fields.map((f) => f.group).filter((g): g is string => !!g));
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState(groups[0] ?? "");
  const [values, setValues] = useState<Record<string, string | number | boolean>>(() => {
    const init: Record<string, string | number | boolean> = {};
    for (const f of def.fields) if (f.value !== undefined) init[f.id] = f.value;
    return init;
  });
  const set = (id: string, v: string | number | boolean) => setValues((s) => ({ ...s, [id]: v }));
  const close = () => wb.openDialog(null);
  const submit = () => {
    wb.notify("success", `已提交「${def.title}」`, "接入内核时，给对应命令填 core 方法。");
    close();
  };

  const fieldsOf = (group?: string) => def.fields.filter((f) => !group || f.group === group || (!f.group && !group));
  const note = (
    <>
      {system && <p className="wb-sys-note">系统窗口，这里是示意。</p>}
      {def.body ? <p className="wb-form-note">{def.body}</p> : null}
    </>
  );
  const body = (list: DialogField[]) => (
    <div className="wb-form">
      {list.map((f) => (
        <label key={f.id} className={"wb-form-row" + (f.type === "table" ? " table" : "")}>
          <span>{f.label}</span>
          <FieldInput field={f} value={values[f.id]} onChange={(v) => set(f.id, v)} />
        </label>
      ))}
    </div>
  );

  if (style === "sheet") {
    return (
      <div className="wb-sheet" role="dialog" aria-label={def.title}>
        <div className="wb-dialog-head">
          <span>{def.title}</span>
          <span className="wb-sp" />
          <button type="button" className="wb-btn" onClick={close}>
            关闭
          </button>
        </div>
        <div className="wb-dialog-body">
          {note}
          {groups.length
            ? groups.map((g) => (
                <section key={g}>
                  <h4>{g}</h4>
                  {body(fieldsOf(g))}
                </section>
              ))
            : body(def.fields)}
        </div>
        <div className="wb-dialog-foot">
          {def.actions.filter((a) => !a.separator).map((a) => (
            <Button key={a.id} primary={a.primary} onClick={a.primary ? submit : close}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (style === "wizard") {
    const steps = groups.length ? groups : ["设置"];
    const last = step >= steps.length - 1;
    const list = groups.length ? fieldsOf(steps[step]) : def.fields;
    return (
      <Dialog
        title={def.title}
        width={520}
        footer={
          <>
            <Button onClick={() => (step === 0 ? close() : setStep((n) => n - 1))}>{step === 0 ? "取消" : "上一步"}</Button>
            <Button primary onClick={() => (last ? submit() : setStep((n) => n + 1))}>
              {last ? "完成" : "下一步"}
            </Button>
          </>
        }
      >
        <div className="wb-wizard-steps">
          {steps.map((g, i) => (
            <span key={g} className={i === step ? "on" : ""}>
              {i + 1}. {g}
            </span>
          ))}
        </div>
        {note}
        {body(list)}
      </Dialog>
    );
  }

  return (
    <Dialog
      title={def.title}
      width={560}
      footer={def.actions.filter((a) => !a.separator).map((a) => (
        <Button key={a.id} primary={a.primary} onClick={a.primary ? submit : close}>
          {a.label}
        </Button>
      ))}
    >
      {note}
      {groups.length > 1 && (
        <div className="wb-form-tabs">
          {groups.map((g) => (
            <button key={g} type="button" className={g === tab ? "on" : ""} onClick={() => setTab(g)}>
              {g}
            </button>
          ))}
        </div>
      )}
      {body(groups.length > 1 ? fieldsOf(tab) : def.fields)}
    </Dialog>
  );
}

function FieldInput({ field, value, onChange }: { field: DialogField; value: string | number | boolean | undefined; onChange: (v: string | number | boolean) => void }) {
  if (field.type === "toggle") return <Toggle checked={value === true} onChange={onChange} />;
  if (field.type === "select") {
    return (
      <select className="wb-select" value={String(value ?? field.options?.[0]?.value ?? "")} onChange={(e) => onChange(e.target.value)}>
        {(field.options ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "color") return <input className="wb-input" type="color" value={String(value ?? "#6699cc")} onChange={(e) => onChange(e.target.value)} />;
  if (field.type === "table") {
    const cols = field.columns ?? [];
    const rows = field.rows ?? [];
    return (
      <table className="wb-form-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <input
      className="wb-input"
      type={field.type === "number" ? "number" : "text"}
      placeholder={field.placeholder}
      value={value === undefined ? "" : String(value)}
      onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
    />
  );
}

function unique(list: string[]): string[] {
  return [...new Set(list)];
}
