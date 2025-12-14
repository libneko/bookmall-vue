<script setup lang="ts">
import type { RegisterForm } from '@/api/types'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormRules, FormInstance } from 'element-plus'
import { registerApi } from '@/api/register'
import AuthLayout from '@/component/auth-layout.vue'

const registerForm = ref<RegisterForm>({
  email: '',
  password: '',
  username: '',
})

const router = useRouter()

const formRef = ref<FormInstance>()

const passwordForm = reactive({
  password: '',
  confirmPassword: '',
})

const register = async () => {
  // 注册
  console.log(registerForm.value)

  const result = await registerApi(registerForm.value)
  if (result.code === 1) {
    ElMessage.success('注册成功')
    localStorage.setItem('login_user', JSON.stringify(result.data))
    // 跳转页面 - 首页
    router.push('/')
  } else {
    ElMessage.error('传输注册数据失败')
  }
}

// 自定义校验器：检查两次密码是否一致
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value.length < 8) {
    callback(new Error('密码长度不能少于8位'))
  } else if (value.length > 20) {
    callback(new Error('密码长度不能超过20位'))
  } else if (value !== passwordForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const submit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('校验通过，可以提交')
      console.log(registerForm.value.email)
      registerForm.value.password = passwordForm.password
      register()
    }
  })
}

const rules = reactive<FormRules>({
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
})

const login = () => {
  router.push('/login')
}
</script>

<template>
  <AuthLayout>
    <el-form :model="passwordForm" :rules="rules" ref="formRef" label-width="80px">
      <p class="title">注册账户</p>
      <el-form-item label="注册邮箱" prop="email">
        <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="输入用户名"></el-input>
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          type="password"
          minlength="8"
          maxlength="20"
          v-model="passwordForm.password"
          placeholder="输入密码（8-20位）"
          show-password
        ></el-input>
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          type="password"
          v-model="passwordForm.confirmPassword"
          placeholder="请再输入密码"
          show-password
        ></el-input>
      </el-form-item>

      <el-form-item> </el-form-item>
    </el-form>
    <el-button type="primary" @click="submit">注 册</el-button>
    <el-link href="#" underline="never" @click="login">已有账号？去登录</el-link>
  </AuthLayout>
</template>

<style scoped>
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
</style>
