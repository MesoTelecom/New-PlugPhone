<template>
  <v-app>
    <Navbar />

    <v-main>
      <v-container>
        <h2>Enviar Arquivo CSV</h2>
        <v-file-input label="Selecione o arquivo" @change="onFileChange" :error-messages="fileError"></v-file-input>
        <v-select label="Select" :items="dadosUsuario" v-model="usuario" style="width: 97%;
    left: 3%;"></v-select>
        <v-btn @click="uploadFile" color="primary">Enviar</v-btn>
        <v-alert v-if="uploadStatus" :type="uploadStatus.type" dismissible>
          {{ uploadStatus.message }}
        </v-alert>
      </v-container>
      <br><br>
      <v-data-table :headers="headers" :items="dados" :search="search" class="elevation-1"></v-data-table>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import { api } from "@/conf/api";
import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";
//import verificaAcesso from "../acess/verificaAcessoGestorMixin"
export default {
//  mixins: [verificaAcesso],
  async beforeMount() {
    this.litarUsuario()
  },
  data() {
    return {
      fileError: "", // Para armazenar a mensagem de erro
      selectedFile: null, // Para armazenar o arquivo selecionado
      uploadStatus: null,
      idsetinterval: null,
      dadosUsuario: [],
      d1: '',
      pin: '',
      ramal: '',
      d2: '',
      fila: '',
      search: "",
      ano: "",
      orgao: "",
      processo: "",
      liquidacao: "",
      valor_da_face: "",
      credor: "",
      documento: "",
      idade: "",
      renda: "",
      tipo: "",
      telefone: "",
      id: "",
      atendeu: "",
      reagendar: "",
      interesse: "",
      negociar: "",
      obs: "",
      status: "",
      headers: [
        { text: "Ano", value: "ano" },
        { text: "Orgao", value: "orgao" },
        { text: "Processo", value: "processo" },
        { text: "Liquidacao", value: "liquidacao" },
        { text: "Valor da Face", value: "valor_da_face" },
        { text: "Credor", value: "credor" },
        { text: "Documento ", value: "documento" },
        { text: "Idade", value: "idade" },
        { text: "Renda", value: "renda" },
        { text: "Tipo", value: "tipo" },
        { text: "Telefone", value: "telefone" },
        { text: "Id", value: "id" },
        { text: "Id Agente", value: "idAgente" },

      ],
      dados: [],
      items: [],
      usuario: '',
    };
  },
  components: {
    Navbar,
    Footer,
  },
  methods: {
    litarUsuario: async function () {
      let buscaUsuario = await api.get(`/listaanalista`)
      let usuario = buscaUsuario.data.dados
      let nomeUsuario = []
      usuario.forEach(element => {
        nomeUsuario = element.usuario
        this.dadosUsuario.push(nomeUsuario)

      });
      console.log(this.dadosUsuario)
    },
    listar: async function () {
      let buscarCsv = await api.get(`/buscarcsv`);
      this.dados = buscarCsv.data.dados
      console.log('dados csv', this.dados.length)
      if (this.dados.length > 0) {
        clearInterval(this.idsetinterval)
        console.log('To aquiiiiiiiiiiiiiiiiiiiiiiiiiiiii')
      }
    },
    onFileChange(file) {
      this.fileError = ""; // Limpa a mensagem de erro
      this.selectedFile = null; // Reseta o arquivo selecionado
      this.uploadStatus = null; // Reseta o status do upload

      if (file && file.name) {
        const fileExtension = file.name.split(".").pop().toLowerCase();
        if (fileExtension !== "csv") {
          this.fileError = "Por favor, selecione um arquivo CSV.";
        } else {
          this.selectedFile = file; // Armazena o arquivo válido
        }
      }
    },
    uploadFile() {
      this.uploadStatus = ""
      console.log('Olha eu aquui', this.usuario)
      if (this.selectedFile) {
        // Lógica para enviar o arquivo
        console.log("Enviando arquivo:", this.selectedFile);

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('usuario', this.usuario);
        api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        })
          .then(response => {
            console.log('Arquivo enviado com sucesso:', response.data);
            this.uploadStatus = { type: 'success', message: 'Arquivo enviado com sucesso!' };
            this.idsetinterval = setInterval(() => this.listar(), 1000);

          })
          .catch(error => {
            console.error('Erro ao enviar o arquivo:', error);
            this.uploadStatus = { type: 'error', message: 'Erro ao enviar o arquivo.' };
          });
      } else {
        this.fileError = "Nenhum arquivo CSV válido selecionado.";
      }

    }
  }
};
</script>

<style>
/* Seu estilo aqui */
</style>
