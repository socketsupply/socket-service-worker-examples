navigator.serviceWorker.startMessages()

navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data?.notification) {
    console.log(event.data.notification)
  }
})

async function createNotification (options) {
  const response = await fetch('/notification', {
    method: 'POST',
    body: JSON.stringify(options)
  })

  return await response.json()
}

globalThis.createNotification = createNotification

const notification = await createNotification({
  title: 'hello!'
})

console.log({ notification })
