/**
 * Created by jaburur on 21-07-2017.
 */
var utils = {

    jsonResponse:function(session,flag,data){
        session.resetSession();
        return {success:flag,data:data};
    },
    viewResponse:function(session,flag,view,data){
        session.resetSession();
        return {success:flag,data:{view:view,data:data}};
    }
};


module.exports = utils;