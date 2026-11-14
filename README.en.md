# IP To Subscription File

Turn a list of IPs / domains into configs that *Clash, sing-box, Shadowrocket and v2rayN* can import directly.

Single file, zero dependencies, pure front end — just open the page and use it.

---

![HTML](https://img.shields.io/badge/HTML-70%25-e34c26?style=flat-square&logo=html5)
![CSS](https://img.shields.io/badge/CSS-20%25-563d7c?style=flat-square&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-10%25-f1e05a?style=flat-square&logo=javascript)

[English](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.en.md)
[简体中文](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.zh.md)
[繁體中文](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.md)

Run online: [Open the web app](https://toushou-114514.github.io/IP-To-Subscription-File/)

---
## Features

- One node per line, with support for IPv4, IPv6 and domains; the port can be part of the address
- Recognizes `#CC` country codes and renders the matching flag (🇯🇵 🇺🇸 🇭🇰 …)
- Looks up the country automatically when no code is given (cached locally for 30 days)
- Quick link to BestCF for picking IPs
- Four output formats, switchable at any time without re-entering anything
- Paste a share link (vless / vmess / trojan / ss / hysteria2) to fill in the settings
- Generates a UUID or password automatically when the field is left empty, and reminds you to replace it
- Produces configs that clients can import as-is
- Dark / light / follow-system themes, remembered across visits
- Copy, download and clear in one tap
- A status line at the bottom of the page: if JavaScript is not running, it tells you

---

## Usage

1. Open the web app
2. Paste your IPs / domains into “Node list” using the format below
3. Choose the protocol, port and credentials in “Node settings”
4. Pick the target client under “Output format”
5. Click “Copy” or “Download”, then import into your client

> No installation and no network access required (only the country lookup calls a ••• API).

---

## Input format

One node per line, basic form:

```
1.1.1.1#US US-01
example.com#JP Japan-01
104.16.0.1:2053#HK HongKong-02
```

Structure:

```
address[:port][#CC name]
```

| Form | Meaning |
| --- | --- |
| `1.1.1.1` | Address only; uses the global port from step 2 |
| `1.1.1.1:8443` | A port in the line overrides the global port |
| `example.com` | Domain; no country lookup is performed |
| `example.com:443#JP Tokyo` | Country code plus name |
| `example.com#Tokyo` | No country code; the whole tail becomes the name |
| `[2606:4700::1]:8443#SG Singapore` | IPv6 must be wrapped in square brackets |

Details:

- The country code must be exactly two ASCII letters, placed right after `#` and separated from the name by a space
- The name is optional; when omitted, the address is used as the name
- Duplicate names automatically get a suffix (`Japan-01`, `Japan-01 2`, …)
- Invalid lines are skipped, and both the counter and the status line tell you how many were skipped
- Lines starting with `#`, or containing `//`, are treated as comments and ignored

Example (safe to paste as a test):

```
1.1.1.1#US US-01
cdn.7zz.cn:443#JP Japan-01
104.16.0.1:2053#HK HongKong-02
[2606:4700:4700::1111]:8443#SG Singapore
```

[BestCF IP picker](https://bestcf.fxxk.dedyn.io/)

---

## Node settings

| Setting | Description |
| --- | --- |
| Protocol | VLESS / VMess / Trojan / Shadowsocks / Hysteria2 |
| Port | Global default port, 443 by default; a port in the line takes precedence |
| UUID | Used by VLESS and VMess; generated automatically when empty |
| Password | Used by Trojan, SS and Hysteria2; generated automatically when empty |
| Cipher | Shadowsocks only, defaults to `aes-256-gcm` |
| Transport | WebSocket or TCP, only applies to VLESS / VMess / Trojan |
| TLS | Whether VLESS / VMess use TLS, on by default |
| Skip certificate check | Trojan / Hysteria2 only |
| Name prefix | Adds a common prefix to every node name, e.g. “Home” |
| Auto-update interval | Written into the Clash config as `profile-update-interval`, 24 hours by default |
| Flag from country code | When off, node names carry no flag |

> An auto-generated UUID or password is only a placeholder. The server will not accept it, so the node cannot connect — replace it with the real credentials, or paste a real share link under “Import from share link”.

---

## Output formats

| Option | Content | Download file name |
| --- | --- | --- |
| Clash / Mihomo | YAML config with `proxies`, `proxy-groups`, `rules` | `config.yaml` |
| sing-box | JSON config with tun + mixed inbounds and selector / urltest outbounds | `config.json` |
| Shadowrocket | Base64-encoded subscription text | `shadowrocket-sub.txt` |
| v2rayN | Plain-text share links, one per line | `v2rayn-sub.txt` |

### Generated node rules

Every node includes `name`, `type`, `server` and `port`, plus the credential fields for its protocol, and:

- WebSocket `path` is fixed to `/`; there is no entry to customize it
- TLS `sni` / `servername` is always the server address itself
- No Host / camouflage-domain header is written
- No gRPC service name is written

### Clash config layout

- `mixed-port: 7890`, `allow-lan: false`, `mode: rule`
- Proxy groups: `节点选择` (select) + `自动选择` (url-test)
- Rules: `GEOIP,CN,DIRECT` and `MATCH,节点选择`

### sing-box config layout

- Inbounds: `tun` (auto route) + `mixed` (`127.0.0.1:2080`)
- Outbounds: `节点选择` (selector), `自动选择` (urltest, 5-minute probe), one per node, and `direct`
- Routing: defaults to `节点选择`, with `auto_detect_interface` enabled

---

## Import from a share link

Paste a share link into “Import from share link” and the tool detects the protocol, address, port, credentials and transport, then appends the node to the list.

Supported schemes:

- `vless://`
- `vmess://` (Base64 JSON)
- `trojan://`
- `ss://` (both SIP002 and the legacy Base64 form)
- `hysteria2://` and `hy2://`

Notes:

- **Subscription URLs cannot be imported.** Anything starting with `http(s)://` is a subscription address and cannot be split into individual nodes; the page will tell you so.
- If the link is truncated or the server address is missing, it reports “Link recognized, but the server address is missing or the content is truncated.”
- The same address is not added twice.

---

## FAQ

**The node will not connect after import.**
The generated UUID / password is a random placeholder. Replace it with the real credentials from your server, or paste the real share link under “Import from share link”.

**Nothing happens when I convert.**
Check the status line in the footer first. If it says “JavaScript is not running”, the browser has scripting disabled, or you are previewing the file in a text editor — open it in a real browser.

**A domain has no flag.**
Domains are not geo-looked-up. Add a country code manually, e.g. `#JP`.

**Why are there no Host, path or SNI fields?**
The tool follows fixed rules: path `/`, SNI equal to the server address, no Host header. This keeps exports simple and avoids connection failures caused by a wrong camouflage field.

**Can I generate subscription links to share with others?**
Yes. Choose Shadowrocket for Base64 subscription text, or v2rayN for plain links, then host the downloaded file on your own static hosting.

---

## Disclaimer

This project only converts network configuration between formats. It does not provide any server, node or proxy service. Please follow the laws and regulations of your region and the terms of service of your provider.

---

## Author

- Author: Toushou — <https://github.com/Toushou-114514/>
- Repository: <https://github.com/Toushou-114514/IP-To-Subscription-File>
- If you find it useful, a ⭐ on the repo is appreciated.
