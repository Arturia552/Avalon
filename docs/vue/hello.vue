<template>
  <el-button @click="add">按钮</el-button>
  <div>hello,{{ count }}</div>
</template>

<script setup>
import { ref } from "vue"

const count = ref(1)

const add = () => {
  count.value++
}
</script>
