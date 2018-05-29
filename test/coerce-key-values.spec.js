const test = require('tape')
const { coerceKeyValues } = require('../bin/cli')

test('coerceKeyValues should return an object of keys and vals passed as args', spec => {
  spec.plan(2)
  let input = ['key1=1eaf', 'key2="some value 2"']
  let expected = {
    key1: '1eaf',
    key2: '"some value 2"'
  }
  spec.deepEquals(coerceKeyValues(input), expected, 'object of keys and values')
  input = ['key1=1eaf', 'key2="some=value 2"']
  expected = {
    key1: '1eaf',
    key2: '"some=value 2"'
  }
  spec.deepEquals(coerceKeyValues(input), expected, 'equals allowed in the variable value')
})
