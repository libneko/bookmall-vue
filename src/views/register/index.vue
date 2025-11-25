<script setup lang="ts">
import { loginApi } from '@/api/login'
import type { LoginForm, RegisterForm } from '@/api/types'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

let registerForm = ref<RegisterForm>({ username: '', password: '', name: '' })
const router = useRouter()

const register = async () => {
  // 登录

  // 提示信息
  ElMessage.success('注册成功')
  // 存储当前登录用户信息

  // 跳转页面 - 首页
  router.push('/login')
}

const login = () => {
  router.push('/login')
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
          <p class="title">加入大家庭</p>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              type="password"
              v-model="registerForm.password"
              placeholder="请输入密码"
            ></el-input>
          </el-form-item>

          <el-form-item label="确认密码" prop="password">
            <el-input
              type="password"
              v-model="registerForm.password"
              placeholder="请再输入密码"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button class="button" type="primary" @click="register">注 册</el-button>
          </el-form-item>
        </el-form>
        <div class="auth-hints">
          <span>已有账号喵？</span>
          <a href="#" class="register" @click="login">登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#container {
  min-height: 100vh;
  background-color: rgba(245, 196, 196, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 1150px;
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
  max-width: 400px;
  max-height: 60%;
  padding: 50px;
  margin: 0 auto;

  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  background-color: rgba(255, 255, 255, 0.8);
  margin-left: -50px;
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
  width: 100px;
}

.auth-hints {
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
  color: rgba(148, 75, 75, 0.8);
}

.auth-hints a {
  cursor: pointer;
  color: rgba(148, 75, 75, 0.8);
  margin: 0 6px;
}
</style>
