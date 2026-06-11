import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const reservationSchema = z.object({
  branchId: z.string().min(1, 'Please select a branch'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  partySize: z.number().min(1).max(12),
  specialRequests: z.string().optional(),
})

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.enum(['STARTERS', 'STEAKS', 'MAINS', 'DESSERTS', 'DRINKS']),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean(),
  allergens: z.array(z.string()),
  calories: z.number().optional(),
  cookingOptions: z.array(z.string()).optional(),
})

export const branchSchema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postcode: z.string().min(5, 'Valid postcode required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
  description: z.string().optional(),
})

export const staffSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER', 'CUSTOMER']),
  branchId: z.string().min(1),
  hourlyRate: z.number().min(0).optional(),
})

export const inventoryItemSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  currentStock: z.number().min(0),
  minStock: z.number().min(0),
  maxStock: z.number().min(1),
  unit: z.enum(['KG', 'LITRE', 'UNIT', 'PORTION', 'BOX']),
  unitCost: z.number().min(0),
  supplier: z.string().optional(),
})

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ReservationFormData = z.infer<typeof reservationSchema>
export type MenuItemFormData = z.infer<typeof menuItemSchema>
export type BranchFormData = z.infer<typeof branchSchema>
export type StaffFormData = z.infer<typeof staffSchema>
export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
