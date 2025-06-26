<template>
  <div id="app" style="">
    <v-app style="">

      <v-navigation-drawer app color="rgb(221 221 221)" class="sidebar">
        <v-img src="../assets/PlugPhoneCentro.png" class="avatar"></v-img>
        <br>
        <v-row>
          <router-link to="/dashboard">
            <v-icon @click="a = true" id="seta" class="imageIcon" style="margin-bottom: -25%;left: 100%;">
              mdi-arrow-left
            </v-icon>
          </router-link>
          <v-icon @click="b = true" class="imageIcon" style="left: 65%;font-size: 169%; margin-bottom: -1%;">
            mdi-filter-variant
          </v-icon>


          <v-icon @click="a = true" class="imageIcon" style="left: 70%; margin-bottom: -1%;">
            mdi-help-circle</v-icon>
        </v-row>
        <v-list dense>
          <br>
          <v-list-item-group v-model="selectedContact">
            <v-list-item v-for="(contact, index) in contacts" :key="index">
              <v-list-item-content>
                <v-list-item-title class="sidebar" @click="selectContact(contact.telefone)">
                  <v-icon style="color: black; font-size: 50px; margin-bottom: -9%;">mdi-account-circle</v-icon>
                  <b style="font-size: 14px;"> {{ contact.nome }}</b>
                  <br>

                  <texto style="    margin-left: 21%;
    font-size: 12px;
    color: #494949;">{{ contact.ultimamsg }}</texto>
                  <v-icon v-if="contact.estadomsg === 'novamsg'" color="#25D366"
                    style="font-size: 15px; left: 3%;">mdi-checkbox-blank-circle
                  </v-icon>

                  <v-icon v-if="contact.estado && contact.estado.startsWith('mdi-')" :style="{
                    color: contact.estado === 'mdi-checkbox-marked-circle-outline'
                      ? '#8bff9a'
                      : contact.estado === 'mdi-cancel'
                        ? 'red'
                        : 'black'
                  }">
                    {{ contact.estado }}
                  </v-icon>
                  <br>
                  <datahora style="margin-left: 21%; color: #8f8f8f !important;">{{ contact.datahora }}</datahora>
                  <hr>

                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <!--<img src="../assets/Logo_Meso_vetorizada.png" class="logo" />-->


      </v-navigation-drawer>

      <img src="../assets/PlugPhoneCentro.png" class="plugPhone" />

      <v-main style="padding: 0px; height: 100vh; display: flex; flex-direction: column;">
        <v-container fluid>
          <v-row class="cabecalho">
            <v-btn @click="buscarContato(estadoContatoFiltro = 'Todos')" class="botaoEstado">Todos</v-btn>
            <v-btn @click="buscarContato(estadoContatoFiltro = 'Novo')" class="botaoEstado">Novo</v-btn>
            <v-btn @click="buscarContato(estadoContatoFiltro = 'Aguardando Cliente')" class="botaoEstado">Aguard...
              Cliente</v-btn>
            <v-btn @click="buscarContato(estadoContatoFiltro = 'Aguardando Atendimento')" class="botaoEstado">Aguard...
              Atendimento</v-btn>
            <v-btn @click="buscarContato(estadoContatoFiltro = 'Concluido')" class="botaoEstado">Concluido</v-btn>
          </v-row>

          <v-row style="margin-right: 25%;">
            <v-col cols="12" md="12" style="padding: 0%;">
              <div class="messages" ref="messages" style="margin-left: 3%; max-height: 80vh; overflow-y: auto;">
                <div v-for="(message, index) in messages" :key="'server-' + index" :class="{
                  'message-requester': !message.sender.includes('-PlugPhone'),
                  'message-agent': message.sender.includes('-PlugPhone'),
                }">
                  <div :class="{
                    buttonSender: !message.sender.includes('-PlugPhone'),
                    button: message.sender.includes('-PlugPhone'),
                  }" :style="{ 'text-align': message.sender.includes('-PlugPhone') ? 'end' : 'start' }">
                    <span :class="{
                      tituloSender: !message.sender.includes('-PlugPhone'),
                      titulo: message.sender.includes('-PlugPhone'),
                    }">
                      <b>{{ message.sender }}:</b><br />
                    </span>
                    <span class="message-text">
                      <span v-if="message.isImage">
                        <img :src="message.text" alt="Imagem" style="max-width: 100%; height: auto;" />
                        <br />
                        <data style="font-size: 12px; color: #ffffff">{{ message.datetime }}</data>
                      </span>
                      <span v-else-if="message.isAudio">
                        <audio controls>
                          <source :src="message.text" type="audio/mpeg" />
                          Seu navegador não suporta o elemento de áudio.
                        </audio>
                      </span>
                      <span v-else>
                        {{ message.text }} <br />
                        <data style="font-size: 12px; color: #ffffff">{{ message.datetime }}</data>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Botão de seta para descer -->
          <div style="    position: absolute;
    left: 4%;
    bottom: 16%;">
            <v-btn icon color="#6d6d6d;" @click="scrollToBottom" style="z-index: 999;">
              <v-icon style="font-size: 35px;">mdi-arrow-down-circle</v-icon>
            </v-btn>
          </div>
        </v-container>
      </v-main>


      <div class="info" style="background-color: #ffffff !important;
  border-color: #ffffff !important;">
        <br>
        <v-btn class="infoBtn">Informações <v-icon @click="openDialogForm = true" style="left: 3%;">
            mdi-information
          </v-icon></v-btn>
        <v-data-table :items="dados" :items-per-page="1" style="        background: rgb(221, 221, 221);
    border-radius: 3%;
    position: fixed;
    bottom: 1%;
    width: 21%;
    right: 1%;
    border-style: inset;
    border-width: thin;
    height: 90%;" hide-default-footer class="responsive-table" item-class="custom-row">
          <template v-slot:item="{ item }">
            <div class="table-row">
              <div v-for="(header, index) in informacao" :key="index">
                <br> <strong>{{ header.text }}:<br></strong> {{ item[header.value] }}
              </div>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-app>






    <div class="bottom-bar" style="width: 73%;padding-top: 5%;position: absolute;bottom: 0%;">
      <img src="../assets/plugcinza.png" @click="openDialog2 = true" class="imageIcon" style="
    margin-left: 5%;
    width: 4%;
    margin-bottom: -2%;" />

      <v-icon @click="openDialogAnexo = true" class="imageIcon" style="left: 0%;font-size: 169%;">
        mdi-paperclip
      </v-icon>
      <v-icon @click="openDialog1 = true" class="imageIcon" style="left: 0%;font-size: 169%;">
        mdi-microphone
      </v-icon>
      <v-icon @click="openDialog = true" class="imageIcon" style="left: 0%;font-size: 169%;">
        mdi-image
      </v-icon>

      <v-icon @click="toggleEmojiPicker" class="imageIcon" style="left: 0%; font-size: 169%;">
        mdi-emoticon
      </v-icon>
      <v-icon @click="openDialogConcluir = true" class="imageIcon" style="left: 0%; font-size: 169%"
        :disabled="tipo === 'Analista'">
        mdi-checkbox-marked-circle</v-icon>

      <input type="text" v-model="newMessage" @keyup.enter="sendMessage" placeholder="Digite sua mensagem aqui..."
        class="input-message"
        style="left: 53px;bottom: 50%;width: 91%;border-radius: 1px;border-style: unset;border-bottom-style: solid;" />
      <v-icon @click="openDialogForm = true" class="imageIcon" style="left: 79%;font-size: 169%;">
        mdi-transfer
      </v-icon>

      <!-- Ícone que abre o emoji picker -->


      <!-- Picker de Emojis -->
      <div v-if="showEmojiPicker"
        style="position: fixed;bottom: 5%;left: 25%;z-index: 9999;background: white;border-radius: 10px;box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 8px;">
        <emoji-picker @emoji-click="onEmojiClick"></emoji-picker>
      </div>

      <!-- <v-icon @click="openDialog = true" class="imageIcon" style="left: 94%">mdi-image</v-icon>-->

      <v-dialog v-model="openDialog" max-width="500px" persistent>
        <v-card class="dialogo">
          <v-card-title>Seu Diálogo</v-card-title>
          <v-card-text>
            <v-file-input v-model="selectedFile" label="Escolha uma imagem"></v-file-input>
          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="uploadImage">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialog = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>


      <!--<v-icon @click="openDialog = true" class="imageIcon" style="left: 95%">mdi-image</v-icon>  -->


      <v-dialog v-model="openDialog1" max-width="500px" persistent>
        <v-card class="dialogo1">
          <v-card-title>Grave seu áudio</v-card-title>
          <v-card-text>
            <v-btn @click="startRecording" :disabled="isRecording" class="btnAudio">
              Iniciar Gravação <v-icon>mdi-play</v-icon>
            </v-btn>
            <v-btn @click="stopRecording" :disabled="!isRecording" class="btnAudioStop">
              Parar Gravação <v-icon>mdi-stop</v-icon>
            </v-btn>
            <audio v-if="audioUrl" :src="audioUrl" controls></audio>
          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="uploadAudio">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialog1 = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openDialogAnexo" max-width="500px" persistent>
        <v-card class="dialogo">
          <v-card-title>Seu Diálogo</v-card-title>
          <v-card-text>
            <v-file-input v-model="selectedFile" label="Escolha uma imagem"></v-file-input>
          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="uploadDocumento">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialogAnexo = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>


      <v-dialog v-model="openDialog2" max-width="700px">
        <v-card class="dialogoZap">
          <v-card-title>Qual a forma que deseja entrar em contato</v-card-title>
          <br>
          <v-data-table :headers="headers" :items="dados" :items-per-page="1" class="elevation-1"
            hide-default-footer></v-data-table>


          <v-card-text>
            <v-row class="linhaContato">

              <v-btn @click="populaOportunidade(whatsapp), sendTemplate(), openDialog2 = false" class="btnAudio">
                Whatsapp <v-icon>mdi-whatsapp</v-icon>
              </v-btn>
              <v-btn @click="openDialogLigacao = true, openDialog2 = false" class="btnCall">
                Ligação <v-icon>mdi-phone</v-icon>
              </v-btn>
              <audio v-if="audioUrl" :src="audioUrl" controls></audio>
            </v-row>
          </v-card-text>

        </v-card>
      </v-dialog>


      <!------------------------------------------------------------------------->

      <v-dialog v-model="openDialogLigacao" max-width="500px" persistent>
        <v-card class="dialogo1">
          <v-card-title>Por favor digite seu Ramal</v-card-title>

          <v-row class="linhaBtnCall">
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <v-card-actions style="padding-left: 1%;">
              <v-btn @click="ligar()" class="btnCall">
                Ligar <v-icon>mdi-phone</v-icon>
              </v-btn>
            </v-card-actions>
            <v-card-actions style="padding-left: 10%; ">
              <v-btn color="primary" @click="openDialogLigacao = false"
                style="background-color: #e74343 !important;">Cancelar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <!------------------------------------------------------------------------->

      <v-dialog v-model="openDialogRamal" max-width="500px" persistent>
        <v-card>
          <v-card-title class="text-h6">
            Para tornar-se disponível, digite seu ramal
          </v-card-title>

          <v-card-text>
            <!-- Aqui vai seu campo de ramal -->
            <v-text-field label="Ramal" v-model="ramal" />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="ramalDigitado()">Confirmar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-------------------------------------------------------------------------->

      <v-dialog v-model="openDialogConcluir" max-width="500px" persistent>
        <v-card class="dialogoZap">
          <v-card-title>Deseja Concluir o atendimento?</v-card-title>
          <br>



          <v-card-text>
            <v-row class="linhaContatoConcluir">

              <v-btn @click="finalizar(finaliza = true), openDialogConcluir = false" class="btnAudio"
                v-model="finaliza">
                Concluir! <v-icon> mdi-checkbox-marked-circle-outline</v-icon>

              </v-btn>
              <v-btn @click="finalizar(finaliza = false), openDialogConcluir = false" class="btnAudioStop">
                Cancelar <v-icon> mdi-cancel</v-icon>
              </v-btn>


            </v-row>


            <br>

          </v-card-text>

        </v-card>

      </v-dialog>



      <v-dialog v-model="openDialogForm" max-width="500px" persistent>
        <v-card>
          <v-card-title>Transferir Contato</v-card-title>
          <v-row class="linhaContatoConcluir">
            <v-select :items="setor" label="Setor" v-model="setorSelect" @update:modelValue="listar(setorSelect)"
              class="filtro">
              class="filtro"></v-select>
            <v-select :items="items" label="Operadores" v-model="usuarioSelect" class="filtro"></v-select>
          </v-row>
          <v-card-actions>
            <v-btn @click="transferir()" color="primary">Transferir</v-btn>
            <v-btn @click="openDialogForm = false" color="error">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { api } from "@/conf/api";
