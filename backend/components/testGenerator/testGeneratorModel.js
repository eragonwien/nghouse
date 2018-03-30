let debug = require('debug')('test_generator_model');
let helper = require('./helper');

let addressModel = require('../address/addressModel');
let userModel = require('../user/userModel');
let houseModel = require('../house/houseModel');
let bookmarkModel = require('../bookmark/bookmarkModel');

function startTest(test, done) {
    if (!test) {
        return done(new Error('input is empty'));
    }
    switch (test.type) {
        case 'address':
            if (!test.code_length) {
                return done(new Error('postal code length not found.'));
            }
            prepareAddresses(test, done);
            break;
        case 'bookmark':
            prepareBookmarks(test, done);
            break;
        case 'house':
            prepareHouses(test, done);
            break;
        case 'tag':
            prepareTags(test, done);
            break;
        case 'user':
            prepareUsers(test, done);
            break;
        default:
            done(new Error('test type is not supported.'));
            break;
    }
}
exports.startTest = startTest;

function prepareAddresses(test, done) {    
    spawnAddresses(test.number, test.names, test.code_length, 0, done);
}

function spawnAddresses(count, names, postalCodeLength, successCount, done) {
    
    if (!successCount) {
        successCount = 0;
    }
    if (count <= 0) {
        let result = {
            success: (successCount > 0),
            count: successCount
        }
        return done(null, result);
    }
    // generate an address object
    let address = {
        address: names[helper.getRandomInt(names.length)] + 'Street ' + helper.getRandomInt(100),
        postal_code: helper.getRandomInt(Math.pow(10, postalCodeLength - 1), Math.pow(10, postalCodeLength)),
        city: names[helper.getRandomInt(names.length)] + ' City',
        land: names[helper.getRandomInt(names.length)] + ' Land'
    }
    // insert query
    addressModel.createNewAddress(address, function (error, result) {
        successCount = (error) ? successCount : successCount + 1;
        count--;
        spawnAddresses(count, names, postalCodeLength, successCount, done);
    });
}

function prepareBookmarks(test, done) {
    Promise.all([helper.getAllUsers(), helper.getAllHouses()]).then(promiseSuccess).catch(promiseError)

    function promiseSuccess(values) {
        let userIds = values[0], houseIds = values[1];
        spawnBookmarks(test.number, userIds, houseIds, 0, done);
    }

    function promiseError(error) {
        done(error);
    }
    
}

/**
 * generate bookmarks
 * @param {number} count number of users to be generated
 * @param {string[]} userIds list of user ids
 * @param {string[]} houseIds list of house ids
 * @param {string[]} successCount number of successful query
 */
function spawnBookmarks(count, userIds, houseIds, successCount, done) {
    if (!successCount) {
        successCount = 0;
    }
    if (count <= 0) {
        let result = {
            success: (successCount > 0),
            count: successCount
        }
        return done(null, result);
    }

    let bookmark = {
        user_id: userIds[helper.getRandomInt(userIds.length)],
        house_id: houseIds[helper.getRandomInt(houseIds.length)]
    }

    bookmarkModel.createBookmark(bookmark, function (error, result) {
        successCount = (error) ? successCount : successCount + 1;
        count--;
        spawnBookmarks(count, userIds, houseIds, successCount, done);
    });
}

function prepareHouses(test, done) {
    Promise.all([helper.getAllUsers(), helper.getAllHouseTypes(), helper.getAllAddresses(), helper.getAllCurrencies()]).then(promiseSuccess).catch(promiseError)

    function promiseSuccess(values) {
        let userIds = values[0], houseTypeIds = values[1], addressIds = values[2], currencyIds = values[3];
        spawnHouses(test.number, userIds, houseTypeIds, addressIds, currencyIds, 0, done);
    }

    function promiseError(error) {
        done(error);
    }
}

