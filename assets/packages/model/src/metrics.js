class Metrics {
  constructor({ values = {} } = {}) {
    this.values = values
  }

  _pushOne(key, value, prop = undefined) {
    let idx = prop ? key + "." + prop : key
    if (!Object.prototype.hasOwnProperty.call(this.values, idx)) {
      this.values[idx] = Array(this.length)
      this.values[idx].meta = this.metas[key]
    } else if (this.values[idx].length < this.length) {
      this.values[idx][this.length - 1] = undefined
    }

    this.values[idx].push(value)

    if (this.length == this.capacity) {
      this.values[idx].shift()
    }
  }

  push(data) {
    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(this.values, key)) {
        this.values[key] = {}
      }

      Object.assign(this.values[key], data[key])
      this.values[key].name = key
    }
  }
}

export { Metrics }
