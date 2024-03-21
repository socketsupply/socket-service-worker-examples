/* global URLPattern */
import http from 'socket:http'
import os from 'socket:os'

const server = http.createServer(onRequest)

server.listen(() => {
  console.log('HTTP server is listening in service worker')
})

async function onRequest (req, res) {
  const { method } = req
  // @ts-ignore
  const pattern = new URLPattern({ pathname: '/:route' })
  const host = req.getHeader('host')
  const url = new URL(req.url, globalThis.location.origin)

  if (method === 'GET') {
    const route = pattern.exec(url)
    if (route?.pathname.groups.route === 'hello.html') {
      const html = `
        <style>
          body {
            overflow: hidden;
          }

          button {
            -webkit-user-select: none;
            border: 1px solid rgba(224, 224, 224, 1);
            box-shadow: none;
            cursor: pointer;
            display: block;
            margin: 0 auto;
            margin-bottom: 4px;
          }

          textarea {
            -webkit-user-select: none;
            background-color: #151515;
            border: 0;
            color: #cecece;
            font-family: monospace;
            height: calc(100% - 20px);
            margin: 0 auto;
            outline: none;
            overflow: hidden;
            padding: 10px;
            resize: none;
            width: 100%;
          }
        </style>
        <button>Fetch <code>hello.json</code></button>
        <textarea readonly>Loading...</textarea>
        <script type="module">
          const textarea = document.querySelector('textarea')
          const button = document.querySelector('button')
          button.onclick = async () => {
            textarea.textContent = 'Loading...'
            const response = await fetch('/hello.json')
            const text = await response.text()
            textarea.textContent = text
            console.log(JSON.parse(text))
          }
        </script>
      `

      res.write(html)
      res.setHeader('content-type', 'text/html')
      return res.end()
    } else if (route?.pathname.groups.route === 'hello.json') {
      const hello = { hello: `Hello ${os.platform()}` }
      res.write(JSON.stringify(hello, null, ' '))
      res.setHeader('cache-control', 'no-cache')
      res.setHeader('content-type', 'application/json')
      return res.end()
    }
  }

  res.statusCode = 404
  res.end()
}
