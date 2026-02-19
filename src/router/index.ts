import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },

    // Authenticated — all share the sidebar layout
    {
      path: '/',
      component: () => import('@/layouts/AuthenticatedLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        // People
        {
          path: 'employees',
          name: 'employees',
          component: () => import('@/views/employees/EmployeesView.vue'),
        },
        {
          path: 'departments',
          name: 'departments',
          component: () => import('@/views/departments/DepartmentsView.vue'),
        },
        {
          path: 'positions',
          name: 'positions',
          component: () => import('@/views/positions/PositionsView.vue'),
        },
        // Leave & Attendance
        {
          path: 'leave',
          name: 'leave',
          component: () => import('@/views/leave/LeaveView.vue'),
        },
        {
          path: 'attendance',
          name: 'attendance',
          component: () => import('@/views/attendance/AttendanceView.vue'),
        },
        {
          path: 'holidays',
          name: 'holidays',
          component: () => import('@/views/holidays/HolidaysView.vue'),
        },
        // Payroll
        {
          path: 'payroll',
          name: 'payroll',
          component: () => import('@/views/payroll/PayrollView.vue'),
        },
        {
          path: 'payroll/payslips',
          name: 'payslips',
          component: () => import('@/views/payroll/PayslipsView.vue'),
        },
        // Recruitment
        {
          path: 'recruitment',
          name: 'recruitment',
          component: () => import('@/views/recruitment/RecruitmentView.vue'),
        },
        // Performance
        {
          path: 'performance',
          name: 'performance',
          component: () => import('@/views/performance/PerformanceView.vue'),
        },
      ],
    },

    // Catch-all
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

// Navigation guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (authStore.token && !authStore.user) {
    await authStore.fetchCurrentUser()
  }

  const requiresAuth = to.meta.requiresAuth !== false
  const guestOnly = to.meta.guestOnly === true

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
