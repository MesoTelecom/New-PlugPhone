<template>
    <v-app>
        <Navbar />
    <br>
        <SideBar />
       
        <div class="dash">

           <br>

           <br>
           <br>
            <v-col cols="12">
                <v-row>
                    <v-card>
                    <div>
                        <Linha />
                    </div>
                </v-card>
<br>
                <v-card>
                    <div>
                        <Barra />
                    </div>
                </v-card>
               
                </v-row>
                <br>
                <div>
                    <br>
                   <v-card>
                    <v-col cols="12" md="6">
                        <Pizza />
                    </v-col>
                </v-card>
                </div>
            </v-col>
        </div>
    
    </v-app>
</template>

<script>


import Barra from "../components/Barra.vue";
import Linha from "../components/Linha.vue";
import Pizza from "../components/Pizza.vue";
import Navbar from "../components/Navbar.vue";
import SideBar from "../components/SideBar.vue"
//import Navbar from "../components/Navbar.vue"

export default {
    data: () => ({
        idsetinterval: null,
    }),
    async mounted() {
        
    },
    components: {
      
        Barra,
        Linha,
     
        Pizza,
        SideBar,
        Navbar,
    }
}

</script>

<style scoped>
.dash {
    margin-left: 5% !important;
}
</style>