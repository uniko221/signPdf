<template>
  <div class="flex ">
    <div class="bg-white lg:w-1/6 md:w-1/4 h-screen fixed py-20 px-4 overflow-auto hidden md:block">
      <div class="mb-4">
        <p>檔案名稱</p>
        <p>{{ signStores.pdfFile.name }}</p>
      </div>
      <hr>

      <div v-for="(image, i) in signStores.signImages" :key="i" @click="addSign(image)" class=" mt-4 ">
        <button @click="removeSign(i)">清除</button>
        <img :src="signStores.signImages[i]" class="border-2 border-dashed border-dark-grey" />

      </div>

      <button type="button" class="border-2 border-dashed border-dark-grey  w-full text-center mt-5 py-4"
        @click="openNewSign">建立新簽名
      </button>
    </div>

    <!-- 手機板簽名 -->
    <div class="fixed inset-x-0 bottom-18 bg-white block md:hidden">
      <p class="text-center p-4  cursor-pointer" @click="openMobileSign">
        我的簽名
      </p>

      <div class="overflow-auto  transition-all duration-300"
        :style="mobileSignOpen ? 'max-height:24rem' : 'max-height:0'">
        <div v-for="(image, i) in signStores.signImages" :key="i" @click="addSign(image)" class="mt-4">
          <img :src="image" class="border w-full" />
        </div>

        <button type="button" class="border-2 border-dashed border-dark-grey w-full text-center mt-5 py-4 mb-10"
          @click="openNewSign">
          建立新簽名
        </button>
      </div>
    </div>


    <div class="py-20   flex justify-center w-full overflow-x-auto">


      <div class=" md:max-w-4/5 overflow-x-auto">



        <canvas class="mt-4" v-for="(page, index) in pdfPages" :key="index"
          :ref="el => canvasRefs[index] = el"></canvas>
      </div>


    </div>

  </div>
  <footer class="bg-light-main p-4 fixed z-10 w-full bottom-0">

    <div class="w-full flex justify-between">
      <div>

      </div>
      <div><button @click="downloadPDF" class="bg-secondary text-white px-4 py-2 rounded-full">下載 PDF</button></div>
    </div>
  </footer>
  <ModalComp v-model:open="showModal" title="建立新簽名">
    <SignComp />
  </ModalComp>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import ModalComp from '@/components/ModalComp.vue';
import SignComp from '@/components/SignComp.vue';
import * as pdfjsLib from 'pdfjs-dist'
import * as fabric from 'fabric';
import { jsPDF } from "jspdf";
import { useSignStores } from '@/stores/sign.js';
const signStores = useSignStores();
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();


const Base64Prefix = 'data:application/pdf;base64,'



const pdfPages = ref([]) // 存每頁 Canvas 元素
const fabricCanvases = [] // 存每個 Fabric Canvas 實例
const canvasRefs = []

const readBlob = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result))
    reader.addEventListener('error', reject)
    reader.readAsDataURL(blob)
  })
}

async function renderPdf(file) {
  if (!file) return

  // 先清空上一次的 canvas
  fabricCanvases.forEach(c => c.dispose())
  fabricCanvases.length = 0
  pdfPages.value = []

  const pdfCanvasArr = await printPDF(file)
  pdfPages.value = pdfCanvasArr

  // 延遲，確保 canvas 元素在 DOM 中渲染完成
  await new Promise(resolve => setTimeout(resolve, 0))

  pdfCanvasArr.forEach((c, index) => {
    const canvasEl = canvasRefs[index]
    if (!canvasEl) return

    const fCanvas = new fabric.Canvas(canvasEl)
    const img = canvasToFabricImage(c)

    fCanvas.setWidth(img.width)
    fCanvas.setHeight(img.height)
    fCanvas.set("backgroundImage", img)
    fCanvas.renderAll()

    fabricCanvases.push(fCanvas)
  })
}



// 讀取 PDF，回傳 Canvas[]
async function printPDF(pdfData) {
  pdfData = await readBlob(pdfData)
  const data = atob(pdfData.substring(Base64Prefix.length))
  const loadingTask = pdfjsLib.getDocument({ data })
  const pdf = await loadingTask.promise
  const numPages = pdf.numPages

  const pagePromises = new Array(numPages).fill(0).map(async (_, i) => {
    const pageNumber = i + 1
    const pdfPage = await pdf.getPage(pageNumber)

    // 使用更高解析度（例如 2 或 3）
    const scale = 2 // 可依實際需求調整
    const viewport = pdfPage.getViewport({ scale })
    const canvasEl = document.createElement('canvas')
    const ctx = canvasEl.getContext('2d')
    canvasEl.width = viewport.width
    canvasEl.height = viewport.height

    await pdfPage.render({ canvasContext: ctx, viewport }).promise
    return canvasEl
  })

  return Promise.all(pagePromises)
}

