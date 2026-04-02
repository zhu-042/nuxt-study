<template>
  <div>
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-gray-900 mb-3">
        Nuxt Demo
      </h1>
      <p class="text-lg text-gray-500">
        面试准备用的 Nuxt 示例项目
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
      <div
        v-for="tech in techStack"
        :key="tech.name"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center hover:shadow-md transition-shadow"
      >
        <div class="text-3xl mb-2">{{ tech.icon }}</div>
        <h3 class="font-semibold text-gray-900">{{ tech.name }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ tech.desc }}</p>
      </div>
    </div>

    <div class="space-y-4">
      <h2 class="text-xl font-bold text-gray-900">示例页面</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NuxtLink
          v-for="demo in demos"
          :key="demo.to"
          :to="demo.to"
          class="group block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <h3 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {{ demo.title }}
          </h3>
          <p class="text-sm text-gray-500 mt-1">{{ demo.desc }}</p>
          <span class="inline-block mt-3 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {{ demo.tag }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const techStack = [
  { icon: '💚', name: 'Nuxt 4', desc: '基于 Vue 3 的全栈框架' },
  { icon: '🎨', name: 'Tailwind CSS', desc: 'Utility-first CSS 框架' },
  { icon: '🍍', name: 'Pinia', desc: 'Vue 官方状态管理' },
]

const demos = [
  {
    to: '/counter',
    title: '计数器',
    desc: '演示 Pinia store 的 state、getters、actions 基本用法',
    tag: 'Pinia 基础',
  },
  {
    to: '/todo',
    title: '待办列表',
    desc: '演示 Pinia 完整 CRUD + Tailwind 样式实战',
    tag: 'Pinia + Tailwind',
  },
]
</script>
