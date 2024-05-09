<template>
  <h3>Upcoming Trade Shows</h3>
  <div class="q-pt-md row q-col-gutter-md justify-center">
    <div v-for="event in tradeshows" :key="event" class="col-4">
      <q-card
        class="text-center"
        flat
        bordered
        style="position: relative; max-width: 320px"
      >
        <q-card-section>
          <div class="text-h5 q-ma-xs">
            {{ event.name }}
          </div>
        </q-card-section>
        <q-card-section v-if="event.imageURL">
          <q-img class="rounded-borders" :src="event.imageURL" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-caption text-grey">
            {{ event.description }}
          </div>
          <div class="text-caption text-grey">
            {{ event.location }}
          </div>
        </q-card-section>
        <q-separator class="full-width" />
        <q-card-section class="col-5">
          {{ eventDates(event) }}
        </q-card-section>
        <q-separator class="full-width" />
        <q-card-actions
          v-show="event.startDate || event.endDate"
          align="center"
        >
          <!-- eslint-disable vue/attribute-hyphenation -->
          <add-to-calendar-button
            :name="event.name"
            options="['Apple','Google','iCal','Microsoft365','Outlook.com','Yahoo']"
            :description="event.description"
            :startDate="event.startDate ? event.startDate : null"
            :endDate="event.endDate ? event.endDate : null"
            :location="event.location"
            :timeZone="event.timeZone"
            trigger="click"
            inline
            listStyle="modal"
            :iCalFileName="`Reminder - ${event.name}`"
          />
          <!-- eslint-enable -->
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, onBeforeMount, ref } from "vue";
import { date } from "quasar";
import { db } from "boot/firebase";
import { doc, getDoc } from "@firebase/firestore";
import "add-to-calendar-button";

export default defineComponent({
  name: "TradeShows",
  setup() {
    const tradeshows = ref([]);
    onBeforeMount(async () => {
      const docSnap = await getDoc(doc(db, "app/tradeshows"));
      if (docSnap.exists()) {
        const data = Object.values(docSnap.data());
        tradeshows.value = data.filter((event) => {
          if (!event.endDate) {
            // use startDate
            return new Date(event.startDate) >= new Date();
          } else {
            return new Date(event.endDate) >= new Date();
          }
        });
      }
    });
    const eventDates = (event) => {
      const start = event.startDate;
      const end = event.endDate ?? null;
      // format dates prettier: July 23rd - 31st, 2021 : July 31st - June 3rd, 2021
      if (!end) {
        return date.formatDate(start, "MMM. Do, YYYY");
      } else {
        const startTime = date.extractDate(start);
        const endTime = date.extractDate(end);
        // check for spanning months, then year.
        if (date.isSameDate(startTime, endTime, "month")) {
          return `${date.formatDate(start, "MMM. Do")} - ${date.formatDate(
            end,
            "Do, YYYY"
          )}`;
        } else if (date.isSameDate(startTime, endTime, "year")) {
          return `${date.formatDate(start, "MMM. Do")} - ${date.formatDate(
            end,
            "MMM Do, YYYY"
          )}`;
        } else {
          return `${date.formatDate(
            start,
            "MMM. Do, YYYY"
          )} - ${date.formatDate(end, "MMM Do, YYYY")}`;
        }
      }
    };
    return {
      tradeshows,
      eventDates,
    };
  },
});
</script>
