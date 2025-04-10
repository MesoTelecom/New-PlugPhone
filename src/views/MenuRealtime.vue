<template>
  <v-app>

    <SideBar />
    <v-container class="pa-4 text-center">
      <v-row class="fill-height" align="center" justify="center">
        <template v-for="(item, i) in items">

          <v-col link :key="i" cols="12" md="4">
            <link rel="stylesheet" href="/DashboardPrincipal">
            <router-link :to=item.url class="router">
              <v-hover v-slot="{ hover }">
                <v-card :elevation="hover ? 12 : 2" :class="{ 'on-hover': hover }">

                  <v-img :src="item.img" :href="'/DashboardPrincipal'" height="225px" />

                </v-card>
              </v-hover>
            </router-link>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>


import SideBar from "../components/SideBar";
export default {
  data: () => ({
    items: [
      {
        title: 'Real Time Agentes',
        text: 'Monitoramento dos Operadores em Tempo Real',
        img: require('@/assets/RealTimeAgents.jpg'),
        url: '/realoperador'

      },
      {
        title: 'Real Time Solicitantes',
        text: `Monitoramento das Chamadas de Entrada em Tempo Teal`,
        img: require('@/assets/realtimeCC.jpg'),
        url: '/realentrada'
      },
      {
        title: 'Real Time CallCenter',
        text: 'Monitoramento das Filas em Tempo Real',
        img: require('@/assets/realtimeInbound.jpg'),
        url: '/campanhafila'
      },


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