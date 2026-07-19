# Rogier de Boevé — 1:1 工程化复刻

对获奖 WebGL 作品集网站 [rogierdeboeve.com](https://rogierdeboeve.com/) 的 **1:1 工程化复刻**：不是爬站镜像，而是以源站的压缩产物（JS bundle、CSS bundle、HTML）为唯一依据，用现代工程栈把整站**重新实现**到与线上视觉、交互、行为在可测量维度上一致的程度。

> 原站设计与创意归 [Rogier de Boevé](https://rogierdeboeve.com/) 所有。本仓库仅作技术研究与学习用途。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Astro（纯静态输出，17 页） |
| 语言 | TypeScript |
| 3D | Three.js（多场景渲染管线：sky / work / thumb / main / wavves / media / character） |
| 动效 | GSAP + Lenis |
| 音频 | Howler |

## 运行

```sh
npm install
npm start          # build + 本地静态服务
```

打开 `http://localhost:5173/`（端口被占用时 `PORT=3000 npm start`）。

其他常用命令：

```sh
npm run build      # 仅构建到 dist/
npm run mirror     # 重新抓取源站镜像到 legacy-mirror/
```

回归验证（CDP 驱动的无头探针，需要本地服务在跑）：

```sh
OUT_DIR=/tmp/probe node scripts/probe-output-color.mjs           # 首页渲染输出（桌面）
VIEWPORT=mobile PROBE_WAIT=45000 OUT_DIR=/tmp/probe-m \
  node scripts/probe-output-color.mjs                            # 首页（移动端模拟）
OUT_DIR=/tmp/probe-a node scripts/probe-about-scroll-opacity.mjs # About 滚动状态
OUT_DIR=/tmp/probe-p node scripts/probe-project-media.mjs        # 项目页媒体
OUT_DIR=/tmp/probe-t node scripts/probe-thumb-spotlight.mjs      # 缩略图聚光灯
node scripts/audit-renderer-output.mjs                           # 渲染器配置审计
```

## 仓库结构

```
src/               复刻实现（页面、组件、client 运行时）
  client/webgl.ts    WebGL 全部场景与渲染管线
  client/main.ts     路由、preloader、视图生命周期
  client/motion.ts   入场动效编排
public/            与源站逐字节一致的静态资产（媒体、模型、字体、音频、sw.js）
legacy-mirror/     源站镜像（HTML + 压缩 bundle）——复刻的唯一裁决依据
scripts/           探针、审计、部署、镜像工具
HANDOFF.md         当前状态与已记录的有意偏差（续作先读这个）
```

## 复刻方法论与经验

整个项目最重要的纪律只有一条：**源站代码是唯一裁决，不凭观感修**。每个改动先在 bundle/CSS/镜像 HTML 里找到归属，再落地，再过回归门。以下是过程中沉淀的经验。

### 验证手段（比实现本身更值钱）

- **正向 CSS diff**：解析双方样式表，对共享选择器逐属性比对——揪出 letter-spacing、字号阶梯、根字号作用域等一批"差一点"的值
- **反向 CSS 扫描**：枚举复刻独有的规则并逐条判定"必要机制 / 等价别名 / 多余发明"——自创规则是 bug 的最大来源
- **资产哈希比对**：public/ 全量对源站逐字节校验（字体、模型、图标都曾在这里现形）
- **computed style / 几何矩形逐值对比**：CDP 抓两站同一元素的最终计算值，杜绝"看着差不多"
- **行亮度剖面**：整屏按行采样灰度并对比曲线，量化"氛围像不像"（项目页背景雾缺失就是这样定位的）
- **颜色时间轨迹**：换页过程中每 120ms 采样文字颜色，两站曲线逐点对齐
- **DOM 身份测试**：跨路由断言 header/nav 是同一个 JS 对象，验证常驻组件架构

### 踩坑分类（按杀伤力排序）

1. **自创补偿性 CSS 是头号雷区**。JS 机制没对齐时用 CSS 补观感（自创的半透明色、`transition: color`、入场遮罩 `overflow:hidden`、header 渐变、text-shadow、`display:none` 隐藏导航），等 JS 后来对齐了，这些补丁全部反转成 bug——本项目十余个视觉 bug 属于此类。**宁可先不像，也不要发明规则。**
2. **级联顺序即语义**。源站 bundle 把布局工具类放在样式表末尾；复刻放在开头，同特异性冲突全部反向解析，项目页媒体栅格整个坍塌。逐字复刻要连"规则出现的顺序"一起复刻。
3. **时序即视觉**。preloader 阶段哪些元素进场、`ANIMATE_IN` 在点击 Enter 时揭示什么、路由换页时谁常驻谁替换——源站的编排精确到事件，任何"先显示再动画"的偷懒都会闪。
4. **精确数字不能近似**。`clamp()` 近似源站的断点阶梯、0.45 近似 0.6、2.8rem 近似 2.8125rem——每个"差不多"都会在某个视口宽度上现形。
5. **JS 语义细节**。源站 `pz % 250 + 10` 的带符号取模被"修正"成正取模，方块全跑到相机背后——压缩代码里的每个怪写法都可能是行为本身。
6. **字面值与实况冲突时，以实况为准**。bundle 写 `depthBuffer:false` 但线上人头背面遮挡正常——验收基线是线上视觉，偏差记录在案即可。
7. **死代码也照抄，缺的行为不发明**。CSS 里从未被引用的 `ts-split` 原样保留；404 页是首页的字节级克隆；`<body style="opacity:0">` 的 FOUC 防线一并复刻。
8. **环境因素会伪装成 bug**。SPA 会话里旧构建的 JS/CSS、代理工具的 DNS 负缓存、构建窗口期的 fetch 失败——先取证（computed style、DoH、直连 IP），再动代码。

### 与源站的已知有意偏差

全部记录在 `HANDOFF.md`（视频加载走直接 `src` 而非 Worker blob、导航用 `ul/li` 语义化结构、人头渲染目标开深度缓冲、探针脚手架保留在产物中等）。视觉与交互层面：首页/About/项目页与线上站的行亮度剖面差均在噪声级（±4 灰阶）。
