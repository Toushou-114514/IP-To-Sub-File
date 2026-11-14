# IP to Subscription File · Complete User Guide

> Turn a list of IPs / domains into a config you can import straight into Clash, sing-box, Shadowrocket or v2rayN.
> This guide covers: how the tool works, what every field means, how to use each output format, how to import it, and how to debug failures.

---

## Contents

1. [What the tool is](#1-what-the-tool-is)
2. [Three concepts to understand first](#2-three-concepts-to-understand-first)
3. [Before you start](#3-before-you-start)
4. [Interface overview](#4-interface-overview)
5. [Card 1: Node list](#5-card-1-node-list)
6. [Card 2: Node parameters](#6-card-2-node-parameters)
7. [Card 3: Naming](#7-card-3-naming)
8. [Card 4: Output format](#8-card-4-output-format)
9. [What the generated config looks like](#9-what-the-generated-config-looks-like)
10. [Importing into clients](#10-importing-into-clients)
11. [Verifying it works](#11-verifying-it-works)
12. [Error reference](#12-error-reference)
13. [Where the server comes from (Cloudflare Worker)](#13-where-the-server-comes-from-cloudflare-worker)
14. [Security and quotas](#14-security-and-quotas)
15. [FAQ](#15-faq)
16. [Quick reference](#16-quick-reference)

---

## 1. What the tool is

A **single-file web tool** that runs entirely in the browser. None of your data is uploaded anywhere.

It does exactly one thing:

```
your IP list + parameters  →  a config file your client can read
```

It **does not provide any routes**. It is not a server. Every value in the config (UUID, domain, path) must come from a server you already have.

### What it can do

| Capability | Description |
| --- | --- |
| Batch node generation | One IP or domain per line, dozens or hundreds at once |
| Four output formats | Clash, sing-box, Shadowrocket, v2rayN |
| Five protocols | VLESS, VMess, Trojan, Shadowsocks, Hysteria2 |
| Share-link import | Paste a `vless://` style link and every field is filled in |
| Automatic flags | Country code becomes an emoji such as 🇭🇰 🇯🇵 |
| Custom file name | Name the download yourself; the extension is added automatically |
| Dark mode | Follow system / dark / light |

### What it cannot do

- ❌ It will not set up a server for you
- ❌ It does not auto-update configs (regenerate when you need a change)
- ❌ It does not bypass network restrictions by itself

---

## 2. Three concepts to understand first

```
your device ──► preferred IP (Cloudflare edge) ──► server (Worker / VPS) ──► destination
                     ↑ Host tells Cloudflare which site
                     ↑ UUID tells the server you are a valid user
```

| Term | What it is | Who provides it |
| --- | --- | --- |
| **Node / server address** | The IP or domain you actually connect to | Preferred-IP sites / your domain |
| **Port** | Port used for the connection | Server config |
| **UUID / password** | Credential, equivalent to a username and password | You generate it and put it in the server |
| **Disguise domain (Host / SNI)** | Tells the CDN which site to route to | Your domain (a Worker gives you one) |
| **WS path** | The URL path the server listens on | Server config |

The three most common failures are always the same story — one of these five values does not match:

1. UUID was left as the auto-generated placeholder → server rejects it
2. WS path differs by one character → 404
3. Disguise domain was set to a preferred IP → certificate error / timeout

---

## 3. Before you start

| You need | Notes |
| --- | --- |
| A browser | Phone or desktop; the layout is responsive |
| The tool page | Your GitHub Pages URL, or the HTML file opened locally |
| A server | Cloudflare Worker / your own VPS / somebody else's service (see [section 13](#13-where-the-server-comes-from-cloudflare-worker)) |
| A client | Clash Verge, sing-box, Shadowrocket or v2rayN |

> The page works fully offline. It only goes online when a line has no country code and it looks up a flag by IP.

---

## 4. Interface overview

Four blocks, top to bottom:

```
┌──────────────────────────────────────┐
│ Title + theme toggle                 │
├──────────────────────────────────────┤
│ 1 Node list      ← paste your IPs    │
├──────────────────────────────────────┤
│ 2 Node parameters ← UUID / domain / path │
│   └ collapsible guide: where to get them │
├──────────────────────────────────────┤
│ 3 Naming         ← prefix + file name │
├──────────────────────────────────────┤
│ 4 Output format  ← pick, convert, download │
└──────────────────────────────────────┘
Footer: author, repo, JS status
```

**Auto-convert**: about 0.5 seconds after you change any field the output is regenerated. You can also press **Convert** manually.

**Theme toggle**: top-right button cycles "follow system → dark → light"; your choice is remembered.

**Footer status**: the small line at the very bottom. If it shows a red "JavaScript is not running", the script did not execute and conversion will not work — usually a corrupted file from copy-paste.

---

## 5. Card 1: Node list

### Basic format

```
IP-or-domain#CC Name
```

One per line:

```
104.16.0.1#HK Hong Kong-01
104.17.2.3#JP Japan-02
cdn.example.com#US United States
2400:cb00::1#SG Singapore IPv6
```

### Fields

| Part | Required | Notes |
| --- | --- | --- |
| Address | ✅ | IPv4, IPv6 or domain |
| `#` | Optional | Separator before the display name |
| Country code | Optional | Two letters such as `HK`, `JP`, `US`; drives the flag |
| Name | Optional | Defaults to the address itself |

### Ports can be inline

```
104.16.0.1:2053#HK Hong Kong
```

This node uses port `2053`, which **overrides** the global port in card 2.

- No port inline → uses the card 2 port
- Port inline → uses that port

### IPv6 syntax

```
[2400:cb00::1]:443#SG Singapore
[2400:cb00::1]#SG Singapore
```

Brackets stop the colons from being read as a port separator.

### When the country code is missing

```
104.16.0.1#Hong Kong
```

The tool queries a public API (`ipwho.is`, falling back to `api.country.is`) to find the country, then adds the flag. Results are cached for 30 days.

- Domains are never looked up (the lookup only works on IPs)
- If the lookup fails the name is used as-is; conversion still works

### Lines that are skipped

- Empty lines
- Lines starting with `#` or `//`
- Obviously invalid addresses (e.g. `999.1.1.1`)
- Malformed domains

Skipping never affects the other lines; the valid count is shown at the bottom.

### Tips

- 50–100 lines at once is fine; conversion is fast
- Names may contain spaces, Chinese characters and symbols
- The same IP on different ports produces separate nodes

---

## 6. Card 2: Node parameters

Everything in this card is **applied to every node above**.

### 6.1 Import from a node link (optional)

Paste a share link and press **Import**. Every field below is filled in and the node list is generated automatically.

Supported schemes:

```
vless://
vmess://
trojan://
ss://
hysteria2://
hy2://
```

Imported values:

- Server address and port
- UUID or password
- Transport (ws / tcp)
- TLS flag
- **Disguise domain (Host)**
- **SNI**
- **WS path**
- Node name

> If you have the original link, do not type by hand — import is safer.

### 6.2 Protocol

| Protocol | Credential | Typical use |
| --- | --- | --- |
| VLESS | UUID | Workers / Xray, most common |
| VMess | UUID | Older but widely supported |
| Trojan | Password | Looks like ordinary HTTPS traffic |
| Shadowsocks | Password + cipher | Lightweight, broad client support |
| Hysteria2 | Password | QUIC-based, good on poor networks |

### 6.3 Port

Default `443`.

Behind Cloudflare only these ports are proxied:

```
443  2053  2083  2087  2096  8443
```

Anything else is not forwarded and will never connect.

### 6.4 UUID / password

**Must match the server exactly.**

If left empty the tool generates a placeholder and warns you — that value only keeps the config structurally valid and **will not connect to anything**.

UUID format:

```
8-4-4-4-12
3f2a1b4c-8d5e-4f6a-9b7c-1d2e3f4a5b6c
```

Generate one with:

- Online: `https://www.uuidgenerator.net/`
- Linux / macOS: `uuidgen`
- Linux: `cat /proc/sys/kernel/random/uuid`

> Trojan, Shadowsocks and Hysteria2 use a password instead of a UUID. It also has to come from the server.

### 6.5 Cipher (Shadowsocks only)

| Option | Notes |
| --- | --- |
| `aes-256-gcm` | Default, best compatibility |
| `aes-128-gcm` | Lighter |
| `chacha20-ietf-poly1305` | Faster on devices without AES acceleration |
| `2022-blake3-aes-256-gcm` | Newer; server must support it |

Must match the server or the connection fails immediately.

### 6.6 Transport (VLESS / VMess / Trojan)

| Option | Notes |
| --- | --- |
| **WebSocket** | HTTP upgrade; traverses CDNs; the default |
| TCP | Direct connection; cannot go through a CDN |

Behind Cloudflare you must use WebSocket.

### 6.7 Disguise domain (Host / SNI)

**Host and SNI are merged into a single field.** One value is used for both.

| Scenario | What to enter |
| --- | --- |
| Cloudflare Worker | `my-node.username.workers.dev` |
| Your own domain behind CF | `cdn.example.com` (must be orange-clouded) |
| Somebody else's service | The `host=` / `sni=` values from the share link |

Rules:

- No `https://`
- No trailing `/`
- **Never a preferred IP** (an IP has no matching certificate, TLS will fail)

If left empty:

- Server address is an IP → no Host header, SNI uses the IP
- Server address is a domain → Host and SNI both use that domain

> This preserves the old behaviour for compatibility. Behind a CDN you should always fill it in.

### 6.8 WS path

The URL path the server listens on.

| Source | How to find it |
| --- | --- |
| Share link | The value after `path=`, URL-decoded (`%2F` = `/`) |
| Worker code | A check such as `url.pathname === '/?ed=2048'` |
| Nginx reverse proxy | `location /ws { ... }` |
| Parameter absent | Usually `/` |

The tool ships with this default:

```
/apps/novels/proxyip=ProxyIP.HK.CMLiussss.net
```

Change it to your real path if it does not apply.

Common values: `/`, `/ws`, `/ray`, `/vless`, `/?ed=2048`.

**The path must match character for character** — one wrong character gives a 404.

### 6.9 TLS / skip certificate verification

| Checkbox | Applies to | Notes |
| --- | --- | --- |
| TLS (on by default) | VLESS / VMess | Required behind a CDN |
| Skip certificate verification | Trojan / Hysteria2 | For self-signed certs; not for public CDNs |

---

## 7. Card 3: Naming

### Name prefix

Prepended to every node name so you can tell sources apart.

```
prefix "home-" + node "Hong Kong" → "home-Hong Kong"
```

Leave empty for no prefix.

### Download file name

| Input | Result (Clash example) |
| --- | --- |
| Empty | `config.yaml` |
| `my-sub` | `my-sub.yaml` |
| `my-sub.txt` | `my-sub.txt` (extension kept) |
| `a/b:c` | `a_b_c.yaml` (illegal characters become `_`) |

Default names by format:

| Format | Default file name |
| --- | --- |
| Clash | `config.yaml` |
| sing-box | `config.json` |
| Shadowrocket | `shadowrocket-sub.txt` |
| v2rayN | `v2rayn-sub.txt` |

### Generate flags from country codes

When checked, `#HK Hong Kong` becomes `🇭🇰 Hong Kong`.

Some clients render emoji poorly; turn it off if that bothers you.

---

## 8. Card 4: Output format

| Format | Output | Best for |
| --- | --- | --- |
| **Clash / Mihomo** | Full YAML config | Clash Verge, Clash Meta, ClashX |
| **sing-box** | Full JSON config | SFA / SFI / SFM |
| **Shadowrocket** | Base64 subscription text | Shadowrocket |
| **v2rayN** | Plain share links, one per line | v2rayN, v2rayNG |

### What the Clash config contains

- `mixed-port: 7890`, `allow-lan: false`, `mode: rule`
- `proxies:` one entry per node
- `proxy-groups:` two groups
  - **Node Select** (manual)
  - **Auto Select** (url-test)
- `rules:`
  - `GEOIP,CN,DIRECT`
  - `MATCH,Node Select`

### What the sing-box config contains

- `log`, `dns`, `inbounds` (tun / mixed)
- `outbounds`: one per node plus a `urltest` auto group
- `route`: mainland IPs and domains direct, everything else through the auto group

### Shadowrocket output

A standard Base64 subscription; decoded it is a list of share links. The file extension is `.txt`.

### v2rayN output

Plain-text links you can copy and batch-import; no Base64 decoding required.

---

## 9. What the generated config looks like

A VLESS + WebSocket + CDN node in Clash:

```yaml
proxies:
  - name: "Hong Kong-01"
    type: vless
    server: "104.16.0.1"
    port: 443
    uuid: "3f2a1b4c-8d5e-4f6a-9b7c-1d2e3f4a5b6c"
    udp: true
    tls: true
    servername: "my-node.abc.workers.dev"
    client-fingerprint: chrome
    network: ws
    ws-opts:
      path: "/?ed=2048"
      headers:
        Host: "my-node.abc.workers.dev"
```

The equivalent share link:

```
vless://3f2a1b4c-...@104.16.0.1:443?encryption=none&security=tls&sni=my-node.abc.workers.dev&host=my-node.abc.workers.dev&type=ws&path=%2F%3Fed%3D2048#Hong%20Kong-01
```

> Note that `server` is the preferred IP while `servername` / `Host` are the real domain. They are not interchangeable.

---

## 10. Importing into clients

### Clash Verge / Clash Meta / ClashX

1. Choose **Clash / Mihomo** → **Convert**
2. Press **Download** to get `config.yaml`
3. Client → **Profiles** → **Import**
4. Pick the file
5. Select the profile, then enable system proxy or TUN mode

### sing-box (SFA / SFI / SFM)

1. Choose **sing-box** → convert → download `config.json`
2. Client → **Profiles** → `+` → **Import from file**
3. Pick the file and activate it

### Shadowrocket

**Option A: file import**

1. Choose **Shadowrocket** → convert → download `shadowrocket-sub.txt`
2. Save it to the Files app
3. Shadowrocket → `+` on the home screen → **Import from file**

**Option B: subscription URL (recommended for updates)**

1. Upload the generated txt to any static host (GitHub Pages, Gist)
2. Shadowrocket → `+` → type **Subscribe**
3. Paste the direct URL

### v2rayN (Windows)

1. Choose **v2rayN** → convert → **Copy**
2. v2rayN → **Servers** → **Import bulk URL from clipboard**
3. Select a node → **Set as active server**

### Other clients

Anything that accepts Clash YAML or share links will work:

- Clash for Windows / Clash for Android: use the Clash format
- NekoBox / Matsuri: use the v2rayN links
- Stash / Loon: use the Clash format

---

## 11. Verifying it works

Work through these in order; the first failure tells you which layer is broken.

| Step | Action | Expected |
| --- | --- | --- |
| 1 | Open `https://disguise-domain` in a browser | Some response, even an error page |
| 2 | Open `https://disguise-domain/path` | **400** or **426** |
| 3 | Check the address-bar certificate | No warning |
| 4 | Run a latency test in the client | A number, not everything timing out |
| 5 | Connect and open `ip.sb` | Shows an IP that is not yours |

> 400 / 426 is the normal answer a WebSocket endpoint gives to a plain browser request. It means "the path exists and the service is running".

---

## 12. Error reference

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Everything times out | Wrong disguise domain or port; domain not behind CF; Worker not deployed | Verify the domain in a browser; try port 443 |
| "Failed" / connection closed | UUID mismatch, or wrong WS path | Match the server's UUID; compare the path character by character |
| 404 | Wrong WS path | Re-read the server config |
| Certificate error | Disguise domain set to a preferred IP | Use the real domain |
| Connects but no internet | Server PROXYIP setup, quota exhausted, or server routing | Check server logs and CF request counts |
| Some nodes work, some do not | Mixed quality in the preferred IPs | Refresh the IP list; use the auto group |
| Footer says "JavaScript is not running" | File corrupted by copy-paste (the `•••` case) | Download the file again instead of copying |
| Empty output | No valid addresses in the input | Check the format and stray characters |

### Self-check commands (desktop)

```bash
# Is the domain reachable?
curl -s -o /dev/null -w "%{http_code}\n" https://your-domain

# Is the path correct? (400 / 426 means yes)
curl -s -o /dev/null -w "%{http_code}\n" https://your-domain/path

# Is a preferred IP reachable?
curl -s -o /dev/null -w "%{http_code}\n" --resolve your-domain:443:104.16.0.1 https://your-domain
```

---

## 13. Where the server comes from (Cloudflare Worker)

The tool does not provide routes. The cheapest free option is a Cloudflare Worker.

### 13.1 Generate a UUID

Open `https://www.uuidgenerator.net/` and copy the first v4 UUID.

### 13.2 Deploy the Worker

1. Sign in at `dash.cloudflare.com`
2. **Workers & Pages** → **Create** → **Workers**
3. Name it something like `my-node` → **Deploy**
4. Press **Edit code** and delete the sample
5. Paste a ready-made script (for example `worker.js` from `cmliu/edgetunnel` on GitHub)
6. Find `let userID = '...'` and replace it with your UUID
7. Note the path check, e.g. `url.pathname === '/?ed=2048'`
8. Press **Deploy**

### 13.3 Get the disguise domain

After deployment you get an address like:

```
https://my-node.username.workers.dev
```

Strip `https://` and the trailing `/`:

```
my-node.username.workers.dev
```

That is the disguise domain. The certificate is issued by Cloudflare automatically.

### 13.4 Fill it back into the tool

| Field | Value |
| --- | --- |
| Protocol | VLESS |
| Port | 443 |
| UUID | The one you generated |
| Transport | WebSocket |
| Disguise domain | `my-node.username.workers.dev` |
| WS path | `/?ed=2048` (whatever the code says) |
| Node list | Preferred IPs, one per line |

> The collapsible "How do I get a UUID and a disguise domain? (Cloudflare)" block on the page is a condensed version of this section.

---

## 14. Security and quotas

### Security

- UUID plus domain is effectively your account password; mask it in screenshots
- Never use publicly shared nodes — the owner can see all your traffic
- Rotate the UUID periodically (change it on the server, then regenerate)
- Do not use configs from unknown sources on public Wi-Fi

### Quotas

- The Workers free plan allows roughly **100,000 requests per day**
- Fine for light browsing, not for heavy downloads or 24/7 use
- Check usage under **Workers & Pages → your Worker → Metrics**

### Terms of service

Running non-HTML traffic through the CDN sits in a grey area of Cloudflare's terms. Personal, light use is low risk; large-scale use or redistribution is not advisable.

---

## 15. FAQ

**Do I need to buy a domain?**
No. A Worker comes with a free `workers.dev` subdomain and a valid certificate.

**Why must the UUID be filled in?**
Left empty, the tool generates a random placeholder the server will never accept. It warns you but still lets you generate.

**Do configs update automatically?**
No. There is no auto-update feature; regenerate and re-import when you need a change.

**Will nodes with the same country code collide?**
No. If names would duplicate, the tool adds a number to keep them unique.

**Why do all nodes fail even though the IPs are fine?**
The IP is only the entry point. UUID, domain and path decide whether the connection succeeds.

**Can I generate hundreds of nodes?**
Yes, but clients load slowly. Keep 20–50 good ones.

**How should I use the auto-select group?**
Clash tests latency periodically and picks the fastest node. Use the manual group if you prefer to choose yourself.

**Can I use the tool on a phone?**
Yes, the layout is responsive and you can fill it in and download directly.

**Can I host the YAML on GitHub as a subscription?**
Yes. Upload it to any static host and point the client at the raw URL. The tool itself will not refresh that file.

**Do I need to re-import after changing ports or IPs?**
Yes: change parameters → convert → download → replace the profile in the client.

---

## 16. Quick reference

### Input format

```
address[#CC Name]
1.1.1.1
1.1.1.1#HK Hong Kong
1.1.1.1:2053#JP Japan
[2400:cb00::1]:443#SG Singapore
example.com#US United States
```

### Ports Cloudflare proxies

```
443  2053  2083  2087  2096  8443
```

### The three required values

| Field | Where it comes from |
| --- | --- |
| UUID / password | The server (you generate it and put it there) |
| Disguise domain | Worker address minus `https://` |
| WS path | The path check in the server code |

### Format → client

| Format | Client |
| --- | --- |
| Clash / Mihomo | Clash Verge / Meta / ClashX |
| sing-box | SFA / SFI / SFM |
| Shadowrocket | Shadowrocket (Base64) |
| v2rayN | v2rayN / v2rayNG / NekoBox |

### Default file names

| Format | File name |
| --- | --- |
| Clash | `config.yaml` |
| sing-box | `config.json` |
| Shadowrocket | `shadowrocket-sub.txt` |
| v2rayN | `v2rayn-sub.txt` |

---

*Matches the current version: Host and SNI merged into one field, built-in Cloudflare guide, no auto-update feature.*
