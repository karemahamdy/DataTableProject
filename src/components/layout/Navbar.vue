<template>
  <v-app>
    <v-app-bar app color="white" elevation="1" height="80" class="navbar-container" style="padding: 10px;">
      <v-spacer></v-spacer>
      <div class="logo-container">
        <img src="/assets/logoAr.png" width="80" alt="أسرار السحابة" />
      </div>
      <v-spacer></v-spacer>
    </v-app-bar>
  </v-app>
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
.contact-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  font-weight: 500;
  padding: 0 24px;
  height: 40px;
}
.nav-item {
  font-size: 14px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  padding: 0 16px;
  height: 40px;
}
.nav-item:hover {
  background-color: rgba(25, 118, 210, 0.08);
  color: #1976d2;
}
.active-nav {
  color: #1976d2;
  position: relative;
}
.active-nav::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background: #1976d2;
  border-radius: 2px;
}
.logo {
  cursor: pointer;
}
.v-btn .v-icon--start {
  margin-inline-start: 0;
  margin-inline-end: 8px;
}
.v-btn .v-icon--end {
  margin-inline-start: 8px;
  margin-inline-end: 0;
}
@media (max-width: 960px) {
  .nav-item {
    display: none;
  }
  .contact-btn {
    font-size: 12px;
    padding: 0 16px;
  }
}
@media (max-width: 600px) {
  .navbar-container {
    padding: 0 8px;
  }
  .contact-btn {
    height: 36px;
    font-size: 12px;
  }
}
</style>
