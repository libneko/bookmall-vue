<script setup lang="ts">
import { createConfirmPasswordValidator, validatePhone, validateEmail } from '@/api/meta'
import { getProfile, updateProfile, upload } from '@/api/profile'
import type { LoginToken, User } from '@/api/types'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const form = reactive<User>({
  id: 0,
  username: '',
  email: '',
  password: '',
  phone: '',
  sex: 0,
  avatar: '',
})
const passwordForm = reactive({
  password: '',
  confirmPassword: '',
})
const originalFormStr = ref('')
const combinedFormData = computed(() => ({
  ...form,
  ...passwordForm,
}))

const rules = reactive<FormRules>({
  // 1. 使用邮箱校验
  email: [{ required: true, validator: validateEmail, trigger: 'blur' }],

  // 2. 使用手机号校验
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],

  // 3. 密码 (通常只需要校验长度)
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],

  // 4. 确认密码 (使用工厂函数，传入获取当前密码的方法)
  confirmPassword: [
    {
      required: true,
      validator: createConfirmPasswordValidator(() => passwordForm.password),
      trigger: 'blur',
    },
  ],
})
const isPhoneEditing = ref(false)
const isEmailEditing = ref(false)
const isPasswordEditing = ref(false)

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const formRef = ref<FormInstance>()

const handleEditPhone = () => {
  isPhoneEditing.value = true
}
const handleEditEmail = () => {
  isEmailEditing.value = true
}
const handleEditPassword = () => {
  isPasswordEditing.value = true
}

const triggerInput = () => {
  // 使用可選鏈 (Optional Chaining) ?.
  // 如果 fileInputRef.value 存在，才執行 click()
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  // TS 核心點：Event target 默認是泛型的，不包含 files 屬性
  // 我們需要使用 'as' 關鍵字將其斷言為 HTMLInputElement
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  // 檢查是否有文件被選中

  // --- 類型校驗 ---
  // TS 會自動推斷 file 是 File 類型，所以會有 type 和 size 屬性
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  selectedFile.value = file
  if (!isJPGOrPNG) {
    alert('只能上傳 JPG/PNG 文件!')
    return
  }
  if (!isLt2M) {
    alert('圖片大小不能超過 2MB!')
    return
  }
  target.value = ''
}

const uploadToServer = async (file: File) => {
  try {
    // 發送請求
    const response = await upload(file)
    if (response.code === 1) {
      form.avatar = response.data
      ElMessage.success('上传头像成功')
    }
  } catch (error) {
    ElMessage.error('頭像上傳失敗，請重試')
    console.error('上傳失敗:', error)
  }
}
const isChanged = computed(() => {
  // 如果原始数据还没加载好，认为没有变化
  if (!originalFormStr.value) return false
  
  // 将当前的 form 转为字符串，与原始字符串对比
  return JSON.stringify(form) !== originalFormStr.value
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
          originalFormStr.value = JSON.stringify(form)
        } else {
          ElMessage.error(res.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
})

const submit = async () => {
  if (!formRef.value) return
  const fieldsToValidate = []
  if (isPasswordEditing.value) {
    fieldsToValidate.push('password', 'confirmPassword')
  }
  if (isEmailEditing.value) {
    fieldsToValidate.push('email')
  }
  if (isPhoneEditing.value) {
    fieldsToValidate.push('phone')
  }
  try {
    await formRef.value.validateField(fieldsToValidate)
    // 3. 執行保存
    await save()
    originalFormStr.value = JSON.stringify(form)
    ElMessage.success('保存修改成功')

  } catch (error) {
    ElMessage.error('请检查输入的数据是否正确')
  }
}

const save = async () => {
  try {
    form.password = passwordForm.password
    const res = await updateProfile(form)
    if (selectedFile.value) {
      await uploadToServer(selectedFile.value)
    }
    if (res.code === 1) {
      ElMessage.success('用户信息已更新，頁面即將刷新')
      setTimeout(() => {
        location.reload()
      }, 1000)
      const storedStr = localStorage.getItem('login_user')

      if (storedStr) {
        const storedUser: LoginToken = JSON.parse(storedStr)

        storedUser.avatar = form.avatar
        storedUser.username = form.username
        storedUser.email = form.email
        storedUser.id = form.id

        localStorage.setItem('login_user', JSON.stringify(storedUser))
      }
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
      <div class="avatar-wrapper" @click="triggerInput">
        <img :src="form.avatar" class="avatar" />
        <div class="mask">
          <span class="text">更换头像</span>
        </div>
      </div>
      <input
        type="file"
        ref="fileInputRef"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      />
      <h2 class="profile-title">个人资料</h2>

      <el-form
        :model="combinedFormData"
        :rules="rules"
        ref="formRef"
        label-width="80px"
        class="profile-form"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" class="choose-edit">
          <el-input
            v-model="form.email"
            :disabled="!isEmailEditing"
            placeholder="请输入邮箱"
            class="edit"
          />
          <el-button type="primary" @click="handleEditEmail">编辑</el-button>
        </el-form-item>

        <el-form-item label="手机号" class="choose-edit" prop="phone">
          <el-input
            v-model="form.phone"
            :disabled="!isPhoneEditing"
            placeholder="请输入手机号"
            class="edit"
          />
          <el-button type="primary" @click="handleEditPhone">编辑</el-button>
        </el-form-item>

        <el-form-item label="密码" class="choose-edit" prop="password">
          <el-input
            v-model="passwordForm.password"
            :disabled="!isPasswordEditing"
            placeholder="*************"
            class="edit"
          />
          <el-button type="primary" @click="handleEditPassword">编辑</el-button>
        </el-form-item>
        <el-form-item label="确认密码" v-if="isPasswordEditing" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            placeholder="请再次输入你的密码"
            class="edit"
          />
        </el-form-item>

        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submit" :disabled="!isChanged" class="save-btn">保存修改</el-button>
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
  max-width: 600px;
  padding: 20px;
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  align-items: center; /* 水平置中所有子元素 */
  cursor: pointer; /* 设置鼠标悬停时显示手型 */
  position: relative; /* 讓內部的 absolute 元素以這裡為基準 */
  width: 100px;
  margin-left: calc((100% - 100px) / 2);
  height: 100px;
  overflow: hidden; /* 重要：超出圓形的部分隱藏，讓遮罩層也是圓的 */
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%; /* 圓形 */
  object-fit: cover; /* 保持圖片比例，不會變形 */
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  margin-left: calc((100% - 100px) / 2);
  border-radius: 50%; /* 圓形 */
  width: 100px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 深色半透明背景 */
  display: flex; /* 使用 Flex 讓文字垂直水平置中 */
  justify-content: center;
  align-items: center;
  opacity: 0; /* 預設完全透明（看不見） */
  transition: opacity 0.3s ease; /* 增加過渡動畫，讓效果更滑順 */
}

/* 4. 文字設定 */
.text {
  color: #fff; /* 白色文字 */
  font-size: 14px;
  font-weight: bold;
}

/* 5. 互動效果：滑鼠移入容器時，顯示遮罩 */
.avatar-wrapper:hover .mask {
  opacity: 1; /* 變為不透明（顯示） */
}

.profile-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-weight: 500;
}

.choose-edit {
  display: flex;
  flex-direction: row;
}
.edit {
  padding-right: 3%;
  width: 87%;
}

.profile-form {
  margin-top: 20px;
}

.save-btn {
  width: 100%;
}
</style>
