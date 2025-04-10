<template>
  <v-app id="inspire" class="papel">
    <Navbar />
    <div class="text-center" style="
   top: -1%;width: 65%;position: relative;
">
      <v-col cols="12" sm="6" md="3">
        <v-select :items="items" :prepend-icon="edit" label="Informe a fila" v-model="fila"></v-select>

        <v-btn color="blue darken-1" text @click="exibir" style="top: -45%; right: 30%;"> Consultar </v-btn>

      </v-col>

    </div>

    <v-container style="margin-top:-277px ; padding: 136px">
      <v-row>
        <v-col cols="12" sm="12">
          <v-toolbar flat color="rgba(0,0,0,0)" class="mt-n5">
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-row class="px-5 mt-n6 ml-5">
            <v-col cols="12" sm="3" v-for="list in lists" :key="list.id">
              <v-card align="center" class="rounded-square border pt-2" width="135" height="135" flat>

                <h1 :class="list.id">{{ list.count }} </h1>


                <v-card-text class="black--text text-lg-h10" style="margin-top: -16px;">
                  <b style="color: gray">{{ list.title }}</b>
                </v-card-text>

                <v-btn absolute fab left top style="top: 30px !important;width: 46px;height: 46px;">
                  <v-icon size="35" style=" color: {list.icon};">
                    {{ list.icon }}
                  </v-icon>
                </v-btn>
              </v-card>
            </v-col>
          </v-row>


        </v-col>
      </v-row>

    </v-container>

    <div class="text-center" style="
   top: -12%;width: 66%;position: relative;
