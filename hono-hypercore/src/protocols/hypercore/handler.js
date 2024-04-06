import RandomAccessMemory from 'npm:random-access-memory'
import { Buffer } from 'socket:buffer'
import Hypercore from 'npm:hypercore'
import { Hono } from 'npm:hono'

/**
 * `RandomAccessMemory` storage instances for the session.
 * @type {object}
 */
const storage = {}

/**
 * The Hono application
 * @type {Hono}
 */
const app = new Hono({ getPath: (request) => new URL(request.url).pathname })

/**
 * The `Hypercore` feed for this worker.
 * @type {Hypercore?}
 */
let feed = null

/**
 * GET '/get/:index'
 * Get a block at `index`.
 */
app.get('/get/:index', async (c) => {
  const index = parseInt(c.req.param('index'))

  if (index >= feed.length) {
    return new Response('', { status: 404 })
  }

  const data = await feed.get(index)
  return c.body(data)
})

/**
 * POST '/append'
 * Append a block to the feed.
 */
app.post('/append', async (c) => {
  const data = Buffer.from(await c.req.arrayBuffer())
  const result = await feed.append(data)

  for (const key in storage) {
    c.env.storage = {
      // @ts-ignore
      ...c.env.storage,
      [key]: new Uint8Array(storage[key].toBuffer().buffer)
    }
  }

  return c.json(result)
})

/**
 * The request handler entry.
 * @param {Request} request
 * @param {object} env
 * @param {import('socket:service-worker/context').Context} ctx
 * @return {Promise<Response?>}
 */
export default async function (request, env, ctx) {
  if (!env.storage) {
    env.storage = {}
  }

  if (!feed) {
    feed = new Hypercore((filename) => {
      if (env.storage[filename]) {
        storage[filename] = new RandomAccessMemory(env.storage[filename])
      }

      if (!storage[filename]) {
        storage[filename] = new RandomAccessMemory()
      }

      return storage[filename]
    })

    await feed.ready()
  }

  const response = await app.fetch(request, env, ctx)

  if (response) {
    response.headers.set('cache-control', 'no-cache')
  }

  return response
}
