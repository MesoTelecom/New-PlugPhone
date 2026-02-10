<template>

  <v-container class="fill-height" fluid>
    <v-card-text class="mt-12" id="centralizado">

      <div style="width: 100%;
      
    position: relative;
    ">
        <!--text--accent-NUMBER altera a cor da letra do texto-->
        <!--<img src="../assets/plugbranco3.png" alt="" class="icone">-->

        <h1 class="text-center display-1" style="color: white;">Seja bem-vindo ao PlugPhone Cloud</h1>
        <br>
        <br>
        <br>
        <br>

        <!--div que trata botões de Facebook, Google e Linkedin-->
      </div>

      <v-form style="        top: 200%;
          margin-top: 0%;
    width: 55%;
    height: 200px;
    left: 21%;
    position: relative;">
        <v-row style="    width: 72%;
    margin-left: 5%;">
          <v-icon style="
          left: 20%;
          height: 50px;
          font-size: 40px;
          color: white;">mdi-account</v-icon>
          <v-text-field label="Digite seu usuário" name="usuario" type="text" v-model="usuario"
            class="custom-text-field" solo placeholder="Nome-Sua_Empresa" />

        </v-row>

        <v-row style="    width: 72%;
    margin-left: 5%;">
          <v-icon style="
          left: 20%;
          height: 50px;
          font-size: 40px;
          color: white;">mdi-lock</v-icon>
          <v-text-field id="password" label="Digite sua senha" name="senha" :type="showPassword ? 'text' : 'password'"
            v-model="senha" class="custom-text-field" solo :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="showPassword = !showPassword" />
        </v-row>
        <div class="text-center" style="width: 100%">
          <br>

          <v-btn rounded @click="login()" color="#61a5e8" class="centralizado"
            style="color: white;    margin-bottom: 1px;margin-left: 20px;">Próximo</v-btn>

          <br>
          <br>
          <br>
          <br>
          <br>
          <br>
          <br>
          <br>
          <br>
          <v-btn class="btn" @click="goToEBS">
            Conectar WhatsApp
          </v-btn>

        </div>
      </v-form>
    </v-card-text>
    <br>

    <v-dialog v-model="openDialogAuth" max-width="500px" persistent>
      <v-card>
        <v-card-title>Autenticação de 2 fatores</v-card-title> <v-icon @click="openDialogAuth = false"
          class="close">mdi-close</v-icon>
        <h3 style="margin-left: 5%;">Digite o código recebido pelo Whatsapp</h3>
        <br>
        <br>
        <v-row class="loading">
          <v-icon style="    left: 24%;
    margin-bottom: 1%;">mdi-lock</v-icon> <v-text-field label="Digite Seu Código" name="usuario" type="number"
            v-model="codigo" /> </v-row>
        <br>
        <v-btn rounded @click="login" color="#61a5e8" class="centralizado" style="background-color: rgb(97, 165, 232);
    border-color: rgb(97, 165, 232);
    color: white;
    margin-left: 40%;
    margin-bottom: 10%;">Login</v-btn>

      </v-card>
    </v-dialog>
  </v-container>


</template>

<script>
import { api } from "@/conf/api";
import { askPermissionAndSubscribe } from '/src/push.js';

