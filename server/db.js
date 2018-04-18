/**
 * Created by jaburur on 21-07-2017.
 */
var mongoDB = require('mongodb');
var mongoClient = mongoDB.MongoClient;
var mongoDbObj;

var Q = require('q');
var Promise = require('promise');
var theApp = require('./app.js');
var fcm = require('./fcmNotification.js');



module.exports = {

    init: function () {
        fcm.init();
        mongoClient.connect(theApp.mongoDBConnection, function (err, db) {
            if (err)
                console.log(err);
            else {
                console.log("Connected to MongoDB");
                mongoDbObj = {
                    db: db
                };
            }
        });
    },
    login: function (obj, callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            collection.findOne({name: obj.userName, password: obj.password}, function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },
    logout: function () {

    },

    //Mobile Login
    mobileLogin: function (obj, callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            var filterObj = {};
            if (obj.email) {
                filterObj.email = obj.email;
            }
            else if (obj.mobileNo) {
                filterObj.mobileNo = obj.mobileNo;
            }
            collection.findOne(filterObj, function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                if (items !== null) {

                    collection.update({'_id': new mongoDB.ObjectID(items._id)}, {$set: {fireBaseId: obj.fireBaseId}}, function (err, results) {
                        if (err) {
                            callBack(false, err);
                        }
                    });
                    var userDetails = items;
                    var userApartments = [];
                    var i = 0,
                        allAppartemnt = userDetails.apartments || [],
                        l = allAppartemnt.length;
                    if (allAppartemnt.length >= 1) {
                        while (l--) {
                            userApartments.push({
                                "_id": new mongoDB.ObjectID(allAppartemnt[i])
                            });
                            i++;
                        }
                        var apartmentQuery = {
                            $or: userApartments
                        };
                        mongoDbObj.db.collection('apartment', function (err, collection) {
                            collection.find(apartmentQuery).toArray(function (err, items) {
                                if (err) {
                                    callBack(false, err);
                                }

                                userDetails.apartments = items;
                                callBack(true, userDetails);
                            });
                        });
                    }
                    else {
                        callBack(true, items);
                    }

                }
                else {
                    callBack(false, items);
                }

            });
        });
    },
    //mobile Logout
    mobileLogout:function(obj,callBack){
            mongoDbObj.db.collection('user', function (err, collection) {
                var filterObj = {};
                // filterObj.email = obj.email;
                filterObj._id =  new mongoDB.ObjectID(obj.userId);
                collection.update(filterObj, {$set: {fireBaseId: ""}}, function (err, items) {
                    if (err) {
                        callBack(false, err);
                    }
                    callBack(true, obj);
                });
            });
    },
    appInfo: function (obj, callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            collection.findOne({'_id': new mongoDB.ObjectID(obj.userId)}, function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                var userInfo = items;
                if (items.roles.indexOf('manager') >= 0) {
                    var managerApartments = userInfo.apartments;

                    var userFilterObj = {
                        $and: [
                            {roles: {$in: ["user"]}},
                            {apartments: {$in: managerApartments}}
                        ]
                    };

                    collection.find(userFilterObj).toArray(function (err, items) {
                        if (err) {
                            callBack(false, err);
                        }
                        var usersInfo = items;

                        var i = 0, l = managerApartments.length;
                        var apartmentFilter = {
                            $or: []
                        };

                        while (l--) {
                            apartmentFilter.$or.push({
                                '_id': new mongoDB.ObjectID(managerApartments[i])
                            });
                            i++;
                        }

                        var managerStatus = ["Select Status","In Progress","Verify"];
                        var managerAvailableStatus = {};
                        (function setManagerStatus() {
                            var status = theApp.appSetting.ticketStatus;
                            for(var o in status){
                                if(managerStatus.indexOf(status[o].name)>=0){
                                    managerAvailableStatus[o] = status[o];
                                }
                            }

                        })();


                        mongoDbObj.db.collection('apartment', function (err, collection) {

                            collection.find(apartmentFilter).toArray(function (err, items) {
                                if (err) {
                                    callBack(false, err);
                                }
                                var apartmentInfo = items;
                                var response = {
                                    loggedInUser: userInfo,
                                    usersInfo: usersInfo,
                                    apartmentInfo: apartmentInfo,
                                    category: theApp.appSetting.ticketCategory,
                                    priority: theApp.appSetting.ticketPriority,
                                    status: managerAvailableStatus
                                };

                                callBack(true, response);
                            });
                        });

                    });
                }
                else {

                    var userApartment = userInfo.apartments[0];
                    var managerFilterObj = {
                        $and: [
                            {roles: {$in: ["manager"]}},
                            {apartments: {$in: [userApartment]}}
                        ]
                    };

                    collection.findOne(managerFilterObj, function (err, items) {
                        if (err) {
                            callBack(false, err);
                        }
                        var managerInfo = items;

                        delete  managerInfo.apartments;

                        mongoDbObj.db.collection('apartment', function (err, collection) {
                            var apartmentFilterObj = {'_id': new mongoDB.ObjectID(userApartment)};

                            collection.findOne(apartmentFilterObj, function (err, items) {
                                if (err) {
                                    callBack(false, err);
                                }
                                var apartmentInfo = items;

                                var userStatus = ["Select Status","Reopen","Close"];
                                var userAvailableStatus = {};
                                (function setUserStatus() {
                                    var status = theApp.appSetting.ticketStatus;
                                    for(var o in status){
                                        if(userStatus.indexOf(status[o].name)>=0){
                                            userAvailableStatus[o] = status[o];
                                        }
                                    }

                                })();

                                var response = {
                                    loggedInUser: userInfo,
                                    managerInfo: managerInfo,
                                    apartmentInfo: apartmentInfo,
                                    category: theApp.appSetting.ticketCategory,
                                    priority: theApp.appSetting.ticketPriority,
                                    status: userAvailableStatus
                                };

                                callBack(true, response);
                            });
                        });

                    });
                }


            });
        });
    },
    //Apartment
    getApartmentDetails: function (callBack) {
        mongoDbObj.db.collection('apartment', function (err, collection) {
            collection.find().toArray(function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },
    saveApartment: function (data, callBack) {
        mongoDbObj.db.collection('apartment', function (err, collection) {
            if (data.id) {
                var id = data.id;
                delete data.id;
                collection.update(
                    {'_id': new mongoDB.ObjectID(id)},
                    {$set: data},
                    function (err, items) {
                        if (err) {
                            callBack(false, err);
                        }
                        callBack(true, items);

                    });
            }
            else {
                delete data.id;
                collection.insert(data, function (err, items) {
                    if (err) {
                        callBack(false, err);
                    }
                    callBack(true, items.ops[0]);
                });
            }
        });
    },
    deleteApartment: function (data, callBack) {
        mongoDbObj.db.collection('apartment', function (err, collection) {
            collection.remove(data, function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },

    //user
    getAllUserDetails: function (callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            collection.find({roles: {$in: ["user", "manager"]}}).toArray(function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },
    saveUser: function (data, callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            if (data.id) {
                var id = data.id;
                delete data.id;
                collection.update(
                    {'_id': new mongoDB.ObjectID(id)},
                    {$set: data},
                    function (err, items) {
                        if (err) {
                            callBack(false, err);
                        }
                        callBack(true, items);

                    });
            }
            else {
                delete data.id;
                collection.insert(data, function (err, items) {
                    if (err) {
                        callBack(false, err);
                    }
                    callBack(true, items.ops[0]);
                });
            }
        });
    },
    deleteUser: function (data, callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            collection.remove({'_id': new mongoDB.ObjectID(data.id)}, function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },


    //Manager
    getAllManagerDetails: function (callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            collection.find({roles: {$in: ["manager"]}}).toArray(function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },
    saveManager: function (data, callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            if (data.id) {
                var id = data.id;
                delete data.id;
                collection.update(
                    {'_id': new mongoDB.ObjectID(id)},
                    {$set: data},
                    function (err, items) {
                        if (err) {
                            callBack(false, err);
                        }
                        callBack(true, items);

                    });
            }
            else {
                delete data.id;
                collection.insert(data, function (err, items) {
                    if (err) {
                        callBack(false, err);
                    }
                    callBack(true, items);
                });
            }
        });
    },
    deleteManager: function (data, callBack) {
        mongoDbObj.db.collection('user', function (err, collection) {
            collection.remove({'_id': new mongoDB.ObjectID(data.id)}, function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },

    //Ticket info
    userTicket: function (data, callBack) {

        mongoDbObj.db.collection('ticket', function (err, collection) {
            var filterObj = {
                userId: data.userId,
                status: {
                    $in: ["Open", "Reopen", "In Progress", "Verify", "Close"]
                }
            };
            var bFilter = false;
            if(data.categoryFilters.length || data.priorityFilters.length || data.statusFilters.length){
                bFilter= true;
            }
            if(bFilter){
                filterObj  = {
                    userId: data.userId,
                    $or: [
                        {
                            category: { $in: data.categoryFilters}
                        },
                        {
                            priority: { $in: data.priorityFilters}
                        },
                        {
                            status: { $in: data.statusFilters}
                        }
                    ]
                }
            }


            collection.find(filterObj).sort({"modifiedDate": -1}).toArray(function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                var userTicket = items;
                var filterObj = {
                    $and: [
                        {userId: {$ne: data.userId}},
                        {apartmentId: {$eq: data.apartmentId}},
                        {status: {$in: ["Open", "Reopen", "In Progress", "Verify", "Close"]}}
                    ]
                };
                if(bFilter){
                    filterObj  = {
                        $and: [
                            {userId: {$ne: data.userId}},
                            {apartmentId: {$eq: data.apartmentId}},
                            ],
                        $or: [
                            {
                                category: { $in: data.categoryFilters}
                            },
                            {
                                priority: { $in: data.priorityFilters}
                            },
                            {
                                status: { $in: data.statusFilters}
                            }
                        ]
                    }
                }

                collection.find(filterObj).sort({"modifiedDate": -1}).toArray(function (err, items) {
                    if (err) {
                        callBack(false, err);
                    }
                    var apartmentTicket = items;
                    var response = {
                        userTicket: userTicket,
                        apartmentTicket: apartmentTicket
                    };
                    callBack(true, response);
                });
            });
        });

    },
    managerTicket: function (data, callBack) {

        var filterObj = {
            $and: [
                {manager: data.userId},
                {$or: []}
            ]
        };
        var i = 0, apartmentId = data.apartmentId, l = apartmentId.length;
        while (l--) {
            filterObj.$and[1].$or.push({apartment: apartmentId[i]});
            i++;
        }


        mongoDbObj.db.collection('ticket', function (err, collection) {
            collection.find(filterObj).sort({"modifiedDate": -1}).toArray(function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                var recentTicket = items;
                //filterObj.$and.push({
                //    createdDate: {
                //        $gte: new Date(data.endDate).toISOString(),
                //        $lte: new Date(data.startDate).toISOString()
                //    }
                //});

                collection.find(filterObj).sort({"modifiedDate": -1}).toArray(function (err, items) {
                    if (err) {
                        callBack(false, err);
                    }
                    var apartmentTicket = items;
                    var response = {
                        recentTicket: recentTicket,
                        apartmentTicket: apartmentTicket
                    };
                    callBack(true, response);
                });
            });
        });
    },
    //Ticket
    sendNotification: function (data,actionUserId) {
        var userId =data.userId,
            title,body,click_action,actionDoneBy;
        if(actionUserId === data.managerId){
            //this action is manager edit the ticket so send notification to user
            userId = data.userId;
            actionDoneBy ="manager";


            title = "Ticket Status Updated";
            body = "Type: "+data.category+", Status: "+data.status+", Priority: "+data.priority;
        }
        else {
            // this action is user edit the ticket so send notification to manager
            userId = data.managerId;
            actionDoneBy ="user";

            if(data.isNewTicket){
                title = "Ticket Created";
                body = "Type: "+data.category+", Status: "+data.status+", Priority: "+data.priority;
            }
            else {
                title = "Ticket Modified";
                body = "Type: "+data.category+", Status: "+data.status+", Priority: "+data.priority;
            }
        }

        var $this = this;
        mongoDbObj.db.collection('user', function (err, collection) {
            collection.findOne({'_id': new mongoDB.ObjectID(userId)}, function (err, item) {
                if (err) {
                    console.log("error: ",err);
                }
                if(item.fireBaseId){
                    var obj = {
                        to:item.fireBaseId,
                        title:title,
                        body:body,
                        ticketInfo: data,
                        clickAction:"SplashActivity",
                        actionDoneBy:actionDoneBy
                    };
                    $this.getTicketById({ticketId: data.id},function (status, data) {
                        console.log(status);
                        obj.ticketInfo = data;
                        fcm.send(fcm.prepareNotification(obj));
                    });
                    console.log("userId: "+userId, "FireBasesId: "+item.fireBaseId);

                }
                else{
                    console.log("No FCM Id to send notification");
                }

            });
        });
    },


    saveTicket: function (data,actionUserId, callBack) {
        var $this = this;
        mongoDbObj.db.collection('ticket', function (err, collection) {
            if (data.id) {
                var id = data.id;
                delete data.id;
                collection.update(
                    {'_id': new mongoDB.ObjectID(id)},
                    {$set: data},
                    function (err, items) {
                        if (err) {
                            callBack(false, err);
                        }
                        data.id = id;
                        data.isNewTicket = false;
                        $this.sendNotification(data,actionUserId);
                        callBack(true, data);
                    });
            }
            else {
                delete data.id;
                collection.insert(data, function (err, items) {
                    if (err) {
                        callBack(false, err);
                    }
                    data.id = items.ops[0]._id;
                    data.isNewTicket = true;
                    $this.sendNotification(data,actionUserId);
                    callBack(true, data);
                });
            }
        });
    },
    deleteTicket: function (data, callBack) {
        mongoDbObj.db.collection('ticket', function (err, collection) {
            collection.remove({'_id': new mongoDB.ObjectID(data.id)}, function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },
    getAllTicketDetails: function (callBack) {
        mongoDbObj.db.collection('ticket', function (err, collection) {
            collection.find().sort({"modifiedDate": -1}).toArray(function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                callBack(true, items);
            });
        });
    },
    getTicketById: function (obj,callBack) {
        mongoDbObj.db.collection('ticket', function (err, collection) {
            collection.findOne({'_id': new mongoDB.ObjectID(obj.ticketId)}, function (err, items) {
                if (err) {
                    callBack(false, err);
                }
                var response = {
                    ticketArray: [items]
                };
                callBack(true, items);
            });
        });
    },

    //Home
    getHomeDetails: function (callBack) {
        mongoDbObj.db.collection('ticket', function (err, collection) {

            var recentTickets = new Promise(function (resolve, reject) {
                collection.find({
                    createdDate: {
                        $gte: new Date("2010-04-29T00:00:00.000Z"),
                        $lt: new Date("2019-05-01T00:00:00.000Z")
                    }
                }).toArray(function (err, items) {
                    if (err) {
                        reject(err);
                    }
                    /// got recent tickets here
                    resolve(items);
                });
            });
            var allOpenTickets = new Promise(function (resolve, reject) {
                collection.find(
                    {
                        resolution: "Unresolved"
                    }
                ).toArray(function (err, items) {
                    if (err) {
                        reject(err);
                    }
                    /// got all open tickets here
                    resolve(items)
                });
            });
            var allClosedTickets = new Promise(function (resolve, reject) {
                collection.find(
                    {
                        resolution: "Resolved"
                    }
                ).toArray(function (err, items) {
                    if (err) {
                        reject(err);
                    }
                    /// got all closed tickets here
                    resolve(items)
                });
            });
            var allTickets = new Promise(function (resolve, reject) {
                collection.find().toArray(function (err, items) {
                    if (err) {
                        reject(err);
                    }
                    /// got all tickets here
                    resolve(items)
                });
            });

            Promise.all([recentTickets, allOpenTickets, allClosedTickets, allTickets])
                .done(function (results) {
                    var res = {
                        recent: results[0],
                        open: results[1],
                        closed: results[2],
                        all: results[3]
                    };
                    callBack(true, res);
                });
        });
    }


};
