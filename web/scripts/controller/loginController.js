/**
 * Created by jaburur on 17-07-2017.
 */
var Tracking = Tracking || {};
Tracking.controller = Tracking.controller || {};


Tracking.controller.login = function(){

    $("#btnLogin").click(function(){


        var userName = $("#txtUserName").val();
        var password = $("#txtPassword").val();
        if(!userName && !password){
            alert("Please enter the values");
            return;
        }

        app.model.login({username:userName,password:password},function(){
            var sessionModel = app.model.getSession();
            if(!sessionModel.isAdmin()){
                alert('Invalid User');
                return;
            }

            app.setView('dashboard');


        });

    });

};

