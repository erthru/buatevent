<template>
  <header
    style="width: 100%; position: relative; display: flex; align-items: center"
  >
    <p
      class="event-title"
      style="
        color: white;
        z-index: 20;
        text-align: center;
        padding: 0 18px;
        width: 100%;
        font-weight: 600;
      "
    >
      {{ data?.title }}
    </p>
    <img
      :src="`/uploads/${data?.thumbnail || 'default.png'}`"
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
</template>

<script lang="ts" setup>
import dns from "dns";

definePageMeta({
  layout: "independent",
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
</script>

<style scoped>
header {
  height: 250px;
}

header .event-title {
  font-size: 26px;
}

@media (min-width: 768px) {
  header {
    height: 340px;
  }

  header .event-title {
    font-size: 46px;
  }
}
</style>
