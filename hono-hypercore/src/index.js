const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

async function append (text) {
  const response = await fetch('hypercore:append', {
    method: 'POST',
    body: textEncoder.encode(text)
  })

  return await response.json()
}

async function get (index) {
  const response = await fetch(`hypercore:get/${index}`)
  return await response.arrayBuffer()
}

const result = await append('hello world')
const text = textDecoder.decode(await get(result.length - 1))

console.log({ result })
console.log({ text })
