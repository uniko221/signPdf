<template>
  <div class="p-4">
    <button id="add" @click="addRect" class="mb-2 px-3 py-1 bg-blue-500 text-white rounded">新增矩形</button>
    <canvas ref="canvasRef" width="800" height="600"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as fabric from 'fabric';

const canvasRef = ref(null)
let canvas = null
let deleteImg = null

// 🟥 SVG 刪除圖示
const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E"

// ✅ 刪除邏輯
function deleteObject(_eventData, transform) {
  const target = transform.target
  const c = target.canvas
  if (c) {
    c.remove(target)
    c.requestRenderAll()
  }
  return true
}

// ✅ 自訂控制點繪製圖示
function renderIcon(ctx, left, top, _styleOverride, fabricObject) {
  const size = this.cornerSize
  ctx.save()
  ctx.translate(left, top)
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
  ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size)
  ctx.restore()
}

// ✅ 新增矩形
function addRect() {
  if (!canvas) return

  const rect = new fabric.Rect({
    left: 100 + Math.random() * 200,
    top: 50 + Math.random() * 200,
    fill: 'yellow',
    width: 200,
    height: 100,
    objectCaching: false,
    stroke: 'lightgreen',
    strokeWidth: 4,
  })

  // 每個物件的刪除控制點
  rect.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderIcon,
    cornerSize: 24,
  })

  canvas.add(rect)
  canvas.setActiveObject(rect)
  canvas.requestRenderAll()
}

onMounted(() => {
  // 初始化 Canvas
  canvas = new fabric.Canvas(canvasRef.value)
  deleteImg = document.createElement('img')
  deleteImg.src = deleteIcon

  // 控制點設定
  fabric.Object.prototype.transparentCorners = false
  fabric.Object.prototype.cornerColor = 'blue'
  fabric.Object.prototype.cornerStyle = 'circle'

  // 初始加一個矩形
  addRect()
})

onBeforeUnmount(() => {
  if (canvas) {
    canvas.dispose()
    canvas = null
  }
})
</script>

<style scoped>
canvas {
  border: 1px solid #ccc;
  display: block;
}
</style>
