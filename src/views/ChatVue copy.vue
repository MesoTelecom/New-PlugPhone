<template>
  <div id="app" style="">
    <v-app style="">
      <v-card class="overflow-hidden" style="
      margin-left: -250px;
      max-width: 1000% !important;
      margin-top: -80px;
      backgroundcolor: red;
    ">
        <v-app-bar absolute color="rgb(40 85 111)" dark hide-on-scroll prominent>
          <v-app-bar-nav-icon></v-app-bar-nav-icon>

          <v-toolbar-title style="margin-left: 44%">PlugPhone Chat
            <v-btn v-on:click="$vuetify.theme.dark = !$vuetify.theme.dark" class="tema">
              {{ $vuetify.theme.dark ? 'Light' : 'Dark' }}
            </v-btn>
          </v-toolbar-title>
          <img src="../assets/plugbranco3.png" class="plug" />
        </v-app-bar>

        <v-container style="height: 130px; margin-left: -16%; background-color: "></v-container>
      </v-card>

      <v-navigation-drawer app color="rgb(40, 85, 111)" class="sidebar">

        <v-list dense>
          <br>
          <v-list-item-group v-model="selectedContact">
            <v-list-item v-for="(contact, index) in contacts" :key="index">
              <v-list-item-content>
                <v-list-item-title class="sidebar" @click="selectContact(contact.telefone)">
                  <v-icon style="color: white; font-size: 35px;">mdi-account-circle</v-icon>
                  {{ contact.nome }} <v-icon :style="{ color: contact.estado === 'mdi-checkbox-marked-circle-outline' ? '#8bff9a' : contact.estado === 'mdi-cancel' ? 'red' : 'black' }">
                    {{ contact.estado }}
                  </v-icon>
                 

                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
      <v-main style="padding: 0px;">
        <v-container fluid>
          <v-row>
            <v-col cols="12" md="12" style="padding: 0%;">
              <div class="messages" ref="messages" style="margin-bottom: -65px;     margin-left: 3%;">
                <div v-for="(message, index) in messages" :key="'server-' + index" :class="{
                  'message-requester': !message.sender.includes('-Precavida'),
                  'message-agent': message.sender.includes('-Precavida'),
                }">
                  <button :class="{
                    buttonSender: !message.sender.includes('-Precavida'),
                    button: message.sender.includes('-Precavida'),
                  }" :style="{
                    'text-align': message.sender.includes('-Precavida') ? 'end' : 'start',
                  }">
                    <span :class="{
                      tituloSender: !message.sender.includes('-Precavida'),
                      titulo: message.sender.includes('-Precavida'),
                    }">
                      <b>{{ message.sender }}:</b><br />
                    </span>
                    <span class="message-text">
                      <span v-if="message.isImage">
                        <img :src="message.text" alt="image" style="">
                      </span>
                      <span v-else>
                        {{ message.text }}
                      </span>


                    </span>
                  </button>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>

    <div class="bottom-bar">
      <input type="text" v-model="newMessage" @keyup.enter="sendMessage" placeholder="Digite sua mensagem aqui..."
        class="input-message" />
      <v-icon @click="openDialogForm = true" class="imageIcon" style="left: 92%;font-size: 169%;"
        :disabled="tipo === 'Especialista'">
        mdi-format-list-bulleted
      </v-icon>


      <v-icon @click="openDialogConcluir = true" class="imageIcon" style="left: 93%" :disabled="tipo === 'Analista'">
        mdi-checkbox-marked-circle</v-icon>

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
              <v-btn @click="populaOportunidade(telefone), openDialogLigacao = true, openDialog2 = false"
                class="btnCall">
                Ligação <v-icon>mdi-phone</v-icon>
              </v-btn>
              <audio v-if="audioUrl" :src="audioUrl" controls></audio>
            </v-row>
          </v-card-text>

        </v-card>
      </v-dialog>
      <v-dialog v-if="tipo === 'Analista'" v-model="openDialogLigacao" max-width="500px" persistent>
        <v-card class="dialogo1">
          <v-card-title>Por favor digite seu Ramal</v-card-title>
          <v-card-text>
            <v-text-field v-model="ramal" label="Ramal" @keyup.enter="Ligar"
              placeholder="Digite seu ramal"></v-text-field> </v-card-text>

          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn @click="ligar(), openDialogForm = true" class="btnCall">
                Ligar <v-icon>mdi-phone</v-icon>
              </v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialog1 = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openDialogConcluir" max-width="500px" persistent>
        <v-card class="dialogoZap">
          <v-card-title>Como foi a conclusão do atendimento</v-card-title>
          <br>



          <v-card-text>
            <v-row class="linhaContatoConcluir">

              <v-btn @click="finalizar(finaliza = true), openDialogConcluir = false" class="btnAudio"
                v-model="finaliza">
                Aprovar! <v-icon> mdi-checkbox-marked-circle-outline</v-icon>

              </v-btn>
              <v-btn @click="finalizar(finaliza = false), openDialogConcluir = false" class="btnAudioStop">
                Reprovar <v-icon> mdi-cancel</v-icon>
              </v-btn>
              <audio v-if="audioUrl" :src="audioUrl" controls></audio>
            </v-row>


            <br>

          </v-card-text>

        </v-card>

      </v-dialog>

      <v-dialog v-model="openDialogConcluir" max-width="500px" persistent>
        <v-card class="dialogoZap">
          <v-card-title>Como foi a conclusão do atendimento</v-card-title>
          <br>



          <v-card-text>
            <v-row class="linhaContatoConcluir">

              <v-btn @click="finalizar(finaliza = true), openDialogConcluir = false" class="btnAudio"
                v-model="finaliza">
                Aprovar! <v-icon> mdi-checkbox-marked-circle-outline</v-icon>

              </v-btn>
              <v-btn @click="finalizar(finaliza = false), openDialogConcluir = false" class="btnAudioStop">
                Reprovar <v-icon> mdi-cancel</v-icon>
              </v-btn>
              <audio v-if="audioUrl" :src="audioUrl" controls></audio>
            </v-row>

            <br>

          </v-card-text>

        </v-card>

      </v-dialog>

      <v-dialog v-model="openDialogForm" max-width="500px" persistent>
        <v-card>
          <v-card-title>Feedback do Cliente</v-card-title>
          <v-card-text>
            <v-checkbox v-model="atendeu">

            </v-checkbox>
            <v-text style="
    color: black;
    position: absolute;
    font-size: 15px;
    margin-left: 35px;
    margin-top: -9%;
