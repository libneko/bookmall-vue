<script setup lang="ts">
import type { Book } from '@/api/types'
import { openBook } from '@/api/meta'

defineProps<{
  book: Book
}>()
</script>

<template>
  <el-card class="book-card" @click="openBook(book.id)" shadow="hover">
    <el-image :src="book.image" class="book-img" fit="contain" />
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
