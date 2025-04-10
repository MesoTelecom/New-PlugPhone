<template>
  <v-app>

    <SideBar />
    <v-container class="pa-4 text-center">
      <v-row class="fill-height" align="center" justify="center">
        <template v-for="(item, i) in items">
          <v-col :key="i" cols="12" md="4">
            <v-hover v-slot="{ hover }">
              <router-link :to=item.url class="router">
                <v-card :elevation="hover ? 12 : 2" :class="{ 'on-hover': hover }">
                  <v-img :src="item.img" height="225px" class="imagem" />

                </v-card>
              </router-link>
            </v-hover>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import SideBar from "../components/SideBar";
// import verificaAcesso from "../acess/verificaAcessoEspecialistaMixin"
export default {
  //  mixins: [verificaAcesso],
  data: () => ({
    items: [
      {
        title: 'Tma Sainte',
        text: 'Tempo de Atendimento',
        img: require('@/assets/TMA.jpg'),
        url: '/tmasainte'
      },
      {
        title: 'Tme Sainte',
        text: 'Tempo de Atendimento',
        img: require('@/assets/TME.jpg'),
        url: '/tmesainte'
      },
      {
        title: 'Detalhe Sainte',
        text: 'Tempo de Atendimento',
        img: require('@/assets/detalhes.jpg'),
        url: '/detalhessainte'
      },
      {
        title: 'Service Sainte',
        text: 'Tempo de Atendimento',
        img: require('@/assets/service.jpg'),
        url: '/servicesainte'
      },
    ],
    icons: ["mdi-heart", "mdi-star", "mdi-square"],
    transparent: 'rgba(255, 255, 255, 0)',
  }),
  components: {
    SideBar,
    //Table
  },
}
</script>
<style scoped>
.v-card {}

.imagem {
  background-color: #a1c0d1;
}

.mt-4 {
  background-color: rgba(0, 0, 0, 0.356);
  color: rgb(255, 255, 255) !important
}

.ma-0 {
  background-color: rgba(0, 0, 0, 0.356);
  color: rgb(255, 255, 255) !important
}

.router {
  text-decoration: none;
}

.v-card:hover {
  opacity: 0.6;
}

#menu {
  background-color: #a1c0d1;
}
</style>