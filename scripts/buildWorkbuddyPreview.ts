import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type SpellLocale = { name?: string; description?: string }
type Spell = { id: number; attributes: string[] }
type Spawn = { id: string; idx: number; group?: number; pos: [number, number] }
type Enemy = {
  id: number
  enemyIndex: number
  name: string
  count: number
  health: number
  creatureType: string
  isBoss: boolean
  characteristics: string[]
  spells: Spell[]
  spawns: Spawn[]
}
type Dungeon = { dungeonIndex: number; totalCount: number; enemies: Enemy[] }

const scriptPath = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptPath, '..')
const outputPath = resolve(projectRoot, 'dist-workbuddy', 'workbuddy-preview.html')

const readJson = <T>(path: string) => JSON.parse(readFileSync(path, 'utf8')) as T

const mdtLocale = readJson<Record<string, string>>(
  resolve(projectRoot, 'src/data/mdtLocales/zhCN.json'),
)
const spellLocale = readJson<Record<string, SpellLocale>>(
  resolve(projectRoot, 'src/data/spellLocales/zhCN.json'),
)

const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function dataUri(path: string) {
  const mime = mimeTypes[extname(path).toLowerCase()] ?? 'application/octet-stream'
  return `data:${mime};base64,${readFileSync(path).toString('base64')}`
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e')
}

const creatureTypes: Record<string, string> = {
  Aberration: '畸变怪',
  Beast: '野兽',
  Demon: '恶魔',
  Dragonkin: '龙类',
  Elemental: '元素生物',
  Giant: '巨人',
  Humanoid: '人型生物',
  Mechanical: '机械',
  Undead: '亡灵',
  Uncategorized: '未分类',
}

const attributeLabels: Record<string, string> = {
  bleed: '流血',
  curse: '诅咒',
  disease: '疾病',
  enrage: '激怒',
  magic: '魔法',
  poison: '中毒',
  interruptible: '可打断',
}

const dungeonChoices = [
  { key: 'murd', name: '密谋小径', short: '密谋' },
  { key: 'nalo', name: '纳洛拉克的洞穴', short: '纳洛' },
  { key: 'vale', name: '夺目谷', short: '夺目' },
  { key: 'void', name: '虚空之痕竞技场', short: '虚痕' },
  { key: 'fang', name: '毒牙祭坛', short: '毒牙' },
  { key: 'rlp', name: '红玉新生法池', short: '红玉' },
  { key: 'tos', name: '塞塔里斯神庙', short: '塞塔' },
  { key: 'kr', name: '诸王之眠', short: '诸王' },
].map((item) => {
  const dungeon = readJson<Dungeon>(
    resolve(projectRoot, `src/data/mdtDungeons/${item.key}_mdt.json`),
  )
  const enemies = dungeon.enemies.map((enemy) => ({
    id: enemy.id,
    enemyIndex: enemy.enemyIndex,
    name: mdtLocale[enemy.name] ?? enemy.name,
    englishName: enemy.name,
    portrait: dataUri(resolve(projectRoot, `public/npc_portraits/${enemy.id}.png`)),
    count: enemy.count,
    health: enemy.health,
    creatureType: creatureTypes[enemy.creatureType] ?? enemy.creatureType,
    isBoss: enemy.isBoss,
    characteristics: enemy.characteristics.map(
      (attribute) => attributeLabels[attribute] ?? attribute,
    ),
    spells: enemy.spells.map((spell) => ({
      id: spell.id,
      name: spellLocale[String(spell.id)]?.name ?? `技能 ${spell.id}`,
      description:
        spellLocale[String(spell.id)]?.description ?? '当前本地数据表暂未收录该技能的效果描述。',
      attributes: spell.attributes.map((attribute) => attributeLabels[attribute] ?? attribute),
    })),
  }))
  const spawns = dungeon.enemies.flatMap((enemy) =>
    enemy.spawns
      .map((spawn) => ({
        id: spawn.id,
        idx: spawn.idx,
        enemyId: enemy.id,
        group: spawn.group ?? null,
        x: Number(spawn.pos[1].toFixed(2)),
        y: Number((-spawn.pos[0]).toFixed(2)),
      }))
      .filter((spawn) => spawn.x >= 0 && spawn.x <= 384 && spawn.y >= 0 && spawn.y <= 256),
  )
  const positiveEnemyIds = new Set(enemies.filter((enemy) => enemy.count > 0).map((enemy) => enemy.id))
  const initialGroups = Array.from(
    new Set(
      spawns
        .filter((spawn) => spawn.group !== null && positiveEnemyIds.has(spawn.enemyId))
        .map((spawn) => spawn.group as number),
    ),
  )
    .sort((a, b) => a - b)
    .slice(0, 5)

  return {
    ...item,
    dungeonIndex: dungeon.dungeonIndex,
    icon: dataUri(resolve(projectRoot, `public/images/dungeons/${item.key}.jpg`)),
    totalCount: dungeon.totalCount,
    enemies,
    spawns,
    initialGroups,
    mapTiles: Array.from({ length: 4 }, (_, y) =>
      Array.from({ length: 6 }, (_, x) => ({
        x,
        y,
        src: dataUri(resolve(projectRoot, `public/maps/${item.key}/${x}_${y}.jpg`)),
      })),
    ).flat(),
  }
})

