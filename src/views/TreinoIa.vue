<template>
  <v-app>
    <Navbar />

    <v-main>
      <v-btn icon color="black" :to="{ path: '/dashboard' }" style="left: 5%; font-size: 70px; margin-bottom: -4%;">
        <v-icon style="font-size: 45px;">mdi-arrow-left</v-icon>
      </v-btn>

      <v-container class="form-container">
        <h2>Contribua com o aprendizado da Nia, a assistente virtual do PlugPhone!</h2>

        <v-text-field v-model="titulo" label="Digite o título da Experiência" outlined class="mb-4" />

        <v-textarea v-model="descricao" label="Descreva o problema que você enfrentou" auto-grow class="mb-4"
          style="background-color: transparent !important" />

        <v-textarea v-model="resolucao" label="Como você resolveu esse problema?" auto-grow class="mb-4"
          style="background-color: transparent !important" />

        <v-text-field v-model="palavrasChave" label="Palavras-chave (separadas por vírgula)" outlined class="mb-4" />

        <v-btn @click="enviaExp" color="primary">Enviar</v-btn>
      </v-container>


      <br><br>
    </v-main>

    <Footer />
  </v-app>
</template>

<script>
import { api } from "@/conf/api";
import Navbar from "../components/Navbar";
import Footer from "../components/footer.vue";

export default {
  data() {
    return {
      titulo: "",
      descricao: "",
      palavrasChave: "",
      usuario: "",
      resolucao: "",
    };
  },
  components: {
    Navbar,
    Footer,
  },

  async beforeMount() {
    let usuario = JSON.parse(localStorage.getItem('usu'));
    this.usuario = usuario.usuario + "-PlugPhone"
    //this.idsetinterval = setInterval(() => this.buscarContato(), 5000);
    console.log(this.usuario)

  },

  methods: {
    async enviaExp() {
      try {
        const exp = {
          titulo: this.titulo,
          descricao: `${this.descricao} \n ${this.resolucao}`,
          palavrasChave: this.palavrasChave.split(",").map(p => p.trim()),
          usuario: this.usuario
        };
        const resposta = await api.post(`/enviaExp`, exp);
        console.log("Experiência enviada:", resposta.data);
      } catch (erro) {
        console.error("Erro ao enviar experiência:", erro);
      }
      location.reload()

    }
  }
};
</script>
<style scoped>
.form-container {
  max-width: 700px;
  /* define limite horizontal */
  margin: 0 auto;
  /* centraliza o container */
  padding: 20px;
}

.v-textarea {
  width: 100%;
  box-sizing: border-box;
}

.v-textarea textarea {
  resize: vertical;
  /* permite expandir só na vertical */
  overflow-y: auto;
}
</style>