export default {
  name: "HomeView",
  data: () => ({
    usuario: "",
    senha: "",
    showPassword: false,
    openDialogAuth: false,
    codigo: "",
    error: false,
    telefone: "",

    usuarioCompleto: "",  // novo
    id_empresa: null,     // novo
    empresa: ""
  }),
  methods: {

    async geraVerificacao() {
      try {
        const erro = this.validaUsuarioEmpresa();
        if (erro) {
          alert(erro);
          return;
        }

        this.usuarioCompleto = this.usuario;

        let dados = await api.get(`/pegaTelefone/${this.usuarioCompleto}`);

        if (!dados.data?.dados?.length) {
          alert("Usuário não encontrado!");
          return;
        }

        this.telefone = dados.data.dados[0].telefone;

        let authBody = {
          usuario: this.usuarioCompleto,
          telefone: this.telefone
        };

        await api.post(`/gera-codigo`, authBody);

        this.openDialogAuth = true;

      } catch (err) {
        console.log("Erro geraVerificacao:", err);
        alert("Erro ao gerar código.");
      }
    },


    validaUsuarioEmpresa() {
      const u = (this.usuario || "").trim();

      if (!u) return "Digite seu usuário.";

      if (u.includes(" ")) {
        return "Não pode ter espaço. Use '_' no lugar. Ex: Nome-Sua_Empresa";
      }

      if (!u.includes("-")) {
        return "Use o padrão Nome-Sua_Empresa. Ex: Nome-Sua_Empresa";
      }

      if (u.startsWith("-") || u.endsWith("-")) {
        return "Formato inválido. Ex: Nome-Sua_Empresa";
      }

      const partes = u.split("-");

      if (partes.length !== 2) {
        return "Use somente um '-' no formato Nome-Sua_Empresa. Ex: Nome-Sua_Empresa";
      }

      const nome = partes[0];
      const empresa = partes[1];

      if (!nome || nome.length < 2) {
        return "Nome inválido. Ex: Nome-Sua_Empresa";
      }

      if (!empresa || empresa.length < 2) {
        return "Empresa inválida. Ex: Nome-Sua_Empresa";
      }

      if (empresa.includes("__")) {
        return "Empresa inválida (muitos '_'). Ex: Nome-Sua_Empresa";
      }

      // opcional: exigir underline na empresa
      // if (!empresa.includes("_")) {
      //   return "Use '_' no nome da empresa. Ex: Nome-Sua_Empresa";
      // }

      return null;
    },


    goToEBS() {
      //Produção Meso------------------------------
      ///*
      const appId = "7397712986921789";
      const configId = "473643052180048";
      //*/
      //-------------------------------------------
      /*
      //LabPlugPhone-------------------------------
      const appId = "2345944319087956";
      const configId = "1542847690310028";
      */
      //-------------------------------------------





      const signupUrl = `https://business.facebook.com/messaging/whatsapp/onboard/?app_id=${appId}&config_id=${configId}`;

      // Abre o fluxo do EBS em um popup controlado
      window.open(signupUrl, "EBSWindow", "width=1000,height=800,scrollbars=yes");
    },

    async login() {
      try {
        this.error = false;

        const erro = this.validaUsuarioEmpresa();
        if (erro) {
          alert(erro);
          return;
        }

        let res = await api.post("loginconfere2/", {
          login: this.usuarioCompleto || this.usuario, // agora já vem Nome-Sua_Empresa
          senha: this.senha,
          codigo: this.codigo
        });

        console.log('dificil heim kkkk', res.data)

        if (res.data && res.data.token) {
          this.$store.state.token = res.data.token;
          this.$store.state.logado = res.data.tipo;
          this.$store.state.adm = res.data.tipo == "admin";

          this.$store.state.ramal = res.data.ramal;
          this.$store.state.id_empresa = res.data.id_empresa;

          let usu = {
            usuario: this.usuario, // salva completo
            pin: res.data.token,
            tipo: res.data.tipo,
            ramal: res.data.ramal,
            id_empresa: res.data.id_empresa
          };

          this.$store.dispatch('insereUsuario', usu);
          localStorage.setItem("usu", JSON.stringify(usu));
          sessionStorage.setItem("jwt", this.$store.state.token);
          sessionStorage.setItem("lastActivity", Date.now());

          api.defaults.headers.common["x-access-token"] = this.$store.state.token;

          if (res.data.tipo == "Técnico" || res.data.tipo == 'Comercial' || res.data.tipo == 'Financeiro' || res.data.tipo == 'admin') {
            this.$router.push("dashboard");
            this.subscription = await askPermissionAndSubscribe();
          }
        } else {
          this.error = true;
        }

        if (res.data.tipo == "vendedor") {
          sessionStorage.setItem("jwt", this.$store.state.token);
          sessionStorage.setItem("lastActivity", Date.now());
          api.defaults.headers.common["x-access-token"] = this.$store.state.token;
          this.$router.push("estoque");
        }

      } catch (e) {
        console.log("Erro login:", e);
        this.error = true;
      }
    },
  },
  mounted() {
    this.$store.state.logado = false;
    this.$store.state.adm = false;
  },
};
</script>
<style scoped>
/* Centralização */
#centralizado {
  margin-left: 15px !important;
  margin-top: 1% !important;


}

/* Estilização do título */
h1 {
  color: #ffffff;
}

/* Fundo do container */
#fill-height {
  background-color: #ffffff;
}

/* Ajuste dos campos de texto */
.v-text-field {
  width: 50%;
  margin-left: 24%;
}

/* Fundo branco e bordas arredondadas nos v-text-field */
.v-text-field .v-input__control {
  background-color: white !important;
  /* Deixa os campos com fundo branco */
  border-radius: 8px;
  /* Bordas arredondadas */
  border: 2px solid #ccc;
  /* Borda cinza leve */
}

/* Texto digitado dentro do v-text-field */
.v-text-field input {
  color: black !important;
  /* Deixa o texto preto */
}

/* Placeholder (label) dentro do v-text-field */
.v-text-field .v-label {
  color: black !important;
  /* Placeholder preto */
  font-weight: bold;
  /* Deixa o texto do label mais forte */
}

/* Ícones dentro dos campos */
.v-text-field .v-icon {
  color: black !important;
  /* Ícones pretos */
}

/* Estilização do botão */
.v-btn {
  margin-left: 0%;
}

/* Estilização do conteúdo do botão */
.v-btn__content {
  position: center;
}

/* Animações de entrada e saída */
.show-enter-active,
.show-leave-enter {
  transform: translateX(0);
  transition: all 0.3s linear;
}

.show-enter,
.show-leave-to {
  transform: translateX(100%);
}

/* Estilização do container principal */
.fill-height {
  background-repeat: no-repeat;
  background-size: cover !important;
  background-image: url(../assets/mesofundoPlug.jpg);
  padding: 15px;
  background-repeat: no-repeat;
  background-size: 100%;
  background-position: bottom;
}

/* Hover para manter fundo transparente */
.text-center:hover,
.col-md-4:hover {
  background-color: transparent;
}

/* Outros ajustes */
.text-center {
  color: #ffffff;
  position: center;
}

.text-center1 {
  color: #ffffff;
  position: center;
  background-color: transparent;
}

/* Ajuste de fundo para evitar erros em divs invisíveis */
.cardanna {
  background-repeat: no-repeat;
  background-size: 0%;
}

.col-md-4 {
  color: transparent;
}

.icone {
  width: 14%;
  margin-left: 42%;
}

.loading {
  width: 75% !important;
  margin-left: 2%;
}

.close {
  position: absolute;
  font-size: 35px;
  top: 5%;
  left: 90%;
}

.close:hover {
  background-color: #ccc;
  border-radius: 60%;
}

.btn {
  padding: 14px 22px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  left: 2%;
  background: #a1a1a1b5 !important;
  /* azul Meta */
  color: #fff;
  font-weight: 600;
  bottom: -4%;
}

.btn:hover {
  background-color: #165dbb;
}

.btn:active {
  transform: translateY(1px);
}
</style>
