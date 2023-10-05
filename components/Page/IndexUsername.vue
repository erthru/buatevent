<template>
  <div style="width: 100%; display: flex; flex-direction: column">
    <header
      style="
        width: 100%;
        position: relative;
        display: flex;
        align-items: center;
      "
    >
      <p
        class="organizer-name"
        style="
          color: white;
          z-index: 20;
          text-align: center;
          padding: 0 18px;
          width: 100%;
          font-weight: 600;
        "
      >
        {{ props.organizer?.name }}
      </p>
      <img
        :src="`/uploads/${props.organizer?.avatar || 'default.png'}`"
        alt="avatar"
        style="width: 100%; height: 100%; object-fit: cover; position: absolute"
      />
      <div
        style="
          background-color: rgba(0, 0, 0, 0.6);
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        "
      />
    </header>
    <div class="content" style="width: 100%; max-width: 1200px; margin: 0 auto">
      <p style="font-size: 28px; font-weight: 600">Daftar Event</p>
      <p
        v-if="props.events.length === 0"
        style="font-size: 14px; margin-top: 10px"
      >
        Tidak ada event
      </p>
      <ListPublicOrganizerEvent
        :events="props.events"
        style="margin-top: 18px"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Prisma } from "@prisma/client";
import { PropType } from "nuxt/dist/app/compat/capi";

const props = defineProps({
  events: {
    type: Array as PropType<
      Prisma.EventGetPayload<{
        include: {
          organizer: true;
        };
      }>[]
    >,
    default: () => {
      return [];
    },
  },

  organizer: {
    type: Object as PropType<Prisma.OrganizerGetPayload<{}> | null>,
    default: () => {
      return null;
    },
  },
});
</script>

<style scoped>
header {
  height: 250px;
}

header .organizer-name {
  font-size: 26px;
}

.content {
  padding: 16px;
}

@media (min-width: 768px) {
  header {
    height: 340px;
  }

  header .organizer-name {
    font-size: 46px;
  }

  .content {
    width: 24px;
  }
}
</style>
