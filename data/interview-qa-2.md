# 面试题 — 知识库模块架构追问

---

## 一、先追整体架构

---

### 知识库模块的整体业务流程是什么，从上传到预览到 AI 交互，完整链路怎么走？

这个模块的核心链路可以分成三个阶段：**文件进来 → 文件可用 → 文件产生价值**。

**第一阶段：文件上传入库**

用户在知识库页面点击上传，支持本地文件、网址导入、粘贴文本、语音输入四种方式。以本地上传为例：

前端先做校验（格式、大小、空间容量），然后计算文件 SHA256 哈希，拿去问后端"这个文件有没有"。命中就秒传，没命中就从后端拿一个预签名 URL，前端直接 PUT 到 COS 对象存储，上传完通知后端注册文件信息，最后把文件关联到用户的知识库文件夹。

**第二阶段：文件解析学习**

文件入库后状态是"解析中"，这一步完全是后端在做。后端的文档解析服务会从 COS 拉取文件，提取文本内容、生成向量索引，这样后续 AI 才能基于文件内容回答问题。前端这边通过定时轮询（每 5 秒批量查一次）来更新文件状态，从"解析中"变成"学习中"再变成"完成"。

**第三阶段：文件使用**

文件解析完成后，用户可以：

- **预览**：点击文件进入详情页，左侧预览原文（PDF、Office、Markdown、音频等不同格式用不同的预览方案）
- **AI 提问**：基于这个文件的内容向 AI 提问，AI 会引用文件中的具体段落来回答
- **思维导图**：AI 自动解析文件生成思维导图
- **翻译**：逐页翻译，翻译结果和 PDF 页码联动
- **笔记**：用富文本编辑器记笔记，可以从 AI 对话中一键插入内容

整条链路画出来就是：

```
上传 → COS 存储 → 后端解析/向量化 → 前端轮询状态 → 预览/AI提问/思维导图/翻译/笔记
```

---

### 前端、后端、COS、文档解析服务分别负责什么？

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│   前端    │     │   后端    │     │   COS    │     │  文档解析服务  │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └──────┬───────┘
     │                │                │                   │
     │  各司其职：     │                │                   │
     │                │                │                   │
