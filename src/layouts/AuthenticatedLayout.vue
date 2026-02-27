<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ForbiddenDialog from '@/components/common/ForbiddenDialog.vue'
import ResultDialog from '@/components/common/ResultDialog.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { useForbiddenHandler } from '@/composables/useForbiddenHandler'
import { useResultDialog } from '@/composables/useResultDialog'

const { showForbiddenDialog, forbiddenResourceName, hideForbidden } = useForbiddenHandler()
const { resultDialogOpen, resultDialogType, resultDialogTitle, resultDialogMessage, hideResult } = useResultDialog()
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

    <!-- Global Result Dialog -->
    <ResultDialog
      :open="resultDialogOpen"
      :type="resultDialogType"
      :title="resultDialogTitle"
      :message="resultDialogMessage"
      @update:open="hideResult"
    />
  </SidebarProvider>
</template>
