export class Counter extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.addEventListener('click', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      const value = parseInt(this.dataset.value) + 1
      await fetch(`/counter/${this.dataset.id}`, {
        method: 'PUT',
        body: JSON.stringify({ value })
      })

      this.dataset.value = value
      this.render()
    })
  }

  connectedCallback () {
    this.render()
  }

  attributeChangedCallback () {
    this.render()
  }

  render () {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: relative;
          font-family: monospace;
          font-size: 2rem;
          transition: .5s ease-in-out;
          margin: 4px;
        }

        header {
          background-color: #000000d1;
          border-radius: 8px;
          color: #ffffff;
          display: block;
          height: calc(100% - 168px);
          margin: 0;
          padding: 80px;
          text-align: center;
          width: calc(100% - 168px);

          &:hover {
          }
        }

        a {
          text-decoration: none;
        }

        @media only screen and (max-width: 700px) {
          :host {
            width: calc(100% * (1 / 2) - 8px);
          }
        }

        @media only screen and (max-width: 550px) {
          :host {
            width: auto;
            flex: 1 0 auto;
          }
        }
      </style>
      <a href="#">
        <header>${this.dataset.value || ''}</header>
      </a>
    `
  }
}
