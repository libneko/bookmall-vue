<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Search, Plus, Edit, Delete } from '@element-plus/icons-vue'

// 定义用户类型 - 所有属性都是必需的
interface UserItem {
  id: number
  username: string
  name: string
  gender: 'male' | 'female'
  email: string
  phone: string
  idCard: string
  status: 'active' | 'inactive'
  createTime: string
  selected: boolean
}

// 响应式数据
const loading = ref(false)
const userList = ref<UserItem[]>([])
const searchKeyword = ref('')
const showAddUserDialog = ref(false)
const showEditUserDialog = ref(false)
const currentEditUser = ref<UserItem | null>(null)

// 分页信息
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 表单数据
const newUserForm = ref({
  username: '',
  name: '',
  gender: 'male' as 'male' | 'female',
  email: '',
  phone: '',
  idCard: '',
})

const editUserForm = ref({
  username: '',
  name: '',
  gender: 'male' as 'male' | 'female',
  email: '',
  phone: '',
  idCard: '',
  status: 'active' as 'active' | 'inactive',
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2到20个字符', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在2到10个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '请输入正确的身份证号码', trigger: 'blur' },
  ],
}

// 计算属性
const selectedCount = computed(() => {
  return userList.value.filter((user) => user.selected).length
})

const selectAll = computed({
  get: () => userList.value.length > 0 && userList.value.every((user) => user.selected),
  set: (value: boolean) => {
    userList.value.forEach((user) => {
      user.selected = value
    })
  },
})

const isIndeterminate = computed(() => {
  const selectedCount = userList.value.filter((user) => user.selected).length
  return selectedCount > 0 && selectedCount < userList.value.length
})

const filteredUsers = computed(() => {
  if (!searchKeyword.value.trim()) {
    return userList.value
  }

  const keyword = searchKeyword.value.toLowerCase()
  return userList.value.filter(
    (user) =>
      user.username.toLowerCase().includes(keyword) ||
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.phone.includes(keyword) ||
      user.idCard.includes(keyword),
  )
})

const activeUserCount = computed(() => {
  return userList.value.filter((user) => user.status === 'active').length
})

// 方法定义
const fetchUserData = async () => {
  loading.value = true
  try {
    // 模拟API调用数据
    const mockData: UserItem[] = [
      {
        id: 1,
        username: 'zhangsan',
        name: '张三',
        gender: 'male',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        idCard: '110101199001011234',
        status: 'active',
        createTime: '2024-01-15 10:30:00',
        selected: false,
      },
      {
        id: 2,
        username: 'lisi',
        name: '李四',
        gender: 'male',
        email: 'lisi@example.com',
        phone: '13800138002',
        idCard: '110101199002022345',
        status: 'active',
        createTime: '2024-02-20 14:20:00',
        selected: false,
      },
      {
        id: 3,
        username: 'wangwu',
        name: '王五',
        gender: 'female',
        email: 'wangwu@example.com',
        phone: '13800138003',
        idCard: '110101199003033456',
        status: 'inactive',
        createTime: '2024-03-10 09:00:00',
        selected: false,
      },
    ]

    userList.value = mockData
    pagination.value.total = mockData.length
    ElMessage.success(`成功加载 ${mockData.length} 名用户`)
  } catch (error) {
    console.error('获取用户数据失败:', error)
    ElMessage.error('网络错误，请稍后重试')
    userList.value = []
  } finally {
    loading.value = false
  }
}

const handleSelectAllChange = (value: boolean) => {
  userList.value.forEach((user) => {
    user.selected = value
  })
}

const handleUserSelectChange = () => {
  // 选择状态变化逻辑可以由计算属性自动处理
}

const getGenderText = (gender: string): string => {
  const genderMap: { [key: string]: string } = {
    male: '男',
    female: '女',
  }
  return genderMap[gender] || '未知'
}

const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    active: '启用',
    inactive: '禁用',
  }
  return statusMap[status] || '未知'
}

const updateUserStatus = async (user: UserItem, status: 'active' | 'inactive') => {
  try {
    user.status = status
    ElMessage.success(`已${getStatusText(status)}用户 ${user.name}`)
  } catch (error) {
    console.error('更新用户状态失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

const deleteUser = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    userList.value = userList.value.filter((user) => user.id !== id)
    ElMessage.success('用户删除成功')
  } catch {
    ElMessage.info('已取消删除')
  }
}

const batchDeleteUsers = async () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedCount.value} 名用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    userList.value = userList.value.filter((user) => !user.selected)
    ElMessage.success(`成功删除 ${selectedCount.value} 名用户`)
  } catch {
    ElMessage.info('已取消删除操作')
  }
}

