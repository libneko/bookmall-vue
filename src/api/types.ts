export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

export interface LoginForm {
  username: string
  password: string
}

export interface LoginToken {
  id: number
  username: string
  name: string
  token: string
}

export interface RegisterForm {
  username: string
  password: string
  name: string
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

export interface SendSearch{
  total: number
  records: Book
}
export interface ReceiveSearch {
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
  id: number
  number: number
}
