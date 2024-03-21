onactivate = (event) => {
  globalThis.clients.claim()
}

oninstall = (event) => {
  globalThis.skipWaiting()
}

onfetch = (event) => {
  event.respondWith(fetch('/icon.png'))
}
