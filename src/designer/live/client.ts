export interface LiveInstance {
  id: string;
  product: "hy3d" | "hymd";
  label: string;
  skin: string;
  status: "pending" | "allowed";
  token: string;
}

export interface LiveInspect {
  tag: string;
  id: string;
  className: string;
  width: number;
  height: number;
  tokens: Record<string, string>;
  label: string;
}

async function post(body: unknown) {
  const res = await fetch("/__uitool/live", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = (await res.json()) as { error?: string; instances?: LiveInstance[]; token?: string; commandId?: string; pending?: boolean; result?: unknown };
  if (!res.ok) throw new Error(data.error || "连接失败");
  return data;
}

export async function listInstances(): Promise<LiveInstance[]> {
  const data = await post({ op: "list" });
  return data.instances ?? [];
}

export async function allowInstance(id: string) {
  const data = await post({ op: "allow", id });
  return data.token ?? "";
}

export async function dropInstance(id: string) {
  await post({ op: "drop", id });
}

async function command(inst: LiveInstance, name: string, payload: unknown) {
  const sent = await post({ op: "command", id: inst.id, token: inst.token, name, payload });
  const commandId = sent.commandId;
  for (let i = 0; i < 20; i++) {
    const got = await post({ op: "take", id: inst.id, token: inst.token, commandId });
    if (!got.pending) return got.result;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("开发窗口没有回应");
}

export function inspect(inst: LiveInstance) {
  return command(inst, "inspect", {}) as Promise<LiveInspect>;
}

export function patch(inst: LiveInstance, payload: unknown) {
  return command(inst, "patch", payload);
}

export function revertLive(inst: LiveInstance) {
  return command(inst, "revert", {});
}

export function publishLive(inst: LiveInstance) {
  return command(inst, "publish", {}) as Promise<{ tokens?: Record<string, string>; hyRibbon?: unknown }>;
}
