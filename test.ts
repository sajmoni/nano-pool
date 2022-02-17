import test from 'ava'

import { sayHello } from 'nano-pool'

test('sayHello', (t) => {
  t.is(sayHello(), 'Hello world!')
})
