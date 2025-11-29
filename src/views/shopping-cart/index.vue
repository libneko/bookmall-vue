<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import {
  getShoppingCartApi,
  updateCartItemApi,
  deleteCartItemApi,
  clearCartApi,
} from '@/api/shopping-cart'
import type { ApiResponse, ShoppingCartItem, UpdateCartForm } from '@/api/types'

// 定义商品类型
interface Product {
  id: number
  storeId: number
  name: string
  image: string
  price: number
  originalPrice: number
  quantity: number
  stock: number
  selected: boolean
  specifications: string[]
  freeShipping: boolean
  guarantee: boolean
}

// 定义店铺类型
interface Store {
  id: number
  name: string
  selected: boolean
  indeterminate: boolean
  promotion: string
  items: Product[]
}

// 加载状态
const loading = ref(false)

// 店铺数据类型定义
const storeGroups = ref<Store[]>([
  {
    id: 1,
    name: '小书架专卖店',
    selected: false,
    indeterminate: false,
    promotion: '满50元包邮',
    items: [],
  },
])

// 数据转换函数：将后端ShoppingCartItem转换为前端Product
const transformBackendItemToProduct = (backendItem: ShoppingCartItem, storeId: number): Product => {
  // // 计算单价：总金额 / 数量
  // const unitPrice = backendItem.amount / backendItem.number

  return {
    id: backendItem.id,
    storeId: storeId,
    name: backendItem.name,
    image: backendItem.image,
    price: backendItem.amount, // 单价
    originalPrice: backendItem.amount * 1.2, // 原价比现价高20%
    quantity: backendItem.number, // 对应后端的number字段
    stock: 100, // 默认库存，实际应从商品接口获取
    selected: true, // 默认选中
    specifications: ['默认规格'], // 需要从商品详情获取
    freeShipping: backendItem.amount > 10, // 单价大于10元免运费
    guarantee: true, // 默认有保障
  }
}

// 获取购物车数据 - 增强错误处理
const fetchShoppingCartData = async () => {
  loading.value = true
  try {
    const response: ApiResponse<ShoppingCartItem[]> = await getShoppingCartApi()

    if (response.code === 1 && response.data && Array.isArray(response.data)) {
      // 确保storeGroups有数据
      if (storeGroups.value.length === 0) {
        storeGroups.value.push({
          id: 1,
          name: '小书架专卖店',
          selected: false,
          indeterminate: false,
          promotion: '满50元包邮',
          items: [],
        })
      }

      // 清空并重新填充数据
      storeGroups.value[0]!.items = response.data.map((item: ShoppingCartItem) =>
        transformBackendItemToProduct(item, storeGroups.value[0]!.id),
      )

      // 更新选择状态
      updateStoreIndeterminate(storeGroups.value[0]!)
      updateSelectAll()

      ElMessage.success(`成功加载 ${response.data.length} 件商品`)
    } else {
      ElMessage.error(response.msg || '获取购物车数据失败')
    }
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    ElMessage.error('网络错误，请稍后重试')
    // 错误时清空数据
    if (storeGroups.value.length > 0) {
      storeGroups.value[0]!.items = []
    }
  } finally {
    loading.value = false
  }
}

// 计算属性 - 所有商品列表
const cartItems = computed<Product[]>(() => {
  return storeGroups.value.flatMap((store: Store) => store.items)
})

// 计算属性 - 选中商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter((item: Product) => item.selected).length
})

// 计算属性 - 选中店铺数量
const selectedStoresCount = computed(() => {
  return storeGroups.value.filter((store: Store) => store.selected).length
})

// 计算属性 - 总价格
const totalPrice = computed(() => {
  return cartItems.value
    .filter((item: Product) => item.selected)
    .reduce((total: number, item: Product) => total + item.price * item.quantity, 0)
})

// 计算属性 - 总折扣
const totalDiscount = computed(() => {
  return cartItems.value
    .filter((item: Product) => item.selected)
    .reduce((total: number, item: Product) => {
      const discount = (item.originalPrice - item.price) * item.quantity
      return total + (discount > 0 ? discount : 0)
    }, 0)
})

