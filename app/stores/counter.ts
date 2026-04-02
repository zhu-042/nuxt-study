export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  const isPositive = computed(() => count.value > 0)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = 0
  }

  function incrementBy(amount: number) {
    count.value += amount
  }

  return { count, doubleCount, isPositive, increment, decrement, reset, incrementBy }
})
