/* global URLPattern */

/**
 * The service worker handler
 */
export default {
  /**
   * @param {Request} request
   * @return {Promise<Response?>}
   */
  async fetch (request) {
    const url = new URL(request.url)
    // @ts-ignore
    const pattern = new URLPattern({ pathname: '/storage/:type/:key' })
    const route = pattern.exec(url)

    /** @type {Storage?} */
    let storage = null
    /** @type {Response?} */
    let response = null

    if (!route) {
      return null // 404 - invalid route
    }

    const { type, key } = route.pathname.groups

    if (type === 'local') {
      storage = globalThis.localStorage
    } else if (type === 'memory') {
      storage = globalThis.memoryStorage
    } else if (type === 'session') {
      storage = globalThis.sessionStorage
    }

    if (!storage) {
      return null
    }

    if (request.method === 'POST' ||  request.method === 'PUT') {
      const value = await request.text()
      storage.setItem(key, value)
      // @ts-ignore
      response = Response.json({ key, value })
    } else if (storage.hasItem(key)) {
      if (request.method === 'GET') {
        response = new Response(storage.getItem(key))
      } else if (request.method === 'DELETE') {
        if (storage.hasItem(key)) {
          storage.removeItem(key)
          // @ts-ignore
          response = Response.json({ storage: type, key, })
        } else {
          // @ts-ignore
          response = Response.json({ storage: type, key, }, { status: 404 })
        }
      }
    }

    if (response) {
      response.headers.set('cache-control', 'no-cache')
    }

    return response
  }
}
