/* eslint-disable prefer-destructuring */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import faker from 'faker';
// import jwt from 'jsonwebtoken';
import models from '../../../models';
import { STATUS } from '../../../helpers/constants';
import app from '../../../index';


chai.use(chaiHttp);

const {
  CREATED,
  OK,
} = STATUS;

let authpayload;

let dummyUser5 = {
  email: faker.internet.email(),
  password: 'i2345678',
  username: 'heron419rklekl'
};

const createUser = async () => {
  try {
    const user = await models.User.create(dummyUser5);
    dummyUser5 = user;
    return dummyUser5;
  } catch (error) {
    return error;
  }
};

// const token = `${jwt.sign({ user: { id: 1 } }, 'secret', { expiresIn: '24hrs' })}`;
const article = {
  title: faker.lorem.words(),
  description: faker.lorem.words(),
  body: faker.lorem.words()
};
describe('article like and dislike endpoint', () => {
  let slug;
  before(async () => {
    createUser();
    authpayload = await chai.request(app)
      .post('/api/v1/users/login')
      .send(dummyUser5);
    dummyUser5.token = authpayload.body.token;

    const articleResult = await chai
      .request(app)
      .post('/api/v1/articles')
      .set({ Authorization: `Bearer ${dummyUser5.token}` })
      .send({ ...article });
    slug = articleResult.body.data.slug;
  });

  it('should successfully like an article', (done) => {
    chai
      .request(app)
      .post(`/api/v1/articles/${slug}/likes`)
      .set({ Authorization: `Bearer ${dummyUser5.token}` })
      .end((err, res) => {
        expect(res.status).eql(CREATED);
        expect(res.body.message).to.equal('successfully liked article');
        done();
      });
  });

  it('should successfully dislike an article', (done) => {
    chai
      .request(app)
      .post(`/api/v1/articles/${slug}/dislikes`)
      .set({ Authorization: `Bearer ${dummyUser5.token}` })
      .end((err, res) => {
        expect(res.status).eql(OK);
        expect(res.body.message).to.equal('successfully disliked article');
        done();
      });
  });
});
