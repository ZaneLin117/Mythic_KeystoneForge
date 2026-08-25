# Threechest 二次开发项目交接文档

- 文档版本：1.0
- 交接日期：2026-08-24
- 项目状态：方向已确认，尚未克隆或修改 Threechest 源码
- 下一阶段：在新的独立工作区拉取上游项目，建立可运行基线并完成 MDT 6.2.7 协议兼容性审计

## 1. 决策摘要

用户已明确决定基于开源项目 Threechest 二次开发一个《魔兽世界》局外 MDT 路线网站。最快且风险最低的实施方向是保留 Threechest 现有 React/TypeScript 地图编辑器、MDT 数据转换与路线状态模型，优先完成当前赛季八个副本、新版 `!~MDT2~` 导入导出、中文界面和本地路线保存。分享、登录、公开路线库和实时协作延后，避免第一阶段同时引入后端、账号和多人同步复杂度。

当前工作目录 `C:\Users\14800\Documents\项目100` 已包含多个未提交项目，不应直接用于克隆 Threechest。用户会创建新的独立工作区和对话；本文件应复制到新工作区，作为新对话的首要交接上下文。

## 2. 项目目标

### 2.1 目标用户与任务

- 目标用户：《魔兽世界》正式服大秘境玩家、坦克、指挥和路线制作者。
- 核心任务：在不进入游戏插件界面的情况下，导入 MDT 路线、查看地图和怪物、调整波次、核对敌方部队进度，再导出回 MDT。
- 核心成功结果：任意受支持路线能够完成“MDT 导出 → 网页导入和编辑 → 网页导出 → MDT 重新导入”，怪物选择、波次顺序和进度保持一致。
- 第一阶段平台：桌面浏览器优先，主要覆盖 1920×1080 和常见笔记本分辨率。

### 2.2 核心体验

```text
选择副本或粘贴 MDT 字符串
  → 网页解析路线并显示地图、怪物和波次
  → 用户调整怪物归属、波次顺序和路线名称
  → 系统实时重算单波与累计进度
  → 导出 MDT 字符串并回到游戏验证
```

错误恢复：

```text
无效或不兼容字符串
  → 显示具体错误且保留当前路线
  → 用户修改、重新粘贴或取消
  → 返回原有可编辑状态
```

## 3. 已确认事实与证据

### 3.1 用户明确确认

- 开发目标是类似 <https://threechest.io/> 的局外 MDT 网站。
- 核心布局是顶部/左上副本入口、中间副本地图与怪物、右侧导入编辑和波次进度。
- 技术路线已确定为基于 Threechest 二次开发。
- 用户会另建独立工作区和对话。

### 3.2 Threechest 上游

- 上游仓库：<https://github.com/acornellier/threechest>
- 在线网站：<https://threechest.io/>
- 许可证：GPL-2.0，见 <https://raw.githubusercontent.com/acornellier/threechest/main/LICENSE>
- 当前仓库包含 `MythicDungeonTools` Git 子模块、前端、API、服务器、RTC 服务、数据转换脚本和部署配置。
- `package.json` 显示主要技术栈为 Node.js 20+、React 18、TypeScript、Vite、Redux Toolkit、Leaflet、D3、localForage、Firebase、Yjs、WebRTC、Vitest：<https://github.com/acornellier/threechest/blob/main/package.json>
- 上游的 MDT 数据转换脚本已经列出当前八个副本，并使用 Lua AST 而不是正则表达式解析数据：<https://raw.githubusercontent.com/acornellier/threechest/main/scripts/mdtDungeons.ts>
- 上游坐标转换实现为 `[y / 2.185, x / 2.185]`，修改地图渲染前必须先用真实路线验证该转换。

### 3.3 本机 MDT 数据源

主插件目录，后续应作为只读数据源：

```text
D:\World of Warcraft\_retail_\Interface\AddOns\MythicDungeonTools
```

按需加载 UI 目录：

```text
D:\World of Warcraft\_retail_\Interface\AddOns\MythicDungeonTools_UI
```

本机已确认版本：