```

**前端（我负责的部分）：**

- 文件校验（格式、大小、空间容量）
- SHA256 计算和秒传判断
- 调用预签名 URL 直传 COS，展示上传进度
- 文件状态轮询（定时批量查询处理中的文件）
- 多格式文件预览（PDF、Office、Markdown、音频等）
- 知识库的文件夹管理、搜索、拖拽分栏布局
- 文件详情页的多功能 Tab（提问、思维导图、翻译、笔记）
- 和 AI 对话模块的集成（复用同一套对话引擎）

**后端：**

- 生成 COS 预签名 URL
- 文件信息注册和管理（数据库 CRUD）
- 文件哈希比对（秒传检查）
- 调度文档解析服务
- 提供 AI 对话接口（结合文件的向量索引来回答问题）
- 空间容量管理、权限控制

**COS（对象存储）：**

- 存储文件本体
- 提供文件下载地址
- 不做任何业务逻辑，就是一个"文件仓库"

**文档解析服务：**

- 从 COS 拉取文件
- 提取文本内容（PDF 解析、OCR 图片识别等）
- 生成向量索引（用于 AI 检索增强，也就是 RAG）
- 统计字数、页数等元信息

前端和后端是通过 REST API 交互的，前端和 COS 是通过预签名 URL 直接交互的，后端和文档解析服务是内部调用。

---

### 你主要负责哪些部分，哪些是你主导设计的，哪些是协作完成的？

**我主导设计和开发的：**

1. **文件上传流程**：六步上传链路是我设计的，包括 SHA256 秒传、预签名直传、进度条、WPS 格式自动转换这些。当时后端只提供了几个基础接口（签名、注册、秒传检查），前端怎么串起来、怎么处理异常、怎么做进度反馈，都是我来设计的。
2. **知识库页面的整体布局**：左右分栏用 Splitpanes 做可拖拽，小屏自动切换抽屉模式，用 CSS Container Queries 根据面板实际宽度而不是视口宽度来做响应式。这个方案是我调研后提出的，因为传统的媒体查询在可拖拽面板场景下不好用。
3. **文件详情页的多功能 Tab 系统**：提问、思维导图、翻译、笔记、PPT 五个 Tab 的前端实现都是我做的。用 `defineAsyncComponent` 做懒加载，切换 Tab 不销毁已加载的组件，这个策略也是我定的。
4. **翻译与 PDF 联动**：点击翻译段落高亮 PDF 对应位置，PDF 翻页自动滚动翻译内容。这个交互是我和产品一起讨论后确定的方案，前端实现是我独立完成的。
5. **文件状态轮询机制**：上传后文件处于处理中状态，我设计了定时轮询 + 增量更新的方案，只查处理中的文件，只更新变化的状态，不替换整个数组。

**协作完成的：**

1. **AI 提问功能**：对话引擎是我在 AI 对话模块中开发的，知识库这边是复用那套引擎，传入 `repositoryFileId` 或 `folderId` 参数就能切换到基于文件的对话模式。对话引擎是我写的，但 AI 回答的质量、引用的准确性这些是后端和算法团队负责的。
2. **思维导图**：前端渲染用的 simple-mind-map 库，数据是后端 AI 生成的 Markdown 格式大纲，我负责前端的调用、轮询状态、渲染展示。
3. **文件预览**：PDF 预览用的自定义 PdfFrame 组件，Office 文件优先后端转 PDF 再用同一套 PdfFrame 预览、转换失败降级到微软 Office Online Viewer（这个方案是团队一起调研选型的），音频用 wavesurfer.js。

---

### 整个知识库模块里你觉得最复杂的点是什么，为什么？

我觉得最复杂的是**文件详情页的多 Tab 系统和各 Tab 之间的联动**。

复杂在哪呢？主要是三点：

**第一，Tab 的生命周期管理。**

五个 Tab（提问、思维导图、翻译、笔记、PPT）都是重量级组件，如果每次切换都销毁重建，用户体验很差——比如你在笔记里写了半天，切到翻译看一下再切回来，笔记内容没了，那肯定不行。但如果一开始就全部加载，首屏会很慢。

所以我用了**懒加载 + 缓存**的策略：用 `defineAsyncComponent` 异步加载组件，第一次切到某个 Tab 才加载，加载后用 `v-show` 控制显隐而不是 `v-if` 销毁，这样切换 Tab 不会丢失状态。同时用 `markRaw` 标记组件避免 Vue 对组件对象做不必要的响应式代理。

**第二，翻译和 PDF 的双向联动。**

这个交互看起来简单，但实现起来有不少细节。点击翻译段落要高亮 PDF 对应位置，PDF 翻页要自动滚动翻译内容到对应页。两个组件是独立的，通过 EventBus 通信。难点在于翻译结果是分页返回的，而且是增量合并的（每 2 秒轮询一次，新结果要合并到已有数据中），同时还要维护页码和翻译段落的映射关系。如果翻译还在进行中用户就开始翻页，还要处理"翻译结果还没到但 PDF 已经翻到那一页"的情况。

**第三，提问 Tab 复用对话引擎的上下文管理。**

知识库的提问和普通聊天用的是同一套对话引擎，但上下文不一样。普通聊天是通用对话，知识库提问要限定在当前文件或当前文件夹的范围内。而且从文件详情页的提问 Tab 发起的对话，和从知识库主页右侧面板发起的对话，虽然都是知识库对话，但 `sessionFrom` 不同（一个是单文件，一个是文件夹级别），AI 检索的范围也不同。要确保这些场景下对话引擎的参数传递正确、会话隔离、历史记录不串，需要仔细设计 props 和状态的传递链路。

---

## 二、上传流程深挖

---

### 为什么要先算 SHA256？它在你的流程里具体解决什么问题？

解决的是**重复上传**的问题。

用户可能上传同一个文件很多次——比如换了个文件夹又传一遍，或者上次传过忘了又传一遍。如果每次都老老实实传到 COS，浪费带宽、浪费存储空间、用户还要等。

所以我们在上传前先算文件的 SHA256 哈希，相当于给文件生成一个"指纹"。同一个文件不管叫什么名字，哈希值一定相同。拿这个哈希去问后端"你有没有这个文件"，有的话直接复用已有的文件地址，跳过上传步骤，用户体验上就是"秒传"。

对用户来说，300MB 的文件本来要传 1 分钟，秒传的话瞬间完成。

---

### 秒传检查是怎么做的？前端传 hash 给后端后，后端怎么判断文件已存在？

前端把 SHA256 哈希值 POST 给后端的 `/userFile/checkFileSha256` 接口。

后端的逻辑很简单：拿着这个哈希值去数据库的文件表里查，文件表里有一个 `file_sha256` 字段。如果查到了，说明之前有人上传过一模一样的文件，直接返回那条记录的 `fileUrl`（COS 地址）和 `fileSha256`。如果没查到，返回 null，前端就走正常上传流程。

本质就是**用哈希值做唯一索引**，一条 SQL 的事。

---

### 为什么选预签名 URL 直传 COS，而不是文件先传后端再由后端上传 COS？

如果文件先传后端，有三个问题：

1. **带宽瓶颈**：一个 200MB 的文件，先从用户浏览器传到后端服务器，再从后端服务器传到 COS，等于这 200MB 走了两遍网络。后端服务器的带宽是有限的，同时几个用户上传大文件，其他接口的响应都会变慢。

2. **内存压力**：后端要把整个文件接收到内存或临时磁盘，再转发给 COS。大文件多了服务器扛不住。

3. **速度慢**：用户要等两段传输完成，体验差。

用预签名 URL 直传，文件从浏览器直接到 COS，后端只需要处理一个轻量的签名请求（几 KB），完全不碰文件本体。**后端的压力从"搬运工"变成了"开门的"**。

---

### 上传进度条是怎么拿到的？如果用 axios，进度事件有什么坑？

axios 的 `onUploadProgress` 回调，底层是基于 XMLHttpRequest 的 `upload.onprogress` 事件。每次浏览器发送一段数据，就会触发一次，回调参数里有 `loaded`（已发送字节数）和 `total`（总字节数）。

```javascript
await axios.put(url, file, {
  onUploadProgress: (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
  },
});
```

**坑有两个：**

1. **`e.total` 可能是 0**：如果服务端没有返回 `Content-Length`，或者某些跨域配置不对，`total` 会是 0，算百分比就变成 `NaN` 了。所以代码里要加判断 `if (e.total)` 再算。

2. **进度到 100% 不等于上传完成**：`loaded === total` 只是说浏览器把数据发完了，但服务端可能还没处理完（比如 COS 还在写入）。真正完成要等 axios 的 Promise resolve，也就是收到 200 响应。所以进度条到 100% 后可能还要等一小会儿。

---

### 后端注册这一步为什么不能省？注册时保存了哪些字段？

不能省，因为**文件传到 COS 后，后端数据库里完全不知道这件事**。

COS 就是一个文件仓库，它不会主动通知后端"有人传了个文件"。如果不注册，后端不知道这个文件存在，也就没法把它关联到用户、没法做权限控制、没法给 AI 解析。

注册时保存的核心字段：

- `fileName`：文件名（用于展示）
- `fileUrl`：COS 地址（用于下载和预览）
- `fileSha256`：哈希值（用于后续秒传比对）
- `userId`：文件所属用户
- `fileSize`：文件大小（用于空间容量计算）
- `contentType`：文件类型

注册完后端返回一个 `fileId`，后续所有操作（加入知识库、AI 提问、预览）都是基于这个 ID。

---

### "添加到知识库"和"后端注册"的区别是什么？

这是两个不同层级的概念：

- **后端注册**（`uploadByUrl`）：在系统的**文件表**里创建一条记录，表示"系统里有这个文件了"。这时候文件只是存在于系统中，但还没有归属到任何知识库文件夹。

- **添加到知识库**（`addFiles`）：把文件关联到用户的某个知识库**文件夹**里，相当于在**文件夹-文件关联表**里插一条记录。同时触发后端的文档解析流程（提取文本、生成向量索引）。

打个比方：注册相当于"把书入库登记"，添加到知识库相当于"把书放到某个书架上"。一本书可以放到不同的书架上（同一个文件可以加入不同文件夹），但入库登记只需要一次。

---

### 大文件怎么处理？你们有没有做分片上传、断点续传、失败重试？

我们项目目前设的上限是 300MB，在这个范围内用预签名 URL 整体上传是够用的，没有做分片。

如果要支持更大的文件，分片上传的思路是：前端用 `file.slice()` 把文件切成 5MB 一片，每片单独上传到 COS，全部传完后通知 COS 合并。COS 本身就提供了分片上传的 API（`InitiateMultipartUpload` → `UploadPart` → `CompleteMultipartUpload`）。

断点续传的话，可以在本地记录每片的上传状态，网络中断后重连时只重传失败的分片。

失败重试我们做了基本的处理：单个文件上传失败会 catch 住，提示用户，但不会中断其他文件的上传（批量上传场景下）。没有做自动重试，因为 300MB 以内的文件在 COS 直传下失败率很低。

---

### 空间容量校验是在上传前做还是上传后做？如果并发上传导致容量超限怎么办？

**上传前做的**。上传前会拿当前文件大小和用户剩余空间比较：

```javascript
if (file.size > spaceQuotaBytes - spaceUsedBytes) {
  message.error("知识库空间不足，请升级后再添加");
  return;
}
```

但前端校验只是第一道防线，**后端在 `addFiles` 接口里也会再校验一次**。因为你说的并发场景确实存在——用户开两个标签页同时上传，前端各自校验时空间都够，但加起来就超了。

这种情况下前端校验会放过去，但后端在写入关联记录时会再次检查空间，超限了就返回错误，前端收到错误后提示用户。**前端校验是为了体验（快速拦截），后端校验是为了安全（兜底）**。

---

### WPS 格式自动转换是前端做的还是后端做的？转换失败怎么处理？

**前端做的，而且只是改文件名后缀，不是真正的格式转换。**

WPS 的 `.wps` 文件本质上和 `.docx` 是兼容的（WPS 现在默认用 OOXML 格式），`.et` 和 `.xlsx` 也是。所以我们只是在上传前把文件名的后缀改了：

```javascript
const map = { wps: "docx", et: "xlsx", dps: "pptx" };
```

这样后端和文档解析服务就能用标准的 Office 解析器来处理。如果遇到老版本 WPS 的二进制格式（真正不兼容的），解析服务会解析失败，文件状态会变成"错误"，前端展示错误提示。这种情况用户需要自己用 WPS 另存为 `.docx` 格式再上传。

---

### 【场景题】一个 500MB 文件上传到 80% 失败了，你会怎么优化？

首先 500MB 已经超过我们 300MB 的限制了，但如果要支持这个量级，我会这样优化：

**第一，上分片上传。** 把 500MB 切成 100 片（每片 5MB），每片独立上传。失败了只需要重传那一片，不用从头来。已经传完的 80%（大约 80 片）都不用重传。

**第二，本地记录上传进度。** 用 localStorage 或 IndexedDB 记录每片的上传状态（待上传 / 已上传 / 失败）。页面刷新或断网重连后，读取记录，跳过已上传的分片，从断点继续。

**第三，自动重试。** 单片上传失败后自动重试 2~3 次，大部分网络抖动导致的失败都能自动恢复，不需要用户手动操作。

**第四，并发上传。** 同时传 3~5 片，利用浏览器的并发连接数，比串行快很多。用一个简单的并发控制器（类似 `Promise.allSettled` + 队列）来管理。

---

### 【场景题】如果用户开两个页面同时上传同一个文件，秒传逻辑怎么避免重复数据？

不会产生重复数据，因为**秒传检查和文件注册是后端控制的**。

两种情况：

**情况一：两个页面几乎同时上传。**

页面 A 和页面 B 都算出了相同的 SHA256，都去调 `checkFileHash`。假设这时候后端还没有这个文件，两边都返回"不存在"，于是两边都走正常上传流程，都传到了 COS。

但到 `uploadByUrl` 注册这一步，后端会用 SHA256 做唯一约束或者先查后插。第一个请求正常注册，第二个请求发现哈希已存在，就直接返回已有的那条记录的 ID，不会创建重复数据。COS 上虽然可能存了两份文件（路径不同），但数据库里只有一条记录，指向先注册的那个地址。

**情况二：页面 A 先上传完，页面 B 后上传。**

页面 B 调 `checkFileHash` 时，页面 A 已经注册完了，后端直接返回已有的文件地址，页面 B 秒传成功，根本不会重复上传。

**核心是：去重的最终保障在后端，前端的秒传检查只是一个优化手段。**

---

## 三、布局方案设计追问

---

### 为什么这里要用 Teleport？具体解决了什么问题？

因为知识库页面有**两套完全不同的 DOM 结构**，但要渲染**同一个组件**。

大屏幕下，左右两栏是放在 Splitpanes 的 `<Pane>` 里的，DOM 结构是：

```html
<splitpanes>
  <pane> <div id="library-left-pane"> ← 左栏容器 </pane>
  <pane> <div id="library-right-pane"> ← 右栏容器 </pane>
