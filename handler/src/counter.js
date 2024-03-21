const url = new URL(globalThis.location.href)
const id = url.searchParams.get('id')

if (!id) {
  const button = document.createElement('button')
  button.textContent = 'Create Counter'
  button.onclick = async () => {
    const response = await fetch('/counter', {
      method: 'POST'
    })

    const counter = await response.json()
    location = `/counter?id=${counter.id}`
  }

  document.body.appendChild(button)
}