import lamejs from 'lamejs';
//import { apiWP } from "@/conf/apiWP";
import RecordRTC from 'recordrtc';
import io from 'socket.io-client';
import Navbar from "../components/Navbar.vue";
//import { Picker } from 'emoji-mart-vue'
import 'emoji-picker-element'
import { apiWP } from "@/conf/apiWP";




// Certifique-se de incluir o script libmp3lame.js no seu projeto e carregá-lo corretamente.

export default {
  mounted() {
    this.verificaEstado();

  },
  async beforeMount() {
    this.buscaCidadao();
    this.funcTokenFirebase();
    let usuario = JSON.parse(localStorage.getItem('usu'));
    this.tipo = usuario.tipo;
    this.usuario = usuario.usuario + "-PlugPhone"
    //this.idsetinterval = setInterval(() => this.buscarContato(), 5000);
    this.buscarContato("Todos");


  },

  async beforeDestroy() {

    console.log('sol apareça')

    console.log("eu sou idsetinterval", this.idsetinterval);
    clearInterval(this.idsetinterval);
    this.idsetinterval = 0;

    console.log("Desconectando socket...");
    this.socket.disconnect();
  },

  data() {
    return {
      headers: [
        {
          text: 'ano',
          align: 'start',
          sortable: false,
          value: 'ano',
        },
        { text: 'orgao', value: 'orgao' },
        { text: 'processo', value: 'processo' },
        { text: 'liquidação', value: 'liguidacao' },
        { text: 'valor da face', value: 'valor_da_face' },
        { text: 'credor', value: 'credor' },
        { text: 'documento', value: 'documento' },
        { text: 'idade', value: 'idade' },
        { text: 'renda', value: 'renda' },
        { text: 'tipo', value: 'tipo' },
        { text: 'telefone', value: 'telefone' },
      ],
      informacao: [
        {
          text: 'Nome',
          align: 'start',
          sortable: false,
          value: 'nome',
        },
        { text: 'Telefone', value: 'telefone' },
        { text: 'Agente associado', value: 'usuario' },

      ],
      messages: [],
      setor: ['Técnico', 'Comercial', 'Financeiro', 'Admin'],
      setorSelect: "",
      agents: [],
      showEmojiPicker: false,
      observacao: "",
      openDialogLigacao: false,
      openDialogConcluir: false,
      idsetinterval: null,
      apiWPurl: apiWP.defaults.baseURL,
      name: "template_plugphone2",
      wppnum: "",
      ramal: "",
      items: [],
      openDialogRamal: false,
      plataforma: "",
      openDialog: false,
      openDialogAnexo: false,
      openDialog1: false,
      openDialog2: false,
      openDialogForm: false,
      tipo: null,
      selectedFile: null,
      whatsapp: "whatsapp",
      usuarioSelect: "",
      telefone: "telefone",
      processo: [],
      socket: "",
      usuario: "",
      finaliza: "",
      estadoContatoFiltro: "Todos",

      estadoContatoAtual: "Todos",
      newMessage: "",
      audioBlob: "",
      contacts: [],
      dados: [],
      dados2: [],
      selectedContact: null,
      link: " ",
      id: " ",
      isRecording: false,
      audioUrl: null,
      recorder: null,
      atendeu: false,
      reagendar: false,
      interesse: false,
      negociar: false
    };
  },
  created() {
    this.socket = io('https://meso.plugphone.cloud:3333');

    // Evento para mensagens de texto
    /* this.socket.on('chat message', (nome, msg) => {
       this.messages.push({ text: msg, sender: nome });
     });*/

    // Evento para imagens



    this.socket.on('chat message', async (nome, msg, telefone) => {
      this.verificaMensagem(telefone, this.tipo, this.usuario)
      this.buscarContato(this.estadoContatoAtual)
      if (telefone == this.wppnum) {

        this.messages.push({ text: msg, sender: nome });
        console.log('recebi!', telefone, this.wppnum);
        // this.playSound();
        this.lido(telefone);
        let a = await api.get(`/lidamsg/${this.wppnum}`);
        console.log(a);
        this.scrollToBottom(); // 🔥 Rola para baixo ao receber mensagem
      } else {
        // this.playSound();
        console.log('foi aqui não my badkkkkkkkkk');
        this.mudaEstado(telefone);
      }
    });


    this.socket.on('chat image', async (nome, base64Image, telefone) => {
      this.buscarContato(this.estadoContatoAtual)
      console.log('eu sou o telefone', telefone)

      console.log("Imagem recebida em Base64:", base64Image);
      if (telefone == this.wppnum) {

        console.log('EU TO AQUIIIIIIIIIIIIIIIIIIIIIIIIII')
        // Verifique se base64Image está no formato correto
        if (base64Image.startsWith('data:image')) {
          const imageUrl = base64Image; // Usa a imagem diretamente como URL

          console.log("URL da imagem gerada:", imageUrl);

          // Teste abrindo em uma nova aba
          //window.open(imageUrl, '_blank');
          //this.playSound()
          this.lido(telefone)
          let a = await api.get(`/lidamsg/${this.wppnum}`,);
          console.log(a)

          this.messages.push({
            text: imageUrl,
            isImage: true,
            sender: nome,
            datetime: new Date().toLocaleString()
          });
        } else {
          console.error("Formato de imagem inválido ou Base64 ausente.");
        }


      } else {
        //this.playSound()
        console.log('foi aqui não my badkkkkkkkkk')
        this.mudaEstado(telefone)
      }
    }
    );



    this.socket.on('chat audio', async (nome, base64Audio, telefone) => {
      this.buscarContato(this.estadoContatoAtual)
      console.log("audio recebida em Base64:", base64Audio);
      if (telefone == this.wppnum) {
        console.log('EU TO AQUIIIIIIIIIIIIIIIIIIIIIIIIII')
        // Verifique se base64Image está no formato correto
        // Verifique se base64Audio está no formato correto
        if (base64Audio.startsWith('data:audio')) {
          const audioUrl = base64Audio; // Usa a audio diretamente como URL

          console.log("URL da audio gerada:", audioUrl);

          // Teste abrindo em uma nova aba
          //window.open(audioUrl, '_blank');
          // this.playSound()
          this.lido(telefone)
          let a = await api.get(`/lidamsg/${this.wppnum}`,);
          console.log(a)
          this.messages.push({
            text: audioUrl,
            isAudio: true,
            sender: nome,
            datetime: new Date().toLocaleString()
          });
        } else {
          console.error("Formato de imagem inválido ou Base64 ausente.");
        }

      } else {
        //this.playSound()
        console.log('foi aqui não my badkkkkkkkkk')
        this.mudaEstado(telefone)
      }
    }

    )
  },


  comments: {
    Navbar
  },
  watch: {
    setorSelect(novoValor) {
      if (novoValor) {
        this.listar(novoValor);
      }
    }
  },
  methods: {

    listar: async function (tipo) {
      this.items = []
      // console.log(this.fila)
      // console.log(filareal, pinreal);
      //Lista filas
      let listafila = await api.get(`/listausuariotipo/${tipo}`);
      // let entrajoin = join.data.dados;
      console.log(listafila);
      let listatotalfilas = listafila.data.dados;
      console.log('Lista as filas', listatotalfilas);
      let nome = [];
      //let nomefila = [];
      listatotalfilas.forEach((d) => {
        // nomefila = d.descr;
        nome = d.usuario;
        console.log('nome da fila:', nome);
        // this.listafila = [nomefila];
        //this.items = nomefila;
        this.items.push([nome]);
      });

      //Listando os agentes para o filtro


    },

    async ramalDigitado() {
      if (this.ramal == "" || this.ramal == undefined) {
        alert('Seu ramal não pode ser Nulo')
      } else {
        let verRamal = await api.get(`/verificaramal/${this.ramal}`)
        console.log('existe ramal?', verRamal.data.dados[0].ramal)
        console.log('EEEEU SOU SIMPLEEEES :D', this.ramal)
        let pegaRamal = verRamal.data.dados[0].ramal
        console.log('peguei o ramal', pegaRamal)
        if (pegaRamal >= 1) {
          this.openDialogRamal = false
        } else {
          alert('O Ramal não existe')
        }
      }

    },

    verificaEstado() {

      this.openDialogRamal = true
    },

    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker
    },
    onEmojiClick(event) {
      this.newMessage += event.detail.unicode
      this.showEmojiPicker = false
    },

    scrollToBottom() {
      const el = this.$refs.messages;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },


    async transferir() {
      let usuario = this.usuarioSelect[0]
      let area = this.setorSelect
      console.log('teste de select', area, usuario, this.wppnum)

      let a = await api.get(`/transferirchamado/${area}/${this.wppnum}/${usuario}`);
      console.log(a)
      location.reload()

    },
    async finalizar(finaliza) {
      console.log('finaliza', finaliza)

      if (finaliza == true) {
        //   let response = await api.get(`/finaliza/${processo}/aprovado`);
        //  console.log(response)
        let a = await api.get(`/concluido/${this.wppnum}`)
        console.log(a)
        location.reload()

      } else {
        //let response = await api.get(`/finaliza/${processo}/reprovado`);
        //console.log(response)
        //location.reload()

      }
    },

    async mudaEstado(telefone) {
      let a = await api.get(
        `/mudamsg/${telefone}`
      );

      console.log('eu sou o A', a)
    },

    async lido(telefone) {
      let a = await api.get(
        `/lidamsg/${telefone}`
      );

      console.log('eu sou o A', a)
    },

    async populaOportunidade(plataforma) {
      console.log("eu sou", this.usuario)
      console.log('eu sou oportunidade', this.processo[this.selectedContact])
      let processo = this.processo[this.selectedContact].processo
      this.plataforma = plataforma
      console.log('eu sou plataforma', plataforma, processo)

      if (this.tipo == 'Analista') {
        console.log('OLA O PROCESSO AQUIIIII', processo)
        var response = await api.get(`/oportunidade/${processo}/${this.plataforma}`);


        let msg = {
          to: this.wppnum,
          name: this.name,
          usuario: this.usuario
        };
        let template = await api.post("/sendtemplate", msg);

        console.log(template)

      } else {
        response = await api.get(`/oportunidadeespecialista/${processo}/${this.plataforma}/${this.usuario}`);
        let msg = {
          name: this.name,
          to: this.wppnum,
          usuario: this.usuario

        };
        let template = await api.post("/sendtemplate", msg);

        console.log(template)

      }




      console.log(response)

    },

    async receiveMessage() {


      console.log('MAIS FACIL DE ACHAR', this.usuario);


      if (this.tipo == 'admin') {
        console.log('admin não atualiza usuario')
      } else {
        await api.get(`/atualizausuario/${this.usuario}/${this.wppnum}`)
      }


      let a = await api.get(`/lidamsg/${this.wppnum}`,);

      console.log('eu sou o A Só que lido kkkkkkk', a)

      console.log('eu sou o selected contact do receiveMessage', this.selectedContact, this.wppnum);
      console

      let msg = { telefone: this.wppnum };
      console.log('eu sou o wppnum', this.wppnum);
      this.buscarCliente();

      let response = await api.post("/reciveMsg", msg);
      let receivedMessages = response.data.dados;

      console.log('Mensagens recebidas:', receivedMessages); // Verifique todas as mensagens

      // Armazena todas as mensagens temporariamente antes de adicionar ao chat
      let allMessages = [];

      for (let message of receivedMessages) {
        console.log('Mensagem:', message); // Verifique cada mensagem

        if (message.type === 'image') {
          // Processa imagens
          try {
            let imageResponse = await api.get(`/get-image/${message.mensagem}`, { responseType: 'blob' });
            let imageUrl = URL.createObjectURL(imageResponse.data);
            allMessages.push({ text: imageUrl, datetime: message.datetime, sender: message.nome, isImage: true });
          } catch (err) {
            console.error('Erro ao buscar imagem:', err);
          }
        } else if (message.type === 'audio' || message.mensagem.endsWith('.mp3')) {
          console.log('Processando áudio...');
          try {
            let audioResponse = await api.get(`/get-audio/${message.mensagem}`, { responseType: 'blob' });
            let audioUrl = URL.createObjectURL(audioResponse.data);
            allMessages.push({ text: audioUrl, datetime: message.datetime, sender: message.nome, isAudio: true });
          } catch (err) {
            console.error('Erro ao buscar áudio:', err);
          }
        } else {
          allMessages.push({ text: message.mensagem, datetime: message.datetime, sender: message.nome, isImage: false, isAudio: false });
        }


      }
      console.log(allMessages)

      // Adiciona todas as mensagens ao estado de uma só vez
      this.messages.push(...allMessages);
    }
    ,

    playSound() {

      var audio = new Audio(require('../../src/audios/notify.wav'));
      setTimeout(function () {
        audio.play();
      }, 1000);

    },

    async sendTemplate() {

      let msg = {
        to: this.wppnum,
        name: this.name,
        usuario: this.usuario


      };
      let template = await api.post("/sendtemplate", msg);

      console.log(template)
    },
    async enviarMealing() {
      this.openDialogLigacao = false
      let atendeu
      let reagendar
      let interesse
      let negociar

      if (this.atendeu == true) {
        atendeu = "sim"
        console.log(atendeu)
      } else {
        atendeu = "nao"
      }

      if (this.reagendar == true) {
        reagendar = "sim"
        console.log(reagendar)
      } else {
        reagendar = "nao"
      }


      if (this.interesse == true) {
        interesse = "sim"
        console.log(interesse)
      } else {
        interesse = "nao"
      }


      if (this.negociar == true) {
        negociar = "sim"
        console.log(negociar)
      } else {
        negociar = "nao"
      }

      let processo = this.processo[this.selectedContact].processo
      this.contact = []


      let a = await api.get(`/estadoMealing/${processo}/${atendeu}/${reagendar}/${interesse}/${negociar}/${this.observacao}`)
      console.log(a)

      this.openDialogForm = false

      location.reload()
    },
    selectContact(contact) {
      //this.openDialog2 = true
      console.log('eu sou o contact XURASTAY OU XURAIGO', this.contact)
      this.messages = [];
      this.selectedContact = contact;
      //      let a =  api.get(`/insereusuario/${}`)

      this.wppnum = this.selectedContact;
      api.get(`/lidamsg/${this.wppnum}`);
      this.buscarContato(this.estadoContatoAtual)
      this.receiveMessage();
    },
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recorder = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/mp3',  // Definir o tipo MIME como áudio MP3
          recorderType: RecordRTC.StereoAudioRecorder,
          desiredSampRate: 16000,
          audioBitsPerSecond: 128000,
          numberOfAudioChannels: 1,
          bufferSize: 16384,
          sampleRate: 44100,
          frameRate: 20000,
        });
        this.recorder.startRecording();
        this.isRecording = true;
      } catch (error) {
        console.error('Error accessing microphone', error);
      }
    },

    stopRecording() {
      this.recorder.stopRecording(() => {
        this.audioBlob = this.recorder.getBlob();

        // Verifique o tipo de arquivo
        if (this.audioBlob.type !== 'audio/mpeg') {
          console.warn('O áudio não está no formato MP3, ele será enviado como WAV');
        }

        this.audioUrl = URL.createObjectURL(this.audioBlob);
        this.isRecording = false;
      });
    },
    async uploadAudio() {
      if (!this.audioBlob) {
        console.error("Nenhum áudio selecionado");
        return;
      } else {
        console.log('Tipo do áudio:', this.audioBlob.type);
      }

      // Cria um AudioContext para pegar a taxa de amostragem do arquivo WAV
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(await this.audioBlob.arrayBuffer());

      const sampleRate = audioBuffer.sampleRate; // Pega a taxa de amostragem do arquivo
      console.log('Taxa de amostragem do áudio:', sampleRate);

      // Pega os dados do canal de áudio, assume que é estéreo (2 canais), se não for, ajuste conforme necessário
      const audioData = audioBuffer.getChannelData(0); // Usa o primeiro canal
      const audioDataInt16 = new Int16Array(audioData.length);

      // Converte Float32Array para Int16Array
      for (let i = 0; i < audioData.length; i++) {
        audioDataInt16[i] = Math.max(-1, Math.min(1, audioData[i])) < 0 ?
          audioData[i] * 0x8000 :
          audioData[i] * 0x7FFF;
      }

      // Cria uma instância do codificador MP3 com a mesma taxa de amostragem
      const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // 1 canal, sampleRate dinâmico, 128 kbps

      const mp3Data = [];
      const samplesPerFrame = 1152; // Tamanho do frame

      // Codifica em frames
      for (let i = 0; i < audioDataInt16.length; i += samplesPerFrame) {
        const chunk = audioDataInt16.subarray(i, i + samplesPerFrame);
        const mp3Chunk = mp3Encoder.encodeBuffer(chunk);
        if (mp3Chunk.length > 0) {
          mp3Data.push(new Uint8Array(mp3Chunk));
        }
      }

      const mp3End = mp3Encoder.flush(); // Finaliza a codificação
      if (mp3End.length > 0) {
        mp3Data.push(new Uint8Array(mp3End));
      }

      // Cria um novo Blob em formato MP3
      const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });

      const formData = new FormData();
      formData.append('audio', mp3Blob, 'recording.mp3');

      try {
        let response = await api.post("upload-audio", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        console.log('Áudio enviado com sucesso, ID:', response.data.id);
        let pegaId = response.data.id;

        let enviaAudio = {
          to: this.wppnum,
          id: pegaId,
          usuario: this.usuario
        };
        await api.post("sendAudio", enviaAudio);

        // Criar URL do Blob do áudio
        const audioUrl = URL.createObjectURL(mp3Blob);

        // Adicionar a mensagem de áudio ao array de mensagens
        this.messages.push({
          text: audioUrl,
          datetime: new Date().toISOString(), // Adicione a data e hora atuais
          sender: this.usuario,
          isAudio: true
        });

        this.openDialog1 = false;
      } catch (error) {
        console.error('Erro ao enviar áudio:', error);
        this.openDialog1 = false;
      }
    },


    async funcTokenFirebase() {
      let usuario = JSON.parse(localStorage.getItem('usu'))
      this.token = usuario.tokenFirebase
      let token = {
        token: this.token,
        "usuario": this.usuario
      }
      console.log(token)
      console.log('que gemido foi esse?', this.token)
      let a = await api.post(
        `/registrar-token`, token
      );
      console.log(a)
    },




    async sendMessage() {
      this.usuario = this.usuario.charAt(0).toUpperCase() + this.usuario.slice(1);
      console.log('teste usuario aqui', this.usuario)
      if (this.newMessage.trim() !== "") {
        let msg = {
          to: this.wppnum,
          body: `${this.usuario} \n${this.newMessage}`,
          nome: this.usuario
        };

        console.log('me de o CUBO', msg)
        this.messages.push({ text: this.newMessage, sender: this.usuario });
        let resposta = await api.post("/whatsapp/send", msg);
        console.log('verifica resposta da API', resposta.data.dados)
        if (resposta.data.dados == "mensagem não tolerada") {
          console.log('palavrão não kkkkkkkkkkk')
          alert('Palavras de baixo calão não serão toleradas!')
        }
        this.newMessage = "";
        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
        });
      }
    },

    async buscaCidadao() {
      let usuario = JSON.parse(localStorage.getItem('usu'));
      console.log('eu sou o usuario', usuario);

      // Monta com PlugPhone
      let nomeFormatado = usuario.usuario.charAt(0).toUpperCase() + usuario.usuario.slice(1);
      this.usuario = nomeFormatado + "-PlugPhone";

      console.log('eu sou o this.usuario SATORU GOJO', this.usuario);
    },

    async buscarCliente() {
      let a = await api.get(`/buscarmealing/${this.wppnum}`);
      console.log('Vira lata Caramelo', a)
      this.dados = a.data.dados;
    },

    async ligar() {
      console.log('eu sou a função ligar', this.wppnum)
      let liga = await api.get(`/ligar/${this.ramal}/${this.wppnum}`);
      console.log('eou sou', liga)

    },

    async uploadImage() {
      if (!this.selectedFile) {
        console.error("Nenhuma imagem selecionada.");
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(this.selectedFile.type)) {
        console.error("O arquivo selecionado não é uma imagem.");
        return;
      }

      let formData = new FormData();
      formData.append("image", this.selectedFile, this.selectedFile.name);

      try {
        // Envia a imagem via POST
        let response = await api.post("/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        let pegaId = response.data.id;
        this.messages.push({ text: URL.createObjectURL(this.selectedFile), sender: this.usuario, isImage: true });

        // Envio da imagem via POST para o WhatsApp
        let enviaImg = {
          to: this.wppnum, id: pegaId, usuario: this.usuario
        };
        await api.post("sendimage", enviaImg);

        // Recupera a URL da imagem
        let getURL = await api.get(`/pegaURL/${pegaId}`);
        console.log('URL AQUI', getURL.data);
        let imageURL = { "url": getURL.data.url, "id": pegaId };

        console.log('EU SOU O IMAGE URL ', imageURL)
        // Agora usamos o axios diretamente para fazer o GET na URL externa com os headers

        // Fazendo a requisição GET para a URL externa
        console.log('eu cheguei até aqui')
        let image = await api.post(`/geraImage/`, imageURL);
        console.log('eu sou a imagem', image);

        this.openDialog = false;
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        this.messages.push({ text: "Erro ao enviar imagem.", sender: this.usuario });
        this.openDialog = false;
      }
    },
    async uploadDocumento() {
      if (!this.selectedFile) {
        console.error("Nenhum documento selecionado.");
        return;
      }

      // Tipos de documentos permitidos
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
      ];

      if (!allowedTypes.includes(this.selectedFile.type)) {
        console.error("O arquivo selecionado não é um documento válido.");
        return;
      }

      let formData = new FormData();
      formData.append("file", this.selectedFile, this.selectedFile.name);

      try {
        // Envia o documento para o backend
        let response = await api.post("/upload-document", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        let pegaId = response.data.id;
        let caminho = response.data.caminhoFinal

        let caminhoLimpo = caminho.replace(/^uploads\//, '');
        console.log('eu sou o caminho limpo, eu sou a luz', caminhoLimpo);
        //console.log('eu sou o caminho, eu sou a verdade', caminho)
        // Mensagem no chat indicando que o doc foi enviado (com nome e link temporário)
        this.messages.push({
          text: `${this.apiWPurl}/midia/${caminhoLimpo}`,
          file: URL.createObjectURL(this.selectedFile),
          sender: this.usuario,
          isDocument: true
        });

        // Envio para o WhatsApp
        let enviaDoc = {
          to: this.wppnum,
          id: `${this.apiWPurl}/midia/${caminhoLimpo}`,
          nomeArquivo: this.selectedFile.name,
          usuario: this.usuario
        };

        console.log('eu sou o enviaDoc', enviaDoc)
        await api.post("/senddocument", enviaDoc);

        // Recupera URL final do documento
        let getURL = await api.get(`/midia/${caminhoLimpo}`);
        let docURL = { url: getURL.data.url, id: pegaId };

        console.log('URL DO DOCUMENTO:', docURL);

        // Chamada final pro backend processar (se necessário)
        //await apiWP.post("/geraDocumento", docURL);

        this.selectedFile = null
        this.openDialogAnexo = false;
      } catch (error) {
        console.error("Erro ao enviar documento:", error);
        this.messages.push({ text: "Erro ao enviar documento.", sender: this.usuario });
        this.openDialogAnexo = false;
      }
    },



    async verificaMensagem(telefone, setor, usuario) {
      this.contacts = []
      let contatos = await api.get(`/verificamensagem/${telefone}/`);
      let contatosArray = contatos.data.dados;
      console.log(contatosArray)
      let tel = ""
      let setorV = ""
      let usuarioV = ""
      contatosArray.forEach(e => {

        tel = e.telefone
        setorV = e.setor
        usuarioV = e.usuario
      });

      console.log('passei', tel
        , setorV
        , usuarioV, '// \n', telefone, setor, usuario)
      //this.playSound()


      if ((setorV == setor || setor == 'admin') && (usuarioV == usuario || usuarioV == null)) {
        this.playSound()
      } else {
        console.log('não passei pelo if')

      }

    },

    async buscarContato(estadoContato) {

      this.estadoContatoAtual = estadoContato
      this.contacts = [];
      let contatos = await api.get(`/buscarcontatos1/${this.tipo}/${this.usuario}/${estadoContato}`);
      let contatosArray = contatos.data.dados;
      console.log("Esse é o contato array", contatosArray);

      contatosArray.forEach(e => {
        // Converte a data para o formato brasileiro e remove a vírgula
        let dataFormatada = new Date(e.datahora).toLocaleString("pt-BR").replace(",", "");

        this.contacts.push({
          nome: e.nome,
          telefone: e.telefone,
          estado: e.estado,
          estadomsg: e.estadomsg,
          ultimamsg: e.ultimamsg,
          datahora: dataFormatada
        });

        console.log("Eu sou os contatos :D", this.contacts);
      });
    }
    ,


    closeDialogConcluir() {
      this.openDialogConcluir = false
    },
    closeDialogAnexo() {
      this.openDialogAnexo = false
    }
  },
};
</script>


