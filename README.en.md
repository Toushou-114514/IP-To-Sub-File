# IP to Sub File

Turn an IP / domain list into config files that **Clash, sing-box, Shadowrocket and v2rayN** can import directly.

Single file, no dependencies, runs entirely in the browser.

**[Open the web app →](https://toushou-114514.github.io/IP-To-Subscription-File/)**

## Docs

| Document | What it covers |
| --- | --- |
| [Full guide](完整使用教程.en.md) | 16 chapters: every field, all four formats, client import, troubleshooting |
| [worker.js deployment](worker部署教程.en.md) | Deploy the bundled `worker.js` and get the disguise domain plus UUID |

## Repository

| File | Purpose |
| --- | --- |
| [`index.html`](index.html) | The tool itself — open it in a browser |
| [`worker.js`](worker.js) | Minimal VLESS Worker for Cloudflare |

## Features

- One node per line: IPv4, IPv6 or domain, port can be inline
- Detects `#CC` country codes and draws flag emojis; looks up missing ones automatically
- Supports VLESS / VMess / Trojan / Shadowsocks / Hysteria2
- Outputs Clash / sing-box / Shadowrocket / v2rayN
- Paste a share link and the fields fill themselves
- Simplified Chinese / Traditional Chinese / English UI, dark / light / system theme

## Languages

[English](README.en.md) · [简体中文](README.zh.md) · [繁體中文](README.md)
