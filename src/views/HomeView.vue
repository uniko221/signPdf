<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSignStores } from '@/stores/sign.js'

const router = useRouter()
const signStores = useSignStores()
const fileInput = ref(null)

const triggerUpload = () => {
  fileInput.value.click()
}


const handleHomeFile = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 將檔案存到 Pinia
  signStores.setPdfFile(file)

  // 跳轉到 About 頁面
  router.push('/about')
}
</script>

<template>
  <main>
    <!-- <TheWelco。e />。 -->
    <div class="h-screen md:bg-[url(../assets/images/bg.png)] bg-[url(../assets/images/bg_s.png)]  bg-center bg-cover ">
      <div
        class=" flex flex-col py-32 px-20 items-center justify-between   max-md:h-full md:absolute md:top-1/2 md:-translate-y-1/2 md:right-0 md:w-1/2 xl:right-1/6 xl:w-1/3">
        <div>
          <img alt="logo" class="" src="../assets/images/logo_b.png" />
          <h2 class="mt-3 text-secondary w-full  text-2xl" style="text-align-last: justify">線上簽署，方便快速。
          </h2>
        </div>

        <input type="file" ref="fileInput" accept="application/pdf" class="hidden" @change="handleHomeFile" />

        <button type="button" class="w-full p-6 mt-20 bg-light-main shadow-xl" @click="triggerUpload">
          簽署新文件
        </button>
      </div>

    </div>

  </main>
</template>
