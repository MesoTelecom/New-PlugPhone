<template>
  <div class="limiter">
    <Navbar />
    <br>
      <v-card class="filtrorelatorios">
      <!--Entrada do Período da API-->
      <input type="date" class="datest" v-model="d1" required />
      
      <!--Saída do Período da API-->
      <input type="date" class="datest" v-model="d2" required/>
     
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
   <!--    <ColunaPesq/> -->
                    <GChart
    type="ColumnChart"
    :data="chartData1"
    :options="chartOptions1"
  />
  <br>
    <Footer />
  </div>
</template>
<script>

import { api } from "@/conf/api";  
//import ColunaPesq from "../components/ColunaPesq.vue";
import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";
 import { GChart } from 'vue-google-charts/legacy';
//import JsonCSV from 'vue-json-csv';

export default {
   name: 'HelloWord',
     async beforeMount() {
    
   this.grafico();

  },
  components: {
    Navbar,
    Footer,
  //  ColunaPesq,
    GChart
  },
 
  data() {
    return {
      d1: '',
	
      d2: '',

      fila: '',

      pin: '',
   

      
      search: "",
      headers: [
        {
          text: "Vendedor",
          align: "start",
          filterable: false,
          value: "operador",
        },

        { text: "Cliente", value: "cliente" },
         { text: "tempo de atendimento", value: "pergunta1" },
        { text: "nota de atendimento do agente", value: "pergunta2" },
        { text: "Data e hora", value: "datahora" },
    
      ],
      dados: [],

    chartData1:[],
  chartData2: [],
	chartOptions1: {
       title: 'PlugPhone Score Plus',
        curveType: 'function',
        backgroundColor: { fill: "transparent" },

        legend: { position: 'center' },
        'width':900,
        'height':450,
        color: "9e9e9e",
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
      }
      
      
    }
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
      exibir: async function(){
    let dadospesquisa = await api.get(`/pesquisa/${this.d1}/${this.d2}`);
     this.dados = dadospesquisa.data.dados;

      },
      grafico: async function(){
         let dadospesquisa = await api.get(`/pesquisa/${this.PastDateTime()}/${this.currentDateTime()}`);
    let trata = dadospesquisa.data.dados;
    console.log('verificar:', trata)
      /*let dadosgrafico = [];
      let a1 = [];
      let a2 = [];
      */
    let dado1
    // let batata
    // batata = dadospesquisa.data.dados.length;
    let dado2 
     let nota1 = 0;
      let nota2 = 0;
      let nota3 = 0;
      let nota4 = 0;
      let nota5 = 0;
      

     trata.forEach((d) =>{
       dado1 = d.pergunta1;
       dado2 = d.pergunta2;
      console.log('eu vim pro gráfico', dado1, dado2)

     if(dado1==3){
      nota3++
     }
      else if(dado1==2){
      nota2++
     }
      else if(dado1==1){
      nota1++
     }

      if(dado2==3){
      nota3++
     }
      else if(dado2==2){
      nota2++
     }
      else if(dado2==1){
      nota1++
     }



      return dado1, dado2, nota1, nota2, nota3, nota4, nota5

     })
    
     
     // console.log('eu sou o dado 1' , dado1)
           
    //console.log(nota1, nota2, nota3, nota4, nota5, nota6, nota7, nota9, nota10);

  this.chartData1.push(['Nota', 'Total']);
  this.chartData1.push(['Nota 1', nota1]);
  this.chartData1.push(['Nota 2', nota2]);
  this.chartData1.push(['Nota 3', nota3]);

 
      

      },
      saveCSV() {
     
      this.filename = "PlugPhone Score Plus";
      //================================================================
       let csvFile = `"id";"vendedor";"cliente";"participou";"nota";"datahora"\n`;
      this.dados.forEach((a) => {
        csvFile += `"${a.id}";"${a.vendedor}";"${a.cliente}";"${a.gostaria}";"${a.nota}";"${a.datahora}"\n`;
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
  },
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
  margin-left: 30%;
  right: 15%;
  background-color: rgb(97 165 232) !important;
  color: white;
}
.botaoB {
  margin-left: 30%;
  right: 15%;
  background-color:rgb(88, 202, 109) !important;
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


</style>