"><b>O cliente atendeu a tentativa de contato?
              </b></v-text>

            <v-checkbox v-model="reagendar">

            </v-checkbox>
            <v-text style="
    color: black;
    position: absolute;
    font-size: 15px;
    margin-left: 35px;
    margin-top: -9%;
"><b>Caso não tenha atendido, tem interesse em reagendar?
              </b></v-text>
            <v-checkbox v-model="interesse">

            </v-checkbox>
            <v-text style="
        color: black;
        position: absolute;
        font-size: 15px;
        margin-left: 35px;
        margin-top: -9%;
    "><b>O cliente tem interesse na proposta oferecida?

              </b></v-text>

            <v-checkbox v-model="negociar">

            </v-checkbox>
            <v-text style="
            color: black;
            position: absolute;
            font-size: 15px;
            margin-left: 35px;
            margin-top: -9%;
        "><b>Caso não tenha, tem interesse em negociar?
              </b></v-text>
            <v-text-field v-model="observacao" label="Observação"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="enviarMealing()" color="primary">Enviar</v-btn>
            <v-btn @click="openDialogForm = false" color="error">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { api } from "@/conf/api";

import { apiWP } from "@/conf/apiWP";
import RecordRTC from 'recordrtc';
import io from 'socket.io-client';
import Navbar from "../components/Navbar.vue";

// Certifique-se de incluir o script libmp3lame.js no seu projeto e carregá-lo corretamente.

