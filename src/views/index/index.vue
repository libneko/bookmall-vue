<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
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
  suggestBooks.value = _.sampleSize(books.value, 6)
}

// Banner轮播逻辑
const currentIndex = ref(0)
const bannerCount = ref(banners.value.length)
let intervalId: number | null | undefined = null

const switchBanner = (index: number) => {
  currentIndex.value = index
}

const prevBanner = () => {
  currentIndex.value = (currentIndex.value - 1 + bannerCount.value) % bannerCount.value
}

const nextBanner = () => {
  currentIndex.value = (currentIndex.value + 1) % bannerCount.value
}

// 自动轮播
onMounted(() => {
  loadData()

  intervalId = setInterval(() => {
    nextBanner()
  }, 3000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <el-container class="home">
    <!-- 核心内容区 -->
    <el-main class="content">
      <!-- 顶部 Banner（放在最上面） -->
      <div class="banner-wrap">
        <el-carousel
          :current-index="currentIndex"
          @change="switchBanner"
          class="banner-carousel"
          height="500px"
        >
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

      <div class="book-section">
        <div class="book-title">猜你喜欢</div>

        <el-row :gutter="20">
          <el-col
            v-for="book in suggestBooks"
            :key="book.id"
            :xs="24"
            :sm="12"
            :md="8"
            style="padding: 10px"
          >
            <div style="cursor: pointer; height: 100%">
              <BookCard :book="book" />
            </div>
          </el-col>
        </el-row>
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
.banner-carousel {
  width: 100%;
  height: 40%;
}

/* 横向分类栏 */
.category-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

/* 商品卡片区 */
.book-section {
  margin-top: 20px;
}

.book-title {
  font-size: 18px;
  font-weight: bold;
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
