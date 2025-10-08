<template>
  <button @click="send">Enviar Notificação</button>
</template>

<script>
import { triggerNotification } from '../push';

export default {
  data() {
    return {
      subscription: null
    };
  },
  async created() {
  },
  methods: {
    async send() {
      if (this.subscription) {
        await triggerNotification(this.subscription);
      } else {
        alert('Assinatura não encontrada');
      }
    }
  }
};
</script>