- MDT 版本：6.2.7
- `addon_version.txt`：580065
- WoW Interface：120100
- 插件类型：正式服 mainline
- `_UI` 是 `LoadOnDemand` 启动层；实际数据、地图、怪物和路线逻辑位于主插件目录。

关键本地文件：

```text
MythicDungeonTools.toc
Modules\DungeonSelect.lua
Modules\Transmission.lua
Modules\Presets.lua
Modules\PresetDialogs.lua
Modules\Pulls.lua
Modules\MapView.lua
Midnight\*.lua
Midnight\Textures\<Dungeon>\*.png
```

### 3.4 当前赛季八个副本

来源：`Modules\DungeonSelect.lua` 中的 `Midnight Season 2` 列表。

| Key | dungeonIndex | 副本 | 总 count | 数据文件 |
|---|---:|---|---:|---|
| `murd` | 160 | Murder Row | 655 | `Midnight\MurderRow.lua` |
| `nalo` | 161 | Den of Nalorakk | 729 | `Midnight\DenOfNalorakk.lua` |
| `vale` | 162 | The Blinding Vale | 655 | `Midnight\TheBlindingVale.lua` |
| `void` | 163 | Voidscar Arena | 738 | `Midnight\VoidscarArena.lua` |
| `fang` | 164 | Altar of Fangs | 817 | `Midnight\AltarOfFangs.lua` |
| `rlp` | 42 | Ruby Life Pools | 553 | `Midnight\RubyLifePools.lua` |
| `tos` | 20 | Temple of Sethraliss | 689 | `Midnight\TempleOfSethraliss.lua` |
| `kr` | 17 | King's Rest | 608 | `Midnight\KingsRest.lua` |

每个副本贴图目录当前包含 150 张 PNG。MDT 在 `Modules\MapView.lua` 中按 10 行 × 15 列布局；每张本地 PNG 为 128×128，完整拼接尺寸为 1920×1280。文件命名为 `<sublevel>_<1..150>.png`，例如 `1_1.png`、`1_150.png`。

### 3.5 怪物和路线数据规则

副本 Lua 数据已包含：

- `dungeonIndex`、`mapID`、英文名、短名、入口和 POI。
- `dungeonTotalCount`。
- `dungeonSubLevels` 和地图贴图目录。
- 敌人 `enemyIndex`、NPC `id`、`name`、`count`、`health`、`scale`、`isBoss`、技能和控制特性。
- 敌人实例 `cloneIndex`、`x`、`y`、`g` 分组、`sublevel`、巡逻路径等。

路线的核心结构应保持与 MDT 一致：

```ts
type MdtPreset = {
  text: string
  uid?: string
  value: {
    currentDungeonIdx: number
    currentPull: number
    currentSublevel: number
    pulls: Array<Record<number, number[]>>
  }
  objects?: unknown[]
  colorPaletteInfo?: unknown
  difficulty?: number
}
```

其中每个 pull 使用 `enemyIndex -> cloneIndex[]` 表示本波选中的怪物实例。敌方部队进度按选中 clone 所属敌人类型的 `count` 累加：

```text
单波 count = Σ 已选 clone 对应 enemy.count
累计百分比 = 累计 count / dungeonTotalCount × 100%
```

Boss 或部分剧情单位的 `count` 可能为 0，不能因为 `count === 0` 就从地图或路线中删除。

### 3.6 MDT 导入导出协议

本机 MDT 6.2.7 的新格式：

```text
!~MDT2~ + Base64(Deflate(CBOR(preset)))
```

来源：`Modules\Transmission.lua` 中的 `TableToString` 与 `StringToTable`。

当前版本还包含旧格式兼容：

- `!` 开头：LibDeflate 编码/压缩 + AceSerializer。
- 无前缀：LibCompress + AceSerializer。
- 用户手工粘贴使用 print-safe 解码路径；插件频道通信使用 addon-channel 解码路径。

新版协议是 P0 阻塞项。MDT 官方仓库已有计划在 WoW 12.2 移除旧格式兼容，因此实现应以 `!~MDT2~` 为默认导入和导出格式，旧格式只作为兼容读取：<https://github.com/Nnoggie/MythicDungeonTools/issues/737>

## 4. 许可证与素材约束

### 4.1 GPL-2.0