">
      <v-col cols="12" sm="6" md="3">
        <v-select :items="items" label="Informe a fila" v-model="fila2"></v-select>

        <v-btn color="blue darken-1" text @click="exibir2" style="top: -45%;    right: 30%;"> Consultar </v-btn>

      </v-col>
    </div>
    <v-container style="margin-top: -380px; padding: 136px">
      <v-row>
        <v-col cols="12" sm="12">
          <v-toolbar flat color="rgba(0,0,0,0)" class="mt-n5">
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-row class="px-5 mt-n6 ml-5">
            <v-col cols="12" sm="3" v-for="list2 in lists2" :key="list2.id">
              <v-card align="center" class="rounded-square border pt-2" width="135" height="135" flat>

                <h1 :class="list2.id">{{ list2.count }} </h1>


                <v-card-text class="black--text text-lg-h10" style="margin-top: -16px;">
                  <b style="color: gray">{{ list2.title }}</b>
                </v-card-text>

                <v-btn absolute fab left top style="top: 30px !important;width: 46px;height: 46px;">
                  <v-icon size="35" style='color: {list2.icon};'>
                    {{ list2.icon }}
                  </v-icon>
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
      <v-btn dark class="botaoSair">voltar</v-btn>
    </router-link>
    <div class="footer">
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
    this.idsetinterval2 = setInterval(() => this.exibir2(), 5000);

    this.listfila();



  },



  async beforeDestroy() {
    //console.log("eu sou idsetinterval", this.idsetinterval);
    clearInterval(this.idsetinterval)
    clearInterval(this.idsetinterval2)
    this.idsetinterval = 0;
    this.idsetinterval2 = 0;
  },


  name: "campanhafilaView",

  data: () => ({
    idsetinterval: null,
    idsetinterval2: null,
    fila: "",
    fila2: "",
    items: [],
    lists: [
      {
        id: "um",
        icon: "mdi mdi-phone",
        title: "Total de Chamadas",
        count: 0,
      },
      {
        id: "dois",
        icon: "mdi mdi-phone-log",
        title: "Chamadas na Fila de Espera",
        count: 0,
      },
      {
        id: "tres",
        icon: "mdi mdi-phone-in-talk",
        title: "Chamadas Conectadas",
        count: 0,
      },
      {
        id: "quatro",
        icon: "mdi mdi-phone-minus",
        title: "Chamadas Abandonadas",
        count: 0,
      },
      {
        id: "cinco",
        icon: "mdi mdi-checkbox-marked-circle",
        title: "Chamadas Atendidas",
        count: 0,
      },
      {
        id: "seis",
        icon: "mdi mdi-alarm",
        title: "TMA",
        count: 0,
      },
      {
        id: "sete",
        icon: "mdi mdi-alarm-check",
        title: "TME Atendidas",
        count: 0,
      },
      {
        id: "oito",
        icon: "mdi mdi-map-search",
        title: "Media Pesq. de Satisfação",
        count: 0,
      },

    ],

    lists2: [
      {
        id: "um",
        icon: "mdi-message",
        title: "Total de mensagens",
        count: 0,
      },
      {
        id: "dois",
        icon: "mdi-message-alert",
        title: "Mensagens na fila de espera",
        count: 0,
      },
      {
        id: "tres",
        icon: "mdi-message-processing",
        title: "Conversas em andamento",
        count: 0,
      },
      {
        id: "quatro",
        icon: "mdi-message-bulleted-off",
        title: "Mensagens Sem respostas",
        count: 0,
      },
      {
        id: "cinco",
        icon: "mdi-message-plus",
        title: "Chamadas Atendidas",
        count: 0,
      },
      {
        id: "seis",
        icon: "mdi mdi-alarm",
        title: "TMA",
        count: 0,
      },
      {
        id: "sete",
        icon: "mdi mdi-alarm-check",
        title: "TMR de respondidas",
        count: 0,
      },
      {
        id: "oito",
        icon: "mdi mdi-map-search",
        title: "Media Pesq. de Satisfação",
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

      let join = await api.get(`listajoin/${this.fila}`);
      // let entrajoin = join.data.dados;
      //console.log(join);
      this.lists[1].count = join.data.dados.length;

      //Primeira bolinha do painel das filas

      let total = await api.get(
        `listajointotal/${this.fila
        }/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      let entrajointotal = total.data.dados;
      console.log(entrajointotal);
      this.lists[0].count = total.data.dados.length;

      //Terceira bolinha de chamadas conectadas na fila, isto é, aquelas chamadas que estão em curso

      let conectadofila = await api.get(`filaconectada/${this.fila}/${this.PastDateTime()}/${this.currentDateTime()}`);
      // let entrajoin = join.data.dados;
      let conectadatotal = conectadofila.data.dados;
      console.log(conectadatotal);
      this.lists[2].count = conectadofila.data.dados.length;

      //Quarta bolinha de chamadas da fila - Abandonadas do dia
      let abandonadasfila = await api.get(
        `filasabandonadas/${this.fila
        }/${this.PastDateTime()}/${this.currentDateTime()}`
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
        `tmafilas/${this.fila
        }/${this.PastDateTime()}/${this.currentDateTime()}`
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
        `tmefilas/${this.fila
        }/${this.PastDateTime()}/${this.currentDateTime()}`
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
        `mediapesquisa1/${this.PastDateTime()}/${this.currentDateTime()}`
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
        `mediapesquisaconta/${this.PastDateTime()}/${this.currentDateTime()}`
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

      let pesq = temposegundosC / count2;
      let tmeabandonadas = pesq.toFixed(2)
      //console.log(tmeabandonadas)
      this.lists[7].count = tmeabandonadas;
      this.alarme()
    },
    //------------------------------------------------------------------------------------------------------------------------------
    exibir2: async function () {
      //Segunda bolinha do painel das filas

      let join = await api.get(`listajoin/${this.fila2}`);
      // let entrajoin = join.data.dados;
      //console.log(join);
      this.lists2[1].count = join.data.dados.length;

      //Primeira bolinha do painel das filas

      let total = await api.get(
        `listajointotal/${this.fila2
        }/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      let entrajointotal = total.data.dados;
      console.log(entrajointotal);
      this.lists2[0].count = total.data.dados.length;

      //Terceira bolinha de chamadas conectadas na fila, isto é, aquelas chamadas que estão em curso

      let conectadofila = await api.get(`filaconectada/${this.fila2}/${this.PastDateTime()}/${this.currentDateTime()}`);
      // let entrajoin = join.data.dados;
      let conectadatotal = conectadofila.data.dados;
      console.log(conectadatotal);
      this.lists2[2].count = conectadofila.data.dados.length;

      //Quarta bolinha de chamadas da fila - Abandonadas do dia
      let abandonadasfila = await api.get(
        `filasabandonadas/${this.fila2
        }/${this.PastDateTime()}/${this.currentDateTime()}`
      );
      let abandonadastotal = abandonadasfila.data.dados;
      console.log(abandonadastotal);
      this.lists2[3].count = abandonadasfila.data.dados.length;

      //Quinta bolinha chamadas atendidas na fila
      let tudofila = total.data.dados.length;
      let tudoabandonofila = abandonadasfila.data.dados.length;
      let atendidas = tudofila - tudoabandonofila;
      this.lists2[4].count = atendidas;

      //Sexta bolinha tma
      let tmafila = await api.get(
        `tmafilas/${this.fila2
        }/${this.PastDateTime()}/${this.currentDateTime()}`
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
        this.lists2[5].count = tma.toFixed(2);
      });

      //Setima bolinha TME Atendidas
      let tmefila = await api.get(
        `tmefilas/${this.fila2
        }/${this.PastDateTime()}/${this.currentDateTime()}`
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
        this.lists2[6].count = tme.toFixed(2);
      });

      //Oitava bolinha TME do abandono

      let tmefilaabandono = await api.get(
        `mediapesquisa1/${this.PastDateTime()}/${this.currentDateTime()}`
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
        `mediapesquisaconta/${this.PastDateTime()}/${this.currentDateTime()}`
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

      let pesq = temposegundosC / count2;
      let tmeabandonadas = pesq.toFixed(2)
      //console.log(tmeabandonadas)
      this.lists2[7].count = tmeabandonadas;

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
        setTimeout(function () {
          audio.play();
        }, 1000);
      } else {
        //console.log("feito");
      }
    },
    alarme: async function () {
      if (this.lists[1].count >= 2) {

        setTimeout(() => { this.playSound(); }, 3000);
        console.log('oi')
        this.lists[1].icon = 'mdi mdi-alert'
      } else {
        this.sound = "";
        this.lists[1].icon = 'mdi mdi-phone-log'
      }

      if (this.lists2[1].count >= 2) {
        console.log('tudobem?')
        setTimeout(() => { this.playSound(); }, 3000);
        this.lists2[1].icon = 'mdi mdi-alert'
      } else {
        this.sound = "";
        this.lists2[1].icon = 'mdi mdi-phone-log'
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
  color: green !important;
}

.mdi-message {
  color: blue !important;
}

.mdi-message-alert {
  color: orange !important;
}


.mdi-message-processing {
  color: green !important;
}

.mdi-message-bulleted-off {
  color: red !important;
}

.tres {
  font-size: 48px;
  color: green !important;
}

.mdi-alarm {
  color: blue !important;
}

.seis {
  font-size: 48px;
  color: blue !important;
}

.mdi-map-search {
  color: rgb(59, 137, 255) !important;
}

.oito {
  font-size: 48px;
  color: rgb(59, 137, 255) !important;
}

.linkp {
  text-decoration: none;
}

.botaoSair {
  margin-left: 47%;
  bottom: 9%;
  position: absolute;
  text-decoration: none !important;
  background-color: green !important;
}

.mdi-checkbox-marked-circle {
  color: green !important;
}

.cinco {
  font-size: 48px;
  color: green !important;
}

.mdi-phone-log {
  color: orange !important;
}

.dois {
  font-size: 48px;
  color: orange !important;
}

.mdi-phone-minus {
  color: red !important;
}

.quatro {
  font-size: 48px;
  color: red !important;
}

.mdi-alert {
  color: #ff6f00 !important;

}

.custom-select .v-icon {
  font-size: 6px !important;
}

.mdi-phone {
  color: blue !important;
}

.um {
  font-size: 48px;
  color: blue !important;
}

.mdi-alarm-check {
  color: green !important;
}


.sete {
  font-size: 48px;
  color: green !important;
}

.mdi-alarm-off {
  color: red !important;
}

.footer {
  position: absolute;
  bottom: 0%;
  width: 100%;
}

.mdi-message-plus {
  color: green !important;
}
</style>