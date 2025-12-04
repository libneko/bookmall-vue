<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { searchApi } from '@/api/search'
import { getCategories } from '@/api/home'
import type { Book, Category, SendSearch } from '@/api/types'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

const router = useRouter()

const input3 = ref('')

const select = ref(1)
const isFirstLoad = ref(true)
const success_search = ref(false)

let bookList = ref<Book[]>([])
const categories = ref<Category[]>([])

const isSearched = ref(false) // 是否已执行搜索

const searchBooks = async () => {
  router.push({
    path: '/search',
    query: {
      page: 1,
      pageSize: 6,
      name: input3.value,
      categoryId: select.value,
      status: 1,
    },
  })
}

watch(
  () => route.query,
  async () => {
    if (isFirstLoad.value) {
      isFirstLoad.value = false
      return // <-- 直接退出，不搜索
    }

    const res = await searchApi({
      page: Number(route.query.page ?? 1),
      page_size: Number(route.query.pageSize ?? 6), // page_size 能正常传入！
      name: String(route.query.name ?? ''),
      category_id: Number(route.query.categoryId ?? null),
      status: Number(route.query.status ?? 1),
    })

    if (res.code === 1 && res.data.records.length > 0) {
      isSearched.value = true
      bookList.value = res.data.records
      ElMessage.success('搜索成功')
    } else {
      ElMessage.error('未找到书籍')
    }
    console.log(res.data)

    console.log(bookList.value)
  },
  { immediate: true },
) // 初次加载也执行

onMounted(async () => {
  categories.value = (await getCategories()).data
  const id = Number(route.query.category_id)
  if (!isNaN(id)) {
    select.value = id // ⭐ 自动更新下拉框
  }
})
</script>

<template>
  <div class="search-view" :class="{ active: isSearched }">
    <div class="search-input" :class="{ active: isSearched }">
      <el-input
        v-model="input3"
        style="max-width: 80%; height: 55px"
        placeholder="输入书名或关键字进行搜索"
        class="input-with-select"
      >
        <template #prefix>
          <el-select v-model="select" placeholder="Select" style="width: 115px">
            <el-option v-for="category in categories" :label="category.name" :value="category.id" />
          </el-select>
        </template>
        <template #suffix>
          <el-button :icon="Search" @click="searchBooks" />
        </template>
      </el-input>
    </div>
    <div class="result-list" v-if="isSearched">
      <el-row class="book-lists" v-for="book in bookList">
        <el-col :span="4">
          <img :src="book?.image" />
        </el-col>
        <el-col :span="16" style="padding-left: 5%; padding-right: 5%">
          <el-row :span="12" class="book-title">
            <p>{{ book?.name }}</p>
          </el-row>
          <el-row :span="12" class="book-intro">
            <p>{{ book?.description }}</p>
          </el-row>
        </el-col>
        <el-col :span="4" class="book-price">
          <p>¥{{ book?.price }}</p>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.search-view {
  margin: 0 auto;
  position: relative;
  margin-top: -4.5%;
  min-height: 100vh;
  border-radius: 20px; /* 可改大或小，如 20px、999px等 */
  transition: 0.5s; /* 平滑过渡 */
  display: flex;
  flex-direction: column;
  background-image: url('https://neko-book.oss-cn-hangzhou.aliyuncs.com/search.jpg');
  background-repeat: no-repeat; /* 不重复 */
  background-position: center; /* 居中显示 */
  background-size: cover; /* ← 整图完整显示 */
  background-attachment: fixed; /* 🔥 背景固定 */
}
.search-input {
  text-align: center;
  width: calc(100wh - 13%); /* 占满屏幕宽度 */
  height: 100vh; /* 占满屏幕高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.5s; /* 平滑过渡 */
}

.search-input.active {
  height: 50vh;
}

.result-list {
  width: 90%; /* 占满屏幕宽度 */
  margin-top: 20px;
  margin-left: 5%;
  display: flex;
  border-radius: 40px;
  flex-wrap: wrap;
  gap: 20px;
  backdrop-filter: blur(12px); /* 毛玻璃核心 */
  background: rgba(255, 255, 255, 0.5); /* 半透明玻璃 */
}
.book-lists {
  padding: 2%;
}

.book-title {
  padding-bottom: 15px;
  font-size: 200%;
}

.book-intro {
  padding-bottom: 10px;
  font-size: 100%;
  color: rgb(68, 61, 61);
  width: 100%; /* 记得给宽度，不然不会触发换行 */
  white-space: normal; /* 允许换行 */
  word-wrap: break-word; /* 自动换行 */
  word-break: break-all; /* 单词或长字符串也强制换行 */
}

.book-price {
  width: 100%;
  border-radius: 30px;
  color: rgb(229, 94, 52);
  font-weight: bold; /* 粗体 */
  font-style: italic; /* 斜体 */
  font-size: 300%;
}

.result-list img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

:deep(.el-row) {
  width: 100%;
}

/* 最外层输入框整体圆角控制 */
:deep(.el-input__wrapper) {
  border-radius: 50px !important; /* 整体圆角 */
  box-shadow: none; /* 去掉默认阴影 */
  overflow: hidden !important; /* 保证圆角生效 */
  backdrop-filter: blur(12px); /* 毛玻璃核心 */
  background: rgba(255, 255, 255, 0.5); /* 半透明玻璃 */
  transition:
    box-shadow 0.4s ease,
    transform 0.3s;
  animation: breathing 20s ease-in-out infinite;
}
:deep(.el-input__wrapper:hover) {
  transform: scale(1.01);
}
/* 左侧 select 圆角处理 */
:deep(.el-select__wrapper) {
  border-radius: 50px !important; /* 整体圆角 */
  box-shadow: none; /* 去掉默认阴影 */
  overflow: hidden !important; /* 保证圆角生效 */
  backdrop-filter: blur(12px); /* 毛玻璃核心 */
  background: rgba(255, 255, 255, 0.5); /* 半透明玻璃 */
  transition:
    box-shadow 0.4s ease,
    transform 0.3s;
}

/* 右侧按钮圆角处理 */
:deep(.el-button) {
  border-radius: 50px !important; /* 整体圆角 */
  box-shadow: none; /* 去掉默认阴影 */
  overflow: hidden !important; /* 保证圆角生效 */
  backdrop-filter: blur(12px); /* 毛玻璃核心 */
  background: rgba(255, 255, 255, 0.5); /* 半透明玻璃 */
  transition:
    box-shadow 0.4s ease,
    transform 0.3s;
}
:deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.9);
}
@keyframes breathing {
  0% {
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.9);
  }
  100% {
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
  }
}
</style>
