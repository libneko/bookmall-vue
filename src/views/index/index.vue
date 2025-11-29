<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBooks, getCategories} from '@/api/home'
import type { Book, Category } from '@/api/types'
import BookCard from '@/component/book.vue'

interface Banner {
  id: number
  imgUrl: string
}

interface Goods {
  id: number
  name: string
  price: number
  imgUrl: string
}

// 生成随机销售量
const generateRandomSales = (): string => {
  const sales = Math.floor(Math.random() * 10000) + 100
  return sales > 1000 ? `${(sales / 1000).toFixed(1)}万+` : `${sales}+`
}

// 分类数据
const categories = ref<Category[]>([])

const books = ref<Book[]>([])

// Banner 数据 - 从 Book 前几个生成
const banners = ref<Banner[]>([])

// 商品数据 - 从 Book 列表生成
const goodsList = ref<Goods[]>([])

// 从后端加载数据（顺序调用），并随机选取 banner/goods
const getRandomItems = <T,>(arr: T[], n: number): T[] => {
  const len = arr.length
  if (n >= len) return arr.slice()
  const res: T[] = []
  const taken = new Set<number>()
  while (res.length < n) {
    const idx = Math.floor(Math.random() * len)
    if (!taken.has(idx)) {
      taken.add(idx)
      const item = arr[idx]!
      res.push(item)
    }
  }
  return res
}

const loadData = async () => {
  categories.value = (await getCategories()).data
  books.value = (await getBooks()).data

  const bannerBooks = getRandomItems(books.value, Math.min(3, books.value.length))
  banners.value = bannerBooks.map((book, index) => ({
    id: index + 1,
    imgUrl: book.image,
  }))
  bannerCount.value = banners.value.length

  const goodsBooks = getRandomItems(books.value, Math.min(6, books.value.length))
  goodsList.value = goodsBooks.map((book, index) => ({
    id: book.id ?? index,
    name: book.name,
    price: book.price,
    sales: generateRandomSales(),
    imgUrl: book.image,
  }))
  console.log(goodsList.value)
}

const router = useRouter()

const openGoods = (g: Goods) => {
  router.push(`/introduction/${g.id}`)
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
            <el-image style="width: 100%; height: 100%" :src="banner.imgUrl" fit="contain" />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 横向分类栏（全部商品分类 横向排列/可横向滚动） -->
      <div class="category-bar">
        <div class="category-title">全部商品分类</div>
        <div class="category-list">
          <div class="category-pill" v-for="category in categories" :key="category.id">
            {{ category.name }}
          </div>
        </div>
      </div>

      <!-- 商品卡片区 -->
      <div class="goods-section">
        <div class="goods-title">猜你喜欢</div>
        <div class="goods-list">
          <div
            v-for="goods in goodsList"
            :key="goods.id"
            class="goods-card-col"
            @click="openGoods(goods)"
          >
          <BookCard :book="goods"/>
          </div>
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
      <div class="footer-icon">
        <el-icon class="icon"><weixin /></el-icon>
        <el-icon class="icon"><alipay /></el-icon>
        <el-icon class="icon"><weibo /></el-icon>
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
/* Chrome/Safari 隐藏滚动条 */
.content::-webkit-scrollbar {
  display: none;
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
.category-bar .category-title {
  font-weight: bold;
  color: #333;
  margin-right: 8px;
}
.category-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.category-list::-webkit-scrollbar {
  display: none;
}
.category-pill {
  background: #fff;
  border: 1px solid #eee;
  padding: 8px 14px;
  border-radius: 20px;
  white-space: nowrap;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
.category-pill:hover {
  background: #ffefec;
  border-color: #ffb6a0;
}

/* 商品卡片区 */
.goods-section {
  margin-top: 20px;
}
.goods-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}
.goods-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.goods-card-col {
  width: 100%;
  cursor: pointer;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .goods-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .goods-list {
    grid-template-columns: repeat(1, 1fr);
  }
  .search-input {
    width: 100%;
  }
  .home {
    padding-left: 5%;
    padding-right: 5%;
  }
  .content {
    height: calc(100vh - 185px - 150px); /* 适配移动端footer高度 */
  }
}

/* 底部版权区 */
.footer {
  background-color: #f5f5f5;
  padding: 40px;
  font-size: 12px;
  color: #666;
  height: 14%; /* 固定footer高度，方便内容区计算 */
  box-sizing: border-box;
}
.footer-links {
  margin-bottom: 20px;
}
.footer-links .el-link {
  margin-right: 20px;
  color: #666;
}
.footer-copyright {
  color: #999;
}
.footer-icon {
  margin-top: 10px;
}
.icon {
  font-size: 20px;
  margin-right: 15px;
  color: #666;
}
</style>
