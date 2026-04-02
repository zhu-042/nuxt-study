# 面试题 — AI 对话模块

---

## Q1：你用过 SSE 吗？SSE 是什么？怎么用的？

### 什么是 SSE

SSE（Server-Sent Events）是一种基于 HTTP 的**服务端单向推送**技术。客户端通过一个普通的 HTTP 请求建立连接后，服务端可以持续地向客户端推送数据流，直到连接关闭。它是 HTML5 规范的一部分，浏览器原生支持 `EventSource` API。

### 我在项目中怎么用的

在 AI 对话模块中，用户提交问题后，AI 的回答是逐字生成的，如果等全部生成完再返回，用户要等很久。所以我们用 SSE 实现了**流式输出**，AI 生成一段就推送一段，前端实时渲染，用户体验类似 ChatGPT 那种逐字出现的效果。

具体实现上，我没有用浏览器原生的 `EventSource`，因为它只支持 GET 请求，而我们需要 POST 传参（问题内容、文件 ID、对话模式等参数比较多）。所以用了微软的 `@microsoft/fetch-event-source` 这个库，它基于 fetch API 封装，支持 POST、自定义 Header、手动中止等能力。

```javascript
import { fetchEventSource } from "@microsoft/fetch-event-source";

const ctrl = new AbortController();

fetchEventSource("/api/agent/start", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    question: "用户的问题",
    sessionId: "会话ID",
    useR1: true, // 深度思考
    useSearch: true, // 联网搜索
  }),
  signal: ctrl.signal, // AbortSignal
  openWhenHidden: true, // 页面切到后台也保持连接

  onmessage(event) {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "text_delta":
        // 增量文本，追加到当前回答
        break;
      case "think_delta":
        // AI 思考过程的增量文本
        break;
      case "tool_call_started":
        // Agent 开始调用工具（搜索、知识库查询等）
        break;
      case "conversation_completed":
        // 对话完成
        break;
      case "error":
        // 错误处理
        break;
    }
  },

  onerror(err) {
    // 错误时不自动重连，直接关闭
    throw err;
  },
});

// 用户点击"停止生成"时
ctrl.abort();
```

前端收到的每条消息都带有 `item_id`，我用一个数组按 `item_id` 分组管理，这样 Agent 的思考过程、工具调用、最终回答就能结构化地展示成时间线的形式。

### SSE 的数据格式

SSE 的协议格式很简单，服务端返回的 Content-Type 是 `text/event-stream`，每条消息的格式是：

```
data: {"type":"text_delta","content":"你好"}

data: {"type":"text_delta","content":"，我是AI"}

data: [DONE]
```

每条消息以 `data:` 开头，消息之间用空行分隔。

---

## Q2：WebSocket 是什么？跟 SSE 有什么区别？为什么 AI 提问不用 WebSocket？

### WebSocket 是什么

WebSocket 是一种**全双工**通信协议。客户端和服务端通过一次 HTTP 握手升级为 WebSocket 连接后，双方可以随时互相发送数据，不需要每次都发起新请求。

我在项目中的语音识别功能就用了 WebSocket：用户按住录音按钮，浏览器通过 AudioContext 采集麦克风音频，实时通过 WebSocket 发送 PCM 音频数据给 ASR 服务，服务端识别后实时返回文字结果。这种场景就是典型的双向实时通信。

### SSE 和 WebSocket 的区别

| 对比项       | SSE                                    | WebSocket                  |
| ------------ | -------------------------------------- | -------------------------- |
| **通信方向** | 单向（服务端 → 客户端）                | 双向（互相发送）           |
| **协议**     | 基于 HTTP                              | 独立协议（ws://）          |
| **数据格式** | 纯文本（text/event-stream）            | 文本或二进制都支持         |
| **断线重连** | 浏览器原生自动重连                     | 需要自己实现               |
| **兼容性**   | 基于 HTTP，天然兼容代理、CDN、负载均衡 | 部分代理和防火墙可能不支持 |
| **复杂度**   | 简单，就是个长连接的 HTTP 响应         | 相对复杂，需要维护连接状态 |

### 为什么 AI 提问用 SSE 而不用 WebSocket

核心原因是 **AI 对话的通信模型就是单向的**：

1. **请求-响应模式**：用户发一个问题，AI 返回一个流式回答，本质上还是一问一答。用户不需要在 AI 回答的过程中再向服务端发数据，所以不需要双向通信。

