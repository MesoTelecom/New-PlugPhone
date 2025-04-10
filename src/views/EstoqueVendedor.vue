<template>
    <div class="limiter">
  <v-card class="overflow-hidden" style="margin-left: -250px; max-width: 1000% !important;margin-top: -72px;">
    <v-app-bar
      absolute
      color="rgb(40 85 111)"
      dark
      hide-on-scroll
      prominent
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-img src="../assets/plugbranco3.png" style="width: 20%;"></v-img>
      <v-toolbar-title>PlugPhone Cloud Estoque Accioly</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>
   
      <v-container style="height: 130px; margin-left: -16%;"></v-container>
    
  </v-card>			
		<v-data-table
    :headers="headers"
    :items="desserts"
    sort-by="calories"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
		<v-toolbar-title>Solicitações de consulta de estoque</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
          max-width="500px"
        >
    
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
				<v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.pedido"
                      label="Edita Pedido"
                    ></v-text-field>
                  </v-col>
				<v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.situacao"
                      label="Editar Situação"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="close"
              >
                Cancel
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="save"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">

      <v-icon
        small
        class="mr-2"
        @click="editItem(item)"
      >
        mdi-pencil
      </v-icon>

	<v-icon
        small
        class="mr-2"
	@click="liga"
      >
        mdi-phone
      </v-icon>
    
    </template>
    <template v-slot:no-data>
      <v-btn
        color="primary"
        @click="initialize"
      >
        Reset
      </v-btn>
    </template>
  </v-data-table>

	</div>
 
</template>

