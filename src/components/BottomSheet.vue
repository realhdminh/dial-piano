<script setup lang="ts">
import { X } from '@lucide/vue'

defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="fixed inset-0 z-40">
        <div
          class="absolute inset-0 bg-black/55 backdrop-blur-sm"
          aria-hidden="true"
          @click="emit('close')"
        />
        <div
          class="sheet-panel absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-white/12 bg-zinc-950/95 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl ring-1 ring-inset ring-white/6 backdrop-blur-2xl"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <span
            class="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-white/20"
            aria-hidden="true"
          />
          <div class="flex shrink-0 items-center justify-between px-5 pb-3">
            <h2 class="text-sm font-semibold tracking-tight text-white/90">{{ title }}</h2>
            <button
              type="button"
              class="rounded-lg p-1.5 text-white/50 transition-colors hover:text-white"
              aria-label="Close"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>
          </div>
          <div
            class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-4"
            :class="$slots.footer ? 'pb-0' : ''"
          >
            <slot />
          </div>
          <div v-if="$slots.footer" class="shrink-0 px-4 pb-2 pt-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 0.32s cubic-bezier(0.33, 1, 0.68, 1);
}
.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}
</style>
