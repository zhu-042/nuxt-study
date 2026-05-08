# 周六面试准备文档

> 创建时间：2026-05-07
> 面试时间：周六（2026-05-09）

---

## 一、岗位背景

**公司**：钉钉相关团队（介绍人是哥哥，钉钉员工）
**岗位**：低代码开发工程师
**Base**：杭州 / 湖州（可选）
**渠道**：熟人推荐

### JD 要求 vs 真实需求

| JD 表面要求 | 介绍人透露的真实情况 |
|---|---|
| 本科学历 | 「可以放开」 |
| 1 年以上 IT 经验 | 「只要愿意学习、有基础能力即可」 |
| 钉钉开发经验优先 | 「活不难、不复杂」 |
| 至少一种后端语言 | 用悟空（钉钉自家 AI 编程工具）已能做大半 |
| 熟练 AI 编程工具 | **核心要求** |

### 核心结论

- HC 难申请，集团一直没给到合适人选 → 走熟人渠道放宽门槛
- 真正缺的是：**懂技术 + 会用 AI 工具 + 能把低代码搞不定的最后 20% 收尾**
- 自我定位：**前端开发工程师**（不要伪装成全栈或低代码专家）

### 注意事项

- 简历里写的东西必须能讲清楚，否则会让推荐人难做
- 悟空 = 钉钉自家 AI 编程助手（类似 Claude Code / Codex），不是低代码平台
- 低代码本身需要单独了解

---

## 二、准备节奏

1. **第一阶段**：把简历里的技术点全部搞懂（当前阶段）
2. **第二阶段**：了解低代码相关知识
3. **第三阶段**：了解钉钉开放平台基础
4. **第四阶段**：模拟面试 + 自我介绍话术

---

## 三、简历技术点全景图

### 🔥 P0 - 大概率被深挖

1. SSE 流式对话引擎（fetch-event-source、消息 ID 结构化、Agent 时间线）
2. SSR / ISR / SEO 工程化（Nuxt SSR、Next ISR、JSON-LD、TDK 降级、Sitemap）
3. 多租户架构（二级域名识别、Cookie 跨子域、SSR/CSR 一致性、API 注入团队标识）
4. SHA256 秒传 + OSS 预签名直传（哈希计算、为什么不走业务服务器）
5. 状态管理（Pinia 27 个 Store 怎么组织、Zustand 和 Pinia 区别）

### 🟡 P1 - 中等概率追问

6. WebSocket + Web Audio API 实时语音
7. Tiptap 富文本 + Markdown 管线（KaTeX、代码高亮）
8. IndexedDB 缓存学术搜索（为什么不用内存 / SWR）
9. 三级权限体系 + 高阶函数注入 API 团队标识
10. next-intl 国际化 + middleware 301 重定向

### 🟢 P2 - 低频但要能讲

11. Splitpanes + Teleport 响应式分栏
12. IntersectionObserver 懒加载（视频、TOC 高亮）
13. 状态机组件（写作/检测产品线复用）
14. WordPress REST API + 中英文 meta 覆盖
15. 归因追踪 + GA 延迟加载
16. 智能滚动控制（节流 + 底部阈值）
17. 异步组件懒加载 + Tab 缓存策略
18. 翻译与 PDF 联动（EventBus）
19. 三层 TDK 降级策略
20. 文档付费下载 + AI 编辑器商业闭环
21. CSS transform 三屏轮播
22. 文件上传后定时轮询 + 增量更新
23. 游标分页 vs offset 分页
24. 浮动帮助系统（拖拽 + Dify AI 客服对接）

---

## 四、技术点逐条过

### 【P0-1】SSE 流式对话引擎

> 简历原文：基于 SSE（Server-Sent Events）实现 AI 流式对话引擎，使用 fetch-event-source 发起流式请求，按消息 ID 进行结构化管理，支持 Agent 多步推理过程的时间线可视化展示（思考 → 工具调用 → 最终回答）

#### Q1：SSE 是什么？它和 WebSocket、普通 HTTP 请求的区别？为什么 AI 流式输出选 SSE 而不是 WebSocket？

**我的回答：**