/**
 * generates houses recursively
 * @param {number} count number of houses to be generated
 * @param {number[]} userIds list of all user ids
 * @param {number[]} houseTypeIds list of all type ids
 * @param {number[]} addressIds list of all address ids
 * @param {number[]} currencyIds list of all currency ids 
 * @param {number} successCount number of successful inserts
 * @param {function} done callback
 * house is generated by querying user , type, address and currency
 * a type is randomly chosen. base on type a specific ranges are generated
 * size: min 20 - max. 1000, 1-2 bathrooms, 1-2 bedrooms
 * price = (2000 - 5000) * size
 */
function spawnHouses(count, userIds, typeIds, addressIds, currencyIds, successCount, done) {
    if (!successCount) {
        successCount = 0;
    }
    if (count <= 0) {
        let result = {
            success: (successCount > 0),
            count: successCount
        }
        return done(null, result);
    }
    // create house
    let bathrooms = helper.getRandomInt(1, 5);
    let bedrooms = helper.getRandomInt(1, 5);
    let rooms = bathrooms + bedrooms + helper.getRandomInt(1, 3);
    let size = helper.getRandomInt(rooms * 10, rooms * 100);
    let price = helper.getRandomInt(200, 1000) * size;
    let house = {
        price: price,
        rooms : rooms,
        bathrooms: bathrooms,
        bedrooms: bedrooms,
        size: size,
        user_id: userIds[helper.getRandomInt(userIds.length)],
        address_id: addressIds[helper.getRandomInt(addressIds.length)],
        house_type_id: typeIds[helper.getRandomInt(typeIds.length)],
        house_status_id: 1, 
        currency_id: currencyIds[helper.getRandomInt(currencyIds.length)],
    };
    houseModel.createHouse(house, function (error, result) {
        successCount = (error) ? successCount : successCount + 1;
        count--;
        spawnHouses(count, userIds, typeIds, addressIds, currencyIds, successCount, done);
    });
}

function prepareTags(test, done) {
    Promise.all([helper.getAllUsers(), helper.getAllHouseTypes(), helper.getAllAddresses(), helper.getAllCurrencies()]).then(promiseSuccess).catch(promiseError)

    function promiseSuccess(values) {
        let userIds = values[0], houseTypeIds = values[1], addressIds = values[2], currencyIds = values[3];
        spawnHouses(test.number, userIds, houseTypeIds, addressIds, currencyIds, 0, done);
    }

    function promiseError(error) {
        done(error);
    }
    
}

function prepareUsers(test, done) {
    addressModel.getAllAddresses(function (error, results) {
        if (error) {
            return done(error);
        } 
        // extract only the address id from the results
        let address_ids = helper.filterValuesOfList(results, 'id');
        spawnUsers(test.number, test.names, address_ids, 0, done); 
    });
}

/**
 * generate users
 * @param {number} count number of users to be generated
 * @param {string[]} names list of names
 * @param {string[]} addressList list of addresses
 * @param {string[]} successCount number of successful query
 */
function spawnUsers(count, names, addressList, successCount, done) {
    if (!successCount) {
        successCount = 0;
    }
    if (count <= 0) {
        let result = {
            success: (successCount > 0),
            count: successCount
        }
        return done(null, result);
    }
    // generates an user object
    let first_name = names[helper.getRandomInt(names.length)];
    let last_name = names[helper.getRandomInt(names.length)];
    let randomValue = helper.getRandomInt(1000);
    let username = first_name + last_name + randomValue;
    let user = {
        first_name: first_name,
        last_name: last_name,
        username: username,
        password: 'test',
        email: username + '@' + last_name + '.com',
        role_id: 1,
        address_id: addressList[helper.getRandomInt(addressList.length)]
    }
    // insert query
    userModel.createUser(user, function (error, result) {
        successCount = (error) ? successCount : successCount + 1;
        count--;
        spawnUsers(count, names, addressList, successCount, done);
    });
}