import router from '@/router'

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