2. **HTTP 生态兼容性好**：SSE 基于 HTTP，可以直接复用现有的认证（Bearer Token）、负载均衡、CDN、Nginx 反向代理等基础设施，不需要额外配置。WebSocket 是独立协议，很多代理和网关需要单独配置才能支持。

3. **实现更简单**：SSE 本质就是一个不关闭的 HTTP 响应，服务端只需要不断 write 数据就行，不需要维护连接池、心跳检测这些。

4. **断线重连更容易**：SSE 原生支持自动重连和 `Last-Event-ID`，WebSocket 断了需要自己处理重连逻辑。

而语音识别用 WebSocket 是因为它**确实需要双向通信**——客户端要持续发送音频流，服务端要持续返回识别结果，两边同时在发数据，这种场景 SSE 就做不了。

**简单总结：能用 SSE 的场景就用 SSE，更简单更稳定；需要双向通信的场景才上 WebSocket。**

### 我项目中 WebSocket 的实际使用（语音识别）

整个流程分四步：**获取票据 → 建立连接 → 双向通信 → 关闭连接**。

#### 第一步：获取 WebSocket 票据 + 建立连接

WebSocket 不像 HTTP 请求那样方便带 Header，所以我们先通过一个普通的 HTTP 接口获取一个一次性的 ticket，然后拼到 WebSocket URL 的 query 参数里做鉴权：

```javascript
// 1. 先通过 HTTP 接口获取一次性票据
const res = await getAsrWsTicket();
const ticket = res.data;

// 2. 拼接 WebSocket 地址（把 http 替换成 ws）
const baseUrl = "https://api.xiaoin.com";
const wsUrl = baseUrl.replace(/^http/, "ws") + `/ws/asr?ticket=${ticket}`;
// 结果：wss://api.xiaoin.com/ws/asr?ticket=xxx

// 3. 建立连接，用 Promise 包装等待连接成功
await new Promise((resolve, reject) => {
  ws = new WebSocket(wsUrl);

  ws.onopen = () => resolve(); // 连接成功
  ws.onerror = () => reject(new Error("连接失败"));

  ws.onclose = () => {
    console.log("WebSocket 已关闭");
  };

  // 4. 监听服务端推送的消息
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    handleWsMessage(msg);
  };
});
```

#### 第二步：发送启动指令 + 重试机制

连接建立后，需要发一个 `start` 指令告诉服务端开始识别。但服务端的 ASR 引擎可能还没准备好，所以做了最多 3 次重试：

```javascript
const sendStartWithRetry = async (maxRetries = 3) => {
  const startPayload = JSON.stringify({
    type: "start",
    format: "pcm",
    sampleRate: 16000,
    semanticPunctuation: true, // 自动加标点
    maxSentenceSilence: 1300, // 1.3秒静默断句
    idleAutoFinishMs: 60000, // 60秒无输入自动结束
    maxSessionDurationMs: 600000, // 最长10分钟
  });

  for (let i = 0; i < maxRetries; i++) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(startPayload);

    // 等 500ms 看有没有收到 "upstream not ready" 错误
    const gotError = await new Promise((resolve) => {
      const prevOnmessage = ws.onmessage;
      const timer = setTimeout(() => {
        ws.onmessage = prevOnmessage;
        resolve(false); // 没收到错误，说明启动成功
      }, 500);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (
          msg.type === "error" &&
          msg.message?.includes("upstream not ready")
        ) {
          clearTimeout(timer);
          ws.onmessage = prevOnmessage;
          resolve(true); // 收到错误，需要重试
          return;
        }
        clearTimeout(timer);
        ws.onmessage = prevOnmessage;
        prevOnmessage?.call(ws, event);
        resolve(false);
      };
    });

    if (!gotError) return; // 成功了就退出
    await new Promise((r) => setTimeout(r, 400)); // 等 400ms 再重试
  }
};
```

#### 第三步：采集音频 → 发送 → 接收识别结果（双向通信）

这是 WebSocket 双向通信的核心——**客户端不断发送音频数据，服务端不断返回识别文字**，两边同时在传数据：

