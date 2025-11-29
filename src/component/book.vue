<script setup lang="ts">
import type { Book, Category } from '@/api/types'
import { ref, onMounted, onUnmounted } from 'vue'

interface Books{
  id: number
  name: string
  price: number
  imgUrl: string
}

let books = ref<Book>()

defineProps<{
  book:Books
}>()
</script>

<template>
  <el-card class="book-card">
    <el-image
      :src="book.imgUrl"
      class="book-img"
      fit="contain"
    />
    <template #footer>
        <div class="book-name">{{ book.name }}</div>
        <div class="book-price">¥{{ book.price }}</div>
    </template>
  </el-card>
</template>

<style scoped>
.book-card {
  width: 100%;
  height: 320px;
  border-radius: 8px;
  /* overflow: hidden; */
  display: flex;
  flex-direction: column;
}
.book-img {
  width: 100%;
  height: 200px;
}

.book-name {
  font-size: 14px;
}

.book-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff4400;
}
</style>
