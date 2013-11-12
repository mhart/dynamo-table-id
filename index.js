module.exports = function dynamoTableId(table, options) {
  if (table.nextId) return table

  options = options || {}
  options.key = options.key || table.name
  options.attr = options.attr || 'lastId'

  var idTable = options.idTable || 'last-ids'

  if (typeof idTable == 'string') {
    idTable = require('dynamo-table')(idTable)
  }

  table.nextId = function nextId(length, cb) {
    var returnArray = true
    if (!cb) { cb = length; length = 1; returnArray = false }
    if (typeof cb !== 'function') throw new Error('Last parameter must be a callback function')

    idTable.increment(options.key, options.attr, length, function(err, nextId) {
      if (err) return cb(err)
      if (!returnArray) return cb(null, nextId)
      var i, values = new Array(length)
      for (i = 0; i < length; i++) {
        values[i] = nextId - length + i + 1
      }
      return cb(null, values)
    })
  }

  table.setLastId = function setLastId(lastId, cb) {
    var actions = {put: {}}
    if (typeof cb !== 'function') throw new Error('Last parameter must be a callback function')

    actions.put[options.attr] = lastId

    idTable.update(options.key, actions, cb)
  }

  return table
}


