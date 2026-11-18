# IP to Sub File

把一份 IP / 域名清单，一键转换成 **Clash、sing-box、Shadowrocket、v2rayN** 可以直接导入的配置文件。

单文件、零依赖、纯前端，打开网页就能用。

**[在线使用 →](https://toushou-114514.github.io/IP-To-Subscription-File/)**

## 文档

| 文档 | 内容 |
| --- | --- |
| [完整使用教程](完整使用教程.zh.md) | 16 章：界面每一栏、四种格式、客户端导入、报错对照 |
| [worker 部署教程](worker部署教程.zh.md) | 部署自带的 `worker.js`，拿到伪装域名和 UUID |

## 仓库文件

| 文件 | 说明 |
| --- | --- |
| [`index.html`](index.html) | 工具本体，浏览器直接打开 |
| [`worker.js`](worker.js) | 极简 VLESS Worker，部署在 Cloudflare |

## 主要功能

- 一行一个节点，支持 IPv4、IPv6、域名，端口可写进地址
- 自动识别 `#国家码`，生成对应旗帜；没写时自动查归属地
- 支持 VLESS / VMess / Trojan / Shadowsocks / Hysteria2
- 输出 Clash / sing-box / Shadowrocket / v2rayN 四种格式
- 可粘贴分享链接自动填参数
- 简繁英三语言界面，深色 / 浅色 / 跟随系统

## 语言

[English](README.en.md) · [简体中文](README.zh.md) · [繁體中文](README.md)
