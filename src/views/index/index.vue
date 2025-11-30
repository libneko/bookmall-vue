<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBooks, getCategories } from '@/api/home'
import type { Book, Category } from '@/api/types'
import BookCard from '@/component/book.vue'
import _ from 'lodash'

// 分类数据
const categories = ref<Category[]>([])
const books = ref<Book[]>([])
// Banner 图书
const banners = ref<Book[]>([])
// 推荐图书
const suggestBooks = ref<Book[]>([])

const loadData = async () => {
  categories.value = (await getCategories()).data
  books.value = (await getBooks()).data

  banners.value = _.sampleSize(books.value, 3)
  suggestBooks.value = _.sampleSize(books.value, 20)
}

// Banner轮播逻辑
const currentIndex = ref(0)

// 自动轮播
onMounted(() => {
  loadData()
})
</script>

<template>
  <el-container class="home">
    <!-- 核心内容区 -->
    <el-main class="content">
      <!-- 顶部 Banner（放在最上面） -->
      <div class="banner-wrap">
        <el-carousel :current-index="currentIndex" class="banner-carousel" height="500px">
          <el-carousel-item v-for="(banner, index) in banners" :key="index">
            <el-image style="width: 100%; height: 100%" :src="banner.image" fit="contain" />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 横向分类栏 -->
      <div class="category-bar">
        <div>全部商品分类</div>

        <el-scrollbar wrap-style="overflow-x: auto; white-space: nowrap;">
          <el-space size="10">
            <el-button v-for="category in categories" :key="category.id" type="default" plain round>
              {{ category.name }}
            </el-button>
          </el-space>
        </el-scrollbar>
      </div>

      <div class="book-title">猜你喜欢</div>
      <div class="book-grid">
        <div class="book-item" v-for="book in suggestBooks" :key="book.id">
          <BookCard :book="book" />
        </div>
      </div>
    </el-main>

    <!-- 底部版权区 -->
    <el-footer class="footer">
      <div class="footer-links">
        <el-link href="#">关于我们</el-link>
        <el-link href="#">隐私政策</el-link>
        <el-link href="#">联系方式</el-link>
        <el-link href="#">售后服务</el-link>
      </div>
    </el-footer>
  </el-container>
</template>

<style scoped>
/* 关键修改：全局禁用滚动条（包括body和根容器） */
/* 1. 禁用根组件的滚动 */
.home {
  overflow: hidden; /* 核心：隐藏根容器滚动 */
  height: 92vh; /* 确保根容器占满视口高度 */
}

/* 核心内容区 - 关键修改：移除内容区滚动，改为由根容器控制 */
.content {
  padding: 10px 40px;
  height: 100%; /* 计算内容区高度（视口高度 - 顶部padding - 底部footer高度） */
  overflow-y: auto; /* 保留内容区内部滚动（如果内容超出），但隐藏外部滚动条 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
}

/* Banner样式 */
.banner-wrap {
  margin-bottom: 16px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 20px;
}

.book-item {
  cursor: pointer;
}

/* 横向分类栏 */
.category-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.book-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 15px;
}

/* 底部版权区 */
.footer {
  background-color: #f5f5f5;
  padding: 40px;
  font-size: 12px;
  color: #666;
  box-sizing: border-box;
}

.footer-links {
  margin-bottom: 20px;
}
.footer-links .el-link {
  margin-right: 20px;
  color: #666;
}
</style>
