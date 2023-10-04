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
        :src="`/uploads/${props.organizer?.avatar}`"
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
      <div
        style="
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 18px;
        "
      >
        <ElCard
          v-for="(event, i) in props.events"
          :key="`event-${i}`"
          class="event"
          :body-style="{ padding: '0px' }"
        >
          <img
            :src="
              event.thumbnail
                ? `/uploads/${event.thumbnail}`
                : `/uploads/default.png`
            "
            alt="thumbnail"
            style="width: 100%; height: 200px; object-fit: cover"
          />
          <div style="padding: 14px">
            <p style="font-size: 18px; font-weight: 600">{{ event.title }}</p>
            <p style="font-size: 14px; margin-top: 2px">{{ event.body }}</p>
            <div
              style="
                display: flex;
                width: 100%;
                align-items: center;
                margin-top: 10px;
              "
            >
              <time style="font-size: 14px"
                >{{ new Date(event.startAt).toLocaleDateString() }}
                {{ new Date(event.startAt).toLocaleTimeString() }}</time
              >
              <a :href="`/${event.slug}`" style="margin-left: auto">
                <ElButton text type="primary" size="large">Lihat</ElButton>
              </a>
            </div>
          </div>
        </ElCard>
      </div>
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

.content .event {
  width: 100%;
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

  .content .event {
    width: calc(33.3% - 11px);
  }
}
</style>
