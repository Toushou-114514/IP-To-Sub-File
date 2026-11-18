# worker.js 部署教學（Cloudflare）

本文是 [README.md](README.md) 第 13 章的獨立版，只講怎麼部署自帶的 `worker.js`，然後拿到「偽裝網域」和「UUID」。

> 本文只講伺服器。工具本身的用法、節點格式、錯誤排查見 [README.md](README.md)。

本教學附帶一個極簡 Worker（儲存庫根目錄的 `worker.js`）：部署後開啟網域，頁面只顯示「偽裝網域」和「UUID」兩個值，複製進本工具就能用。不依賴 edgetunnel，約 300 行，只實作 VLESS over WebSocket。

### 1. 它和 edgetunnel 的差別

| 項目 | 自帶 worker.js | edgetunnel |
| --- | --- | --- |
| 體積 | 約 300 行 | 幾千行 |
| 需要改的地方 | 只改一行 UUID | UUID、PROXYIP、路徑等 |
| 部署後查看參數 | 頁面直接顯示網域 + UUID | 沒有，要自己拼 |
| 路徑要求 | 任意，不校驗 | 必須與程式碼一致 |
| 附加功能 | 無 | 訂閱產生、優選 IP、多協定 |

個人自用足夠；需要訂閱介面、多協定再考慮 edgetunnel。

### 2. 準備工作

| 需要 | 說明 |
| --- | --- |
| Cloudflare 帳號 | 免費註冊：`dash.cloudflare.com` |
| `worker.js` | 儲存庫根目錄，或與本工具放在一起 |
| 一個 UUID | 下一步產生 |
| 一個瀏覽器 | 電腦操作更舒服 |

### 3. 產生 UUID

1. 開啟 `https://www.uuidgenerator.net/`
2. 複製第一行的 v4 UUID，例如 `3f2a1b4c-8d5e-4f6a-9b7c-1d2e3f4a5b6c`
3. 先記在備忘錄裡，後面會用兩次（Worker 程式碼 + 本工具）

> 也可以用自己的：Linux / macOS 執行 `uuidgen`。

### 4. 建立 Worker 並貼上程式碼

1. 登入 `dash.cloudflare.com`
2. 左側 **Workers & Pages** → **Create** → **Worker**
3. 名字填 `my-node`（隨意），點 **Deploy**
4. 點 **Edit code**，把編輯器裡的範例程式碼全選刪掉
5. 把 `worker.js` 的全部內容貼進去
6. 找到檔案頂部的這一行：

```js
uuid: "00000000-0000-0000-0000-000000000000",
```

7. 把引號裡的值換成你第 3 步產生的 UUID
8. 點右上角 **Deploy**

> 不想把 UUID 寫死在程式碼裡，也可以在 Worker 的 **Settings → Variables** 裡加一個 `UUID` 變數，程式碼會優先讀取它。

### 5. 開啟頁面，複製兩個值

部署完成後開啟：

```
https://my-node.你的使用者名稱.workers.dev
```

頁面只有兩行：

```
偽裝網域   my-node.abc.workers.dev        [複製]
UUID      3f2a1b4c-8d5e-4f6a-9b7c-...     [複製]
```

點「複製」分別拿到兩個值。

如果 UUID 那行顯示紅色警告「還是佔位值」，代表第 4 步第 7 小步沒改成功，回程式碼裡改完重新 Deploy。

### 6. 填回工具

| 工具欄位 | 值 |
| --- | --- |
| 協定 | VLESS |
| 連接埠 | 443 |
| UUID | 頁面上複製的 |
| 傳輸方式 | WebSocket |
| 偽裝網域（Host / SNI） | 頁面上複製的 |
| WS 路徑 | **保持預設，不用改**（伺服器不校驗路徑） |
| TLS | 勾選 |
| 節點清單 | 優選 IP，一行一筆 |

### 7. 驗證

1. 瀏覽器開啟 Worker 網域，能看到資訊頁 → Worker 正常
2. 工具裡按「轉換」，下載設定，匯入用戶端
3. 用戶端測延遲，有數字代表通了；再開啟 `ip.sb` 確認出口 IP 變了
4. 如果這一步失敗，看下面的對照表

| 現象 | 原因 | 處理 |
| --- | --- | --- |
| 頁面打不開 / 522 / 1101 | Worker 沒部署成功或腳本報錯 | CF 後台看 Worker 日誌，重新 Deploy |
| 頁面 UUID 有紅色警告 | `CONFIG.uuid` 沒改 | 改成真實 UUID 再 Deploy |
| 節點全部逾時 | 偽裝網域或連接埠錯；沒勾 TLS | 核對網域；連接埠用 443；勾選 TLS |
| 節點顯示「失敗」 | UUID 和 Worker 裡的不一致 | 兩邊逐字比對 |
| 能連但部分網站打不開 | 目標使用 UDP，或連接埠被 CF 限制 | 換站台試；UDP 類應用不支援 |
| 提示 1015 / 429 | 請求過多被限流 | 等一會兒，或降低使用頻率 |

### 8. 免費額度與注意事項

- Workers 免費版每天約 **10 萬次請求**，輕度使用足夠
- 只支援 TCP 轉發，UDP 應用（部分遊戲、語音）不可用
- 資訊頁是公開的：**知道網域的人都能看到 UUID**，不要把網域發到公開群組
- 只給自己用，別做成公開代理，容易被 CF 限流或封號

### 9. 想用 edgetunnel 也可以

如果你需要訂閱介面、多協定、PROXYIP 這些功能，仍然可以照 edgetunnel 儲存庫的說明部署，然後在工具裡手填：

- UUID：程式碼裡的 `userID`
- 偽裝網域：`xxx.workers.dev`
- WS 路徑：程式碼裡的路徑判斷

差別只是：參數要自己找，而不是開啟頁面就能複製。

---

> 本文只講伺服器。工具本身的用法、節點格式、錯誤排查見 [README.md](README.md)。
