import request from '@/utils/request'
import type { ApiResponse, Book, BookData } from './types'

export const submitBookApi = (book: Book): Promise<ApiResponse<BookData>> => {
  return request.post('/admin/book', book)
}

export const deleteBookApi = (id: number): Promise<ApiResponse<object>> => { 
  return request.delete(`/admin/book/` + id)
}