（在这里写你的回答）

sse 跟 wb 接口都是支持流失输出内容  普通的http请求 就是 请求一次一直直接出结果

sse是单向通话 后端给前端发消息

ai回答 wb 就有点浪费资源了 一般都是 前端提出一个问题 后端ai做出回答 答案一点一点出来

wb 是可以给后端发送多次消息这个场景一般都用不到 ai回答一般就是一问一答

---

#### Q2：浏览器原生有 `EventSource` API，为什么不用原生的，而要用 fetch-event-source？

**我的回答：**

（在这里写你的回答）

原生的 好像只能发送get请求 不能post 请求 不能进行 自定义请求头 不能在body 里面传参数  不要带token



---

#### Q3：「按消息 ID 进行结构化管理」具体怎么做的？AI 回答分多次推送过来，前端怎么拼到同一条消息上？

**我的回答：**

（在这里写你的回答）

用户发送一个问题 ai 进行分析 思考  回答

这个时候就可以分为多个 部分id 

sse 发送开始typeid  然后分析问题typeid 思考typeid  回答typeid 结束typeid

有了这些id 前端就跟好去判断 每个阶段做该做的事情 可能不同阶段 有不同的样式

---

#### Claude 补充与讲解

### 总体评价

| 题目 | 你的得分 | 状态 |
|---|---|---|
| Q1 三者对比 | 60/100 | ✅ 方向对，缺协议层细节 |
| Q2 为什么不用原生 EventSource | 70/100 | ✅ 核心点全中 |
| Q3 消息 ID 结构化 | 40/100 | ⚠️ **概念混淆，要重点搞懂** |

---

### Q1 补充

**✅ 你答对的：**
- SSE 和 WebSocket 都支持流式 ✓
- SSE 是单向（服务端→客户端） ✓
- WebSocket 双向，AI 一问一答场景用 WebSocket 浪费 ✓

**❌ 你不够准确 / 缺失的：**

1. **「普通 HTTP 一次出结果」不严谨**
   - HTTP/1.1 的 chunked transfer encoding 也能流式
   - 准确说法是：**普通 HTTP 客户端拿到完整 body 才解析**，前端体验上是「一次性出结果」
   - SSE 本质上就是 **HTTP 长连接 + 特定文本格式（`data: xxx\n\n`）**

2. **没讲协议层差异：**
   - SSE：走标准 HTTP/HTTPS，可以复用 CORS、代理、CDN、负载均衡，企业网关友好
   - WebSocket：独立协议（ws:// / wss://），需要 HTTP Upgrade 握手，部分企业代理会拦截
   - SSE 自带**断线自动重连**（浏览器原生支持），WebSocket 要自己实现心跳和重连
   - SSE 只能传 UTF-8 文本，WebSocket 支持二进制

**🎯 标准回答（背下来）：**

> SSE 是基于 HTTP 长连接的单向流式协议，服务端持续往客户端推送文本数据。
>
> 三者对比：
> - **普通 HTTP**：一次请求一次响应，客户端拿到完整 body 才解析
> - **SSE**：基于 HTTP，单向（服务端→客户端），自带重连，只传文本
> - **WebSocket**：独立协议，双向通信，支持二进制，但需要协议升级
>
> AI 流式输出选 SSE 的理由：
> 1. AI 对话本质就是「客户端发一次请求，服务端持续推送回答」，单向就够用
> 2. SSE 走标准 HTTP，CORS、代理、CDN、企业网关都不用特殊配置
> 3. 后端实现简单，Node 里 `res.write()` 就能推，不用引入 ws 库
> 4. 自带断线重连，移动网络切换体验更好
> 5. WebSocket 双向能力用不上，反而要额外维护连接状态和心跳

---

### Q2 补充

**✅ 你答对的：核心点全中**
- 原生 EventSource 只能 GET ✓
- 不能自定义请求头 ✓
- 不能 body 传参 ✓
- 不能带 token（只能塞 URL，不安全） ✓

**❌ 还可以补充的：**

