# three_v003

#### 介绍
{**以下是 Gitee 平台说明，您可以替换此简介**
Gitee 是 OSCHINA 推出的基于 Git 的代码托管平台（同时支持 SVN）。专为开发者提供稳定、高效、安全的云端软件开发协作平台
无论是个人、团队、或是企业，都能够用 Gitee 实现代码托管、项目管理、协作开发。企业项目请看 [https://gitee.com/enterprises](https://gitee.com/enterprises)}

#### 软件架构
软件架构说明


#### 安装教程

1.  xxxx
2.  xxxx
3.  xxxx

#### 使用说明

##### GitHub Pages 在线演示

本仓库 `docs/` 目录为静态站点，用于 [GitHub Pages](https://pages.github.com/) 部署：

1. 将仓库推送到 GitHub（见下方「部署步骤」）
2. 打开仓库 **Settings → Pages**
3. **Build and deployment → Source** 选择 `Deploy from a branch`
4. **Branch** 选 `master`，文件夹选 **`/docs`**
5. 保存后访问：`https://<你的用户名>.github.io/three_v003/`

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

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
