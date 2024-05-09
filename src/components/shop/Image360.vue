<template>
  <q-spinner-grid v-show="isLoading" color="primary" size="2rem" class="q-mb-sm" />
  <div id="spinner" />
</template>

<script>
import { ref, onBeforeMount, onBeforeUnmount, onUnmounted } from "vue";

import * as Tridi from "tridi";
import "tridi/dist/css/tridi.css";

function preloadImages(srcs) {
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = img.onabort = function () {
        reject(src);
      };
      img.src = src;
    });
  }
  const promises = [];
  for (let i = 0; i < srcs.length; i++) {
    promises.push(loadImage(srcs[i]));
  }
  return Promise.all(promises);
}

export default {
  props: {
    src: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const isLoading = ref(true);
    const tridiInstance = ref(null);

    onBeforeMount(async () => {
      const preload = await [...props.src]
        .map((image) => `${image.url}?`)
        .sort();
      await preloadImages(preload).then((result) => {
        console.log(result);
        console.log(preload);
        tridiInstance.value = Tridi.create({
          element: "#spinner",
          images: [...preload],
          autoplay: true,
          dragInterval: preload.length / 4,
          autoplaySpeed: 300,
          stopAutoplayOnClick: true,
          stopAutoplayOnMouseenter: true,
          resumeAutoplayOnMouseleave: true,
          //resumeAutoplayDelay: 1000
        });
        tridiInstance.value.load();
        isLoading.value = false;
      });
    });

    onUnmounted(() => {
      console.log('Definitely unmounted');
    });

    onBeforeUnmount(() => {
      console.log("onBeforeUnmount called");
      console.log("Tridi instance value:", tridiInstance.value);
      if (tridiInstance.value) {
        // Stop the autoplay manually since Tridi does not expose a direct stop method
        tridiInstance.value.autoplayStop();
        console.log("testing")

        // Manually clear all intervals and timeouts possibly set by Tridi. (I believe this is the culprit)
        tridiInstance.value.intervals.forEach(interval => clearInterval(interval));
        tridiInstance.value.timeouts.forEach(timeout => clearTimeout(timeout));

        // Assuming event handlers are attached directly via the Tridi instance methods
        const viewerElement = document.querySelector("#spinner");
        if (viewerElement) {
          // Remove event listeners if Tridi attaches them globally. Might not be neccessary.
          viewerElement.removeEventListener('mousedown', tridiInstance.value.handleMouseDown);
          viewerElement.removeEventListener('mouseup', tridiInstance.value.handleMouseUp);
          viewerElement.removeEventListener('mousemove', tridiInstance.value.handleMouseMove);
          viewerElement.removeEventListener('mouseleave', tridiInstance.value.handleMouseLeave);
          viewerElement.removeEventListener('touchstart', tridiInstance.value.handleTouchStart);
          viewerElement.removeEventListener('touchend', tridiInstance.value.handleTouchEnd);
          viewerElement.removeEventListener('touchmove', tridiInstance.value.handleTouchMove);
          viewerElement.removeEventListener('wheel', tridiInstance.value.handleWheel);
        }

        console.log("Tridi instance cleaned up");
      }
    });

    return { isLoading };
  },
};
</script>

<style lang="scss">
#tridi-basic {
  max-height: 100%;
  max-width: 100%;
}
</style>