</splitpanes>
```

小屏幕下，左栏变成一个固定定位的抽屉，右栏变成全屏主内容区，DOM 结构完全不同：

```html
<div id="library-left-drawer" class="fixed w-80 z-40">
  ← 抽屉容器
  <div id="library-right-main" class="flex-1">← 主内容容器</div>
</div>
```

问题来了：`LibraryLeft` 和 `LibraryRight` 这两个组件，在大屏下要渲染到 Splitpanes 的 Pane 里，在小屏下要渲染到抽屉和主内容区里。**如果不用 Teleport，就得写两份组件，或者用 v-if 切换时销毁重建，组件内部的状态（文件列表、滚动位置、对话记录）全丢了。**

用 Teleport 就很简单——组件只有一份，根据屏幕大小动态切换 `to` 的目标：

```javascript
const leftPanelTarget = computed(() =>
  isSmallScreen.value ? "#library-left-drawer" : "#library-left-pane",
);
```

组件实例不销毁，状态完整保留，只是 DOM 节点从一个容器"搬"到了另一个容器。

---

### 什么叫"组件在不同 DOM 容器间无缝迁移"？迁移的是哪类组件？

迁移的就是 `LibraryLeft`（文件管理面板）和 `LibraryRight`（AI 提问面板）这两个核心组件。

"无缝迁移"的意思是：当屏幕从大屏变成小屏（比如用户缩小浏览器窗口），`LibraryLeft` 从 Splitpanes 的左侧 Pane 里"搬"到了固定定位的抽屉容器里。这个过程中：

- 组件**不会被销毁重建**，Vue 实例一直存在
- 组件内部的**状态全部保留**（文件列表、当前文件夹、滚动位置、面包屑导航）
- 用户**感知不到切换**，就像什么都没发生，只是布局变了

如果不用 Teleport，用 `v-if` 在两个位置各放一个 `LibraryLeft`，切换时旧的销毁、新的创建，文件列表要重新请求，面包屑要重新构建，用户体验很差。

---

### 为什么不用纯 CSS 响应式，而要加 Container Queries？

传统的 CSS 媒体查询（`@media`）是基于**视口宽度**的，但在 Splitpanes 场景下，视口宽度和面板实际宽度是两回事。

举个例子：屏幕是 1440px 宽，左侧面板被用户拖到只剩 300px。这时候视口宽度还是 1440px，`@media (max-width: 768px)` 不会触发，但左侧面板实际只有 300px，内容已经挤不下了，应该切换成紧凑布局。

Container Queries（`@container`）是基于**容器自身宽度**的，不管视口多大，只要面板被拖窄了，就能触发样式变化：

```css
@container (max-width: 400px) {
  /* 面板宽度不够时，切换成紧凑布局 */
  .file-grid {
    grid-template-columns: 1fr;
  }
}
```

**简单说：媒体查询看的是"窗口多大"，Container Queries 看的是"这个面板多大"。在可拖拽分栏的场景下，面板大小和窗口大小是独立的，所以必须用 Container Queries。**

---

### 大屏分栏、小屏抽屉模式的切换逻辑是怎么做的？

核心是一个 `handleResize` 函数，监听窗口 resize 事件，根据窗口宽度判断当前该用哪种模式：

```javascript
const isSmallScreen = ref(false);

