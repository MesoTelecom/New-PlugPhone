<template>
  <div class="limiter">
    <Navbar />
    <br />
    <v-card class="filtrorelatorios">
      <!--Entrada do Período da API-->
      <input type="date" class="datest" v-model="d1" required />

      <!--Saída do Período da API-->
      <input type="date" class="datest" v-model="d2" required />
      <v-btn class="botaoA" @click="exibir()"> Consultar </v-btn>
      <br />

      <router-link to="./menusupervisor" class="linkp">
        <v-btn  dark class="botaoSair">voltar</v-btn>
      </router-link>
    </v-card>
    <br />
    <v-card class="cardform">
      <v-card-title class="cardtitulo">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table :headers="headers" :items="dados" :search="search">
        <template v-slot:[`item.actions`]="{item}">
          <v-icon small class="mr-2" @click="play(item)"> mdi-play </v-icon>
        </template>
      </v-data-table>
    </v-card>
    <br />
    <Footer />
  </div>
</template>
<script>
import { api } from "@/conf/api";
import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";

export default {
  name: "HelloWord",
  components: {
    Navbar,
    Footer,
  },

  data() {
    return {
      d1: "",

      d2: "",

      fila: "",

      pin: "",
      items: [],

      search: "",
      headers: [
        {
          text: "Data",
          align: "start",
          filterable: false,
          value: "calldate",
        },
        { text: "Origem", value: "src" },
        { text: "Destino", value: "dst" },
        { text: "Duração", value: "duration" },
        { text: "Gravação", value: "recordingfile" },
        { text: "Ouvir", value: "actions", sortable: false },
      ],
      dados: [],
      arrayteste: [{}],
    };
  },
  methods: {
    exibir: async function () {
      let gravacao = await api.get(`/gravacao/${this.d1}/${this.d2}`);
      this.dados = gravacao.data.dados;

 
      
    },

    play: async function () {

            
              let teste =[]
              this.items.forEach((d) =>{
                teste = d.recordingfile
                return teste
              })
              console.log('ooooi: ',teste)
      var audio = new Audio(
            
        
        require(`../monitor/${this.items.recordingfile}`)
      );
      audio.play();
    },
  },
};
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
.botaoSair {
  margin-left: 1%;
  background-color: green !important;
  text-decoration: none !important;
}
/* ------------------------------------ */
a {
  margin: 0px;
  transition: all 0.4s;
  -webkit-transition: all 0.4s;
  -o-transition: all 0.4s;
  -moz-transition: all 0.4s;
}
.botaoA {
  margin-left: 1%;
  right: 15%;
  background-color: rgb(97 165 232) !important;
  color: white;
}
.filtro {
  width: 0%;
  margin-left: 8%;
  right: 6%;
  margin-bottom: -1%;
}
.filtro2 {
  width: 0%;
  margin-left: 14%;
  right: 19%;
  margin-bottom: -1%;
}
.filtrorelatorios {
  display: flex;
  align-items: self-end;
}
.datest {
  border-style: solid !important;
  display: inline;
  border-radius: 0% !important;
  margin-top: 19px;
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
  margin-left: 40%;
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