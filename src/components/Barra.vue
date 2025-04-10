<template>

    <GChart type="ColumnChart" :data="chartData" :options="chartOptions" />
</template>

<script>
import { GChart } from 'vue-google-charts/legacy';
//import { api } from "@/conf/api";


export default {
  name: 'MatheusChart',
  async beforeMount() {
    this.exibir()
    this.idsetinterval = setInterval(async () => await this.exibir(), 5000);

  },
  async mounted() {

    ////console.log(this.$store.state.token)
    console.log("eu sou idsetinterval Before mount", this.idsetinterval);

    await this.drawChart;  // antes estava desse jeito await this.drawChart(); porém estava falando que this2.drawChart() não era uma função
    this.idsetinterval = setInterval(async () => await this.exibir(), 5000);
  },
  data: () => ({

    dados: [],
    FilaDashboard: '',

    chartData: [
      ['Nome', 'Ligações Atendidas'],
      ['Matheus', 0],
    ],

    chartOptions: {
      chart: {
        title: 'Atendidas',
        width: 600,
        subtitle: 'Sales, Expenses, and Profit: 2014-2017',
        backgroundColor: { fill: "transparent" },

      },
    },

  }),
  components: {
    GChart,
  },
  methods: {
    data() {
      let currentDate = new Date().toJSON().slice(0, 10);
      return currentDate;
    },
    exibir: async function () {
      let usuario = JSON.parse(localStorage.getItem('usu'))
      this.FilaDashboard = usuario.fila;
      let arrayNomes = [
        {
          nome: "Matheus",
          atendidas: 50,
        },
        {
          nome: "Lucas",
          atendidas: 45,
        }
        ,
        {
          nome: "Marcelo",
          atendidas: 40,
        }
      ]
      console.log('eu sou o arrayNomes', arrayNomes)
      let nomesFor = arrayNomes
      console.log('nomes dataArray', nomesFor)

      // Inicialize o array de dados do gráfico com os cabeçalhos
      let data = [['Nome', 'Ligações Atendidas']]

      // Loop através dos nomes e atendimentos e adicione ao array de dados
      nomesFor.forEach(item => {
        data.push([item.nome, item.atendidas])
      })

      // Atualize o chartData com os dados formatados
      this.chartData = data
    }

  },


};
</script>