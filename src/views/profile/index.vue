<script setup lang="ts">
import { getProfile, updateProfile } from '@/api/profile'
import type { User } from '@/api/types'
import { ElMessage } from 'element-plus'
import { onMounted, reactive } from 'vue'

const form = reactive<User>({
  id: 0,
  username: '',
  email: '',
  phone: '',
  sex: 0,
  avatar: '',
})

onMounted(async () => {
  const loginUserStr = localStorage.getItem('login_user')
  if (loginUserStr) {
    const loginUser = JSON.parse(loginUserStr)
    if (loginUser && loginUser.id) {
      try {
        const res = await getProfile(loginUser.id)
        if (res.code === 1) {
          console.log('用户信息：', res.data)
          Object.assign(form, res.data)
        } else {
          ElMessage.error(res.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
})

const save = async () => {
  try {
    const res = await updateProfile(form)
    if (res.code === 1) {
      ElMessage.success('用户信息已更新')
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
  }
}
</script>

<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <div class="avatar-wrapper">
        <img :src="form.avatar" class="avatar" />
      </div>

      <h2 class="profile-title">个人资料</h2>

      <el-form :model="form" label-width="80px" class="profile-form">
        <el-form-item label="用户ID">
          <el-input v-model="form.id" disabled />
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="头像URL">
          <el-input v-model="form.avatar" placeholder="请输入头像URL" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="save" class="save-btn">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.profile-card {
  width: 100%;
  max-width: 500px;
  padding: 20px;
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #ebeef5;
  padding: 2px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.profile-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-weight: 500;
}

.profile-form {
  margin-top: 20px;
}

.save-btn {
  width: 100%;
}
</style>
