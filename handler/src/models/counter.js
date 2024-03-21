import { rand64 } from 'socket:crypto'

/**
 * A container for a counter value with an ID
 */
export class Counter {
  /**
   * Create a `Counter` instance from JSON input in the environment.
   * @param {object} env
   * @param {{ id: number, value: number }=} [data]
   * @return {Counter}
   */
  static from (env, data) {
    env.counters ??= {}
    return new this(env, env.counters[data?.id] ?? {})
  }

  /**
   * Creates a new `Counter` in the environment.
   * @param {object} env
   * @return {Counter}
   */
  static create (env) {
    const counter = new this(env)
    counter.put()
    return counter
  }

  /**
   * Removes all `Counter` instances in the environment.
   * @param {object} env
   */
  static clear (env) {
    env.counters = {}
  }

  /**
   * Gets all `Counter` instances in the environment.
   * @param {object} env
   * @return {Counter[]}
   */
  static all (env) {
    if (!env.counters) {
      return []
    }

    return Object.values(env.counters).map((data) => Counter.from(env, data))
  }

  #id = 0
  #value = 0
  #env = null

  /**
   * `Counter` class constructor.
   * @param {object} env
   * @param {{ id: number, value: number }=} [data]
   */
  constructor (env, data = {}) {
    this.#env = env
    this.#id = data?.id ?? String(rand64())
    this.#value = data?.value ?? 0
  }

  /**
   * The counter ID
   * @type {string}
   */
  get id () {
    return this.#id
  }

  /**
   * The counter value.
   * @type {number}
   */
  get value () {
    return this.#value
  }

  /**
   * `true` if the `Counter` exists in the environment,
   * otherwise `false.
   * @type {boolean}
   */
  get exists () {
    if (!this.#env.counters) {
      return false
    }

    return Boolean(this.#env.counters[this.id])
  }

  set value (value) {
    if (!Number.isFinite(value)) {
      throw new TypeError('Invalid value for counter. Expecting a finite value.')
    }

    if (value < 0) {
      throw new TypeError(
        'Invalid value for coutner. Expecting a value to be greater than or equal to 0'
      )
    }

    this.#value = value
    this.put()
  }

  /**
   * Saves the `Counter` instance in the environment.
   */
  put () {
    this.#env.counters ??= {}
    this.#env.counters = {
      ...this.#env.counters,
      [this.id]: this.toJSON()
    }
  }

  /**
   * Deletes this `Counter` from the environment
   */
  delete () {
    this.#env.counters ??= {}
    delete this.#env.counters[this.id]
  }

  /**
   * Converts this `Counter` instance to a JSON object.
   * @return {{ id: number, value: number }}
   */
  toJSON () {
    return {
      id: this.id,
      value: this.value
    }
  }
}
