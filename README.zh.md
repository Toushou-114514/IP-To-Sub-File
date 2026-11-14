# IP转订阅文件

把一份 IP / 域名清单，一键转换成 *Clash、sing-box、Shadowrocket、v2rayN*  可以直接导入的配置。

单文件、零依赖、纯前端，打开网页就能用。

---

![HTML](https://img.shields.io/badge/HTML-70%25-e34c26?style=flat-square&logo=html5)
![CSS](https://img.shields.io/badge/CSS-20%25-563d7c?style=flat-square&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-10%25-f1e05a?style=flat-square&logo=javascript)

[English](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.en.md)
[简体中文](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.zh.md)
[繁體中文](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/README.md)

在线运行 [打开网页](https://toushou-114514.github.io/IP-To-Subscription-File/)

[完整教程](https://github.com/Toushou-114514/IP-To-Subscription-File/blob/toushou/User%20Guide.zh.md)

---
## 功能

- 输入一行一个节点，支持 IPv4、IPv6、域名，端口可写在地址里
- 自动识别 `#国家码`，生成对应旗帜（🇯🇵 🇺🇸 🇭🇰 …）
- 没写国家码时自动查询 IP 归属地（带本地缓存，30 天有效）
- BestCF优选IP快捷跳转
- 四种输出格式，随时切换，无需重新输入
- 可粘贴一条分享链接（vless / vmess / trojan / ss / hysteria2）反填参数
- UUID、密码留空时自动生成，并提示你换成真实的
- 转换成客户端可以导入的格式
- 深色 / 浅色 / 跟随系统三种主题，选择会记住
- 复制、下载、清空一键完成
- 页面底部有运行状态提示：JS 没跑起来会明确告诉你

---

## 使用方法

1. 打开网页
2. 在「节点列表」里按格式粘贴你的 IP / 域名
3. 在「节点参数」里选协议、填端口和凭据
4. 在「输出格式」里选目标客户端
5. 点「复制」或「下载」，导入到客户端

> 不需要安装、不需要联网（只有查询国家码时会请求公共 API）。

---

## 输入格式

一行一个节点，基本写法：

```
1.1.1.1#US 美国-01
example.com#JP 日本优选
104.16.0.1:2053#HK 香港-02
```

组成方式：

```
地址[:端口][#国家码 名称]
```

| 写法 | 说明 |
| --- | --- |
| `1.1.1.1` | 只有地址，端口用第 2 步里的全局端口 |
| `1.1.1.1:8443` | 行内端口优先于全局端口 |
| `example.com` | 域名，不查询归属地 |
| `example.com:443#JP 东京` | 国家码 + 名称 |
| `example.com#东京` | 没写国家码，整段当作名称 |
| `[2606:4700::1]:8443#SG 新加坡` | IPv6 必须用方括号包起来 |

规则细节：

- 国家码必须是两位英文字母，且紧跟在 `#` 后面、用空格与名称分隔
- 名称可以省略，省略时用地址当名称
- 名称重复会自动加序号（`日本优选`、`日本优选 2`……）
- 格式无效的行会被跳过，页面计数和状态栏会告诉你跳过了几条
- 以 `#` 开头的行、含 `//` 的行会被当作注释忽略

示例（可直接粘贴测试）：

```
1.1.1.1#US 美国-01
cdn.7zz.cn:443#JP 日本优选
104.16.0.1:2053#HK 香港-02
[2606:4700:4700::1111]:8443#SG 新加坡
```

[优选 IP 地址](https://bestcf.fxxk.dedyn.io/)

---

## 节点参数

| 参数 | 说明 |
| --- | --- |
| 协议 | VLESS / VMess / Trojan / Shadowsocks / Hysteria2 |
| 端口 | 全局默认端口，默认 443；行内写了端口则以行内为准 |
| UUID | VLESS、VMess 使用，留空自动生成 |
| 密码 | Trojan、SS、Hysteria2 使用，留空自动生成 |
| 加密方式 | SS 专用，默认 `aes-256-gcm` |
| 传输方式 | WebSocket 或 TCP，仅 VLESS / VMess / Trojan 有效 |
| TLS | VLESS / VMess 是否启用 TLS，默认开启 |
| 跳过证书验证 | Trojan / Hysteria2 专用 |
| 名称前缀 | 给所有节点名加统一前缀，例如「自用」 |
| 自动更新间隔 | 写进 Clash 配置的 `profile-update-interval`，默认 24 小时 |
| 用国家码生成旗帜 | 关闭后名称里不带国旗 |

> 自动生成的 UUID / 密码只是占位符。服务端不认这个值，节点是连不上的，记得换成你自己的真实凭据（或直接用「从节点链接导入」）。

---

## 输出格式

| 选项 | 内容 | 下载文件名 |
| --- | --- | --- |
| Clash / Mihomo | YAML 配置，含 `proxies`、`proxy-groups`、`rules` | `config.yaml` |
| sing-box | JSON 配置，含 tun + mixed 入站、selector / urltest 出站 | `config.json` |
| Shadowrocket | Base64 编码的订阅文本 | `shadowrocket-sub.txt` |
| v2rayN | 明文分享链接，一行一条 | `v2rayn-sub.txt` |

### 生成的节点规则

所有节点都会输出 `name`、`type`、`server`、`port`，以及对应协议的凭据字段，并且：

- WebSocket 的 `path` 固定为 `/`，不提供自定义入口
- TLS 的 `sni` / `servername` 固定为服务器地址本身
- 不写入 Host / 伪装域名头
- 不写入 gRPC 服务名

### Clash 配置结构

- `mixed-port: 7890`，`allow-lan: false`，`mode: rule`
- 代理组：`节点选择`（select）+ `自动选择`（url-test）
- 规则：`GEOIP,CN,DIRECT` 与 `MATCH,节点选择`

### sing-box 配置结构

- 入站：`tun`（自动路由）+ `mixed`（`127.0.0.1:2080`）
- 出站：`节点选择`（selector）、`自动选择`（urltest，5 分钟探测）、各节点、`direct`
- 路由：默认走 `节点选择`，开启 `auto_detect_interface`

---

## 从节点链接导入

在「从节点链接导入」里粘贴一条分享链接，会自动识别协议、地址、端口、凭据、传输方式，并把节点追加到列表里。

支持：

- `vless://`
- `vmess://`（Base64 JSON）
- `trojan://`
- `ss://`（SIP002 与旧版 Base64 写法）
- `hysteria2://` 和 `hy2://`

注意：

- **订阅链接不能导入**。`http(s)://` 开头的是订阅地址，没法拆成单个节点，页面会直接提示你。
- 链接被截断或缺少服务器地址时，会提示「链接已识别，但缺少服务器地址或内容被截断」。
- 同一个地址已经存在时不会重复添加。

---


## 常见问题

**导入后节点连不上？**
生成的 UUID / 密码是随机占位值，必须换成服务端真实的凭据，或者用「从节点链接导入」把真实链接粘进来。

**转换没反应？**
先看页脚的状态提示。如果显示「JavaScript 没有运行」，说明浏览器禁用了脚本，或者你是用文本编辑器预览的，换浏览器打开即可。

**域名没有国旗？**
域名不查归属地。在输入里手动写上 `#JP` 这样的国家码即可。

**为什么没有 Host、路径、SNI 这些输入框？**
这个工具按固定规则生成：路径 `/`、SNI 等于服务器地址、不带 Host 头。这样导出的配置最省事，也最不容易因为伪装字段填错而连不上。

**能批量生成订阅链接给别人用吗？**
可以。选 Shadowrocket 得到 Base64 订阅文本，选 v2rayN 得到明文链接，下载后放到你自己的静态托管上即可。

---

## 免责声明

本项目仅用于网络配置的格式转换，不提供任何服务器、节点或代理服务。请遵守你所在地区的法律法规以及服务提供商的使用条款。

---

## 作者

- 作者：Toushou — <https://github.com/Toushou-114514/>
- 仓库：<https://github.com/Toushou-114514/IP-To-Subscription-File>
- 如果觉得做的不错就给仓库点个star⭐吧
