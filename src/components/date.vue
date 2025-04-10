<template>
  <v-app>
    <v-container grid-list-md>
      <v-layout
      >
        <v-flex xs12>
          <!-- <v-card class="daterange--default"> -->
            <v-card-text>
              <!-- <p>From: -->
                <!-- <v-chip>{{ range[0] }}</v-chip> To: -->
                <!-- <v-chip>{{ range[1] }}</v-chip> -->
              <!-- </p> -->
              <v-daterange
                :options="dateRangeOptions"
                @input="onDateRangeChange"
              />
            </v-card-text>
          <!-- </v-card> -->
        </v-flex>        
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import { format, subDays } from 'date-fns';

export default {
  data() {
    return {
      range: [],
      dateRangeOptions: {
        startDate: format(subDays(new Date(), 7), 'YYYY-MM-DD'),
        endDate: format(new Date(), 'YYYY-MM-DD'),
        format: 'MM/DD/YYYY'
      },
      dateRangeOptionsWithMinDate: {
        startDate: format(subDays(new Date(), 7), 'YYYY-MM-DD'),
        endDate: format(new Date(), 'YYYY-MM-DD'),
        minDate: format(subDays(new Date(), 15), 'YYYY-MM-DD'),
        format: 'MM/DD/YYYY',
      },
    };
  },
  methods: {
    onDateRangeChange(range) {
      this.range = range;
    },
  },
};
</script>
