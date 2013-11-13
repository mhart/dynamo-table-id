dynamo-table-id
---------------

[![Build Status](https://secure.travis-ci.org/mhart/dynamo-table-id.png?branch=master)](http://travis-ci.org/mhart/dynamo-table-id)

Adds a `nextId` function to a [dynamo-table](https://github.com/mhart/dynamo-table) instance to
generate incrementing numbers using DynamoDB's `ADD` command in the
[`UpdateItem` action](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html)

Example
-------

```javascript
var dynamoTable = require('dynamo-table'),
    dynamoTableId = require('dynamo-table-id')

// Will use us-east-1 and credentials from process.env unless otherwise specified
var table = dynamoTable('orders', {key: ['customerId', 'orderId']})

table = dynamoTableId(table, {idTable: 'last-ids', key: 'orders'})

// By default the first value will be 1
table.nextId(function(err, id) {
  if (err) throw err

  console.log(id)
  // 1
})

// Will return a collection of values if a length is provided
table.nextId(3, function(err, ids) {
  if (err) throw err

  console.log(ids)
  // [2, 3, 4]
})

// Can also set a value to start incrementing from
table.setLastId(23, function(err) {
  if (err) throw err

  table.nextId(function(err, id) {
    if (err) throw err

    console.log(id)
    // 24
  })
})

```

API
---

### dynamoTableId(table, [options])

Wraps the given [dynamo-table](https://github.com/mhart/dynamo-table) object with the methods given below.

Current options are:

  - `idTable` (defaults to `last-ids`) - the name of a table that must already exist with a string hash key
  - `key` (defaults to the table name) - the key used to hold the value item
  - `attr` (defaults to `lastId`) - the attribute name of the incrementing value

### nextId([length], callback)

Will return a single number (or string if the hash key is type `S`, or range key in the case of a range table) if
no length is given - otherwise an array of numbers/strings of the given length (even if length is 0 or 1)

### setLastId(lastId, callback)

Sets the current value of the last value - ie, the next generated value will be one greater than this.

Installation
------------

With [npm](http://npmjs.org/) do:

```
npm install dynamo-table-id
```

