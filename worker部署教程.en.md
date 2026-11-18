# Worker deployment guide (Cloudflare)

This is the standalone version of chapter 13 in [Full guide](完整使用教程.en.md). It only covers deploying the bundled `worker.js` and getting the disguise domain and UUID.

> Server side only. For the tool itself, node formats and troubleshooting, see the [full guide](完整使用教程.en.md).

This guide ships with a minimal Worker (`worker.js` in the repository root). After deploying, open the domain and the page shows just two values: the disguise domain and the UUID. Copy them into this tool and you are done. No edgetunnel required — about 300 lines, VLESS over WebSocket only.

### 1. How it differs from edgetunnel

| | Bundled worker.js | edgetunnel |
| --- | --- | --- |
| Size | ~300 lines | several thousand |
| What you edit | one UUID line | UUID, PROXYIP, path, ... |
| Reading parameters after deploy | page shows domain + UUID | you piece them together yourself |
| Path requirement | any path, not checked | must match the code |
| Extra features | none | subscriptions, preferred IPs, more protocols |

For personal use this is enough. Reach for edgetunnel only if you need subscription endpoints or extra protocols.

### 2. What you need

| Item | Notes |
| --- | --- |
| Cloudflare account | free: `dash.cloudflare.com` |
| `worker.js` | repository root, or next to this tool |
| A UUID | generated in the next step |
| A browser | desktop is more comfortable |

### 3. Generate a UUID

1. Open `https://www.uuidgenerator.net/`
2. Copy the first v4 UUID, e.g. `3f2a1b4c-8d5e-4f6a-9b7c-1d2e3f4a5b6c`
3. Keep it somewhere — you will use it twice (Worker code and this tool)

> On Linux / macOS you can also run `uuidgen`.

### 4. Create the Worker and paste the code

1. Sign in at `dash.cloudflare.com`
2. **Workers & Pages** → **Create** → **Worker**
3. Name it `my-node` (anything works) → **Deploy**
4. Press **Edit code** and delete the sample code
5. Paste the entire contents of `worker.js`
6. Find this line near the top:

```js
uuid: "00000000-0000-0000-0000-000000000000",
```

7. Replace the value with the UUID from step 3
8. Press **Deploy**

> If you would rather not hard-code the UUID, add a `UUID` variable under the Worker's **Settings → Variables**; the code prefers it.

### 5. Open the page and copy both values

After deployment, open:

```
https://my-node.username.workers.dev
```

The page has two rows:

```
Disguise domain   my-node.abc.workers.dev        [Copy]
UUID              3f2a1b4c-8d5e-4f6a-9b7c-...     [Copy]
```

Press **Copy** on each.

If the UUID row shows a red warning that it is still a placeholder, step 4.7 did not take effect — fix the code and deploy again.

### 6. Fill them into the tool

| Field | Value |
| --- | --- |
| Protocol | VLESS |
| Port | 443 |
| UUID | copied from the page |
| Transport | WebSocket |
| Disguise domain (Host / SNI) | copied from the page |
| WS path | **leave the default** (the server does not check it) |
| TLS | checked |
| Node list | preferred IPs, one per line |

### 7. Verify

1. Open the Worker domain in a browser; the info page means the Worker is alive
2. Press **Convert**, download the config, import it into your client
3. Run a latency test in the client; a number means it connects. Then open `ip.sb` to confirm the exit IP changed
4. If that fails, use the table below

| Symptom | Cause | Fix |
| --- | --- | --- |
| Page will not load / 522 / 1101 | Worker not deployed or script threw | Check Worker logs, deploy again |
| Red placeholder warning on the page | `CONFIG.uuid` was not changed | Set a real UUID and deploy |
| All nodes time out | Wrong disguise domain or port; TLS off | Verify the domain; port 443; enable TLS |
| Nodes show "failed" | UUID does not match the Worker | Compare both strings character by character |
| Connects but some sites fail | Destination uses UDP, or the port is restricted by Cloudflare | Try another site; UDP apps are unsupported |
| 1015 / 429 | Rate limited | Wait, or reduce usage |

### 8. Quotas and caveats

- Workers free plan: roughly **100,000 requests per day** — fine for light use
- TCP forwarding only; UDP apps (some games, voice chat) will not work
- The info page is public: **anyone who knows the domain can read the UUID**, so do not post the domain publicly
- Keep it for yourself; an open proxy gets rate-limited or banned quickly

### 9. You can still use edgetunnel

If you need subscription endpoints, extra protocols or PROXYIP, deploy edgetunnel as its repository describes, then fill in the values by hand:

- UUID: `userID` in the code
- Disguise domain: `xxx.workers.dev`
- WS path: the path check in the code

The only real difference: you have to dig the values out instead of copying them from a page.

---

> Server side only. For the tool itself, node formats and troubleshooting, see the [full guide](完整使用教程.en.md).