基于 Threechest 修改时必须保留上游版权和许可证，并对分发的衍生代码履行 GPL-2.0 的源码提供义务。浏览器前端会向用户分发构建后的 JavaScript，因此新项目需要保留可访问的源码仓库或对应源码获取方式。

建议：

- 保留根目录 `LICENSE`。
- 新增 `NOTICE.md`，列出 Threechest 和 MythicDungeonTools 来源、修改范围与日期。
- 保留上游 Git 历史和 `upstream` remote。
- 不要在没有许可证审计的情况下把 GPL 代码合并进闭源专有仓库。

### 4.2 暴雪素材

插件代码的 GPL 许可不等于《魔兽世界》地图、图标、名称和美术素材可任意商业使用。若项目包含广告、付费、订阅、品牌赞助或商业发行，需在上线前单独完成暴雪素材和商标审核。官方法律入口：<https://www.blizzard.com/legal/>

本段是工程风险提示，不构成法律意见。

## 5. 默认假设与待确认事项

### 5.1 默认假设

若用户没有在新对话中更改，默认采用：

- 项目保持开源并遵守 GPL-2.0。
- 中文界面，英文副本/NPC 名称先保留，后续补中文本地化表。
- 桌面端优先，不在 P0 承诺完整手机编辑体验。
- 第一阶段无需注册登录，路线保存在 IndexedDB/localForage。
- 优先复用 Threechest 现有视觉和交互结构，但使用新的项目名称、Logo 和中文文案。
- 本机 `D:` 盘 MDT 目录只读，不向其中写入任何文件。

### 5.2 待用户决定

这些问题不阻塞本地技术基线，但必须在部署或品牌开发前确认：

| 决策 | 负责人 | 最迟时间 |
|---|---|---|
| 正式产品名称、Logo 和域名 | 用户 | 中文化/品牌阶段开始前 |
| 部署在中国大陆还是境外 | 用户 | 部署方案确定前 |
| 是否包含广告、赞助或付费功能 | 用户 | 素材和法律审核前 |
| P1 是否需要账号和云端路线 | 用户 | P0 验收后 |
| P2 是否需要实时协作和公开路线排行 | 用户 | P1 立项前 |
| 是否完全复刻 Threechest 木质红色视觉 | 用户 | UI 精修前 |

## 6. 范围与优先级

### 6.1 P0：第一阶段必须完成

| 能力 | 负责人 | 验收条件 |
|---|---|---|
| 上游项目可运行基线 | 新工作区工程对话 | 安装、测试、构建和开发服务器均可执行 |
| 当前赛季八副本 | 数据管线 | 八个副本地图、怪物、POI 和总 count 正确 |
| `!~MDT2~` 导入 | 协议模块 | 八个真实新格式样本全部导入成功 |
| 路线编辑 | 前端状态与地图 | 可新增、删除、排序波次并增删怪物 |
| 波次进度 | 领域模型 | 单波、累计值与 MDT 一致 |
| MDT 导出 | 协议模块 | 导出的字符串可被 MDT 6.2.7 导入 |
| 撤销/重做 | 前端状态 | 路线编辑操作可恢复且不损坏状态 |
| 本地持久化 | 存储模块 | 刷新、关闭再打开后路线仍可恢复 |
| 中文基础界面 | UI/i18n | 核心按钮、错误和空状态均有中文文案 |
| 错误恢复 | 各模块 | 导入失败、资源缺失不覆盖现有路线 |

### 6.2 P1：P0 后再做

- 分享链接和只读路线页面。
- 账号登录、云端路线保存和多设备同步。
- 路线复制、重命名、版本历史。
- 绘线、箭头、文字和标记工具。
- 完整中英文切换。
- 更完善的键盘操作、无障碍和小屏浏览模式。

### 6.3 P2：明确不进入第一阶段

- 实时多人协作。
- 排行榜和高分样例路线抓取。
- 评论、点赞和社区内容审核。
- 阵容、天赋和路线推荐算法。
- 移动端完整编辑器。

## 7. 用户旅程

