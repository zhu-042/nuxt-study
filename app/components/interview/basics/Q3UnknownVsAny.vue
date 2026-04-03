<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">核心区别</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-red-50 border border-red-100 rounded-lg p-4">
          <h4 class="font-semibold text-red-700 mb-2">any — 完全放弃类型检查</h4>
          <pre class="bg-gray-900 text-gray-100 rounded p-3 text-sm"><code>let val: any = 'hello'
val.foo.bar  // ✅ 不报错
val()        // ✅ 不报错
val + 1      // ✅ 不报错
// 运行时全部爆炸 💥</code></pre>
        </div>
        <div class="bg-green-50 border border-green-100 rounded-lg p-4">
          <h4 class="font-semibold text-green-700 mb-2">unknown — 类型安全的"任意类型"</h4>
          <pre class="bg-gray-900 text-gray-100 rounded p-3 text-sm"><code>let val: unknown = 'hello'
val.foo      // ❌ 报错
val()        // ❌ 报错

// 必须先收窄类型
if (typeof val === 'string') {
  val.toUpperCase() // ✅
}</code></pre>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">类型收窄方式</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>function process(val: unknown) {
  // typeof 收窄
  if (typeof val === 'string') { /* val: string */ }

  // instanceof 收窄
  if (val instanceof Date) { /* val: Date */ }

  // 类型断言（慎用）
  const str = val as string

  // 自定义类型守卫
  if (isUser(val)) { /* val: User */ }
}

function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'name' in val
}</code></pre>
    </section>

    <div class="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
      <strong>为什么推荐 unknown：</strong>它强制你在使用前确认类型，将潜在的运行时错误提前到编译期暴露。
      any 应该只用于快速原型或与无类型的第三方库对接时的临时方案。
    </div>
  </div>
</template>
