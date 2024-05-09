<template>
  <q-carousel
    v-model="slide"
    transition-prev="slide-right"
    transition-next="slide-left"
    swipeable
    animated
    control-color="black"
    navigation
    arrows
    height="auto"
    class="carousel text-black"
  >
    <q-carousel-slide
      v-for="n in slideRows"
      :key="n"
      class="text-black"
      :name="n"
    >
      <div class="row q-gutter-md">
        <router-link
          v-for="i in slidesPerRow"
          :key="i"
          exact
          class="col"
          :to="`/shop/product/${(n - 1) * slidesPerRow + i}`"
        >
          <q-img
            :ratio="1"
            :src="`https://via.placeholder.com/200x200?text=product-${
              (n - 1) * slidesPerRow + i
            }`"
          />
        </router-link>
      </div>
    </q-carousel-slide>
  </q-carousel>
</template>

<script>
// TODO: width implementation doesn't work because it's based on screensize not container size
// FIXED, but need to add hand icon and maybe show link?
// It's also not refreshing page when on a single product... hmmm...

// TODO: have fallback if number of products is below threshold.
import { ref, computed } from "vue";
import { useQuasar } from "quasar";

export default {
  props: {
    totalSlides: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const slide = ref(1);
    const slidesPerRow = computed(() => {
      // current sizes are based on 200px images
      let slides = 2;
      if ($q.screen.gt.xl) {
        slides = 12;
      } else if ($q.screen.gt.lg) {
        slides = 10;
      } else if ($q.screen.gt.md) {
        slides = 8;
      } else if ($q.screen.gt.sm) {
        slides = 6;
      } else if ($q.screen.gt.xs) {
        slides = 4;
      }
      return slides;
    });
    const slideRows = computed(() => {
      return Math.ceil(props.totalSlides / slidesPerRow.value);
    });
    return { slide, slidesPerRow, slideRows };
  },
};
</script>
<style scoped></style>
