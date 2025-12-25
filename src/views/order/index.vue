<script setup lang="ts">
import { CompleteOrderApi, DeleteOrderApi, getOrder, payOrderApi } from '@/api/order'
import type { Order, SendOrder } from '@/api/types'
import { ElMessage, ElMessageBox, type CollapseModelValue } from 'element-plus'
import type { el } from 'element-plus/es/locales.mjs'
import { onMounted, reactive, ref, watch } from 'vue'

const dialogVisible = ref(false)
const currentPage = ref('1') // 当前页码
const pageSize = ref('5') // 每页显示数量 (设小一点方便看效果)
const searchQuery = ref('')
const total = ref(0)
const payDialogVisible = ref(false);
const payingOrder = ref<Order | null>(null);
const payType = ref(1); // 1: 微信, 2: 支付宝
const currentOrder = ref<Order | null>(null); // 存储当前点击的订单数据
const activeNames = ref<string[]>([])
let timer: any = null


const statusOptions = [
  { value: 1, label: '待付款', type: 'warning' },
  { value: 2, label: '已付款', type: 'primary' },
  { value: 3, label: '已发货', type: 'success' },
  { value: 4, label: '已完成', type: 'success' },
  { value: 5, label: '已取消', type: 'info' }
];
const handleChange = (val: CollapseModelValue) => {
  console.log(val)
}

const handleCurrentChange = (val: number) => {
  console.log(`当前页: ${val}`)
  // 可以在这里加一行代码让页面滚动回顶部
  fetchOrders() // 重新向后端拿数据
  window.scrollTo(0, 0)
}
const handleSizeChange = (val: string) => {
  console.log(`每页 ${val} 条`)
  pageSize.value = val
  currentPage.value = '1' // 改变每页大小时，建议重置回第一页
  fetchOrders() 
}



const orders = ref<Order[]>([
{
    id: 101,
    number: "202310240001",
    status: 1, // 假设 1 为待付款
    userId: 1,
    addressBookId: 10,
    orderTime: "2023-10-24 10:00:00",
    checkoutTime: "",
    payMethod: 1, // 微信支付
    payStatus: 0, // 未支付
    amount: 158.50,
    userName: "张三",
    phone: "13800138000",
    consignee: "张三",
    cancelTime: "",
    estimatedDeliveryTime: "",
    deliverTime: "",
    shippingFee: 10.00,
    orderBooks: "《深入浅出Vue.js》等2件商品",
    orderDetailList: [
      {
        id: 501,
        name: "深入浅出Vue.js",
        orderId: 101,
        bookId: 201,
        number: 1,
        amount: 89.00,
        image: "https://picsum.photos/200/300?random=1"
      },
      {
        id: 502,
        name: "前端性能优化指南",
        orderId: 101,
        bookId: 205,
        number: 1,
        amount: 59.50,
        image: "https://picsum.photos/200/300?random=2"
      }
    ]
  },
  {
    id: 102,
    number: "202310240005",
    status: 3, // 假设 3 为已发货/待收货
    userId: 1,
    addressBookId: 10,
    orderTime: "2023-10-23 14:20:00",
    checkoutTime: "2023-10-23 14:22:15",
    payMethod: 2, // 支付宝
    payStatus: 1, // 已支付
    amount: 45.00,
    userName: "张三",
    phone: "13800138000",
    consignee: "张三",
    cancelTime: "",
    estimatedDeliveryTime: "2023-10-25 18:00:00",
    deliverTime: "2023-10-24 09:00:00",
    shippingFee: 0.00,
    orderBooks: "《TypeScript进阶》",
    orderDetailList: [
      {
        id: 503,
        name: "TypeScript进阶",
        orderId: 102,
        bookId: 305,
        number: 1,
        amount: 45.00,
        image: "https://picsum.photos/200/300?random=3"
      }
    ]
  },
  {
    id: 103,
    number: "202310200088",
    status: 5, // 假设 5 为已取消
    userId: 1,
    addressBookId: 12,
    orderTime: "2023-10-20 08:00:00",
    checkoutTime: "",
    payMethod: 1,
    payStatus: 0,
    amount: 120.00,
    userName: "张三",
    phone: "13800138000",
    consignee: "李四",
    cancelTime: "2023-10-20 08:30:00",
    estimatedDeliveryTime: "",
    deliverTime: "",
    shippingFee: 6.00,
    orderBooks: "《算法图解》",
    orderDetailList: [
      {
        id: 504,
        name: "算法图解",
        orderId: 103,
        bookId: 401,
        number: 2,
        amount: 60.00,
        image: "https://picsum.photos/200/300?random=4"
      }
    ]
  } 
])


