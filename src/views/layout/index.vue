<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'


// 当前登录的员工
const login_name = ref('')
const router = useRouter()

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
        <el-aside class="aside">

          <el-menu router="true"   
          >
            <!-- 首页菜单 -->
            <div class = "title">
              <span>小书架</span>
            </div>
            <div class = "menu_item">
              
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
              <el-menu-item index="/shopping">
                <el-icon><ShoppingCart /></el-icon> 购物车
              </el-menu-item>    
            </div>

          </el-menu>
        </el-aside>



      <el-container>
        <!-- 左侧菜单 -->

        <!-- Header 区域 -->
        <el-header class="header">
            <span class="right_tool">
              <a href="">
                <el-icon><EditPen /></el-icon> 个人信息 &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;
              </a>
              <a href="javascript:void(0);" @click="logout">
                <el-icon><SwitchButton /></el-icon> 退出登录 【{{ login_name }}】
              </a>
            </span>
        </el-header>  

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.header {
  background-image: linear-gradient(to right,
  rgba(241, 218, 218, 0.0), 
  rgba(241, 218, 218, 0.4), 
  rgba(241, 218, 218, 0.6), 
  rgba(20, 19, 19 , 0.6),
  rgba(20, 19, 19 , 0.8), 
  rgba(20, 19, 19 , 1));
  width: 100%;
  position: fixed;
}

.title {
  color: rgb(73, 56, 56);
  background-color:  rgba(241, 218, 218, 0.1);
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
  width: 100%;
  text-align: center;
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
  width: 185px;
  border-right: 1px solid #ccc;
  height: 730px;
  background-color: rgba(241, 218, 218, 0.1);
  position: fixed; /* 固定定位 */
  height: 100vh; /* 占满整个视口高度 */
  overflow-y: auto; /* 允许内容滚动 */
  gap:2rem;
}

.menu_item {
  display: flex;
  flex-direction: column;

  background-color: rgba(241, 218, 218, 0.1);
}


</style>
