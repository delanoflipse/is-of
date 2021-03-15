const { is } = require('../dist/lib');

const schema = is(Object)
  .key('fields', is([null, Object]))
  .key('f', is([null, Object]))
  .key('*', is(String));

const schema2 = is(Object)
  .key('array', is(Array)
    .key('*', is(Object)
      .key('x', is(String))
      .key('y', is(Number))
    )
  )

test('basic test 1', () => {
  const [ valid, errors ] = schema.validate({
    fields: {},
    f: null,
    bla: 'boo',
    asdf: 3,
  });

  expect(valid).toBe(false);
});

test('basic test 2', () => {
  const [ valid, errors ] = schema.validate(null);
  expect(valid).toBe(false);
});

test('basic test - true', () => {
  const [ valid, errors ] = schema.validate({
    fields: {},
    f: null,
    bla: 'boo',
  });

  expect(valid).toBe(true);
});

test('basic test 3', () => {
  const [ valid, errors ] = schema.validate({
    f: null,
    fields: 3,
  });
  expect(valid).toBe(false);
});

test('basic test 4', () => {
  const [ valid, errors ] = schema2.validate({
    array: [
      {x: 'asdf', y: 3},
      {x: 'asdf', y: 3},
      {x: 'asdf', y: 3},
      {x: 'asdf', y: 3},
      {x: 3, y: 3},
    ],
  });
  expect(valid).toBe(false);
});
