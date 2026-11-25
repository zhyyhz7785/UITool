// 只给本机开发态用的连接中转。不执行脚本，不读任意文件，不转发未列出的命令。
const ALLOWED = new Set(["inspect", "patch", "revert", "publish"]);

const instances = new Map();

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function allowOrigin(req, res) {
  const origin = String(req.headers.origin ?? "");
  let host = "";
  try {
    host = new URL(origin).hostname;
  } catch {
    host = "";
  }
  if (host === "127.0.0.1" || host === "localhost") {
    res.setHeader("access-control-allow-origin", origin);
  }
  res.setHeader("access-control-allow-headers", "content-type");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
}

function freshId() {
  return Math.random().toString(36).slice(2, 10);
}

export function liveBrokerPlugin() {
  return {
    name: "uitool-live-broker",
    configureServer(server) {
      server.middlewares.use("/__uitool/live", (req, res) => {
        const ip = req.socket?.remoteAddress || "";
        if (ip !== "127.0.0.1" && ip !== "::1" && ip !== "::ffff:127.0.0.1") {
          res.statusCode = 403;
          res.end();
          return;
        }
        allowOrigin(req, res);
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
            const op = body.op;
            if (op === "register") {
              if (body.product !== "hy3d" && body.product !== "hymd") throw new Error("未知产品");
              const id = freshId();
              instances.set(id, {
                id,
                product: body.product,
                label: String(body.label ?? body.product).slice(0, 80),
                skin: String(body.skin ?? "").slice(0, 40),
                status: "pending",
                token: "",
                queue: [],
                results: new Map(),
                seen: Date.now()
              });
              send(res, 200, { id, status: "pending" });
              return;
            }
            if (op === "poll") {
              const inst = instances.get(body.id);
              if (!inst) throw new Error("实例不在了");
              if (inst.status === "dropped") {
                instances.delete(body.id);
                send(res, 200, { status: "dropped", token: "", commands: [] });
                return;
              }
              inst.seen = Date.now();
              const commands = inst.queue.splice(0, inst.queue.length);
              send(res, 200, { status: inst.status, token: inst.status === "allowed" ? inst.token : "", commands });
              return;
            }
            if (op === "result") {
              const inst = instances.get(body.id);
              if (!inst || !inst.token || body.token !== inst.token) throw new Error("没有授权");
              inst.results.set(body.commandId, body.result ?? null);
              send(res, 200, { ok: true });
              return;
            }
            if (op === "list") {
              const now = Date.now();
              const rows = [...instances.values()]
                .filter((inst) => inst.status !== "dropped" && now - inst.seen < 15000)
                .map((inst) => ({ id: inst.id, product: inst.product, label: inst.label, skin: inst.skin, status: inst.status, token: inst.token }));
              send(res, 200, { instances: rows });
              return;
            }
            if (op === "drop") {
              const inst = instances.get(body.id);
              if (inst) inst.status = "dropped";
              send(res, 200, { ok: true });
              return;
            }
            if (op === "allow") {
              const inst = instances.get(body.id);
              if (!inst) throw new Error("实例不在了");
              inst.status = "allowed";
              inst.token = freshId() + freshId();
              send(res, 200, { token: inst.token });
              return;
            }
            if (op === "command") {
              const inst = instances.get(body.id);
              if (!inst || inst.status !== "allowed" || body.token !== inst.token) throw new Error("没有授权");
              if (!ALLOWED.has(body.name)) throw new Error("这条指令不在允许范围内");
              const commandId = freshId();
              inst.queue.push({ commandId, name: body.name, payload: body.payload ?? {} });
              send(res, 200, { commandId });
              return;
            }
            if (op === "take") {
              const inst = instances.get(body.id);
              if (!inst || body.token !== inst.token) throw new Error("没有授权");
              const result = inst.results.get(body.commandId);
              if (result === undefined) {
                send(res, 200, { pending: true });
                return;
              }
              inst.results.delete(body.commandId);
              send(res, 200, { pending: false, result });
              return;
            }
            throw new Error("未知操作");
          } catch (e) {
            send(res, 400, { error: e instanceof Error ? e.message : String(e) });
          }
        });
      });
    }
  };
}
