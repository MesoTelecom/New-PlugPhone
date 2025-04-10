<template>
  <v-app id="inspire" class="papel">
    <navbar />

    <SideBar />


    <v-divider color="white" class="mt-1" dark></v-divider>

    <v-container>

      <v-row id="linha" style="margin-left: -14%;">
        <v-col cols="12" sm="12">
          <v-toolbar flat color="rgba(0,0,0,0)" class="mt-n5">
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-row class="px-5 mt-n6 ml-5">
            <v-col cols="12" sm="3" v-for="list in lists" :key="list.id">
              <v-card align="center" class="rounded-square border pt-10" width="200" height="200" flat>
                <v-card-text style="    font-size: 48px;  ">
                  <h2>{{ list.count }}</h2>
                </v-card-text>


                <v-card-text class="grey--text text-lg-h6">
                  {{ list.title }}
                </v-card-text>

                <v-btn absolute color="#243e57" class="white--text" fab left top>
                  <v-icon>{{ list.icon }}</v-icon>
                </v-btn>
              </v-card>
            </v-col>
          </v-row>

        </v-col>
        <div style="display: flex; margin-top: -1%; width: 100%">
          <v-col cols="12" sm="7">
            <GChart type="LineChart" :data="chartData1" :options="chartOptions1" />
          </v-col>
          <br />
          <br />
          <v-col cols="12" sm="5">
            <v-card height="" flat color="transparent" class="mt-n5">
              <div class="pizza">
                <GChart type="PieChart" :data="Glucas" :options="chartOptions" />
              </div>
            </v-card>
          </v-col>
        </div>
      </v-row>
    </v-container>
  </v-app>
</template>


<script>
import { GChart } from "vue-google-charts/legacy";

import Navbar from "../components/Navbar.vue";
import SideBar from "../components/SideBar.vue";
import { api } from "@/conf/api";
const moment = require("moment");

