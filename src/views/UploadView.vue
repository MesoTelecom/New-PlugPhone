<template>
  <v-app>
    <Navbar />
    <br>
    <router-link to="./menusupervisor" class="linkp" style="    width: 93px;">
      <v-btn dark class="botaoSair">voltar</v-btn>
    </router-link>
    <v-main>
      <v-container class="py-6">
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card class="pa-4 rounded-xl" elevation="4">
              <v-card-title class="text-h5 font-weight-bold">
                📩 Enviar mensagens em massa (CSV)
              </v-card-title>

              <v-card-subtitle class="mt-1">
                Envie mensagens para vários contatos de uma vez usando um arquivo CSV.
              </v-card-subtitle>

              <v-divider class="my-4"></v-divider>

              <v-alert type="info" outlined class="mb-4">
                <div class="font-weight-bold mb-1">Formato esperado do CSV:</div>
                <div>telefone, nome, nomeMedico</div>
                <div class="text-caption mt-1">
                  Ex: 553199999999, {{ usuario }}, João
                </div>
              </v-alert>

              <v-file-input v-model="file" label="Selecione o arquivo CSV" accept=".csv" prepend-icon="mdi-file-upload"
                outlined dense :error-messages="fileError" @change="onFileChange"></v-file-input>

              <v-chip v-if="file" class="mt-3" color="primary" outlined label>
                📄 {{ file.name }}
              </v-chip>

              <v-card-actions class="mt-5 px-0">
                <v-btn color="primary" class="mr-2" :loading="loading" :disabled="!file || loading" @click="uploadFile">
                  🚀 Enviar
                </v-btn>

                <v-btn color="grey" text :disabled="loading" @click="limparArquivo">
                  Limpar
                </v-btn>
              </v-card-actions>

              <v-alert v-if="uploadStatus" class="mt-4" :type="uploadStatus.type" dismissible>
                {{ uploadStatus.message }}
              </v-alert>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <br /><br />

    </v-main>

    <Footer />
  </v-app>
</template>

<script>
import { api } from "@/conf/api";
import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";

export default {
  async beforeMount() {
    let usuario = JSON.parse(localStorage.getItem("usu"));

    // mantém sua regra aqui
    this.usuario = usuario.usuario;
    console.log("mostre-me o usuário", this.usuario);
  },

  data() {
    return {
      fileError: "",
      file: null,
      uploadStatus: null,
      loading: false,

      idsetinterval: null,
      dados: [],
      usuario: "",
    };
  },

  components: {
    Navbar,
    Footer,
  },

  methods: {
    async listar() {
      try {
        let buscarCsv = await api.get(`/buscarcsv`);
        this.dados = buscarCsv.data.dados;

        console.log("dados csv", this.dados.length);

        if (this.dados.length > 0) {
          clearInterval(this.idsetinterval);
          this.idsetinterval = null;
          console.log("✅ processamento finalizado, parando interval");
        }
      } catch (err) {
        console.log("Erro ao buscar CSV:", err);
      }
    },

    onFileChange(file) {
      this.uploadStatus = null;
      this.fileError = "";

      if (!file) {
        this.file = null;
        return;
      }

      if (!file.name.toLowerCase().endsWith(".csv")) {
        this.fileError = "Selecione um arquivo .csv válido.";
        this.file = null;
        return;
      }

      // garante que o file está ok
      this.file = file;
    },

    limparArquivo() {
      this.file = null;
      this.fileError = "";
      this.uploadStatus = null;
    },

    async uploadFile() {
      this.uploadStatus = null;
      this.fileError = "";

      console.log("Olha eu aqui", this.usuario);

      if (!this.file) {
        this.fileError = "Nenhum arquivo CSV válido selecionado.";
        return;
      }

      // evita duplicar interval
      if (this.idsetinterval) {
        clearInterval(this.idsetinterval);
        this.idsetinterval = null;
      }

      try {
        this.loading = true;

        const formData = new FormData();
        formData.append("file", this.file);
        formData.append("usuario", this.usuario);

        const response = await api.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Arquivo enviado com sucesso:", response.data);

        this.uploadStatus = {
          type: "success",
          message: "Arquivo enviado com sucesso! Processando...",
        };

        // começa a verificar o processamento
        this.idsetinterval = setInterval(() => this.listar(), 1000);

        // opcional: limpa o arquivo após enviar
        this.file = null;

      } catch (error) {
        console.error("Erro ao enviar o arquivo:", error);

        this.uploadStatus = {
          type: "error",
          message: "Erro ao enviar o arquivo.",
        };
      } finally {
        this.loading = false;
      }
    },
  },

  beforeUnmount() {
    // evita interval rodando se sair da tela
    if (this.idsetinterval) clearInterval(this.idsetinterval);
  },
};
</script>

<style scoped>
.rounded-xl {
  border-radius: 18px;
}

.botaoSair {
  margin-left: 1%;
  background-color: #0e9e45 !important;
  text-decoration: none !important;
}
</style>
