<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { bookApi } from '@/api/introduction'
import type { BookData, Book } from '@/api/types'
import { ref, onMounted } from 'vue'
import { addShoppingCartApi } from '@/api/shopping-cart'

const props = defineProps<{ id: number }>()

let book = ref<Book>()

let shopp = ref<BookData>({
  book_id: 0,
})
let book_id: number

const num = ref(1)

onMounted(async () => {
  const res = await bookApi(props.id)
  console.log(res)
  book.value = res.data
  book_id = book.value.id
  shopp.value.book_id = book_id
})

const addShopping = async (book_id: BookData) => {
  try {
    console.log(book_id)
    const res = await addShoppingCartApi(book_id)
    console.log(res)
    // 成功提示
    if (res.code !== 0) {
      console.log('加入成功:', res)
      ElMessage.success('已加入购物车')
    } else {
      ElMessage.error('加入失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('加入失败')
  }
}

const handleChange = (value: number | undefined) => {
  console.log(value)
}
</script>

<template>
  <div class="introduction-view">
    <div class="books">
      <div class="books-row1">
        <div class="books-pic">
          <el-image style="width: 100%; height: 100%" :src="book?.image" fit="contain" />
        </div>
      </div>
      <div class="books-row2">
        <div class="books-introduction">
          <p>书籍详情</p>
        </div>
        <div class="books-title">
          <h2>&nbsp;&nbsp;{{ book?.name }}</h2>
        </div>
        <div class="books-auth">
          <p>作者:{{ book?.author }}</p>
          <p>最后更新:</p>
          <p>更新时间:</p>
        </div>
        <div class="books-intro">
          <h3>简介:</h3>
          <p>{{ book?.description }}</p>
        </div>
        <div class="books-buy">
          <el-button type="primary" @click="addShopping(shopp)">加入购物车</el-button>
          &nbsp;&nbsp;&nbsp;<el-input-number
            v-model="num"
            :min="1"
            :max="book?.book_stock?.stock"
            @change="handleChange"
          />
        </div>
      </div>
      <div class="books-row3">
        <div class="books-price">
          <h3>单本价格(RMB):</h3>
          <p>{{ book?.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.introduction-view {
  margin: 0 auto;
  position: relative;
  align-items: center; /* 水平居中 */
  padding: 50px;
  padding-left: 100px;

  height: 81vh;
  border-radius: 20px; /* 可改大或小，如 20px、999px等 */
}

.books {
  width: 90%;
  min-height: 80%;
  display: flex;
  overflow: hidden;
  height: auto;

  background-color: rgba(62, 60, 60, 0.2);
  border: 2px solid #ccc; /* 淡灰色更柔和 */
  border-radius: 10px; /* 圆角 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 阴影 可选 */
  padding: 10px;
}

.books-row1 {
  padding-left: 2%;
  padding-top: 2%;
  width: 30%;
}

.books-row2 {
  padding-top: 2%;
  padding-left: 5%;
  display: flex;
  flex-direction: column;
  width: 40%;
}

.books-row3 {
  padding-top: 2%;
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中 */
}

.books-introduction {
  color: rgb(160, 160, 160);
  font-size: small;
}

.books-title {
  padding-bottom: 15px;
  font-size: 200%;
}

.books-intro {
  padding-bottom: 10px;
  font-size: 100%;
  color: rgb(68, 61, 61);
  width: 100%; /* 记得给宽度，不然不会触发换行 */
  white-space: normal; /* 允许换行 */
  word-wrap: break-word; /* 自动换行 */
  word-break: break-all; /* 单词或长字符串也强制换行 */
}

.book-intro p {
  font-size: 90%;
  padding-top: 10px;
  padding-bottom: 20px;
}

.books-auth {
  padding-bottom: 20px;
  font-size: medium;
}

.books-pic {
  width: 100%;
  height: 90%;
  overflow: hidden;
  border-radius: 20px;
}

.books-buy {
  padding-top: 20%;
  font-size: 150%;
  width: 100%;

  height: 15%;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center; /* 垂直居中 */
}

.books-price p {
  width: 100%;
  border-radius: 30px;
  color: rgb(255, 145, 0);
  font-weight: bold; /* 粗体 */
  font-style: italic; /* 斜体 */
  font-size: 300%;
}

.books-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
:deep(.el-button) {
  width: 30%;
  height: 90%;
  background-color: rgb(241, 187, 187);
}
:deep(.el-input-number) {
  width: 30%;
}
</style>
