<template>
  <div class="limiter">
    <Navbar />
    <br>
    <v-card class="filtrorelatorios">
      <!--Entrada do Período da API-->
      <input type="date" class="datest" v-model="d1" required />

      <!--Saída do Período da API-->
      <input type="date" class="datest" v-model="d2" required />
      <v-select v-model="pintotal" :items="items2" item-text="nome" item-value="pin" label="Informe o nome do operador"
        class="filtro" persistent-hint return-object single-line
        style="right: 8%;margin-left: 9%;margin-bottom: -1%;"></v-select>
      <v-btn class="botaoA" @click="exibir()">
        Consultar
      </v-btn>
      <br>

      <router-link to="./menusupervisorsainte" class="linkp">
        <v-btn dark class="botaoSair">voltar</v-btn>
      </router-link>
      <v-btn class="botaoB" @click="saveCSV()">
        BAIXAR<br>CSV
      </v-btn>
    </v-card>
    <br>
    <v-card class="cardform">
      <v-card-title class="cardtitulo">
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-title>
      <v-data-table :headers="headers" :items="dados" :search="search"></v-data-table>

    </v-card>
    <br>
    <Footer />
  </div>
</template>
<script>
import { api } from "@/conf/api";
import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";
import moment from "moment";

export default {
  name: 'HelloWord',
  async beforeMount() {

    this.listar();
  },
  components: {
    Navbar,
    Footer,

  },

  data() {
    return {
      d1: '',

      d2: '',

      fila: '',

      pin: '',
      items: [],
      items2: [],
      pintotal: '',
      search: "",
      headers: [
        {
          text: "Ramal",
          align: "start",
          filterable: true,
          value: "ramalNum",
        },
        { text: "Login", value: "lastc" },
        { text: "Logoff", value: "logoff" },
        { text: "Total Online", value: "duracaoconexao" },
        { text: "Tempo de chamada", value: "talktime" },
        { text: "Taxa de serviço (%)", value: "mediaform" },

      ],
      dados: [],
      grupoRelatorio: '',
    }
  },
  methods: {

    dataF: function (d2) {
      let d = d2;
      return (
        d.substr(0, 4) +
        "-" +
        d.substr(5, 2) +
        "-" +
        d.substr(8, 2) +
        " " +
        d.substr(11, 2) +
        ":" +
        d.substr(14, 2) +
        ":" +
        d.substr(17, 2)
      );
    },
    listar: async function () {

      let usuario = JSON.parse(localStorage.getItem('usu'))
      this.grupoRelatorio = usuario.grupo
      console.log(this.grupoRelatorio)

      let listarAgente = await api.get(`/listaramais`)
      console.log('listar', listarAgente)
      let listaTotalAgente = listarAgente.data.dados

      let nome = []
      listaTotalAgente.forEach((d) => {
        nome = d.extension
        this.items2.push([nome])

      })


    },
    exibir: async function () {
      let data1 = this.d1
      let data2 = this.d2

      // console.log(data1)
      // console.log(data2)

      let ramalDoAgente = this.pintotal[0]
      console.log('xereco', ramalDoAgente)

      let ramal = await api.get(`/realoperadorlogados2/${ramalDoAgente}/${data1}/${data2}`)
      let ramalPin = ramal.data.dados
      let trataLogin = ramalPin[0]

      console.log('eu sou ramalPin', ramalPin)
      console.log('eu sou trataLogin', trataLogin)

      let dadoLogin = trataLogin.datahora
      let getPosition = ramalPin.length - 1
      let trataHora = ramalPin[getPosition]

      /* eslint-disable no-unused-vars */
      trataHora
      /* eslint-disable no-unused-vars */

      let trataLogin2 = this.dataF(moment(dadoLogin).locale("pt-br").format())
      let dataLogin, dataLogout, ramalUsado


      // console.log('oi', trataLogin2)
      // console.log('oi', trataHora)

      ramalPin.forEach((d) => {
        ramalUsado = d.ramal
        if (d.motivo == 'Login') {
          dataLogin = this.dataF(moment(trataLogin2).locale('pt-br').format())
        } else if (d.motivo == 'Logoff') {
          dataLogout = this.dataF(moment(d.datahora).locale('pt-br').format())
        } else if (!dataLogin) {
          return window.alert('Ramal não fez login no período')
        } else if (!dataLogout) {
          dataLogout = data2 + " 23:59:59"
        }
      })
      // console.log(dataLogin + " " + dataLogout)

      let ramalNum = ramalUsado.replace(/[^\d]+/g, "");
      console.log(ramalNum)

      let con = await api.get(`/primeiraconsainte/${ramalNum}/${this.d1}/${this.d2}`);


      let first = con.data.dados
      console.log('first: ', first)
      let firstc = []
      first.forEach((d) => {
        // nomeagente = d.usuario;
        firstc = d.mindata;
        // console.log('nome da agente:', nomeagente);
        return (firstc)
      })

      let duracon = await api.get(`/duracomsainte/${ramalNum}/${this.d1}/${this.d2}`);
      let duracaocon = duracon.data.dados
      console.log('first: ', first)
      let duracaoconexao = []
      duracaocon.forEach((d) => {
        // nomeagente = d.usuario;
        duracaoconexao = d.durcon;
        // console.log('nome da agente:', nomeagente);
        return (duracaoconexao)
      })



      let tt = await api.get(`/talktimesainte/${ramalNum}/${this.d1}/${this.d2}`);

      let talk = tt.data.dados
      let talktime = []
      console.log(tt)
      talk.forEach((d) => {
        // nomeagente = d.usuario;
        talktime = d.talktime;
        // console.log('nome da agente:', nomeagente);
        return (talktime)
      })

      let confim = await api.get(`/ultimaconsainte/${ramalNum}/${this.d1}/${this.d2}`);

      let last = confim.data.dados
      console.log('first: ', first)
      let lastc = []
      last.forEach((d) => {
        // nomeagente = d.usuario;
        lastc = this.dataF(moment(d.maxdata).locale('pt-br').format())
        console.log("sou eu", d.maxdata)
        // console.log('nome da agente:', nomeagente);
        return (lastc)
      })

      let logofflast = await api.get(`/ultimologoffsainte/${ramalNum}/${this.d1}/${this.d2}`);

      let logout = logofflast.data.dados
      console.log('first: ', first)
      let logoff = []
      logout.forEach((d) => {
        // nomeagente = d.usuario;
        logoff = this.dataF(moment(d.maxlogoff).locale('pt-br').format())
        // console.log('nome da agente:', nomeagente);
        return (logoff)
      })

      let timet = await api.get(`/talktimesecsainte/${ramalNum}/${this.d1}/${this.d2}`);

      let talkt = timet.data.dados
      let talktimet = []
      let talt
      talkt.forEach((d) => {
        // nomeagente = d.usuario;
        talktimet = d.talktimesec;
        talt = talktimet
        // console.log('nome da agente:', nomeagente);
        return (talt)

      })
      let verificadur = await api.get(`/verificadursainte/${ramalNum}/${this.d1}/${this.d2}`);

      let verificarduracao = verificadur.data.dados
      console.log('sadddddddddd', verificarduracao)
      console.log('first: ', first)
      let verdur = []
      verificarduracao.forEach((d) => {
        // nomeagente = d.usuario;
        verdur = d.verificadur;
        // console.log('nome da agente:', nomeagente);
        return (verdur)
      })


      if (verdur < 0) {

        duracaoconexao = 'Ainda logado'


      }
      console.log("takt", talt)

      let duraconsec = await api.get(`/duraconsecsainte/${ramalNum}/${this.d1}/${this.d2}`);

      let duracaocons = duraconsec.data.dados
      let duracaoconexaosec = []
      let dursec
      duracaocons.forEach((d) => {
        // nomeagente = d.usuario;
        duracaoconexaosec = d.durconsec;
        dursec = duracaoconexaosec
        // console.log('nome da agente:', nomeagente);
        return (dursec)
      })
      console.log('durasc', dursec)

      let conexao = dursec
      let tempconv = talt

      console.log('Conexão: ', conexao, 'Tempo de conv: ', tempconv)
      let media = (tempconv / conexao) * 60
      console.log('media: ', media)
      let mediaform = parseInt(media) + "%";
      console.log('eu sou o mediaform', mediaform)


      //select sum(sum(terminoChamada - inicioChamada))
      this.dados = [
        { ramalNum, ramal, duracaoconexao, talktime, mediaform, firstc, lastc, logoff }
      ]
      console.log(this.dados)
    },
    saveCSV() {

      this.filename = "PlugPhone Service";
      //================================================================
      let csvFile = `"Ramal";"Login";"Logoff";"Total Online";"Tempo de chamada";"Taxa de serviço";\n`;
      this.dados.forEach((a) => {
        csvFile += `"${a.ramalNum}";"${a.lastc}";"${a.logoff}";"${a.duracaoconexao}";"${a.talktime}";"${a.mediaform}"\n`;
      });

      var blob = new Blob(["\ufeff", csvFile], {
        type: "text/csv;charset=utf-8;",
      });
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, this.filename);
      } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", this.filename);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      //================================================================

      //alert(this.filename)
      this.filename = "PlugPhone Service";
    },
  }

}
</script>
<style scoped>
/*//////////////////////////////////////////////////////////////////
  [ FONT ]*/