const open_order = (orderId: number) => {
  const targetOrder = orders.value.find(item => item.id === orderId);
  if (targetOrder) {
    currentOrder.value = targetOrder; // 设置当前订单
    dialogVisible.value = true;       // 打开弹窗
  } else {
    ElMessage.error('未找到订单数据');
  }
}
const formatStatus = (status: number) => {
  switch (status) {
    case 1:
      return { label: '待付款', type: 'warning' };
    case 2:
      return { label: '已付款', type: 'primary' };
    case 3:
      return { label: '已发货', type: 'success' };
    case 4:
      return { label: '已完成', type: 'success' };
    case 5:
      return { label: '已取消', type: 'info' };
    default:
      return { label: '未知状态', type: 'info' };
  }
};
const updateOrderStatus = (order: Order, targetStatus: number) => {
  const isDelivery = targetStatus === 3;
  const actionName = targetStatus === 3 ? '发货' : '完成';
  
  // 1. 二次确认弹窗
  ElMessageBox.confirm(
    `确认将订单 "${order.number}" 标记为【已${actionName}】吗？`,
    `${actionName}确认`,
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: isDelivery ? 'primary' : 'success', // 发货用蓝色，完成用绿色
    }
  )
    .then(async () => {
      // 2. 模拟调用后端接口成功
      // 在这里发送 axios 请求，例如: await api.shipOrder(order.id)
      const res = await CompleteOrderApi(String(order.id));
   
      // 3. 更新本地视图数据

      // 4. 如果是发货，通常会更新发货时间
/*       if (targetStatus === 3) {
        order.deliverTime = new Date().toLocaleString().replace(/\//g, "-"); 
      } */
      if (res.code === 1) {
        ElMessage.success(`订单已成功${actionName}`);
      }
      else {
        ElMessage.error('操作失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作');
    });
};
const confirmPayment = async () => {
  // 实际开发中，这里通常是轮询查询后端支付状态，或者用户点击“我已支付”后刷新列表
  // 这里模拟支付成功
  const res = await payOrderApi({
    orderNumber: payingOrder.value?.number || '',
    payMethod: payType.value
  })


  if (res.code === 1) {
    setTimeout(async () => {
      // 模拟后端处理时间
      await fetchOrders(); // 刷新订单列表
    }, 500);
    ElMessage.success(`订单 ${payingOrder.value?.number} 支付成功！`);
    payDialogVisible.value = false;
  }
};


const handlePay = (order: Order) => {
  payingOrder.value = order;
  payType.value = order.payMethod || 1; // 默认选中订单原有的支付方式，或者微信
  payDialogVisible.value = true;
};

const delete_order= async (key: Order) => {
  const res = await DeleteOrderApi(String(key.id))
  if (res.code !== 1) {
    ElMessage.error(res.message || '取消订单失败')
    return
  }
  ElMessage.success('取消订单成功')
  setTimeout(() => {
    location.reload()
  }, 1000)
}
const fetchOrders = async() => {
  const params: SendOrder = {
    page: currentPage.value,
    pageSize: pageSize.value,
    status:''
  }

  try {
    const res = await getOrder(params)
    console.log('获取订单数据:', res)
    if (res.code === 1) {
      orders.value = res.data.order
      total.value = res.data.total
    }
  } catch (error) {
    
  }


}

