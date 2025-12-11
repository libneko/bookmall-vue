export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface LoginForm {
  email: string
  password: string
}

export interface ReceiveCodeflag {
  data: boolean
}

export interface CodeLogin {
  email: string
  code: string
}

export interface LoginToken {
  id: number
  username: string
  email: string
  avatar: string
  token: string
}

export interface RegisterForm {
  username: string
  password: string
  email: string
}

export interface BookStock {
  id: number
  book_id: number
  stock: number
}

export interface Book {
  id: number
  name: string
  author: string
  category_id: string
  price: number
  image: string
  description: string
  status: string
  book_stock: BookStock
}

export interface Category {
  id: number
  name: string
  sort: number
  status: number
}

export interface BookData {
  book_id: number
}

export interface ReceiveSearch {
  total: number
  records: Book[]
}

export interface SendSearch {
  page: number
  page_size: number
  name: string
  category_id: number
  status: number
}

// 根据图片添加购物车相关接口
export interface ShoppingCartItem {
  id: number
  name: string
  user_id: number
  book_id: number
  number: number // 数量
  amount: number // 金额
  image: string
  create_time: string
}

//更新购物车
export interface UpdateCartForm {
  book_id: number
  number: number
}

//删除商品
export interface ShoppingDeleteForm {
  id: number
}

export interface SendPersonId {
  user_id: number
}

export interface ReceivePerson {
  user_id: string
  name: string
  email: string
}

export interface SendCode {}
export interface Product extends Book {
  quantity: number
  selected: boolean
  specifications: string[]
  freeShipping: boolean
  guarantee: boolean
  stock: number
}

// 定义店铺类型
export interface Store {
  id: number
  name: string
  selected: boolean
  indeterminate: boolean
  items: Product[]
}

export interface User {
  id: number
  username: string
  email: string
  password: string
  phone: string
  sex: number
  avatar: string
}