const resetPassword = async (user: UserItem) => {
  try {
    await ElMessageBox.confirm(`确定要重置用户 ${user.name} 的密码吗？`, '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    ElMessage.success(`已发送密码重置链接到 ${user.email}`)
  } catch {
    ElMessage.info('已取消重置密码')
  }
}

const openAddUserDialog = () => {
  newUserForm.value = {
    username: '',
    name: '',
    gender: 'male',
    email: '',
    phone: '',
    idCard: '',
  }
  showAddUserDialog.value = true
}

const addUser = async () => {
  try {
    // 修复id生成逻辑，确保id始终是number类型
    const maxId = userList.value.length > 0 ? Math.max(...userList.value.map((u) => u.id)) : 0
    const newId = maxId + 1

    const newUser: UserItem = {
      id: newId,
      username: newUserForm.value.username,
      name: newUserForm.value.name,
      gender: newUserForm.value.gender,
      email: newUserForm.value.email,
      phone: newUserForm.value.phone,
      idCard: newUserForm.value.idCard,
      status: 'active',
      createTime: new Date().toLocaleString(),
      selected: false,
    }

    userList.value.push(newUser)
    showAddUserDialog.value = false
    ElMessage.success('用户添加成功')
  } catch (error) {
    console.error('添加用户失败:', error)
    ElMessage.error('添加用户失败，请稍后重试')
  }
}

const openEditUserDialog = (user: UserItem) => {
  currentEditUser.value = user
  editUserForm.value = {
    username: user.username,
    name: user.name,
    gender: user.gender,
    email: user.email,
    phone: user.phone,
    idCard: user.idCard,
    status: user.status,
  }
  showEditUserDialog.value = true
}

const editUser = async () => {
  if (!currentEditUser.value) return

  try {
    const userIndex = userList.value.findIndex((user) => user.id === currentEditUser.value!.id)
    if (userIndex >= 0) {
      //   userList.value[userIndex]
      //   userList.value[userIndex] = {
      //     //     ...userList.value[userIndex],
      //     id: 1,
      //     username: editUserForm.value.username,
      //     name: editUserForm.value.name,
      //     gender: editUserForm.value.gender,
      //     email: editUserForm.value.email,
      //     phone: editUserForm.value.phone,
      //     idCard: editUserForm.value.idCard,
      //     status: editUserForm.value.status,
      //   }
    }

    showEditUserDialog.value = false
    currentEditUser.value = null
    ElMessage.success('用户信息更新成功')
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage.error('更新用户信息失败，请稍后重试')
  }
}

const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.currentPage = 1
  fetchUserData()
}

const handleCurrentChange = (newPage: number) => {
  pagination.value.currentPage = newPage
  fetchUserData()
}

const formatIdCard = (idCard: string) => {
  if (idCard.length !== 18) return idCard
  return `${idCard.substring(0, 6)}******${idCard.substring(14)}`
}

// 生命周期
onMounted(() => {
  console.log('用户管理组件已加载')
  fetchUserData()
})
</script>