```javascript
// ===== 客户端 → 服务端：发送音频流 =====

// 获取麦克风权限
const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

// 创建音频处理管线
const audioContext = new AudioContext();
const source = audioContext.createMediaStreamSource(mediaStream);
const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

// 每采集一段音频就通过 WebSocket 发送
scriptProcessor.onaudioprocess = (event) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    // 获取原始音频数据（Float32 格式）
    const inputData = event.inputBuffer.getChannelData(0);

    // 降采样：浏览器采样率（通常 44100/48000）→ 16000Hz
    const downsampled = downsample(inputData, audioContext.sampleRate, 16000);

    // 编码转换：Float32 → Int16 PCM（ASR 服务要求的格式）
    const pcm16 = float32ToInt16(downsampled);

    // 通过 WebSocket 发送二进制音频数据
    ws.send(pcm16.buffer);
  }
};

// 连接音频处理管线
source.connect(scriptProcessor);
scriptProcessor.connect(audioContext.destination);

// ===== 服务端 → 客户端：接收识别结果 =====

// 音频格式转换函数
function float32ToInt16(float32Array) {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Array;
}

// 降采样函数
function downsample(buffer, inputRate, outputRate) {
  if (inputRate === outputRate) return buffer;
  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    result[i] = buffer[Math.round(i * ratio)];
  }
  return result;
}

// 处理服务端返回的识别结果
const sentenceTexts = new Map(); // 按句子 ID 存储

function handleWsMessage(msg) {
  // 服务端控制指令（如自动停止）
  if (msg.type === "server-control" && msg.event === "auto-stop") {
    cleanup();
    return;
  }

  // 句子级识别结果（核心）
  const sentence = msg.payload?.output?.sentence;
  if (sentence) {
    // 按 sentence_id 存储，同一句话会不断更新直到确认
    const idx = sentence.sentence_id;
    sentenceTexts.set(idx, sentence.text || "");

    // 把所有句子拼起来就是完整的识别文本
    recognizedText.value = Array.from(sentenceTexts.values()).join("");
    // 实时通知父组件更新 textarea
    emit("streaming", recognizedText.value);
    return;
  }
}
```

**双向通信的数据流：**

```
浏览器（客户端）                          ASR 服务（服务端）
    │                                        │
    │──── { type: 'start', ... } ──────────→ │  启动指令
    │                                        │
    │──── [PCM 二进制音频数据] ──────────────→ │  持续发送音频
    │──── [PCM 二进制音频数据] ──────────────→ │
    │──── [PCM 二进制音频数据] ──────────────→ │
    │                                        │
    │ ←── { sentence: "你好" } ──────────── │  实时返回识别结果
    │                                        │
    │──── [PCM 二进制音频数据] ──────────────→ │
    │──── [PCM 二进制音频数据] ──────────────→ │
    │                                        │
    │ ←── { sentence: "你好世界" } ─────── │  同一句话不断更新
    │                                        │
    │──── { type: 'stop' } ────────────────→ │  停止指令
    │                                        │
    │ ←── { event: 'task-finished' } ────── │  任务完成
    │                                        │
```

#### 第四步：停止录音 + 资源清理

用户点击停止时，先发 `stop` 指令等服务端返回最终结果，再关闭连接和释放资源：

```javascript
function stop() {
  // 1. 停止麦克风采集
  scriptProcessor.disconnect();
  audioContext.close();
  mediaStream.getTracks().forEach((track) => track.stop());

  // 2. 发送停止指令，等待最终结果
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "stop" }));

    // 重新监听，等服务端返回 task-finished
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      handleWsMessage(msg); // 可能还有最后几句识别结果

      if (msg.header?.event === "task-finished") {
        const finalText = recognizedText.value.trim();
        ws.close();
        if (finalText) {
          emit("result", finalText); // 把最终文本交给父组件
        }
      }
    };

    // 兜底：20 秒后如果还没收到 task-finished，强制关闭
    setTimeout(() => {
      if (ws) {
        const text = recognizedText.value.trim();
        ws.close();
        if (text) emit("result", text);
      }
    }, 20000);
  }
}

// 组件卸载时确保资源释放
onBeforeUnmount(() => cleanup());
```

### 为什么这个场景必须用 WebSocket 而不是 SSE

1. **客户端需要持续发送数据**：每采集一段音频就要发给服务端，SSE 只能服务端→客户端单向推送，做不到
2. **需要发送二进制数据**：音频是 PCM 二进制格式，WebSocket 原生支持二进制帧，SSE 只支持文本
3. **实时性要求极高**：说一句话要立刻看到文字，WebSocket 的全双工特性保证了最低延迟

