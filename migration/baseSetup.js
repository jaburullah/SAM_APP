/**
 * Created by jaburur on 12-08-2017.
 */
var theApp = require('./../server/app.js');
var mongoDB = require('mongodb');
var mongoClient = mongoDB.MongoClient;

var Q = require('q');
var Promise = require('promise');


mongoClient.connect(theApp.mongoDBConnection, function(err, db) {
    if (err) throw err;

    console.log("Database created!");

    var createApartmentCollection = new Promise(function (resolve, reject) {
        // apartment collection
        db.createCollection("apartment", function (err, collection) {
            if (err) reject({success: false, err: err});

            console.log("Created apartment Collection");
            console.log(collection);
            resolve({success: true});
        });
    });
    var createUserCollection = new Promise(function (resolve, reject) {
        // user collection
        db.createCollection("user", function (err, collection) {
            if (err) reject({success: false, err: err});

            console.log("Created user Collection");
            console.log(collection);
            resolve({success: true});
        });

    });
    var createTicketCollection = new Promise(function (resolve, reject) {
        // ticket collection
        db.createCollection("ticket", function (err, collection) {
            if (err) reject({success: false, err: err});
            console.log("Created ticket Collection");
            console.log(collection);
            resolve({success: true});
        });

    });

    Promise.all([createApartmentCollection, createUserCollection, createTicketCollection])
        .done(function (results) {
            if (results[0].success && results[1].success && results[2].success) {
                db.collection('user', function (err, collection) {
                    var adminUser = {
                        name: "admin",
                        password: "admin",
                        email: "jaburullah13@gmail.com",
                        mobileNo: "7760640462",
                        roles: ["admin"],
                        apartments: null
                    };
                    collection.insert(adminUser, function (err, items) {
                        if (err) throw err;
                        console.log("Admin user has been added to user collection");
                        db.close();
                    });
                });
            }
        });


})