1. **业务层面的硬伤**：AI 对话的 prompt 通常带完整历史消息，body 很大。URL 长度网关一般限制 2048 字节，GET 根本塞不下
2. **不能 abort**：用户点「停止生成」按钮时，原生 EventSource 没法主动断开
3. **不能读响应头**：拿不到 trace-id、限流信息等业务字段
4. **fetch-event-source 的实现原理**：基于 fetch + ReadableStream 自己解析 SSE 文本协议，相当于把「事件流解析」和「HTTP 请求」解耦，享受 fetch 的全部能力

**🎯 标准回答：**

> 原生 EventSource 有四个硬伤：
> 1. 只支持 GET：AI 对话要传完整消息历史，body 大，必须 POST
> 2. 不能自定义请求头：JWT token 没法放 Authorization header
> 3. 不能 abort：用户点停止按钮没法主动断开
> 4. 不能读响应头：拿不到 trace-id、限流字段
>
> fetch-event-source 是微软开源的库，底层用 fetch + ReadableStream 自己解析 SSE 文本协议，把「事件流解析」从「网络请求」解耦出来，所以能享受 fetch 的全部能力（POST、自定义 header、abort、超时控制）。

---

### Q3 补充 ⚠️ 重点

**⚠️ 你把两个概念混淆了：**

简历原文是「**按消息 ID 进行结构化管理**，支持 **Agent 多步推理过程的时间线可视化**」 — 这其实是**两个独立机制**：

| 机制 | 简历对应 | 解决什么问题 |
|---|---|---|
| **消息 ID（messageId）** | 「按消息 ID 结构化管理」 | 把多个 chunk 拼到同一条消息 |
| **事件类型（type/step）** | 「Agent 多步推理时间线」 | 区分思考/工具调用/最终回答 |

你回答的内容其实是在讲**事件类型**（type），但 Q3 问的是**消息 ID**。这两个东西必须分清楚，不然面试官追问就露馅了。

---

**🎯 标准回答（必须搞懂，分两层）：**

**第一层：消息 ID 管理（这才是 Q3 问的）**

前端维护一个消息列表，每条消息有唯一 messageId。AI 一次完整回答可能拆成 100 个 chunk 推过来，每个 chunk 带**同一个 messageId**，前端按 ID 找到对应消息把 content 增量拼上去。

```ts
// 消息列表（Vue 用 ref/reactive，React 用 useState）
messages = [
  { id: 'msg_001', role: 'user',      content: '帮我写一首诗' },
  { id: 'msg_002', role: 'assistant', content: '', steps: [] }
]

// 收到一个 SSE chunk
{ messageId: 'msg_002', delta: '春风' }

// 处理逻辑
const msg = messages.find(m => m.id === chunk.messageId)
msg.content += chunk.delta   // 增量拼接
```

**为什么要用 ID 而不是「数组最后一条」？**
1. 支持消息**重新生成**：用户点「重新回答」，可以精准替换那条消息，不影响其他
2. 支持消息**编辑**：用户编辑历史消息，不会错位
3. 支持后端**乱序推送**：Map 按 ID 落位，不依赖到达顺序
4. 框架 diff 友好：用 ID 做 v-for / key，Vue/React 能精准更新单条

---

**第二层：Agent 时间线（你回答的内容，是简历后半句）**

同一条 assistant 消息**内部**，AI 可能有多个步骤（思考 → 调工具 → 再思考 → 最终回答）。每个 chunk 除了 messageId，还带一个 `type` 字段，前端把它们追加到这条消息的 `steps` 数组里。

```ts
{
  id: 'msg_002',
  role: 'assistant',
  steps: [
    { type: 'thinking',    content: '用户想要一首关于春天的诗...' },
    { type: 'tool_call',   tool: 'search', args: { q: '春天古诗' } },
    { type: 'tool_result', result: '...' },
    { type: 'answer',      content: '春风又绿江南岸...' }
  ]
}
```

渲染时按 steps 顺序展示，不同 type 用不同样式（思考用灰色斜体、工具调用展示卡片、最终回答正常显示）。

---

### 🔥 面试官最可能的追问（提前想好）

1. **「SSE 中途断了怎么办？」**
   答：前端做重试，请求里带 `lastMessageId`，后端从断点继续推；或者直接重发整个请求让用户感知不到。

