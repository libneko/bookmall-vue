import router from '@/router'
import type { InternalRuleItem } from 'async-validator'

export const openBook = (book_id: number) => {
  const url = getBookUrl(book_id)
  window.open(url, '_blank')
}

export const getBookUrl = (book_id: number) => {
  return router.resolve({
    name: 'introduction',
    params: { id: book_id },
  }).href
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return emailRegex.test(email)
}

export const createConfirmPasswordValidator = (getOriginalPassword: () => string) => {
  return (rule: InternalRuleItem, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error('请再次输入密码'))
    } else if (value.length < 8) {
      callback(new Error('密码长度不能少于8位'))
    } else if (value.length > 20) {
      callback(new Error('密码长度不能超过20位'))
    } else if (value !== getOriginalPassword()) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }
}

export const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}

export const validateEmail = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!isValidEmail(value)) {
    callback(new Error('邮箱格式不正确'))
  } else {
    callback()
  }
}
