<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { searchApi } from '@/api/search'
import { getCategories, getRandomBooks } from '@/api/home'
import type { Book, Category } from '@/api/types'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BookGrid from '@/component/book-grid.vue'

const route = useRoute()
const router = useRouter()

const searchKeyword = ref('')
const selectedCategoryId = ref(0)
const isSearched = ref(false)

const bookList = ref<Book[]>([])
const categories = ref<Category[]>([])

const total = ref(0)
const currentPage = ref(Number(route.query.page || 1))
const pageSize = ref(Number(route.query.pageSize || 10))

const handleSearch = () => {
  const query: Record<string, any> = {}
  if (searchKeyword.value) query.name = searchKeyword.value
  if (selectedCategoryId.value) query.category_id = selectedCategoryId.value
  query.page = 1
  query.pageSize = pageSize.value

  router.push({
    path: '/search',
    query,
  })
}

const fetchBooks = async () => {
  const name = String(route.query.name || '')
  const categoryId = Number(route.query.category_id || 0)
  const page = Number(route.query.page || 1)
  const size = Number(route.query.pageSize || 10)

  if (!name && categoryId === 0) {
    // 随机推荐
    try {
      const res = await getRandomBooks(size)
      if (res.code === 1) {
        isSearched.value = true
        bookList.value = res.data
        total.value = res.data.length
      }
    } catch (error) {
      console.error(error)
    }
    return
  }

  // 搜索结果
  const res = await searchApi({
    page,
    page_size: size,
    name: name,
    category_id: categoryId,
    status: 1,
  })

  if (res.code === 1) {
    isSearched.value = true
    bookList.value = res.data.records
    total.value = res.data.total
    ElMessage.success('搜索成功')
  } else {
    ElMessage.error('未找到书籍')
    bookList.value = []
    total.value = 0
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  router.push({
    path: '/search',
    query: {
      ...route.query,
      page,
      pageSize: pageSize.value,
    },
  })
}

// 监听 URL 查询参数变化
watch(
  () => route.query,
  () => {
    currentPage.value = Number(route.query.page || 1)
    pageSize.value = Number(route.query.pageSize || 10)
    fetchBooks()
  },
  { immediate: true },
)

onMounted(async () => {
  const res = await getCategories()
  categories.value = [{ id: 0, name: '全部', sort: 0, status: 1 }, ...res.data]

  if (route.query.name) {
    searchKeyword.value = String(route.query.name)
  }
  const id = Number(route.query.category_id)
  if (!isNaN(id) && id !== 0) {
    selectedCategoryId.value = id
  }
})
</script>

<template>
  <div class="search-view" :class="{ active: isSearched }">
    <div class="search-input" :class="{ active: isSearched }">
      <el-input
        v-model="searchKeyword"
        style="max-width: 80%; height: 55px"
        placeholder="输入书名或关键字进行搜索"
        class="input-with-select"
      >
        <template #prefix>
          <el-select v-model="selectedCategoryId" placeholder="Select" style="width: 115px">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </template>
        <template #suffix>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <BookGrid v-if="isSearched" :books="bookList" />

    <!-- 分页 -->
    <el-pagination
      v-if="isSearched && total > pageSize"
      background
      layout="prev, pager, next, jumper"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
      style="margin-top: 20px; text-align: center"
    />
  </div>
</template>

<style scoped>
.search-view {
  margin: 0 auto;
  position: relative;
  margin-top: -4.5%;
  min-height: 100vh;
  border-radius: 20px;
  transition: 0.5s;
  display: flex;
  flex-direction: column;
  background-image: url('https://neko-book.oss-cn-hangzhou.aliyuncs.com/search.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
}
.search-input {
  text-align: center;
  width: calc(100vw - 13%);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.5s;
}

.search-input.active {
  height: 50vh;
}

:deep(.el-input__wrapper) {
  border-radius: 50px !important;
  box-shadow: none;
  overflow: hidden !important;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.5);
  transition:
    box-shadow 0.4s ease,
    transform 0.3s;
  animation: breathing 20s ease-in-out infinite;
}
:deep(.el-input__wrapper:hover) {
  transform: scale(1.01);
}
:deep(.el-select__wrapper) {
  border-radius: 50px !important;
  box-shadow: none;
  overflow: hidden !important;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.5);
  transition:
    box-shadow 0.4s ease,
    transform 0.3s;
}

:deep(.el-button) {
  border-radius: 50px !important;
  box-shadow: none;
  overflow: hidden !important;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.5);
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