2. **「用户快速连发多条问题怎么保证不串？」**
   答：每次新请求前 abort 上一个 controller；服务端返回新的 messageId，前端按 ID 落位天然不会串。

3. **「SSE 推过来的 chunk 是什么格式？怎么解析？」**
   答：标准 SSE 格式是 `data: {...}\n\n`，data 后面跟 JSON 字符串，前端 JSON.parse 后按字段处理。fetch-event-source 自动帮你拆好了。

4. **「流式过程中前端高频更新会不会卡？」**
   答：会有风险。优化手段：① 用 messageId 做 key，框架 diff 只更新单条；② 对超高频 chunk 做 requestAnimationFrame 批量更新；③ Markdown 渲染做防抖，不要每个字符都重渲整段。

5. **「你怎么测试 SSE 接口？」**
   答：Postman 新版本支持 SSE 模式；或者直接 curl `--no-buffer` 看流式输出；浏览器 DevTools Network 选 EventStream 标签也能看。

---

### 🎬 一句话总结（口头版本）

> 「我们用 SSE 做流式输出，因为 AI 对话是单向推送，SSE 比 WebSocket 更轻量、更适配 HTTP 基础设施。前端用 fetch-event-source 是因为原生 EventSource 不支持 POST 和自定义 header，没法传完整消息历史和 token。消息管理上分两层：外层用 messageId 把多个 chunk 拼到同一条消息，内层用 step type 区分思考/工具调用/最终回答，做成时间线 UI。」

---

## 📌 三种方案核心 API 速查

对应代码：[sse-native.vue](../app/pages/interview/sse-native.vue) / [sse-fetch.vue](../app/pages/interview/sse-fetch.vue) / [websocket.vue](../app/pages/interview/websocket.vue)

### 1️⃣ 原生 EventSource（SSE）

**特点**：浏览器内置，最简单，但 GET-only、不能自定义 header、不能 abort。

```js
// 发起：只能 GET，参数和 token 全塞 URL
const es = new EventSource(`/api/sse?q=${q}&token=xxx`)

// 收消息：onmessage 自动按 SSE 协议拆好
es.onmessage = (event) => {
  const data = JSON.parse(event.data)   // event.data 是字符串
  if (data.type === 'done') es.close()
  else messages.value += data.delta
}

// 错误：自带断线重连，onerror 触发后浏览器会自动重试
es.onerror = () => { status.value = 'error'; es.close() }

// 中断：只能整个关闭，没有"停止生成"的精细控制
es.close()
```

**典型坑**：token 暴露在 URL → 日志/Referer 泄漏；想传完整 messages 历史塞不进 URL。

---

### 2️⃣ fetch-event-source（生产推荐）

**特点**：`@microsoft/fetch-event-source`，POST、header、body、abort、响应头全部能用，且自动按 SSE 协议拆包，回调式 API 几乎和 EventSource 一样好用。

```js
import { fetchEventSource } from '@microsoft/fetch-event-source'

const ctrl = new AbortController()

await fetchEventSource('/api/sse-stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,    // ✅ token 走 header
    'shell-name': 'team-xxx',              // ✅ 多租户上下文
  },
  body: JSON.stringify({ messages: [...] }), // ✅ 完整历史
  signal: ctrl.signal,                       // ✅ 用于 abort
  openWhenHidden: true,                      // ✅ 切后台 tab 不断流（默认会断！）

  // 连接建立：校验状态码 + 读响应头
  async onopen(response) {
    if (!response.ok) throw new Error(`请求失败: ${response.status}`)
    const traceId = response.headers.get('x-trace-id')  // ✅ 读响应头
    // 这里返回 Promise 可以串副作用（刷新会话列表、加载推荐等）
  },

  // 收消息：库已经按 \n\n 拆好包，event.data 就是 "data:" 后的字符串
  onmessage(ev) {
    const data = JSON.parse(ev.data)

    // 按 item_id 把多个 chunk 拼到同一个分片（思考/工具/答案各自落位）
    let step = replyMessage.find(s => s.item_id === data.item_id)
    if (!step) {
      step = { item_id: data.item_id, delta: '' }
      replyMessage.push(step)
    }

    // type 状态机分发到不同 UI 卡片
    switch (data.type) {
      case 'conversation_started':  /* 拿 conversation_id */ break
      case 'text_delta':            step.delta += data.delta; break       // 流式累加
      case 'text_done':             step.content = data.content; break    // 完整覆盖
      case 'think_delta':           step.delta += data.delta; break       // 思考过程
      case 'tool_call_started':     step.params = data.params; break      // 工具入参
      case 'tool_call_completed':   step.result = data.result; break      // 工具结果
      case 'conversation_completed': /* 收尾 */ break
      case 'conversation_error':    throw new Error(data.content)
    }
  },

  // 错误：必须主动 throw，否则库默认会自动重连烧 token！
  onerror(err) {
    ctrl.abort()
    throw err  // ⚠️ 这一行是关键
  },

  onclose() { /* 正常结束清理 */ },
})

// 中断：用户点"停止生成"
ctrl.abort()  // fetch-event-source 立刻断流
```

