import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { BranchRoute } from './BranchRoute'

// Layouts
import { PublicLayout } from '@/components/layouts/PublicLayout'
import { CustomerLayout } from '@/components/layouts/CustomerLayout'
import { WaiterLayout } from '@/components/layouts/WaiterLayout'
import { ManagerLayout } from '@/components/layouts/ManagerLayout'
import { HQLayout } from '@/components/layouts/HQLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'

// Public Pages
import { HomePage } from '@/pages/public/HomePage'
import { MenuPage } from '@/pages/public/MenuPage'
import { BranchesPage } from '@/pages/public/BranchesPage'
import { ReservationsPage } from '@/pages/public/ReservationsPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { LoginPage } from '@/pages/public/LoginPage'
import { RegisterPage } from '@/pages/public/RegisterPage'
import { BasketPage } from '@/pages/public/BasketPage'
import { CheckoutPage } from '@/pages/public/CheckoutPage'

// Legal Pages
import { PrivacyPolicyPage } from '@/pages/legal/PrivacyPolicyPage'
import { TermsOfServicePage } from '@/pages/legal/TermsOfServicePage'
import { CookiePolicyPage } from '@/pages/legal/CookiePolicyPage'

// Customer Pages
import { CustomerProfilePage } from '@/pages/customer/CustomerProfilePage'
import { MyReservationsPage } from '@/pages/customer/MyReservationsPage'
import { OrderHistoryPage } from '@/pages/customer/OrderHistoryPage'
import { CustomerSettingsPage } from '@/pages/customer/CustomerSettingsPage'
import { OrderTrackingPage } from '@/pages/customer/OrderTrackingPage'

// Waiter Pages
import { LiveOrdersPage } from '@/pages/waiter/LiveOrdersPage'
import { ReadyOrdersPage } from '@/pages/waiter/ReadyOrdersPage'
import { WaiterPaymentsPage } from '@/pages/waiter/WaiterPaymentsPage'
import { WaiterReceiptsPage } from '@/pages/waiter/WaiterReceiptsPage'
import { WaiterFloorPlanPage } from '@/pages/waiter/WaiterFloorPlanPage'

// Branch Manager Pages
import { ManagerDashboardPage } from '@/pages/manager/ManagerDashboardPage'
import { InventoryPage } from '@/pages/manager/InventoryPage'
import { ManagerReservationsPage } from '@/pages/manager/ManagerReservationsPage'
import { SalesPage } from '@/pages/manager/SalesPage'
import { StaffPage } from '@/pages/manager/StaffPage'
import { ManagerFloorPlanPage } from '@/pages/manager/ManagerFloorPlanPage'

// HQ Pages
import { BranchAnalyticsPage } from '@/pages/hq/BranchAnalyticsPage'
import { InventoryAnalyticsPage } from '@/pages/hq/InventoryAnalyticsPage'
import { PayrollPage } from '@/pages/hq/PayrollPage'
import { MarketingPage } from '@/pages/hq/MarketingPage'
import { RevenueReportsPage } from '@/pages/hq/RevenueReportsPage'

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { UserManagementPage } from '@/pages/admin/UserManagementPage'
import { RoleManagementPage } from '@/pages/admin/RoleManagementPage'
import { BranchManagementPage } from '@/pages/admin/BranchManagementPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { AuditLogsPage } from '@/pages/admin/AuditLogsPage'

// Error Pages
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { AccessDeniedPage } from '@/pages/errors/AccessDeniedPage'

export const router = createBrowserRouter([
  // ── Public routes (Navbar + Footer) ──────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { index: true, path: '/', element: <HomePage /> },
      { path: '/menu', element: <MenuPage /> },
      { path: '/branches', element: <BranchesPage /> },
      { path: '/reservations', element: <ReservationsPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/basket', element: <BasketPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/403', element: <AccessDeniedPage /> },
      // Legal pages
      { path: '/privacy', element: <PrivacyPolicyPage /> },
      { path: '/terms', element: <TermsOfServicePage /> },
      { path: '/cookies', element: <CookiePolicyPage /> },
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: '/register',
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
    ],
  },

  // ── Customer dashboard ────────────────────────────────────────
  {
    path: '/customer',
    element: (
      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/customer/profile" replace /> },
      { path: 'profile', element: <CustomerProfilePage /> },
      { path: 'reservations', element: <MyReservationsPage /> },
      { path: 'orders', element: <OrderHistoryPage /> },
      { path: 'tracking', element: <OrderTrackingPage /> },
      { path: 'settings', element: <CustomerSettingsPage /> },
    ],
  },

  // ── Waiter / Cashier dashboard ────────────────────────────────
  {
    path: '/waiter',
    element: (
      <ProtectedRoute allowedRoles={['WAITER_CASHIER', 'BRANCH_MANAGER', 'ADMIN']}>
        <BranchRoute>
          <WaiterLayout />
        </BranchRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/waiter/orders/live" replace /> },
      { path: 'orders/live', element: <LiveOrdersPage /> },
      { path: 'orders/ready', element: <ReadyOrdersPage /> },
      { path: 'payments', element: <WaiterPaymentsPage /> },
      { path: 'receipts', element: <WaiterReceiptsPage /> },
      { path: 'floor-plan', element: <WaiterFloorPlanPage /> },
    ],
  },

  // ── Branch Manager dashboard ──────────────────────────────────
  {
    path: '/branch-manager',
    element: (
      <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'ADMIN']}>
        <BranchRoute>
          <ManagerLayout />
        </BranchRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/branch-manager/dashboard" replace /> },
      { path: 'dashboard', element: <ManagerDashboardPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'reservations', element: <ManagerReservationsPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'staff', element: <StaffPage /> },
      { path: 'floor-plan', element: <ManagerFloorPlanPage /> },
    ],
  },

  // ── HQ dashboard ──────────────────────────────────────────────
  {
    path: '/hq',
    element: (
      <ProtectedRoute allowedRoles={['HQ_MANAGER', 'ADMIN']}>
        <HQLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/hq/analytics" replace /> },
      { path: 'analytics', element: <BranchAnalyticsPage /> },
      { path: 'inventory', element: <InventoryAnalyticsPage /> },
      { path: 'payroll', element: <PayrollPage /> },
      { path: 'marketing', element: <MarketingPage /> },
      { path: 'revenue', element: <RevenueReportsPage /> },
    ],
  },

  // ── Admin dashboard ───────────────────────────────────────────
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      // Admin dashboard overview (not just redirect to users)
      { index: true, element: <AdminDashboardPage /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'roles', element: <RoleManagementPage /> },
      { path: 'branches', element: <BranchManagementPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'audit-logs', element: <AuditLogsPage /> },
    ],
  },

  // ── Fallbacks ─────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
])
