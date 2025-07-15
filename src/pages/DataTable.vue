<template>
  <div>
  
    <div ref="hotContainer" style="height: 500px; overflow: hidden;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.min.css'

const hotContainer = ref(null)
let hotInstance = null

const searchKeyword = ref('')
let originalData = []

// function to generate mock data
const generateMockData = () => {
  const data = []
  for (let i = 1; i <= 200000; i++) {
    data.push([i, `First${i}`, `Last${i}`, Math.floor(Math.random() * 80) + 18])
  }
  return data
}

const fetchData = () => {
  originalData = generateMockData()

  hotInstance = new Handsontable(hotContainer.value, {
    data: originalData,
    colHeaders: ['ID', 'First Name', 'Last Name', 'Age'],
    rowHeaders: true,
    licenseKey: 'non-commercial-and-evaluation',
    renderAllRows: false,
    autoRowSize: false,
    autoColumnSize: false,
    viewportRowRenderingOffset: 850,
  })
}


onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.my-3 {
  margin: 1rem 0;
}
</style>