**关键细节(面试加分点)**：
- `openWhenHidden: true` — 默认 `document.hidden` 时会断开重连，长流式必加
- `item_id` 分片合并 — 同一答案被拆成思考/工具/答案多块，按 id 落位天然不串
- `onerror` 必须 `throw` — 否则库的默认行为是无限自动重连
- `onopen` 可返 Promise — 把"建连后副作用"挂在这,保证顺序

---

### 3️⃣ WebSocket（一般 AI 场景用不到）

**特点**：双向、长连接、支持二进制。但 AI 一问一答用不到双向，且需要自己写心跳和重连。

```js
let ws = new WebSocket('wss://example.com/chat')

// 连接建立
ws.onopen = () => { status.value = 'open' }

// 收消息：服务端推什么就触发，event.data 可以是 string / Blob / ArrayBuffer
ws.onmessage = (event) => {
  messages.value.push(String(event.data))
}

ws.onerror = () => { status.value = 'error' }
ws.onclose = () => { status.value = 'closed' /* ⚠️ 不会自动重连 */ }

// 发消息：双向能力 - 客户端可以反复发
if (ws.readyState === WebSocket.OPEN) {
  ws.send('hello')           // 文本
  ws.send(new Uint8Array(8)) // 二进制
}

// 关闭
ws.close()
```

**典型坑**：① 没有自动重连，要自己监听 `onclose` 做指数退避重连；② 要自己发心跳（如 30s 一次 ping）防止中间代理断连；③ 协议是 `ws://` / `wss://`，不是 HTTP，部分网关/CDN 不友好。

---

### 🎯 三者对比一张表

| 能力 | EventSource | fetch+Stream | WebSocket |
|---|---|---|---|
| 方向 | 服务端 → 客户端 | 服务端 → 客户端 | 双向 |
| 协议 | HTTP | HTTP | ws/wss（HTTP Upgrade） |
| 请求方法 | GET only | 任意 | — |
| 自定义 header | ❌ | ✅ | 仅握手时 |
| body | ❌（URL 参数） | ✅ | ✅（send 多次） |
| 读响应头 | ❌ | ✅ | ❌ |
| 主动中断 | 只能 close | ✅ AbortController | close() |
| 断线重连 | ✅ 自动 | ❌ 自己写 | ❌ 自己写 |
| 二进制 | ❌（文本） | ✅ | ✅ |
| AI 流式适配度 | 低（限制太多） | **高（首选）** | 中（能力过剩） |

---

### 💬 面试口径

> "三种方案我都试过：原生 EventSource 上手最快但限制太多，token 只能塞 URL，没法传消息历史，也不能精细中断；WebSocket 双向能力对 AI 一问一答是浪费，还要自己维护心跳和重连。生产上我们用的是 **fetch + ReadableStream**（具体是 `@microsoft/fetch-event-source` 这个库），因为它既保留 SSE 的简单和单向语义，又补齐了 POST、自定义 header、AbortController 这三个原生 EventSource 缺的核心能力。"

---
