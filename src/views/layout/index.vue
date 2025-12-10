<script setup lang="ts">
import type { LoginToken } from '@/api/types'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// 当前登录的员工
const login_user = ref<LoginToken | null>(null)
const router = useRouter()

// 下拉菜单逻辑
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  login_user.value = JSON.parse(localStorage.getItem('login_user')!) as LoginToken
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 退出登录
const logout = () => {
  localStorage.removeItem('login_user')
  router.push('/login')
}

const profile = () => {
  window.open('/profile', '_blank')
}
</script>

<template>
  <el-container>
    <!-- 左侧菜单 -->
    <el-aside class="aside">
      <el-menu router="true">
        <!-- 首页菜单 -->
        <div class="title">
          <span>小书架</span>
        </div>
        <div class="menu_item">
          <el-menu-item index="/index">
            <el-icon><Promotion /></el-icon> 首页
          </el-menu-item>
          <el-menu-item index="/search">
            <el-icon><Search /></el-icon> 搜索
          </el-menu-item>
          <el-menu-item index="/shopping-cart">
            <el-icon><ShoppingCart /></el-icon> 购物车
          </el-menu-item>
        </div>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <span class="left_title">{{ router.currentRoute.value.meta.title }}</span>

        <div class="user-dropdown" ref="dropdownRef">
          <img :src="login_user?.avatar" class="icon" @click="toggleDropdown" />

          <Transition name="dropdown">
            <div v-show="isDropdownOpen" class="dropdown-menu">
              <div class="dropdown-item">
                <div class="user-info">
                  <img :src="login_user?.avatar" class="icon-small" />
                  <span>{{ login_user?.username }}</span>
                </div>
              </div>
              <div class="dropdown-item" @click="profile">个人信息</div>
              <div class="dropdown-item" @click="logout">退出登录</div>
            </div>
          </Transition>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-content {
  background-color: rgba(248, 228, 228, 0.2);
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.header {
  background-image: linear-gradient(
    to right,
    rgba(20, 19, 19, 0.9),
    rgba(20, 19, 19, 0.9),
    rgba(241, 218, 218, 0.7),
    rgba(241, 218, 218, 0.8),
    rgba(20, 19, 19, 0.7),
    rgba(20, 19, 19, 0.8),
    rgba(20, 19, 19, 1)
  );
  justify-content: space-between;
  align-items: center;
  display: flex;
}

.title {
  color: rgb(73, 56, 56);
  background-color: rgba(241, 218, 218, 0.1);
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
  width: 100%;
  text-align: center;
}

.left_title {
  color: rgb(236, 192, 192);
  font-size: 30px;
  font-weight: bolder;
  line-height: 50px;
}

a {
  color: rgb(230, 218, 218);
  text-decoration: none;
}

.aside {
  width: 200px;
  border-right: 1px solid #ccc;
  background-color: rgba(241, 218, 218, 0.1);
  height: 100vh;
}

.menu_item {
  display: flex;
  flex-direction: column;
  background-color: rgba(241, 218, 218, 0.1);
}

.icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  margin: 5px;
}

.user-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 2000;
  min-width: 160px;
  padding: 10px;
  transform-origin: top right;
}

.dropdown-item {
  padding: 0 20px;
  line-height: 36px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f3f3f3;
  border-radius: 5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
</style>
