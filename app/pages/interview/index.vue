<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">面试题库</h1>
      <p class="text-gray-500">基于简历定制的前端面试题，共 {{ categories.length }} 个分类</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.to"
        :to="cat.to"
        class="group block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all"
      >
        <div class="flex items-start gap-4">
          <span class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-50 group-hover:bg-indigo-50 transition-colors">
            {{ cat.icon }}
          </span>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {{ cat.title }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">{{ cat.desc }}</p>
            <div class="flex items-center gap-2 mt-3">
              <span class="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                {{ cat.count }} 题
              </span>
              <span class="text-xs text-gray-400">{{ cat.tag }}</span>
            </div>
          </div>
          <svg
            class="w-5 h-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const categories = [
  {
    to: '/interview/basics',
    icon: '📘',
    title: '一、技术基础题',
    desc: 'JS/TS、Vue 3/Nuxt 3、React 19/Next.js 15、网络/浏览器/工程化',
    count: 40,
    tag: '4 个子分类',
  },
  {
    to: '/interview/projects',
    icon: '🔍',
    title: '二、项目深挖题',
    desc: 'AI 对话、语音识别、文件上传、富文本、SEO、多租户等',
    count: 68,
    tag: '10 个项目模块',
  },
  {
    to: '/interview/scenario',
    icon: '🧩',
    title: '三、场景设计题',
    desc: '性能优化、故障排查、架构演进等开放性问题',
    count: 10,
    tag: '综合能力',
  },
  {
    to: '/interview/pressure',
    icon: '🔥',
    title: '四、压力追问题',
    desc: '技术决策、从 0 到 1 经历、线上问题排查等',
    count: 8,
    tag: '深度追问',
  },
  {
    to: '/interview/coding',
    icon: '💻',
    title: '五、手写 / 白板题',
    desc: '防抖节流、并发控制、事件总线、上传队列等',
    count: 8,
    tag: '代码能力',
  },
  {
    to: '/interview/hr',
    icon: '💬',
    title: '六、HR / 综合素质题',
    desc: '职业规划、团队协作、学习方法、离职原因等',
    count: 8,
    tag: '软素质',
  },
]
</script>
