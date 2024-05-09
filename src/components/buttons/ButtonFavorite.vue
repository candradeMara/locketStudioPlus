<template>
  <q-btn
    flat
    round
    color="dark"
    :icon="favorite ? 'favorite' : 'favorite_border'"
    class="favorite"
    :class="favorite ? 'is-favorite' : ''"
    @click.prevent="toggle()"
  >
    <q-tooltip v-if="tooltip">{{
      favorite ? "Remove Favorite" : "Add Favorite"
    }}</q-tooltip>
  </q-btn>
</template>
<script>
import { computed, defineComponent } from "vue";
import { useUserStore } from "stores/user";

export default defineComponent({
  name: "ButtonFavorite",
  props: {
    sku: {
      type: String,
      required: true,
    },
    tooltip: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const userStore = useUserStore();
    const favorite = computed(() => {
      return userStore.isFavorite(props.sku);
    });
    const toggle = async () => {
      userStore.toggleFavorite(props.sku);
      return null;
    };
    return { favorite, toggle };
  },
});
</script>
