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
      <img
        :src="`/uploads/${data?.thumbnail || 'default.png'}`"
        alt="avatar"
        style="width: 100%; height: 100%; object-fit: cover"
      />
    </header>
    <div
      class="content"
      style="
        display: flex;
        width: 100%;
        gap: 16px;
        margin: 0 auto;
        max-width: 1200px;
      "
    >
      <ElCard style="width: 100%; flex: 1 1 0%"></ElCard>
      <ElCard class="sidebar"></ElCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dns from "dns";

definePageMeta({
  layout: "public-organizer",
});

const { $client, ssrContext } = useNuxtApp();
const { public: prc } = useRuntimeConfig();
const route = useRoute();
const { setError } = useCustomError();

const { data } = useLazyAsyncData("slug", async () => {
  try {
    const currentHost = process.server
      ? ssrContext?.event.node.req.headers.host
      : window.location.host;

    let username = currentHost?.split(".")[0];

    const currentHostWithoutUsername = currentHost
      ?.split(".")
      .slice(1)
      .join(".");

    const host = prc.baseUrl
      .replaceAll("http://", "")
      .replaceAll("https://", "");

    if (host === currentHost) {
      throw {
        data: {
          httpStatus: 404,
        },
        message: "not found",
      };
    }

    if (host !== currentHostWithoutUsername) {
      username = await new Promise((resolve, reject) => {
        dns.resolveCname(currentHostWithoutUsername!!, (error, addresses) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(addresses[0]);
        });
      });
    }

    const event = await $client.event.getByUsernameAndSlug.query({
      username: username!!,
      slug: route.params.slug as string,
    });

    if (!event) {
      throw {
        data: {
          httpStatus: 404,
        },
        message: "not found",
      };
    }

    return event;
  } catch (err: any) {
    setError(err?.data?.httpStatus || 500, err.message);
  }
});

useHead({
  title: `${data.value?.title} | ${prc.appTitle}`,
});
</script>

<style scoped>
header {
  height: 250px;
}

header .event-title {
  font-size: 26px;
}

.content {
  flex-direction: column;
  padding: 16px;
}

.content .sidebar {
  width: 100%;
}

@media (min-width: 768px) {
  header {
    height: 340px;
  }

  header .event-title {
    font-size: 46px;
  }

  .content {
    flex-direction: row;
    padding: 24px;
  }

  .content .sidebar {
    width: 350px;
  }
}
</style>
