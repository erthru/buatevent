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
      <p class="title" style="font-weight: 600">{{ menu.title.value }}</p>
      <ElBreadcrumb separator="/" style="margin-top: 4px">
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
    <ElAvatar style="margin-left: auto">{{
      user?.role === "ADMIN"
        ? `${user.admin?.name[0].toUpperCase()}${user.admin?.name[1].toUpperCase()}`
        : `${user?.organizer?.name[0].toUpperCase()}${user?.organizer?.name[1].toUpperCase()}`
    }}</ElAvatar>
  </header>
</template>

<script lang="ts" setup>
import { Operation } from "@element-plus/icons-vue";

const menu = useMenu();
const { user } = useUser();
</script>

<style scoped>
header {
  padding: 16px;
}

header .toggle {
  display: block;
}

header .title {
  font-size: 24px;
}

@media (min-width: 768px) {
  header {
    padding: 24px;
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
