<template>
  <v-app>
    <Navbar2 />
    <v-container class="pa-4 text-center">
      <v-row class="fill-height" align="center" justify="center">
        <template v-for="(item, i) in items">
          <v-col :key="i" cols="12" md="4">
            <v-hover v-slot="{ hover }">
              <router-link :to=item.url class="router">
                <v-card :elevation="hover ? 12 : 2" :class="{ 'on-hover': hover }">
                  <v-img :src="item.img" height="225px" class="imagem">
                    <v-card-title class="text-h6 white--text">
                      <v-row class="fill-height flex-column" justify="space-between">
                        <p class="mt-4 subheading text-left">
                          <b> {{ item.title }}</b>
                        </p>

                        <div>
                          <p class="ma-0 text-body-1 font-weight-bold font-italic text-left">
                            <b> {{ item.text }}</b>
                          </p>
                          <p class="text-caption font-weight-medium font-italic text-left">
                            <b> {{ item.subtext }}</b>
                          </p>
                        </div>

                        <div class="align-self-center">
                          <v-btn v-for="(icon, index) in icons" :key="index" :class="{ 'show-btns': hover }"
                            :color="transparent" icon>
                            <v-icon :class="{ 'show-btns': hover }" :color="transparent">
                              {{ icon }}
                            </v-icon>
                          </v-btn>
                        </div>
                      </v-row>
                    </v-card-title>
                  </v-img>
                </v-card>
              </router-link>
            </v-hover>
          </v-col>
        </template>
      </v-row>
    </v-container>
    <Footer />
  </v-app>
</template>

<script>
import Navbar2 from '../components/Navbar2.vue'
import Footer from '../components/footer.vue'

export default {
  data: () => ({
    items: [
      {
        title: 'Consulta de Estoque',
        text: 'Clientes que aguardam resposta',
        img: 'https://images.pexels.com/photos/3757226/pexels-photo-3757226.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        url: '/estoquevendedor'
      },
      {
        title: 'Painel de Teleatendimento',
        text: `Painel para operar chamadas`,
        img: 'https://images.pexels.com/photos/3727464/pexels-photo-3727464.jpeg?cs=srgb&dl=pexels-anna-shvets-3727464.jpg&fm=jpg',
        url: '/loginagente'
      },

    ],
    transparent: 'rgba(255, 255, 255, 0)',
  }),
  components: {
    Navbar2,
    Footer

    //Table
  },
}
</script>
<style scoped>
.v-card {

  transition: opacity .4s ease-in-out;
}

.imagem {
  box-shadow: inset 0 0 0 1000px rgba(0, 0, 0, 0.356) !important;
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

.v-card:not(.on-hover) {
  opacity: 0.6;
}
</style>