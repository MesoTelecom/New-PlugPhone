import '@fortawesome/fontawesome-free/css/all.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
//import Gchart from 'vue-google-charts';

//V//ue.use(Gchart)
import VueJsonToCsv from 'vue-json-to-csv';
Vue.use(VueJsonToCsv);

//Vue.component('downloadCsv', JsonCSV)

Vue.use(Vuetify);

export default new Vuetify({

icons: {

        iconfont: 'md' || 'fa'
},

});

/** 
 * Como add o vuetify e sua biblioteca de Icones para o PlugPhone? 
 * vue add vuetify
npm install material-design-icons-iconfont -D
npm install @fortawesome/fontawesome-free -D */
