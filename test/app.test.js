const app = require('../src/app');

describe('App', () => {
  it('Responds to GET / with 200 containing "Hello World"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello World');
  });
});
