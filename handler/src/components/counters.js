export class Counters extends HTMLElement {
  counters = []
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.addEventListener('click', this)
  }

  connectedCallback () {
    this.render()
  }

  attributeChangedCallback () {
    this.render()
  }

  adoptedCallback () {
    this.render()
  }

  async handleEvent (event) {
    if (event.type === 'click') {
      if (event.composed) {
        const [target] = event.composedPath()
        if (target) {
          if (target.dataset.action === 'clear') {
            try {
              const response = await fetch('/counters', { method: 'DELETE' })
              const json = await response.json()

              if (response.status !== 200) {
                alert(json.message)
              }

              await this.render()
            } catch (err) {
              reportError(err)
              alert(err.message)
            }
          }

          if (target.dataset.action === 'create') {
            try {
              const response = await fetch('/counter', { method: 'POST' })
              const json = await response.json()

              if (response.status !== 200) {
                alert(json.message)
              }

              await this.render()
            } catch (err) {
              reportError(err)
              alert(err.message)
            }
          }
        }
      }
    }
  }

  async render () {
    const response = await fetch('/counters')
    this.counters = await response.json()

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-evenly;
          padding-top: 40px;
        }

        nav {
          display: block;
          width: calc(100% - 16px);
          position: fixed;
          padding: 8px;
          top: 0px;
          left: 0px;
          background-color: rgba(0, 0, 0, 0.8);

          & button {
            -webkit-user-select: none;
            border: 1px solid rgba(224, 224, 224, 1);
            box-shadow: none;
            cursor: pointer;
            display: inline-block;
            margin-bottom: 4px;

            &:hover {
            }

            &[data-action=clear] {
            }

            &[data-action=create] {
            }
          }
        }

        @media only screen and (max-width: 550px) {
          :host {
            justify-content: flex-start;
            flex-wrap: nowrap;
            overflow-x: auto;
          }
        }
      </style>
      <nav>
        <button data-action="clear">Clear</button>
        <button data-action="create">Create</button>
      </nav>
      ${this.counters.map((counter) => (`
        <handler-counter data-id="${counter.id}" data-value="${counter.value}">
        </handler-counter>
      `))}
      `
  }
}

export default Counters
