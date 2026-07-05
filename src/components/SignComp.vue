<template>
  <div class="p-4 space-y-4">
    <canvas ref="canvasRef" class="border border-black w-full" @mousedown="startPosition" @mouseup="finishedPosition"
      @mouseleave="finishedPosition" @mousemove="draw" @touchstart="startPosition" @touchend="finishedPosition"
      @touchcancel="finishedPosition" @touchmove="draw"></canvas>

    <div class="space-x-2 flex justify-end">
      <button @click="reset" class="border  px-3 py-1">清除</button>
      <button @click="save" class="border bg-secondary text-white px-3 py-1">儲存</button>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSignStores } from '@/stores/sign.js';
const signStores = useSignStores();
const canvasRef = ref(null);
let ctx = null;
let isPainting = false;



onMounted(() => {
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  // 設定繪圖區域大小為 canvas 元素的實際顯示大小
  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx = canvas.getContext("2d");
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
});


function getPaintPosition(e) {
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();

  if (e.type.includes("mouse")) {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  } else {
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }
}

function startPosition(e) {
  e.preventDefault();
  isPainting = true;
}

function finishedPosition() {
  isPainting = false;
  ctx.beginPath();
}

function draw(e) {
  if (!isPainting) return;
  const pos = getPaintPosition(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function reset() {
  const canvas = canvasRef.value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function save() {
  const canvas = canvasRef.value;


  signStores.signImages.push(canvas.toDataURL("image/png"));
}
</script>
