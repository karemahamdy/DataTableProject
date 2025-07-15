<template>
  <v-app>
    <Navbar />
    <v-main>
      <ExcelExamplePage />
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/footer.vue'
import ExcelExamplePage from './components/ExcelExamplePage.vue'
</script>