export default {
  name: "DashboardPrincipal",
  async beforeMount() {
    //const { setIntervalAsync } = require("set-interval-async/legacy");
  },

  async mounted() {
    ////console.log(this.$store.state.token)
    console.log("eu sou idsetinterval Before mount", this.idsetinterval);

    await this.drawChart();
    this.idsetinterval = setInterval(async () => await this.drawChart(), 7000);
    this.idsetinterval2 = setInterval(async () => await this.graficoFluxo(), 2000);
    this.idsetinterval3 = setInterval(async () => await this.realtime(), 2000);
  },

  async beforeDestroy() {
    console.log("eu sou idsetinterval", this.idsetinterval);
    clearInterval(this.idsetinterval);
    this.idsetinterval = 0;

    console.log("eu sou idsetinterval2", this.idsetinterval2);
    clearInterval(this.idsetinterval2);
    this.idsetinterval2 = 0;

    console.log("eu sou idsetinterval3", this.idsetinterval3);
    clearInterval(this.idsetinterval3);
    this.idsetinterval3 = 0;
  },

  data: () => ({
    idsetinterval: null,
    idsetinterval2: null,
    idsetinterval3: null,
    chartData1: [],
    dataGrafico: [],
    chartOptions1: {
      title: "Fluxo de ligações por hora",
      curveType: "function",

      legend: {
        position: "bottom",
        colors: "9e9e9e",
        textStyle: {
          color: "9e9e9e",
          bold: true,
        },
      },
      vAxis: {
        textStyle: {
          color: "9e9e9e",
          bold: true,
        },
      },
      hAxis: {
        textStyle: {
          color: "9e9e9e",
          bold: true,
        },
      },
      titleTextStyle: {
        color: "9e9e9e",
        bold: true,
      },

      fontSize: 15,
      width: 800,
      height: 350,
      backgroundColor: { fill: "transparent" },
    },

    chartData: [
      ["Ligações", "Quantidade"],
      ["Atendidas", 0],
      ["Abandonadas", 0],
    ],
    chartOptions: {
      title: "Atendidas e Abandonadas",
      titleTextStyle: {
        color: "9e9e9e",
      },
      legend: {
        textStyle: {
          color: "9e9e9e",
          bold: true,
        },
      },
      fontSize: 15,
      width: 600,
      height: 350,
      backgroundColor: { fill: "transparent" },
    },
    oi: null,
    lists: [
      {
        id: 1,
        icon: "fa fa-user-plus",
        title: "Operadores Logados",
        count: 0,
      },
      {
        id: 2,
        icon: "fa fa-user-times",
        color: "red",
        title: "Operadores Deslogados",
        count: 0,
      },
      {
        id: 3,
        icon: "fa fa-pause-circle",
        title: "Operadores em pausa",
        count: 0,
      },
      {
        id: 4,
        icon: "fa fa-phone-square",
        title: "Em ligação",
        count: 0,
      },
    ],
    ligacao: [],
    dados: [],
    compara: [],
    lixo: [],
    logado: [],
  }),

  components: {
    SideBar,

    GChart,
    //Table
    Navbar,
  },

  computed: {
    Glucas() {
      return this.dataGrafico;
      //return [...this.dataGrafico]
    },
  },

  methods: {
    currentDateTime() {
      const current = new Date();
      const date =
        current.getFullYear() +
        "-" +
        (current.getMonth() + 1) +
        "-" +
        current.getDate();
      //const time = "23:59:59";
      const dateTime = date;

      return dateTime;
    },
    PastDateTime() {
      const current = new Date();
      const date =
        current.getFullYear() +
        "-" +
        (current.getMonth() + 1) +
        "-" +
        current.getDate();
      //const time = "00:00:00";
      const dateTimeB = date;

      return dateTimeB;
    },

    drawChart: async function () {
      ////console.log('token',this.$store.state.token)

      this.chartData = [
        ["Ligações", "Quantidade"],
        ["Atendidas", 0],
        ["Abandonadas", 0],
      ];
      let a = await api.get(
        `dashpizza/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      //console.log('dados',a.data.dados);
      if (!a.data.dados) {
        //  //return alert("não veio nada");
      }
      if (a.data.dados.length == 0) {
        //  //return alert("Não existe ligação");
      }
      let join = a.data.dados.length;

      let b = await api.get(
        `filaabandono/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      //////console.log(`${this.PastDateTime()}/${this.currentDateTime()}`)
      if (!b.data.dados) {
        //return alert("não veio nada2");
      }
      if (b.data.dados.length == 0) {
        //return alert("Não existe ligação2");
      }

      let abandon = b.data.dados.length;
      //////console.log(abandon, join);

      let atendida = join - abandon;
      this.chartData[1][1] = 0;

      this.chartData[2][1] = 0;
      //////console.log(atendida);
      /*
      this.chartData.push(["Ligações", "Quantidade"]);
      this.chartData.push(["Atendidas", atendida]);
      this.chartData.push(["Abandonadas", abandon]);
*/
      this.chartData[1][1] = atendida;

      this.chartData[2][1] = abandon;

      this.dataGrafico = this.chartData;
      this.chartData = [];
      //console.log("atendida:",atendida, "abandonada",abandon)
      //console.log(this.chartData)

      //console.log(this.dataGrafico)
    },

    realtime: async function () {
      ////console.log('JWT AQUI: ',localStorage.getItem("jwt"))
      let liga = await api.get("dashligacao");

      ////console.log(liga.data.dados);
      this.lists[3].count = liga.data.dados.length;
      //////console.log(realliga);
      //this.ligacao.push([realliga]);

      let loga = await api.get("dashlogados");

      ////console.log(loga.data.dados);
      this.lists[0].count = loga.data.dados.length;
      ////   //console.log(realloga);
      // this.logado.push([realloga]);

      let pausa = await api.get("dashpausados");

      ////console.log(pausa.data.dados);
      this.lists[2].count = pausa.data.dados.length;
      //////console.log(realpausa);
      //this.logado.push([realpausa]);
      let deslogado = await api.get("dashdeslogados");

      ////console.log(pausa.data.dados);
      // this.lists[1].count = deslogado.data.dados.length;
      let todosoperadores = deslogado.data.dados.length;
      ////console.log(todosoperadores);

      let logados = await api.get("dashlogados");
      let logadosonline = logados.data.dados.length;

      let deslogadosoperadores;
      deslogadosoperadores = todosoperadores - logadosonline;
      ////console.log("Teste anna: ", loga);
      ////console.log("Todos operadores online",loga);
      //onsole.log("Todos operadores deslogados",deslogadosoperadores);
      //this.logado.push([realpausa]);
      this.lists[1].count = deslogadosoperadores;
    },
    reload: function () {
      setInterval(document.location.reload(true), 5000);
    },
    data() {
      let currentDate = new Date().toJSON().slice(0, 10);
      return currentDate;
    },
    graficoFluxo: async function () {
      ////console.log(atendida)

      ////console.log(this.chartData)
      let fluxo = await api.get(`fluxoteste/${this.data()}`);
      ////console.log('Fluxo Console',fluxo.data.dados)
      //let chartData1 = []
      let completo = fluxo.data.dados;

      this.chartData1 = [];
      this.chartData1.push(["Horas", "Chamadas"]);

      let horas = {
        "00:": 0,
        "01:": 0,
        "02:": 0,
        "03:": 0,
        "04:": 0,
        "05:": 0,
        "06:": 0,
        "07:": 0,
        "08:": 0,
        "09:": 0,
        "10:": 0,
        "11:": 0,
        "12:": 0,
        "13:": 0,
        "14:": 0,
        "15:": 0,
        "16:": 0,
        "17:": 0,
        "18:": 0,
        "19:": 0,
        "20:": 0,
        "21:": 0,
        "22:": 0,
        "23:": 0,
      };
      ////console.log('horas',horas['00'])
      completo.forEach((d) => {
        ////console.log('D',d)
        let datahora = d.DataHora;
        //// console.log(datahora)
        let datastring = moment(datahora).format();
        ////console.log('datastring',datastring)
        let gethora = datastring.substr(11, 3);
        ////console.log('teste',gethora)
        horas[gethora] += 1;
      });
      for (var prop in horas) {
        ////console.log(horas)
        if (horas[prop] > 0) {
          this.chartData1.push([prop + "00", horas[prop]]);

          ////console.log(prop, horas[prop]);
        }
      }
      //console.log(horas)
    },
  },

  teste() {
    this.lists.count = "4";
  },

  watch: {
    data: function () {
      this.chart.destroy();
      this.chart.render();
    },
  },
};
</script>
<style scoped>
.fa-user-plus {
  color: green;
}

.fa-user-times {
  color: red;
}

.fa-pause-circle {
  color: orange;
}

.fa-phone-square {
  color: steelblue;
}

.border {
  border: 2px solid #243e57 !important;
}

.v-btn--fab.v-size--default.v-btn--absolute.v-btn--top {
  top: 65px !important;
}

.v-btn--absolute.v-btn--left,
.v-btn--fixed.v-btn--left {
  left: -26px !important;
}

.tema {
  left: 94%;
  widows: 8%;
  text-decoration: bold;
  text-decoration: underline;
  position: fixed;
  background-color: #243e57 !important;
  color: white;
}
</style>