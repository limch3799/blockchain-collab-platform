//Zustand를 사용한 전역 상태 관리
//사용자 인증 상태를 전역으로 공유

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      
      setToken: (token) => {
        localStorage.setItem('accessToken', token)
        set({ token })
      },
      
      logout: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage', // localStorage 키 이름
      partialize: (state) => ({ token: state.token }), // token만 저장
    }
  )
)

// 사용 예시:
// const { user, setUser, logout } = useAuthStore()