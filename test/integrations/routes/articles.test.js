/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import faker from 'faker';
import Bluebird from 'bluebird';
import chaiHttp from 'chai-http';
import app from '../../../index';
import models from '../../../models';
import { STATUS } from '../../../helpers/constants';
import { auth } from '../../helpers';

chai.use(chaiHttp);

let authpayload;
let authToken;
const dummyUser = {
  email: 'faker@email.com',
  password: 'i2345678',
  username: 'heron419'
};

const dummyArticle = {
  title: 'Hello world',
  description: 'lorem ipsum exists',
  body: faker.lorem.paragraphs(),
};

const createUser = async () => {
  try {
    const user = await models.User.create(dummyUser);
    return user;
  } catch (error) {
    return error;
  }
};

before(async () => {
  await createUser();
  authpayload = await auth(dummyUser);
  authToken = authpayload.body.token;
  return dummyUser;
});

describe('API endpoint: /api/articles (Routes)', () => {
  after(() => Bluebird.all([models.Article.destroy({ truncate: true })]));

  describe('POST: /api/v1/articles', () => {
    it('Should create an article', (done) => {
      chai
        .request(app)
        .post('/api/v1/articles')
        .send(dummyArticle)
        .set({ Authorization: `Bearer ${authToken}` })
        .end((err, res) => {
          expect(res).to.have.status(STATUS.CREATED);
          expect(res.body).to.be.an('object');
          expect(res.body).to.haveOwnProperty('code').to.equal(STATUS.CREATED);
          expect(res.body.data.title).to.equal(dummyArticle.title);
          done();
        });
    });
  });

  describe('POST: /api/v1/articles', () => {
    describe('A user tries to create a new article with an existing title', () => {
      it('Should create an article', (done) => {
        chai
          .request(app)
          .post('/api/v1/articles')
          .send(dummyArticle)
          .set({ Authorization: `Bearer ${authToken}` })
          .end((err, res) => {
            expect(res).to.have.status(STATUS.BAD_REQUEST);
            expect(res.body).to.be.an('object');
            expect(res.body).to.haveOwnProperty('code').to.equal(STATUS.BAD_REQUEST);
            expect(res.body.message).to.equal('an article with that title already exist');
            done();
          });
      });
    });
  });
});
