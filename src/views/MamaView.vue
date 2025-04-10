<template>
  <div>
    <button @click="launchWhatsAppSignup"
      style="background-color: #1877f2; border: 0; border-radius: 4px; color: #fff; cursor: pointer; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: bold; height: 40px; padding: 0 24px;">
      Login with Facebook
    </button>
  </div>
</template>

<script>
/* global FB, fbq */  // Declaração de variáveis globais para evitar erros no linter

export default {
  mounted() {
    window.fbAsyncInit = function () {
      // Configuração e inicialização do SDK JavaScript
      FB.init({
        appId: '7397712986921789', // ID do aplicativo do Facebook
        cookie: true, // habilitar cookies
        xfbml: true, // parsear plugins sociais nesta página
        version: 'v20.0' // Versão da Graph API
      });
    };

    // Carregar o SDK JavaScript de forma assíncrona
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Carregar o Facebook Pixel de forma assíncrona
    (function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js'));

    fbq('init', 'your-pixel-id'); // Substitua 'your-pixel-id' pelo seu ID do Pixel
    fbq('track', 'PageView');
  },
  methods: {
    launchWhatsAppSignup() {
      // Código de rastreamento de conversão
      if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'WhatsAppOnboardingStart', {
          appId: '7397712986921789',
          feature: 'whatsapp_embedded_signup'
        });
      } else {
        console.warn('fbq não está definido.');
      }

      // Iniciar login do Facebook
      FB.login(function (response) {
        if (response.authResponse) {
          // const code = response.authResponse.code; // Remova se não for usar
          // O código retornado deve ser transmitido para o backend,
          // que realizará uma chamada de servidor para servidor para obter um token de acesso
        } else {
          console.log('Usuário cancelou o login ou não autorizou completamente.');
        }
      }, {
        config_id: '473643052180048', // ID da configuração
        response_type: 'code', // deve ser configurado como 'code' para token de acesso de usuário do sistema
        override_default_response_type: true, // quando true, qualquer tipo de resposta passado em "response_type" terá precedência sobre os tipos padrão
        extras: {
          setup: {
            // Dados pré-preenchidos podem ser inseridos aqui
          }
        }
      });
    }
  }
}
</script>
