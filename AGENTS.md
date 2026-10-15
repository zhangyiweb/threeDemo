# [AGENTS.md](http://AGENTS.md)

面向在本仓库工作的 AI / Agent 的项目说明与操作约定。用户沟通请使用**简体中文**。

<!-- 提示词：通读当前项目，把你学到的关于项目的信息保存到 AGENTS.md 文件里，用中文，格式规范。 -->

---

## 1. 项目是什么

- 仓库名常写作 **threeDemo** / **three_v003**。
- 内容是 **Three.js 实验合集**：本地可运行 demo + 在线案例收藏（refs）。
- 入口 gallery：`zhtml/index.html`（Vue 2 CDN，双页签：本地项目 / 在线案例）。
- **无打包、无 `package.json`**：多数 demo 是单文件 HTML，用 importmap + CDN 加载 Three.js。
- 本地预览：用 Live Server 打开仓库根目录，访问 `zhtml/index.html`。

当前规模（以 gallery 登记为准，可能随时间增长）：


| 类型      | 位置                                   | 约略规模     |
| ------- | ------------------------------------ | -------- |
| 本地 demo | `zhtml/{编号}.{标题}.html` + `list`      | 1–76     |
| 在线 refs | `refs` 数组                            | id 1–91  |
| 封面      | `assets/cover/`、`assets/cover/refs/` | 按编号 / id |


完整目录说明见 `README.md`；卡片文案以 `zhtml/index.html` 内的 `list` / `refs` 为准。

---

## 2. 目录结构

```
.
├── zhtml/                 # 全部 HTML demo + gallery
│   ├── index.html         # 展示页（list / refs 数据源）
│   ├── demo Online.html   # 空白沙箱模板
│   └── N.标题.html        # 本地 demo（文件名必须与 list.title 一致）
├── assets/
│   ├── cover/             # 本地 demo 封面：{编号}.png
│   ├── cover/refs/        # refs 封面：{id}.png
│   ├── img/               # 共享贴图等
│   └── map/               # 地图数据（如 china.json）
├── .cursor/
│   ├── rules/graphify.mdc # 强制先用 graphify 探代码
│   └── skills/            # 项目内 Agent Skill
├── graphify-out/          # 知识图谱产物（勿手改业务逻辑）
├── README.md              # 给人看的项目说明与目录
└── AGENTS.md              # 本文件
```

---

## 3. Gallery：`list` 与 `refs`

数据都写在 `zhtml/index.html` 的 Vue `data` 里。文件已很长（两千行级），编辑时**局部读取 + 定点替换**，不要整文件塞进上下文。

### 3.1 本地项目 `list`

打开方式：`openLocal` → `./{item.title}.html`  
因此 `**title` 必须等于文件名（不含扩展名）**，例如：

- `title: "76.武士舞台"` → 文件 `zhtml/76.武士舞台.html`

字段约定：


| 字段        | 必填  | 说明                                      |
| --------- | --- | --------------------------------------- |
| `title`   | 是   | `"编号.中文标题"`，与文件名一致                      |
| `desc`    | 是   | 一行简介，可含英文原名                             |
| `tags`    | 是   | 字符串数组，约 2–4 个                           |
| `codepen` | 否   | 有则显示 CodePen 按钮                         |
| `repo`    | 否   | 有则显示 GitHub 按钮                          |
| `skills`  | 否   | 有则显示 Skills 按钮（外链 skill 仓库）             |
| `url`     | 否   | 若有，封面用该 URL，否则用 `assets/cover/{编号}.png` |


新增本地 demo 时：

1. 新建 `zhtml/{下一编号}.{标题}.html`（编号取当前最大 + 1）。
2. 在 `list` **末尾**追加条目。
3. 可选：放封面 `assets/cover/{编号}.png`。
4. 改代码后执行 `graphify update .`。
5. 若显著增加 demo，可同步更新 `README.md` 目录（非必须每次都改）。

### 3.2 在线案例 `refs`

字段约定：


| 字段       | 必填  | 说明                                     |
| -------- | --- | -------------------------------------- |
| `id`     | 是   | 递增整数，封面默认 `assets/cover/refs/{id}.png` |
| `title`  | 是   | 展示标题                                   |
| `desc`   | 是   | 简介                                     |
| `tags`   | 是   | 标签数组                                   |
| `url`    | 常见  | 「访问案例」或有 `home` 时显示「演示」                |
| `home`   | 否   | 「官网」按钮；有 `home` 时 `url` 文案变为「演示」       |
| `repo`   | 否   | GitHub 按钮                              |
| `video`  | 否   | 视频介绍                                   |
| `author` | 否   | 作者页                                    |
| `cover`  | 否   | 覆盖默认封面路径                               |