watch(searchQuery, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    currentPage.value = '1'
    fetchOrders()
  }, 500) // 用户停止输入 500ms 后才发请求
})

onMounted(async () => {
  await fetchOrders()
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
          :key="order.id"
          class="order-item"
          style="margin-bottom: 20px"
        >
          <template #header>
            <div class="order-id-header">
              <span>订单号：{{ order.number }}</span>
            </div>
          </template>        
          <el-row align="middle">
            <el-col class="order-info" :span="12">
              <div
                v-if="order.orderDetailList && order.orderDetailList.length > 0"
                style="display: flex; align-items: center"
              >
                <div style="margin-right: 15px">
                  <el-image
                    style="width: 60px; height: 80px; border-radius: 4px"
                    :src="order.orderDetailList[0]?.image"
                    :preview-src-list="[order.orderDetailList[0]?.image]"
                    fit="cover"
                  />
                </div>

                <div>
                  <h4 style="margin: 0 0 5px 0; font-size: 15px">
                    {{ order.orderDetailList[0]?.name }}
                  </h4>
                  <div style="font-size: 13px; color: #666">
                    <span v-if="order.orderDetailList.length > 1" style="color: #409eff; margin-right: 10px">
                      [等{{ order.orderDetailList.length }}件商品]
                    </span>
                    <span>单价: ¥{{ order.orderDetailList[0]?.amount }}</span>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col class="order-total" :span="3">
              <span style="color: #f56c6c; font-weight: bold;">¥{{ order.amount.toFixed(2) }}</span>
              <div style="font-size: 12px; color: #999">
                (含运费 ¥{{ order.shippingFee }})
              </div>
            </el-col>
            <el-col class="order-staus" :span="3">
              <el-tag :type="formatStatus(order.status).type">
                {{ formatStatus(order.status).label }}
              </el-tag>
            </el-col>
            <el-col class="order-opera" :span="3">
              <el-button type="primary" class = "button" @click="open_order(order.id)">
                详情
              </el-button>
              <el-button 
                type="success" 
                :disabled="order.status === 5"
                @click="updateOrderStatus(order, 4)"
                class = "button" 
              >
                确认收货
              </el-button>
              <el-button 
                v-if="order.status === 1"
                type="danger" 
                class = "button" 
                @click="handlePay(order)"
              >
                立即支付
              </el-button>
              <el-button 
                type="danger" 
                @click="delete_order(order)"
                class = "button" 
              >
                取消订单
              </el-button>
              
            </el-col>
            <el-col class="order-time" :span="3">
              <span style="font-size: 13px; color: #999;">{{ order.orderTime }}</span>
            </el-col>
          </el-row>
          <el-collapse v-model="activeNames" @change="handleChange" v-if="order.orderDetailList.length > 1">
            <el-collapse-item :title="`查看其余 ${order.orderDetailList.length - 1} 件商品`" :name="order.id">
              <div
                v-for="book in order.orderDetailList.slice(1)"
                :key="book.id"
                style="
                  display: flex;
                  align-items: center;
                  padding: 10px 0;
                  border-bottom: 1px solid #f0f0f0;
                "
              >
                <el-image
                  style="width: 50px; height: 60px; margin-right: 15px; border-radius: 2px"
                  :src="book.image"
                  fit="cover"
                />

                <div style="flex: 1">
                  <div style="font-size: 14px">{{ book.name}}</div>
                  <div style="font-size: 12px; color: #999; margin-top: 4px">
                    ¥{{ book.amount }} × {{ book.number }}
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      
      </div>
    </el-card>
    <el-dialog
      v-model="dialogVisible"
      title="订单详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentOrder">
        <el-steps 
          :active="currentOrder.status" 
          finish-status="success" 
          simple 
          style="margin-bottom: 20px"
        >
          <el-step title="待付款" />
          <el-step title="已付款" />
          <el-step title="已发货" />
          <el-step title="已完成" />
        </el-steps>

        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.number }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.orderTime }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ currentOrder.consignee }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.phone }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ currentOrder.payMethod === 1 ? '微信支付' : '支付宝' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span style="color: #f56c6c; font-weight: bold">¥{{ currentOrder.amount.toFixed(2) }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px">
          <h4 style="margin-bottom: 10px">商品清单</h4>
          <el-table :data="currentOrder.orderDetailList" border stripe size="small">
            <el-table-column label="商品图片" width="80" align="center">
              <template #default="scope">
                <el-image 
                  style="width: 40px; height: 50px" 
                  :src="scope.row.image" 
                  preview-teleported
                />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="书名" show-overflow-tooltip />
            <el-table-column prop="number" label="数量" width="80" align="center" />
            <el-table-column prop="amount" label="单价" width="100" align="right">
              <template #default="scope">¥{{ scope.row.amount }}</template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="right">
              <template #default="scope">
                ¥{{ (scope.row.amount * scope.row.number).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div style="margin-top: 20px" v-if="currentOrder.status >= 3">
           <el-alert title="配送信息" type="info" :closable="false">
             <template #default>
                <div>预计送达：{{ currentOrder.estimatedDeliveryTime || '计算中...' }}</div>
                <div>实际发货：{{ currentOrder.deliverTime }}</div>
             </template>
           </el-alert>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关 闭</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      v-model="payDialogVisible"
      title="收银台"
      width="450px"
      center
      destroy-on-close
    >
      <div v-if="payingOrder" class="cashier-container">
        <div class="pay-amount">
          <p>支付金额</p>
          <div class="price">¥ {{ payingOrder.amount.toFixed(2) }}</div>
          <div class="order-no">订单号：{{ payingOrder.number }}</div>
        </div>

        <div class="pay-type-select">
          <p class="section-title">选择支付方式</p>
          <el-radio-group v-model="payType" class="type-group">
            <el-radio :label="1" border class="pay-radio">
              <div class="radio-content">
                <el-icon color="#09bb07" size="18"><SuccessFilled /></el-icon>
                <span>微信支付</span>
              </div>
            </el-radio>
            <el-radio :label="2" border class="pay-radio">
              <div class="radio-content">
                <el-icon color="#1677ff" size="18"><CircleCheckFilled /></el-icon>
                <span>支付宝</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <div class="qr-section">
          <div class="qr-box">
             <el-image 
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SimulatePayment" 
                style="width: 150px; height: 150px"
             />
             <div class="qr-mask" v-if="false">
                 <el-icon><Refresh /></el-icon>
             </div>
          </div>
          <p class="qr-tip">
            请使用{{ payType === 1 ? '微信' : '支付宝' }}扫一扫<br>扫描二维码支付
          </p>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="payDialogVisible = false">稍后支付</el-button>
          <el-button type="primary" @click="confirmPayment" :loading="false">
            我已支付完成
          </el-button>
        </span>
      </template>
    </el-dialog>
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

.order-header {
  margin-bottom: 20px;
}

.order-total,
.order-staus,
.order-time {
  text-align: center;
}

.order-id-header {
  font-size: 13px;
  color: #909399;
}

.head-label {
  text-align: center;
  font-weight: bold;
}

.button{
  margin-top: 10px;
  margin-left: 12px;
  margin-right: 15px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
:deep(.el-collapse-item__header) {
  border-bottom: none;
  border-top: 1px solid #ebeef5; /* 只有展开时，内容和标题之间才需要分隔线 */
}
/* 如果你希望内容部分没有底边框，可以把这行加上 */
.reverse-collapse {
  border-bottom: none;
}
:deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.cover-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
:deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.cover-uploader {
  border-color: var(--el-color-primary);
}
:deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}
.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px; /* 封面图宽 */
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
