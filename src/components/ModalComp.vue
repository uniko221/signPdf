<template>




  <div class="relative z-50" v-if="open">
    <div class="fixed flex items-center justify-center inset-0 bg-gray-800/75 " @click.self="handleClose">


      <div class="bg-white lg:w-1/2 md:w-2/3 w-full max-h-[80vh]  overflow-y-auto px-4 rounded-xl">
        <div class="flex justify-between items-center my-4">
          <h3 class="text-xl">{{ title }}</h3>
          <button type="button" class=" " @click="handleClose">
            關閉
          </button>
        </div>
        <slot />
      </div>


    </div>
  </div>

</template>

<script setup>
import { defineProps, defineEmits } from 'vue'


defineProps({
  title: String,
  open: Boolean,
})

const emit = defineEmits(['update:open'])

const handleClose = () => {
  emit('update:open', false)
}
</script>