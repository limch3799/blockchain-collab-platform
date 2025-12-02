// API 공통 타입 정의
// 페이지네이션, 에러 응답 등


//현재 미사용중인 예시파일입니다!!!!!!!!!!!




export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginationParams {
  page: number
  size: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}