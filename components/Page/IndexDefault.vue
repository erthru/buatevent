<template>
  <div>
    <img
      src="/images/banner.png"
      alt="banner"
      class="banner"
      style="width: 100%; object-fit: cover; border-radius: 4px"
    />
    <div
      class="categories"
      style="
        width: 100%;
        display: flex;
        overflow-x: auto;
        margin-top: 28px;
        height: 160px;
      "
      v-loading="state.isCategoriesLoading"
    >
      <NuxtLink
        v-for="(category, i) in state.categories"
        :to="`/categories/${category.slug}`"
        class="category"
        :key="`category-${i}`"
        style="color: inherit"
      >
        <img
          :src="`/uploads/${category.thumbnail}`"
          alt="category"
          style="
            border-radius: 100%;
            width: 100%;
            height: 100%;
            object-fit: cover;
          "
        />
        <p
          style="
            width: 100%;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            margin-top: 8px;
          "
        >
          {{ category.name }}
        </p>
      </NuxtLink>
    </div>
    <p class="relevan-event" style="font-size: 28px; font-weight: 600">Event</p>
    <p
      v-if="!state.isEventsLoading && state.events.length === 0"
      style="margin-top: 10px"
    >
      tidak ada event
    </p>
    <ListPublicEvents
      :events="state.events"
      style="margin-top: 16px; margin-bottom: 28px"
      v-loading="state.isEventsLoading"
    />
    <NuxtLink
      to="/events"
      style="margin: 0 auto; width: max-content; display: block"
    >
      <ElButton type="primary">Tampilkan Lebih Banyak</ElButton>
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
import { Prisma } from "@prisma/client";

const { $client } = useNuxtApp();

const state = reactive({
  isCategoriesLoading: false,
  categories: [] as Prisma.CategoryGetPayload<{}>[],
  isEventsLoading: false,
  events: [] as Prisma.EventGetPayload<{
    include: {
      organizer: true;
      category: true;
    };
  }>[],
});

const fetchCategories = async () => {
  try {
    state.isCategoriesLoading = true;
    const categories = await $client.category.getAll.query();
    state.categories = categories as any;
  } catch (err: any) {
    ElNotification({
      title: "Error",
      message: err.message,
      type: "error",
    });
  } finally {
    state.isCategoriesLoading = false;
  }
};

const fetchEvents = async () => {
  try {
    state.isEventsLoading = true;
    const events = await $client.event.getAllPublished.query({ q: "" });
    state.events = events.slice(0, 6) as any;
  } catch (err: any) {
    ElNotification({
      title: "Error",
      message: err.message,
      type: "error",
    });
  } finally {
    state.isEventsLoading = false;
  }
};

onMounted(() => {
  fetchCategories();
  fetchEvents();
});
</script>

<style scoped>
.banner {
  height: 240px;
  margin-top: -10px;
}

.categories {
  column-gap: 21px;
}

.categories .category {
  min-width: 95px;
  max-width: 95px;
  min-height: 95px;
  max-height: 95px;
}

.relevan-event {
  margin-top: -10px;
}

@media (min-width: 768px) {
  .banner {
    height: 350px;
    margin-top: -20px;
  }

  .categories {
    column-gap: 32px;
  }

  .categories .category {
    min-width: 115px;
    max-width: 115px;
    min-height: 115px;
    max-height: 115px;
  }

  .relevan-event {
    margin-top: 18px;
  }
}
</style>
