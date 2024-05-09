<template>
  <q-img
    :src="imageSource"
    loading="lazy"
    :ratio="ratio"
    fit="contain"
    class="product-image"
  />
</template>

<script>
import { defineComponent, watch, ref } from "vue";
import { fetchImage } from "src/utilities/fetchImage.js";

export default defineComponent({
  name: "ImageThumbnail",
  props: {
    ratio: {
      type: Number,
      default: null,
    },
    size: {
      type: String,
      default: "thumb",
    },
    sku: {
      type: String,
      required: true,
    },
  },
  async setup(props) {
    const imageSource = ref(await fetchImage(props.sku, props.size));
    return { imageSource };
  },
});
</script>
