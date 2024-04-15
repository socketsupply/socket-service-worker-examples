navigator.serviceWorker.startMessages()

navigator.serviceWorker.ready.then((registration) => {
  // the service worker will echo this message back to the client
  registration.active?.postMessage('hello service worker')
})

navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data?.request) {
    const url = new URL(event.data.request.url)
    console.log(url.pathname) // '/hello-world'
  } else {
    console.log(event.data) // 'hello service worker'
  }
})

fetch('/hello-world').catch((err) => globalThis.reportError(err))
