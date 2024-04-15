/**
 * A service worker handler interface container.
 */
class Handler {
  /**
   * This method is called when the service worker is activate.
   */
  async activate () {
    globalThis.clients.claim()
    globalThis.addEventListener('message', this.onMessage)
  }

  /**
   * Service worker request handler that notifies the requesting client of the
   * currently requested URL always responding with an empty response body.
   * @param {Request} request
   * @param {object} env
   * @param {import('socket:service-worker').Context} ctx
   * @return {Promise<Response>}
   */
  async fetch (request, env, ctx) {
    const client = await ctx.client()

    if (client) {
      // notify current client of request URL
      client.postMessage({
        request: { url: request.url }
      })
    }

    return new Response('', { status: 200 })
  }

  /**
   * Handles incoming `ExtendableMessageEvent` instances dispatched globally
   * triggered from a `serviceWorker.postMessage()` call in a client
   * @param {import('socket:service-worker/events.js').ExtendableMessageEvent} event
   */
  onMessage (event) {
    // echo message back to source client
    event.source.postMessage(event.data)
  }
}

export default new Handler()
