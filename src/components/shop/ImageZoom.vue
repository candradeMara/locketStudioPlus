<template>
  <div id="zoom" class="magnify-wrapper">
    <q-img
      no-native-menu
      fit="contain"
      :ratio="1"
      :src="src"
      class="gallery-main-image"
    />
    <div id="zoom-img" :style="`background-image:url(${src});`" />
  </div>
</template>

<script>
import { defineComponent, onBeforeUnmount, onMounted } from "vue";

export default defineComponent({
  name: "ImageZoom",
  props: {
    src: {
      type: String,
      required: true,
    },
  },
  async setup() {
    const zoomMouseLeave = () => {
      const zoomImg = document.getElementById("zoom-img");
      const style = zoomImg.style;
      style.opacity = "0";
      style.transform = "scale(0)";
      zoom.style.cursor = "default";
    };
    const zoomMouseMove = (e) => {
      const container = document.getElementById("zoom");
      const viewSize = 75; // half of the "bubble magnification"
      const img = e.currentTarget.querySelector("img");
      const zoomImg = document.getElementById("zoom-img");
      const style = zoomImg.style;
      const ratio = img.naturalWidth / img.naturalHeight; // ratio of image
      const actualHeight = ratio > 1 ? img.height / ratio : img.height;
      const actualWidth = ratio < 1 ? img.width * ratio : img.width;
      const paddingY = ratio > 1 ? (img.height - actualHeight) / 2 : 0; // space at top since we are using "contain"
      const paddingX = ratio < 1 ? (img.width - actualWidth) / 2 : 0;
      // remoove space from top and bottom?
      zoom.style.marginTop = `${-paddingY}px`;
      zoom.style.marginBottom = `${-paddingY}px`;
      const rect = img.getBoundingClientRect();
      let x = e.clientX - rect.left - paddingX;
      let y = e.clientY - rect.top - paddingY;
      if (y > 0 && y < actualHeight && x > 0 && x < actualWidth) {
        let inputX = (x / actualWidth) * 100;
        let inputY = (y / actualHeight) * 100;
        const viewPercX = (viewSize / actualWidth) * 100;
        const viewPercY = (viewSize / actualHeight) * 100;
        const outputHighX = 100 + viewPercX;
        const outputLowX = -1 * viewPercX;
        const outputHighY = 100 + viewPercY;
        const outputLowY = -1 * viewPercY;
        const xPerc = (inputX / 100) * (outputHighX - outputLowX) + outputLowX;
        const yPerc = (inputY / 100) * (outputHighY - outputLowY) + outputLowY;
        style.backgroundPositionX = xPerc + "%";
        style.backgroundPositionY = yPerc + "%";
        style.left = x + paddingX - viewSize + "px";
        style.top = y + paddingY - viewSize + "px";
        style.opacity = "1";
        style.transform = "scale(1)";
        container.style.cursor = "none";
      } else {
        style.opacity = "0";
        style.transform = "scale(0)";
        container.style.cursor = "default";
      }
    };
    onMounted(() => {
      const zoom = document.getElementById("zoom");
      if (zoom) {
        zoom.addEventListener("mouseleave", zoomMouseLeave);
        zoom.addEventListener("mousemove", zoomMouseMove);
      }
    });
    onBeforeUnmount(() => {
      const zoom = document.getElementById("zoom");
      if (zoom) {
        zoom.removeEventListener("mouseleave", zoomMouseLeave);
        zoom.removeEventListener("mousemove", zoomMouseMove);
      }
    });
    return {};
  },
});
</script>

<style lang="scss" scoped>
.magnify-wrapper {
  display: flex;
  position: relative;
  width: 100%;
  .gallery-main-image {
    border-radius: 0.125rem;
    // box-shadow: $shadow-8;
    max-width: 100%;
  }
  #zoom-img {
    background-color: #fff;
    background-repeat: no-repeat;
    // border: 4px solid #efefef;
    border-radius: 100%;
    box-shadow: $shadow-6;
    display: block;
    height: 150px;
    pointer-events: none;
    position: absolute;
    opacity: 0;
    transform: scale(0);
    transition: opacity 0.3s, transform 0.5s;
    width: 150px;
    z-index: 99;
  }
}
</style>
