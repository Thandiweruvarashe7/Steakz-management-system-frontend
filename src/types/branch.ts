export interface OpeningHours {
  open: string
  close: string
}

export interface Branch {
  id: string
  name: string
  address: string
  city: string
  postcode: string
  phone: string
  email: string
  managerId?: string
  managerName?: string
  isActive: boolean
  openingHours: Record<string, OpeningHours>
  imageUrl?: string
  description?: string
  tableCount?: number
  staffCount?: number
}

export interface BranchFilters {
  city?: string
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface CreateBranchData {
  name: string
  address: string
  city: string
  postcode: string
  phone: string
  email: string
  managerId?: string
  openingHours: Record<string, OpeningHours>
  imageUrl?: string
  description?: string
}
