<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">什么是类型守卫</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        类型守卫是<strong>运行时检查</strong>，帮助 TypeScript 在特定代码块内收窄（narrow）类型。
      </p>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">内置类型守卫</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// typeof — 基本类型
if (typeof val === 'string') { val.toUpperCase() }

// instanceof — 类实例
if (val instanceof File) { val.name }

// in — 属性存在性
if ('children' in node) { /* 元素节点 */ }
else { /* 文本节点 */ }

// Array.isArray
if (Array.isArray(val)) { val.map(...) }</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">自定义类型守卫（is 关键字）</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>// 判断上传项是否为 File
function isFile(val: unknown): val is File {
  return val instanceof File
}

// 判断 API 响应是否成功
interface SuccessRes&lt;T&gt; { code: 0; data: T }
interface ErrorRes { code: number; msg: string }

function isSuccess&lt;T&gt;(res: SuccessRes&lt;T&gt; | ErrorRes): res is SuccessRes&lt;T&gt; {
  return res.code === 0
}

// 使用
const res = await fetchAPI()
if (isSuccess(res)) {
  console.log(res.data) // TS 推导出 data 类型
} else {
  console.error(res.msg) // TS 推导出 msg
}</code></pre>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">项目实战：富文本节点判断</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>interface ElementNode {
  type: string
  children: TiptapNode[]
  attrs?: Record&lt;string, unknown&gt;
}

interface TextNode {
  type: 'text'
  text: string
  marks?: Mark[]
}

type TiptapNode = ElementNode | TextNode

function isTextNode(node: TiptapNode): node is TextNode {
  return node.type === 'text' && 'text' in node
}

function traverse(node: TiptapNode) {
  if (isTextNode(node)) {
    processText(node.text) // TS 知道有 text
  } else {
    node.children.forEach(traverse) // TS 知道有 children
  }
}</code></pre>
    </section>
  </div>
</template>
