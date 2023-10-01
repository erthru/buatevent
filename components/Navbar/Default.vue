<template>
  <nav
    style="position: sticky; top: 0; display: flex; width: 100%"
    :style="{
      backgroundColor: state.isTransparent ? 'transparent' : 'white',
      boxShadow: state.isTransparent ? 'none' : 'var(--el-box-shadow-light)',
    }"
  >
    <div
      class="wrapper"
      style="
        display: flex;
        width: 100%;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      "
    >
      <NuxtLink to="/">
        <img
          src="/images/logo.png"
          alt="logo"
          style="width: auto; height: 21px"
        />
      </NuxtLink>
      <ElInput
        placeholder="Cari Event ..."
        class="search"
        style="flex: 1 1 0%; margin-left: 28px"
        :prefix-icon="Search"
        size="large"
      />
      <div
        class="actions"
        style="
          margin-left: auto;
          display: flex;
          align-items: center;
          column-gap: 26px;
          font-size: 14px;
        "
      >
        <NuxtLink
          to="/dashboard/events/add"
          style="font-weight: 500; color: #303133"
          >Buat Event</NuxtLink
        >
        <NuxtLink to="/help" style="font-weight: 500; color: #303133"
          >Bantuan</NuxtLink
        >
        <NuxtLink to="/login" style="font-weight: 500; color: #303133"
          >Login</NuxtLink
        >
        <NuxtLink to="/register" style="font-weight: 500; color: #303133"
          >Daftar</NuxtLink
        >
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue";

const route = useRoute();

const state = reactive({
  isTransparent: true,
});

const checkTransparent = () => {
  state.isTransparent = route.path === "/" && window.scrollY < 1;
};

onMounted(() => {
  checkTransparent();

  window.addEventListener("scroll", () => {
    console.log(window.scrollY);
    checkTransparent();
  });
});

watch(
  () => route.path,
  () => {
    checkTransparent();
  }
);
</script>

<style scoped>
nav .wrapper {
  padding: 12px 16px;
}

nav .wrapper .search {
  max-width: 80%;
}

@media (min-width: 768px) {
  nav .wrapper {
    padding: 14px 24px;
  }

  nav .wrapper .search {
    max-width: 40%;
  }
}
</style>
