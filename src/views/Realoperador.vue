<template>
  <div class="limiter">
    <Navbar />
    <v-data-table
      :headers="headers"
      :items="dados"
      sort-by="calories"
      class="elevation-1"
    >
    
      <template v-slot:top>
        
        <v-toolbar flat>
          <v-toolbar-title>Realtime dos Agentes</v-toolbar-title>

       
          <v-divider class="mx-4" inset vertical></v-divider>
          
          <v-spacer></v-spacer>
           <router-link to="./menurealtime" class="linkp">
          <v-btn dark class="botaoSair">voltar</v-btn>
        </router-link>
          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.extension"
                        label="Editar ramal"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogLogin" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitleLogin }}</span>
              </v-card-title>

              <v-card-text>
                 <v-container>
                  <v-row>
                    
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.extension"
                        label="Editar ramal"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.fila"
                        label="Editar fila"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4"> </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeLogin">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="logar"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogLogout" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitleLogout }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.extension"
                        label="Editar ramal"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.fila"
                        label="Editar fila"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4"> </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeLogout">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="logout"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogPausa" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitlePausa }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.extension"
                        label="Editar ramal"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.fila"
                        label="Editar fila"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4"> </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closePausa">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="pausar()"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogPausaOut" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitlePausaOut }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.extension"
                        label="Editar ramal"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.fila"
                        label="Editar fila"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4"> </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closePausaOut">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="pausaout()"> Save </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"
                >Tem certeza que deseja excluir?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Cancel</v-btn
                >
                <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItemLogin(item)">
          mdi-login
        </v-icon>
        <v-icon small class="mr-2" @click="editItemLogout(item)">
          mdi-logout
        </v-icon>
        <v-icon small class="mr-2" @click="editItemPausa(item)">
          mdi-pause
        </v-icon>
        <v-icon small class="mr-2" @click="editItemPausaOut(item)">
          mdi-play
        </v-icon>
      </template>

      
      <template v-slot:[`item.estado`]="{ item }">
        <v-chip :color="getColor(item.estado)" dark>
          {{ item.estado }}
        </v-chip>
      </template>
    </v-data-table>

    <Footer />
  </div>
</template>

