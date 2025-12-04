<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getShoppingCartApi,
  updateCartItemApi,
  deleteCartItemApi,
  clearCartApi,
} from '@/api/shopping-cart'
import type { ApiResponse, Product, ShoppingCartItem, Store } from '@/api/types'
import { bookApi } from '@/api/introduction'
import { openBook } from '@/api/meta'

// 加载状态
const loading = ref(false)

// 店铺数据类型定义
const store = ref<Store>({
  id: 1,
  name: '小书架专卖店',
  selected: false,
  indeterminate: false,
  items: [],
})

// 获取购物车数据 - 增强错误处理
const fetchShoppingCartData = async () => {
  loading.value = true
  try {
    const response: ApiResponse<ShoppingCartItem[]> = await getShoppingCartApi()

    if (response.code === 1 && response.data && Array.isArray(response.data)) {
      // 清空并重新填充数据

      const items = response.data

      // 并行请求每个 book_id 对应的图书信息
      const bookPromises = items.map((item) => bookApi(item.book_id))
      const books = await Promise.all(bookPromises)
      // 合并后端购物车项和图书详情，生成Product数组
      store.value.items = items.map((cartItem, idx) => {
        const bookDetail = books[idx]!.data
        console.log('书籍详情:', bookDetail)
        return {
          ...bookDetail,
          quantity: cartItem.number,
          selected: true,
          specifications: ['默认规格'],
          freeShipping: cartItem.amount > 10,
          guarantee: true,
          stock: bookDetail?.book_stock?.stock ?? 100,
        }
      })
      updateStoreIndeterminate(store.value)

      ElMessage.success(`成功加载 ${response.data.length} 件商品`)
    } else {
      ElMessage.error(response.msg || '获取购物车数据失败')
    }
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    ElMessage.error('网络错误，请稍后重试')
    // 错误时清空数据
    store.value.items = []
  } finally {
    loading.value = false
  }
}

// 计算属性 - 所有商品列表
const cartItems = computed<Product[]>(() => {
  return store.value.items
})

// 计算属性 - 选中商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter((item: Product) => item.selected).length
})

// 计算属性 - 总价格
const totalPrice = computed(() => {
  return cartItems.value
    .filter((item: Product) => item.selected)
    .reduce((total: number, item: Product) => total + item.price * item.quantity, 0)
})

// 计算属性 - 全选状态
const selectAll = computed({
  get: () =>
    store.value && store.value.items.length > 0
      ? store.value.items.every((item: Product) => item.selected)
      : false,
  set: (value: boolean) => {
    if (!store.value) return
    store.value.selected = value
    store.value.items.forEach((item: Product) => {
      item.selected = value
    })
    updateStoreIndeterminate(store.value)
  },
})

// 计算属性 - 不确定状态
const isIndeterminate = computed(() => {
  if (!store.value) return false

  const totalItems = store.value.items.length
  const selectedItems = store.value.items.filter((item: Product) => item.selected).length

  return (selectedItems > 0 && selectedItems < totalItems) || store.value.indeterminate
})

// 方法 - 更新店铺的不确定状态
const updateStoreIndeterminate = (store: Store) => {
  const selectedItems = store.items.filter((item: Product) => item.selected)
  store.selected = selectedItems.length === store.items.length && store.items.length > 0
  store.indeterminate = selectedItems.length > 0 && selectedItems.length < store.items.length
}

// 方法 - 处理全选变化
const handleSelectAllChange = (value: boolean) => {
  if (!store.value) return

  store.value.selected = value
  store.value.items.forEach((item: Product) => {
    item.selected = value
  })
  updateStoreIndeterminate(store.value)
}

// 方法 - 处理店铺选择变化
const handleStoreSelectChange = (store: Store) => {
  store.items.forEach((item: Product) => {
    item.selected = store.selected
  })
  updateStoreIndeterminate(store)
  // updateSelectAll()
}

// 方法 - 处理商品选择变化
const handleItemSelectChange = (store: Store) => {
  updateStoreIndeterminate(store)
  // updateSelectAll()
}

// 方法 - 处理数量变化（调用API）
const handleQuantityChange = async (item: Product) => {
  if (item.quantity < 1) item.quantity = 1
  if (item.quantity > item.stock) item.quantity = item.stock

  try {
    const response = await updateCartItemApi({
      book_id: item.id,
      number: item.quantity,
    })

    if (response.code === 1) {
      ElMessage.success(`已更新 ${item.name} 的数量`)
    } else {
      ElMessage.error(response.msg || '更新数量失败')
      // 失败时重新获取数据恢复状态
      await fetchShoppingCartData()
    }
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新失败，请稍后重试')
    await fetchShoppingCartData()
  }
}

