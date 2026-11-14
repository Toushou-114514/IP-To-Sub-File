# IP轉訂閱檔案

把一份 IP / 網域清單，一鍵轉換成 *Clash、sing-box、Shadowrocket、v2rayN* 可以直接匯入的設定檔。

單一檔案、零依賴、純前端，打開網頁就能用。

---

![HTML](https://img.shields.io/badge/HTML-70%25-e34c26?style=flat-square&logo=html5)
![CSS](https://img.shields.io/badge/CSS-20%25-563d7c?style=flat-square&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-10%25-f1e05a?style=flat-square&logo=javascript)

[English](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.en.md)
[简体中文](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.zh.md)
[繁體中文](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.md)


線上使用 [開啟網頁](https://toushou-114514.github.io/IP-To-Subscription-File/)

---
## 功能

- 輸入一行一個節點，支援 IPv4、IPv6、網域，連接埠可寫在位址裡
- 自動辨識 `#國家碼`，產生對應旗幟（🇯🇵 🇺🇸 🇭🇰 …）
- 沒寫國家碼時自動查詢 IP 歸屬地（含本機快取，30 天有效）
- BestCF 優選 IP 快速跳轉
- 四種輸出格式，隨時切換，不必重新輸入
- 可貼上一條分享連結（vless / vmess / trojan / ss / hysteria2）自動填入參數
- UUID、密碼留空時自動產生，並提示你換成真實的
- 轉換成客戶端可直接匯入的格式
- 深色 / 淺色 / 跟隨系統三種主題，選擇會記住
- 複製、下載、清空一鍵完成
- 頁面底部有執行狀態提示：JS 沒跑起來會明確告訴你

---

## 使用方式

1. 開啟網頁
2. 在「節點清單」依格式貼上你的 IP / 網域
3. 在「節點參數」選擇協定、填入連接埠與憑證
4. 在「輸出格式」選擇目標客戶端
5. 按「複製」或「下載」，匯入客戶端

> 不需安裝、不需連網（只有查詢國家碼時會呼叫公開 API）。

---

## 輸入格式

一行一個節點，基本寫法：

```
1.1.1.1#US 美國-01
example.com#JP 日本優選
104.16.0.1:2053#HK 香港-02
```

組成方式：

```
位址[:連接埠][#國家碼 名稱]
```

| 寫法 | 說明 |
| --- | --- |
| `1.1.1.1` | 只有位址，連接埠使用第 2 步的全域連接埠 |
| `1.1.1.1:8443` | 行內連接埠優先於全域連接埠 |
| `example.com` | 網域，不查詢歸屬地 |
| `example.com:443#JP 東京` | 國家碼 + 名稱 |
| `example.com#東京` | 沒寫國家碼，整段視為名稱 |
| `[2606:4700::1]:8443#SG 新加坡` | IPv6 必須用方括號包起來 |

規則細節：

- 國家碼必須是兩位英文字母，緊接在 `#` 後方，並以空格與名稱分隔
- 名稱可省略，省略時以位址作為名稱
- 名稱重複會自動加序號（`日本優選`、`日本優選 2`……）
- 格式無效的行會被略過，頁面計數與狀態列會告訴你略過了幾行
- 以 `#` 開頭、含 `//` 的行會視為註解忽略

範例（可直接貼上測試）：

```
1.1.1.1#US 美國-01
cdn.7zz.cn:443#JP 日本優選
104.16.0.1:2053#HK 香港-02
[2606:4700:4700::1111]:8443#SG 新加坡
```

[優選 IP 位址](https://bestcf.fxxk.dedyn.io/)

---

## 節點參數

| 參數 | 說明 |
| --- | --- |
| 協定 | VLESS / VMess / Trojan / Shadowsocks / Hysteria2 |
| 連接埠 | 全域預設連接埠，預設 443；行內有寫則以行內為準 |
| UUID | VLESS、VMess 使用，留空自動產生 |
| 密碼 | Trojan、SS、Hysteria2 使用，留空自動產生 |
| 加密方式 | SS 專用，預設 `aes-256-gcm` |
| 傳輸方式 | WebSocket 或 TCP，僅 VLESS / VMess / Trojan 有效 |
| TLS | VLESS / VMess 是否啟用 TLS，預設開啟 |
| 略過憑證驗證 | Trojan / Hysteria2 專用 |
| 名稱前綴 | 為所有節點名稱加上統一前綴，例如「自用」 |
| 自動更新間隔 | 寫入 Clash 設定的 `profile-update-interval`，預設 24 小時 |
| 用國家碼產生旗幟 | 關閉後名稱不帶國旗 |

> 自動產生的 UUID / 密碼只是佔位值。伺服器不認這個值，節點是連不上的，記得換成你自己的真實憑證（或直接用「從節點連結匯入」）。

---

## 輸出格式

| 選項 | 內容 | 下載檔名 |
| --- | --- | --- |
| Clash / Mihomo | YAML 設定，含 `proxies`、`proxy-groups`、`rules` | `config.yaml` |
| sing-box | JSON 設定，含 tun + mixed 入站、selector / urltest 出站 | `config.json` |
| Shadowrocket | Base64 編碼的訂閱文字 | `shadowrocket-sub.txt` |
| v2rayN | 明文分享連結，一行一條 | `v2rayn-sub.txt` |

### 產生的節點規則

所有節點都會輸出 `name`、`type`、`server`、`port`，以及對應協定的憑證欄位，並且：

- WebSocket 的 `path` 固定為 `/`，不提供自訂入口
- TLS 的 `sni` / `servername` 固定為伺服器位址本身
- 不寫入 Host / 偽裝網域標頭
- 不寫入 gRPC 服務名稱

### Clash 設定結構

- `mixed-port: 7890`、`allow-lan: false`、`mode: rule`
- 代理群組：`节点选择`（select）+ `自动选择`（url-test）
- 規則：`GEOIP,CN,DIRECT` 與 `MATCH,节点选择`

### sing-box 設定結構

- 入站：`tun`（自動路由）+ `mixed`（`127.0.0.1:2080`）
- 出站：`节点选择`（selector）、`自动选择`（urltest，5 分鐘探測）、各節點、`direct`
- 路由：預設走 `节点选择`，開啟 `auto_detect_interface`

---

## 從節點連結匯入

在「從節點連結匯入」貼上一條分享連結，會自動辨識協定、位址、連接埠、憑證與傳輸方式，並把節點附加到清單中。

支援：

- `vless://`
- `vmess://`（Base64 JSON）
- `trojan://`
- `ss://`（SIP002 與舊版 Base64 寫法）
- `hysteria2://` 與 `hy2://`

注意：

- **訂閱連結無法匯入**。`http(s)://` 開頭的是訂閱位址，無法拆成單一節點，頁面會直接提示你。
- 連結被截斷或缺少伺服器位址時，會提示「連結已辨識，但缺少伺服器位址或內容被截斷」。
- 同一位址已存在時不會重複加入。

---

## 常見問題

**匯入後節點連不上？**
產生的 UUID / 密碼是隨機佔位值，必須換成伺服器真實的憑證，或者用「從節點連結匯入」把真實連結貼進來。

**轉換沒反應？**
先看頁尾的狀態提示。如果顯示「JavaScript 沒有執行」，代表瀏覽器停用了腳本，或者你是用文字編輯器預覽，換瀏覽器開啟即可。

**網域沒有國旗？**
網域不查歸屬地。在輸入裡手動寫上 `#JP` 這樣的國家碼即可。

**為什麼沒有 Host、路徑、SNI 這些輸入框？**
這個工具依固定規則產生：路徑 `/`、SNI 等於伺服器位址、不帶 Host 標頭。這樣匯出的設定最省事，也最不容易因為偽裝欄位填錯而連不上。

**能批次產生訂閱連結給別人用嗎？**
可以。選 Shadowrocket 得到 Base64 訂閱文字，選 v2rayN 得到明文連結，下載後放到你自己的靜態託管上即可。

---

## 免責聲明

本專案僅用於網路設定的格式轉換，不提供任何伺服器、節點或代理服務。請遵守你所在地區的法律法規以及服務供應商的使用條款。

---

## 作者

- 作者：Toushou — <https://github.com/Toushou-114514/>
- 儲存庫：<https://github.com/Toushou-114514/IP-To-Subscription-File>
- 如果覺得做得不錯，歡迎給儲存庫點個 star ⭐
