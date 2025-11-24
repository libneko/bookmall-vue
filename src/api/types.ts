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

export interface RegisterForm{
  username: string
  password: string
  name: string

}