<script>
  export default {
	name: 'HelloWord',
    data: () => ({
      dialog: false,
     
      headers: [
        {
          text: 'Vendedor',
          align: 'start',
          sortable: false,
          value: 'dia',
        },
		{ text: 'Cliente', value: 'telefone' },
		{ text: 'Pedido', value: 'pedido' },
		{ text: 'Situação', value: 'situacao' },
        { text: 'Editar | Ligar para o cliente', value: 'actions', sortable: false },
      ],
      desserts: [],
      editedIndex: -1,
      editedItem: {
		
		id: '',
		pedido: '',
		situacao: '',
		ramal: '',
		telefone: '',
      },
      defaultItem: {
		
		id: '',
		pedido: '',
		situacao: '',
		ramal: '',
		telefone: '',
      },
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Novo' : 'Editar'
      },
    },


    created () {
      this.initialize()
	
    },

    methods: {
      async initialize () {
  //  let res = await api.get("");
      // console.log(res.data.dados);
     // this.desserts = res.data.dados;
	//const originador = [];
	//const recebidor = [];

    },

      editItem (item) {
        this.editedIndex = this.desserts.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

 

	async save() {
      let res;
      if (this.editedIndex > -1) {
        //edita
   //     res = await api.post("", this.editedItem);
        if (res.data.msg=="erro") {
          window.alert("Ocorreu um erro code 1!");
        } else {
          Object.assign(this.desserts[this.editedIndex], this.editedItem);
        }
        // console.log(this.editedItem);
      }
      this.close();
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

body, html {
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

.cardform{

	background-color: #61a5e8;
}

a:focus {
	outline: none !important;
}

a:hover {
	text-decoration: none;
}

/* ------------------------------------ */
h1,h2,h3,h4,h5,h6 {margin: 0px;}

p {
  margin: 0px;
  font-size: 25px;
  color:#fff;
}

ul, li {
	margin: 0px;
	list-style-type: none;
}


/* ------------------------------------ */
input {
  display: block;
	outline: none;
	border: none !important;
}

textarea {
  display: block;
  outline: none;
}

textarea:focus, input:focus {
  border-color: transparent !important;
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
  background-size:100%;

 box-shadow: inset 0 0 0 1000px rgba(255, 255, 255, 0.787);
background-image: url(../assets/telatabela.jpg);
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

.logo{


  background:transparent;
  text-align: center;

}

.tel1{

margin-left: 550px;

}

.myButton{
	height: 85px; 
	margin: 5px;
}

.datas{
  text-align: left;
  
}

#campaignMonitoringApplication
{
	font-size: 10pt;
}

#campaignMonitoringApplication table
{
    font-size: 10pt;


}
div.neo-module-content{

	
	background-size: 100%;
	background-repeat: no-repeat;
	background-color: #000d0d;
	color: white;
}


div.registro
{
	overflow-y: auto;
	/* width: 100%; */
	height: 200px;
	background-color: #ffffff;
	border: 1px solid #999999;
}
div.registro table 
{
	width: 100%;
}
.testeB{
	box-shadow: 0px 0px 19px -7px #060607;
	background:linear-gradient(to bottom, #243e57 5%, #4779ac 100%);
}

table.titulo
{
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
table.titulo > tbody > tr > td
{
    padding: 6px;
}
div.llamadas
{
    overflow-y: auto;
    /*width: 100%;*/
    background-color: #243e57;
    border: 1px solid #999999;
}
div.llamadas table 
{
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
}
div.llamadas table > tbody > tr:hover 
{
    background-color: #61caef;
	color: black;
}
div.llamadas table > tbody > tr > td
{
	padding: 6px;
	color: #ffffff;
	border-bottom: 1px #b6b6b6 solid;
}
.reciente
{
	font-weight: bold;
}



.myButton {
	box-shadow: 0px 0px 0px 0px #f0f7fa;
	background:linear-gradient(to bottom, #243e57 5%, #243e57 100%);
	background-color:#243e57;
	border-radius:14px;
	border:1px solid #243e57;
	display:inline-block;
	cursor:pointer;
	color:#ffffff;
	font-family:Arial;
	font-size:15px;
	font-weight:bold;
	padding:32px 12px;
	text-decoration:none;
	text-shadow:0px 0px 0px #5b6178;
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


.table, .row {
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

  .table, .row, .cell {
    width: 100% !important;
  }
}
#campaignMonitoringApplication
{
	font-size: 10pt;
}

#campaignMonitoringApplication table
{
    font-size: 10pt;


}
div.neo-module-content{


	background-size: 100%;
	background-repeat: no-repeat;
	background-color: #000d0d;
	color: white;
}


div.registro
{
	overflow-y: auto;
	/* width: 100%; */
	height: 200px;
	background-color: #ffffff;
	border: 1px solid #999999;
}
div.registro table 
{
	width: 100%;
}
.testeB{
	box-shadow: 0px 0px 19px -7px #060607;
	background:linear-gradient(to bottom, #243e57 5%, #4779ac 100%);
}

table.titulo
{
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
table.titulo > tbody > tr > td
{
    padding: 6px;
}
div.llamadas
{
    overflow-y: auto;
    /*width: 100%;*/
    background-color: #243e57;
    border: 1px solid #999999;
}
div.llamadas table 
{
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
}
div.llamadas table > tbody > tr:hover 
{
    background-color: #61caef;
	color: black;
}
div.llamadas table > tbody > tr > td
{
	padding: 6px;
	color: #ffffff;
	border-bottom: 1px #b6b6b6 solid;
}
.reciente
{
	font-weight: bold;
}

.myButton {
	box-shadow: 0px 0px 19px -7px #060607;
	background:linear-gradient(to bottom, #243e57 5%, #4779ac 100%);
	background-color:#599bb3;
	border-radius:1px;
	display:inline-block;
	cursor:pointer;
	border: solid;
	color:#ffffff;
	font-family:Montserrat;
	font-size:small;
	font-weight:bold;
	padding:32px 76px;
	text-decoration:none;
	text-shadow:0px 1px 0px #3d768a;
}

.myButton:active {
	position:relative;
	top:1px;
}

.ab-t-r {
	position: absolute;
	right: 0px;
	top: 0px;
}

.ab-b-l {
	position: absolute;
	left: 0px;
	bottom: 0px;
}

.ab-b-r {
	position: absolute;
	right: 0px;
	bottom: 0px;
}


</style>





