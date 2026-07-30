import { apiClient } from '@/api/client'
import { API } from '@/api/endpoints'
import type { News } from '@/types/news'

export const newsService = {
  async getAll() {
    const { data } = await apiClient.get<News[]>(API.NEWS.LIST)
    return data
  },
}