| 阶段 | 用户目标 | 用户操作 | 系统响应 | 反馈 | 风险/摩擦 | 成功条件 |
|---|---|---|---|---|---|---|
| 进入 | 打开本赛季地图 | 选择八个副本之一 | 加载对应地图与怪物 | 副本按钮高亮、加载状态 | 地图资源缺失 | 地图和总 count 正确 |
| 导入 | 使用已有 MDT 路线 | 粘贴路线字符串 | 解码、校验并建立路线状态 | 成功摘要或具体错误 | 新旧格式不兼容 | 波次与 MDT 一致 |
| 编辑 | 调整拉怪顺序 | 点击怪物、增删或拖动波次 | 更新地图颜色和右侧列表 | 单波及累计进度即时变化 | 分组怪物误选 | 选择关系明确且可撤销 |
| 保存 | 防止路线丢失 | 正常编辑或重命名 | 自动持久化 | 保存状态提示 | 存储版本迁移失败 | 刷新后恢复 |
| 导出 | 回到游戏使用 | 点击导出并复制 | 生成 `!~MDT2~` 字符串 | 成功提示 | 编码字段丢失 | MDT 成功导入 |

## 8. 界面与状态基线

### 8.1 主编辑器布局

- 顶部/左上：品牌、当前赛季八个副本按钮、撤销/重做和地图工具。
- 中部：可缩放、拖动的副本地图，怪物图标、分组轮廓、入口和 POI。
- 右侧：路线选择、导入/导出、编辑命令、总进度、波次列表和新增/删除波次。
- 底部次要区域：帮助、源码与许可证入口；登录等 P1 功能在未实现前隐藏，不展示失效按钮。

### 8.2 必须设计的状态

- 默认：空路线至少有一波，可正常选择怪物。
- 加载：地图和路线分别显示非阻塞加载反馈。
- 空状态：无本地路线时说明如何导入或开始创建。
- 导入成功：显示副本、波次数和总 count 摘要。
- 导入失败：指出编码、解压、CBOR 或结构校验阶段，保留当前路线。
- 禁用：无可撤销操作时撤销按钮禁用；仅剩一波时删除规则明确。
- 删除：优先支持撤销；删除整条路线时才需要确认。
- 保存：显示“正在保存/已保存/保存失败”，失败可重试。
- 资源错误：地图瓦片缺失时显示占位和错误信息，不造成白屏。

### 8.3 响应式规则

- 1920×1080：三栏完整显示，右侧波次面板独立滚动。
- 常见笔记本宽度：缩小副本按钮和右栏宽度，地图仍为主要区域。
- 窄屏：P0 只保证查看和基础操作；右栏改抽屉，不承诺复杂拖放体验。
- 波次不能只靠颜色区分，必须同时显示序号和选中状态。

## 9. 建议技术架构

```text
MDT Git 子模块 / 本机只读插件目录
  ├─ Midnight/*.lua
  └─ Midnight/Textures/**/*.png
              │
              ▼
        构建期数据编译器
  Lua AST → 标准 Dungeon JSON → 资产清单/版本哈希
              │
              ▼
     React 地图层 + 路线领域状态
              │
      ┌───────┴────────┐
      ▼                ▼
MDT 编解码 Worker   IndexedDB/localForage
      │
      ▼
导入/导出 `!~MDT2~`
```

工程约束：

- UI 组件不能成为路线规则的事实来源；进度、pull 和导入导出规则放在独立 domain/data 模块。
- `dungeonIndex`、`enemyIndex`、`cloneIndex` 和 sublevel 必须保持稳定，不用数组显示顺序替代真实 ID。
- Lua 数据只在构建期解析；生产浏览器不执行 Lua。
- 导入解压和 CBOR 解析放入 Web Worker，并设置输入、解压后大小和嵌套深度上限。
- 路线文本和注释按纯文本渲染，禁止把导入内容直接作为 HTML。
- 本地存储数据包含 `schemaVersion`、`mdtVersion`、`seasonId` 和迁移函数。
- 地图贴图应有版本哈希和长缓存策略；数据更新时通过 manifest 换版本。

## 10. 新工作区启动步骤

### 10.1 建议目录

创建一个不包含其他项目文件的全新目录，例如：

```text
C:\Users\14800\Documents\threechest-cn
```