<template>
  <div class="user-management">
    <!-- 顶部标题栏 -->
    <div class="management-header">
      <h2>用户管理系统</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openAddUserDialog">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
        <el-button type="danger" :disabled="selectedCount === 0" @click="batchDeleteUsers">
          批量删除 ({{ selectedCount }})
        </el-button>
        <span class="selected-count">已选 {{ selectedCount }} 名用户</span>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名、姓名、邮箱、手机号或身份证号..."
        clearable
        style="width: 300px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div class="stats">
        <span>总计: {{ userList.length }} 人</span>
        <span>活跃: {{ activeUserCount }} 人</span>
      </div>
    </div>

    <!-- 用户管理内容区域 -->
    <el-card class="management-container">
      <!-- 表头 -->
      <div class="management-head">
        <el-checkbox
          v-model="selectAll"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllChange"
        >
          全选
        </el-checkbox>
        <span class="head-label">用户信息</span>
        <span class="head-label">联系方式</span>
        <span class="head-label">身份证号</span>
        <span class="head-label">状态</span>
        <span class="head-label">操作</span>
      </div>

      <!-- 用户列表 -->
      <div class="user-list">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-item"
          :class="{ selected: user.selected }"
        >
          <div class="user-content">
            <!-- 选择框 -->
            <div class="user-select">
              <el-checkbox v-model="user.selected" @change="handleUserSelectChange" />
            </div>

            <!-- 用户信息 -->
            <div class="user-info">
              <el-avatar :size="50" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>

              <div class="user-details">
                <h4 class="username">{{ user.name }}</h4>
                <div class="user-meta">
                  <span class="username-id">@{{ user.username }}</span>
                  <el-tag :type="user.gender === 'male' ? 'primary' : 'danger'" size="small">
                    {{ getGenderText(user.gender) }}
                  </el-tag>
                </div>
                <div class="create-time">注册时间: {{ user.createTime }}</div>
              </div>
            </div>

            <!-- 联系方式 -->
            <div class="contact-info">
              <div class="email">{{ user.email }}</div>
              <div class="phone">{{ user.phone }}</div>
            </div>

            <!-- 身份证号 -->
            <div class="id-card-info">
              <div class="id-card">{{ formatIdCard(user.idCard) }}</div>
            </div>

            <!-- 状态 -->
            <div class="status-info">
              <el-tag :type="user.status === 'active' ? 'success' : 'info'" effect="light">
                {{ getStatusText(user.status) }}
              </el-tag>
            </div>

            <!-- 操作按钮 -->
            <div class="user-actions">
              <el-button link type="primary" size="small" @click="openEditUserDialog(user)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="primary" size="small" @click="resetPassword(user)">
                重置密码
              </el-button>
              <el-button
                link
                :type="user.status === 'active' ? 'warning' : 'success'"
                size="small"
                @click="updateUserStatus(user, user.status === 'active' ? 'inactive' : 'active')"
              >
                {{ user.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" size="small" @click="deleteUser(user.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空数据状态 -->
      <div v-if="userList.length === 0 && !loading" class="empty-data">
        <el-empty description="暂无用户数据">
          <el-button type="primary" @click="openAddUserDialog">添加用户</el-button>
        </el-empty>
      </div>

      <!-- 搜索无结果状态 -->
      <div v-if="searchKeyword && filteredUsers.length === 0" class="no-results">
        <el-empty description="未找到匹配的用户">
          <el-button @click="searchKeyword = ''">清空搜索</el-button>
        </el-empty>
      </div>

      <!-- 分页组件 -->
      <div v-if="userList.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog v-model="showAddUserDialog" title="添加新用户" width="500px">
      <el-form :model="newUserForm" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newUserForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="newUserForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="newUserForm.gender">
            <el-radio label="男" value="male" />
            <el-radio label="女" value="female" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newUserForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="newUserForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="newUserForm.idCard" placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddUserDialog = false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="showEditUserDialog" title="编辑用户" width="500px">
      <el-form :model="editUserForm" :rules="formRules" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editUserForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editUserForm.gender">
            <el-radio label="男" value="male" />
            <el-radio label="女" value="female" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editUserForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="editUserForm.idCard" placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editUserForm.status">
            <el-radio label="启用" value="active" />
            <el-radio label="禁用" value="inactive" />
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditUserDialog = false">取消</el-button>
        <el-button type="primary" @click="editUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 底部统计栏 -->
    <el-affix position="bottom" :offset="0" target=".user-management" v-if="userList.length > 0">
      <div class="management-footer-affix">
        <div class="footer-content">
          <div class="footer-left">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAllChange"
            >
              全选
            </el-checkbox>
            <el-button link type="danger" @click="batchDeleteUsers" :disabled="selectedCount === 0">
              批量删除 ({{ selectedCount }})
            </el-button>
          </div>

          <div class="footer-right">
            <div class="summary">
              <span>已选 {{ selectedCount }} 名用户，</span>
              <span>活跃用户: {{ activeUserCount }} 人</span>
            </div>
          </div>
        </div>
      </div>
    </el-affix>
  </div>
</template>

<style scoped>
.user-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: 100vh;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.management-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-count {
  color: #666;
  font-size: 14px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.management-container {
  margin-bottom: 100px;
  padding-bottom: 20px;
}

.management-head {
  display: grid;
  grid-template-columns: 60px 1fr 200px 150px 100px 150px;
  gap: 15px;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  align-items: center;
  font-weight: 500;
  color: #333;
}

.head-label {
  text-align: center;
}

.head-label:first-of-type {
  text-align: left;
}

.user-list {
  background-color: #fff;
}

.user-item {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.user-item:hover {
  background-color: #fafafa;
}

.user-item.selected {
  background-color: #f0f7ff;
}

.user-content {
  display: grid;
  grid-template-columns: 60px 1fr 200px 150px 100px 150px;
  gap: 15px;
  padding: 20px;
  align-items: center;
}

.user-select {
  display: flex;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.user-avatar {
  background-color: #409eff;
}

.user-details {
  flex: 1;
}

.username {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-meta {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.username-id {
  color: #666;
  font-size: 12px;
}

.create-time {
  font-size: 12px;
  color: #999;
}

.contact-info {
  text-align: left;
}

.email,
.phone {
  margin-bottom: 4px;
  font-size: 14px;
}

.id-card-info {
  text-align: center;
}

.id-card {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.status-info {
  text-align: center;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.empty-data,
.no-results {
  padding: 60px 0;
  text-align: center;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}

/* 底部悬浮栏样式 */
.management-footer-affix {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.summary {
  text-align: right;
  font-size: 14px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-management {
    padding: 10px;
  }

  .management-container {
    margin-bottom: 120px;
  }

  .management-head {
    grid-template-columns: 40px 1fr;
    gap: 10px;
  }

  .head-label:not(:first-child) {
    display: none;
  }

  .user-content {
    grid-template-columns: 40px 1fr;
    gap: 10px;
    position: relative;
    padding: 15px 10px;
  }

  .contact-info,
  .id-card-info,
  .status-info,
  .user-actions {
    grid-column: 2;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    border-top: 1px solid #f0f0f0;
  }

  .user-actions {
    border: none;
    justify-content: flex-start;
    gap: 15px;
  }

  .footer-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding: 12px 15px;
  }

  .footer-left {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
    width: 100%;
  }

  .summary {
    text-align: center;
    width: 100%;
  }
}
</style>
