const fetch = require('node-fetch');

global.fetch = fetch;
global.alert = jest.fn();