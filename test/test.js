const assert = require('assert');
const _ = require('lodash');
const index = require('../index');

/* eslint-disable */
describe('lambda', async () => {
  it('index', (done) => {
    index.handler(require('./resources/event1.json'), null, (err, resp) => {
      console.log(JSON.stringify(resp));
      done();
    });
  });
});
