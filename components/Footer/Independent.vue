<template>
  <footer
    style="
      width: 100%;
      background-color: #221300;
      color: white;
      padding: 14px 0;
      display: flex;
      flex-direction: column;
    "
  >
    <p style="width: 100%; text-align: center; font-size: 14px;">Powered By</p>
    <a :href="prc.baseUrl" target="_blank" style="margin: 6px auto 0 auto">
      <img
        src="/images/logo-white.png"
        alt="logo"
        class="logo"
        style="width: 120px"
      />
    </a>
  </footer>
</template>

<script lang="ts" setup>
const { public: prc } = useRuntimeConfig();
</script>
