<template>
  <v-app>

    <SideBar />
    <v-container class="pa-4 text-center">
      <v-row class="fill-height" align="center" justify="center">
        <template v-for="(item, i) in items">
          <v-col :key="i" cols="12" md="4">
            <v-hover v-slot="{ hover }">
              <router-link :to=item.url class="router">
                <v-card :elevation="hover ? 12 : 2">
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
export default {
  data: () => ({
    items: [
      {
        title: 'TMA',
        text: 'Tempo de Atendimento',
        img: require('@/assets/TMA.jpg'),
        url: '/tma'
      },
      {
        title: 'TME',
        text: `Tempo de Espera`,
        img: require('@/assets/TME.jpg'),
        url: '/tme'
      },
      {
        title: 'Pausa',
        text: 'Pausa dos Agentes',
        img: require('@/assets/PAUSA.jpg'),
        url: '/pausa'
      },
      {
        title: 'Service(%)',
        text: 'Serviço do Agente',
        img: require('@/assets/service.jpg'),
        url: '/servico'
      },
      {
        title: 'Conexão do Agente',
        text: `Conexão do Agente`,
        img: require('@/assets/conexao.jpg'),
        url: '/conexao'
      },
      {
        title: 'Detalhes de Ligações',
        text: 'Detalhes das Chamadas do Callcenter',
        img: require('@/assets/detalhes.jpg'),
        url: '/detalhes'
      },
      {
        title: 'Filas de Atendimento',
        text: 'Filas Utilizadas no Callcenter',
        img: require('@/assets/filas.jpg'),
        url: '/filas'
      },
      {
        title: 'Troncos Usados por Hora',
        text: `Troncos Usados pelo CallCenter`,
        img: require('@/assets/troncos.jpg'),
        url: '/troncos'
      },
      {
        title: 'Fluxo de Chamadas por Hora',
        text: 'Chamadas em Cada Hora',
        img: require('@/assets/fluxo.jpg'),
        url: '/fluxo'
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