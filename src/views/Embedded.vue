<template>
  <div id="app">
    <div id="fb-root"></div>
    <div class="fb-login-button" data-width="" data-size="large" data-button-type="continue_with" data-layout="default"
      data-auto-logout-link="false" data-use-continue-as="true">
    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  mounted() {
    // injeta o SDK dinamicamente
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.onload = () => {
        // só roda fbAsyncInit DEPOIS que o script carregar
        window.fbAsyncInit = () => {
          if (window.FB) {
            window.FB.init({
              appId: "7397712986921789",
              autoLogAppEvents: true,
              xfbml: true,
              version: "v23.0",
            });
            console.log("✅ Facebook SDK carregado e inicializado!");
          } else {
            console.error("❌ FB ainda não disponível!");
          }
        };
      };
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  },
};
</script>

<style scoped></style>
