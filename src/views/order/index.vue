<script setup lang="ts">
import { DeleteOrderApi, OrderApi } from '@/api/order';
import type { Order } from '@/api/types';
import { ElMessage, type CollapseModelValue } from 'element-plus';
import type { el } from 'element-plus/es/locales.mjs';
import { onMounted, reactive, ref } from 'vue';

const dialogVisible = ref(false)
const activeNames = ref<string[]>([]);
const handleChange = (val: CollapseModelValue) => {
  console.log(val)
}


const orders = ref<Order[]>([
  {
    order_id: "ORD-20251216-0001",
    status: 1, // 假设 1 代表 "已完成"
    create_time: "2025-12-16 10:30:00",
    address: "北京市海淀区中关村大街1号",
    total_price: 59.00,
    books: [
      {
        book_id: 101,
        title: "深入浅出 Vue.js",
        quantity: 1,
        price: 59.00
      }
    ]
  },
  {
    order_id: "ORD-20251216-0002",
    status: 0, // 假设 0 代表 "待支付"
    create_time: "2025-12-16 14:15:20",
    address: "上海市浦东新区陆家嘴环路",
    total_price: 188.00,
    books: [
      {
        book_id: 102,
        title: "TypeScript 编程实战",
        quantity: 1,
        price: 89.00
      },
      {
        book_id: 103,
        title: "CSS 揭秘",
        quantity: 2,
        price: 49.50
      }
    ]
  },
  {
    order_id: "ORD-20251215-9999",
    status: -1, // 假设 -1 代表 "已取消"
    create_time: "2025-12-15 09:00:00",
    address: "广州市天河区珠江新城",
    total_price: 299.70,
    books: [
      {
        book_id: 104,
        title: "JavaScript 高级程序设计",
        quantity: 3,
        price: 99.90
      }
    ]
  }
])

const returnbook = () => {
  ElMessage.success('归还成功')
  setTimeout(() => {
    location.reload()
  }, 1000)
}
const renewbook = () => {
  ElMessage.success('续借成功')
}
const openbook = (orderId:string) => {
  const index = activeNames.value.indexOf(orderId);
  if (index > -1) {
    activeNames.value.splice(index, 1); // 如果已存在则移除（收起）
  } else {
    activeNames.value.push(orderId);    // 如果不存在则添加（展开）
  } 
}
const deletebook = async (key: string) => {

  const res = await DeleteOrderApi(key)
  if (res.code !== 1) {
    ElMessage.error(res.message || '删除订单失败')
    return
  }
  ElMessage.success('删除订单成功')
  setTimeout(() => {
    location.reload()
  }, 1000)
}


