import { Counters } from './components/counters.js'
import { Counter } from './components/counter.js'

globalThis.customElements.define('handler-counter', Counter)
globalThis.customElements.define('handler-counters', Counters)
