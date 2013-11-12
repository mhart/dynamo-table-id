var should = require('should'),
    async = require('async'),
    dynalite = require('dynalite'),
    dynamoTable = require('dynamo-table'),
    dynamoTableId = require('..'),
    useLive = process.env.USE_LIVE_DYNAMO, // set this (and AWS credentials) if you want to test on a live instance
    region = process.env.AWS_REGION, // will just default to us-east-1 if not specified
    table

describe('integration', function() {

  before(function(done) {
    var setup = function(cb) { cb() }

    if (!useLive) {
      region = {host: 'localhost', port: 4567, credentials: {accessKeyId: 'a', secretAccessKey: 'a'}}
      setup = dynalite.listen.bind(dynalite, 4567)
    }

    table = dynamoTable('dynamo-table-id-integration-test', { region: region })

    setup(function(err) {
      if (err) return done(err)
      async.series([table.deleteTableAndWait.bind(table), table.createTableAndWait.bind(table)], done)
    })
  })

  after(function (done) {
    table.deleteTableAndWait(done)
  })

  describe('nextId()', function() {

    it('should return 1 by default', function(done) {
      var tableToWrap = dynamoTableId(dynamoTable('test-1'), {idTable: table})
      tableToWrap.nextId(function(err, nextId) {
        if (err) return done(err)
        nextId.should.equal(1)
        tableToWrap.nextId(function(err, nextId) {
          if (err) return done(err)
          nextId.should.equal(2)
          done()
        })
      })
    })

    it('should return list of IDs if specified', function(done) {
      var tableToWrap = dynamoTableId(dynamoTable('test-2'), {idTable: table})
      tableToWrap.nextId(3, function(err, nextIds) {
        if (err) return done(err)
        nextIds.should.eql([1, 2, 3])
        tableToWrap.nextId(3, function(err, nextIds) {
          if (err) return done(err)
          nextIds.should.eql([4, 5, 6])
          done()
        })
      })
    })

    it('should increment multiple times in parallel', function(done) {
      var tableToWrap = dynamoTableId(dynamoTable('test-3'), {idTable: table}), calls = [], i
      for (i = 0; i < 20; i++)
        calls.push(tableToWrap.nextId.bind(tableToWrap))
      async.parallel(calls, function(err, results) {
        if (err) return done(err)
        for (i = 1; i <= 20; i++)
          results.should.include(i)
        done()
      })
    })

  })

  describe('setLastId()', function() {

    it('should set last id correctly', function(done) {
      var tableToWrap = dynamoTableId(dynamoTable('test-4'), {idTable: table})
      tableToWrap.setLastId(23, function(err) {
        if (err) return done(err)
        tableToWrap.nextId(function(err, nextId) {
          if (err) return done(err)
          nextId.should.equal(24)
          tableToWrap.setLastId(13, function(err) {
            if (err) return done(err)
            tableToWrap.nextId(function(err, nextId) {
              if (err) return done(err)
              nextId.should.equal(14)
              done()
            })
          })
        })
      })
    })

  })
})