const logo = dataUri(resolve(projectRoot, 'public/images/logo_64x64.png'))
const previewData = safeJson({
  dungeons: Object.fromEntries(
    dungeonChoices.map(({ mapTiles: _mapTiles, icon: _icon, ...dungeon }) => [dungeon.key, dungeon]),
  ),
})

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <meta name="color-scheme" content="dark" />
  <title>秘境路线工坊 · 临时预览版</title>
  <style>
    :root {
      --bg: #07111e;
      --panel: rgba(8, 23, 38, .94);
      --panel-2: rgba(16, 39, 59, .92);
      --line: rgba(133, 181, 211, .28);
      --text: #eef7ff;
      --muted: #8fa8bb;
      --cyan: #47e2dc;
      --blue: #67a8ff;
      --gold: #ffca67;
      --danger: #ff6f7f;
      --pull-1: #49dfd2;
      --pull-2: #ffbf5a;
      --pull-3: #fd79b3;
      --pull-4: #a68aff;
      --pull-5: #79ccff;
      font-family: Inter, "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
    }
    * { box-sizing: border-box; }
    html, body { min-height: 100%; margin: 0; background: var(--bg); color: var(--text); }
    body {
      background:
        radial-gradient(circle at 15% 0%, rgba(39, 148, 158, .16), transparent 32rem),
        radial-gradient(circle at 85% 10%, rgba(56, 85, 171, .13), transparent 30rem),
        #07111e;
    }
    button { font: inherit; }
    .app { min-height: 100vh; display: flex; flex-direction: column; }
    .topbar {
      min-height: 70px; display: flex; align-items: center; justify-content: space-between;
      padding: 10px 18px; gap: 16px; border-bottom: 1px solid var(--line);
      background: rgba(4, 14, 25, .88); backdrop-filter: blur(18px); position: sticky; top: 0; z-index: 40;
    }
    .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .brand img { width: 46px; height: 46px; border-radius: 12px; box-shadow: 0 0 24px rgba(71, 226, 220, .2); }
    .brand h1 { margin: 0; font-size: clamp(17px, 2vw, 24px); letter-spacing: .04em; white-space: nowrap; }
    .brand p { margin: 3px 0 0; color: var(--muted); font-size: 12px; }
    .preview-badge {
      display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(255, 202, 103, .42);
      color: #ffe1a4; background: rgba(255, 183, 70, .1); border-radius: 999px; padding: 7px 11px;
      font-size: 12px; white-space: nowrap;
    }
    .top-actions { display: flex; gap: 8px; align-items: center; }
    .btn {
      border: 1px solid var(--line); color: var(--text); background: rgba(23, 50, 72, .72);
      border-radius: 9px; padding: 8px 12px; cursor: pointer; transition: .18s ease;
    }
    .btn:hover { border-color: rgba(71, 226, 220, .7); background: rgba(31, 71, 91, .9); }
    .btn.primary { border-color: rgba(71, 226, 220, .5); background: rgba(29, 139, 144, .35); }
    .btn.danger { color: #ffc5cc; }
    .dungeons {
      display: flex; align-items: stretch; gap: 8px; padding: 10px 14px; overflow-x: auto;
      border-bottom: 1px solid var(--line); background: rgba(8, 23, 38, .8); scrollbar-width: thin;
    }
    .dungeon {
      min-width: 98px; display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 8px;
      color: var(--muted); background: rgba(17, 39, 58, .72); border: 1px solid rgba(118, 166, 198, .22);
      border-radius: 11px; padding: 6px 9px 6px 6px; cursor: pointer; text-align: left; transition: .18s ease;
    }
    .dungeon:hover { transform: translateY(-1px); border-color: rgba(103, 168, 255, .55); color: var(--text); }
    .dungeon.active { color: #fff; border-color: var(--cyan); box-shadow: 0 0 0 1px rgba(71,226,220,.15), inset 0 0 18px rgba(71,226,220,.08); }
    .dungeon img { width: 44px; height: 44px; object-fit: cover; border-radius: 8px; }
    .dungeon strong { display: block; font-size: 13px; }
    .dungeon span { display: block; color: var(--muted); font-size: 10px; margin-top: 2px; }
    .workspace { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 340px; min-height: 0; }
    .map-column { min-width: 0; padding: 14px; }
    .map-toolbar { display: flex; justify-content: space-between; gap: 10px; align-items: center; margin-bottom: 10px; }
    .map-title h2 { margin: 0; font-size: 17px; }
    .map-title p { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
    .map-wrap {
      position: relative; width: 100%; aspect-ratio: 3 / 2; max-height: calc(100vh - 232px);
      border-radius: 14px; overflow: hidden; border: 1px solid rgba(118, 173, 205, .35);
      box-shadow: 0 20px 60px rgba(0, 0, 0, .34); background: #111b22;
    }
    .map-tiles { position: absolute; inset: 0; display: none; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(4, 1fr); }
    .map-tiles.active { display: grid; }
    .map-tiles img { width: 100%; height: 100%; object-fit: fill; display: block; }
    .map-shade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(4,12,19,.08), rgba(4,12,19,.28)); }
    .route-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
    .route-shadow { fill: none; stroke: rgba(2,7,12,.86); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
    .route-line { fill: none; stroke: #e9faff; stroke-width: 2.1; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 5 3; }
    .markers { position: absolute; inset: 0; }
    .mob-marker {
      --pull-color: rgba(220, 236, 246, .66); position: absolute; width: 19px; height: 19px;
      border-radius: 999px; transform: translate(-50%, -50%); overflow: hidden;
      border: 2px solid var(--pull-color); background: #0b1a26; padding: 1px; cursor: pointer;
      box-shadow: 0 1px 5px rgba(0,0,0,.9); transition: transform .12s ease, filter .12s ease, width .12s ease, height .12s ease; z-index: 2;
    }
    .mob-marker img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; pointer-events: none; }
    .mob-marker:hover { transform: translate(-50%, -50%) scale(1.55); filter: brightness(1.18); z-index: 20; }
    .mob-marker.selected { width: 22px; height: 22px; border-color: var(--pull-color); z-index: 6; }
    .mob-marker.active-pull { box-shadow: 0 0 0 3px rgba(255,255,255,.38), 0 0 14px var(--pull-color); }
    .mob-marker.boss { width: 25px; height: 25px; border-radius: 6px; border-color: #ffd178; padding: 2px; z-index: 8; }
    .mob-marker.boss img { border-radius: 3px; }
    .mob-marker.boss:hover { transform: translate(-50%, -50%) scale(1.4); }
    .mob-hover {
      position: absolute; z-index: 30; display: none; align-items: center; gap: 8px; min-width: 154px;
      padding: 7px; border-radius: 10px; border: 1px solid rgba(126,185,218,.45);
      background: rgba(5, 17, 28, .94); box-shadow: 0 12px 28px rgba(0,0,0,.52); pointer-events: none;
      transform: translate(10px, -50%); backdrop-filter: blur(8px);
    }
    .mob-hover.visible { display: flex; }
    .mob-hover img { width: 38px; height: 38px; border-radius: 7px; object-fit: cover; border: 1px solid rgba(255,255,255,.24); }
    .mob-hover strong { display: block; font-size: 11px; }
    .mob-hover span { display: block; margin-top: 3px; color: var(--gold); font-size: 9px; }
    .legend {
      position: absolute; left: 10px; bottom: 10px; display: flex; flex-wrap: wrap; gap: 8px;
      padding: 7px 9px; border-radius: 9px; background: rgba(4, 14, 24, .82); border: 1px solid var(--line);
      backdrop-filter: blur(8px); font-size: 10px; color: var(--muted); pointer-events: none;
    }
    .legend span { display: inline-flex; align-items: center; gap: 4px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .side {
      border-left: 1px solid var(--line); background: rgba(7, 20, 33, .86); padding: 14px;
      overflow: auto; min-height: 0;
    }
    .progress-card, .pull-card, .tip-card {
      border: 1px solid var(--line); background: var(--panel-2); border-radius: 12px; padding: 12px;
    }
    .progress-card { margin-bottom: 10px; }
    .progress-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
    .progress-head strong { font-size: 15px; }
    .progress-head b { color: var(--cyan); font-size: 21px; }
    .progress-track { height: 9px; border-radius: 20px; background: rgba(3, 10, 17, .8); overflow: hidden; margin: 10px 0 8px; }
    .progress-fill { width: 0; height: 100%; background: linear-gradient(90deg, #36b8b9, #6af1cf); border-radius: inherit; transition: width .25s ease; }
    .progress-meta { color: var(--muted); font-size: 11px; display: flex; justify-content: space-between; }
    .side-title { display: flex; align-items: center; justify-content: space-between; margin: 14px 0 8px; }
    .side-title h3 { margin: 0; font-size: 14px; }
    .pulls { display: grid; gap: 8px; }
    .pull-card { padding: 0; overflow: hidden; transition: .16s ease; }
    .pull-card.active { border-color: rgba(71,226,220,.66); box-shadow: inset 3px 0 0 var(--cyan); }
    .pull-main { width: 100%; padding: 11px; border: 0; background: none; color: inherit; text-align: left; cursor: pointer; }
    .pull-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .pull-name { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 13px; }
    .pull-count { color: var(--gold); font-size: 12px; }
    .pull-mobs { margin-top: 7px; color: var(--muted); font-size: 10px; line-height: 1.55; }
    .mob-chips { display: flex; gap: 4px; margin-top: 8px; }
    .mob-chip { width: 25px; height: 25px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(133,181,211,.3); }
    .pull-actions { display: flex; border-top: 1px solid rgba(133,181,211,.14); }
    .pull-actions button { flex: 1; border: 0; background: rgba(3, 12, 20, .25); color: var(--muted); padding: 6px; cursor: pointer; font-size: 10px; }
    .pull-actions button:hover { color: #fff; background: rgba(73, 111, 138, .23); }
    .add-pull { width: 100%; margin-top: 8px; }
    .tip-card { margin-top: 12px; color: var(--muted); font-size: 11px; line-height: 1.65; }
    .tip-card strong { color: var(--text); }
    .footer { padding: 9px 16px; color: #71899c; font-size: 10px; border-top: 1px solid var(--line); text-align: center; }
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 80; background: rgba(1, 7, 12, .74); display: none;
      align-items: center; justify-content: center; padding: 18px; backdrop-filter: blur(6px);
    }
    .modal-backdrop.open { display: flex; }
    .modal {
      width: min(560px, 100%); max-height: min(720px, 88vh); overflow: auto; border-radius: 16px;
      border: 1px solid rgba(126, 185, 218, .4); background: #081725; box-shadow: 0 30px 90px rgba(0,0,0,.65);
    }
    .modal-head { position: sticky; top: 0; display: flex; justify-content: space-between; gap: 16px; padding: 15px; background: rgba(8,23,37,.96); border-bottom: 1px solid var(--line); z-index: 2; }
    .modal-head h3 { margin: 0; font-size: 19px; }
    .modal-head p { margin: 4px 0 0; color: var(--muted); font-size: 11px; }
    .mob-identity { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .mob-portrait { width: 58px; height: 58px; object-fit: cover; border-radius: 11px; border: 1px solid rgba(126,185,218,.48); box-shadow: 0 0 20px rgba(71,226,220,.12); }
    .close { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--line); background: transparent; color: #fff; cursor: pointer; }
    .mob-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 14px; }
    .stat { border: 1px solid rgba(133,181,211,.16); border-radius: 10px; background: rgba(18,42,61,.55); padding: 10px; }
    .stat span { display: block; color: var(--muted); font-size: 10px; }
    .stat strong { display: block; margin-top: 4px; font-size: 13px; }
    .spell-list { display: grid; gap: 8px; padding: 0 14px 14px; }
    .spell { border: 1px solid rgba(133,181,211,.24); border-radius: 10px; overflow: hidden; background: rgba(18,42,61,.58); }
    .spell button { width: 100%; padding: 11px 12px; border: 0; color: var(--text); background: none; text-align: left; cursor: pointer; display: flex; justify-content: space-between; gap: 12px; }
    .spell button:hover { background: rgba(56,97,122,.18); }
    .spell-name { font-weight: 700; }
    .spell-id { color: var(--muted); font-size: 10px; font-weight: 400; }
    .spell-tags { color: var(--cyan); font-size: 10px; white-space: nowrap; }
    .spell-description { display: none; margin: 0; padding: 0 12px 12px; white-space: pre-line; color: #bfd0dc; font-size: 12px; line-height: 1.65; }
    .spell.open .spell-description { display: block; }
    .import-body { padding: 15px; }
    .import-body textarea {
      width: 100%; min-height: 190px; resize: vertical; border-radius: 11px; padding: 12px;
      border: 1px solid rgba(126,185,218,.34); outline: none; color: #e8f6ff; background: rgba(2, 10, 17, .72);
      font: 11px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace;
    }
    .import-body textarea:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(71,226,220,.08); }
    .import-hint { margin: 9px 0 0; color: var(--muted); font-size: 11px; line-height: 1.6; }
    .import-error { min-height: 18px; margin-top: 8px; color: #ff9aa7; font-size: 11px; }
    .import-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .empty { color: var(--muted); text-align: center; padding: 20px; font-size: 12px; }
    .toast {
      position: fixed; left: 50%; bottom: 24px; z-index: 120; transform: translate(-50%, 16px);
      background: rgba(7, 24, 37, .96); border: 1px solid rgba(71,226,220,.45); color: #eaffff;
      border-radius: 10px; padding: 10px 14px; font-size: 12px; opacity: 0; pointer-events: none; transition: .22s ease;
      box-shadow: 0 14px 40px rgba(0,0,0,.4); text-align: center;
    }
    .toast.show { opacity: 1; transform: translate(-50%, 0); }
    @media (max-width: 900px) {
      .workspace { grid-template-columns: 1fr; }
      .side { border-left: 0; border-top: 1px solid var(--line); overflow: visible; }
      .map-wrap { max-height: none; }
      .topbar { position: static; }
    }
    @media (max-width: 620px) {
      .topbar { align-items: flex-start; padding: 10px 12px; }
      .brand p, .preview-badge { display: none; }
      .brand img { width: 39px; height: 39px; }
      .top-actions .btn:not(.primary) { display: none; }
      .map-column { padding: 9px; }
      .map-toolbar { align-items: flex-start; }
      .map-toolbar .btn { padding: 7px 9px; font-size: 11px; }
      .legend { display: none; }
      .mob-marker { width: 16px; height: 16px; padding: 1px; }
      .mob-marker.selected { width: 19px; height: 19px; }
      .mob-marker.boss { width: 22px; height: 22px; }
      .mob-stats { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <img src="${logo}" alt="秘境路线工坊图标" />
        <div>
          <h1>秘境路线工坊</h1>
          <p>Mythic Keystone Forge · 中文秘境路线规划工具</p>
        </div>
        <span class="preview-badge">◆ 单文件临时预览</span>
      </div>
      <div class="top-actions">
        <button class="btn" id="resetButton">重置演示</button>
        <button class="btn primary" id="importMdtButton">导入 MDT</button>
        <button class="btn" id="helpButton">使用说明</button>
      </div>
    </header>

    <nav class="dungeons" aria-label="副本选择">
      ${dungeonChoices
        .map(
          (item) => `<button class="dungeon${item.key === 'murd' ? ' active' : ''}" data-dungeon="${item.key}" title="${item.name}">
        <img src="${item.icon}" alt="" /><span><strong>${item.short}</strong><span>${item.name}</span></span>
      </button>`,
        )
        .join('')}
    </nav>

    <main class="workspace">
      <section class="map-column">
        <div class="map-toolbar">
          <div class="map-title">
            <h2 id="mapTitle">密谋小径 · 路线演示</h2>
            <p>点击怪物加入当前波次；右键只查看中文资料</p>
          </div>
          <button class="btn danger" id="clearButton">清空路线</button>
        </div>
        <div class="map-wrap" id="mapWrap">
          ${dungeonChoices
            .map(
              (dungeon) => `<div class="map-tiles${dungeon.key === 'murd' ? ' active' : ''}" data-map="${dungeon.key}">
            ${dungeon.mapTiles.map((tile) => `<img src="${tile.src}" alt="" data-tile="${tile.x}-${tile.y}" />`).join('')}
          </div>`,
            )
            .join('')}
          <div class="map-shade"></div>
          <svg class="route-svg" viewBox="0 0 384 256" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="route-shadow" id="routeShadow" points="" />
            <polyline class="route-line" id="routeLine" points="" />
          </svg>
          <div class="markers" id="markers"></div>
          <div class="mob-hover" id="mobHover"></div>
          <div class="legend">
            <span><i class="dot" style="background:var(--pull-1)"></i>第1波</span>
            <span><i class="dot" style="background:var(--pull-2)"></i>第2波</span>
            <span><i class="dot" style="background:var(--pull-3)"></i>第3波</span>
            <span><i class="dot" style="background:var(--pull-4)"></i>第4波</span>
            <span><i class="dot" style="background:var(--pull-5)"></i>第5波+</span>
          </div>
        </div>
      </section>

      <aside class="side">
        <div class="progress-card">
          <div class="progress-head"><strong>敌方部队进度</strong><b id="progressPercent">0%</b></div>
          <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
          <div class="progress-meta"><span id="progressCount">0 / 0</span><span id="selectedMobs">0 个目标</span></div>
        </div>
        <div class="side-title"><h3>规划波次</h3><span id="pullTotal" style="color:var(--muted);font-size:11px"></span></div>
        <div class="pulls" id="pulls"></div>
        <button class="btn primary add-pull" id="addPullButton">＋ 新建波次</button>
        <div class="tip-card">
          <strong>完整单文件预览</strong><br />
          已内嵌当前赛季全部 8 个副本的真实地图、怪物点位、NPC 头像、中文名称与技能描述。切换副本后可分别规划路线。
        </div>
      </aside>
    </main>
    <footer class="footer">秘境路线工坊临时预览版 · 离线单文件 · 数据来源：Mythic Dungeon Tools 本地数据</footer>
  </div>

  <div class="modal-backdrop" id="mobModal" role="dialog" aria-modal="true" aria-labelledby="mobTitle">
    <div class="modal" id="mobModalContent"></div>
  </div>
  <div class="modal-backdrop" id="importModal" role="dialog" aria-modal="true" aria-labelledby="importTitle">
    <div class="modal">
      <div class="modal-head"><div><h3 id="importTitle">导入 MDT 路线</h3><p>粘贴 Mythic Dungeon Tools 6.2+ 导出的 MDT2 字符串</p></div><button class="close" data-close="importModal">×</button></div>
      <div class="import-body">
        <textarea id="mdtInput" spellcheck="false" placeholder="在此粘贴以 !~MDT2~ 开头的路线字符串"></textarea>
        <p class="import-hint">导入后会自动切换到对应副本，并用路线中的每一波怪物替换当前演示路线。单文件版暂不呈现 MDT 绘图、备注和团队标记。</p>
        <div class="import-error" id="importError"></div>
        <div class="import-actions"><button class="btn" data-close="importModal">取消</button><button class="btn primary" id="confirmImportButton">解析并导入</button></div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop" id="helpModal" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
    <div class="modal">
      <div class="modal-head"><div><h3 id="helpTitle">如何体验</h3><p>这是适合 WorkBuddy 发布的全副本单文件版</p></div><button class="close" data-close="helpModal">×</button></div>
      <div style="padding:16px;color:#bfd0dc;line-height:1.8;font-size:13px">
        <p>1. 在右侧选择当前波次，然后点击地图上的怪物点位，即可加入或移出路线。</p>
        <p>2. 彩色点表示已加入路线的怪物；虚线会依次连接各波次中心。</p>
        <p>3. 点击怪物会同时打开中文资料面板；右键怪物只查看资料，不修改路线。</p>
        <p>4. 点击技能名称可直接展开中文效果描述，不跳转外部网站。</p>
        <p>5. 点击顶部“导入 MDT”，可粘贴 MDT 6.2+ 导出的 <code>!~MDT2~</code> 路线字符串。</p>
        <p style="color:#8fa8bb">全部 8 个副本地图与 NPC 头像均已内嵌。该文件不请求任何外部图片、脚本或接口，可以直接离线打开。</p>
      </div>
    </div>
  </div>
  <div class="toast" id="toast"></div>

  <script id="previewData" type="application/json">${previewData}</script>
  <script>
    (function () {
      'use strict';
      var data = JSON.parse(document.getElementById('previewData').textContent);
      var colors = ['#49dfd2', '#ffbf5a', '#fd79b3', '#a68aff', '#79ccff'];
      var currentDungeon;
      var enemyById;
      var spawnById;
      var initialPulls;
      var state = { dungeonKey: 'murd', pulls: [], activePull: 0 };
      var toastTimer;

      function buildInitialPulls(dungeon) {
        return dungeon.initialGroups.map(function (group, index) {
        return {
          name: '第 ' + (index + 1) + ' 波',
            ids: dungeon.spawns.filter(function (spawn) { return spawn.group === group; }).map(function (spawn) { return spawn.id; })
        };
      }).filter(function (pull) { return pull.ids.length > 0; });
      }

      function selectDungeon(key, notify) {
        if (!data.dungeons[key]) return;
        state.dungeonKey = key;
        currentDungeon = data.dungeons[key];
        enemyById = new Map(currentDungeon.enemies.map(function (enemy) { return [enemy.id, enemy]; }));
        spawnById = new Map(currentDungeon.spawns.map(function (spawn) { return [spawn.id, spawn]; }));
        initialPulls = buildInitialPulls(currentDungeon);
        state.pulls = clonePulls(initialPulls);
        state.activePull = 0;
        document.getElementById('mapTitle').textContent = currentDungeon.name + ' · 路线演示';
        document.querySelectorAll('[data-dungeon]').forEach(function (button) {
          button.classList.toggle('active', button.getAttribute('data-dungeon') === key);
        });
        document.querySelectorAll('[data-map]').forEach(function (map) {
          map.classList.toggle('active', map.getAttribute('data-map') === key);
        });
        hideMobHover();
        renderAll();
        if (notify) showToast('已切换至“' + currentDungeon.name + '”，路线已载入。');
      }

      function clonePulls(pulls) {
        return pulls.map(function (pull) { return { name: pull.name, ids: pull.ids.slice() }; });
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
        });
      }

      function compactNumber(value) {
        if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 1 : 2) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return String(value);
      }

      function base64ToBytes(base64) {
        if (base64.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw new Error('MDT 字符串的 Base64 数据无效。');
        var binary = atob(base64);
        var bytes = new Uint8Array(binary.length);
        for (var index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
        return bytes;
      }

      async function inflateRaw(bytes, maximumBytes) {
        if (typeof DecompressionStream === 'undefined') throw new Error('当前浏览器不支持 MDT 解压，请使用新版 Chrome 或 Edge。');
        var stream;
        try { stream = new DecompressionStream('deflate-raw'); }
        catch (error) { throw new Error('当前浏览器不支持 MDT 原始压缩格式，请使用新版 Chrome 或 Edge。'); }
        var reader = new Blob([bytes]).stream().pipeThrough(stream).getReader();
        var chunks = [];
        var length = 0;
        while (true) {
          var result = await reader.read();
          if (result.done) break;
          length += result.value.length;
          if (length > maximumBytes) {
            await reader.cancel();
            throw new Error('MDT 路线解压后超过 8 MB 限制。');
          }
          chunks.push(result.value);
        }
        var output = new Uint8Array(length);
        var offset = 0;
        chunks.forEach(function (chunk) { output.set(chunk, offset); offset += chunk.length; });
        return output;
      }

      function decodeCbor(bytes) {
        var view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        var decoder = new TextDecoder();
        var position = 0;
        var items = 0;
        function ensure(length) { if (position + length > bytes.length) throw new Error('MDT CBOR 数据意外结束。'); }
        function readCount(info) {
          if (info < 24) return info;
          if (info === 24) { ensure(1); return view.getUint8(position++); }
          if (info === 25) { ensure(2); var value16 = view.getUint16(position); position += 2; return value16; }
          if (info === 26) { ensure(4); var value32 = view.getUint32(position); position += 4; return value32; }
          if (info === 27) {
            ensure(8); var value64 = view.getBigUint64(position); position += 8;
            if (value64 > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('MDT CBOR 整数超出安全范围。');
            return Number(value64);
          }
          throw new Error('MDT CBOR 包含不支持的数据长度。');
        }
        function readString(length) { ensure(length); var value = decoder.decode(bytes.subarray(position, position + length)); position += length; return value; }
        function float16(bits) {
          var sign = bits & 32768 ? -1 : 1;
          var exponent = bits >> 10 & 31;
          var fraction = bits & 1023;
          if (exponent === 0) return sign * Math.pow(2, -24) * fraction;
          if (exponent === 31) return fraction ? NaN : sign * Infinity;
          return sign * Math.pow(2, exponent - 15) * (1 + fraction / 1024);
        }
        function readValue(depth) {
          depth = depth || 0;
          if (depth > 64) throw new Error('MDT CBOR 嵌套层级过深。');
          if (++items > 250000) throw new Error('MDT CBOR 项目数量过多。');
          ensure(1);
          var initial = bytes[position++];
          var major = initial >> 5;
          var info = initial & 31;
          if (major === 0) return readCount(info);
          if (major === 1) return -1 - readCount(info);
          if (major === 2 || major === 3) return readString(readCount(info));
          if (major === 4) {
            var arrayLength = readCount(info);
            if (arrayLength > 100000) throw new Error('MDT CBOR 数组过大。');
            var array = [];
            for (var arrayIndex = 0; arrayIndex < arrayLength; arrayIndex++) array.push(readValue(depth + 1));
            return array;
          }
          if (major === 5) {
            var mapLength = readCount(info);
            if (mapLength > 100000) throw new Error('MDT CBOR 对象过大。');
            var map = Object.create(null);
            for (var mapIndex = 0; mapIndex < mapLength; mapIndex++) {
              var key = readValue(depth + 1);
              if (typeof key !== 'string' && typeof key !== 'number') throw new Error('MDT CBOR 对象键无效。');
              map[String(key)] = readValue(depth + 1);
            }
            return map;
          }
          if (major === 7) {
            if (info === 20) return false;
            if (info === 21) return true;
            if (info === 22 || info === 23) return null;
            if (info === 25) return float16(readCount(info));
            if (info === 26) { ensure(4); var float32 = view.getFloat32(position); position += 4; return float32; }
            if (info === 27) { ensure(8); var float64 = view.getFloat64(position); position += 8; return float64; }
          }
          throw new Error('MDT CBOR 包含不支持的数据类型。');
        }
        var decoded = readValue();
        if (position !== bytes.length) throw new Error('MDT CBOR 尾部包含多余数据。');
        return decoded;
      }

      async function decodeMdtString(text) {
        var trimmed = text.trim();
        if (!trimmed.startsWith('!~MDT2~')) throw new Error('仅支持 MDT 6.2+ 导出的 !~MDT2~ 路线，请更新插件后重新导出。');
        var encoded = trimmed.slice(7);
        if (!encoded) throw new Error('MDT 字符串缺少 Base64 数据。');
        if (encoded.length > 2000000) throw new Error('MDT 字符串超过 200 万字符限制。');
        var compressed = base64ToBytes(encoded);
        if (compressed.length > 1500000) throw new Error('MDT 压缩数据超过 1.5 MB 限制。');
        var decoded = decodeCbor(await inflateRaw(compressed, 8000000));
        if (!decoded || typeof decoded !== 'object' || !decoded.value || !Array.isArray(decoded.value.pulls)) throw new Error('MDT 路线结构无效，缺少波次数据。');
        if (!Number.isInteger(decoded.value.currentDungeonIdx)) throw new Error('MDT 路线结构无效，缺少副本编号。');
        return decoded;
      }

      function membership() {
        var result = new Map();
        state.pulls.forEach(function (pull, pullIndex) {
          pull.ids.forEach(function (id) { result.set(id, pullIndex); });
        });
        return result;
      }

      function pullCount(pull) {
        return pull.ids.reduce(function (total, id) {
          var spawn = spawnById.get(id);
          var enemy = spawn && enemyById.get(spawn.enemyId);
          return total + (enemy ? enemy.count : 0);
        }, 0);
      }

      function selectedIds() {
        return Array.from(new Set(state.pulls.flatMap(function (pull) { return pull.ids; })));
      }

      function renderAll() {
        renderMarkers();
        renderPulls();
        renderProgress();
        renderRoute();
      }

      function renderMarkers() {
        var markers = document.getElementById('markers');
        var selected = membership();
        markers.innerHTML = '';
        currentDungeon.spawns.forEach(function (spawn) {
          var enemy = enemyById.get(spawn.enemyId);
          if (!enemy) return;
          var pullIndex = selected.get(spawn.id);
          var marker = document.createElement('button');
          marker.className = 'mob-marker' + (pullIndex !== undefined ? ' selected' : '') + (pullIndex === state.activePull ? ' active-pull' : '') + (enemy.isBoss ? ' boss' : '');
          marker.style.left = (spawn.x / 384 * 100) + '%';
          marker.style.top = (spawn.y / 256 * 100) + '%';
          marker.style.setProperty('--pull-color', pullIndex !== undefined ? colors[pullIndex % colors.length] : (enemy.isBoss ? '#ffd178' : 'rgba(220,236,246,.66)'));
          marker.innerHTML = '<img src="' + enemy.portrait + '" alt="">';
          marker.title = enemy.name + ' · ' + enemy.count + ' 点进度';
          marker.setAttribute('aria-label', marker.title);
          marker.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleSpawn(spawn.id);
            showMob(enemy.id);
          });
          marker.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            event.stopPropagation();
            showMob(enemy.id);
          });
          marker.addEventListener('mouseenter', function () { showMobHover(enemy, spawn); });
          marker.addEventListener('mouseleave', hideMobHover);
          markers.appendChild(marker);
        });
      }

      function showMobHover(enemy, spawn) {
        var hover = document.getElementById('mobHover');
        hover.innerHTML = '<img src="' + enemy.portrait + '" alt=""><div><strong>' + escapeHtml(enemy.name) + '</strong><span>' + enemy.count + ' 点进度 · 点击查看技能</span></div>';
        hover.style.left = (spawn.x / 384 * 100) + '%';
        hover.style.top = (spawn.y / 256 * 100) + '%';
        hover.classList.add('visible');
      }

      function hideMobHover() {
        document.getElementById('mobHover').classList.remove('visible');
      }

      function renderPulls() {
        var pullsElement = document.getElementById('pulls');
        pullsElement.innerHTML = '';
        if (!state.pulls.length) {
          pullsElement.innerHTML = '<div class="empty">还没有波次，点击下方按钮开始规划。</div>';
        }
        state.pulls.forEach(function (pull, index) {
          var summary = new Map();
          pull.ids.forEach(function (id) {
            var spawn = spawnById.get(id);
            var enemy = spawn && enemyById.get(spawn.enemyId);
            if (enemy) {
              var existing = summary.get(enemy.id);
              summary.set(enemy.id, { enemy: enemy, count: existing ? existing.count + 1 : 1 });
            }
          });
          var summaryEntries = Array.from(summary.values());
          var summaryText = summaryEntries.slice(0, 4).map(function (entry) {
            return escapeHtml(entry.enemy.name) + ' ×' + entry.count;
          }).join('　');
          if (summary.size > 4) summaryText += '　等 ' + summary.size + ' 种';
          var chips = summaryEntries.slice(0, 7).map(function (entry) {
            return '<img class="mob-chip" src="' + entry.enemy.portrait + '" alt="' + escapeHtml(entry.enemy.name) + '" title="' + escapeHtml(entry.enemy.name) + ' ×' + entry.count + '">';
          }).join('');
          var card = document.createElement('article');
          card.className = 'pull-card' + (index === state.activePull ? ' active' : '');
          card.innerHTML = '<button class="pull-main" data-select-pull="' + index + '">' +
            '<div class="pull-top"><span class="pull-name"><i class="dot" style="background:' + colors[index % colors.length] + '"></i>' + escapeHtml(pull.name) + '</span>' +
            '<span class="pull-count">' + pullCount(pull) + ' 点</span></div>' +
            '<div class="pull-mobs">' + (summaryText || '点击地图怪物加入此波次') + '</div>' + (chips ? '<div class="mob-chips">' + chips + '</div>' : '') + '</button>' +
            '<div class="pull-actions"><button data-clear-pull="' + index + '">清空本波</button><button data-delete-pull="' + index + '">删除</button></div>';
          pullsElement.appendChild(card);
        });
        document.getElementById('pullTotal').textContent = state.pulls.length + ' 波';
        pullsElement.querySelectorAll('[data-select-pull]').forEach(function (button) {
          button.addEventListener('click', function () {
            state.activePull = Number(button.getAttribute('data-select-pull'));
            renderAll();
          });
        });
        pullsElement.querySelectorAll('[data-clear-pull]').forEach(function (button) {
          button.addEventListener('click', function () {
            state.pulls[Number(button.getAttribute('data-clear-pull'))].ids = [];
            renderAll();
          });
        });
        pullsElement.querySelectorAll('[data-delete-pull]').forEach(function (button) {
          button.addEventListener('click', function () {
            var index = Number(button.getAttribute('data-delete-pull'));
            state.pulls.splice(index, 1);
            state.activePull = Math.max(0, Math.min(state.activePull, state.pulls.length - 1));
            renamePulls();
            renderAll();
          });
        });
      }

      function renderProgress() {
        var ids = selectedIds();
        var count = ids.reduce(function (total, id) {
          var spawn = spawnById.get(id);
          var enemy = spawn && enemyById.get(spawn.enemyId);
          return total + (enemy ? enemy.count : 0);
        }, 0);
        var percent = Math.min(100, count / currentDungeon.totalCount * 100);
        document.getElementById('progressPercent').textContent = percent.toFixed(1) + '%';
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressCount').textContent = count + ' / ' + currentDungeon.totalCount;
        document.getElementById('selectedMobs').textContent = ids.length + ' 个目标';
      }

      function renderRoute() {
        var points = state.pulls.map(function (pull) {
          var pullSpawns = pull.ids.map(function (id) { return spawnById.get(id); }).filter(Boolean);
          if (!pullSpawns.length) return null;
          var x = pullSpawns.reduce(function (sum, spawn) { return sum + spawn.x; }, 0) / pullSpawns.length;
          var y = pullSpawns.reduce(function (sum, spawn) { return sum + spawn.y; }, 0) / pullSpawns.length;
          return x.toFixed(1) + ',' + y.toFixed(1);
        }).filter(Boolean).join(' ');
        document.getElementById('routeShadow').setAttribute('points', points);
        document.getElementById('routeLine').setAttribute('points', points);
      }

      function renamePulls() {
        state.pulls.forEach(function (pull, index) { pull.name = '第 ' + (index + 1) + ' 波'; });
      }

      function toggleSpawn(id) {
        if (!state.pulls.length) {
          state.pulls.push({ name: '第 1 波', ids: [] });
          state.activePull = 0;
        }
        var existingPull = state.pulls.findIndex(function (pull) { return pull.ids.includes(id); });
        if (existingPull >= 0) {
          state.pulls[existingPull].ids = state.pulls[existingPull].ids.filter(function (spawnId) { return spawnId !== id; });
        } else {
          state.pulls[state.activePull].ids.push(id);
        }
        renderAll();
      }

      async function importMdtRoute() {
        var input = document.getElementById('mdtInput');
        var errorElement = document.getElementById('importError');
        var confirmButton = document.getElementById('confirmImportButton');
        errorElement.textContent = '';
        if (!input.value.trim()) {
          errorElement.textContent = '请先粘贴 MDT 路线字符串。';
          return;
        }
        confirmButton.disabled = true;
        confirmButton.textContent = '正在解析…';
        try {
          var route = await decodeMdtString(input.value);
          var dungeonKey = Object.keys(data.dungeons).find(function (key) {
            return data.dungeons[key].dungeonIndex === route.value.currentDungeonIdx;
          });
          if (!dungeonKey) throw new Error('该 MDT 路线不属于本预览版支持的当前赛季 8 个副本。');
          selectDungeon(dungeonKey, false);
          var spawnLookup = new Map();
          currentDungeon.spawns.forEach(function (spawn) {
            var enemy = enemyById.get(spawn.enemyId);
            if (enemy) spawnLookup.set(enemy.enemyIndex + ':' + spawn.idx, spawn.id);
          });
          var missing = 0;
          var importedPulls = route.value.pulls.map(function (mdtPull, pullIndex) {
            var ids = [];
            Object.entries(mdtPull).forEach(function (entry) {
              var enemyIndex = Number(entry[0]);
              var cloneIndexes = entry[1];
              if (!Number.isInteger(enemyIndex) || !Array.isArray(cloneIndexes)) return;
              cloneIndexes.forEach(function (cloneIndex) {
                var spawnId = spawnLookup.get(enemyIndex + ':' + cloneIndex);
                if (spawnId) ids.push(spawnId); else missing += 1;
              });
            });
            return { name: '第 ' + (pullIndex + 1) + ' 波', ids: Array.from(new Set(ids)) };
          });
          state.pulls = importedPulls.length ? importedPulls : [{ name: '第 1 波', ids: [] }];
          state.activePull = Math.max(0, Math.min(Number(route.value.currentPull) || 0, state.pulls.length - 1));
          document.getElementById('mapTitle').textContent = currentDungeon.name + ' · ' + (typeof route.text === 'string' && route.text ? route.text : 'MDT 导入路线');
          renderAll();
          closeModal('importModal');
          showToast('已导入 ' + state.pulls.length + ' 波 MDT 路线' + (missing ? '；' + missing + ' 个旧点位未匹配' : '') + '。');
        } catch (error) {
          errorElement.textContent = error instanceof Error ? error.message : 'MDT 路线解析失败。';
        } finally {
          confirmButton.disabled = false;
          confirmButton.textContent = '解析并导入';
        }
      }

      function showMob(enemyId) {
        var enemy = enemyById.get(enemyId);
        if (!enemy) return;
        var spells = enemy.spells.map(function (spell) {
          var tags = spell.attributes.length ? spell.attributes.join(' · ') : '技能信息';
          return '<article class="spell"><button type="button"><span><span class="spell-name">' + escapeHtml(spell.name) + '</span> <span class="spell-id">' + spell.id + '</span></span><span class="spell-tags">' + escapeHtml(tags) + '⌄</span></button><p class="spell-description">' + escapeHtml(spell.description) + '</p></article>';
        }).join('');
        var content = document.getElementById('mobModalContent');
        content.innerHTML = '<div class="modal-head"><div class="mob-identity"><img class="mob-portrait" src="' + enemy.portrait + '" alt="' + escapeHtml(enemy.name) + '"><div><h3 id="mobTitle">' + escapeHtml(enemy.name) + '</h3><p>' + escapeHtml(enemy.englishName) + ' · MDT 敌人索引 ' + enemy.enemyIndex + '</p></div></div><button class="close" data-close="mobModal">×</button></div>' +
          '<div class="mob-stats"><div class="stat"><span>NPC ID</span><strong>' + enemy.id + '</strong></div><div class="stat"><span>敌方部队</span><strong>' + enemy.count + ' 点</strong></div><div class="stat"><span>基础生命值</span><strong>' + compactNumber(enemy.health) + '</strong></div><div class="stat"><span>生物类型</span><strong>' + escapeHtml(enemy.creatureType) + '</strong></div><div class="stat"><span>首领</span><strong>' + (enemy.isBoss ? '是' : '否') + '</strong></div><div class="stat"><span>控制提示</span><strong>' + escapeHtml(enemy.characteristics.join('、') || '无特殊标记') + '</strong></div></div>' +
          '<div style="padding:0 14px 8px;font-weight:700;font-size:13px">技能与效果</div><div class="spell-list">' + (spells || '<div class="empty">暂无技能资料</div>') + '</div>';
        content.querySelector('[data-close="mobModal"]').addEventListener('click', function () { closeModal('mobModal'); });
        content.querySelectorAll('.spell button').forEach(function (button) {
          button.addEventListener('click', function () { button.parentElement.classList.toggle('open'); });
        });
        openModal('mobModal');
      }

      function openModal(id) { document.getElementById(id).classList.add('open'); }
      function closeModal(id) { document.getElementById(id).classList.remove('open'); }
      function showToast(message) {
        var toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
      }

      document.querySelectorAll('[data-dungeon]').forEach(function (button) {
        button.addEventListener('click', function () {
          var key = button.getAttribute('data-dungeon');
          if (key === state.dungeonKey) return;
          selectDungeon(key, true);
        });
      });
      document.getElementById('addPullButton').addEventListener('click', function () {
        state.pulls.push({ name: '第 ' + (state.pulls.length + 1) + ' 波', ids: [] });
        state.activePull = state.pulls.length - 1;
        renderAll();
      });
      document.getElementById('clearButton').addEventListener('click', function () {
        state.pulls = [{ name: '第 1 波', ids: [] }];
        state.activePull = 0;
        renderAll();
        showToast('路线已清空，可以重新规划。');
      });
      document.getElementById('resetButton').addEventListener('click', function () {
        state.pulls = clonePulls(initialPulls);
        state.activePull = 0;
        document.getElementById('mapTitle').textContent = currentDungeon.name + ' · 路线演示';
        renderAll();
        showToast('已恢复默认演示路线。');
      });
      document.getElementById('importMdtButton').addEventListener('click', function () {
        document.getElementById('importError').textContent = '';
        openModal('importModal');
        setTimeout(function () { document.getElementById('mdtInput').focus(); }, 0);
      });
      document.getElementById('confirmImportButton').addEventListener('click', importMdtRoute);
      document.querySelectorAll('[data-close="importModal"]').forEach(function (button) {
        button.addEventListener('click', function () { closeModal('importModal'); });
      });
      document.getElementById('helpButton').addEventListener('click', function () { openModal('helpModal'); });
      document.querySelector('[data-close="helpModal"]').addEventListener('click', function () { closeModal('helpModal'); });
      document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
        backdrop.addEventListener('click', function (event) { if (event.target === backdrop) closeModal(backdrop.id); });
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') document.querySelectorAll('.modal-backdrop.open').forEach(function (modal) { modal.classList.remove('open'); });
      });
      selectDungeon('murd', false);
    })();
  </script>
</body>
</html>`

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, html, 'utf8')

const size = Buffer.byteLength(html)
console.log(`WorkBuddy preview generated: ${outputPath}`)
console.log(`Size: ${(size / 1024 / 1024).toFixed(2)} MB`)
console.log(
  `Embedded dungeons: ${dungeonChoices.length}; map tiles: ${dungeonChoices.length * 24}; enemies: ${dungeonChoices.reduce((total, dungeon) => total + dungeon.enemies.length, 0)}; spawns: ${dungeonChoices.reduce((total, dungeon) => total + dungeon.spawns.length, 0)}`,
)
