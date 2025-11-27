<script setup lang="ts">
import type { ImageProps } from 'element-plus'
import { bookApi } from '@/api/introduction'
import type { Book } from '@/api/types'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'


const router = useRouter()

const book = ref<Book>()

onMounted(async () => {
  const res = await bookApi(1);
  console.log(res)
  book.value = res.data;
  console.log(book.value)
})


</script>

<template>
  <div class="introduction-view">
    <div class="books">
      <div class="books-row1">
        <div class="books-pic">
          <el-image style="width: 100%; height: 100%" :src="book?.image" fit= "cover" />
        </div>
      </div>
      <div class="books-row2"></div>
        <div class="books-title">
          <h2>{{ book?.name }}</h2>
        </div>
    </div>
  </div>
</template>

<style scoped>
.introduction-view {
  margin: 0 auto;
  position: relative;

  padding: 50px;
  padding-left: 100px;
  min-height: 100vh;
  border-radius: 20px; /* 可改大或小，如 20px、999px等 */
}

.books {
  width: 1000px;
  height: 220px;
  background-color: white;
}
.books-pic {
  width: 300px;
  height: 420px;
  overflow: hidden;
  border-radius: 20px;
}

.books-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
