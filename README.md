# threeDemo

Three.js 实验合集，含天气天空、真实光照、后期处理、激光特效等演示页面。

#### 使用说明

##### GitHub Pages 在线演示

本仓库 `docs/` 目录为静态站点，用于 [GitHub Pages](https://pages.github.com/) 部署：

1. 打开仓库 **Settings → Pages**
2. **Build and deployment → Source** 选择 `Deploy from a branch`
3. **Branch** 选 `main`，文件夹选 **`/docs`**
4. 保存后访问：`https://zhangyiweb.github.io/threeDemo/`

本地预览：直接用浏览器打开 `docs/index.html`，或执行 `powershell scripts/build-docs.ps1` 从 `zhtml/` 同步最新页面。

目录结构：

```text
docs/
  index.html          # 首页（项目卡片入口）
  1.机器人移动.html   # 各实验页面（与首页同目录）
  assets/cover/       # 封面图
  .nojekyll           # 禁用 Jekyll，避免路径问题
```

##### GitHub 资源链接转换

在网页（Three.js、`<img>`、Markdown 图片等）中直接引用 GitHub 文件时，**不能使用** `blob` 页面地址，需要改为 `raw.githubusercontent.com` 的直链地址。

**转换规则：**

| 类型 | 地址格式 |
|------|----------|
| 页面地址（不可用） | `https://github.com/{用户}/{仓库}/blob/{分支}/{路径}` |
| 直链地址（请使用） | `https://raw.githubusercontent.com/{用户}/{仓库}/{分支}/{路径}` |

**示例（封面图）：**

- 页面地址（不要用于加载）  
  `https://github.com/zhangyiweb/models/blob/main/cover/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250530093132.png`

- 直链地址（请使用）  
  `https://raw.githubusercontent.com/zhangyiweb/models/main/cover/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250530093132.png`

Markdown 中引用示例：

```markdown
![封面](https://raw.githubusercontent.com/zhangyiweb/models/main/cover/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250530093132.png)
```

HTML / Three.js 中同样使用上述 `raw.githubusercontent.com` 地址即可。