// 计算属性 - 全选状态
const selectAll = computed({
  get: () =>
    storeGroups.value.length > 0 && storeGroups.value.every((store: Store) => store.selected),
  set: (value: boolean) => {
    storeGroups.value.forEach((store: Store) => {
      store.selected = value
      store.items.forEach((item: Product) => {
        item.selected = value
      })
      updateStoreIndeterminate(store)
    })
  },
})

// 计算属性 - 不确定状态
const isIndeterminate = computed(() => {
  const selectedStores = storeGroups.value.filter((store: Store) => store.selected)
  const partiallySelected = storeGroups.value.some((store: Store) => store.indeterminate)
  return (
    (selectedStores.length > 0 && selectedStores.length < storeGroups.value.length) ||
    partiallySelected
  )
})

// 方法 - 更新店铺的不确定状态
const updateStoreIndeterminate = (store: Store) => {
  const selectedItems = store.items.filter((item: Product) => item.selected)
  store.selected = selectedItems.length === store.items.length && store.items.length > 0
  store.indeterminate = selectedItems.length > 0 && selectedItems.length < store.items.length
}

// 方法 - 更新全选状态
const updateSelectAll = () => {
  // 全选状态由计算属性自动处理
}

// 方法 - 处理全选变化
const handleSelectAllChange = (value: boolean) => {
  storeGroups.value.forEach((store: Store) => {
    store.selected = value
    store.items.forEach((item: Product) => {
      item.selected = value
    })
    updateStoreIndeterminate(store)
  })
}

// 方法 - 处理店铺选择变化
const handleStoreSelectChange = (store: Store) => {
  store.items.forEach((item: Product) => {
    item.selected = store.selected
  })
  updateStoreIndeterminate(store)
  updateSelectAll()
}

// 方法 - 处理商品选择变化
const handleItemSelectChange = (store: Store) => {
  updateStoreIndeterminate(store)
  updateSelectAll()
}

