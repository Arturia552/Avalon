<template>
  <el-button>按钮 </el-button>
  <div>hello,{{ count }}</div>
</template>

<script setup>
import { ref } from "vue"

const count = ref(1)
</script>
