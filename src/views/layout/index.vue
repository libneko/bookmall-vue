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
      <!-- Header 区域 -->
      <el-header class="header">
        <span class="title">小书架</span>
        <span class="right_tool">
          <a href="javascript:void(0);" @click.prevent="goCart">
            购物车 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
          </a>
          <a href="">
            <el-icon><EditPen /></el-icon> 修改密码 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
          </a>
          <a href="javascript:void(0);" @click="logout">
            <el-icon><SwitchButton /></el-icon> 退出登录 【{{ login_name }}】
          </a>
        </span>
      </el-header>

      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px" class="aside">
          <el-menu router="true">
            <!-- 首页菜单 -->
            <el-menu-item index="/index">
              <el-icon><Promotion /></el-icon> 首页
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.header {
  background-image: linear-gradient(to right, #00547d, #007fa4, #00aaa0, #00d072, #a8eb12);
}

.title {
  color: white;
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
}

.right_tool {
  float: right;
  line-height: 60px;
}

a {
  color: white;
  text-decoration: none;
}

.aside {
  width: 220px;
  border-right: 1px solid #ccc;
  height: 730px;
}
</style>