// 方法 - 删除商品（调用API）
const removeItem = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await deleteCartItemApi(id)

    if (response.code === 1) {
      // 删除成功后重新获取数据
      console.log('删除商品成功，刷新数据', response)
      await fetchShoppingCartData()
      ElMessage.success('商品删除成功')
    } else {
      ElMessage.error(response.msg || '删除商品失败')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

// 方法 - 清空购物车（调用API）
const clearCart = async () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车已经是空的')
    return
  }

  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await clearCartApi()

    if (response.code === 1) {
      store.value.items = []
      ElMessage.success('购物车已清空')
    } else {
      ElMessage.error(response.msg || '清空购物车失败')
    }
  } catch {
    ElMessage.info('已取消清空操作')
  }
}

// 方法 - 处理结算
const handleCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }

  const totalAmount = totalPrice.value

  ElMessageBox.confirm(
    `确认结算 ${selectedCount.value} 件商品，总金额：¥${totalAmount.toFixed(2)}`,
    '确认结算',
    {
      confirmButtonText: '去支付',
      cancelButtonText: '再想想',
      type: 'warning',
    },
  )
    .then(() => {
      ElMessage.success('订单创建成功，正在跳转支付...')
      // 实际项目中这里会有支付跳转逻辑
    })
    .catch(() => {
      ElMessage.info('您已取消结算')
    })
}

// 方法 - 去购物
const goShopping = () => {
  ElMessage.info('跳转到商品页面')
  // 实际项目中这里会有路由跳转逻辑
}

// 生命周期
onMounted(() => {
  console.log('购物车组件已加载')
  // 从后端API获取数据
  fetchShoppingCartData()
})
</script>
<template>
  <div class="shopping-cart">
    <!-- 顶部标题栏 -->
    <div class="cart-header">
      <span class="selected-count">已选 {{ selectedCount }} 件商品</span>
    </div>

    <!-- 购物车内容区域 -->
    <el-card class="cart-container">
      <!-- 表头 -->
      <template #header>
        <el-row :gutter="24" align="middle">
          <el-col :span="2">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAllChange"
              >全选
            </el-checkbox>
          </el-col>
          <el-col :span="10">商品</el-col>
          <el-col class="head-label" :span="3">单价</el-col>
          <el-col class="head-label" :span="3">数量</el-col>
          <el-col class="head-label" :span="3">小计</el-col>
          <el-col class="head-label" :span="3">操作</el-col>
        </el-row>
      </template>
      <div class="store-header">
        <div class="store-info">
          <el-checkbox
            v-model="store.selected"
            :indeterminate="store.indeterminate"
            @change="() => handleStoreSelectChange(store)"
          />
          <span class="store-name">{{ store.name }}</span>
          <el-button link type="primary" size="small" class="store-action"> 联系客服 </el-button>
        </div>
      </div>

      <!-- 店铺商品列表 -->
      <div class="store-items">
        <el-card
          v-for="item in store.items"
          :key="item.id"
          class="cart-item"
          :class="{ selected: item.selected }"
          shadow="hover"
        >
          <el-row :gutter="24" align="middle">
            <!-- 选择框 -->
            <el-col :span="2">
              <el-checkbox v-model="item.selected" @change="() => handleItemSelectChange(store)" />
            </el-col>

            <!-- 商品信息 -->
            <el-col class="item-info" :span="10">
              <el-row>
                <el-image
                  :src="item.image"
                  class="product-image"
                  fit="contain"
                  @click="openBook(item.id)"
                  style="cursor: pointer"
                />

                <div class="item-details">
                  <h4 class="product-name">{{ item.name }}</h4>
                  <div class="product-specs">
                    <span class="spec" v-for="spec in item.specifications" :key="spec">
                      {{ spec }}
                    </span>
                  </div>
                  <div class="product-tags">
                    <el-tag v-if="item.freeShipping" size="small" type="success">免运费</el-tag>
                    <el-tag v-if="item.guarantee" size="small" type="warning">7天价保</el-tag>
                  </div>
                </div>
              </el-row>
            </el-col>

            <!-- 单价 -->
            <el-col class="item-price" :span="3">
              <span class="current-price">¥{{ item.price.toFixed(2) }}</span>
            </el-col>

            <!-- 数量控制 -->
            <el-col class="item-quantity" :span="3" style="margin-top: 20px">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="item.stock > 99 ? 99 : item.stock"
                size="small"
                controls-position="right"
                @change="() => handleQuantityChange(item)"
              />
              <div class="stock-info">库存 {{ item.stock }} 件</div>
            </el-col>

            <!-- 小计 -->
            <el-col class="item-subtotal" :span="3">
              <span class="subtotal-amount"> ¥{{ (item.price * item.quantity).toFixed(2) }} </span>
            </el-col>

            <!-- 操作按钮 -->
            <el-col class="item-actions" :span="3">
              <el-button link type="danger" size="small" @click="() => removeItem(item.id)">
                删除
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </div>

      <!-- 空购物车状态 -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <el-empty description="购物车空空如也">
          <el-button type="primary" @click="goShopping">去购物</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>

  <!-- 底部悬浮结算栏 -->
  <el-affix
    position="bottom"
    :offset="0"
    v-if="cartItems.length > 0"
    style="width: 80%; margin: 0 auto"
  >
    <div class="footer-content">
      <div class="footer-left">
        <el-checkbox
          v-model="selectAll"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllChange"
        >
          全选
        </el-checkbox>
        <el-button link type="danger" @click="clearCart"> 清空购物车 </el-button>
      </div>

      <div class="footer-right">
        <div class="price-line">
          <span>已选 {{ selectedCount }} 件商品，</span>
          <span class="total-label">合计：</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>

        <el-button
          type="warning"
          size="large"
          class="checkout-btn"
          :disabled="selectedCount === 0"
          @click="handleCheckout"
        >
          去结算 ({{ selectedCount }})
        </el-button>
      </div>
    </div>
  </el-affix>
