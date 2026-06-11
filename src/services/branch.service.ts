import apiClient from '@/lib/axios'

export interface Branch {
  id: string
  name: string
  location: string
  phone?: string
  email?: string
  isActive?: boolean
  createdAt?: string
}

export const branchService = {
  async getBranches(): Promise<Branch[]> {
    const { data } = await apiClient.get<{ success: boolean; branches: Branch[] }>('/branches')
    return data.branches ?? []
  },

  async getBranchById(id: string): Promise<Branch> {
    const { data } = await apiClient.get<{ success: boolean; branch: Branch }>(`/branches/${id}`)
    return data.branch
  },

  async updateBranch(id: string, body: Partial<Branch>): Promise<Branch> {
    const { data } = await apiClient.patch<{ success: boolean; branch: Branch }>(`/branches/${id}`, body)
    return data.branch
  },
}