// 方法 - 处理数量变化（调用API）
const handleQuantityChange = async (item: Product) => {
  if (item.quantity < 1) item.quantity = 1
  if (item.quantity > item.stock) item.quantity = item.stock

  try {
    const response = await updateCartItemApi({
      id: item.id,
      number: item.quantity,
    })

    if (response.code === 200) {
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

    if (response.code === 200) {
      // 删除成功后重新获取数据
      await fetchShoppingCartData()
      ElMessage.success('商品删除成功')
    } else {
      ElMessage.error(response.msg || '删除商品失败')
    }
  } catch {
    ElMessage.info('已取消删除')
  }
}

// 方法 - 移入收藏
const moveToFavorites = (id: number) => {
  const item = cartItems.value.find((item: Product) => item.id === id)
  if (item) {
    ElMessage.success(`已将 ${item.name} 移入收藏夹`)
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

    if (response.code === 200) {
      // storeGroups.value[0].items = []
      storeGroups.value[0]!.items = []
      ElMessage.success('购物车已清空')
    } else {
      ElMessage.error(response.msg || '清空购物车失败')
    }
  } catch {
    ElMessage.info('已取消清空操作')
  }
}

// // 方法 - 添加到购物车（调用API）
// const addToCart = async (product: Omit<Product, 'id' | 'storeId' | 'selected'>) => {
//   try {
//     const response = await addToCartApi({
//       book_id: product.name.includes('TB6612')
//         ? 1
//         : product.name.includes('STM32')
//           ? 2
//           : product.name.includes('Arduino')
//             ? 3
//             : 4, // 模拟book_id
//       number: product.quantity,
//     })

//     if (response.code === 200) {
//       // 添加成功后重新获取购物车数据
//       await fetchShoppingCartData()
//       ElMessage.success(`已添加 ${product.name} 到购物车`)
//     } else {
//       ElMessage.error(response.msg || '添加商品失败')
//     }
//   } catch (error) {
//     console.error('添加商品失败:', error)
//     ElMessage.error('添加商品失败，请稍后重试')
//   }
// }

// 方法 - 获取店铺总价
const getStoreTotalPrice = (store: Store) => {
  return store.items
    .filter((item: Product) => item.selected)
    .reduce((total: number, item: Product) => total + item.price * item.quantity, 0)
}

// 方法 - 获取店铺折扣
const getStoreDiscount = (store: Store) => {
  return store.items
    .filter((item: Product) => item.selected)
    .reduce((total: number, item: Product) => {
      const discount = (item.originalPrice - item.price) * item.quantity
      return total + (discount > 0 ? discount : 0)
    }, 0)
}

// 方法 - 处理结算
const handleCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }

  const selectedItems = cartItems.value.filter((item: Product) => item.selected)
  const selectedStores = storeGroups.value.filter((store: Store) => store.selected)
  const totalAmount = totalPrice.value

  ElMessageBox.confirm(
    `确认结算 ${selectedCount.value} 件商品（${
      selectedStores.length
    } 家店铺），总金额：¥${totalAmount.toFixed(2)}`,
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

// 模拟添加测试数据的方法（开发用）
const addTestData = () => {
  const testProduct: Omit<Product, 'id' | 'storeId' | 'selected'> = {
    name: '测试商品',
    image: 'https://via.placeholder.com/80',
    price: 29.9,
    originalPrice: 35.9,
    quantity: 1,
    stock: 50,
    specifications: ['测试规格'],
    freeShipping: true,
    guarantee: true,
  }
  //   addToCart(testProduct)
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
      <div class="header-actions">
        <span class="selected-count">已选 {{ selectedCount }} 件商品</span>
      </div>
    </div>

    <!-- 购物车内容区域 -->
    <el-card class="cart-container">
      <!-- 表头 -->
      <div class="cart-head">
        <el-checkbox
          v-model="selectAll"
          :indeterminate="isIndeterminate"
          @change="handleSelectAllChange"
        >
          全选
        </el-checkbox>
        <span class="head-label">商品</span>
        <span class="head-label">单价</span>
        <span class="head-label">数量</span>
        <span class="head-label">小计</span>
        <span class="head-label">操作</span>
      </div>

      <!-- 店铺分组 -->
      <div class="store-group" v-for="store in storeGroups" :key="store.id">
        <!-- 店铺头部 -->
        <div class="store-header">
          <div class="store-info">
            <el-checkbox
              v-model="store.selected"
              :indeterminate="store.indeterminate"
              @change="() => handleStoreSelectChange(store)"
            />
            <span class="store-name">{{ store.name }}</span>
            <el-tag size="small" type="info">店铺</el-tag>
            <el-button link type="primary" size="small" class="store-action"> 联系客服 </el-button>
          </div>
        </div>

        <!-- 店铺商品列表 -->
        <div class="store-items">
          <div
            v-for="item in store.items"
            :key="item.id"
            class="cart-item"
            :class="{ selected: item.selected }"
          >
            <div class="item-content">
              <!-- 选择框 -->
              <div class="item-select">
                <el-checkbox
                  v-model="item.selected"
                  @change="() => handleItemSelectChange(store)"
                />
              </div>

              <!-- 商品信息 -->
              <div class="item-info">
                <el-image :src="item.image" class="product-image" fit="cover">
                  <template #error>
                    <div class="image-error">
                      <el-icon>
                        <Picture />
                      </el-icon>
                    </div>
                  </template>
                </el-image>

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
              </div>

              <!-- 单价 -->
              <div class="item-price">
                <span class="current-price">¥{{ item.price.toFixed(2) }}</span>
              </div>

              <!-- 数量控制 -->
              <div class="item-quantity">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="item.stock"
                  size="small"
                  controls-position="right"
                  @change="() => handleQuantityChange(item)"
                />
                <div class="stock-info">库存 {{ item.stock }} 件</div>
              </div>

              <!-- 小计 -->
              <div class="item-subtotal">
                <span class="subtotal-amount">
                  ¥{{ (item.price * item.quantity).toFixed(2) }}
                </span>
              </div>

              <!-- 操作按钮 -->
              <div class="item-actions">
                <el-button link type="primary" size="small" @click="() => moveToFavorites(item.id)">
                  移入收藏
                </el-button>
                <el-button link type="danger" size="small" @click="() => removeItem(item.id)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 店铺底部 -->
        <div class="store-footer">
          <div class="store-total">
            <span>本店合计：</span>
            <span class="store-total-price">¥{{ getStoreTotalPrice(store).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 空购物车状态 -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <el-empty description="购物车空空如也">
          <el-button type="primary" @click="goShopping">去购物</el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 底部悬浮结算栏 -->
    <el-affix position="bottom" :offset="0" target=".shopping-cart" v-if="cartItems.length > 0">
      <div class="cart-footer-affix">
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
            <div class="selected-stores">已选 {{ selectedStoresCount }} 家店铺</div>
          </div>

          <div class="footer-right">
            <div class="price-summary">
              <div class="price-line">
                <span>已选 {{ selectedCount }} 件商品，</span>
                <span class="total-label">合计：</span>
                <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="discount-line" v-if="totalDiscount > 0">
                已节省：¥{{ totalDiscount.toFixed(2) }}
              </div>
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
      </div>
    </el-affix>
  </div>
</template>

<style scoped>
.shopping-cart {
  max-width: 1200px;
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
  /* 为底部悬浮栏留出空间 */
  padding-bottom: 20px;
}

.cart-head {
  display: grid;
  grid-template-columns: 60px 1fr 120px 140px 120px 100px;
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

/* 店铺分组样式 */
.store-group {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  margin-bottom: 16px;
  overflow: hidden;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #e8e8e8;
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

.cart-items {
  min-height: 200px;
}

.cart-item {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.cart-item:hover {
  background-color: #fafafa;
}

.cart-item.selected {
  background-color: #f0f7ff;
}

.item-content {
  display: grid;
  grid-template-columns: 60px 1fr 120px 140px 120px 100px;
  gap: 15px;
  padding: 20px;
  align-items: center;
}

.item-select {
  display: flex;
  justify-content: center;
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

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.empty-cart {
  padding: 60px 0;
  text-align: center;
}

/* 底部悬浮结算栏样式 */
.cart-footer-affix {
  width: 100%;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.footer-content {
  max-width: 1200px;
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

.selected-stores {
  font-size: 14px;
  color: #666;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.price-summary {
  text-align: right;
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

.recommendations {
  margin-top: 40px;
}

.recommendations h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.rec-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.rec-item {
  text-align: center;
  transition: transform 0.3s ease;
}

.rec-item:hover {
  transform: translateY(-5px);
}

.rec-image {
  width: 100%;
  height: 120px;
  border-radius: 4px;
}

.rec-info {
  padding: 15px;
}

.rec-name {
  font-size: 14px;
  margin-bottom: 10px;
  height: 40px;
  overflow: hidden;
  /* 修复CSS兼容性警告 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2; /* 添加标准属性 */
  display: -moz-box;
  -moz-box-orient: vertical;
  -moz-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-price {
  font-size: 16px;
  color: #ff5000;
  font-weight: bold;
  margin-bottom: 10px;
}

.add-btn {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shopping-cart {
    padding: 10px;
  }

  .cart-container {
    margin-bottom: 120px;
    /* 移动端需要更多空间 */
  }

  .cart-head {
    grid-template-columns: 40px 1fr;
    gap: 10px;
  }

  .head-label:not(:first-child) {
    display: none;
  }

  .item-content {
    grid-template-columns: 40px 1fr;
    gap: 10px;
    position: relative;
    padding: 15px 10px;
  }

  .item-price,
  .item-quantity,
  .item-subtotal,
  .item-actions {
    grid-column: 2;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
    border-top: 1px solid #f0f0f0;
  }

  .item-actions {
    border: none;
    justify-content: flex-start;
    gap: 15px;
  }

  .store-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .footer-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding: 12px 15px;
  }

  .footer-right {
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .footer-left {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
    width: 100%;
  }

  .price-summary {
    text-align: center;
    width: 100%;
  }

  .checkout-btn {
    width: 100%;
  }
}
</style>
