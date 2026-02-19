<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-svh bg-background p-8">
    <div class="mx-auto max-w-4xl">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
          <p class="text-muted-foreground mt-1">
            Welcome back, {{ authStore.user?.email }}
          </p>
        </div>
        <Button variant="outline" @click="handleLogout">Sign out</Button>
      </div>

      <div class="rounded-lg border bg-card p-6 text-card-foreground">
        <p class="text-sm text-muted-foreground">
          Role: <span class="font-medium text-foreground">{{ authStore.user?.role }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
