<template>
  <v-card class="overflow-hidden" style="margin-left: -250px; max-width: 1000% !important;margin-top: -72px;">
    <v-app-bar
      absolute
      color="rgb(40 85 111)"
      dark
      hide-on-scroll
      prominent
      
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-img src="../assets/plugbranco3.png" style="width: 20%;"></v-img>
      <v-toolbar-title>PlugPhone - Vendedores Accioly Maringa</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>
   
      <v-container style="height: 130px; margin-left: -16%;"></v-container>
    
  </v-card>
</template>

<script>
  export default {
    name: 'HelloWorld',

  }
</script>