const handleResize = () => {
  // 如果参考资料侧边栏打开了，阈值要更大（因为右边多占了一块空间）
  const threshold = openLibraryReferenceSource.value ? 1440 : 1024;

  isSmallScreen.value = window.innerWidth < threshold;

  if (isSmallScreen.value) {
    isLeftPanelVisible.value = false; // 小屏默认收起左侧
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize(); // 初始化执行一次
});
```

模板里用 `v-show` 控制两套 DOM 容器的显隐：

```html
<!-- 大屏：Splitpanes 分栏 -->
<splitpanes v-show="!isSmallScreen"> ... </splitpanes>

<!-- 小屏：抽屉 + 全屏主内容 -->
<div
  id="library-left-drawer"
  v-show="isSmallScreen"
  :class="isLeftPanelVisible ? 'translate-x-0' : '-translate-x-full'"
></div>
```

然后 Teleport 的 `to` 目标根据 `isSmallScreen` 动态切换，组件就自动"搬"到对应的容器里了。

还有一个细节：**阈值不是固定的**。如果右侧的参考资料侧边栏打开了（多占了 336px），阈值从 1024 提高到 1440。这样即使屏幕 1200px 宽，参考资料打开后空间不够，也会自动切到抽屉模式。参考资料关闭后又切回分栏模式。

---

### 分栏拖拽状态怎么保存？刷新页面后会保留吗？

目前**没有做持久化**，刷新后左侧面板会恢复到默认的 50% 宽度。

```javascript
const leftPaneSize = ref(50); // 默认 50%
```

Splitpanes 组件本身不提供持久化功能，如果要做的话，可以监听 Splitpanes 的 `resized` 事件，把比例存到 localStorage：

```javascript
// 如果要做持久化（我们项目没做，但思路是这样）
const handlePaneResize = (sizes) => {
  leftPaneSize.value = sizes[0].size;
  localStorage.setItem("library-pane-size", sizes[0].size);
};

