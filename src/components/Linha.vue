<template>
  <GChart type="LineChart" :data="chartData" :options="chartOptions" />
</template>

<script>
import { GChart } from 'vue-google-charts/legacy';
const moment = require("moment");

export default {
  name: 'ChartLinha',
  async beforeMount() {
    this.graficoFluxo();
  },
  async mounted() {
   
  },

  async beforeDestroy() {
  },

  data: () => ({
    chartData: [],
    chartOptions: {
      title: 'Company Performance',
      curveType: 'function',
      legend: { position: 'bottom' },
      backgroundColor: { fill: "transparent" },
    },
    with: 600,
    FilaDashboard: '',
  }),

  components: {
    GChart,
  },

  methods: {
    currentDateTime() {
      const current = new Date();
      return `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;
    },

    PastDateTime() {
      const current = new Date();
      return `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;
    },

    graficoFluxo: async function () {
      let usuario = JSON.parse(localStorage.getItem('usu'));
      this.FilaDashboard = usuario.fila;

      // Gera dados fictícios distribuídos ao longo de diferentes horários
      let dadosAtendidas = Array(50).fill(null).map(() => ({
        datahora: moment().hour(Math.floor(Math.random() * 24)).toDate(),
      }));

      let dadosAbandonadas = Array(25).fill(null).map(() => ({
        datahora: moment().hour(Math.floor(Math.random() * 24)).toDate(),
      }));

      let horasAtendidas = {
        "08:": 0, "09:": 0, "10:": 0, "11:": 0,
        "12:": 0, "13:": 0, "14:": 0, "15:": 0, "16:": 0, "17:": 0,
        "18:": 0, "19:": 0, "20:": 0, "21:": 0, "22:": 0, "23:": 0
      };

      let horasAbandonadas = {
        "08:": 0, "09:": 0, "10:": 0, "11:": 0,
        "12:": 0, "13:": 0, "14:": 0, "15:": 0, "16:": 0, "17:": 0,
        "18:": 0, "19:": 0, "20:": 0, "21:": 0, "22:": 0, "23:": 0
      };

      // Distribui as chamadas atendidas nos horários aleatórios
      dadosAtendidas.forEach((d) => {
        let datahora = d.datahora;
        let gethora = moment(datahora).format('HH:');
        horasAtendidas[gethora] += 1;
      });

      // Distribui as chamadas abandonadas nos horários aleatórios
      dadosAbandonadas.forEach((d) => {
        let datahora = d.datahora;
        let gethora = moment(datahora).format('HH:');
        horasAbandonadas[gethora] += 1;
      });

      // Prepara os dados para o gráfico
      this.chartData = [];
      this.chartData.push(["Horas", "Chamadas Atendidas", "Chamadas Abandonadas"]);

      for (var prop in horasAtendidas) {
        if (horasAtendidas[prop] !== 0 || horasAbandonadas[prop] !== 0) {
          this.chartData.push([prop + "00", horasAtendidas[prop], horasAbandonadas[prop]]);
        }
      }
    },
  },
};
</script>
