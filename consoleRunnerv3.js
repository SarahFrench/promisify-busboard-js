const readline = require('readline-sync');
import { URL } from 'url';
import request from 'request';


const POSTCODES_BASE_URL = 'https://api.postcodes.io';
const TFL_BASE_URL = 'https://api.tfl.gov.uk';

export default class ConsoleRunner {

    promptForPostcode() {
        return new Promise((resolve, reject) => {
          console.log('\nEnter your postcode: ')
          let postcode = readline.prompt();
          postcode = postcode.replace(/\s/g, '');
          resolve(postcode);
          reject(error);
        });
    }

    getLocationForPostCode(postcode) {
      return new Promise((resolve, reject) => {
        this.makeGetRequest(POSTCODES_BASE_URL, `postcodes/${postcode}`, [], function(responseBody) {
            const jsonBody = JSON.parse(responseBody);
            let latLong = { "latitude": jsonBody.result.latitude, "longitude": jsonBody.result.longitude };
            resolve(latLong);
        })
        reject(error);
      })
    }

    buildUrl(url, endpoint, parameters) {
        const requestUrl = new URL(endpoint, url);
        parameters.forEach(param => requestUrl.searchParams.append(param.name, param.value));
        return requestUrl.href;
    }

    makeGetRequest(baseUrl, endpoint, parameters, callback) {
      return new Promise ((resolve, reject) => {
        const url = this.buildUrl(baseUrl, endpoint, parameters);
        request.get(url, (err, response, body) => {
            if (err) {
                console.log(err);
            } else if (response.statusCode !== 200) {
                console.log(response.statusCode);
            } else {
                resolve(body);;
            }
        });
        reject(error);
      })
    }

    run(){
      let that = this;
      let postcodePromise = that.promptForPostcode();
      postcodePromise.then(that.getLocationForPostCode).then( x => {console.log(x)})
    }

}
