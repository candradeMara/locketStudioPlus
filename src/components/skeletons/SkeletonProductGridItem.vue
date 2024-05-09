<template>
  <q-card>
    <div class="row justify-around">
      <q-btn flat round color="dark" icon="favorite" disabled />
      <q-skeleton type="text" width="30%" />
      <q-btn flat round color="dark" icon="shopping_basket" disabled />
    </div>
    <q-card-section class="row justify-center">
      <q-skeleton type="circle" size="180px" />
    </q-card-section>
  </q-card>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "SkeletonProductGridItem",
  setup() {
    return {};
  },
});
</script>
