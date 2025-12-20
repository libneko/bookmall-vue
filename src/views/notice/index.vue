<script setup lang="ts">
import type { Notice } from '@/api/types';
import { ElMessage, type ElCard } from 'element-plus';
import type { el } from 'element-plus/es/locales.mjs';
import { reactive, ref } from 'vue';



const notices = ref<Notice[]>([
{
    "id": "1001",
    "content": "服务器将于本周日凌晨 2:00 进行例行维护，预计持续 2 小时，期间部分服务可能无法访问。",
    "status": 0,
    "create_time": "2025-12-18T09:00:00Z",
  },
  {
    "id": "1002",
    "content": "你提交的 PR #152 (feat: 优化通知列表样式) 已被管理员合并至 main 分支。",
    "status": 1,
    "create_time": "2025-12-17T15:30:45Z",
  },
  {
    "id": "1003",
    "content": "用户 @Gemini 在你的评论下回复了：'这个接口设计的非常全面，感谢分享！'",
    "status": 1,
    "create_time": "2025-12-18T10:15:00Z",
	},
	{
    "id": "1006",
    "content": "测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度",
    "status": 0,
    "create_time": "2025-12-18T04:00:12Z",

	},
  {
    "id": "1004",
    "content": "检测到你的账号在异地（上海）登录，如果不是本人操作，请及时修改密码。",
    "status": 0,
    "create_time": "2025-12-18T04:00:12Z",
	},
	{
    "id": "1005",
    "content": "测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度测试长度",
    "status": 0,
    "create_time": "2025-12-18T04:00:12Z",

	}
]);
const expandedStates = reactive<Record<string | number, boolean>>({});

const handleMarkAsRead = async (notice: Notice) => {
  try {
    // 1. (可选) 调用 API 接口更新数据库
    // await api.updateNoticeStatus(notice.id, 1)

    // 2. 更新本地响应式数据
    notice.status = 1

    ElMessage.success('已标记为已读')
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

const handleMarkAsnoRead = async (notice: Notice) => {
  try {
    // 1. (可选) 调用 API 接口更新数据库
    // await api.updateNoticeStatus(notice.id, 1)

    // 2. 更新本地响应式数据
    notice.status = 0

    ElMessage.success('已标记为未读')
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

const toggleExpand = (id:string) => {
  // 如果当前是 true 则变 false，反之亦然
  expandedStates[id] = !expandedStates[id];
};



</script>

<template>
  <div class="notice">
		<div class="notice-header">
			<!-- <span class="selected-count">已加载??个订单</span> -->
		</div>

		<el-card class="cart-container">
			<!-- 表头 -->
			<template #header>
				<el-row :gutter="24" align="middle">

				<el-col :span="15">通知</el-col>
				<el-col class="head-label" :span="3">状态</el-col>
				<el-col class="head-label" :span="3">操作</el-col>
				<el-col class="head-label" :span="3">接收时间</el-col>
				</el-row>
			</template>
			<div class="notice-item">
				<el-card
					v-for="notice in notices"
					:key="notice.id"
					class="notice-card"
				>
					<el-row :gutter="24" align="middle">

						<el-col :span="15">
							<div :class="['expand-wrapper', { 'is-expanded': expandedStates[notice.id] }]">
								<div class="notice-content">
									{{ notice.content }}
								</div>
							</div>
						</el-col>
            <el-col class="notice-status" :span="3" style="">
              <el-tag :type="notice.status === 1 ? 'success' : 'warning'">
                {{ notice.status === 1 ? '已读' : '未读' }}
              </el-tag>
            </el-col>
						<el-col class="head-label" :span="3">
							<el-button type="primary" class="button" @click="toggleExpand(notice.id)" >
								{{ expandedStates[notice.id] ? '收起详情' : '查看详情' }}
							</el-button>
							<el-button type="primary" class="button" :disabled="notice.status === 1" @click="handleMarkAsRead(notice)">设为已读</el-button>
              <el-button type="primary" class="button" :disabled="notice.status === 0" @click="handleMarkAsnoRead(notice)">设为未读</el-button>
						</el-col>
						<el-col class="head-label" :span="3">{{ notice.create_time }}</el-col>
					</el-row>
				</el-card>
			</div>
		</el-card>
  </div>
</template>

<style scoped>
.notice {
  max-width: 80%;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: 100vh;
}
.cart-container {
  margin-bottom: 100px;
  padding-bottom: 20px;
}

.notice-header{
  margin-bottom: 20px;
}

.notice-total , .notice-staus , .notice-time{
  text-align: center;
}
.expand-wrapper {
  display: grid;
  grid-template-rows: 1fr; /* 初始状态 */
  transition: grid-template-rows 0.8s ease;
}

.notice-content {
  line-height: 1.6;
  overflow: hidden;
  transition: max-height 0.8s ease-in-out, opacity 0.2s ease;
  max-height: 4.8em;

  opacity: 0.9;

}

.is-expanded .notice-content {
/* 展开状态 */
  display: block; /* 切换为块级以支撑高度 */
  /* 设置一个肯定超过内容的足够大的值 */
  /* 注意：这个值不能设得过于离谱（如 10000px），否则动画会显得过快 */
  max-height: 700px;
  opacity: 1;

}
.head-label{
  text-align: center;
  font-weight: bold;
}

.button{
  margin-left: 12px;
  margin-right: 15px;
  margin-bottom: 12px;
}
.notice-card {
  margin-bottom: 15px; /* 卡片之间的间距 */
  transition: all 0.3s;
}
.notice-card:hover {
  transform: translateY(-2px); /* 悬浮时的微动效 */
}
.notice-status{
  text-align: center;
}

</style>