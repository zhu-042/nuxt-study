<template>
  <div class="h-screen flex flex-col bg-gray-50 overflow-hidden">
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          <NuxtLink to="/" class="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Nuxt Demo
          </NuxtLink>
          <div class="flex items-center gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              active-class="!text-indigo-600 !bg-indigo-50"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>
    <main class="flex-1 h-0">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const navLinks = [
  { to: '/', label: '首页' },
  { to: '/counter', label: '计数器' },
  { to: '/verify-code', label: '验证码按钮' },
  { to: '/todo', label: '待办列表' },
  { to: '/interview', label: '面试题库' },
]
</script>
