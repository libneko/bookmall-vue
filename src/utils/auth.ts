import type { LoginToken } from '@/api/types'

const TOKEN_KEY = 'login_user'

export const getLoginUser = (): LoginToken | null => {
  const userStr = localStorage.getItem(TOKEN_KEY)
  if (userStr) {
    try {
      return JSON.parse(userStr) as LoginToken
    } catch (e) {
      console.error('Failed to parse login user', e)
      return null
    }
  }
  return null
}

export const setLoginUser = (user: LoginToken) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(user))
}

export const removeLoginUser = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const isLoggedIn = (): boolean => {
  const user = getLoginUser()
  return !!user && !!user.token
}