// 將 Canvas 轉 Fabric Image
function canvasToFabricImage(pdfCanvas) {
  // 不再使用 1/devicePixelRatio
  return new fabric.Image(pdfCanvas, {
    scaleX: 1,
    scaleY: 1,
  })
}

const file1 = ref([])
// // 處理檔案上傳
// async function handleFile(e) {
//   const file = e.target.files[0]
//   file1.value = e.target.files[0]

//   if (!file) return

//   // 先清空上一次的 canvas
//   fabricCanvases.forEach(c => c.dispose())
//   fabricCanvases.length = 0
//   pdfPages.value = []

//   const pdfCanvasArr = await printPDF(file)
//   pdfPages.value = pdfCanvasArr

//   // 延遲 nextTick，確保 canvas 元素渲染完成
//   await new Promise(resolve => setTimeout(resolve, 0))

//   pdfCanvasArr.forEach((c, index) => {
//     // const canvasEl = document.getElementById(`canvas-${index}`)
//     const canvasEl = canvasRefs[index]
//     const fCanvas = new fabric.Canvas(canvasEl)
//     const img = canvasToFabricImage(c)
//     // 調整 Canvas 尺寸
//     fCanvas.setWidth(img.width)
//     fCanvas.setHeight(img.height)
//     // fCanvas.setBackgroundImage(img, fCanvas.requestRenderAll.bind(fCanvas))
//     fCanvas.set("backgroundImage", img);
//     fCanvas.renderAll();

//     fabricCanvases.push(fCanvas)


//   })
// }

let currentCanvasIndex = 0




onMounted(() => {
  window.addEventListener('scroll', updateCurrentCanvas)

  if (signStores.pdfFile) {
    renderPdf(signStores.pdfFile)
  }

  function updateCurrentCanvas() {
    let closestIndex = 0
    let minDist = Infinity

    canvasRefs.forEach((canvasEl, index) => {
      const rect = canvasEl.getBoundingClientRect()
      const dist = Math.abs(rect.top)
      if (dist < minDist) {
        minDist = dist
        closestIndex = index
      }
    })

    currentCanvasIndex = closestIndex
  }
})
// 將所有 Canvas 匯出成 PDF
function downloadPDF() {
  const pdf = new jsPDF();

  fabricCanvases.forEach((canvas, index) => {
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    const x = (pdfWidth - w) / 2;
    const y = (pdfHeight - h) / 2;

    if (index > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", x, y, w, h);
  });

  pdf.save("download.pdf");
}

const showModal = ref(false);

const openNewSign = () => {
  showModal.value = true;
};

const addSign = (dataUrl) => {
  console.log('接收到的簽名資料：', dataUrl);
  const canvas = fabricCanvases[currentCanvasIndex];
  if (!canvas) {
    console.error('找不到當前 canvas');
    return;
  }

  // 建立一個 HTML Image 物件
  const img = new Image();
  img.crossOrigin = 'anonymous'; // 加上比較保險
  img.onload = function () {
    const fabricImg = new fabric.Image(img, {
      left: 100,
      top: 100,
      scaleX: 0.5,
      scaleY: 0.5,
    });

    // ===== 加入刪除控制點 =====
    const deleteIcon =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle fill='%23F44336' cx='32' cy='32' r='30'/%3E%3Cg fill='white'%3E%3Crect x='28' y='16' width='8' height='32' transform='rotate(45 32 32)'/%3E%3Crect x='28' y='16' width='8' height='32' transform='rotate(-45 32 32)'/%3E%3C/g%3E%3C/svg%3E";

    const deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;

    function deleteObject(_eventData, transform) {
      const target = transform.target;
      const c = target.canvas;
      if (c) {
        c.remove(target);
        c.requestRenderAll();
      }
      return true;
    }

    function renderDeleteIcon(ctx, left, top, _styleOverride, fabricObject) {
      const size = this.cornerSize || 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    fabricImg.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderDeleteIcon,
      cornerSize: 24,
    });
    // =========================

    canvas.add(fabricImg);
    canvas.setActiveObject(fabricImg);
    canvas.requestRenderAll();
    console.log('✅ 成功把簽名加到 canvas 上');
  };

  img.onerror = (err) => {
    console.error('❌ 載入 image 失敗', err);
  };

  img.src = dataUrl; // 設定來源為你的 base64
};

const removeSign = (index) => {
  signStores.signImages.splice(index, 1);
};

const mobileSignOpen = ref(false);

const openMobileSign = () => {
  mobileSignOpen.value = !mobileSignOpen.value;
};

</script>

<style scoped></style>
