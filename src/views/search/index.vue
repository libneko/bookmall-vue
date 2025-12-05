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

const handleSearch = () => {
  const query: Record<string, any> = {}
  if (searchKeyword.value) {
    query.name = searchKeyword.value
  }
  if (selectedCategoryId.value) {
    query.category_id = selectedCategoryId.value
  }
  router.push({
    path: '/search',
    query,
  })
}

const fetchBooks = async () => {
  const name = String(route.query.name || '')
  const categoryId = Number(route.query.category_id || 0)

  if (!name && categoryId === 0) {
    try {
      const res = await getRandomBooks(12)
      console.log(res.data.length)
      if (res.code === 1) {
        isSearched.value = true
        bookList.value = res.data
      }
    } catch (error) {
      console.error(error)
    }
    return
  }

  const res = await searchApi({
    page: Number(route.query.page || 1),
    page_size: Number(route.query.pageSize || 6),
    name: name,
    category_id: categoryId,
    status: 1,
  })

  if (res.code === 1 && res.data.records.length > 0) {
    isSearched.value = true
    bookList.value = res.data.records
    ElMessage.success('搜索成功')
  } else {
    ElMessage.error('未找到书籍')
    bookList.value = []
  }
}

watch(
  () => route.query,
  () => {
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