onMounted(() => {
  const saved = localStorage.getItem("library-pane-size");
  if (saved) leftPaneSize.value = Number(saved);
});
```

没做的原因是产品觉得默认 50% 就够了，用户拖拽主要是临时调整，不需要记住。

---

### 这个方案里你遇到过哪些布局或状态同步问题？

遇到过三个比较头疼的问题：

**第一个：Teleport 目标容器还没渲染就挂载。**

页面刚加载时，Splitpanes 和抽屉容器的 DOM 还没渲染出来，Teleport 就尝试挂载组件，会报找不到目标元素的错误。

解决方案是加了一个 `isTeleportReady` 标志，在 `onMounted` 的 `nextTick` 里才设为 true：

```javascript
const isTeleportReady = ref(false);

onMounted(() => {
  nextTick(() => {
    isTeleportReady.value = true;
  });
});
```

```html
<template v-if="isTeleportReady">
  <Teleport :to="leftPanelTarget"> ... </Teleport>
</template>
```

确保 DOM 容器都就绪了再挂载 Teleport。

**第二个：抽屉和全局侧边栏互斥。**

小屏下知识库的左侧抽屉和全局导航的侧边栏会重叠。用户打开知识库抽屉时，要关闭全局侧边栏；反过来也一样。

解决方案是通过 EventBus 双向通信：

```javascript
// 打开知识库抽屉时，通知全局侧边栏关闭
if (isLeftPanelVisible.value && isSmallScreen.value) {
  $eventBus.emit("closeDefaultSidebar");
}