---

## Q3：智能滚动是什么意思？用户手动上翻时暂停，这个怎么做的？

### 为什么需要智能滚动

AI 流式输出的时候，内容是不断增长的，正常情况下需要自动滚动到底部，让用户看到最新的内容。但如果用户想回头看前面的回答，手动往上滚了，这时候如果还强制滚到底部，就会把用户"拽回去"，体验很差。

所以需要一个智能判断：**AI 输出时自动滚动，但用户手动上翻后暂停自动滚动，用户滚回底部后恢复。**

### 具体实现

核心思路是通过监听滚动事件，判断用户当前是否在底部附近：

```javascript
const isStopScroll = ref(false);
const SCROLL_THRESHOLD = 50; // 距离底部 50px 以内算"在底部"

// 节流监听滚动事件，200ms 一次
const handleScroll = useThrottleFn(() => {
  const container = scrollContainer.value; // 消息容器
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container; // 滚动位置、总高度、可见高度
  const distanceToBottom = scrollHeight - scrollTop - clientHeight; // 距离底部距离

  // 如果距离底部超过阈值，说明用户手动上翻了
  isStopScroll.value = distanceToBottom > SCROLL_THRESHOLD; // 设置是否停止滚动
}, 200);

// AI 输出内容更新时调用
function scrollToBottom() {
  if (isStopScroll.value) return; // 用户上翻了，不滚动

  nextTick(() => {
    const container = scrollContainer.value; // 消息容器
    if (container) {
      container.scrollTo({
        top: container.scrollHeight, // 滚动到最底部
        behavior: "smooth",
      });
    }
  });
}
```

**原理拆解：**

1. **监听滚动**：给消息容器加 `@scroll` 事件，用 `useThrottleFn`（200ms 节流）避免频繁触发
2. **判断位置**：`scrollHeight - scrollTop - clientHeight` 就是当前滚动位置距离底部的距离
3. **设置阈值**：距离底部 50px 以内算"在底部"，超过就认为用户手动上翻了，设置 `isStopScroll = true`
4. **条件滚动**：每次 AI 输出新内容要滚动时，先检查 `isStopScroll`，如果用户上翻了就不滚
5. **自动恢复**：用户手动滚回底部时，`distanceToBottom` 又小于阈值了，`isStopScroll` 自动变回 `false`，恢复自动滚动

用 50px 的阈值而不是精确的 0，是因为不同浏览器和设备的滚动精度不一样，有时候滚到底了 `distanceToBottom` 也不是精确的 0，给个缓冲区更稳定。

---

## Q4：对话上传文件如果遇到大文件怎么办？

### 我们项目中的处理方案

首先在前端做了**文件大小限制**，单个文件最大 300MB，超过直接提示用户。在限制范围内，我们通过以下几个策略来优化大文件上传的体验：

### 1. SHA256 秒传

上传前先在前端计算文件的 SHA256 哈希值，然后调接口问服务端"这个文件你有没有"。如果服务端已经存在相同哈希的文件，就直接复用，跳过上传步骤。这对于用户重复上传同一个文件的场景非常有效，瞬间完成。

```javascript
// 计算文件哈希
const sha256 = await getFileSha256(file);

// 问服务端有没有
const { data } = await checkFileHash({ sha256 });

if (data?.fileUrl) {
  // 已存在，直接用，不用上传了
  return data;
}

// 不存在，走正常上传流程
```

### 2. 对象存储直传 + 预签名 URL

文件不经过我们的业务服务器，而是直接传到 COS（腾讯云对象存储）。流程是：先从后端获取一个预签名的上传 URL，然后前端直接 `PUT` 到 COS，上传完再通知后端注册文件信息。

这样做的好处是：

- **不占用业务服务器带宽**，大文件上传不会影响其他接口的响应
- **COS 本身支持断点续传和高并发**，比自己的服务器稳定得多

```javascript
// 1. 获取预签名上传地址
const { data: putUrl } = await generatePutUrl({ fileName, contentType });

// 2. 直传到 COS，带进度回调
await axios.put(putUrl, file, {
  headers: { "Content-Type": contentType },
  onUploadProgress: (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    updateProgress(percent); // 更新进度条
  },
});

// 3. 通知后端注册
await uploadByUrl({ fileName, fileUrl, fileSha256: sha256 });
```

