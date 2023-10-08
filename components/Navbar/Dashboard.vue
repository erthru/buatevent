<template>
  <header style="display: flex; width: 100%">
    <ElIcon
      class="toggle"
      style="
        font-size: 28px;
        margin-top: 2px;
        margin-right: 16px;
        cursor: pointer;
      "
      @click="menu.openSidebar"
    >
      <Operation />
    </ElIcon>
    <div>
      <p class="title" style="font-weight: 600; color: #303133; flex: 1 1 0%">
        {{
          route.path === "/dashboard"
            ? `Hai, ${
                user?.role === "ADMIN"
                  ? user?.admin?.name.split(" ")[0]
                  : user?.organizer?.name.split(" ")[0]
              }`
            : menu.title.value
        }}
      </p>
      <a
        v-if="user?.role === 'ORGANIZER' && route.path === '/dashboard'"
        :href="`${protocol}//${user?.organizer?.username}.${host}`"
        target="_blank"
        style="font-size: 14px; font-weight: 600; margin-top: 10px"
      >
        Lihat Halaman
      </a>
      <ElBreadcrumb
        v-if="route.path !== '/dashboard'"
        separator="/"
        style="margin-top: 4px"
      >
        <ElBreadcrumbItem
          v-for="(breadcrumb, i) in menu.breadcrumbs.value"
          :key="`breadcrumb-${i}`"
          :to="
            i !== menu.breadcrumbs.value.length - 1 ? breadcrumb.to : undefined
          "
          >{{ breadcrumb.title }}</ElBreadcrumbItem
        >
      </ElBreadcrumb>
    </div>
    <ElAvatar
      :src="
        user?.role === 'ORGANIZER'
          ? `/uploads/${user?.organizer?.avatar || 'default.png'}`
          : '/uploads/default.png'
      "
      style="
        margin-left: auto;
        object-fit: cover;
        min-width: 40px;
        min-height: 40px;
        max-width: 40px;
        max-height: 40px;
      "
    />
  </header>
</template>

<script lang="ts" setup>
import { Operation } from "@element-plus/icons-vue";

const menu = useMenu();
const { user } = useUser();
const route = useRoute();
const { public: prc } = useRuntimeConfig();

const host = computed(() => {
  return prc.baseUrl.replaceAll("http://", "").replace("https://", "");
});

const protocol = computed(() => {
  return new URL(prc.baseUrl).protocol;
});
</script>

<style scoped>
header {
  padding: 16px 0;
}

header .toggle {
  display: block;
}

header .title {
  font-size: 24px;
}

@media (min-width: 768px) {
  header {
    padding: 24px 0;
  }

  header .title {
    font-size: 28px;
  }
}

@media (min-width: 1200px) {
  header .toggle {
    display: none;
  }
}
</style>
