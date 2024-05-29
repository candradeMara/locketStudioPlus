<template>
  <q-footer bordered>

  </q-footer>
</template>

<script>
import { date } from "quasar";

export default {
  setup() {
    const year = date.formatDate(Date.now(), "YYYY");
    return { year };
  },
};
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
</style>
