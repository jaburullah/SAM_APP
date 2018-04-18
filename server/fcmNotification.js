/**
 * Created by jaburur on 22-08-2017.
 */
var theApp = require('./app.js');
var FCM = require('fcm-push');
var fcm = {
    fcm:null,
    init:function(){
        console.log("FCM is ready");
        this.fcm = new FCM(theApp.fcmServerKey);
    },
    prepareNotification:function(sendObj){
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: sendObj.to,
            collapse_key: "",

            notification: {
                title: sendObj.title,
                body: sendObj.body,
                click_action: sendObj.clickAction,
                sound:"default"
            },

            data: {  //you can send only notification or only data(or include both)
                ticketInfo:sendObj.ticketInfo,
                actionDoneBy: sendObj.actionDoneBy
            }
        };
        console.log(message);
        return message;
    },
    send:function(msg){
        this.fcm.send(msg, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    }
};


module.exports = fcm;

//
// var dummy  = {
//     ticketId: "5a9d75a12e6d3210a7891323",
//     userFireBaseId:"f390ZYL0IV8:APA91bFgl8LBfqMw02UtegGdhQOXfoAcF_O_tS4CNZXd0yBlnssxFU22F2Fh1WEaJ_T4-AOrUvPehIIwUYaZuPsQSEyVRvmRJVIcpLYOWaWTDgV6spuuKP9wkiNHGMGebZuJdIyPCKP2",
//     user2FireBaseId:"fLdXMRVOnss:APA91bF9bqTonBDexdYwOoiHPSfmGhBNYbHah26CSxSPmScdHJDWt1YmdeJCTB9AT-sEhqKTOIE0WPozAaXpKF7Pomw377T_93SWBtC08iDkX-zD9_gvKK8Q6wuf4jAxny4hV27IWqPM",
//     managerFireBaseId:"cbbsG8F6MKM:APA91bEJWSkHMqNlR3bI7ZAymwao1h6g6g6TGCaTBvsJZzCaa1AivecKDtz-KTvHgloZ6x0uSpqXWHV_fnjEtNgj0MTAzixlalKlfRcNnR2zQSZbi0_cnFUgfS5IMxoV4F-4ph6JmVpW",
//     userAction:"CreateTicketActivity",
//     managerAction:"ManagerTicketActivity"
// }
//
// fcm.init();
// var msg = fcm.prepareNotification(
//     dummy.managerFireBaseId,
//     "Test",
//     "Body",
//     {id:dummy.ticketId,userId: "5a9ac2a5469ec97fe12cf038"},
//     dummy.managerAction
// )
// fcm.send(msg);
//
// msg = fcm.prepareNotification(
//     dummy.userFireBaseId,
//     "Test",
//     "Body",
//     {id:dummy.ticketId},
//     dummy.userAction
// )
//
// fcm.send(msg);
//
// msg.to = dummy.user2FireBaseId;
// fcm.send(msg);





