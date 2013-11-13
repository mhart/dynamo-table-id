var should = require('should'),
    dynamoTableId = require('..')

// ensure env variables have content to keep dynamo-client happy
before(function() {
  var env = process.env
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY)
    env.AWS_ACCESS_KEY_ID = env.AWS_SECRET_ACCESS_KEY = 'a'
})

describe('dynamoTableId', function() {

  describe('constructor', function() {

    it('should populate defaults correctly', function() {
      var table = {}
      dynamoTableId(table)
      table.nextId.should.be.an.instanceOf(Function)
      table.setLastId.should.be.an.instanceOf(Function)
    })

    it('should not override existing nextId function', function() {
      var table = {nextId: 23}
      dynamoTableId(table)
      table.nextId.should.equal(23)
    })

    it('should accept non-string idTable', function() {
      var table = {}
      dynamoTableId(table, {idTable: {}})
      table.nextId.should.be.an.instanceOf(Function)
      table.setLastId.should.be.an.instanceOf(Function)
    })

  })

  describe('nextId()', function() {

    it('should increment by 1 by default', function(done) {
      var table = {name: 'orders'}, idTable = {
        increment: function(key, attr, length, cb) {
          key.should.equal('orders')
          attr.should.equal('lastId')
          length.should.equal(1)
          cb(null, 1)
        }
      }
      dynamoTableId(table, {idTable: idTable})
      table.nextId(function(err, nextId) {
        if (err) return done(err)
        nextId.should.equal(1)
        done()
      })
    })

    it('should return array of IDs if length specified', function(done) {
      var table = {name: 'orders'}, idTable = {
        increment: function(key, attr, length, cb) {
          key.should.equal('some-key')
          attr.should.equal('some-attr')
          length.should.equal(3)
          cb(null, 4)
        }
      }
      dynamoTableId(table, {idTable: idTable, key: 'some-key', attr: 'some-attr'})
      table.nextId(3, function(err, nextIds) {
        if (err) return done(err)
        nextIds.should.eql([2, 3, 4])
        done()
      })
    })

  })

  describe('setLastId()', function() {

    it('should call update with correct attribute', function(done) {
      var table = {name: 'orders'}, idTable = {
        update: function(key, actions, cb) {
          key.should.equal('orders')
          actions.should.eql({put: {lastId: 23}})
          cb()
        }
      }
      dynamoTableId(table, {idTable: idTable})
      table.setLastId(23, done)
    })

  })

})
