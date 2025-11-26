<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const input1 = ref('')
const input2 = ref('')
</script>

<template>
  <div class="search-view">
    <div class="search-input">
      <el-input
        v-model="input1"
        style="width: 700px; height: 50px"
        size="large"
        placeholder="输入书名或关键字进行搜索"
        :suffix-icon="Search"
      >
        <template #prefix>
          <el-icon class="el-input__icon"><search /></el-icon>
        </template>
      </el-input>
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
  background-image: url('../../assets/233.png');
  background-repeat: no-repeat; /* 不重复 */
  background-position: center; /* 居中显示 */
  background-size: cover; /* ← 整图完整显示 */
}
:deep(.el-input__wrapper) {
  border-radius: 30px !important; /* 想多圆就多大 */
}
</style>
