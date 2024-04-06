import { Hono } from 'npm:hono'

console.log ({ Hono })

/**
 * The Hono application
 * @type {Hono}
 */
const app = new Hono({ getPath:  (request) => new URL(request.url).pathname })

/**
 * GET '/get/:index'
 * Get a block at `index`.
 */
app.get('/hello-world.json', async (c) => {
  return c.json({
    hello: 'world'
  })
})

/**
 * The request handler entry.
 * @param {Request} request
 * @param {object} env
 * @param {import('socket:service-worker/contenxt.js').Context} context
 * @return {Response?}
 */
export default async function (request, env, ctx) {
  return app.fetch(request, env, ctx)
}