### 3. 上传进度条

大文件上传时间长，用户需要知道进度。通过 axios 的 `onUploadProgress` 回调获取上传进度，在页面右上角固定显示进度条，用户可以继续浏览其他内容，不阻塞操作。

### 4. 如果要处理更大的文件（扩展思路）

如果未来需要支持更大的文件（比如几个 GB），可以考虑**分片上传**：

- 前端把大文件切成固定大小的分片（比如 5MB 一片）
- 每个分片独立上传，失败只需重传那一片
- 全部上传完后通知服务端合并
- COS 本身就提供了分片上传的 API（`InitiateMultipartUpload` → `UploadPart` → `CompleteMultipartUpload`）

```javascript
// 分片上传的核心思路
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const chunks = Math.ceil(file.size / CHUNK_SIZE);

for (let i = 0; i < chunks; i++) {
  // 遍历所有分片
  const start = i * CHUNK_SIZE; // 分片起始位置
  const end = Math.min(start + CHUNK_SIZE, file.size); // 分片结束位置
  const chunk = file.slice(start, end); // 获取分片

  await uploadChunk(uploadId, i + 1, chunk); // 上传分片
  updateProgress(((i + 1) / chunks) * 100); // 更新进度
}

await completeMultipartUpload(uploadId); // 完成分片上传
```

分片上传的优势：

- **断点续传**：网络中断后只需重传失败的分片
- **并发上传**：多个分片可以同时上传，提高速度
- **内存友好**：不需要一次性把整个文件读进内存

### 我项目中文件上传到 OSS 的示例

#### 整体流程

```
用户选文件 → SHA256 哈希 → 秒传检查 → 获取预签名 URL → 直传 OSS → 通知后端注册
```

#### 示例代码

```javascript
async function uploadFile(file) {
  // 1. 前置校验
  if (file.size > 300 * 1024 * 1024) {
    message.error("文件不能超过 300MB");
    return;
  }

  // 2. 计算文件哈希
  const sha256 = await getFileSha256(file);

  // 3. 秒传检查：问服务端"这个文件你有没有？"
  const checkRes = await axios.post("/api/userFile/checkFileSha256", {
    sha256,
  });

  let fileUrl = "";

  if (checkRes.data.data) {
    // ✅ 命中秒传，服务端已有相同文件，直接复用
    fileUrl = checkRes.data.data.fileUrl;
  } else {
    // ❌ 没命中，走正常上传

    // 4. 从后端获取预签名上传 URL（后端用 OSS SDK 生成带签名的临时地址）
    const signRes = await axios.get("/api/userFile/generatePutUrl", {
      params: { filename: file.name },
    });
    const { url, contentType } = signRes.data.data;
    // url 类似：https://bucket.oss-cn-hangzhou.aliyuncs.com/path/file.pdf?Expires=xxx&Signature=xxx

    // 5. 前端直接 PUT 到 OSS，不经过业务服务器
    await axios.put(url, file, {
      headers: { "Content-Type": contentType },
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded / e.total) * 100);
        console.log(`上传进度：${percent}%`);
      },
    });

    fileUrl = url.split("?")[0]; // 去掉签名参数，得到纯净的文件地址
  }

  // 6. 通知后端注册文件（后端记录文件信息，返回文件 ID）
  const registerRes = await axios.post("/api/userFile/uploadByUrl", {
    fileName: file.name,
    fileUrl,
    fileSha256: sha256,
  });

  return registerRes.data.data.id; // 文件 ID
}
```

#### 为什么用预签名 URL 直传，而不是传到自己服务器再转存？

- **不占业务服务器带宽**：大文件直接传到 OSS，业务服务器只处理一个轻量的签名请求
- **OSS 自带高可用**：CDN 加速、多副本存储、断点续传，比自己的服务器稳定
- **安全**：预签名 URL 有过期时间，过期后无法使用，不会暴露 OSS 密钥

### 总结

我们项目的策略是：**限制大小 + SHA256 秒传 + 对象存储直传 + 进度反馈**，这套方案在 300MB 以内的文件处理上已经足够。如果需要支持更大文件，分片上传是标准的扩展方案。