将本交接文档复制到该目录后再开启新对话。

### 10.2 拉取上游

在空目录中执行：

```powershell
git clone --recurse-submodules https://github.com/acornellier/threechest.git .
git checkout -b codex/mdt-web-v1
```

如果用户已经创建自己的 GitHub fork，则应把个人 fork 设为 `origin`、原仓库设为 `upstream`；具体 URL 由新工作区读取用户提供的信息后配置，不要猜测账号名。

### 10.3 建立运行基线

```powershell
corepack enable
yarn install
yarn test
yarn build
yarn dev
```

注意：

- `package.json` 要求 Node.js 20+。
- 先阅读仓库中的 `README.md`、`CLAUDE.md`、`.env.local.sample`、`package.json` 和任何 `AGENTS.md`。
- 如果实际脚本或包管理方式与本文不同，以检出的上游仓库为准并更新本文。
- 不要在基线测试通过前进行大规模品牌或样式修改。

### 10.4 基线报告必须记录

- 上游 commit SHA 和子模块 SHA。
- Node/Yarn 版本。
- `yarn test`、`yarn build` 的结果。
- 本地开发服务器是否能打开八个副本。
- 浏览器控制台错误和失败测试。
- 当前上游是否已完整支持 `!~MDT2~`。
- 与本机 MDT 6.2.7 数据之间的差异。

## 11. 实施阶段

### 阶段 0：上游基线与差异审计

1. 克隆含子模块的项目。
2. 安装依赖并运行测试、构建和开发服务器。
3. 对比上游 MDT 子模块与本机 `D:` 盘 MDT 6.2.7。
4. 定位 Threechest 的路线编解码、地图数据、Redux 状态和持久化入口。
5. 输出差异清单，不先重写现有模块。

完成条件：上游原始版本可运行，且知道 P0 需要修改的确切文件。

### 阶段 1：新版 MDT2 协议技术验证

1. 从游戏获得至少一条真实 `!~MDT2~` 路线。
2. 验证现有 Threechest 能否导入。
3. 实现或修复 CBOR、Deflate、Base64 编解码。
4. 建立 `decode → normalize → encode → MDT` 往返测试。
5. 保留旧格式只读兼容，默认导出新格式。

完成条件：至少一条新格式路线完成无损往返，并在 MDT 6.2.7 中验证成功。

### 阶段 2：八副本数据同步

1. 更新 `scripts/mdtDungeons.ts` 的字段解析能力。
2. 将当前八个副本、怪物、POI、地图和总 count 生成到标准数据目录。
3. 增加数据版本和生成结果测试。
4. 检查多楼层、分组、巡逻、Boss 和 `count=0` 单位。

完成条件：八个副本的数据生成可重复，重新生成不会产生未解释的差异。

### 阶段 3：P0 编辑体验与中文化

1. 保留现有三栏结构，替换品牌和核心中文文案。
2. 修复导入错误状态、保存状态和空状态。
3. 完成波次增删排序、怪物归属、进度与撤销重做。
4. 建立本地路线 schemaVersion 和恢复流程。

完成条件：用户无需登录即可完成完整导入、编辑、保存和导出任务。

### 阶段 4：回归、许可和部署准备

1. 八副本真实样本回归。
2. Windows Chrome/Edge 与至少一个非 Chromium 浏览器检查。
3. 补充 LICENSE、NOTICE、源码入口和免责声明。
4. 用户确认部署地区、域名、商业模式后再决定部署架构。

完成条件：P0 验收矩阵全部通过，无阻塞级错误。

## 12. 测试样本准备

需要从游戏 MDT 导出的测试夹具：

- 八个副本各至少一条 `!~MDT2~` 路线。
- 至少一条多楼层路线。
- 至少一条包含分组怪物、巡逻怪和 `count=0` Boss 的路线。
- 一条不足 100%、一条恰好 100%、一条超过 100% 的路线。
- 如仍承诺旧格式兼容，增加一个 `!` 格式和一个无前缀格式样本。
- 损坏的 Base64、无效 Deflate、无效 CBOR、缺字段和超大压缩输入。

