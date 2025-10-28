<template>
  <div class="container">
    <h2>WhatsApp Business - Embedded Signup</h2>
    <button @click="openEmbeddedSignup" class="btn">
      Connect WhatsApp Account
    </button>
  </div>
</template>

<script>
export default {
  name: "EmbeddedSignup",
  methods: {
    openEmbeddedSignup() {
      const appId = "7397712986921789";
      const configId = "473643052180048";

      const signupUrl = `https://business.facebook.com/messaging/whatsapp/onboard/?app_id=${appId}&config_id=${configId}`;

      // Abre o fluxo do EBS em um popup controlado
      window.open(signupUrl, "EBSWindow", "width=1000,height=800,scrollbars=yes");
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  margin-top: 100px;
}

.btn {
  background-color: #075e54;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.btn:hover {
  background-color: #128C7E;
}
</style>
