const response  = await fetch('/hello-world.json')
const json = await response.json()
console.log(json)
