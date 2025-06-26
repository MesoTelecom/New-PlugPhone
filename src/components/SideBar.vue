<template>
  <nav>
    <v-navigation-drawer app dark color="rgb( 40, 85, 111)" permanent expand-on-hover>
      <v-list>

        <v-img src="../assets/plugbranco3.png"></v-img>

        <v-list-item link>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              PlugPhone Supervisor
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list nav dense>
        <v-list-item to="/dashboard" link>
          <v-list-item-icon>
            <v-icon>mdi-home-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <v-list-item to="/chat" link>
          <v-list-item-icon>
            <v-icon>mdi-whatsapp</v-icon>
          </v-list-item-icon>
          <v-list-item-title>WhatsApp Chat</v-list-item-title>
        </v-list-item>
        <!--
        <v-list-item to="/novodashboard" link>
          <v-list-item-icon>
            <v-icon>mdi-home-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Novo Dashboard</v-list-item-title>
        </v-list-item>
-->
        <v-list-item to="/menusupervisor" link>
          <v-list-item-icon>
            <v-icon>mdi-chart-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Relatório Entrante</v-list-item-title>
        </v-list-item>

        <v-list-item to="/menusupervisorsainte" link>
          <v-list-item-icon>
            <v-icon>mdi-exit-to-app</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Relatório Sainte</v-list-item-title>
        </v-list-item>


        <v-list-item to="/menuwhastapp" link>
          <v-list-item-icon>
            <v-icon>mdi-wechat</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Relatórios WhatsApp</v-list-item-title>
        </v-list-item>

        <v-list-item to="/menurealtime" link>
          <v-list-item-icon>
            <v-icon>mdi-monitor-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Real Time</v-list-item-title>
        </v-list-item>

        <v-list-item to="/uploadcsv" link>
          <v-list-item-icon>
            <v-icon>mdi-upload</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Upload CSV</v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-icon>
            <a href="https://meso.plugphone.cloud/index.php?menu=monitoring" style="color: white;">
              <v-icon>mdi-record-rec</v-icon>
            </a>
          </v-list-item-icon>
          <v-list-item-title>
            <a href="https://meso.plugphone.cloud/index.php?menu=monitoring"
              style="color: white; text-decoration: none;">
              Gravação de Sistema
            </a>
          </v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-icon>
            <a href="https://nuvem.mesotelecom.com.br:8080/index.php/apps/spreed/" style="color: white;">
              <v-icon>mdi-wechat</v-icon>
            </a>
          </v-list-item-icon>
          <v-list-item-title>
            <a href="https://nuvem.mesotelecom.com.br:8080/index.php/apps/spreed/"
              style="color: white; text-decoration: none;">
              Team Chat
            </a>
          </v-list-item-title>
        </v-list-item>
        <v-list-item to="/cadastrousuario" link>
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Cadastro de Usuários</v-list-item-title>
        </v-list-item>

      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="blue" @click="logout">
            <v-icon left>
              mdi-logout
            </v-icon>
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
  </nav>
</template>

<script>

export default {
  name: "SideBar",
  data: () => ({

    error: false,
  }),
  methods: {

    async logout() {
      try {
        this.error = false;

        localStorage.removeItem("jwt");
        this.$router.push("/");

        // console.log(res.data.dados[0]);
      } catch (e) {
        window.alert('Não deu!')
      }
    },
  },

};

</script>

<style></style>
