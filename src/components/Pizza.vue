<template>
  <GChart type="PieChart" :data="chartData" :options="chartOptions" />
</template>

<script>
import { GChart } from 'vue-google-charts/legacy';

export default {
  name: 'PieChart',

  async beforeMount() {
    this.drawChart();
    this.idsetinterval = setInterval(() => this.drawChart(), 7000);
  },

  async beforeDestroy() {
    clearInterval(this.idsetinterval);
  },

  data: () => ({
    idsetinterval: null,
    chartData: [
      ["Ligações", "Quantidade"],
      ["Mensagens Lidas", 0],
      ["Mensagens Não Lidas", 0],
    ],
    chartOptions: {
      title: 'Mensagens Lidas e Não Lidas',
      backgroundColor: { fill: "transparent" },
      width: 800
    },
  }),

  components: {
    GChart,
  },

  methods: {
    drawChart() {
      this.chartData = [
        ["Ligações", "Quantidade"],
        ["Mensagens Lidas", 60],
        ["Mensagens Não Lidas", 40],
      ];
    },
  },
};
</script>

<style scoped>
/* Estilos opcionais */
</style>
