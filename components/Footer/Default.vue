<template>
  <footer
    style="width: 100%; background-color: #221300; color: white; display: flex"
  >
    <div
      class="wrapper"
      style="margin: 0 auto; width: 100%; max-width: 1200px; display: flex"
    >
      <div style="width: 100%; display: flex; flex-direction: column">
        <img
          src="/images/logo-white.png"
          alt="logo"
          class="logo"
          style="width: 160px"
        />
        <p
          class="tagline"
          style="margin-top: 8px; font-size: 15px; font-weight: 500"
        >
          {{ prc.appTagline }}
        </p>
        <p class="copyright" style="font-size: 12px; margin-top: 4px">
          © {{ year }} Buat Event
        </p>
      </div>
      <div style="width: 100%; display: flex; flex-direction: column">
        <p class="links" style="font-weight: 600; font-size: 24px">Links</p>
        <div
          class="link-items"
          style="
            width: 100%;
            display: flex;
            flex-direction: column;
            row-gap: 14px;
            margin-top: 21px;
          "
        >
          <NuxtLink style="font-size: 14px; color: white; font-weight: 500"
            >Buat Event</NuxtLink
          >
          <NuxtLink style="font-size: 14px; color: white; font-weight: 500"
            >Kontak</NuxtLink
          >
          <NuxtLink style="font-size: 14px; color: white; font-weight: 500"
            >Login</NuxtLink
          >
          <NuxtLink style="font-size: 14px; color: white; font-weight: 500"
            >Daftar</NuxtLink
          >
        </div>
      </div>
      <div
        id="#contact"
        style="
          width: 100%;
          font-size: 14px;
          display: flex;
          flex-direction: column;
        "
      >
        <p class="contact" style="font-weight: 600; font-size: 24px">Kontak</p>
        <div
          class="contact-item"
          style="display: flex; align-items: center; margin-top: 21px"
        >
          <ElIcon style="font-size: 18px">
            <Phone />
          </ElIcon>
          <p style="margin-left: 4px">(+62)812 3456 7890</p>
        </div>
        <div
          class="contact-item"
          style="display: flex; align-items: center; margin-top: 6px"
        >
          <ElIcon style="font-size: 18px">
            <Message />
          </ElIcon>
          <p style="margin-left: 4px">contact@buatevent.com</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { Phone, Message } from "@element-plus/icons-vue";

const { public: prc } = useRuntimeConfig();
const year = new Date().getFullYear();
</script>

<style scoped>
footer {
  padding: 16px;
}

footer .wrapper {
  flex-direction: column;
  row-gap: 48px;
}

footer .wrapper .logo {
  margin: 0 auto;
}

footer .wrapper .tagline {
  text-align: center;
}

footer .wrapper .copyright {
  text-align: center;
}

footer .wrapper .links {
  text-align: center;
}

footer .wrapper .link-items {
  text-align: center;
}

footer .wrapper .contact {
  text-align: center;
}

footer .wrapper .contact-item {
  margin: 0 auto;
}

@media (min-width: 768px) {
  footer {
    padding: 24px;
  }
  footer .wrapper {
    flex-direction: row;
    row-gap: 0;
  }

  footer .wrapper .logo {
    margin: 0;
  }

  footer .wrapper .tagline {
    text-align: left;
  }

  footer .wrapper .copyright {
    text-align: left;
  }

  footer .wrapper .links {
    text-align: left;
  }

  footer .wrapper .link-items {
    text-align: left;
  }

  footer .wrapper .contact {
    text-align: left;
  }

  footer .wrapper .contact-item {
    margin: 0;
  }
}
</style>
