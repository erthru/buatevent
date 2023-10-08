// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ["trpc-nuxt"],
  },
  runtimeConfig: {
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL,
    tokenSecret: process.env.TOKEN_SECRET,
    mailerUser: process.env.MAILER_USER,
    mailerPassword: process.env.MAILER_PASSWORD,
    paymentApiUrl: process.env.PAYMENT_API_URL,
    paymentSecretKey: process.env.PAYMENT_SECRET_KEY,
    paymentWebhookKey: process.env.PAYMENT_WEBHOOK_KEY,
    public: {
      baseUrl: process.env.BASE_URL,
      appTitle: "Buat Event",
      appTagline: "Solusi Lengkap untuk Acara Anda",
      appDescription:
        "Manajemen acara yang mudah dan lengkap di Buat Event. Solusi terbaik untuk merencanakan, mendaftarkan, dan mengelola acara Anda dengan efisien.",
      paymentDashboardUrl: process.env.PAYMENT_DASHBOARD_URL,
      paymentPublicKey: process.env.PAYMENT_PUBLIC_KEY,
    },
  },
  modules: ["@element-plus/nuxt"],
  css: ["@/assets/styles/app.css"],
});
