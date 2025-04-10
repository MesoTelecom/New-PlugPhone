<template>
  <v-app id="inspire" class="papel">
    <br />
    <Navbar />
    <div class="text-center">
      <br>
      <router-link to="/campanhafila">
      <v-btn>voltar</v-btn>
    </router-link>

    </div>

    <v-container>
      <v-row>
        <v-col cols="12" sm="12">
          <v-toolbar flat color="rgba(0,0,0,0)" class="mt-n5">
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-row class="px-5 mt-n6 ml-5">
            <v-col cols="12" sm="3" v-for="list in lists" :key="list.id">
              <v-card
                align="center"
                color="#F9FAFC"
                class="rounded-circle border pt-10"
                width="200"
                height="200"
                flat
              >
                <v-icon size="60">
                  {{ list.icon }}
                </v-icon>

                <v-card-text class="grey--text text-lg-h6">
                  {{ list.title }}
                </v-card-text>

                <v-btn
                  absolute
                  color="#243e57"
                  class="white--text"
                  fab
                  left
                  top
                >
                  <h2>{{ list.count }}</h2>
                </v-btn>
              </v-card>
            </v-col>
          </v-row>

          <br />
          <br />
        </v-col>
      </v-row>
    </v-container>
    <router-link to="./menurealtime" class="linkp">
      <v-btn  dark class="botaoSair">voltar</v-btn>
    </router-link>
    <div>
      <Footer />
    </div>
  </v-app>
</template>


<script>
import { api } from "@/conf/api";

import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";

