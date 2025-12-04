import router from '@/router'
import type { Book } from './types'

export const openBook = (book_id: number) => {
  const url = router.resolve({
    name: 'introduction',
    params: { id: book_id },
  }).href

  window.open(url, '_blank')
}
