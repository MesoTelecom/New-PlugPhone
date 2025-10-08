// public/service-worker.js
console.log("✅ Service Worker carregado");

self.addEventListener("install", (event) => {
  console.log("SW instalado!",event);
});

self.addEventListener("activate", (event) => {
  console.log("SW ativado!",event);
});

console.log("🛠️ Service Worker ativado");

self.addEventListener("push", (event) => {
  const payload = event.data?.json() || {};

  const options = {
    body: payload.body || "Você tem uma nova mensagem!",
    icon: payload.icon || "/icone.png",
    tag: "plugphone",
    renotify: true
  };

  // Exibe notificação nativa
  event.waitUntil(
    self.registration.showNotification(payload.title || "Nova Notificação", options)
  );

  // Envia mensagem pro app (para tocar som com aba aberta)
  self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      client.postMessage({
        type: "NEW_PUSH",
        title: payload.title,
        body: payload.body
      });
    }
  });
});