按钮逻辑（refs 卡片）：

- `home` → 官网  
- `url` → 访问案例 / 演示  
- `repo` → GitHub  
- `video` → 视频介绍  
- `author` → 作者

仅官网 + 演示、无 GitHub 时：只写 `home` + `url`（参考「点映数字科技」）。

---

## 4. 本地 Demo 实现约定

### 4.1 技术基线

- **优先** Three.js **0.185.0** CDN + importmap（与 `demo Online.html`、多数新 demo 一致）。
- 典型 importmap：

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.185.0/examples/jsm/"
  }
}
</script>
```

- 旧 demo / 特殊依赖可保留历史版本（如极老 CodePen 用 r71）；**新建应跟 0.185**，并处理 API 迁移（如 `outputColorSpace`、`MathUtils`、几何体命名等）。
- 常用附加：`Stats`、`lil-gui`、`OrbitControls`、`EffectComposer` / `UnrealBloomPass`、`gsap`（按需 ESM）。
- WebGPU / TSL demo 需额外 importmap（如 `three.webgpu.js`、`three.tsl.js`），参考 `67.BeerJS酒瓶.html`。

### 4.2 从 CodePen / GitHub 移植

- **必须落地为本地可运行 HTML**，禁止用 iframe 嵌 CodePen（会被 `X-Frame-Options` / CSP 拦截）。
- 改用项目 importmap；外链资源尽量保留可访问的 CDN / raw 地址。
- GitHub 文件在页面中加载时，用 `raw.githubusercontent.com`，不要用 `blob` 页（详见 `README.md`）。
- 大体积单文件沙盒（如 74–76）可为原作打包结果，仍按 `list` 登记并挂 `repo`。

### 4.3 模板与 Skill

- 空白起步：`zhtml/demo Online.html`。
- 天气 / 天空 / 云 / 雾 / 雨 / 雷电：优先读并遵循  
`.cursor/skills/threejs-weather-sky/SKILL.md`。

### 4.4 已知坑（修同类问题可对照）

- **UnrealBloomPass**：构造函数末参是 `threshold`；过高会「看不见辉光」；注意 `renderToScreen` / composer 输出链路。
- **着色器时间**：更新 `uniforms.xxx.value`，不要写到不存在的材质属性上。
- **颜色空间**：新代码倾向 `renderer.outputColorSpace = THREE.SRGBColorSpace`；噪声图可用 `NoColorSpace`。
- **pixelRatio**：建议 `Math.min(devicePixelRatio, 2)`。

---

## 5. Graphify（强制）

仓库有知识图谱：`graphify-out/`。规则见 `.cursor/rules/graphify.mdc`。

探索代码前先：

```bash
graphify query "<问题>"
graphify path "<A>" "<B>"
graphify explain "<概念>"
```

修改代码文件后：

```bash
graphify update .
```

不要因为「已经熟悉文件」而跳过；子 agent 探代码时也要带上此规则。

---

## 6. Agent 工作习惯

1. **先 graphify，再局部 Read/Grep**；避免通读超大 HTML（部分沙盒上万行）。
2. **用户说「list 添加」**：做本地 demo 文件（若已有文件则只登记）+ 写 `list`。
3. **用户说「refs 添加」**：只改 `refs`，不造本地 HTML；按链接补 `url` / `repo` / `home` 等。
4. **不要主动 commit / push**，除非用户明确要求。
5. **不要用 iframe 冒充实现**；外链展示用 refs 按钮。
6. 回复简洁、中文；`index.html` 只改必要片段。

---

## 7. 本地 Demo 主题速览（便于选型）

不必背全表，按编号段大致分类：


| 编号段                     | 主题                        |
| ----------------------- | ------------------------- |
| 1–2                     | 机器人漫游 / 碰撞                |
| 3–8, 11, 16             | 天气、天空、灰尘、风、真实光照、体积云       |
| 9–10, 19, 22–24         | 园区夜景、GIS、Cesium、地图、看车     |
| 12–15, 17–18, 20–21, 25 | 激光、后期、熔岩、SSR、材质、电影级       |
| 26–52                   | 大气/材质/海洋/草地/WebGPU 等图形实验  |
| 53–73                   | 交互实验与 CodePen 移植          |
| 74–76                   | 技能沙盒 / 线性施法 / 第三人称武士（大体量） |


---

## 8. 维护本文件

当出现以下情况时更新 `AGENTS.md`：

- gallery 数据结构或按钮字段变更；
- Three.js 默认 CDN 版本变更；
- 新增重要 Skill / 规则；
- 发现需反复踩坑的约定。

不必每次加一条 demo 就改本文件；编号规模可在有需要时同步。