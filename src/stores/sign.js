import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSignStores = defineStore(
  'sign',
  () => {
    const signImages = ref([])

    // 1. 新增存放 PDF 檔案的狀態（在記憶體中傳遞）
    const pdfFile = ref(null)

    // 2. 新增設定檔案的 Action
    function setPdfFile(file) {
      pdfFile.value = file
    }

    return {
      signImages,
      pdfFile,
      setPdfFile,
    }
  },
  {
    persist: {
      key: 'sign-storage',
      storage: localStorage,
      // 💡 重點：設定 paths，只持久化 signImages，排除 pdfFile
      paths: ['signImages'],
    },
  },
)
