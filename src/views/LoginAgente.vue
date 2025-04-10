<template>
   
   <v-container class = "fill-height" fluid>
              <v-card-text class="mt-12" id="centralizado">
                     <br>
                     <br>
                     <br>
                     <br>
                    <!--text--accent-NUMBER altera a cor da letra do texto-->
                    <h1 class="text-center display-1">Seja bem-vindo ao PlugPhone Cloud</h1>
                     <!--div que trata botões de Facebook, Google e Linkedin-->
                     <br>
                 
                    <br>
                    <v-form style="width: 53%;     margin-left: 23%;">
                      <v-text-field
                
                label="Digite seu código pin"
                name="Email"
                type="text"
                color="#ffffff"
              />

              <v-select
                :items="Selfila"
                label="Informar o número da fila"
                
                class="filtro"
              ></v-select>

              <v-select
                :items="items"
                label="Informar o número da ramal"
                
              ></v-select>
                    </v-form>
                  </v-card-text>
                     <div class = "text-center" style="width: 100%">
              <v-btn rounded  @click="exibe" color="#61a5e8" class="centralizado" style="color: white;">Login</v-btn>
               
                 

                  </div>
      </v-container>


</template>

<script>
  export default {
    name: 'HomeView',

    components: {
   
    },
  }
</script>

<style  scoped>

#centralizado{
  margin-left: 3%;
}

h1{

  color: #595E71;
}
 
#fill-height{

  background-color: #243e57;
}

.v-text-field{

  width: 50%;
  margin-left: 24%;
}

.v-btn{

margin-left: 0%;

}
.text-center{

color: #595E71;
position: center;
}

.text-center1{

color: #595E71;
position: center;
background-color: transparent;
}


.cardanna{

 /* background-image: url(../assets/modelo.jpg);*/
 background-repeat: no-repeat;
  background-size:0%;
  


}
.col-md-4{
  color: transparent;
}
.v-btn__content{

  position: center;
}


.show-enter-active,
.show-leave-enter {
    transform: translateX(0);
    transition: all .3s linear;
}
.show-enter,
.show-leave-to {
    transform: translateX(100%);
}

.fill-height{




 background-repeat: no-repeat;
  background-size:100%;

 /* box-shadow: inset 0 0 0 1000px rgba(4, 81, 132, 0.85);*/
background-image: url(../assets/mesofundo.jpg);
padding: 15px;
background-repeat: no-repeat;
background-size: cover;
background-position: center;


}

 .text-center:hover, .col-md-4:hover{

background-color: transparent;


}
</style>