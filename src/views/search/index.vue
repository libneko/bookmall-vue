<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const input1 = ref('')

const input3 = ref('')
const select = ref('')
</script>

<template>
  <div class="search-view">
    <div class="search-input">
      <el-input
        v-model="input3"
        style="max-width: 80%; height: 55px"
        placeholder="输入书名或关键字进行搜索"
        class="input-with-select"
      >
        <template #prefix>
          <el-select v-model="select" placeholder="Select" style="width: 115px">
            <el-option label="Restaurant" value="1" />
            <el-option label="Order No." value="2" />
            <el-option label="Tel" value="3" />
          </el-select>
        </template>
        <template #suffix>
          <el-button :icon="Search" />
        </template>
      </el-input>
    </div>
      <div class="result-list" v-if="isSearched">
        <div 
          class="book-card"
          v-for="book in bookList" 
          :key="book.id"
        >
          <img :src="book.image" />
          <p>{{ book.name }}</p>
        </div>
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
}
.search-input {
  text-align: center;
  background-color: rgba(0, 0, 0, 0.6);
  width: calc(100wh - 13%); /* 占满屏幕宽度 */
  height: 100vh; /* 占满屏幕高度 */
  display: flex;
  justify-content: center;

  align-items: center;
  background-image: url('https://neko-book.oss-cn-hangzhou.aliyuncs.com/search.jpg');
  background-repeat: no-repeat; /* 不重复 */
  background-position: center; /* 居中显示 */
  background-size: cover; /* ← 整图完整显示 */
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
