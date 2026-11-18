/**
 * 极简 VLESS over WebSocket 服务端（Cloudflare Worker）
 * ------------------------------------------------------
 * 部署后打开 Worker 地址，页面只显示两个值：
 *   1. 伪装域名（Host / SNI）
 *   2. UUID
 * 把这两个值填进 IP to Sub File，即可生成配置。
 *
 * 使用方法：
 *   1. 打开 https://www.uuidgenerator.net/ 生成一个 v4 UUID
 *   2. 替换下面 CONFIG.uuid 的值（或在 Worker 的 Settings → Variables 里加 UUID）
 *   3. Workers & Pages → Create → Worker → 粘贴本文件 → Deploy
 *   4. 打开 https://你的worker.用户名.workers.dev 复制页面上的两个值
 *
 * 说明：
 *   - 路径不校验，填 "/" 或任意路径都能连（工具里留默认值也行）
 *   - 只支持 TCP 转发（浏览器访问网站够用），不支持 UDP
 *   - 免费版每天约 10 万次请求，请勿用于大流量下载
 */

import { connect } from "cloudflare:sockets";

const CONFIG = {
  // 必改：换成你自己生成的 UUID（格式 8-4-4-4-12）
  uuid: "00000000-0000-0000-0000-000000000000",

  // 页面标题，随便改
  title: "IP to Sub File · 节点信息"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const uuid = ((env && env.UUID) || CONFIG.uuid || "").trim().toLowerCase();

    const upgrade = (request.headers.get("Upgrade") || "").toLowerCase();
    if (upgrade === "websocket") {
      return handleVless(request, uuid);
    }

    return new Response(infoPage(url.host, uuid, CONFIG.title), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};

/* ---------------------------------------------------------------- */
/* VLESS over WebSocket                                             */
/* ---------------------------------------------------------------- */

async function handleVless(request, uuid) {
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];
  server.accept();

  let remote = null;
  let writer = null;
  let closed = false;
  let state = "header";        // header → connecting → open
  let pending = [];

  const shutdown = (code) => {
    if (closed) return;
    closed = true;
    try { server.close(code || 1000, "closed"); } catch (e) {}
    try { if (remote) remote.close(); } catch (e) {}
  };

  server.addEventListener("message", async (event) => {
    if (closed) return;

    // 已经建立隧道：直接转发
    if (state === "open") {
      try { await writer.write(await toBytes(event.data)); }
      catch (err) { shutdown(1011); }
      return;
    }

    // 正在连接：先缓存，等隧道建好再发
    if (state === "connecting") {
      pending.push(event.data);
      return;
    }

    // 第一条消息：VLESS 请求头
    state = "connecting";
    try {
      const buf = await toBytes(event.data);
      const head = parseVless(buf);

      if (head.error || head.cmd !== 1) { shutdown(1003); return; }
      if (hex(head.id) !== uuid.replace(/-/g, "")) { shutdown(1008); return; }

      remote = connect({ hostname: head.host, port: head.port });
      writer = remote.writable.getWriter();
      const reader = remote.readable.getReader();

      // VLESS 应答头：版本 + 附加长度
      server.send(new Uint8Array([0, 0]));

      // 请求头后面可能紧跟第一段数据
      if (buf.length > head.offset) {
        await writer.write(buf.slice(head.offset));
      }

      // 补发连接期间收到的数据
      while (pending.length) {
        await writer.write(await toBytes(pending.shift()));
      }

      state = "open";
      pipe(server, reader, writer, shutdown);
    } catch (err) {
      shutdown(1011);
    }
  });

  server.addEventListener("close", () => shutdown(1000));
  server.addEventListener("error", () => shutdown(1011));

  return new Response(null, { status: 101, webSocket: client });
}

async function pipe(server, reader, writer, shutdown) {
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      server.send(value);
    }
  } catch (err) {
    /* 忽略，走统一关闭 */
  } finally {
    try { writer.releaseLock(); } catch (e) {}
    shutdown(1000);
  }
}

async function toBytes(data) {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (typeof data === "string") return new TextEncoder().encode(data);
  if (data && data.arrayBuffer) return new Uint8Array(await data.arrayBuffer());
  return new Uint8Array(0);
}

