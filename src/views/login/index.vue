<script setup lang="ts">
import { loginApi } from '@/api/login'
import type { LoginForm } from '@/api/types'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

let loginForm = ref<LoginForm>({ username: '', password: '' })
const router = useRouter()

// 登录
const login = async () => {
  // 登录
  const result = await loginApi(loginForm.value)
  if (result.code === 1) {
    // 提示信息
    ElMessage.success('登录成功')
    // 存储当前登录用户信息
    localStorage.setItem('login_user', JSON.stringify(result.data))
    // 跳转页面 - 首页
    router.push('index')
  } else {
    ElMessage.error(result.msg)
  }
}

// 注册
const register = () => {
  router.push('/register')
}

// 重置
const clear = () => {
  loginForm.value = { username: '', password: '' }
}
</script>

<template>
  <div id="container">
    <div class="login-card">
      <div class="login-image">
        <img
          src="../../assets/227.png"
          alt="Login Image"
          style="object-fit: cover; width: 100%; height: 100%; border-radius: 20px"
        />
      </div>

      <div class="login-form">
        <el-form label-width="80px">
          <p class="title">欢迎回来</p>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              type="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              show-password
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button class="button" type="primary" @click="login">登 录</el-button>
          </el-form-item>
        </el-form>
        <div class="auth-hints">
          <span>没有账号喵？</span>
          <a href="#" class="register" @click="register">注册</a>
          <span class="sep">|</span>
          <a href="#">找回密码</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#container {
  min-height: 100vh;
  background-color: rgba(250, 204, 204, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 80%;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.login-image {
  width: 90%;
  height: 100%;
}

.login-form {
  padding: 50px;
  margin: 0 auto;

  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  background-color: rgba(255, 255, 255, 0.8);
  margin-left: -50px;
}
:deep(.el-input__suffix) {
  position: absolute;
  right: 10px;
  height: 100%;
  display: flex;
  align-items: center;
}

:deep(.el-input__wrapper) {
  padding-right: 40px !important;
}

.title {
  font-size: 30px;
  font-family: '楷体';
  text-align: center;
  margin-bottom: 30px;
  font-weight: bold;
}

.button {
  margin-top: 30px;
  width: 60%;
}

.auth-hints {
  text-align: center;
  margin-top: 9%;
  font-size: 14px;
  color: rgba(148, 75, 75, 0.8);
}

.auth-hints a {
  cursor: pointer;
  color: rgba(148, 75, 75, 0.8);
  margin: 0 6px;
}
</style>
