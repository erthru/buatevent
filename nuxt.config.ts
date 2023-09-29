// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ["trpc-nuxt"],
  },
  runtimeConfig: {
    port: process.env.PORT,
    tokenSecret: process.env.TOKEN_SECRET,
    public: {
      baseUrl: process.env.BASE_URL,
      appTitle: "Buat Event",
      appTagline: "Solusi Lengkap untuk Acara Anda",
      appDescription:
        "Manajemen acara yang mudah dan lengkap di Buat Event. Solusi terbaik untuk merencanakan, mendaftarkan, dan mengelola acara Anda dengan efisien.",
      databaseUrl: process.env.DATABASE_URL,
    },
  },
  modules: ["@element-plus/nuxt"],
  css: ["@/assets/styles/app.css"],
});
