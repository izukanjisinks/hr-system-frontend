<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ChangePasswordDialog from '@/components/auth/ChangePasswordDialog.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showChangePasswordDialog = ref(false)

async function handleSubmit() {
  const success = await authStore.login({ email: email.value, password: password.value })
  if (success) {
    // Check if user needs to change password
    if (authStore.user?.change_password) {
      showChangePasswordDialog.value = true
    } else {
      router.push({ name: 'dashboard' })
    }
  }
}

function handlePasswordChanged() {
  // After successful password change, redirect to dashboard
  showChangePasswordDialog.value = false
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="min-h-svh flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-sm">
      <div class="flex flex-col gap-6">
        <!-- Logo / Brand -->
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            HR
          </div>
          <h1 class="text-xl font-semibold">HR System</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle class="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your work email and password to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
              <!-- Error alert -->
              <div
                v-if="authStore.error"
                class="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              >
                {{ authStore.error }}
              </div>

              <div class="flex flex-col gap-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="you@company.com"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="flex flex-col gap-2">
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                />
              </div>

              <Button type="submit" class="w-full" :disabled="authStore.loading">
                <span v-if="authStore.loading">Signing in…</span>
                <span v-else>Sign in</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Change Password Dialog -->
    <ChangePasswordDialog
      :open="showChangePasswordDialog"
      :current-password="password"
      @update:open="(val) => (showChangePasswordDialog = val)"
      @success="handlePasswordChanged"
    />
  </div>
</template>
