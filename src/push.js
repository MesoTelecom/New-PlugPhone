// Escuta mensagens vindas do Service Worker (ex: som com app aberto)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "NEW_PUSH") {
      // Toca som
      const audio = new Audio("/notify.wav");
      audio.play().catch((err) => {
        console.warn("🔇 Erro ao tocar som:", err);
      });

      // (Opcional) Log visual
      console.log("🔔 Nova notificação recebida:", event.data.title);
    }
  });
}

export async function askPermissionAndSubscribe() {
  // Verifica se o navegador suporta Notification e SW
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

  // Pede permissão
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  // Registra o Service Worker
  const registration = await navigator.serviceWorker.register('/service-worker.js');
  console.log("✅ Service Worker registrado");

  // Força o cancelamento de inscrição anterior (caso tenha sido feita com chave antiga)
  await registration.pushManager.getSubscription()
    .then(sub => {
      if (sub) {
        console.log("♻️ Cancelando subscription anterior...");
        return sub.unsubscribe();
      }
    })
    .catch(err => console.warn("⚠️ Erro ao cancelar inscrição:", err));

  // Busca a chave pública no servidor
  const resp = await fetch('https://meso.plugphone.cloud:3333/public_key');
  const data = await resp.json();
  const publicKey = data.publicKey;
  const convertedKey = urlBase64ToUint8Array(publicKey);

  // Cria nova subscription
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey
  });

  console.log("📬 Nova subscription criada:", JSON.stringify(subscription));

  let usuario = JSON.parse(localStorage.getItem('usu'))

  console.log("Meu usuario",usuario.usuario, usuario.tipo)

  // Envia para o backend
  await fetch('https://meso.plugphone.cloud:3333/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription : subscription, usuario : usuario.usuario, tipo: usuario.tipo })
  });

  return subscription;
}

export async function triggerNotification(subscription) {
  console.log("Vou plantar aqui",JSON.stringify(subscription))
    await fetch('https://meso.plugphone.cloud:3333/send-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription })
  });
}

// Conversor da chave VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}