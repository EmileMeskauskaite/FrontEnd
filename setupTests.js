import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();


const fetch = require('node-fetch');

global.fetch = fetch;
global.alert = jest.fn();