测试夹具可能包含玩家名称或路线作者信息；提交公共仓库前先匿名化。不要把用户剪贴板、账号信息或私人路线未经确认上传到第三方服务。

## 13. P0 验收标准

- Given 当前赛季八个副本，When 用户切换副本，Then 地图、怪物、POI 和总 count 与 MDT 6.2.7 一致。
- Given 合法 `!~MDT2~` 字符串，When 用户导入，Then 波次、怪物 clone、楼层、名称和进度正确恢复。
- Given 已编辑路线，When 用户导出并粘贴回 MDT 6.2.7，Then MDT 成功导入且关键路线字段一致。
- Given 无效字符串，When 导入失败，Then 显示可理解错误且当前路线不变。
- Given 用户增删或移动怪物，When 状态更新，Then 单波和累计 count 立即正确重算。
- Given 用户删除或重排波次，When 点击撤销，Then 路线恢复到前一稳定状态。
- Given 浏览器刷新或重新打开，When 本地数据可用，Then 恢复最近路线并提示保存状态。
- Given 地图瓦片缺失，When 页面加载，Then 显示错误占位而不是白屏。
- Given 1920×1080 和常见笔记本宽度，When 打开主编辑器，Then 地图、顶部副本按钮和右侧波次面板不重叠。
- Given 任意波次颜色，When 用户查看路线，Then 仍可通过序号、选中态或文本识别波次，不依赖颜色作为唯一信息。

## 14. 主要风险

| 优先级 | 风险 | 影响 | 缓解方式 |
|---|---|---|---|
| P0 | 上游尚未完整支持 `!~MDT2~` | 无法导入当前路线 | 第一阶段先做协议 spike 和真实 MDT 往返测试 |
| P0 | Lua 数字索引在 JS 中被错误数组化 | enemy/clone ID 错位 | 使用显式稳定 ID，增加快照和往返测试 |
| P0 | MDT 更新导致 count 或 clone 变化 | 旧路线进度错误 | 数据 manifest 记录版本，设计迁移/警告策略 |
| P0 | 解压炸弹或畸形 CBOR | 浏览器卡死或内存异常 | Worker、输入大小、解压大小、深度和超时限制 |
| P1 | 暴雪地图和图标授权不清 | 商业上线风险 | 商业化前做素材与商标审核 |
| P1 | GPL 义务遗漏 | 分发合规风险 | 保留 LICENSE/NOTICE 和对应源码获取方式 |
| P1 | 上游同步与定制代码冲突 | 后续升级成本增加 | 小步提交、保留 upstream remote、避免无必要重构 |

## 15. 新对话的建议首条消息

将本文件复制到新工作区后，可以向新的 Codex 对话发送：

> 请完整阅读工作区中的《Threechest二次开发-项目交接文档.md》，把它作为本项目的交接基线。先检查工作区、AGENTS.md 和本机依赖；如果目录为空，就按交接文档克隆 Threechest（包含子模块）并创建 `codex/mdt-web-v1` 分支。完成阶段 0：建立原始项目运行基线，记录上游和 MDT 子模块 commit、测试/构建结果、控制台错误，并审计当前代码对 MDT 6.2.7 `!~MDT2~` 协议及当前八副本数据的支持情况。`D:\World of Warcraft\_retail_\Interface\AddOns\MythicDungeonTools` 和 `_UI` 目录只读，不要写入。保留 GPL 许可证，不要先做大规模 UI 改版；先提交差异清单和最小实现计划，然后继续修复 P0 阻塞项并验证。

## 16. 交接时尚未执行的事项

- 尚未在任何目录克隆 Threechest。
- 尚未创建用户自己的 GitHub fork 或远程仓库。
- 尚未安装项目依赖。
- 尚未运行 Threechest 测试、构建或开发服务器。
- 尚未从游戏获取真实 MDT 路线字符串测试夹具。
- 尚未修改本机 MDT 或 `_UI` 目录。
- 尚未决定正式品牌、域名、部署地区和商业模式。

新工作区应从阶段 0 开始，不需要重复调研本文已经确认的本地 MDT 版本、八副本列表、地图瓦片结构和协议入口；但应以实际检出的上游 commit 和本机文件重新运行自动化验证。
