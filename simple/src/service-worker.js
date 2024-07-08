onactivate = (event) => {
  globalThis.clients.claim()
}

oninstall = (event) => {
  globalThis.skipWaiting()
}

onfetch = async (event) => {
  event.respondWith(fetch('/icon.png', {
    method: event.request.method,
    headers: event.request.headers
  }))
}
