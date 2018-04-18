/**
 * Created by jaburur on 16-07-2017.
 */
var express = require('express');
var bodyParser = require('body-parser');
var connect = require('connect');
var upload  = require('express-fileupload');
// var upload = multer({ dest: 'uploads/' });

var app = express();
//Public enable folder
app.use(express.static(__dirname +'/web'));
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(connect.json());
app.use(connect.urlencoded());
app.use(upload());

/// custom module
var theApp = require('./server/app.js');

var db = require('./server/db.js');
db.init();
var fo = require('./server/file.js');
var sessionModel = require('./server/session.js');
var _session = sessionModel(null);
var utils = require('./server/utils.js');







// routes will go here
// start the server
//get Views
app.get('/getView',function(req,res){

    var file = "login";
    if(_session){
        if(_session.isAdmin() && req.query.view=='login'){
            file ="dashboard";
        }
        else {
            file = req.query.view;
        }
    }
    else {
        file = req.query.view;
    }

    fo.readHTML(file,function(state,data){
        var result = utils.viewResponse(_session,state,file,data);
        res.json(result);
    });
});

//Landing
app.get('/index', function (req, res) {
    res.sendFile( __dirname + "/web/index.html" );
});

//Current User Details
app.get('/userDetails',function(req,res){
    if(_session){
        res.json(utils.jsonResponse(_session,true,_session.getRawData()));
    }
    else {
        res.json(utils.jsonResponse(_session,true,{}));
    }
});

// Home
app.get('/homeDetails',function(req,res){
    db.getHomeDetails(function(status,data){
        res.json(utils.jsonResponse(_session,status,data));
    });
});


//Mobile Login
app.post('/mobileLogin',function(req,res) {


    var userName = req.body.username;
    var password = req.body.password;
    var fireBaseId = req.body.fireBaseId;

    var searchObj = {
        fireBaseId:fireBaseId,
        password: password
    };
    if (isNaN(userName)) {
        searchObj.email = userName.toLowerCase();
    }
    else {
        searchObj.mobileNo = userName
    }

    db.mobileLogin(searchObj, function (status, data) {
        //_session.update(data);
        res.json(utils.jsonResponse(_session, status, data));
    });

});
app.post('/appInfo',function(req,res){

    var userID = req.body.userId;

    db.appInfo({userId:userID}, function (status, data) {
        //_session.update(data);
        res.json(utils.jsonResponse(_session, status, data));
    });

});
// mobile logout
app.post('/mobileLogout',function(req,res) {
    var email = req.body.email;
    var userId = req.body.userId;
    var searchObj = {
        email: email.toLowerCase(),
        userId:userId
    };

    db.mobileLogout(searchObj, function (status, data) {
        //_session.update(data);
        res.json(utils.jsonResponse(_session, status, data));
    });

});
//Login
app.post('/login',function(req,res) {
    var userName=req.body.username;
    var password=req.body.password;
    //fcm.send(fcm.prepareNotification());
    db.login({userName:userName,password:password},function(status,data){
        _session.update(data);
        res.json(utils.jsonResponse(_session,status,data));
    });

});
app.post('/logout', function (req, res) {
    _session.update(null);
    res.json(utils.jsonResponse(_session,true,{logout:"success"}));
});

//Apartment
app.post('/saveApartment',function(req,res){
    var apartment = {
        id:req.body.id,
        name:req.body.name,
        floors:req.body.floors,
        address:req.body.address
    };

    db.saveApartment(apartment,function(status,data){
        res.json(utils.jsonResponse(_session,status,data));
    });
});
app.post('/deleteApartment',function(req,res){
    var apartment = {
        name:req.body.name
    };
    db.deleteApartment(apartment,function(status,data){
        res.json(utils.jsonResponse(_session,status,{}));
    });
});
app.get('/apartmentDetails',function(req,res){
    db.getApartmentDetails(function(status,data){
        res.json(utils.jsonResponse(_session,status,data));
    });
});

//Manager
app.post('/saveManager',function(req,res){
    var user = {
        id:req.body.id,
        name:req.body.name,
        email:req.body.email.toLowerCase(),
        password:req.body.password,
        mobileNo:req.body.mobileNo,
        roles:req.body.roles.split(","),
        apartments:req.body.apartments.split(",")
    };

    db.saveManager(user,function(status,data){
        res.json(utils.jsonResponse(_session,status,{}));
    });
});
app.post('/saveManager',function(req,res){
    var user = {
        id:req.body.id,
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        mobileNo:req.body.mobileNo,
        roles:req.body.roles.split(","),
        apartments:req.body.apartments.split(",")
    };

    db.saveManager(user,function(status,data){
        res.json(utils.jsonResponse(_session,status,{}));
    });
});
app.post('/deleteManager',function(req,res){
    var user = {
        id:req.body.id
    };
    db.deleteManager(user,function(status,data){
        res.json(utils.jsonResponse(_session,status,{}));
    });
});
app.get('/allManagerDetails',function(req,res){
    db.getAllManagerDetails(function(status,data){
        res.json(utils.jsonResponse(_session,status,data));
    });
});

//User
app.post('/saveUser',function(req,res){
    var user = {
        id:req.body.id,
        name:req.body.name,
        password:req.body.password,
        email:req.body.email.toLowerCase(),
        mobileNo:req.body.mobileNo,
        roles:req.body.roles,
        apartments:req.body.apartments
    };

    db.saveUser(user,function(status,data){
        res.json(utils.jsonResponse(_session,status,data));
    });
});
app.post('/deleteUser',function(req,res){
    var user = {
        id:req.body.id
    };
    db.deleteUser(user,function(status,data){
        res.json(utils.jsonResponse(_session,status,{}));
    });
});

