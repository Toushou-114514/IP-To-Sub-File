# IP to Sub File

把一份 IP / 網域清單，一鍵轉換成 **Clash、sing-box、Shadowrocket、v2rayN** 可以直接匯入的設定檔。

單檔、零依賴、純前端，開啟網頁就能用。

**[線上使用 →](https://toushou-114514.github.io/IP-To-Subscription-File/)**

## 文件

| 文件 | 內容 |
| --- | --- |
| [完整使用教學](完整使用教程.zht.md) | 16 章：介面每一欄、四種格式、用戶端匯入、錯誤對照 |
| [worker 部署教學](worker部署教程.zht.md) | 部署自帶的 `worker.js`，拿到偽裝網域和 UUID |

## 儲存庫檔案

| 檔案 | 說明 |
| --- | --- |
| [`index.html`](index.html) | 工具本體，瀏覽器直接開啟 |
| [`worker.js`](worker.js) | 極簡 VLESS Worker，部署在 Cloudflare |

## 主要功能

- 一行一個節點，支援 IPv4、IPv6、網域，連接埠可寫進位址
- 自動辨識 `#國家碼`，產生對應旗幟；沒寫時自動查歸屬地
- 支援 VLESS / VMess / Trojan / Shadowsocks / Hysteria2
- 輸出 Clash / sing-box / Shadowrocket / v2rayN 四種格式
- 可貼上分享連結自動填參數
- 簡繁英三語言介面，深色 / 淺色 / 跟隨系統

## 語言

[English](README.en.md) · [简体中文](README.zh.md) · [繁體中文](README.md)
