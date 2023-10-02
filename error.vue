<template>
  <div
    class="wrapper"
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
    <ElCard style="width: 100%; max-width: 460px; margin: auto">
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
      <p
        style="
          text-align: justify;
          text-align: center;
          margin-bottom: 6px;
          margin-top: 16px;
        "
      >
        {{ errorMessage }}
      </p>
      <p
        style="
          font-size: 14px;
          color: var(--el-color-primary);
          font-weight: 500;
          cursor: pointer;
          text-align: center;
        "
        @click="redirect"
      >
        {{
          errorMessage === "token invalid"
            ? "Logout"
            : "Kembali ke halaman utama"
        }}
      </p>
    </ElCard>
  </div>
</template>

<script lang="ts" setup>
const { errorCode, errorMessage } = useCustomError();

const redirect = async () => {
  location.href = errorMessage.value === "token invalid" ? "/logout" : "/";
};
</script>

<style scoped>
.wrapper {
  padding: 16px;
}

@media (min-width: 768px) {
  .wrapper {
    padding: 24px;
  }
}
</style>
