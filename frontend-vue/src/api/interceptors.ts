import { apiClient } from './client'

export function setupInterceptors() {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error(error)

      return Promise.reject(error)
    },
  )
}