<style>
.message {
  margin-bottom: -65px !important;
  padding: 5px;
  border-radius: 5px;
  width: 100%;
  word-wrap: break-word;
}

.message-requester {
  text-align: left;

  border: none;
  color: white;
  padding: 15px 32px;

  text-decoration: none;
  font-size: 16px;
}

.message-agent {
  text-align: right;

  border: none;
  color: white;
  padding: 15px 32px;

  text-decoration: none;
  font-size: 16px;
}

.input-message {
  width: calc(88% - 20px);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 25px;
  outline: none;
  position: absolute;
  bottom: 0;
  left: 51px;

}

.sidebar {
  color: rgb(0, 0, 0);
  left: -6px;
  border-radius: 2%;
  width: 300px !important;



}

.cabecalho {

  width: 100%;
  position: fixed;
  top: 12px;
  background-color: white;
  margin-left: 2%;
}

.bottom-bar {
  position: relative;
  margin-top: 64px;
  width: 100%;
  padding: 10px;
  background-color: #f0f0f0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.button {
  background-color: #075e54;
  /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: start;
  border-radius: 15px;

  display: inline-block;
  font-size: 16px;
}

.buttonSender {
  background-color: #25d366;
  /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: start;
  border-radius: 15px;

  display: inline-block;
  font-size: 16px;
}

