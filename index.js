const bodyParser = require('body-parser');
const express = require('express');
const faker = require('faker');
const uuid = require('node-uuid');

const application = express();

const COMPANY_BY_ID = {
  '48d5a141-ae0c-416e-b51c-0c3ac791bfb0': {
    ID: '48d5a141-ae0c-416e-b51c-0c3ac791bfb0',
    name: "Propert.ly"
  }
};

const USER_BY_ID = {
  'e8ef584b-ba79-457e-b04f-075acbc57ca9': {
    ID: 'e8ef584b-ba79-457e-b04f-075acbc57ca9',
    email: 'karol@propert.ly',
    fullName: 'Karol Sutherland',
    position: 'Lead Technician'
  },
  '4030b740-81bf-4dd3-9862-9f935734b1de': {
    ID: '4030b740-81bf-4dd3-9862-9f935734b1de',
    email: 'garfield@propert.ly',
    fullName: 'Garfield Hahn',
    position: 'Dynamic Consultant'
  },
  '88dda921-7e1a-4360-8d86-9379c42dca6f': {
    ID: '88dda921-7e1a-4360-8d86-9379c42dca6f',
    email: 'shirley@propert.ly',
    fullName: 'Shirley Hunt',
    position: 'Corporate Coordinator'
  }
};

application.use(bodyParser.json());
application.use(bodyParser.urlencoded({ extended: true }));

application.use((request, response, next) => {

  response.header("Access-Control-Allow-Origin", request.headers.origin);
  response.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Authorization, Accept");
  response.header("Access-Control-Allow-Credentials", "true");
  response.header("X-Powered-By", "Nucleus");


  if (request.method === 'OPTIONS') {
    response.header("Access-Control-Max-Age", 1000 * 60 * 10);
    return response.status(204).end();
  }
  next();
});

application.use((request, response, next) => {
  if (Math.random() > 0.95) throw new Error("An unexpected error occured.");

  next();
});

application.get('/ping', (request, response) => {

  response.status(200).end();
});

application.get('/company/:companyID/users', (request, response) => {
  try {
    const userList = Object.values(USER_BY_ID);

    response.status(200).send(userList).end();

  } catch (error) {
    response.status(500).send({ error: error.message }).end();
  }
});

application.get('/company/current', (request, response) => {
  try {
    response.status(200).send(COMPANY_BY_ID['48d5a141-ae0c-416e-b51c-0c3ac791bfb0']).end();

  } catch (error) {
    response.status(500).send({ error: error.message }).end();
  }
});

application.delete('/user/:userID', (request, response) => {
  try {
    const { userID } = request.params;

    if (!USER_BY_ID.hasOwnProperty(userID)) throw new Error(`There's no user with the ID "${userID}".`);

    delete USER_BY_ID[userID];

    response.status(200).send({}).end();

  } catch (error) {
    response.status(500).send({ error: error.message }).end();
  }
});

application.get('/user/:userID', (request, response) => {
  try {
    const { userID } = request.params;

    if (!USER_BY_ID.hasOwnProperty(userID)) throw new Error(`There's no user with the ID "${userID}".`);

    const user = USER_BY_ID[userID];

    response.status(200).send(user).end();

  } catch (error) {
    response.status(500).send({ error: error.message }).end();
  }
});

application.get('/user/:userID/logs', (request, response) => {
  try {
    const { userID } = request.params;

    if (!USER_BY_ID.hasOwnProperty(userID)) throw new Error(`There's no user with the ID "${userID}".`);

    const logList = Array.apply(null, { length: Math.floor(Math.random() * (10 + 1)) })
      .map(() => faker.date.recent());

    response.status(200).send({ ID: userID, logList }).end();

  } catch (error) {
    response.status(500).send({ error: error.message }).end();
  }
});

application.get('/user/:userID/status', (request, response) => {
  try {
    const { userID } = request.params;

    if (!USER_BY_ID.hasOwnProperty(userID)) throw new Error(`There's no user with the ID "${userID}".`);

    response.status(200).send({ ID: userID, status: Math.random() > 0.51 }).end();

  } catch (error) {
    response.status(500).send({ error: error.message }).end();
  }
});

application.post('/user', (request, response) => {
  try {
    if (typeof request.body !== 'object') throw new Error("The body of the request does not seem to be a valid JSON object.");

    const userID = uuid.v4();
    const { email, fullName, position } = request.body;

    if (!email) throw new Error("The email is mandatory.");
    if (!/^.*?@.*?$/.test(email)) throw new Error("The email does not seem to be a valid email address.");
    if (!fullName) throw new Error("The full name is mandatory.");
    if (!position) throw new Error("The position is mandatory.");

    USER_BY_ID[userID] = { ID: userID, email, fullName, position };

    response.status(200).send(USER_BY_ID[userID]).end();

  } catch (error) {
    response.status(500).send({ error: error.message }).end();
  }
});

application.put('/user/:userID', (request, response) => {
  try {
    if (typeof request.body !== 'object') throw new Error("The body of the request does not seem to be a valid JSON object.");

    const { userID } = request.params;

    if (!USER_BY_ID.hasOwnProperty(userID)) throw new Error(`There's no user with the ID "${userID}".`);

    const { email, fullName, position } = request.body;

    if (!email) throw new Error("The email is mandatory.");
    if (!/^.*?@.*?$/.test(email)) throw new Error("The email does not seem to be a valid email address.");
    if (!fullName) throw new Error("The full name is mandatory.");
    if (!position) throw new Error("The position is mandatory.");

    USER_BY_ID[userID] = { ID: userID, email, fullName, position };

    response.status(200).send({}).end();

  } catch (error) {
    response.status(500).send({ error: error.message }).end();
  }
});

application.listen(9090);
console.log("Listening on 9090");
