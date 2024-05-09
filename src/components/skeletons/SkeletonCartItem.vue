<template>
  <q-card style="min-width: 320px">
    <q-card-section class="justify-around text-center items-center">
      <div class="row justify-around items-center">
        <q-skeleton type="QBtn" style="width: 50%" />
        <q-skeleton type="circle" size="120px" />
      </div>
      <div class="row justify-around">
        <q-skeleton type="text" width="40%" />
        <q-skeleton type="text" width="40%" />
      </div>
      <div class="row justify-center q-mt-sm">
        <q-skeleton type="text" width="60%" />
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="row justify-around">
        <q-skeleton type="QInput" width="40%" />
        <div style="width: 40%">
          <q-skeleton type="text" width="100%" />
          <q-skeleton type="text" width="100%" />
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="around">
      <q-btn flat round color="dark" icon="favorite" disabled />
      <q-btn flat round color="dark" icon="delete" disabled />
    </q-card-actions>
  </q-card>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "SkeletonCartItem",
  setup() {
    return {};
  },
});
</script>
