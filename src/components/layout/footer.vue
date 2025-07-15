<template>
  <v-footer class="footer-bg d-flex flex-column justify-center align-center text-center" height="auto">
    <!-- اللوجو -->
    <img
      src="../../../public/assets/logoAr.png"
      width="120"
      alt="أسرار السحابة"
    ></img>

    <!-- النص -->
    <div class="text-content mt-2">
      <p>مؤسسة أسرار السحابة لتقنية المعلومات</p>
      <p style="color: #52afe6;">سجل تجاري رقم: 1010625386</p>
    </div>

    <!-- أيقونات السوشيال -->
    <div class="social-icons mt-2" style="color: #263670;">
      <v-icon class="mx-2" size="22">mdi-linkedin</v-icon>
      <v-icon class="mx-2" size="22">mdi-twitter</v-icon>
      <v-icon class="mx-2" size="22">mdi-instagram</v-icon>
      <v-icon class="mx-2" size="22">mdi-facebook</v-icon>
    </div>

    <!-- الحقوق -->
    <div class="rights mt-2 mb-1">
      جميع الحقوق محفوظة © 2025  
      <span class="fw-bold">مؤسسة أسرار السحابة لتقنية المعلومات</span>
    </div>
  </v-footer>
</template>

<script setup>
</script>

<style scoped>
.footer-bg {
  background-image: url("/assets/footer.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  padding: 20px 0;
}

.text-content p {
  margin: 0;
  font-size: 15px;
  color: #333;
}

.social-icons {
  display: flex;
  justify-content: center;
}

.rights {
  font-size: 12px;
  color: #555;
  direction: rtl;
}

.fw-bold {
  font-weight: bold;
}
</style>
