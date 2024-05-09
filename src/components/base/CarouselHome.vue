<template>
  <q-carousel v-if="slides && slides.length > 0" v-model="currentSlide" swipeable animated :arrows="$q.screen.gt.xs"
    :navigation="$q.screen.gt.xs" control-color="grey-7" infinite :ratio="2.55" style="height: auto">
    <q-carousel-slide v-for="(slide, index) in slides" :key="index" :name="index">
      <q-img :src="slide.url" :ratio="2.55" />
    </q-carousel-slide>
  </q-carousel>
</template>
<script>
// TODO: make admin ui for carousel images
import { defineComponent, ref, onUnmounted, onMounted } from "vue";
import { getFunctions, httpsCallable } from "@firebase/functions";

export default defineComponent({
  name: "CarouselHome",
  async setup() {
    const functions = getFunctions();
    const fetchImages = httpsCallable(functions, "callablefetchimages");
    const currentSlide = ref(0);
    const slides = ref([]);

    onMounted(async () => {
      const functions = getFunctions();
      const fetchImages = httpsCallable(functions, "callablefetchimages");
      await fetchImages("app/home").then(({ data }) => {
        if (Array.isArray(data)) {
          slides.value = data;
        }
      });
    });

    const interval = setInterval(() => {
      if (slides.value.length > 1) {
        currentSlide.value = (currentSlide.value + 1) % slides.value.length;
      }
    }, 4000);

    // Clear the interval when the component is unmounted
    onUnmounted(() => {
      clearInterval(interval);
    });

    return {
      currentSlide,
      slides,
    };
  },
});
</script>