// 监听全局侧边栏打开，关闭知识库抽屉
$eventBus.on("defaultSidebarOpened", () => {
  isLeftPanelVisible.value = false;
});
```

**第三个：参考资料侧边栏打开后布局阈值要动态变化。**

右侧参考资料侧边栏占 336px，打开后留给左右分栏的空间变小了。如果不调整阈值，1200px 的屏幕打开参考资料后，分栏区域只剩 864px，两栏挤在一起很难用。

所以阈值做成了动态的：参考资料关闭时 1024px 切换，打开时 1440px 切换。而且还要监听参考资料的开关状态变化，实时重新计算：

```javascript
watch(openLibraryReferenceSource, () => {
  handleResize(); // 参考资料开关变化时，重新判断该用哪种模式
});
```

---

## 四、文件预览的类型适配和降级

---

### 你们支持哪些文件格式？每种格式分别怎么预览？

我们支持的格式和对应的预览方案如下：

| 格式 | 预览方案 | 核心技术 |
|---|---|---|
| PDF | 自定义 PdfFrame 组件（iframe 嵌套独立页面） | PDF.js（CDN 加载 pdf-legacy） |
| MD / TXT | MarkDownPreview 组件 | axios 拉取原文 + markdown-it 渲染 |
| JPG / JPEG / PNG | ImagePreview 组件 | 原生 `<img>` 标签直接加载 |
| DOC / DOCX / XLS / XLSX / PPT / PPTX | 优先后端转 PDF → PdfFrame 预览；转换失败降级到 OfficPreview | 后端转换 + PDF.js，降级用微软 Office Online Viewer |
| HTML | WebSitePreview 组件 | iframe 直接加载 URL |
| MP3 / WAV / M4A / AAC | AudioPreview 组件 | wavesurfer.js 波形可视化 + ASR 转写文本 |
| CSV | 不支持预览 | 直接显示"该文件格式暂不支持预览" |

整个分发逻辑在 `FilePreview.vue` 里，就是一条 `v-if / v-else-if` 链，根据文件后缀（`suffix`）匹配到对应的预览组件：

```javascript
// 后缀枚举定义在 utils/constants.ts
export enum KnowledgeFileSuffix {
  PDF = 'pdf',
  TXT = 'txt',
  MD = 'md',
  HTML = 'html',
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  PPT = 'ppt',
  PPTX = 'pptx',
  XLSX = 'xlsx',
  XLS = 'xls',
  CSV = 'csv',
  DOC = 'doc',
  DOCX = 'docx',
  MP3 = 'mp3',
  WAV = 'wav',
  M4A = 'm4a',
}
```

后缀是在知识库详情页（`pages/library/[id].vue`）从文件 URL 中提取的——去掉 query 参数后取最后一个 `.` 之后的部分，转小写，和枚举值做比较。

---

### PDF 为什么要自定义 PdfFrame，而不是直接用现成组件？

因为我们的 PDF 预览不只是"看"，还需要支持**跨组件交互**——翻译高亮联动、AI 提问引用定位、页码同步等。现成的 PDF 组件（比如 `vue-pdf-embed`）虽然能渲染 PDF，但很难深度定制这些交互。

我们的方案是**两层架构**：

**外层：`PdfFrame.vue`**（父页面中的组件）

它就是一个 iframe 壳子，指向 `/pdf-preview?pdfUrl=xxx` 这个独立页面。它的职责是：
- 接收来自其他组件的指令（通过 EventBus），比如"跳到第 5 页"、"高亮这个区域"
- 把指令通过 `postMessage` 发给 iframe 内部
- 监听 iframe 发回来的事件（比如"用户翻到了第 3 页"），再通过 EventBus 广播出去

```javascript
// PdfFrame 收到 EventBus 事件后，通过 postMessage 发给 iframe
$eventBus.on('beUpdateKnowledgeFilePage', (options) => {
    if (options.meta.bboxs) {
        sendMessage('renderHightLightQuestion', options)
    } else {
        sendMessage('changePageNum', { pageNum: options.meta.page })
    }
})
```

**内层：`pages/pdf-preview.vue`**（独立页面，运行在 iframe 里）

这是一个完整的 Nuxt 页面，用 `layout: 'empty'` 去掉所有导航。它负责：
- 从 CDN 动态加载 PDF.js（`pdf.min.mjs` + `pdf_viewer.mjs`）
- 用 PDF.js 的 `PDFViewer` 渲染 PDF，支持分页、缩放、搜索
- 用 Konva.js 在 PDF 页面上叠加高亮矩形（翻译定位、AI 引用定位）
- 监听 `postMessage` 接收父页面的指令
- 页码变化时通过 `postMessage` 通知父页面

**为什么用 iframe 而不是直接在页面里渲染？**

1. **隔离性**：PDF.js 会往全局挂载 `pdfjsLib`、`pdfjsViewer`，Konva 也是全局的。放在 iframe 里不会污染主页面的全局作用域。
2. **性能隔离**：大 PDF 渲染很重，放在 iframe 里即使卡了也不会阻塞主页面的 UI 交互。
3. **资源管理**：iframe 销毁时，里面的 PDF.js 实例、canvas、Web Worker 都会被浏览器自动回收，不需要手动清理。

项目里其实也有一个 `PdfViewer.vue` 用了 `vue-pdf-embed`，但那是给创作模块用的简单预览，不需要高亮联动这些功能。知识库这边因为交互复杂度高，选择了自定义方案。

---

### Office 文件的预览方案是什么？为什么不直接用微软 Office Online Viewer？

**我们的方案是"后端转 PDF 优先，微软 Viewer 兜底"的两级策略。**

文档类文件（DOC/DOCX/XLS/XLSX/PPT/PPTX）上传后，后端会先尝试把它转换成 PDF 格式。如果转换成功，前端拿到的就是一个 PDF 地址，直接走我们自己的 PdfFrame 组件预览，和原生 PDF 文件的预览体验完全一致。只有在后端转换失败的情况下，才降级到微软 Office Online Viewer。

**为什么优先转 PDF 而不是直接用微软 Viewer：**

1. **不依赖第三方服务**：微软 Viewer 是微软的服务器去下载你的文件再渲染，如果微软服务挂了、被墙了、或者响应慢，预览就废了。转成 PDF 后完全用自己的 PDF.js 渲染，可控性强。

2. **避免流量盗刷风险**：微软 Viewer 要求文件必须公网可访问，这意味着 COS 上的文件要设成公开读。一旦有人拿到 URL 大量下载，流量费全算在我们头上。转 PDF 后走自己的预览链路，文件地址可以用签名 URL，不需要公开读。

3. **体验一致**：所有文档类文件最终都是 PDF 预览，用户体验统一——都支持翻页、缩放、高亮定位、翻译联动这些功能。如果用微软 Viewer，这些交互能力全没了，只是一个 iframe 里的只读页面。

4. **隐私安全**：文件不需要经过微软的服务器，敏感文档不会外泄。

**微软 Viewer 作为降级方案的限制：**

降级到微软 Viewer 时，确实有一些限制需要了解：

1. **文件必须公网可访问**：微软的服务器要直接下载文件，所以降级时用的是 COS 的公开读地址。这里有流量盗刷风险，我们通过 COS 的 Referer 防盗链 + 空间配额 + 流量告警来缓解。

2. **文件大小限制**：Word/PPT 最大 10MB，Excel 最大 5MB，超过就渲染不了。

3. **渲染速度不可控**：文件要被微软服务器下载和解析，网络不好时会很慢。

4. **不支持交互**：只能看，没有高亮定位、翻译联动这些能力。

5. **国内访问不稳定**：微软的服务偶尔会被墙或者响应慢。

**实际效果：** 大部分 Office 文件后端都能成功转成 PDF，降级到微软 Viewer 的情况比较少。这样既保证了预览体验和安全性，又有兜底方案不至于完全看不了。

---

### Markdown/TXT 自定义渲染时，怎么处理样式、代码块、高亮、XSS 安全？

**渲染流程：**

`MarkDownPreview.vue` 的逻辑很简单：
1. 用 `axios.get` 请求文件的 COS 地址，拿到原始文本
2. 如果文本被包裹在 `` ```markdown ... ``` `` 代码块里（某些 AI 生成的格式），先提取出内部内容
3. 用 `markdown-it` 默认配置渲染成 HTML
4. 自定义了一个插件，给所有 `<a>` 链接加上 `target="_blank"`，让链接在新窗口打开
5. 用 `v-html` 插入到 DOM

```javascript
const md = markdownit()
md.use(markdownItPluginAddTarget)  // 链接加 target="_blank"
content.value = md.render(_inspiration_data)
```

**样式：** 用的是自定义 CSS（`.knowledge-markdown-preview-content1`），设了字号 16px、行高 31px、颜色 #555。没有引入专门的 Markdown 主题（比如 github-markdown-css），所以渲染出来的样式比较朴素。

**代码块和高亮：** 知识库的 `MarkDownPreview` **没有做代码高亮**，`markdown-it` 默认渲染代码块只是加了 `<pre><code>` 标签，没有语法着色。这和聊天模块的 Markdown 渲染不一样——聊天那边用了 `highlight.js` 做代码高亮、`katex` 做数学公式渲染，功能更完整。知识库这边因为文件内容以文档为主，代码块不多，所以没有加。

**XSS 安全：** 这里有一个**潜在风险**。`markdown-it` 默认配置下会把 Markdown 中的 HTML 标签原样输出，然后直接 `v-html` 插入 DOM，**没有经过 DOMPurify 等消毒处理**。

如果用户上传的 Markdown 文件里包含恶意 HTML（比如 `<script>alert('xss')</script>` 或 `<img onerror="..." />`），理论上会被执行。不过实际风险相对可控：
- 文件是用户自己上传的，攻击自己没意义
- 文件 URL 是 COS 的私有地址，第三方拿不到
- 但如果有"分享知识库"功能，别人打开你分享的恶意文件就有风险了

如果要加固，应该在 `v-html` 之前用 `DOMPurify.sanitize()` 过滤一遍，或者把 `markdown-it` 的 `html` 选项设为 `false`（禁止 HTML 标签透传）。

---

### 音频播放器为什么选 wavesurfer.js？它解决了什么问题？

选 wavesurfer.js 主要是因为我们需要**波形可视化 + 精确定位**，原生的 `<audio>` 标签做不到。

**原生 `<audio>` 的问题：**
- 只有一个进度条，用户看不到音频的波形结构（哪里有声音、哪里是静音）
- 无法精确点击定位到某个时间点
- 样式定制能力差，各浏览器长得不一样

**wavesurfer.js 解决的问题：**

1. **波形可视化**：把音频解码后绘制成波形图，用户一眼就能看到音频的结构。配置了蓝色主题（波形 `#bfdbfe`，进度 `#2563eb`），和整体 UI 风格一致。

