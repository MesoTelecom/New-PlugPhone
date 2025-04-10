<template>
  <v-app>

    <SideBar />
    <v-container class="pa-4 text-left">
      <v-row class="fill-height" align="left" justify="left">
        <template v-for="(item, i) in items">
          <v-col :key="i" cols="12" md="4">
            <v-hover v-slot="{ hover }">
              <router-link :to=item.url class="router">
                <v-card :elevation="hover ? 12 : 2" :class="{ 'on-hover': hover }">
                  <v-img :src="item.img" height="225px" class="imagem">

                  </v-img>
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
//import verificaAcesso from "../acess/verificaAcessoEspecialistaMixin"
export default {
  ///mixins: [verificaAcesso],
  data: () => ({

    items: [
      {
        title: 'TMA WhatsApp',
        text: 'Tempo de Atendimento WhatsApp',
        img: require('@/assets/TMAZAP.png'),
        url: '/tmazap'
      },
      {
        title: 'Detalhes WhatsApp',
        text: 'Detalhes WhatsApp',
        img: require('@/assets/detalheszap.png'),
        url: '/detalhezap'
      },

      {
        title: 'TMR',
        text: 'Tempo Médio de Resposta',
        img: require('@/assets/TMRZAP.png'),
        url: '/tmr'
      },

      {
        title: 'Interação WhatsApp',
        text: 'Interação WhatsApp',
        img: require('@/assets/interacaozap.png'),
        url: '/grafico'
      },

      console.log('xoxotto')
    ],
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