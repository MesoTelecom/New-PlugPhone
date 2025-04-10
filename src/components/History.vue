<template>
   <v-card height="" flat color="transparent" class="mt-n5">
                <v-toolbar color="rgba(0,0,0,0)" flat class="py-4">
                </v-toolbar>
             <GChart
    type="LineChart"
    :data="chartData1"
    :options="chartOptions1"
  />
              </v-card>
</template>

<script>
  import { GChart } from 'vue-google-charts/legacy';
export default {
  components: {
    GChart
  },
data () {
    return {
      // Array will be automatically processed with visualization.arrayToDataTable function
		chartData1: [
		['Horas', 'Chamadas'],
          ['13:00',  1000],
          ['14:00',  1170],
          ['15:00',  660],
          ['16:00',  1030,],

        ],

      chartOptions: {
           title: 'Classificação de chamadas'
      },
	chartOptions1: {
       title: 'Fluxo de ligações por hora',
        curveType: 'function',
        legend: { position: 'bottom' },
        'width':800,
        'height':350,
        
        
      }

    }
  },
}
</script>

<style>

</style>