///////////////////////////////////////////////////
app.get('/allUserDetails',function(req,res){
    db.getAllUserDetails(function(status,data){
        res.json(utils.jsonResponse(_session,status,data));
    });
});

//Tickets
app.post('/saveTicket',function(req,res){
    /*
    Ticket Details
     Type: ["Electrical","Plumbing"]
     //User:
     //Manager:
     //Apartment:
     Priority: Critical, High, Medium, Low
     Status: Open, InProgress, Closed, Reopen,
     Summary:
     */


    var ticket = {
        //pre declared
        id:req.body.id,
        no:parseInt(new Date().getTime()),
        // user given
        category:req.body.category,
        userId:req.body.userId,
        apartmentId:req.body.apartmentId,
        managerId:req.body.managerId,
        priority:req.body.priority,
        status:req.body.status,
        description:req.body.description,
        createdDate:new Date(),
        modifiedDate:new Date(),
        isManagerAction:req.body.isManagerAction
    };
    if(ticket.id){
        delete ticket.createdDate;
        ticket.modifiedDate =new Date();
    }

    db.saveTicket(ticket,req.body.actionUserId,function(status,data){
        res.json(utils.jsonResponse(_session,status,ticket));
    });
});
app.post('/deleteTicket',function(req,res){
    var ticket = {
        id:req.body.id
    };

    db.deleteTicket(ticket,function(status,data){
        res.json(utils.jsonResponse(_session,status));
    });
});
app.post('/userTicket',function(req,res) {
    var userID = req.body.userId;
    var apartmentId = req.body.apartmentId;
    var filters = req.body.filters;
    var categoryFilters = [];
    var priorityFilters = [];
    var statusFilters = [];
    if(filters){
         categoryFilters = filters.categoryFilters || [];
         priorityFilters = filters.priorityFilters || [];
         statusFilters = filters.statusFilters || [];
    }


    db.userTicket({userId:userID,apartmentId:apartmentId,categoryFilters:categoryFilters,priorityFilters:priorityFilters,statusFilters:statusFilters},function (status, data) {
        res.json(utils.jsonResponse(_session, status, data));
    });
});
app.post('/managerTicket',function(req,res) {
    var userID = req.body.userId;
    var apartmentId = req.body.apartmentId;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;


    db.managerTicket({userId:userID,apartmentId:apartmentId,startDate:startDate,endDate:endDate},function (status, data) {
        res.json(utils.jsonResponse(_session, status, data));
    });
});
app.post('/getTicketById',function(req,res) {
    var userID = req.body.userId;
    var ticketId = req.body.ticketId;


    db.getTicketById({userId:userID,ticketId:ticketId},function (status, data) {
        res.json(utils.jsonResponse(_session, status, data));
    });
});

app.get('/allTicketDetails',function(req,res){
    db.getAllTicketDetails(function(status,data){
        res.json(utils.jsonResponse(_session,status,data));
    });
});


app.get('/getVideos',function(req,res){
    fo.readJSON('videos',function(state,data){ 
        res.json(data);
    });
});

/// file upload
var fs = require('fs');
app.post('/upload', function(req, res) {
    console.log(req.files.file.originalFilename);
    console.log(req.files.file.path);

    var newPath = "uploads/" + 	req.files.file.name;
    fs.writeFile(newPath, req.files.file.data, function (err) {
                if(err){
                    res.json({'response':"Error"});
                }else {
                    res.json({'response':"Saved"});
                }
            });


    // fs.readFile(req.files.file.data, function (err, data){
    //     var dirname = "/home/rajamalw/Node/file-upload";
    //     var newPath = "/uploads/" + 	req.files.file.originalFilename;
    //     fs.writeFile(newPath, data, function (err) {
    //         if(err){
    //             res.json({'response':"Error"});
    //         }else {
    //             res.json({'response':"Saved"});
    //         }
    //     });
    // });
});

// var storage = multer.diskStorage({
//     destination: function(req, file, callback) {
//         callback(null, 'uploads/')
//     },
//     filename: function(req, file, callback) {
//         console.log(file);
//         callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// });
// var upload = multer({
//     storage: storage
// }).array("imgUploader", 3); //Field name and max count

// app.post('/upload', function (req, res) {
//     // req.file is the `avatar` file
//     // req.body will hold the text fields, if there were any
//     console.log(req.files.image.originalFilename);
//     console.log(req.files.image.path);
//
//     // var upload = multer({
//     //     storage: storage
//     // }).single('uploaded_file');
//     // upload(req, res, function(err) {
//     //     res.end('File is uploaded')
//     // })
//
// })


app.get('/uploads/:file', function (req, res){
    file = req.params.file;
    var dirname = "/home/rajamalw/Node/file-upload";
    var img = fs.readFileSync(dirname + "/uploads/" + file);
    res.writeHead(200, {'Content-Type': 'image/jpg' });
    res.end(img, 'binary');

});


//end server
//app.listen(theApp.port);
var http = require('http').Server(app);
var io = require('socket.io')(http);


io.on('connection', function(socket){
    console.log('a user connected'+socket.id);
    socket.on('TicketCreated',function(){
            console.log('Ticket Created By: '+socket.id);
            var allSocket = io.sockets.sockets;
            allSocket.forEach(function(soc){

                if(soc.id!= socket.id){
                    soc.emit('Ticket',{data:"test"})
                }

            });


        });

    socket.on('disconnect',function(){
        console.log('a user disconnected'+socket.id);
    });
});

http.listen(theApp.port, function(){
    console.log('listening on *:'+theApp.port);
});

console.log('Server started! At http://'+theApp.ip+':' + theApp.port);



