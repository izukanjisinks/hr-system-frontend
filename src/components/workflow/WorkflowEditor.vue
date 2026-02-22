<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { useWorkflowStore } from '@/stores/workflow'
import StateNode from './StateNode.vue'
import TransitionEdge from './TransitionEdge.vue'
import type { Connection, Node } from '@vue-flow/core'
import type { WorkflowState } from '@/stores/workflow'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const workflowStore = useWorkflowStore()
const { onConnect, onNodeDragStop, addNodes, project, vueFlowRef } = useVueFlow()

const nodeTypes = {
  state: StateNode,
}

const edgeTypes = {
  default: TransitionEdge,
}

const defaultEdgeOptions = {
  type: 'default',
  markerEnd: MarkerType.ArrowClosed,
}

// Watch for changes in current workflow
watch(
  () => workflowStore.currentWorkflow,
  (newWorkflow) => {
    if (newWorkflow) {
      // Nodes and edges are already reactive
    }
  },
  { immediate: true }
)

// Handle new connections
onConnect((connection: Connection) => {
  if (!connection.source || !connection.target) return

  const newEdge = {
    id: `e${Date.now()}`,
    source: connection.source,
    target: connection.target,
    type: 'default',
    markerEnd: MarkerType.ArrowClosed,
    data: { name: 'Transition' },
  }

  workflowStore.addEdge(newEdge)
})

// Handle node drag
onNodeDragStop((event) => {
  const node = event.node
  workflowStore.updateNodePosition(node.id, node.position)
})

// Handle drop from palette
function onDrop(event: DragEvent) {
  if (!event.dataTransfer) return

  const stateType = event.dataTransfer.getData('application/vueflow') as 'initial' | 'middle' | 'final'
  if (!stateType) return

  const { left, top } = vueFlowRef.value?.getBoundingClientRect() || { left: 0, top: 0 }
  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  })

  const newNode: Node<WorkflowState> = {
    id: `node-${Date.now()}`,
    type: 'state',
    position,
    data: {
      id: `node-${Date.now()}`,
      name: `New ${stateType} State`,
      stateType,
      displayOrder: (workflowStore.currentWorkflow?.nodes.length || 0) + 1,
    },
  }

  workflowStore.addNode(newNode)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}
</script>

<template>
  <div class="w-full h-full">
    <VueFlow
      v-if="workflowStore.currentWorkflow"
      v-model:nodes="workflowStore.currentWorkflow.nodes"
      v-model:edges="workflowStore.currentWorkflow.edges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :default-edge-options="defaultEdgeOptions"
      class="bg-background"
      @drop="onDrop"
      @dragover="onDragOver"
      fit-view-on-init
    >
      <Background pattern-color="#aaa" :gap="16" />
      <Controls />
      <MiniMap />
    </VueFlow>
    <div v-else class="flex items-center justify-center h-full text-muted-foreground">
      Select a workflow to edit
    </div>
  </div>
</template>

<style>
.vue-flow__node {
  border-radius: 8px;
}

.vue-flow__edge-path {
  stroke-width: 2;
}

.vue-flow__minimap {
  background-color: hsl(var(--background));
}
</style>
