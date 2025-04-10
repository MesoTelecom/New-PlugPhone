<template>
   <v-card height="" flat color="transparent" class="mt-n5">
                <v-toolbar color="rgba(0,0,0,0)" flat class="py-4">
                </v-toolbar>
             <GChart
    type="ColumnChart"
    :data="chartData1"
    :options="chartOptions1"
  />
              </v-card>
</template>

<script>
  import { GChart } from 'vue-google-charts/legacy';
export default {
   name: 'HelloWord',
  components: {
    GChart
  },
data () {
    return {
      // Array will be automatically processed with visualization.arrayToDataTable function
		chartData1:[
          ['Month', 'Bolivia', 'Ecuador', 'Madagascar', 'Papua New Guinea', 'Rwanda', 'Average'],
          ['2004/05',  165,      938,         522,             998,           450,      614.6],
          ['2005/06',  135,      1120,        599,             1268,          288,      682],
          ['2006/07',  157,      1167,        587,             807,           397,      623],
          ['2007/08',  139,      1110,        615,             968,           215,      609.4],
          ['2008/09',  136,      691,         629,             1026,          366,      569.6]
        ],
  chartData2: [],
	chartOptions1: {
       title: 'Pesquisa de satisfação',
        curveType: 'function',
        legend: { position: 'center' },
        'width':900,
        'height':450,
        
        
      }

    }
  },
}
</script>

<style>

</style>