<script>
import { api } from "@/conf/api";
import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";
export default {
  async beforeMount() {
    //const { setIntervalAsync } = require("set-interval-async/legacy");
    this.exibir();
        console.log('eu sou idsetinterval Before mount',this.idsetinterval)

    this.idsetinterval = setInterval(() => this.exibir(), 5000);
    
  },

  async beforeDestroy(){
    console.log('eu sou idsetinterval',this.idsetinterval)
    clearInterval(this.idsetinterval)
    this.idsetinterval = 0
    
  },
  async mounted() {
    ////console.log(this.$store.state.token)
    setTimeout(()=>{location.reload()}, 60000)
  },
  name: "HelloWord",
  data: () => ({
    idsetinterval: null,
    dialog: false,
    dialogLogin: false,
    dialogLogout: false,
    dialogPausa: false,
    dialogPausaOut: false,

    dialogDelete: false,
    
    headers: [
{
text: "Fila",
align: "start",
sortable: false,
value: "fila",
},
{ text: "Ramal", value: "extension" },
{ text: "Agente", value: "name" },
{ text: "Status", value: "estado" },
{ text: "Total de Chamadas da Ultima Sessão", value: "totaliga" },
{ text: "Total de Chamadas Sainte da Ultima Sessão", value: "totaligasainte" },
{ text: "Total de Login", value: "totalloga" },
{
text: "Logar | Deslogar | Pausar | Remover pausa",
value: "actions",
sortable: false,
},
],

    desserts: [],
    dados: [],
    pin: '',
    editedIndex: -1,
   editedItem: {
      id: "",
      pin: "",
      extension: "",
      fila: "",
    },
    defaultItem: {
      id: "",
      pin: "",
      extension: "",
      fila: "",
    },
  }),
  components: {
    Navbar,
    Footer,
  },
  computed: {
     formTitle() {
      return this.editedIndex === -1 ? "Novo Script" : "Editar Script";
    },
    formTitleLogin() {
      return this.editedIndex === -1 ? "Login" : "Editar Script";
    },
    formTitleLogout() {
      return this.editedIndex === -1 ? "LogOut" : "Editar Script";
    },
    formTitlePausa() {
      return this.editedIndex === -1 ? "Pausar" : "Editar Script";
    },
    formTitlePausaOut() {
      return this.editedIndex === -1 ? "PausarOut" : "Editar Script";
    },
  },

  watch: {
       dialog(val) {
      val || this.close();
    },

    dialogLogin(val) {
      val || this.closeLogin();
    },
    dialogLogout(val) {
      val || this.closeLogout();
    },
    dialogPausa(val) {
      val || this.closePausa();
    },
    dialogPausaOut(val) {
      val || this.closePausaOut();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    },
  created() {
  },

  methods: {

    exibir: async function () {
      let a = await api.get(`/realoperadorrt`);
      let b = await api.get('/ajustaestado');
      //console.log(`/realoperadorrt`);
      //console.log(a.data.dados);
      console.log(b)
      this.dados = a.data.dados;
      console.log(this.dados)
    },
        verificachamada: async function () {
      let ramal = this.$store.state.usuario.ramal;
      //console.log(ramal);

      let a = await api.get(`/verificachamada/${ramal}`);
      //console.log(a);

      let dadosligacao = a.data.dados;
      console.log(dadosligacao);
      this.ligacao = a.data.dados.length;

      //console.log(this.ligacao);

      if (this.ligacao === 0 && this.verificapausa === 0) {
        this.chamadaestado = "sem chamada ativa";
        this.sepausado();
      }
      if (this.ligacao === 1 && this.verificapausa === 0) {
        //console.log("está em ligacão");
        this.chamadaestado = "Em ligação";
        this.sepausado();


        //console.log("Dados formulario ligacao: ", this.formulario);

        let res2 = await api.post("/insereformauto", this.formulario);
        console.log(res2);
      }
      if (this.ligacao === 0 && this.verificapausa === 1) {
        //console.log("estado pausa: ", this.verificapausa);
        this.sepausado();
      }

      if (this.ligacao == 3) {
        //console.log("em pausa");
      }
    },
     getColor (estado) {
        if (estado == 'deslogado') return 'red'
        else if (estado == 'pausado') return 'orange'
        else if (estado == 'em ligacao') return 'blue'
        else if (estado == 'em ligacao sainte') return 'blue'
        else return 'green'
      },
    editItem (item) {
        this.editedIndex = this.desserts.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
 editItemLogin(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogLogin = true;
    },

    editItemLogout(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogLogout = true;
    },
    editItemPausa(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogPausa = true;
    },
    editItemPausaOut(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogPausaOut = true;
    },
    deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    testeConsole(item) {
      this.editedIndex = this.desserts.indexOf(item);
      //console.log("OOOOOI", item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.desserts.splice(this.editedIndex, 1);
      this.closeDelete();
    },

     

      close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeLogin() {
      this.dialogLogin = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeLogout() {
      this.dialogLogout = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closePausa() {
      this.dialogPausa = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closePausaOut() {
      this.dialogPausaOut = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

       logar: async function () {
      let res;

      let res2;
      
      let res3;

      let res4;

      //edita
      //console.log("Item editado", this.editedItem);
      res = await api.post("/logarpainel", this.editedItem);

      res2 = await api.post("/estadoperador", this.editedItem);

      res3 = await api.post("/estadoperadorfila", this.editedItem);


      res4 = await api.post("/logslogin", this.editedItem);
      this.closeLogin();

      if (
        res.data.msg == "erro" ||
        res2.data.msg == "erro" ||
        res3.data.msg == "erro" ||

        res4.data.msg == "erro"
      ) {
        window.alert("Ocorreu um erro code 1!");
      } else {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      }
    },
    logout: async function () {
      let res;
      let res2;
      let res3;
        //edita
        //console.log('Item editado',this.editedItem)
        res = await api.post("/deslogarpainel", this.editedItem);
              
        res2 = await api.post("/estadoperadordesloga", this.editedItem);


         res2 = await api.post("/deslogaestadorfila", this.editedItem);
              

        res3 = await api.post("/logsdeslogar", this.editedItem);
              this.closeLogout();

        if (res.data.msg == "erro" || res2.data.msg == "erro" || res3.data.msg == "erro") {
          window.alert("Ocorreu um erro code 1!");
        } else {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
        }},

        pausar: async function () {
      let res;
      let res2;
      let res3;
      let res4;
      //edita
      //console.log("Item editado", this.editedItem);
      res = await api.post("/pausarpainelrt", this.editedItem);


       res2 = await api.post("/pausarestado", this.editedItem);



      res3 = await api.post("/logspausarrt", this.editedItem);


      this.closePausa();

      if (
        res.data.msg == "erro" ||
        res2.data.msg == "erro" ||
        res3.data.msg == "erro" ||
        res4.data.msg == "erro" 

      ) {
        window.alert("Ocorreu um erro code 1!");
      } else {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      }
    },

    pausaout: async function () {
      let res;
      let res2;
      let res3;
      //edita
      //console.log("Item editado", this.editedItem);
      res = await api.post("/despausarpainelrt", this.editedItem);


       res2 = await api.post("/estadoperador", this.editedItem);


      res3 = await api.post("/logsdespausarrt", this.editedItem);


      this.closePausaOut();

      if (
        res.data.msg == "erro" ||
        res2.data.msg == "erro" ||
        res3.data.msg == "erro" 
      ) {
        window.alert("Ocorreu um erro code 1!");
      } else {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      }
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        this.desserts.push(this.editedItem);
      }
      this.closePausaOut();
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
.linkp {
  margin-left: 2%;
  text-decoration: none;
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
}
.datest {
  border-style: solid !important;
  display: inline;
  border-radius: 0% !important;
  margin-top: 1%;
  width: 12%;
  margin-left: 0.2%;
  margin-bottom: 1%;
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

textarea:focus,
input:focus {
}

/* ------------------------------------ */
button {
  outline: none !important;
  border: none;
  background: transparent;
}

button:hover {
  cursor: pointer;
}

iframe {
  border: none !important;
}

/*//////////////////////////////////////////////////////////////////
[ Table ]*/

.limiter {
  width: 100%;
  margin: 0 auto;
}

.container-table100 {
  width: 100%;
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: 100%;

  /*box-shadow: inset 0 0 0 1000px rgba(4, 81, 132, 0.85);*/
  padding: 15px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  display: -webkit-box;
  display: -webkit-flex;
  display: -moz-box;
  display: -ms-flexbox;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 33px 30px;
}

.wrap-table100 {
  width: 1700px;
  border-radius: 10px;
  overflow: hidden;
}

.table {
  width: 100%;
  display: table;
  margin: 0;
}

@media screen and (max-width: 768px) {
  .table {
    display: block;
  }
}

.row {
  display: table-row;
  background: #fff;
}

.logo {
  background: transparent;
  text-align: center;
}

.tel1 {
  margin-left: 550px;
}

.myButton {
  height: 85px;
  margin: 5px;
}

.datas {
  text-align: left;
}

#campaignMonitoringApplication {
  font-size: 10pt;
}

#campaignMonitoringApplication table {
  font-size: 10pt;
}
div.neo-module-content {
  background-size: 100%;
  background-repeat: no-repeat;
  background-color: #000d0d;
  color: white;
}

div.registro {
  overflow-y: auto;
  /* width: 100%; */
  height: 200px;
  background-color: #ffffff;
  border: 1px solid #999999;
}
div.registro table {
  width: 100%;
}
.testeB {
  box-shadow: 0px 0px 19px -7px #060607;
  background: linear-gradient(to bottom, #243e57 5%, #4779ac 100%);
}

table.titulo {
  width: 100%;
  color: #eeeeee;
  border-color: black;
  border-left: 1px solid #999999;
  border-top: 1px solid #999999;
  border-right: 1px solid #999999;
  border-bottom: 0px;
  background-color: #61a5e8;
  height: 32px;
}
table.titulo > tbody > tr > td {
  padding: 6px;
}
div.llamadas {
  overflow-y: auto;
  /*width: 100%;*/
  background-color: #243e57;
  border: 1px solid #999999;
}
div.llamadas table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
}
div.llamadas table > tbody > tr:hover {
  background-color: #61caef;
  color: black;
}
div.llamadas table > tbody > tr > td {
  padding: 6px;
  color: #ffffff;
  border-bottom: 1px #b6b6b6 solid;
}
.reciente {
  font-weight: bold;
}

.myButton {
  box-shadow: 0px 0px 0px 0px #f0f7fa;
  background: linear-gradient(to bottom, #243e57 5%, #243e57 100%);
  background-color: #243e57;
  border-radius: 14px;
  border: 1px solid #243e57;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  font-family: Arial;
  font-size: 15px;
  font-weight: bold;
  padding: 32px 12px;
  text-decoration: none;
  text-shadow: 0px 0px 0px #5b6178;
}

.row.header {
  color: #ffffff;
  background: #243e57;
}

@media screen and (max-width: 768px) {
  .row {
    display: block;
  }

  .row.header {
    padding: 0;
    height: 0px;
  }

  .row.header .cell {
    display: none;
  }

  .row .cell:before {
    font-family: Poppins-Bold;
    font-size: 12px;
    color: #808080;
    line-height: 1.2;
    text-transform: uppercase;
    font-weight: unset !important;

    margin-bottom: 13px;
    content: attr(data-title);
    min-width: 98px;
    display: block;
  }
}

.cell {
  display: table-cell;
}

@media screen and (max-width: 768px) {
  .cell {
    display: block;
  }
}

.row .cell {
  font-family: Poppins-Regular;
  font-size: 15px;
  color: #666666;
  line-height: 1.2;
  font-weight: unset !important;

  padding-top: 20px;
  padding-left: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f2f2f2;
}

.row.header .cell {
  font-family: Poppins-Regular;
  font-size: 18px;
  color: #fff;
  line-height: 1.2;
  font-weight: unset !important;

  padding-top: 19px;
  padding-bottom: 19px;
}

.row .cell:nth-child(1) {
  width: 360px;
  padding-left: 40px;
}

.row .cell:nth-child(2) {
  width: 360px;
  padding-left: 40px;
}

.row .cell:nth-child(3) {
  width: 360px;
  padding-left: 40px;
}

.row .cell:nth-child(4) {
  width: 360px;
  padding-left: 40px;
}

.table,
.row {
  width: 100% !important;
}

@media (max-width: 768px) {
  .row {
    border-bottom: 1px solid #f2f2f2;
    padding-bottom: 18px;
    padding-top: 30px;
    padding-right: 15px;
    margin: 0;
  }

  .row .cell {
    border: none;
    padding-left: 30px;
    padding-top: 16px;
    padding-bottom: 16px;
  }
  .row .cell:nth-child(1) {
    padding-left: 30px;
  }

  .row .cell {
    font-family: Poppins-Regular;
    font-size: 18px;
    color: #555555;
    line-height: 1.2;
    font-weight: unset !important;
  }

  .table,
  .row,
  .cell {
    width: 100% !important;
  }
}
#campaignMonitoringApplication {
  font-size: 10pt;
}

#campaignMonitoringApplication table {
  font-size: 10pt;
}
div.neo-module-content {
  background-size: 100%;
  background-repeat: no-repeat;
  background-color: #000d0d;
  color: white;
}

div.registro {
  overflow-y: auto;
  /* width: 100%; */
  height: 200px;
  background-color: #ffffff;
  border: 1px solid #999999;
}
div.registro table {
  width: 100%;
}
.testeB {
  box-shadow: 0px 0px 19px -7px #060607;
  background: linear-gradient(to bottom, #243e57 5%, #4779ac 100%);
}

table.titulo {
  width: 100%;
  color: #eeeeee;
  border-color: black;
  border-left: 1px solid #999999;
  border-top: 1px solid #999999;
  border-right: 1px solid #999999;
  border-bottom: 0px;
  background-color: #61a5e8;
  height: 32px;
}
table.titulo > tbody > tr > td {
  padding: 6px;
}
div.llamadas {
  overflow-y: auto;
  /*width: 100%;*/
  background-color: #243e57;
  border: 1px solid #999999;
}
div.llamadas table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
}
div.llamadas table > tbody > tr:hover {
  background-color: #61caef;
  color: black;
}
div.llamadas table > tbody > tr > td {
  padding: 6px;
  color: #ffffff;
  border-bottom: 1px #b6b6b6 solid;
}
.reciente {
  font-weight: bold;
}

.myButton {
  box-shadow: 0px 0px 19px -7px #060607;
  background: linear-gradient(to bottom, #243e57 5%, #4779ac 100%);
  background-color: #599bb3;
  border-radius: 1px;
  display: inline-block;
  cursor: pointer;
  border: solid;
  color: #ffffff;
  font-family: Montserrat;
  font-size: small;
  font-weight: bold;
  padding: 32px 76px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #3d768a;
}

.myButton:active {
  position: relative;
  top: 1px;
}
</style>