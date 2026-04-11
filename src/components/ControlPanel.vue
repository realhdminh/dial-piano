<script setup lang="ts">
import { Grid3x3 } from '@lucide/vue'

defineProps<{
  extended: boolean
}>()

const emit = defineEmits<{
  'update:extended': [value: boolean]
}>()
</script>

<template>
  <div class="control-panel flex w-full max-w-62 flex-col gap-2 sm:max-w-md sm:gap-3">
    <div class="flex flex-wrap items-center justify-center gap-2">
      <button
        class="flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-medium backdrop-blur-xl transition-all duration-150 sm:gap-2 sm:px-3 sm:text-sm"
        :class="
          extended
            ? 'border-glass-border-bright bg-glass-light text-white'
            : 'border-glass-border bg-glass text-white/50 hover:text-white/80'
        "
        type="button"
        @click="emit('update:extended', !extended)"
      >
        <Grid3x3 :size="14" />
        <span>18 Keys</span>
      </button>
    </div>
  </div>
</template>