.message-text {
  word-break: break-word;
}

.titulo {
  text-align: end;
}

.imageIcon {
  left: 91%;
  font-size: 25px;
  top: 3px;
}

.micIcon {
  left: 90%;
  font-size: 25px;
  top: 3px;
}

.imageIcon:hover {
  background-color: #b0b0b0;
  border-radius: 25%;
}

.micIcon:hover {
  background-color: #b0b0b0;
  border-radius: 25%;
}

.linhaBtn {
  width: 50%;
  margin-left: 3%;
}

.dialogo {
  height: 302px
}

.dialogo1 {
  height: 302px
}



.btnAudio {
  background-color: #65cf65 !important;
  color: rgb(255, 255, 255) !important
}

.btnAudioStop {
  left: 12% !important;
  background-color: #e74343 !important;
  color: white !important;

}

.btnTransfer {
  left: 31% !important;
  background-color: #574de0 !important;
  color: white !important;

}

.btnCall {
  left: 12% !important;
  background-color: #6cbfff !important;
  color: white !important;

}

.btnCancel {
  left: 35% !important;
  margin-top: -10%;
  background-color: #6cbfff !important;
  color: white !important;


}

.linhaContato {
  margin: 12%;
  margin-left: 25%;
}


.linhaContatoConcluir {
  margin: 12%;
  margin-left: 15%;
}

