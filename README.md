# threeDemo

Three.js 实验合集，含天气天空、真实光照、后期处理、激光特效等演示页面。

**在线访问**：[https://zhangyiweb.github.io/threeDemo/](https://zhangyiweb.github.io/threeDemo/)

#### 使用说明

本地预览：用 Live Server 打开仓库根目录，访问 `zhtml/index.html`。

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
