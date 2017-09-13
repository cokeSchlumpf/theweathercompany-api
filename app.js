const _ = require('lodash');
const fs = require('fs');
const api = JSON.parse(fs.readFileSync('api.json', 'utf-8'));

const geocode = '/v1/geocode/{latitude}/{longitude}/';

const newPaths = _
  .chain(api.paths)
  .pickBy((details, endpoint) => _.startsWith(endpoint, geocode))
  .map((details, endpoint) => {
    _.set(details, 'get.parameters', _
      .chain(details)
      .get('get.parameters', [])
      .filter(param => {
        return param['$ref'].indexOf('latitudePath') === -1 && param['$ref'].indexOf('longitudePath') === -1;
      })
      .value());

      _.set(details, 'get.parameters', _.concat([{
        '$ref': '#/parameters/locationPath'
      }], details.get.parameters));

    return [
      '/v1/location/{location}/' + endpoint.substr(geocode.length),
      details
    ]
  })
  .fromPairs()
  .value();

console.log(JSON.stringify(newPaths, null, 2));
fs.writeFileSync('out.json', JSON.stringify(newPaths, null, 2), 'utf-8');