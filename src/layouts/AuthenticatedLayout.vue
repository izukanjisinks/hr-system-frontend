<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ForbiddenDialog from '@/components/common/ForbiddenDialog.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { useForbiddenHandler } from '@/composables/useForbiddenHandler'

const { showForbiddenDialog, forbiddenResourceName, hideForbidden } = useForbiddenHandler()
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <RouterView />
    </SidebarInset>

    <!-- Global Forbidden Dialog -->
    <ForbiddenDialog
      :open="showForbiddenDialog"
      :resource-name="forbiddenResourceName"
      @update:open="hideForbidden"
    />
  </SidebarProvider>
</template>