</template>

<style scoped>
.shopping-cart {
  max-width: 80%;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: 100vh;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 30px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

.cart-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.selected-count {
  color: #666;
  font-size: 14px;
}

.cart-container {
  margin-bottom: 100px;
  padding-bottom: 20px;
}

.head-label {
  text-align: center;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.store-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.store-name {
  font-weight: 600;
  color: #333;
}

.store-action {
  margin-left: 8px;
}

.store-promotion {
  display: flex;
  align-items: center;
}

.store-items {
  background-color: #fff;
}

.store-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  background-color: #fafafa;
  border-top: 1px solid #e8e8e8;
}

.store-total {
  font-size: 14px;
  color: #666;
}

.store-total-price {
  font-size: 16px;
  color: #ff5000;
  font-weight: bold;
  margin: 0 4px;
}

.store-discount {
  color: #52c41a;
  font-size: 12px;
}

.cart-item {
  margin-bottom: 10px;
}

.item-content {
  display: grid;
  grid-template-columns: 60px 1fr 120px 140px 120px 100px;
  gap: 15px;
  padding: 20px;
  align-items: center;
}

.item-info {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.item-details {
  flex: 1;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.product-specs {
  margin-bottom: 8px;
}

.spec {
  display: inline-block;
  background: #f5f5f5;
  padding: 2px 6px;
  margin-right: 8px;
  border-radius: 3px;
  font-size: 12px;
  color: #666;
}

.product-tags {
  display: flex;
  gap: 5px;
}

.item-price {
  text-align: center;
}

.current-price {
  display: block;
  font-size: 16px;
  color: #ff5000;
  font-weight: bold;
}

.original-price {
  display: block;
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-top: 4px;
}

.item-quantity {
  text-align: center;
}

.stock-info {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.item-subtotal {
  text-align: center;
}

.subtotal-amount {
  display: block;
  font-size: 16px;
  color: #ff5000;
  font-weight: bold;
}

.discount-info {
  font-size: 12px;
  color: #52c41a;
  margin-top: 4px;
}

.item-actions {
  text-align: center;
}

.empty-cart {
  padding: 60px 0;
  text-align: center;
}

.footer-content {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
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

.price-line {
  font-size: 16px;
  margin-bottom: 5px;
}

.total-label {
  font-weight: 500;
}

.total-price {
  font-size: 24px;
  color: #ff5000;
  font-weight: bold;
}

.discount-line {
  font-size: 12px;
  color: #52c41a;
}

.checkout-btn {
  min-width: 120px;
  height: 40px;
  font-size: 16px;
}
</style>