export default {
  async beforeMount() {
    this.buscaCidadao();

    let usuario = JSON.parse(localStorage.getItem('usu'));
    this.tipo = usuario.tipo;
    this.usuario = usuario.usuario + "-Precavida"

    this.buscarContato();

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
      messages: [],
      openDialogConcluir: false,
      name: "template_plugphone2",
      wppnum: "",
      ramal: "",
      plataforma: "",
      openDialog: false,
      openDialog1: false,
      openDialog2: false,
      openDialogLigacao: false,
      openDialogForm: false,
      tipo: null,
      selectedFile: null,
      whatsapp: "whatsapp",
      telefone: "telefone",
      processo: [],
      socket: "",
      usuario: "",
      newMessage: "",
      audioBlob: "",
      contacts: [],
      dados: [],
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
    this.socket = io('https://poc.plugphone.cloud:3333');
    this.socket.on('chat message', (nome, msg) => {
      this.messages.push({ text: msg, sender: nome });
    });
  },

  comments: {
    Navbar
  },
  methods: {
    async finalizar(finaliza) {
      console.log('finaliza', finaliza)
      console.log('eu sou oportunidade', this.processo[this.selectedContact])
      let processo = this.processo[this.selectedContact].processo
      //console.log('eu sou plataforma', plataforma, processo)

      if (finaliza == true) {
        let response = await api.get(`/finaliza/${processo}/aprovado`);
        console.log(response)
        location.reload()

      } else {
        let response = await api.get(`/finaliza/${processo}/reprovado`);
        console.log(response)
        location.reload()

      }
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
        let template = await api.post("/whatsapp/sendtemplate", msg);

        console.log(template)

      } else {
        response = await api.get(`/oportunidadeespecialista/${processo}/${this.plataforma}/${this.usuario}`);
        let msg = {
          name: this.name,
          to: this.wppnum,
          usuario: this.usuario

        };
        let template = await api.post("/whatsapp/sendtemplate", msg);

        console.log(template)

      }




      console.log(response)

    },
    async receiveMessage() {
      console.log('MAIS FACIL DE ACHAR', this.usuario)

      console.log('eu sou o selcted contact do recive mesage', this.selectedContact, this.wppnum)
      let msg = {
        telefone: this.wppnum,
      };


      this.buscarCliente();

      let response = await api.post("/reciveMsg", msg);
      let receivedMessages = response.data.dados;

      receivedMessages.forEach((message) => {
        if (message.nome === this.usuario) {
          this.messages.push({ text: message.mensagem, sender: this.usuario });
        } else {
          this.messages.push({ text: message.mensagem, sender: message.nome });
        }
      });
    },
    async sendTemplate() {

      let msg = {
        to: this.wppnum,
        name: this.name,
        usuario: this.usuario


      };
      let template = await api.post("/whatsapp/sendtemplate", msg);

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
      this.openDialog2 = true
      console.log('eu sou o contact', this.contact)
      this.messages = [];
      this.selectedContact = contact;
      this.wppnum = this.selectedContact;
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
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        this.isRecording = false;

        // Enviar o arquivo para o servidor
      });
    },
    async uploadAudio() {
      if (!this.audioBlob) {
        console.error("Nenhum Audio Selecionado")
        return
      }
      else
        console.log(this.audioBlob)
      const formData = new FormData();
      formData.append('audio', this.audioBlob, 'recording.mp3');

      try {
        let response = await api.post("saveAudio", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        console.log('Áudio enviado com sucesso, ID:', response.data.id);

        let pegaId = response.data.id

        let enviaAudio = { to: this.wppnum, id: pegaId };

        await api.post("sendAudio", enviaAudio);



        this.openDialog1 = false
      } catch (error) {
        console.error('Erro ao enviar áudio:', error);
        this.openDialog1 = false;

      }
      this.openDialog1 = false;

    },
    async sendMessage() {
      console.log('teste usuario aqui', this.usuario)
      if (this.newMessage.trim() !== "") {
        let msg = {
          to: this.wppnum,
          body: this.newMessage,
          nome: this.usuario
        };

        console.log('me de o CUBO', msg)
        this.messages.push({ text: this.newMessage, sender: this.usuario });
        await api.post("/whatsapp/send", msg);
        this.newMessage = "";
        this.$nextTick(() => {
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
        });
      }
    },
    async buscaCidadao() {
      let usuario = JSON.parse(localStorage.getItem('usu'));
      console.log('eu sou o usuario', usuario)
      this.usuario = usuario.usuario + "-Precavida"
      console.log('eu sou o this.usuario', this.usuario)

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
        let response = await apiWP.post("dados/saveImage", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        let pegaId = response.data.id;
        this.messages.push({ text: URL.createObjectURL(this.selectedFile), sender: this.usuario, isImage: true });

        let enviaImg = { to: this.wppnum, id: pegaId };
        await api.post("sendimage", enviaImg);

        this.openDialog = false;
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        this.messages.push({ text: "Erro ao enviar imagem.", sender: this.usuario });
        this.openDialog = false;
      }
    },
    async buscarContato() {
      let contatos = await api.get(`/buscarcontatos/${this.usuario}/${this.tipo}`);
      let contatosArray = contatos.data.dados;
      console.log(contatosArray)
      contatosArray.forEach(e => {
        this.contacts.push({ nome: e.nome, telefone: e.Telefone, processo: e.processo, estado: e.estado });
        this.processo.push({ processo: e.processo })
        //this.wppnum.push({telefone: e.Telefone})
        console.log(this.wppnum)
        console.log('eu sou os contatos :D',this.contacts)
      });

    },
    closeDialogConcluir() {
      this.openDialogConcluir = false
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
  color: white;
  width: 300px !important;
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
  background-color: #28556f;
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
  background-color: #6cbfff;
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


.dialogoZap {}

.btnAudio {
  background-color: #65cf65 !important;
  color: rgb(255, 255, 255) !important
}

.btnAudioStop {
  left: 12% !important;
  background-color: #e74343 !important;
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
</style>