2. **精确定位**：用户可以点击波形的任意位置跳转到对应时间点，比拖进度条精确得多。

3. **和转写文本联动**：这是最关键的。我们的音频预览不只是播放，还有 ASR（语音识别）转写文本。播放到哪一句，对应的转写文本会高亮；点击某句转写文本，音频会跳转到对应时间点。wavesurfer.js 提供了精确的时间回调（`audioprocess`、`seeking`），让这个联动成为可能。

```javascript
wavesurfer.value.on('audioprocess', (time) => {
    currentTime.value = time  // 实时更新当前时间，驱动转写文本高亮
})
```

4. **倍速播放**：支持 0.75x / 1.0x / 1.5x / 2.0x 四档倍速，wavesurfer.js 的 `setPlaybackRate` 直接支持。

**转写文本的处理也值得一提：**

后端返回的 ASR 结果格式不统一（不同的语音识别服务返回的 JSON 结构不同），所以我写了一个 `normalizeTranscript` 函数做格式归一化，兼容了十几种字段名：

```javascript
// 时间字段可能叫 start_time_in_milliseconds、startMs、begin、from...
// 文本字段可能叫 text、transcript、content、utterance、sentence...
// 说话人字段可能叫 speaker、speaker_id、channel_id、spk、role...
```

这个函数会自动识别各种格式，统一转成 `{ id, start, end, text, speaker?, words? }` 的标准结构。还支持逐字级别的时间戳（`words` 数组），播放时可以逐字高亮，类似卡拉 OK 效果。

---

### 如果文件无法预览，你们怎么做兜底处理？

我们在两个层面做了兜底：**格式层面**和**加载失败层面**。

**格式层面的兜底：**

`FilePreview.vue` 里是一条 `v-if / v-else-if` 链，按文件后缀匹配到对应的预览组件。对于明确不支持预览的格式（比如 CSV），直接显示"该文件格式暂不支持预览"的提示文案。链的最后有一个 `v-else` 兜底分支，确保任何未匹配的格式都不会白屏，至少给用户一个反馈。

**加载失败层面的兜底：**

每种预览组件内部都有自己的错误处理：

- **PDF**：`pdf-preview.vue` 里 `setupPdf` 的 `catch` 会设置 `isError = true`，页面显示"当前浏览器不支持打开 pdf，请用最新版浏览器打开"的提示。
- **Markdown/TXT**：`axios.get` 请求文件内容，如果请求失败，`catch` 里关闭 loading 并展示错误状态。
- **Office**：因为是 iframe 嵌入微软 Viewer，如果文件太大或无法访问，微软那边会返回自己的错误页面。我们在外层加了 loading，iframe `@load` 后隐藏。
- **音频**：wavesurfer.js 的 `error` 事件里关闭 loading 状态，展示加载失败提示。

**整体思路就是：格式不支持 → 明确告知用户；格式支持但加载失败 → 各组件内部捕获错误，展示对应的错误提示，不让用户看到白屏。**

---

### 【追问】PDF 预览中 postMessage 用了 `targetOrigin: '*'`，有什么安全风险？

`postMessage` 的第二个参数 `targetOrigin` 指定了接收方的源（origin），用 `'*'` 表示不限制，任何源都能收到消息。

