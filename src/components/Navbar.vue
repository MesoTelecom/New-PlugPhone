<template>
  <v-card class="overflow-hidden" style="
      margin-left: -250px;
      max-width: 1000% !important;
      margin-top: -80px;
      backgroundcolor: red;
    ">
    <v-app-bar absolute color="rgb(40 85 111)" dark hide-on-scroll prominent>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title style="margin-left: 48%">PlugPhone Supervisor
        <v-btn v-on:click="$vuetify.theme.dark = !$vuetify.theme.dark" class="tema">
          {{ $vuetify.theme.dark ? 'Light' : 'Dark' }}
        </v-btn>
      </v-toolbar-title>
      <img src="../assets/plugbranco3.png" class="plug" />
    </v-app-bar>

    <v-container style="height: 130px; margin-left: -16%; background-color: "></v-container>
  </v-card>
</template>
<script>

export default {
  name: "NavBar",
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
  }
}
</script>

<style>
.plug {
  left: -298px !important;
  width: 59px !important;
  bottom: -56% !important;
  position: relative !important;
}

.tema {
  left: 94% !important;
  widows: 8% !important;
  text-decoration: bold !important;
  text-decoration: underline !important;
  position: fixed !important;
  background-color: #243e57 !important;
  color: white !important;
}
</style>