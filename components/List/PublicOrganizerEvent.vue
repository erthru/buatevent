<template>
  <div style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px">
    <ElCard
      v-for="(event, i) in props.events"
      :key="`event-${i}`"
      class="event"
      :body-style="{ padding: '0px' }"
    >
      <img
        :src="`/uploads/${event.thumbnail || 'default.png'}`"
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
            >{{ new Date(event.startAt).toLocaleDateString("id") }}
            {{ new Date(event.startAt).toLocaleTimeString("id") }}</time
          >
          <ElTag
            v-if="getExpired(event.endAt)"
            size="small"
            type="danger"
            style="margin-left: 8px"
            >Expired</ElTag
          >
          <a :href="`/${event.slug}`" style="margin-left: auto">
            <ElButton text type="primary" size="large">Lihat</ElButton>
          </a>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script lang="ts" setup>
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
});

const getExpired = (endAt: Date): boolean => {
  const todayTime = new Date().getTime();
  const endDayTime = new Date(endAt).getTime();
  return endDayTime < todayTime;
};
</script>

<style scoped>
.event {
  width: 100%;
}

@media (min-width: 768px) {
  .event {
    width: calc(33.3% - 11px);
  }
}
</style>
