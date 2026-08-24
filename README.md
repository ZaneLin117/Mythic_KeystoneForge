# Keystone Forge

> 面向《魔兽世界》史诗钥石地下城的本地优先路线规划工具。

Keystone Forge（秘境路线工坊）是一款兼容 [Mythic Dungeon Tools（MDT）](https://github.com/Nnoggie/MythicDungeonTools) 的网页路线编辑器。你可以在游戏外导入 MDT 路线、查看副本地图与敌人、编排每一组拉怪、核对敌方部队进度，再将路线导出回 MDT。

项目默认提供中文界面，也可切换为英文。核心编辑与 MDT2 编解码都在浏览器中完成，不需要登录或部署后端；路线会自动保存在当前浏览器。

## 功能

- 导入和导出 `!~MDT2~` 路线字符串
- 在副本地图上选择、框选和查找敌人
- 新建、排序和删除拉怪组，并可复制、重命名和管理路线
- 实时查看单组与累计敌方部队进度
- 添加地图绘制与可拖动备注
- 撤销、重做及常用键盘快捷键
- 路线自动保存到浏览器本地存储
- 中文、英文界面切换
- 内置当前数据版本的 8 个副本与参考路线
- 可选接入 Warcraft Logs 路线、链接分享、云端同步和实时协作

## 当前状态

当前版本已针对 MDT 数据版本 `580065`（MDT 6.2.7）完成数据一致性检查，并通过 MDT2 编解码、内置路线往返、敌人引用完整性及畸形输入测试。

仍需注意以下边界：

- 目前只接受 `!~MDT2~` 格式，尚未提供 MDT1 或更早格式的兼容读取。
- 登录、分享、云端同步、排行榜和实时协作默认关闭；启用前需要替换为自己的服务配置。
- 发布候选版本前仍应使用游戏内真实路线进行 MDT → 网页 → MDT 的跨端验证。

完整的基线、验证结果和已知问题见 [`docs/baseline-2026-08-24.md`](docs/baseline-2026-08-24.md)。

## 快速开始

### 环境要求

- Node.js 20 或更高版本
- Corepack
- Git（克隆源码时建议同时拉取子模块）

### 安装并启动

```bash
git clone --recurse-submodules <repository-url> keystone-forge
cd keystone-forge
corepack yarn@1.22.22 install
corepack yarn@1.22.22 dev
```

打开 <http://localhost:5173/>。核心路线编辑、浏览器本地保存以及 MDT2 导入导出无需额外环境变量或后端服务。

如果已经克隆仓库但缺少 MDT 子模块，可执行：

```bash
git submodule update --init --recursive
```

## 基本使用

1. 在页面顶部选择副本。
2. 新建空路线，或粘贴游戏内 MDT 导出的 `!~MDT2~` 字符串。
3. 点击地图上的敌人，将其加入当前拉怪组；按住 `Shift` 拖动可批量框选。
4. 调整拉怪顺序，核对敌方部队进度，并按需添加绘制或备注。
5. 点击“导出 MDT”，将生成的字符串粘贴回游戏插件。

界面左下角的“使用帮助”包含完整快捷键和操作提示。

## 常用命令

| 命令                             | 用途                                         |
| -------------------------------- | -------------------------------------------- |
| `corepack yarn@1.22.22 dev`      | 启动 Vite 前端开发服务器                     |
| `corepack yarn@1.22.22 test`     | 运行 Vitest 测试                             |
| `corepack yarn@1.22.22 lint`     | 运行 ESLint，警告也会导致失败                |
| `corepack yarn@1.22.22 build`    | 执行类型检查并构建客户端和 Vercel 服务端产物 |
| `corepack yarn@1.22.22 preview`  | 本地预览生产构建                             |
| `corepack yarn@1.22.22 server`   | 启动 Warcraft Logs Express API               |
| `corepack yarn@1.22.22 rtc`      | 启动实时协作信令服务器                       |
| `corepack yarn@1.22.22 dungeons` | 从 MDT Lua 数据重新生成副本 JSON             |
| `corepack yarn@1.22.22 offsets`  | 检查 MDT 地图与 WCL 坐标偏移                 |

更新新赛季数据前，请先阅读 [`docs/new-season-setup.md`](docs/new-season-setup.md)。

## 可选在线功能

复制 [`.env.local.sample`](.env.local.sample) 为 `.env.local`，再根据部署环境填写配置。所有在线功能默认关闭，防止本地分支误用上游基础设施。

```env
VITE_ENABLE_CLOUD=false
VITE_ENABLE_COLLAB=false
VITE_ENABLE_ROUTE_SHARING=false
VITE_ENABLE_ANALYTICS=false
```

| 配置                                  | 说明                                    |
| ------------------------------------- | --------------------------------------- |
| `WCL_CLIENT_ID` / `WCL_CLIENT_SECRET` | Warcraft Logs API 凭据                  |
| `VITE_RANKINGS_BASE_URL`              | 排行路线数据的公共基地址                |
| `BLOB_READ_WRITE_TOKEN`               | 排行路线同步脚本使用的 Vercel Blob 令牌 |
| `VITE_ENABLE_CLOUD`                   | 启用登录和云端路线同步                  |
| `VITE_ENABLE_COLLAB`                  | 启用 Yjs/WebRTC 实时协作                |
| `VITE_ENABLE_ROUTE_SHARING`           | 启用路线链接分享                        |
| `VITE_ENABLE_ANALYTICS`               | 启用分析统计                            |

启用这些开关前，还需要替换项目中的 Firebase、分享 API、RTC 和分析服务配置。仅设置为 `true` 并不能自动获得可用的在线服务。

## 项目结构

```text
src/
  components/       React 界面与地图、侧栏、弹窗组件
  data/             副本、敌人、坐标与内置路线数据
  store/            Redux 路线状态、本地持久化与撤销历史
  util/mdt/         MDT2 的 CBOR、Deflate 与 Base64 编解码
server/             Warcraft Logs Express API
rtc-server/         实时协作 WebRTC 信令服务
scripts/            副本数据生成与排行榜维护脚本
MythicDungeonTools/ MDT 数据源子模块
docs/               基线记录与新赛季更新文档
```

## 技术栈

- React 18、TypeScript、Vite
- Redux Toolkit、redux-persist、localForage
- Leaflet、D3
- Vitest、ESLint
- Yjs、WebRTC（可选协作）
- Express、Vercel Functions（可选在线服务）

## 参与开发

提交变更前请至少运行：

```bash
corepack yarn@1.22.22 test
corepack yarn@1.22.22 lint
corepack yarn@1.22.22 build
```

若修改副本数据、MDT 编解码或敌人标识，请同时补充往返测试，并确认旧路线中的 `enemyIndex-spawnIndex` 引用没有被破坏。

## 来源与许可

本项目基于 [Threechest](https://github.com/acornellier/threechest) 修改，来源版本与修改说明见 [`NOTICE.md`](NOTICE.md)。源码依照 [GNU General Public License v3.0](LICENSE) 发布。

《魔兽世界》、副本名称、相关美术与商标归 Blizzard Entertainment 所有。本项目与 Blizzard Entertainment 没有关联，也未获得其认可或背书。