onMounted(async () => {
  const loginUserStr = localStorage.getItem('login_user')
  if (loginUserStr) {
    const loginUser = JSON.parse(loginUserStr)
    if (loginUser && loginUser.id) {
      try {
        const res = await OrderApi(loginUser.id)
        if (res.code === 1) {
          console.log('用户信息：', res.data)
          orders.value = res.data
        } else {
          ElMessage.error(res.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
//  const orders= await OrderApi()
})

</script>


<template>
  <div class="order">
    <div class="order-header">
      <!-- <span class="selected-count">已加载??个订单</span> -->
    </div>

    <el-card class="cart-container">
      <!-- 表头 -->
      <template #header>
        <el-row :gutter="24" align="middle">
          <el-col :span="2"></el-col>
          <!-- <el-col :span="10">图书</el-col> -->
          <el-col :span="10">订单</el-col>
          <el-col class="head-label" :span="3">金额</el-col>
          <el-col class="head-label" :span="3">状态</el-col>
          <el-col class="head-label" :span="3">操作</el-col>
          <el-col class="head-label" :span="3">创建时间</el-col>
        </el-row>
      </template>
      <div class="order-items">
        <el-card
          v-for="order in orders"
          :key="order.order_id"
          class="order-item"
          style="margin-bottom: 20px;"
          >
          <el-row>
            <el-col class="order-info" :span="12">
              <div v-if="order.books && order.books.length > 0" style="display: flex; align-items: center;">
          
                <div style="margin-right: 15px;">
                  <el-image 
                    style="width: 60px; height: 80px; border-radius: 4px;"
                    src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
                    fit="cover"
                  />
                </div>

                <div>
                  <h4 style="margin: 0 0 5px 0; font-size: 15px;">
                    {{ order.books[0]?.title }}
                  </h4>
                  <div style="font-size: 13px; color: #666;">
                    <span v-if="order.books.length > 1" style="color: #409EFF; margin-right: 10px;">
                      [等{{ order.books.length }}件商品]
                    </span>
                    <span>单价: ¥{{ order.books[0]?.price }}</span>
                    <span style="margin-left: 10px;">x{{ order.books[0]?.quantity }}</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col class="order-total" :span="3"> 
              ¥{{ order.total_price }}
            </el-col>
            <el-col class="order-staus" :span="3">
              <!-- <span>截止归还日期为：2025-10-31</span> -->
              <span>{{order.status}}</span>
            </el-col>
            <el-col class="order-opera" :span="3">
<!--               <el-button type="primary" class="return" @click="deletebook(order.order_id)"> 归还 </el-button>
              <el-button type="primary" class="renew"> 续借 </el-button> -->
              <el-button type="primary" class="open" @click="openbook(order.order_id)"> 订单详情 </el-button>
              <el-button type="primary" class="delete" @click="deletebook"> 删除订单 </el-button>
            </el-col>
            <el-col class="order-time" :span="3">
              <span>{{ order.create_time }}</span>
            </el-col>
          </el-row>
          <el-collapse v-model="activeNames" @change="handleChange" v-if="order.books.length>1">
            <el-collapse-item title="查看详情" :name="order.order_id">
              <div 
                v-for="book in order.books.slice(1)" 
                :key="book.book_id"
                style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;"
              >
                <el-image 
                  style="width: 50px; height: 60px; margin-right: 15px; border-radius: 2px;"
                  src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
                  fit="cover"
                />
                
                <div style="flex: 1;">
                  <div style="font-size: 14px;">{{ book.title }}</div>
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    ¥{{ book.price }} × {{ book.quantity }}
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>


      </div>
    </el-card>
  </div>
</template>

<style scoped>
.order {
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

.order-header{
  margin-bottom: 20px;
}

.order-total , .order-staus , .order-time{
  text-align: center;
}

.open{
  margin-left: 12px;
  margin-right: 15px;
}
.head-label{
  text-align: center;
  font-weight: bold;
}

.delete{
  margin-top: 10px;
  margin-right: 15px;
}

.order-opera {
  display: flex;
  flex-direction: column;
}

/* 使用 :deep() 穿透修改 element-plus 内部样式 */
.reverse-collapse {
  /* 开启 flex 布局 */
  display: flex;
  /* 关键属性：垂直反转，让 Header 跑到 Wrap (内容) 的下面 */
  flex-direction: column-reverse;
}
:deep(.el-collapse-item) {
  /* 开启 flex 布局 */
  display: flex;
  /* 关键属性：垂直反转，让 Header 跑到 Wrap (内容) 的下面 */
  flex-direction: column-reverse;  
}
/* 优化边框样式（可选） */
/* 因为反转后，标题在下面，原本标题的下边框可能看起来会怪，这里做一下微调 */
.reverse-collapse {
  /* 这里可以根据你的设计需求调整边框，
     例如：因为标题跑下面去了，可能需要把原本底部的边框去掉，或者加一个上边框来分隔内容 */
  border-bottom: none; 
  border-top: 1px solid #ebeef5; /* 只有展开时，内容和标题之间才需要分隔线 */
}
 :deep(.el-collapse-item__header){
   border-bottom: none; 
  border-top: 1px solid #ebeef5; /* 只有展开时，内容和标题之间才需要分隔线 */ 
 }
/* 如果你希望内容部分没有底边框，可以把这行加上 */
.reverse-collapse {
  border-bottom: none;
}
:deep(.el-collapse-item__wrap){
  border-bottom: none;
}

.cover-uploader{
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
:deep(.el-upload){
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);  
}
.cover-uploader  {
  border-color: var(--el-color-primary);
}
:deep(.el-upload:hover){
  border-color: var(--el-color-primary);
}
.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;  /* 封面图宽 */
  height: 140px; /* 封面图高，模拟书本比例 */
  line-height: 140px;
  text-align: center;
}

.cover-image {
  width: 100px;
  height: 140px;
  display: block;
  object-fit: cover; /* 保持图片比例填充 */
}
</style>
