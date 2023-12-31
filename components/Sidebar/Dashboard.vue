<template>
  <div
    class="wrapper"
    style="z-index: 4"
    :style="{
      minWidth: menu.isSidebarOpen.value ? '275px' : '0px',
      maxWidth: menu.isSidebarOpen.value ? '275px' : '0px',
      overflowX: menu.isSidebarOpen.value ? 'unset' : 'hidden',
    }"
  >
    <aside
      class="sidebar"
      style="
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: all 0.2s;
        overflow-y: auto;
      "
      :style="{
        minWidth: menu.isSidebarOpen.value ? '275px' : '0px',
        maxWidth: menu.isSidebarOpen.value ? '275px' : '0px',
        overflowX: menu.isSidebarOpen.value ? 'unset' : 'hidden',
      }"
    >
      <NuxtLink
        to="/"
        style="margin-top: 52px; margin-left: auto; margin-right: auto"
      >
        <img
          src="/images/logo.png"
          alt="log"
          style="width: 165px; height: auto"
        />
      </NuxtLink>
      <ul
        style="
          padding-bottom: 38px;
          margin-top: 56px;
          display: flex;
          flex-direction: column;
          row-gap: 10px;
        "
      >
        <template v-for="(item, i) in sidebarItems">
          <li
            v-if="item.isShown"
            :key="`si-${i}`"
            style="padding: 0 16px 0 10px"
            :style="{
              borderLeft: `4px solid ${
                item.isActive ? 'var(--el-color-primary)' : 'transparent'
              }`,
            }"
          >
            <NuxtLink :to="item.to" @click="item.onClick">
              <div
                style="
                  padding: 12px 18px;
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  column-gap: 16px;
                "
                :style="{
                  backgroundColor: `${
                    item.isActive ? '#f5ebe1' : 'transparent'
                  }`,
                }"
              >
                <ElIcon
                  style="font-size: 20px"
                  :style="{
                    color: `${
                      item.isActive ? 'var(--el-color-primary)' : '#909399'
                    }`,
                  }"
                >
                  <component :is="item.icon" />
                </ElIcon>
                <p
                  style="font-size: 17px; font-weight: 500"
                  :style="{
                    color: `${
                      item.isActive ? 'var(--el-color-primary)' : '#909399'
                    }`,
                  }"
                >
                  {{ item.title }}
                </p>
              </div>
            </NuxtLink>
          </li>
        </template>
      </ul>
      <NuxtLink
        v-if="user?.role === 'ORGANIZER'"
        to="/dashboard/events/add"
        style="
          margin: auto 32px 32px 32px;
          padding: 14px 18px;
          background-color: #edd7bc;
          display: flex;
          align-items: center;
          color: black;
        "
      >
        <p
          style="
            line-height: 21px;
            font-size: 15px;
            font-weight: 500;
            color: #303133;
          "
        >
          Buat Event<br />Baru
        </p>
        <div
          to="/dashboard/events/add"
          style="
            margin-left: auto;
            background-color: var(--el-color-primary);
            height: 36px;
            width: 36px;
            border-radius: 100%;
            display: flex;
            align-items: center;
          "
        >
          <ElIcon style="color: white; font-size: 16px; margin: auto">
            <Plus />
          </ElIcon>
        </div>
      </NuxtLink>
    </aside>
    <div
      v-if="menu.isSidebarOpen.value"
      class="sidebar-overlay"
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 3;
      "
      @click="menu.closeSidebar()"
    />
    <ClientOnly>
      <ElDialog
        v-model="state.isContactModalShown"
        title="Kontak"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :width="breakpoint === 'sm' ? '90%' : '460px'"
      >
        <div style="display: flex; align-items: center">
          <ElIcon style="font-size: 18px">
            <Phone />
          </ElIcon>
          <p style="margin-left: 8px">(+62)812 3456 7890</p>
        </div>
        <div style="display: flex; align-items: center; margin-top: 6px">
          <ElIcon style="font-size: 18px">
            <Message />
          </ElIcon>
          <p style="margin-left: 8px">contact@buatevent.com</p>
        </div>
        <template #footer>
          <ElButton @click="state.isContactModalShown = false">Tutup</ElButton>
        </template>
      </ElDialog>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import {
  Calendar,
  House,
  Service,
  Setting,
  SwitchButton,
  Plus,
  Phone,
  Message,
User,
} from "@element-plus/icons-vue";

const route = useRoute();
const breakpoint = useBreakpoint();
const menu = useMenu();
const { user } = useUser();

const state = reactive({
  isContactModalShown: false,
});

const sidebarItems = computed(() => {
  return [
    {
      title: "Dashboard",
      to: "/dashboard",
      isActive: route.path === "/dashboard",
      icon: House,
      isShown: true,
      onClick: () => {
        onItemClick();
      },
    },
    {
      title: "Organizer",
      to: "/dashboard/organizers",
      isActive: route.path.includes("/dashboard/organizers"),
      icon: User,
      isShown: user.value?.role === "ADMIN",
      onClick: () => {
        onItemClick();
      },
    },
    {
      title: "Event",
      to: "/dashboard/events",
      isActive: route.path.includes("/dashboard/events"),
      icon: Calendar,
      isShown: user.value?.role === "ORGANIZER",
      onClick: () => {
        onItemClick();
      },
    },
    {
      title: "Pengaturan",
      to: "/dashboard/setting",
      isActive: route.path.includes("/dashboard/setting"),
      icon: Setting,
      isShown: true,
      onClick: () => {
        onItemClick();
      },
    },
    {
      title: "Kontak",
      to: "#contact",
      isActive: false,
      icon: Service,
      isShown: true,
      onClick: () => {
        onItemClick();
        state.isContactModalShown = true;
      },
    },
    {
      title: "Logout",
      to: "#logout",
      isActive: false,
      icon: SwitchButton,
      isShown: true,
      onClick: () => {
        location.href = "/logout";
      },
    },
  ];
});

const onItemClick = () => {
  if (["lg", "md", "sm"].includes(breakpoint.value)) {
    menu.closeSidebar();
  }
};

onMounted(() => {
  if (breakpoint.value === "xl") {
    menu.openSidebar();
  }
});
</script>

<style scoped>
.wrapper {
  position: fixed;
}

.wrapper .sidebar {
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 4;
}

.wrapper .sidebar-overlay {
  display: flex;
}

@media (min-width: 1200px) {
  .wrapper {
    position: relative;
  }

  .wrapper .sidebar {
    background-color: transparent;
    position: fixed;
  }

  .wrapper .sidebar-overlay {
    display: none;
  }
}
</style>