/**
 * 解析 VLESS 请求头
 * 结构：版本(1) UUID(16) 附加长度(1) 附加(可变) 命令(1) 端口(2) 地址类型(1) 地址(可变)
 * 返回 { id, cmd, port, host, offset } 或 { error }
 */
function parseVless(buf) {
  if (!buf || buf.length < 22) return { error: "short" };

  let p = 0;
  const ver = buf[p++];
  if (ver !== 0) return { error: "version" };

  const id = buf.slice(p, p + 16);
  p += 16;

  const optLen = buf[p++];
  if (p + optLen + 4 > buf.length) return { error: "opt" };
  p += optLen;

  const cmd = buf[p++];
  const port = (buf[p++] << 8) | buf[p++];
  const atyp = buf[p++];

  let host;

  if (atyp === 1) {
    if (p + 4 > buf.length) return { error: "addr" };
    host = buf[p] + "." + buf[p + 1] + "." + buf[p + 2] + "." + buf[p + 3];
    p += 4;
  } else if (atyp === 2) {
    const len = buf[p++];
    if (p + len > buf.length) return { error: "addr" };
    host = new TextDecoder().decode(buf.slice(p, p + len));
    p += len;
  } else if (atyp === 3) {
    if (p + 16 > buf.length) return { error: "addr" };
    const parts = [];
    for (let i = 0; i < 8; i++) {
      parts.push(((buf[p] << 8) | buf[p + 1]).toString(16));
      p += 2;
    }
    host = parts.join(":");
  } else {
    return { error: "atyp" };
  }

  return { id, cmd, port, host, offset: p };
}

function hex(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
  }
  return out;
}

/* ---------------------------------------------------------------- */
/* 信息页：只显示伪装域名和 UUID                                      */
/* ---------------------------------------------------------------- */

function infoPage(host, uuid, title) {
  const placeholder = !uuid || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(uuid);
  const safeHost = esc(host);
  const safeUuid = esc(placeholder ? "还没有设置 UUID，请先修改代码里的 CONFIG.uuid" : uuid);

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    background: #f5f6f8; color: #101828;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #0b0d11; color: #e7eaf0; }
    .card { background: #12151c; border-color: #232936; }
    .row { background: #0f131a; border-color: #232936; }
    .hint { color: #98a1b3; }
    code { color: #e7eaf0; }
  }
  .card {
    width: 100%; max-width: 520px;
    padding: 22px;
    background: #fff;
    border: 1px solid #e4e7ec;
    border-radius: 14px;
  }
  h1 { margin: 0 0 4px; font-size: 17px; }
  .hint { margin: 0 0 18px; color: #667085; font-size: 12.5px; }
  .row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; margin-bottom: 10px;
    background: #f8f9fb;
    border: 1px solid #e4e7ec;
    border-radius: 10px;
  }
  .row .label { flex: 0 0 84px; color: #667085; font-size: 12.5px; }
  code {
    flex: 1 1 auto; min-width: 0;
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 13px; word-break: break-all;
    color: #101828;
  }
  button {
    flex: 0 0 auto;
    padding: 6px 10px;
    font: inherit; font-size: 12.5px;
    color: #fff; background: #2563eb;
    border: 0; border-radius: 7px; cursor: pointer;
  }
  button:active { background: #1d4ed8; }
  .warn { color: #b42318; font-size: 12.5px; margin: 6px 0 0; }
</style>
</head>
<body>
  <div class="card">
    <h1>${esc(title)}</h1>
    <p class="hint">把下面两个值填进 IP to Sub File 即可，路径保持默认。</p>

    <div class="row">
      <span class="label">伪装域名</span>
      <code id="host">${safeHost}</code>
      <button data-copy="host">复制</button>
    </div>

    <div class="row">
      <span class="label">UUID</span>
      <code id="uuid">${safeUuid}</code>
      <button data-copy="uuid">复制</button>
    </div>

    ${placeholder ? '<p class="warn">UUID 还是占位值，客户端会连不上。请先修改 Worker 代码里的 CONFIG.uuid。</p>' : ""}
  </div>

<script>
document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-copy]");
  if (!b) return;
  var el = document.getElementById(b.getAttribute("data-copy"));
  if (!el) return;
  var text = el.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    var ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove();
  }
  b.textContent = "已复制";
  setTimeout(function () { b.textContent = "复制"; }, 1200);
});
</script>
</body>
</html>`;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
