<template>
  <div
    style="
      z-index: 9999;
      display: flex;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: 100%;
      background-color: #f9f9f9;
      align-items: center;
    "
  >
    <ElCard style="margin: auto">
      <p
        style="
          text-align: center;
          font-weight: 600;
          font-size: 58px;
          color: var(--el-color-primary);
        "
      >
        {{ errorCode }}
      </p>
      <p style="text-align: justify; text-align: center; margin-bottom: 10px;">{{ errorMessage }}</p>
      <a
        :href="prc.baseUrl"
        style="text-align: center; font-size: 14px"
        >Kembali ke halaman utama</a
      >
    </ElCard>
  </div>
</template>

<script lang="ts" setup>
const { errorCode, errorMessage } = useCustomError();
const { public: prc } = useRuntimeConfig();
</script>
