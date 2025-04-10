<template>
  <div class="limiter">
    <Navbar />
    <br>
      <v-card class="filtrorelatorios">
      <!--Entrada do Período da API-->
      <input type="date" class="datest" v-model="d1" required />
      
      <!--Saída do Período da API-->
      <input type="date" class="datest" v-model="d2" required/>
      <v-select
          :items="items"
          label="Fila de atendimento"
          v-model="fila"
          class="filtro"
        ></v-select>
              <v-select
          :items="items2"
          label="Informar o operador"
          v-model="pin"
            class="filtro2"
        ></v-select>
      <v-btn
      class="botaoA"
      @click="exibir()"
    >
     Consultar
      </v-btn>
    <br>

      <router-link to="./menusupervisor" class="linkp">
      <v-btn dark class="botaoSair" >voltar</v-btn>
</router-link>
   <v-btn
      class="botaoB"
      @click="saveCSV()"
    >
     BAIXAR<br>CSV
      </v-btn>
    </v-card>
     <br>
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
      <v-data-table
        :headers="headers"
        :items="dados"
        :search="search"
      ></v-data-table>

    </v-card>
  <br>
    <Footer />
  </div>
</template>
<script>
import { api } from "@/conf/api";  
import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";

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

      
      search: "",
      headers: [
        {
          text: "Nome",
          align: "start",
          filterable: false,
          value: "nome",
        },
        {text: "ramal", value: "ramalnum"},

        { text: "Primeira Conexão", value: "firstc" },
         { text: "Última Conexão", value: "lastc" },
        { text: "Tempo de conexão", value: "duracaoconexao" },
        { text: "Nº de conexões", value: "conta" },
        { text: "Nº chamadas de entrada", value: "liga" },
        { text: "media Chamadas/h", value: "mediaph" },
        { text: "Talktime do agente", value: "talktime" },
        { text: "Média Chamadas recebidas", value: "medialiga" },
        { text: "Quantidade de pausas", value: "pausa" },
        { text: "Soma de pausas", value: "duracaop" },
      ],
      dados: [],
      
    }
    
  },
  
  methods: {
    listar: async function(){
   // console.log(this.fila)
 // console.log(filareal, pinreal);
  //Lista filas
    let listafila = await api.get(`/listafilastotais`);
 // let entrajoin = join.data.dados;
  console.log(listafila);
   let listatotalfilas =  listafila.data.dados;
  console.log('Lista as filas',listatotalfilas);
    let numerofila = [];
  //let nomefila = [];
   listatotalfilas.forEach((d) => {
       // nomefila = d.descr;
       numerofila = d.extension;
      console.log('nome da fila:', numerofila);
     // this.listafila = [nomefila];
      //this.items = nomefila;
     this.items.push([numerofila]);
   });
  
  //Listando os agentes para o filtro

    let listaagentes = await api.get(`/listaramais`);

  console.log(listaagentes);
   let listatotalagentes =  listaagentes.data.dados;
  //console.log('Lista os agentes',listatotalagentes);
    let pinagente = [];
   // let nomeagente = [];
   // let sopin = [];
   listatotalagentes.forEach((d) => {
     //   nomeagente = d.usuario;
       pinagente = d.name;
     // console.log('nome da agente:', nomeagente);
     this.items2.push([pinagente]);
    //  this.sopin.push([pinagente]);
   // console.log('Eu sou o PIN puro:', sopin);

   });
},

exibir: async function(){
  console.log(this.pin)
      let b = await api.get(`/listnum/${this.pin}`);

      let ramal = b.data.dados
      let ramalnum = []
      let nome = this.pin
      ramal.forEach((d) => {
     //   nomeagente = d.usuario;
       ramalnum = d.extension;
     // console.log('nome da agente:', nomeagente);
        return(ramalnum)
      })
      let con = await api.get(`/primeiracon/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let first = con.data.dados
      console.log('first: ',first)
      let firstc = []
        first.forEach((d) => {
     //   nomeagente = d.usuario;
       firstc = d.mindata;
     // console.log('nome da agente:', nomeagente);
        return(firstc)
      })

      let confim = await api.get(`/ultimacon/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let last = confim.data.dados
      console.log('first: ',first)
      let lastc = []
        last.forEach((d) => {
     //   nomeagente = d.usuario;
       lastc = d.maxdata;
     // console.log('nome da agente:', nomeagente);
        return(lastc)
      })

      let cont = await api.get(`/numcount/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let contnum = cont.data.dados
      let conta = []
        contnum.forEach((d) => {
     //   nomeagente = d.usuario;
       conta = d.numcon;
     // console.log('nome da agente:', nomeagente);
        return(conta)
      })

      let ligacoes = await api.get(`/numchamada/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let ligac = ligacoes.data.dados
      let liga = []
        ligac.forEach((d) => {
     //   nomeagente = d.usuario;
       liga = d.ligacoes;
     // console.log('nome da agente:', nomeagente);
        return(liga)
      })

      let duracaopausas = await api.get(`/durpausa/${ramalnum}/${this.d1}/${this.d2}`);
      
      let duracaopausa = duracaopausas.data.dados
      let duracaop = []
        duracaopausa.forEach((d) => {
     //   nomeagente = d.usuario;
       duracaop = d.durpause;
     // console.log('nome da agente:', nomeagente);
        return(duracaop)
      })

      let calls = await api.get(`/numcall/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let called = calls.data.dados
      let call = []
        called.forEach((d) => {
     //   nomeagente = d.usuario;
       call = d.acalled;
     // console.log('nome da agente:', nomeagente);
        return(call)
      })

      let medialiga = (call + liga)/2

     let porhora = liga/60 

      let pausaco = await api.get(`/numpausa/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let pausar = pausaco.data.dados
      let pausa = []
        pausar.forEach((d) => {
     //   nomeagente = d.usuario;
       pausa = d.pausas;
     // console.log('nome da agente:', nomeagente);
        return(pausa)
      })

      let duracon = await api.get(`/duracon/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let duracaocon = duracon.data.dados
      console.log('first: ',first)
      let duracaoconexao = []
        duracaocon.forEach((d) => {
     //   nomeagente = d.usuario;
       duracaoconexao = d.durcon;
     // console.log('nome da agente:', nomeagente);
        return(duracaoconexao)
      })

            let verificadur = await api.get(`/verificadur/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let verificarduracao = verificadur.data.dados
      console.log('first: ',first)
      let verdur = []
        verificarduracao.forEach((d) => {
     //   nomeagente = d.usuario;
       verdur = d.verificadur;
     // console.log('nome da agente:', nomeagente);
        return(verdur)
      })


      let tt = await api.get(`/talktime/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let talk = tt.data.dados
      let talktime = []
        talk.forEach((d) => {
     //   nomeagente = d.usuario;
       talktime = d.talktime;
     // console.log('nome da agente:', nomeagente);
        return(talktime)
      })
      
      let mediaph = porhora.toFixed(2);
    console.log(verdur)
      
    if(verdur < 0){

      duracaoconexao = 'Ainda logado'
      
      
    }

      

      this.dados = [
        {nome, ramalnum, firstc, lastc, conta, liga,  mediaph, pausa, call, medialiga,talktime ,duracaoconexao, duracaop}
      ],

      console.log('dados: ', this.dados)
},
      saveCSV() {
     
      this.filename = "PlugPhone Conexões do Agente";
      //================================================================
       let csvFile = `"Nome";"ramal";"Primeira Conexão";"Última Conexão";"Tempo de conexão";"Nº de conexões";"Nº chamadas de entrada";"media Chamadas/h";"Talktime do agente";"Média Chamadas recebidas";"Quantidade de pausas";"Soma de pausas"\n`;
      this.dados.forEach((a) => {
        csvFile += `"${a.nome}";"${a.ramalnum}";"${a.firstc}";"${a.lastc}";"${a.duracaoconexao}";"${a.conta}";"${a.liga}";"${a.mediaph}";"${a.talktime}";"${a.medialiga}";"${a.pausa}";"${a.duracaop}"\n`;
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
      this.filename = "PlugPhone Score Plus";
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
.filtro{
    width: 0%;
    margin-left: 8%;
    right: 6%;
    margin-bottom: -1%;

}
.filtro2{
        width: 0%;
    margin-left: 14%;
    right: 19%;
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
  background-color:rgb(88, 202, 109) !important;
  color: white;
}

.botaoSair {
  margin-left: 1%;
  background-color: green !important;
  text-decoration: none !important;
}
</style>