**风险在于：**

1. **PdfFrame → iframe 方向**：如果 iframe 被替换成了恶意页面（比如通过中间人攻击），恶意页面也能收到 `postMessage` 发送的数据。不过我们发送的只是页码和高亮坐标，不包含敏感信息，风险有限。

2. **iframe → 父页面方向**：`pdf-preview.vue` 里的 `onMessage` 函数**没有校验 `event.origin`**，任何来源的消息都会被处理。如果有第三方页面能往我们的窗口发消息（比如通过 `window.open` 获取引用），就能伪造 `changePageNum`、`renderHightLightQuestion` 等指令。

**实际影响：** 因为 PDF 预览页面用的是同源的 `/pdf-preview` 路径（不是跨域 iframe），而且指令只涉及翻页和高亮，不涉及数据修改或敏感操作，所以实际安全风险较低。但如果要加固，应该：

```javascript
// iframe 内部校验来源
function onMessage(e) {
    if (e.origin !== window.location.origin) return  // 只接受同源消息
    // ...处理逻辑
}

// 父页面发送时指定 origin
frameWindow.postMessage({ command, value }, window.location.origin)
```

---

### 【追问】PDF 大文件渲染有做什么性能优化？

做了几个层面的优化：

**1. 动态 rangeChunkSize**

根据 PDF 页数动态调整分块大小：
- 50 页以下：256KB（默认，快速加载）
- 50~200 页：512KB（减少请求次数）
- 200 页以上：1MB（大文件用大块，减少网络往返）

```javascript
const chunkSize = numPages <= 200 ? 65536 * 8 : 65536 * 16
```

**2. 流式加载**

启用了 `disableStream: false` 和 `disableAutoFetch: false`，PDF.js 会边下载边渲染，用户不需要等整个文件下完就能看到第一页。同时会自动预加载邻近页面。

**3. 按需渲染**

PDF.js 的 `PDFViewer` 本身就是按需渲染的——只渲染视口内可见的页面，滚动到新页面时才渲染。不会一次性把几百页全部渲染成 canvas。

**4. 缩略图的 LRU 缓存**

项目里有一个 `PdfThumbnail.vue` 组件用于生成 PDF 缩略图（文件列表里的预览图），它实现了 LRU 缓存，避免重复渲染同一个 PDF 的缩略图。

**5. 高亮渲染的等待机制**

AI 引用定位需要在 PDF 页面上画高亮矩形，但目标页面可能还没渲染出来。所以有一个轮询等待机制：

```javascript
const waitForPageContainer = async (pageNum, maxRetries = 20) => {
    for (let i = 0; i < maxRetries; i++) {
        const container = document.querySelector(`.page[data-page-number="${pageNum}"]`)
        if (container && container.clientWidth > 0) return container
        await new Promise(resolve => setTimeout(resolve, 100))
    }
    return null
}
```

最多等 2 秒（20 次 × 100ms），如果页面还没渲染出来就放弃，避免无限等待。

---

### 【追问】你们的 Markdown/TXT 预览存在 XSS 风险，一般怎么防？

**风险点：** 我们的 `MarkDownPreview` 组件里，MD 和 TXT 文件都经过 `markdown-it` 渲染后直接 `v-html` 插入 DOM，没有做任何消毒处理。如果文件内容里包含恶意 HTML（比如 `<script>`、`<img onerror="...">`），就会被执行。

**防护方案有三层，可以单独用也可以组合用：**

**第一层：输出消毒（最推荐）**

在 `v-html` 之前用 DOMPurify 过滤掉危险标签和属性：

```javascript
import DOMPurify from 'dompurify'

const md = markdownit()
const rawHtml = md.render(markdownText)
content.value = DOMPurify.sanitize(rawHtml)
```

DOMPurify 会保留正常的 HTML 结构（标题、列表、链接、图片等），但移除所有可执行的内容（`<script>`、`onerror`、`onclick`、`javascript:` 协议等）。这是业界最主流的方案，GitHub、Notion 都用它。

**第二层：禁止 HTML 透传**

把 `markdown-it` 的 `html` 选项设为 `false`：

```javascript
const md = markdownit({ html: false })
```

这样 Markdown 里写的 `<script>` 或 `<img onerror>` 会被当成纯文本输出（转义成 `&lt;script&gt;`），不会被浏览器执行。缺点是正常的 HTML 内嵌也不能用了，比如有些 Markdown 文件里用 `<details>` 做折叠块就会失效。

**第三层：CSP（Content Security Policy）**

在 HTTP 响应头里加 CSP 策略，作为最后一道防线：

```
Content-Security-Policy: script-src 'self'; style-src 'self' 'unsafe-inline'
```

即使前两层漏了，浏览器也会拒绝执行内联脚本。但 CSP 配置比较复杂，容易误伤正常功能（比如 CDN 加载的第三方脚本），需要仔细调试。

**实际建议：第一层 + 第二层组合使用。** `markdown-it` 设 `html: false` 从源头堵住，再加 DOMPurify 做二次保险。这样即使 `markdown-it` 的转义有遗漏，DOMPurify 也能兜住。

**什么时候必须修：** 如果产品有"分享知识库"功能——用户 A 上传恶意文件，分享给用户 B 打开，B 的 cookie/token 就可能被盗。只要文件内容会被其他用户查看，XSS 防护就是必须的。如果文件只有上传者自己能看，风险相对可控（攻击自己没意义），但从安全规范角度还是应该加上。