/*//////////////////////////////////////////////////////////////////
  [ RESTYLE TAG ]*/
* {
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
}

body,
html {
  height: 100%;
  font-family: sans-serif;
}

/* ------------------------------------ */
a {
  margin: 0px;
  transition: all 0.4s;
  -webkit-transition: all 0.4s;
  -o-transition: all 0.4s;
  -moz-transition: all 0.4s;
}

.filtro2 {
  width: 240px;
  margin-left: 33%;
  right: 31%;
  margin-bottom: -1%;
}

.filtrorelatorios {
  display: flex;
  margin-top: -27px;
  background-color: rgba(255, 255, 255, 0.717);
  align-items: self-end;
}

.datest {
  border-style: solid !important;
  display: inline;
  border-radius: 0% !important;
  margin-top: 19PX;
  width: 125px;
  margin-left: 0.2%;
  margin-bottom: 0%;
  border-color: black;
  border-width: 3% !important;
}

a:focus {
  outline: none !important;
}

a:hover {
  text-decoration: none;
}

.cardform {
  background-color: #61a5e8;
}

/* ------------------------------------ */
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0px;
}

p {
  margin: 0px;
  font-size: 25px;
  color: #fff;
}

ul,
li {
  margin: 0px;
  list-style-type: none;
}

/* ------------------------------------ */

textarea {
  display: block;
  outline: none;
}

.botaoA {
  margin-left: -5%;
  right: 1%;
  background-color: rgb(97 165 232) !important;
  color: white;
}

.botaoB {
  margin-left: 6%;
  right: 5%;
  background-color: rgb(88, 202, 109) !important;
  color: white;
}

.botaoSair {
  margin-left: 1%;
  background-color: green !important;
  text-decoration: none !important;
}
</style>