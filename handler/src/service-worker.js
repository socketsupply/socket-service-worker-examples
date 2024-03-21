import { Counter } from './models/counter.js'
import http from 'socket:http'

/**
 * A container for route mappings
 */
class Routes {
  all = new Map()
  get = new Map()
  put = new Map()
  post  = new Map()
  delete = new Map()
}

/**
 * A simple router for mapping method/route pairs to callbacks
 */
class Router {
  routes = new Routes()

  /**
   * Installs a method/route mapping to a callback
   * @param {string} method
   * @param {string} route
   * @param {function(Request, object, object, object)} callback
   */
  use (method, route, callback) {
    method = method.toLowerCase()

    if (method === '*') {
      this.routes.all.set(route, callback)
    } else {
      this.routes[method].set(route, callback)
    }
  }

  /**
   * Installs a GET route calback
   * @param {string} route
   * @param {function(Request, object, object, object)} callback
   */
  get (route, callback) {
    return this.use('GET', route, callback)
  }

  /**
   * Installs a PUT route calback
   * @param {string} route
   * @param {function(Request, object, object, object)} callback
   */
  put (route, callback) {
    return this.use('PUT', route, callback)
  }

  /**
   * Installs a POST route calback
   * @param {string} route
   * @param {function(Request, object, object, object)} callback
   */
  post (route, callback) {
    return this.use('POST', route, callback)
  }

  /**
   * Installs a DELETE route calback
   * @param {string} route
   * @param {function(Request, object, object, object)} callback
   */
  delete (route, callback) {
    return this.use('DELETE', route, callback)
  }

  /**
   * Routes request to route based on method and route pattern.
   * @param {Request} request
   * @param {object} env
   * @param {object} ctx
   * @return {Response|undefined}
   */
  route (request, env, ctx) {
    const method = request.method.toLowerCase()
    const url = new URL(request.url)

    try {
      for (const [route, callback] of this.routes.all.entries()) {
        const pattern = new URLPattern({ pathname: route })
        const match = pattern.exec(url)
        if (match) {
          return callback(request, env, ctx, match.pathname.groups ?? {})
        }
      }

      if (method in this.routes) {
        for (const [route, callback] of this.routes[method].entries()) {
          const pattern = new URLPattern({ pathname: route })
          const match = pattern.exec(url)
          if (match) {
            return callback(request, env, ctx, match.pathname.groups ?? {})
          }
        }
      }
    } catch (err) {
      console.log(err)
      return new Response(err.stack, {
        status: 500
      })
    }

    return
  }
}

/**
 * Service worker handler router.
 * @type {Router}
 */
const router = new Router()

/**
 * Gets the '/counter' page
 */
router.get('/counter', (request, env, ctx) => {
  const url = new URL(request.url)

  // create `counters` object if it doesn't exist already
  if (!env.counters) {
    env.counters = {}
  }

  return fetch(`/pages/counter.html${url.search}`)
})

/**
 * Gets a counter by ID.
 */
router.get('/counter/:id', (request, env, ctx, params) => {
  // bad request if `env.counters` doesn't exist
  if (!env.counters) {
    return new Response(http.STATUS_CODES[400], { status: 400 })
  }

  if (!env.counters[params.id]) {
    return Response.json({ message: 'Counter not found' }, { status: 404 })
  }

  return Response.json(Counter.from(env, params))
})

/**
 * Creates a new counter
 */
router.post('/counter', async (request, env, ctx) => {
  if (!env.counters) {
    env.counters = {}
  }

  return Response.json(Counter.create(env))
})

/**
 * Updates a counter value
 */
router.put('/counter/:id', async (request, env, ctx, params) => {
  const counter = Counter.from(env, params)
  const url = new URL(request.url)

  if (!counter.exists) {
    return Response.json({ message: 'Counter not found' }, { status: 404 })
  }

  let value = parseInt(url.searchParams.get('value'))

  if (!Number.isFinite(value)) {
    try {
      const json = await request.json()
      value = json.value
    } catch (err) {
      return Response.json({ message: err.message }, { status: 400 })
    }
  }

  try {
    counter.value = value
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 })
  }

  return Response.json(counter)
})

/**
 * Deletes a counter by ID
 */
router.delete('/counter/:id', async (request, env, ctx) => {
  const counter = Counter.from(env, params.id)

  if (!counter.exists) {
    return Response.json({ message: 'Counter not found' }, { status: 404 })
  }

  counter.delete()
  return Response.json({})
})

/**
 * Gets a list of all known counters.
 */
router.get('/counters', (request, env, ctx, params) => {
  return Response.json(Counter.all(env))
})

/**
 * Delete all known counts
 */
router.delete('/counters', (request, env, ctx, params) => {
  Counter.clear(env)
  return Response.json({})
})

/**
 * The service worker handler
 */
export default {
  async fetch (request, env, ctx) {
    const response = await router.route(request, env, ctx)

    if (response) {
      response.headers.set('cache-control', 'no-cache')
    }

    return response
  }
}