export default {
  async beforeMount() {
    //const { setIntervalAsync } = require("set-interval-async/legacy");
    this.exibir();
    //console.log("eu sou idsetinterval Before mount", this.idsetinterval);

    this.idsetinterval = setInterval(() => this.exibir(), 5000);
    
     this.alarme();
    this.listfila();
    this.exibir();
  
  },

  async beforeDestroy() {
    //console.log("eu sou idsetinterval", this.idsetinterval);
        clearInterval(this.idsetinterval)
    this.idsetinterval = 0;
  },
   

  name: "campanhafilaView",

  data: () => ({
          idsetinterval: null,
    fila: "",
    items: [],
    lists: [
      {
        id: 1,
        icon: "mdi mdi-phone",
        title: "Total de chamadas",
        count: 0,
      },
      {
        id: 2,
        icon: "mdi mdi-phone-log",
        title: "Chamadas na fila de espera",
        count: 0,
      },
      {
        id: 3,
        icon: "mdi mdi-phone-in-talk",
        title: "Chamadas conectadas",
        count: 0,
      },
      {
        id: 4,
        icon: "mdi mdi-phone-minus",
        title: "Chamadas abandonadas",
        count: 0,
      },
      {
        id: 5,
        icon: "mdi mdi-checkbox-marked-circle",
        title: "Chamadas atendidas",
        count: 0,
      },
      {
        id: 6,
        icon: "mdi mdi-alarm",
        title: "TMA",
        count: 0,
      },
      {
        id: 7,
        icon: "mdi mdi-alarm-check",
        title: "TME atendidas",
        count: 0,
      },
      {
        id: 8,
        icon: "mdi mdi-map-search",
        title: "Me Pesquisa de Satisfação",
        count: 0,
      },
    ],
    contatma: [],
    listafila: [],
    listatotalfilas: [],
    sound:
      '../../src/audios/multalarm2.wav',
  }),
  components: {
    Navbar,
    Footer,
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
      const time = "23:59:59";
      const dateTime = date + " " + time;

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
      const time = "00:00:00";
      const dateTimeB = date + " " + time;

      return dateTimeB;
    },

    listfila: async function () {
      //// console.log(this.fila)

      //Lista filas
      let listafila = await api.get(`/listafilastotais`);
      // let entrajoin = join.data.dados;
      //console.log(listafila);
      let listatotalfilas = listafila.data.dados;
      //console.log("Lista as filas", listatotalfilas);
      let numerofila = [];
      // let nomefila = [];
      listatotalfilas.forEach((d) => {
        //  nomefila = d.descr;
        numerofila = d.extension;
        //console.log("nome da fila:", numerofila);
        // this.listafila = [nomefila];
        //this.items = nomefila;

        this.items.push([numerofila]);
      });
    },
    exibir: async function () {
      //Segunda bolinha do painel das filas

      let join = await api.get(`/listajoingeral/`);
      // let entrajoin = join.data.dados;
      //console.log(join);
      this.lists[1].count = join.data.dados.length;

      //Primeira bolinha do painel das filas

      let total = await api.get(
        `/listajointotalgeral/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      let entrajointotal = total.data.dados;
      console.log(entrajointotal);
      this.lists[0].count = total.data.dados.length;

      //Terceira bolinha de chamadas conectadas na fila, isto é, aquelas chamadas que estão em curso

      let conectadofila = await api.get(`/filaconectadageral/${this.PastDateTime()}/${this.currentDateTime()}`);
      // let entrajoin = join.data.dados;
      let conectadatotal = conectadofila.data.dados;
      console.log(conectadatotal);
      this.lists[2].count = conectadofila.data.dados.length;

      //Quarta bolinha de chamadas da fila - Abandonadas do dia
      let abandonadasfila = await api.get(
        `/filasabandonadasgeral/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      let abandonadastotal = abandonadasfila.data.dados;
      console.log(abandonadastotal);
      this.lists[3].count = abandonadasfila.data.dados.length;

      //Quinta bolinha chamadas atendidas na fila
      let tudofila = total.data.dados.length;
      let tudoabandonofila = abandonadasfila.data.dados.length;
      let atendidas = tudofila - tudoabandonofila;
      this.lists[4].count = atendidas;

      //Sexta bolinha tma
      let tmafila = await api.get(
        `/tmafilasgeral/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      //console.log("primeiro:", tmafila);
      let tmarealfila = tmafila.data.dados;
      //console.log("Opa eu sou o edu array completo:", tmarealfila);

      tmarealfila.forEach((d) => {
        let temposegundosA = d.mediaANNA;
        //console.log("Eu sou o Edu:", temposegundosA);
        ////console.log('Eu sou o Edu A:', temposegundosB);
        let tma = temposegundosA / 60;
        //console.log("Eu sou o TMA do Lucas:", tma);
        this.lists[5].count = tma.toFixed(2);
      });

      //Setima bolinha TME Atendidas
      let tmefila = await api.get(
        `/tmefilasgeral/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      //console.log("primeiro:", tmefila);
      let tmerealfila = tmefila.data.dados;
      //console.log("Opa eu sou o edu array completo:", tmerealfila);

      tmerealfila.forEach((d) => {
        let temposegundosB = d.mediaespera;
        //console.log("Eu sou o Edu:", temposegundosB);
        ////console.log('Eu sou o Edu A:', temposegundosB);
        let tme = temposegundosB / 60;
        //console.log("Eu sou o TME do Lucas:", tme);
        this.lists[6].count = tme.toFixed(2);
      });

      //Oitava bolinha TME do abandono

      let tmefilaabandono = await api.get(
        `/mediapesquisa1/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      console.log("primeiro:", tmefilaabandono);
      let tmerealfilaabandonada = tmefilaabandono.data.dados;
      //console.log("Opa eu sou o edu array completo:", tmerealfilaabandonada);
      let temposegundosC
      tmerealfilaabandonada.forEach((d) => {
        temposegundosC = d.medianota;
        //console.log("Eu sou o Edu temposegundosC:", temposegundosC);
        ////console.log('Eu sou o Edu A:', temposegundosB);
        return temposegundosC
      });
      let conta = await api.get(
        `/mediapesquisaconta/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      //console.log("primeiro:", conta);
      let contaarray = conta.data.dados;
      //console.log("Opa eu sou o edu array completo contaarray:", contaarray);
      let count
      contaarray.forEach((d) => {
        count = d.contapesq;
        //console.log("Eu sou o Edu:", count);
        ////console.log('Eu sou o Edu A:', temposegundosB);
        
        return count
      });
      let count2 = count + count

      let pesq = temposegundosC/count2 ;
      let tmeabandonadas = pesq.toFixed(2)
      //console.log(tmeabandonadas)
        this.lists[7].count = tmeabandonadas;
      this.alarme()
    },

    playSound(sound) {
      this.sound =
        '../../src/audios/multalarm2.wav';
      sound = this.sound;
      if (
        sound ===
        '../../src/audios/multalarm2.wav'
      ) {
        var audio = new Audio(require('../../src/audios/multalarm2.wav'));
        audio.play();
      } else {
        //console.log("feito");
      }
    },
    alarme: async function () {
      if (this.lists[1].count >= 2) {
        this.playSound();
        this.lists[1].icon ='mdi mdi-alert'
      } else {
        this.sound = "";
        this.lists[1].icon= 'mdi mdi-phone-log'
      }
    },
  },
  
};
</script>
<style scoped>
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
.mdi-phone-in-talk {
  color: green;
}
.mdi-alarm {
  color: blue;
}

.mdi-map-search
 {
  color: rgb(59, 137, 255);
}
.linkp {
  text-decoration: none;
}
.botaoSair {
  margin-left: 47%;
  text-decoration: none !important;
  background-color: green !important;
}

.mdi-checkbox-marked-circle {
  color: green;
}


.mdi-phone-log {
  color: orange;
}
.mdi-phone-minus {
  color: red;
}
.mdi-alert{
    font-size: 70px;
    color: #ff6f00;
    border-radius: 16% !important;
    width: 45%;
}
.mdi-phone {
  color: blue;
}
.mdi-alarm-check {
  color: green;
}
.mdi-alarm-off {
  color: red;
}
</style>