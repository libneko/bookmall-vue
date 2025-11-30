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

export interface Addshopping {
  book_id: number
}

export interface SendSearch{
  total: number
  records: Book
}
export interface ReceiveSearch{
  page: number
  page_size: number
  name: string
  category_id: number
  status: number
}
