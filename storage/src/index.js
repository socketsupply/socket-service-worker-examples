class RemoteStorage {
  type = null
  constructor (type) {
    this.type = type
  }

  async get (key) {
    const response = await fetch(`/storage/${this.type}/${key}`)

    if (response.ok) {
      return await response.text()
    }

    return null
  }

  async set (key, value) {
    await fetch(`/storage/${this.type}/${key}`, {
      method: 'POST',
      body: value
    })
  }

  async remove (key) {
    await fetch(`/storage/${this.type}/${key}`, {
      method: 'DELETE'
    })
  }
}

const storage = {
  local: new RemoteStorage('local'),
  memory: new RemoteStorage('memory'),
  session: new RemoteStorage('session')
}

// @ts-ignore
globalThis.storage = storage

// @ts-ignore
await storage.local.set('key', 'value')
// @ts-ignore
console.log(await storage.local.get('key'))

// @ts-ignore
await storage.session.set('key', 'value')
// @ts-ignore
console.log(await storage.session.get('key'))

// @ts-ignore
await storage.memory.set('key', 'value')
// @ts-ignore
console.log(await storage.memory.get('key'))
