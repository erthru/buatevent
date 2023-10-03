<template>
  <nav
    style="
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      width: 100%;
      z-index: 10;
    "
    :style="{
      backgroundColor: state.isTransparent ? 'transparent' : 'white',
      boxShadow: state.isTransparent ? 'none' : 'var(--el-box-shadow-light)',
    }"
  >
    <div
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
          v-if="breakpoint === 'sm'"
          src="/images/logo-short.png"
          alt="logo"
          style="width: auto; height: 21px"
        />
        <img
          v-else
          src="/images/logo.png"
          alt="logo"
          style="width: auto; height: 21px"
        />
      </NuxtLink>
      <ElInput
        placeholder="Cari Event ..."
        class="search"
        style="flex: 1 1 0%"
        :prefix-icon="Search"
        size="large"
      />
      <div
        class="actions"
        style="
          margin-left: auto;
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
        <NuxtLink to="#contact" style="font-weight: 500; color: #303133"
          >Kontak</NuxtLink
        >
        <NuxtLink to="/login" style="font-weight: 500; color: #303133"
          >Login</NuxtLink
        >
        <NuxtLink to="/register" style="font-weight: 500; color: #303133"
          >Daftar</NuxtLink
        >
      </div>
    </div>
    <div
      class="mobile-actions"
      style="
        margin: 0 auto;
        font-size: 14px;
        column-gap: 18px;
        margin-top: 12px;
      "
    >
      <NuxtLink
        to="/dashboard/events/add"
        style="font-weight: 500; color: #303133"
        >Buat Event</NuxtLink
      >
      <NuxtLink to="#contact" style="font-weight: 500; color: #303133"
        >Kontak</NuxtLink
      >
      <NuxtLink to="/login" style="font-weight: 500; color: #303133"
        >Login</NuxtLink
      >
      <NuxtLink to="/register" style="font-weight: 500; color: #303133"
        >Daftar</NuxtLink
      >
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue";

const route = useRoute();
const breakpoint = useBreakpoint();

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
nav {
  padding: 12px 16px;
}

nav .search {
  max-width: 100%;
  margin-left: 12px;
}

nav .actions {
  display: none;
}

nav .mobile-actions {
  display: flex;
}

@media (min-width: 768px) {
  nav {
    padding: 14px 24px;
  }

  nav .search {
    max-width: 40%;
    margin-left: 28px;
  }

  nav .actions {
    display: flex;
  }

  nav .mobile-actions {
    display: none;
  }
}
</style>
