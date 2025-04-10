<template>
  <v-footer
    color="#28556f"
    padless
    
  >
    <v-row
      justify="center"
      no-gutters
      
    >
      
      <v-col
        class=" py-4 text-center white--text"
        cols="12"
                
      >
      
        {{ new Date().getFullYear() }} — <strong>PlugPhone®</strong>
      </v-col>
    </v-row>
  </v-footer>
</template>
<style scoped>
.primary.lighten-2{
    background-color: #28556f !important;
}
.py-4 text-center{
      background-color: #28556f !important;

}
</style>
<script>
  export default {
    name: 'HelloWorld',

  }
</script>
