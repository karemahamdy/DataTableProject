<template>
  <v-container fluid>
    <v-row class="justify-center mb-4 mt-4" no-gutters>
        <v-col cols="auto">
        <v-btn color="primary" @click="handleSearch">
          بحث
        </v-btn>
      </v-col>
      <v-col cols="2">
        <v-text-field
          v-model="searchKeyword"
          label="بحث"
          density="compact"
          hide-details
          variant="outlined"
           dir="rtl"
          class="search-input ml-2 text-right text-field-rtl"
        ></v-text-field>
      </v-col>
    </v-row>

    <div ref="hotContainer" style="height: 500px; width: 100%; overflow: hidden;"></div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.min.css'

const hotContainer = ref(null)
let hotInstance = null

const searchKeyword = ref('')
let originalData = []

const generateMockData = () => {
  const data = []
  for (let i = 1; i <= 200000; i++) {
    data.push([
      i,
      `First${i}`,
      `Last${i}`,
      Math.floor(Math.random() * 80) + 18,
      `Email${i}@test.com`,
      `Country${i % 50}`,
      `Job${i % 20}`,
      `Status${i % 3 === 0 ? 'Active' : 'Inactive'}`
    ])
  }
  return data
}

const fetchData = () => {
  originalData = generateMockData()

  hotInstance = new Handsontable(hotContainer.value, {
    data: originalData,
    colHeaders: ['ID', 'First Name', 'Last Name', 'Age', 'Email', 'Country', 'Job', 'Status'],
    rowHeaders: true,
    licenseKey: 'non-commercial-and-evaluation',
    renderAllRows: false,
    autoRowSize: false,
    autoColumnSize: false,
    viewportRowRenderingOffset: 850,
    width: '100%',
    height: 500,
    stretchH: 'all',
  })
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    hotInstance.loadData(originalData)
    return
  }

  const filtered = originalData.filter(row =>
    row.some(cell => String(cell).toLowerCase().includes(keyword))
  )

  hotInstance.loadData(filtered)
}

onMounted(() => {
  fetchData()
})
</script>

<style >
.search-input {
  min-width: 200px;
  max-width: 300px;
 text-align: right;  
}
.ml-2 {
  margin-left: 0.5rem;
}
.search-input input {
  text-align: right !important;
}

.search-input label {
  right: 0;
  left: auto;
  text-align: right;
}

/* global styles */
.text-field-rtl input {
  text-align: right !important;
}

.text-field-rtl label {
  text-align: right !important;
  right: 0 !important;
  left: auto !important;
}
</style>
