/**
 * Service worker request handler that notifies the requesting client of the
 * currently requested URL always responding with an empty response body.
 * @param {Request} request
 * @param {object} env
 * @param {import('socket:service-worker').Context} ctx
 * @return {Promise<Response>}
 */
export default async function (request, env, ctx) {
  const url = new URL(request.url)

  if (request.method !== 'POST' || url.pathname !== '/notification') {
    return null // 404
  }

  const options = await request.json()
  const client = await ctx.client()
  const tag = options?.tag || Math.random().toString(16).slice(2)

  await globalThis.registration.showNotification(
    options.title,
    { ...options, tag }
  )

  if (!client) {
    return Response.json({ message: 'Missing client in request' }, { status: 400 })
  }

  const notifications = await globalThis.registration.getNotifications({ tag })
  console.log({notifications})
  const notification = notifications.find((notification) =>
    notification.tag === tag
  )

  if (!notification) {
    return Response.json({ message: 'Failed to create notification' }, { status: 500 })
  }

  notification.onclick = () => {
    console.log('click')
    client.postMessage({
      notification: {
        id: notification.id,
        click: true
      }
    })
  }

  notification.onclose = () => {
    console.log('close')
    client.postMessage({
      notification: {
        id: notification.id,
        close: true
      }
    })
  }

  return Response.json({
    id: notification.id,
    ...notification.options
  })
}
