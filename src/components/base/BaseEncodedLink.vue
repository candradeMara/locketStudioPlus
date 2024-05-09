<template>
  <a class="encoded-link" :href="encoded">
    <span style="unicode-bidi: bidi-override; direction: rtl"
      >{{ secondReverse }}<span style="display: none">{{ hash }}</span
      >{{ firstReverse }}</span
    >
  </a>
</template>
<script>
import { defineComponent } from "vue";
export default defineComponent({
  name: "BaseEncodedLink",
  props: {
    link: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const encoded =
      "javascript:window.location.href=atob('" + btoa(props.link) + "');";
    const hash = Math.random().toString(36).substring(7);
    const firstReverse = props.text
      .substring(0, props.text.length / 2)
      .split("")
      .reverse()
      .join("");
    const secondReverse = props.text
      .substring(props.text.length / 2)
      .split("")
      .reverse()
      .join("");
    return { encoded, hash, firstReverse, secondReverse };
  },
});
</script>
<style>
.encoded-link {
  white-space: nowrap;
}
.encoded-link > * {
  display: inline-block;
}
</style>
