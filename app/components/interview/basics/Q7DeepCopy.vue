<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">浅拷贝 vs 深拷贝</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 class="font-semibold text-blue-700 mb-2">浅拷贝</h4>
          <pre class="bg-gray-900 text-gray-100 rounded p-3 text-sm"><code>const a = { info: { name: 'zhu' } }

// 浅拷贝方式
const b = { ...a }
const c = Object.assign({}, a)

b.info.name = 'lin'
console.log(a.info.name)
// 'lin' — 嵌套对象共享引用</code></pre>
        </div>
        <div class="bg-green-50 border border-green-100 rounded-lg p-4">
          <h4 class="font-semibold text-green-700 mb-2">深拷贝</h4>
          <pre class="bg-gray-900 text-gray-100 rounded p-3 text-sm"><code>const a = { info: { name: 'zhu' } }

// 深拷贝方式
const b = structuredClone(a)
const c = JSON.parse(JSON.stringify(a))

b.info.name = 'lin'
console.log(a.info.name)
// 'zhu' — 完全独立</code></pre>
        </div>
      </div>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">深拷贝方法对比</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">方法</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">优点</th>
              <th class="text-left px-4 py-2 border border-gray-200 font-medium text-gray-700">缺点</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr>
              <td class="px-4 py-2 border border-gray-200 font-mono text-xs">structuredClone</td>
              <td class="px-4 py-2 border border-gray-200">原生、支持循环引用、Map/Set/Date</td>
              <td class="px-4 py-2 border border-gray-200">不支持函数、Symbol 键、DOM 节点</td>
            </tr>
            <tr>
              <td class="px-4 py-2 border border-gray-200 font-mono text-xs">JSON 序列化</td>
              <td class="px-4 py-2 border border-gray-200">简单、兼容性好</td>
              <td class="px-4 py-2 border border-gray-200">丢失 undefined/函数/Symbol/Date/循环引用报错</td>
            </tr>
            <tr>
              <td class="px-4 py-2 border border-gray-200 font-mono text-xs">lodash.cloneDeep</td>
              <td class="px-4 py-2 border border-gray-200">功能最全</td>
              <td class="px-4 py-2 border border-gray-200">需要引入第三方库</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h3 class="text-base font-semibold text-gray-800 mb-3">Vue 响应式系统中的陷阱</h3>
      <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto"><code>const state = reactive({ user: { name: 'zhu' } })

// ❌ 深拷贝丢失 Proxy，不再是响应式
const copy = structuredClone(toRaw(state))
copy.user.name = 'lin' // 视图不会更新

// ✅ 如果需要响应式副本
const copy = reactive(structuredClone(toRaw(state)))

// ✅ 只想读取快照（不需要响应式）时用 toRaw
const snapshot = toRaw(state)</code></pre>
    </section>

    <div class="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-800">
      <strong>注意：</strong>Vue 3 的响应式对象是 Proxy，深拷贝会丢失 Proxy 代理。需要响应式副本时先 toRaw 取原始值再 reactive 包装。
    </div>
  </div>
</template>
