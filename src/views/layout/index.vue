<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// 当前登录的员工
const login_name = ref('')
const router = useRouter()

// 跳转到购物车页面
const goCart = () => {
  router.push({ name: 'shopping-cart' })
}

onMounted(() => {
  const login_user = JSON.parse(localStorage.getItem('login_user')!)
  if (login_user && login_user.name) {
    login_name.value = login_user.name
  }
})

// 退出登录
const logout = () => {
  // 弹出对话框
  ElMessageBox.confirm('您确认退出登录吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      ElMessage.success('退出成功')
      localStorage.removeItem('login_user')
      // 跳转登录
      router.push('/login')
    })
    .catch(() => {
      ElMessage.info('您已取消退出')
    })
}
</script>

<template>
  <div class="common-layout">
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
            <el-sub-menu index="/search">
              <template #title>
                <el-icon><Menu /></el-icon>
                <span>分类</span>
              </template>
              <el-menu-item-group title="热 门">
                <el-menu-item index="1-1">item one</el-menu-item>
                <el-menu-item index="1-2">item two</el-menu-item>
              </el-menu-item-group>
            </el-sub-menu>
            <el-menu-item index="/shopping-cart">
              <el-icon><ShoppingCart /></el-icon> 购物车
            </el-menu-item>
          </div>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- Header 区域 -->
        <el-header class="header">
          <span class="left_title">{{ router.currentRoute.value.meta.title }}</span>

          <span class="right_tool">
            <a href="">
              <el-icon><EditPen /></el-icon> 个人信息 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
            </a>
            <a href="javascript:void(0);" @click="logout">
              <el-icon><SwitchButton /></el-icon> 退出登录 【{{ login_name }}】
            </a>
          </span>
        </el-header>

        <el-main class="main-content">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
}

.main-content {
  background-color: rgba(248, 228, 228, 0.2);
  margin-left: 13%;
  margin-top: 3.9%;
  padding: 0px;
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
  width: calc(100% - 13%);
  height: 8%;
  position: fixed; /* 固定在页面 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  top: 0; /* 顶部 */
  left: 0;
  z-index: 1000; /* 层级高一点 */
  margin-left: 13%;
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

.right_tool {
  float: right;
  line-height: 60px;
}

a {
  color: rgb(230, 218, 218);
  text-decoration: none;
}

.aside {
  width: 13%;
  border-right: 1px solid #ccc;
  height: 100vh;
  background-color: rgba(241, 218, 218, 0.1);
  position: fixed; /* 固定定位 */
  height: 100vh; /* 占满整个视口高度 */
  overflow-y: auto; /* 允许内容滚动 */
  gap: 2rem;
}

.menu_item {
  display: flex;
  flex-direction: column;

  background-color: rgba(241, 218, 218, 0.1);
}
</style>
