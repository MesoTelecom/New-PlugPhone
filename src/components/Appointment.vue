<template>
  <v-card height="" flat color="transparent" class="mt-n5">
                <v-toolbar color="rgba(0,0,0,0)" flat class="py-4">
                 
                </v-toolbar>

<div class = "pizza">
	<GChart
    type="PieChart"
    :data="chartData"
    :options="chartOptions"
  
  
  />
</div>
              </v-card>
</template>

<script>
import { api } from "@/conf/api";
import { GChart } from 'vue-google-charts/legacy';
export default {
  async beforeMount() {
    let a = await api.get("dashligacao");
    console.log(a.data.dados);
    this.dados = a.data.dados;
  },
  components: {
    GChart
  },
data () {
    return {
      // Array will be automatically processed with visualization.arrayToDataTable function
chartData: [ ['Task', 'Hours per Day'],
          ['Em fila',    this.a.chartData.data ],
],
    
      chartOptions: {
           title: 'Classificação de chamadas',
           'width':600,
          'height':350,
          
      },

    }
    
  },
  
  mounted: function(){
    this.exibir()
  },
  methods: {
    exibir: async function(){
  

	let a =[ await api.get(`/dashligacao`)]
   
  console.log(a.data.dados)   
  this.GChart = a.data.dados;
  this.disserts = a.data.dados;
  this.chartData =a.data.dados;
    
    
  },
  },
}
</script>

<style>
#PieChart{
  width: 14%;
  height: 20%;
}
</style>