.plug {
  width: 59px;
  bottom: -56%;
  position: relative;
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

.info {
  background-color: #ffffff !important;
  border-color: #ffffff !important;
  width: 22%;
  position: fixed;
  right: 1%;

}

.v-application {
  background-color: #ffffff !important;
  border-color: #ffffff !important;
}

@media (max-width: 768px) {
  .info {
    width: 100%;
    position: static;
    right: 0;
    background-color: #ffffff !important;
    border-color: #ffffff !important;
  }
}

.responsive-table .v-data-table__wrapper {
  display: block;
}

.table-row {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

@media (min-width: 769px) {
  .table-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

.infoBtn {
  width: 21%;
  background-color: #dddddd;
  position: fixed;
  right: 1%;
  top: 1%;
}

.plug {
  width: 80px;
  left: 34%;
}

.avatar {
  width: 60%;
  left: 15%;
  top: 3%;
}

.plugPhone {
  position: fixed;
  top: 15%;
  left: 35%;
  opacity: 30%;
  width: 33%;
}

.logo {
  width: 30%;
  right: 40%;
  position: fixed;
  bottom: 3%;
}

.filtro {
  width: 20% !important;
  padding-right: 6%;
  padding-left: 0%;
}

#seta {
  /* cor de fundo opcional */
  border-radius: 50%;
  border-style: solid;
  border-color: #6d6d6d;
  padding: 0px;
  font-size: 22px;
  cursor: pointer;
}

.linhaBtnCall {
  width: 75%;
  margin-left: 22%;
}

.botaoEstado {
  margin-left: 10px !important;
}
</style>