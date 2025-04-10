import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    usuario: {
      usuario: '',
      pin: '',
      tipo: '',
      tokenFirebase: '',
    },
    gravacaoAtual: null,
    tokenFirebase: null,

    token: null,
    logado: '',
    adm: false

  },
  getters: {
  },
  mutations: {
    setUsuario(state, pay) {
      state.usuario = pay

    },
    setGravacaoAtual(state, pay) {
      state.gravacaoAtual = pay
    }
  },
  actions: {
    insereUsuario(state, pay) {
      state.commit('setUsuario', pay)
    },
    insereGravacaoAtual(state, pay) {
      state.commit("setGravacaoAtual", pay)
    }
  },
  modules: {
  }
})