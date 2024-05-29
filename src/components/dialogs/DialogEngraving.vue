<template>
  <q-dialog
    :model-value="isOpen"
    maximized
    @update:model-value="(value) => $emit('update:isOpen', value)"
  >
    <div class="bg-white modal-full">
      <q-btn
        v-close-popup
        dense
        flat
        icon="close"
        class="button-close float-right"
      >
        <q-tooltip class="bg-white text-primary"> Close </q-tooltip>
      </q-btn>
      <div class="q-gutter-md row">
        <q-card class="col q-pa-md">
          <div class="row">
            <div class="col flex flex-center">
              <q-img :src="imageSource" fit="contain" />
            </div>
            <div class="col flex flex-center">
              <q-img
                v-if="engraveImage"
                class="demo"
                :src="engraveImage"
                fit="contain"
              />
            </div>
          </div>
        </q-card>
        <q-card class="col q-pa-md engrave-options">
          <div class="row">
            <div class="text col">
              <q-input
                v-for="(line, index) in engraving.lines"
                :key="index"
                ref="firstLine"
                v-model="textLines[index]"
                debounce="500"
                :hint="`${
                  engraving.characters - textLines[index].length
                } characters remaining`"
                :rules="[
                  (textLine) =>
                    textLine.length <= engraving.characters ||
                    `Please use maximum ${engraving.characters} characters`,
                ]"
              />
            </div>
            <div class="font col column">
              <q-radio
                v-for="(font, index) in fontOptions"
                :key="font"
                v-model="fontChoice"
                :val="index"
                :label="font.label"
                class="col"
                :style="`font-family: ${font.family}`"
              />
            </div>
          </div>
        </q-card>
      </div>
      <div class="actions q-ma-md">
        <div class="row">
          <q-checkbox
            v-model="confirmed"
            label="All Engraved Sales Are Final"
            class="text-red"
          />
        </div>
        <q-btn v-close-popup label="Cancel" />
        <q-btn
          v-close-popup
          label="Finished"
          :disabled="!confirmed"
          @click="saveEngraving()"
        />
      </div>
    </div>
  </q-dialog>
</template>

<script>
// TODO: need padding on top...
import { defineComponent, onMounted, ref, watch } from "vue";
import { load } from "opentype.js";
import * as C2S from "canvas2svg";

//const C2S = require('canvas2svg');

export default defineComponent({
  name: "DialogEngraving",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    engraveData: {
      type: Object,
      required: true,
    },
    engraving: {
      type: Object,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
  },
  emits: ["update:isOpen", "update:engraveData"],
  async setup(props, { emit }) {
    const confirmed = ref(false);
    const canvasDemo = ref(null);
    let ctxEngraving = null;
    let engraveText = [];
    const firstLine = ref(null);
    const engraveFile = ref(null);
    const engraveImage = ref(null);
    const isSaving = ref(false);

    const imageSource = ref(
      `${process.env.IMAGEKIT_URL}/products/${props.sku}/${props.sku}.png?tr=n-thumb`
    );
    const fontChoice = ref(0);
    const fontOptions = ref([
      { label: "Font 1", path: "BadScript-Regular.ttf", family: "Bad Script" },
      {
        label: "Font 2",
        path: "DancingScript-Regular.ttf",
        family: "Dancing Script",
      },
      { label: "Font 3", path: "Dosis-Regular.ttf", family: "Dosis" },
      {
        label: "Font 4",
        path: "GreatVibes-Regular.ttf",
        family: "Great Vibes",
      },
      { label: "Font 5", path: "Sahitya-Regular.ttf", family: "Sahitya" },
    ]);

    // set the correct number of lines
    const textLines = ref(Array(props.engraving.lines).fill(""));
    const engravePath = ref(null);

    const resetCanvas = async () => {
      if (canvasDemo.value === null) {
        canvasDemo.value = document.createElement("canvas");
      }
      const ctxDemo = canvasDemo.value.getContext("2d");
      const locketImg = new Image();
      locketImg.src = `/img/engrave/w${props.engraving.engrave_code.toLowerCase()}.jpg`;

      await locketImg.decode();

      canvasDemo.value.width = locketImg.width;
      canvasDemo.value.height = locketImg.height;
      ctxDemo.clearRect(0, 0, canvasDemo.value.width, canvasDemo.value.height);
      ctxDemo.drawImage(locketImg, 0, 0);
      engraveImage.value = canvasDemo.value.toDataURL("image/png");
    };

    const updateEngraving = async () => {
      await resetCanvas();
      console.log("font:"+fontChoice.value);
      // Need to constrain final line(s) both vertically and horizontally.
      engraveText = textLines.value.filter((e) => e !== ""); // remove empty lines
      const ctxDemo = canvasDemo.value.getContext("2d");
      if (engraveText.length > 0) {
        // we have text; add each line centered on the display canvas
        let fontSize = 500; // arbitrary, but necessary, lower values may clip fonts though.
        const font = await load(
          `/fonts/${fontOptions.value[fontChoice.value].path}`
        );


        // get the longest line
        let longestLine = 0;
        // let tallestLine = 0;
        // let totalHeight = 0;
        let descenderFix = 0;
        let ascenderFix = 0;
        let bottomDiff = 0;
        let startY = 0;
        engraveText.forEach((line) => {
          // const lineWidth = font.getAdvanceWidth(line, fontSize);
          const path = font.getPath(line, 0, 0, fontSize);
          const bounds = path.getBoundingBox();
          const lineHeight = bounds.y2 - bounds.y1;
          const lineWidth = bounds.x2 - bounds.x1;
          longestLine = Math.max(lineWidth, longestLine);
          ascenderFix = Math.min(ascenderFix, bounds.y1);
          descenderFix = Math.max(descenderFix, bounds.y2);
          if (startY == 0) {
            // set first line start position to it's ascender
            startY = 0 - bounds.y1;
          }
          bottomDiff = descenderFix - bounds.y2; // positive number (difference between last descender and largest descender)
        });
        const tallestLine = descenderFix - ascenderFix; //
        const topDiff = -1 * ascenderFix - startY; // positive number

        const engraveWidth = longestLine;
        const engraveHeight =
          tallestLine * engraveText.length - bottomDiff - topDiff;
        // const engraveHeight = tallestLine * engraveText.length;
        console.log("w:"+engraveWidth+" h:"+engraveHeight)
        ctxEngraving = await new C2S(engraveWidth, engraveHeight);
        ctxEngraving.strokeRect(0, 0, engraveWidth, engraveHeight); // outline for testing fitting purposes

        // add text to the canvas;
        // make equal blocks of height == tallestLine.
        // then center each line of text inside that block. //TODO: this makes baseline look odd.
        // Fix: get baselineOffset (bounds.y1) for all first... ?

        // console.log(
        //   `tallestLine: ${tallestLine}, startY: ${startY} topDiff: ${topDiff} bottomDiff: ${bottomDiff}`
        // );
        engraveText.forEach((line, index) => {
          if (line !== "") {
            // const lineWidth = font.getAdvanceWidth(line, fontSize);
            const path = font.getPath(line, 0, 0, fontSize);
            const bounds = path.getBoundingBox();
            // const lineHeight = bounds.y2 - bounds.y1;
            const medianOffset = (bounds.x1 + bounds.x2) / 2;
            // const centerLine = lineHeight / 2;
            // const baselineOffset = centerLine + bounds.y1;
            // const baselineOffset = centerLine + bounds.y1;
            // let startY = (engraveHeight / engraveText.length) * (index + 1); // bottom of block;
            // let startY = (engraveHeight / engraveText.length) * (index + 1); // bottom of block;
            // let startY = 0;

            // startY -= tallestLine / 2; // center of block;
            // startY -= baselineOffset; // move baseline;
            const startX = engraveWidth / 2 - medianOffset;
            const linePath = font.getPath(line, startX, startY, fontSize);
            linePath.fill = "#000";
            linePath.stroke = "#000";
            linePath.draw(ctxEngraving);
            startY += tallestLine;
          }
        });
        // that's it for our engraving canvas... now let's display it on the canvas-demo
        const locketBorder = [135, 85, 50]; // [Top, Bottom, sides] predetermined padding

        // add the engraving on top.
        // calculate the engraveable area, then scale the canvas to fit inside that area.
        // finally, draw it...
        ctxDemo.globalAlpha = 0.65;
        // update final save file here which is also what gets added to the demo
        engraveFile.value = await ctxEngraving.getSerializedSvg();
        // only way to load svg onto the canvasDemo is making it another image with the svg.
        const svgImg = await new Image();
        svgImg.src =
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(engraveFile.value);
        await svgImg.decode();

        const scaleX =
          (canvasDemo.value.width - locketBorder[2] - locketBorder[2]) /
          engraveWidth;
        const scaleY =
          (canvasDemo.value.height - locketBorder[0] - locketBorder[1]) /
          engraveHeight;
        const scale = Math.min(scaleX, scaleY);
        ctxDemo.scale(scale, scale);

        // find the center point (of the engraving)
        const centerX =
          locketBorder[2] + (canvasDemo.value.width - 2 * locketBorder[2]) / 2;
        const centerY =
          locketBorder[0] +
          (canvasDemo.value.height - locketBorder[0] - locketBorder[1]) / 2; // should probably also just be canvasDemo.value.width/2 (but oh well...)

        // find the correct top left corner of the engraving;
        const eW = scale * engraveWidth; // final engrave width... after scaling
        const eH = scale * engraveHeight;
        const xPos = (centerX - eW / 2) / scale; // why are we dividing by scale again?
        const yPos = (centerY - eH / 2) / scale;
        ctxDemo.drawImage(svgImg, xPos, yPos);

        // ctxDemo.lineWidth = 15;
        // ctxDemo.strokeRect(
        //   locketBorder[2],
        //   locketBorder[0],
        //   canvasDemo.value.width - locketBorder[2],
        //   canvasDemo.value.height - locketBorder[1]
        // ); // outline for testing fitting purposes

        engraveImage.value = canvasDemo.value.toDataURL("image/png");
      }
    };
    const saveEngraving = async () => {
      emit("update:engraveData", {
        preview: engraveImage.value,
        svg: engraveFile.value,
        text: [...engraveText],
        sku: props.sku,
      });
    };

    watch(
      [textLines, fontChoice],
      () => {
        updateEngraving();
      },
      { immediate: true, deep: true }
    );
    return {
      firstLine,
      confirmed,
      canvasDemo,
      engraveFile,
      engraveImage,
      imageSource,
      fontChoice,
      fontOptions,
      textLines,
      isSaving,
      engravePath,
      saveEngraving,
    };
  },
});
</script>
