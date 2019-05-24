const readline = require('readline-sync');
import { URL } from 'url';
import request from 'request';

const POSTCODES_BASE_URL = 'https://api.postcodes.io';
const TFL_BASE_URL = 'https://api.tfl.gov.uk';

export default class ConsoleRunner {

    promptForPostcode(callback) {
      return new Promise((resolve, reject) => {
        console.log('\nEnter your postcode: ')
        let postcode = readline.prompt();
        postcode = postcode.replace(/\s/g, '');
        resolve(postcode);
        reject(error);
      });
    }

    displayStopPoints(stopPoints) {
        stopPoints.forEach(point => {
            console.log(point.commonName);
        });
    }

    buildUrl(url, endpoint, parameters) {
        const requestUrl = new URL(endpoint, url);
        parameters.forEach(param => requestUrl.searchParams.append(param.name, param.value));
        return requestUrl.href;
    }

    makeGetRequest(baseUrl, endpoint, parameters, callback) {
        const url = this.buildUrl(baseUrl, endpoint, parameters);
        return new Promise ((resolve, reject)=>{
          request.get(url, (err, response, body) => {
              if (err) {
                  console.log(err);
                  reject(err);
              } else if (response.statusCode !== 200) {
                  console.log(response.statusCode);
              } else {
                  resolve(body);
                  reject(err);
              }
          });
        });
    }

    getLocationForPostCode(postcode) {
      return new Promise ((resolve, reject) => {
        const url = this.buildUrl(POSTCODES_BASE_URL, `postcodes/${postcode}`, []);
        request.get(url, (err, response, body) => {
            if (err) {
                console.log(err);
                reject(err);
            } else if (response.statusCode !== 200) {
                console.log(response.statusCode);
            } else {
                resolve({ latitude: response.result.latitude, longitude: response.result.longitude });
                reject(err);
            }
        });
      })
    }

    getNearestStopPoints(latitude, longitude, count, callback) {
        this.makeGetRequest(
            TFL_BASE_URL,
            `StopPoint`,
            [
                {name: 'stopTypes', value: 'NaptanPublicBusCoachTram'},
                {name: 'lat', value: latitude},
                {name: 'lon', value: longitude},
                {name: 'radius', value: 1000},
                {name: 'app_id', value: '' /* Enter your app id here */},
                {name: 'app_key', value: '' /* Enter your app key here */}
            ],
            function(responseBody) {
                const stopPoints = JSON.parse(responseBody).stopPoints.map(function(entity) {
                    return { naptanId: entity.naptanId, commonName: entity.commonName };
                }).slice(0, count);
                callback(stopPoints);
            }
        );
    }

    run() {
        const that = this;
        let postcode = that.promptForPostcode();
        postcode.then( x => {
          return that.getLocationForPostCode(x);
        })
        .then( y => {
          console.log(y);
        })
        .catch(
          console.log("Error")
        )
    }
}
