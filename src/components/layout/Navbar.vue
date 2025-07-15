<template>
  <v-app-bar color="white" elevation="1" height="80" class="navbar-container" style="padding: 10px;">
    <v-spacer></v-spacer>
    <div class="logo-container">
      <img src="/assets/logoAr.png" width="80" alt="أسرار السحابة" />
    </div>
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<script setup>
</script>

<style scoped>
.navbar-container {
  direction: rtl;
  font-family: 'Arial', sans-serif;
}
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
