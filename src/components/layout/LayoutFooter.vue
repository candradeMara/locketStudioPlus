<template>
  <q-footer bordered>

  </q-footer>
</template>

<script>
import { defineComponent } from "vue";
import { date } from "quasar";
import { useUserStore } from "stores/user";
import { storeToRefs } from "pinia";


export default defineComponent({
  name: "LayoutFooter",

  async setup() {
    const year = date.formatDate(Date.now(), "YYYY");
    const userStore = useUserStore();
    const { isLoggedIn } = storeToRefs(userStore);
    return { isLoggedIn, year };
  },
});
</script>

<style lang="scss" scoped>
.footer {
  a.q-item {
    border-radius: 0.25rem;
    overflow: hidden;
    position: relative;
    transition: border 0.25s ease-out;

    &::after {
      content: "➔";
      display: flex;
      height: 100%;
      flex-direction: column;
      justify-content: center;
      position: absolute;
      right: -2rem;
      top: 0;
      transition: right 0.25s ease-out;
    }

    &:hover {
      border-left: 4px solid $dark;
      z-index: 2;

      &::after {
        right: 10px;
      }
    }
  }
}

.contact-info {
  padding-right: 2rem;

  .row {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
  }

  .col-6 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .q-item {
    margin-bottom: 0.25rem;
  }
}

.boilerplate {
  a {
    color: $grey-5;
    text-decoration: none;
    text-align: center;

    &:hover {
      color: white;
    }
  }
}

.disclaimer {
  font-size: 0.65rem;
}
</style>
