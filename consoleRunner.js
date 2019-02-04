import { createInterface } from 'readline';
import { URL } from 'url';
import request from 'request';

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

const POSTCODES_BASE_URL = 'https://api.postcodes.io';
const TFL_BASE_URL = 'https://api.tfl.gov.uk';

export default class ConsoleRunner {

    promptForPostcode() {
        try {
          return new Promise(function(resolve) {
            readline.question('\nEnter your postcode: ', (postcode) => {
              resolve(postcode);
            });
          });
        } catch (error){
          console.log("Issue in promptForPostcode");
          console.log(error)
        }
    }

    displayStopPoints(stopPoints) {
        stopPoints.forEach(point => {
            console.log(point.commonName);
        });
    }

    buildUrl(url, endpoint, parameters) {
        const requestUrl = new URL(endpoint, url);
        console.log(requestUrl);
        parameters.forEach(param => requestUrl.searchParams.append(param.name, param.value));
        return requestUrl.href;
    }

    // makeGetRequest(baseUrl, endpoint, parameters, callback) {
    //     try {
    //       const url = this.buildUrl(baseUrl, endpoint, parameters);
    //       return new Promise((resolve, reject) => {
    //         try {
    //           request.get(url, (err, response, body) => {
    //             if (response.statusCode !== 200) {
    //               console.log(response.statusCode);
    //               throw new Error("Error thrown due to status code");
    //             } else {
    //               resolve(callback(body));
    //             } catch (err){
    //               reject(err);
    //             }
    //           })
    //               })}
    //         } catch (error) {
    //           console.log("Issue in makeGetRequest");
    //           console.log(error)
    //         }


    getLocationForPostCode(postcode) {
          try {
            const locationResults = new Promise ((resolve, reject) => {
              this.makeGetRequest(POSTCODES_BASE_URL, `postcodes/${postcode}`, [], responseBody => {
                const jsonBody = JSON.parse(responseBody);
                resolve({ latitude: jsonBody.result.latitude, longitude: jsonBody.result.longitude });
                reject(console.log("Issue with getLocationForPostCode"))
              })
            })
            return Promise.all([postcode, locationResults])
          } catch (error){
            console.log("Issue in getLocationForPostCode");
            console.log(error)
            }
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
        let that = this
        that.promptForPostcode()
          .then(postcode => {
            readline.close();
            postcode = postcode.replace(/\s/g, '');
            console.log(`\nFinding busstops near ${postcode}`)
          })
          .then(postcode => {
            that.getLocationForPostCode(postcode)
          })
          .then(values => {
            console.log(values)
          })
    }
}
