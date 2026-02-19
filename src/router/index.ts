import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },

    // Protected routes
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true },
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

  // If we have a token but no user loaded yet, try to fetch the current user
  if (authStore.token && !authStore.user) {
    await authStore.fetchCurrentUser()
  }

  const requiresAuth = to.meta.requiresAuth !== false
  const guestOnly = to.meta.guestOnly === true

  // Redirect unauthenticated users to login
  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Redirect authenticated users away from guest-only pages (login)
  if (guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
