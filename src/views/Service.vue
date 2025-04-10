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
      <v-btn  dark class="botaoSair" >voltar</v-btn>
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
          text: "Ramal",
          align: "start",
          filterable: false,
          value: "ramalnum",
        },

        { text: "Nome do Agente", value: "nome" },
        { text: "Login", value: "lastc" },
        { text: "Logoff", value: "logoff" },
        { text: "Total Online", value: "duracaoconexao" },
        { text: "Tempo de Chamada", value: "talktime" },
        { text: "Taxa de Serviço (%)", value: "mediaform" },
    
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

      

            let tt = await api.get(`/talktime/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let talk = tt.data.dados
      let talktime = []
        talk.forEach((d) => {
     //   nomeagente = d.usuario;
       talktime = d.talktime;
     // console.log('nome da agente:', nomeagente);
        return(talktime)
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

      let logofflast = await api.get(`/ultimologoff/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let logout = logofflast.data.dados
      console.log('first: ',first)
      let logoff = []
        logout.forEach((d) => {
     //   nomeagente = d.usuario;
        logoff = d.maxlogoff;
     // console.log('nome da agente:', nomeagente);
        return(logoff)
      })

      let timet = await api.get(`/talktimesec/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let talkt = timet.data.dados
      let talktimet = []
      let talt
        talkt.forEach((d) => {
     //   nomeagente = d.usuario;
       talktimet = d.talktimesec;
       talt = talktimet
     // console.log('nome da agente:', nomeagente);
        return(talt)

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


      if(verdur < 0){

      duracaoconexao = 'Ainda logado'
      
      
    }
      console.log("takt",talt)
      
            let duraconsec = await api.get(`/duraconsec/${ramalnum}/${this.fila}/${this.d1}/${this.d2}`);
      
      let duracaocons = duraconsec.data.dados
      let duracaoconexaosec = []
      let dursec
        duracaocons.forEach((d) => {
     //   nomeagente = d.usuario;
       duracaoconexaosec = d.durconsec;
       dursec = duracaoconexaosec
     // console.log('nome da agente:', nomeagente);
        return(dursec)
      })
      console.log('durasc',dursec)

      let conexao = dursec
      let tempconv = talt
      
      console.log('Conexão: ',conexao, 'Tempo de conv: ',tempconv)
      let media = (tempconv / conexao)*60
      console.log('media: ',media)
      let mediaform = parseInt(media)+"%";
      console.log('eu sou o mediaform', mediaform)


      //select sum(sum(terminoChamada - inicioChamada))
        this.dados = [
          {nome, ramalnum, duracaoconexao, talktime, mediaform, firstc, lastc, logoff}
        ]
    console.log(this.dados)
},
 saveCSV() {
     
      this.filename = "PlugPhone Service";
      //================================================================
       let csvFile = `"Ramal";"nome do agente";"Login";"Logoff";"Total Online";"Tempo de chamada";"Taxa de serviço";\n`;
      this.dados.forEach((a) => {
        csvFile += `"${a.ramalnum}";"${a.nome}";"${a.lastc}";"${a.logoff}";"${a.duracaoconexao}";"${a.talktime}";"${a.mediaform}"\n`;
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