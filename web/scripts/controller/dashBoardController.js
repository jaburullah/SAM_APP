/**
 * Created by jaburur on 19-07-2017.
 */
var Tracking = Tracking || {};
Tracking.controller = Tracking.controller || {};


Tracking.controller.dashBoard = function(){




    $(".cls-menu-logout,.cls-logout").click(function(){
        //clear session

        app.model.logout({},function(data){
            if(data.logout==="success"){
                var sessionModel = app.model.getSession();
                sessionModel.clearSession();
                app.model.getView('login',function(data){
                    app.setView('login');
                });
            }
        });


    });

    $("#ulNav > li").click(function(){

        var dataName = $(this).attr('data-name');
        $("#ulNav > li").removeClass('active');
        $(this).addClass('active');
        $(".cls-dashboard-header-title-text").text($(this).text());
        $(".cls-tab-body-content").css({"display":"none"});
        $(".cls-body-"+dataName).css({"display":"block"});
        //$(".cls-tab-content").css({"display":"none"});
        //$(".cls-body-"+dataName+" .cls-tab-content[data-name='create']").css({"display":"block"});
        if(dataName==='apartment'){
            _initApartment();
        }
        else if(dataName === 'manager'){
            _initManager();
        }
        else if(dataName === 'user'){
            _initUser();
        }

    });

    $('.cls-home').click(function(){
        $(".cls-dashboard-header-title-text").text('Home');
        $(".cls-tab-body-content").css({"display":"none"});
        $(".cls-body-home").css({"display":"block"});
    });


    $(".cls-nav-tabs > li").click(function(){

        var dataName = $(this).parent('ul').attr('data-name');
        var siblingsDataName = $(this).attr('data-name');
        $(".cls-nav-tabs[data-name="+dataName+"] > li").removeClass('active-tab');
        $(this).addClass('active-tab');
        $(".cls-body-"+dataName+"  .cls-tab-content").css({"display":"none"});
        $(".cls-body-"+dataName+" .cls-tab-content[data-name="+siblingsDataName+"]").css({"display":"block"});

        if(dataName === 'apartment' && siblingsDataName === 'view'){

        }
        else if(dataName === 'manager' && siblingsDataName === 'view'){

        }
        else if(dataName === 'user' && siblingsDataName === 'view'){

        }

    });

    $(".cls-form-grp").click(function(e){
        var $this = $(this);
        $this.addClass('is-focused');
        //e.stopPropagation();
    });

    $(".cls-form-grp input").keyup(function(e){

        var $this = $(this).parent('.cls-form-grp');
        $this.addClass('is-empty');
        if ($(this).val()) {
            $this.removeClass('is-empty');
        }
        //e.stopPropagation();

    });
    $(".cls-form-grp input").focusout(function(){
        $(".cls-form-grp").removeClass('is-focused');
    });

    //init Apartment
    var _initApartment = function (){

        $("#btnAddApartment").unbind( "click" );
        $("#btnAddApartment").click(function(){

            var apartmentName = $("#txtApartmentName").val(),
                noOfFloor = $("#txtNoOfFloors").val(),
                address = $("#txtAddress").val();

            $(".cls-body-apartment .cls-form-grp").removeClass('has-error');
            if(!apartmentName){
                $("#txtApartmentName").parent('.cls-form-grp').addClass('has-error');
                return;
            }

            var newApartment = {
                name:apartmentName,
                floors:noOfFloor,
                address:address
            };

            var appartment = app.model.getApartmentModel();
            var allApartment = appartment.getApartment();
            for(var i=0; i <allApartment.length; i++){
                if(newApartment.name === allApartment[i].getName()){
                    alert('Apartment name '+newApartment.name+", already exists");
                    return
                }
            }

            appartment.addApartment(newApartment,function(data){
                _buildApartmentGrid();
                $('.cls-body-apartment input,.cls-body-apartment textarea').val('');
            });

        });

        var _buildApartmentGrid = function(){
            var appartment = app.model.getApartmentModel().getApartment();

            var i= 1, l = appartment.length,strHTML ='';
            while (l--){
                var ind = i-1;
                strHTML = strHTML+"<tr>" +
                    "<td class='cls-tbl-apprt-sno'>"+i+"</td>"+
                    "<td class='cls-tbl-apprt-name'>"+appartment[ind].getName()+"</td>"+
                    "<td class='cls-tbl-apprt-floor'>"+appartment[ind].getFloor()+"</td>"+
                    "<td class='cls-tbl-apprt-address'>"+appartment[ind].getAddress()+"</td>"+
                    "<td class='cls-tbl-apprt-action'>" +
                    "<span title='Edit' data-index="+ind+"  class='cls-tbl-action cls-tbl-action-edit'><i class='fa fa-1x fa-pencil'></i></span>"+
                    "<span title='Delete' data-index="+ind+" class='cls-tbl-action cls-tbl-action-delete'><i class='fa fa-1x fa-trash-o'></i></span>"+
                    "</td>"+
                    "</tr>";
                i++;
            }
            $(".cls-tbl-apartment-body").html(strHTML);
            $(".cls-tbl-action-delete").click(function(){
                var $this =$(this);
                var index = +$this.attr('data-index');
                var selectedApartment = appartment[index];
                if(confirm('You want to delete Apartment, '+selectedApartment.getName()) === true){
                    app.model.getApartmentModel().deleteApartment(selectedApartment,function(res){
                        _buildApartmentGrid();
                    })
                }
            });
        };
        _buildApartmentGrid();

    };

    // Manager
    var _initManager = function(){

        $("#btnAddManager").unbind( "click" );
        $("#btnAddManager").click(function(){

            var user = app.model.getUserModel();

            var name = $("#txtManagerName").val(),
                email = $("#txtEmail").val(),
                password = $("#txtManagerPassword").val(),
                mobileNo = $("#txtMobileNo").val(),
                roles = ["manager"],
                apartments = $(".clsSelApartment").val();

            if(!name || !email || !password || !mobileNo || !apartments.length){
                alert("Please enter the details");
                return;
            }

            var allUser = user.getUser(),bCheck=false;
            var i= 0,l = allUser.length;
            while (l--){
                if(email === allUser[i].getEmail() || mobileNo === allUser[i].getMobileNo()){
                    bCheck = true;
                    break;
                }

                i++;
            }

            if(bCheck){
                alert("Email Or Mobile No exists");
                return;
            }

            var manager = {
                name:name,
                email:email,
                password:password,
                mobileNo:mobileNo,
                roles:roles,
                apartments:apartments
            };

            user.save(manager,function(){
                $('.cls-body-manager input').val('');
                Tracking.utils.clearDropDown({selector:".clsSelApartment"});
                _buildManagerGrid();
            });


        });

        var _buildApartmentDropDown = function(){
            var option ={
                model:app.model.getApartmentModel().getApartment(),
                selector:".clsSelApartment",
                placeHolder:"Select Apartment"
            };
            Tracking.utils.buildDropDown(option);
        };
        var _buildManagerGrid = function(){

            var manager = app.model.getUserModel().getManager();

            var i= 1, l = manager.length,strHTML ='';
            while (l--){
                var ind = i-1;
                strHTML = strHTML+"<tr>" +
                    "<td class='cls-tbl-manager-sno'>"+i+"</td>"+
                    "<td class='cls-tbl-manager-name'>"+manager[ind].getName()+"</td>"+
                    "<td class='cls-tbl-manager-email'>"+manager[ind].getEmail()+"</td>"+
                    "<td class='cls-tbl-manager-mobile'>"+manager[ind].getMobileNo()+"</td>"+
                    "<td class='cls-tbl-manager-action'>" +
                    "<span title='Edit' data-index="+ind+"  class='cls-tbl-action cls-tbl-manager-action-edit'><i class='fa fa-1x fa-pencil'></i></span>"+
                    "<span title='Delete' data-index="+ind+" class='cls-tbl-action cls-tbl-manager-action-delete'><i class='fa fa-1x fa-trash-o'></i></span>"+
                    "</td>"+
                    "</tr>";
                i++;
            }
            $(".cls-tbl-manager-body").html(strHTML);
            $(".cls-tbl-manager-action-delete").click(function(){
                var $this =$(this);
                var index = +$this.attr('data-index');
                var selectedManager= manager[index];
                if(confirm('You want to delete manager, '+selectedManager.getName()) === true){
                    app.model.getUserModel().delete(selectedManager,function(res){
                        _buildManagerGrid();
                    })
                }
            });

        };

        _buildApartmentDropDown();
        _buildManagerGrid();

    };

    // user
    var _initUser = function(){

        $("#btnAddUser").unbind( "click" );
        $("#btnAddUser").click(function(){

            var user = app.model.getUserModel();

            var name = $("#txtUserName").val(),
                email = $("#txtUserEmail").val(),
                password = $("#txtUserPassword").val(),
                mobileNo = $("#txtUserMobileNo").val(),
                roles = ["user"],
                apartments = $(".clsSelUserApartment").val();

            if(!name || !email || !password || !mobileNo || !apartments.length){
                alert("Please enter the details");
                return;
            }

            var allUser = user.getUser(),bCheck=false;
            var i= 0,l = allUser.length;
            while (l--){
                if(email === allUser[i].getEmail() || mobileNo === allUser[i].getMobileNo()){
                    bCheck = true;
                    break;
                }

                i++;
            }

            if(bCheck){
                alert("Email Or Mobile No exists");
                return;
            }

            var newUser = {
                name:name,
                email:email,
                password:password,
                mobileNo:mobileNo,
                roles:roles,
                apartments:apartments
            };

            user.save(newUser,function(){
                $('.cls-body-user input').val('');
                Tracking.utils.clearDropDown({selector:".clsSelUserApartment"});
                _buildUserGrid();
            });


        });

        var _buildApartmentDropDown = function(){
            var option ={
                model:app.model.getApartmentModel().getApartment(),
                selector:".clsSelUserApartment",
                placeHolder:"Select Apartment"
            };
            Tracking.utils.buildDropDown(option);
        };
        var _buildUserGrid = function(){

            var user = app.model.getUserModel().getUser();

            var i= 1, l = user.length,strHTML ='';
            while (l--){
                var ind = i-1;
                strHTML = strHTML+"<tr>" +
                    "<td class='cls-tbl-manager-sno'>"+i+"</td>"+
                    "<td class='cls-tbl-manager-name'>"+user[ind].getName()+"</td>"+
                    "<td class='cls-tbl-manager-email'>"+user[ind].getEmail()+"</td>"+
                    "<td class='cls-tbl-manager-mobile'>"+user[ind].getMobileNo()+"</td>"+
                    "<td class='cls-tbl-manager-action'>" +
                        "<span title='Edit' data-index="+ind+"  class='cls-tbl-action cls-tbl-user-action-edit'><i class='fa fa-1x fa-pencil'></i></span>"+
                        "<span title='Delete' data-index="+ind+" class='cls-tbl-action cls-tbl-user-action-delete'><i class='fa fa-1x fa-trash-o'></i></span>"+
                    "</td>"+
                    "</tr>";
                i++;
            }
            $(".cls-tbl-user-body").html(strHTML);
            $(".cls-tbl-user-action-delete").click(function(){
                var $this =$(this);
                var index = +$this.attr('data-index');
                var selectedUser= user[index];
                if(confirm('You want to delete user, '+selectedUser.getName()) === true){
                    app.model.getUserModel().delete(selectedUser,function(res){
                        _buildUserGrid();
                    })
                }
            });

        };

        _buildApartmentDropDown();
        _buildUserGrid();
    };


    $(".clsViewTickets").click(function(){

        var dataName = $(this).attr("data-name");
        var data = null;
        if(dataName==="recent"){
            data = app.model.getRecentTicket();
        }
        else if(dataName === "open"){
            data = app.model.getOpenTicket();
        }
        else if(dataName==="closed"){
            data = app.model.getClosedTicket();
        }
        else if(dataName === "all"){
            data = app.model.getAllTicket();
        }
        _bindDashboardTicket(data);

    });

    var _bindDashboardTicket = function(data){
        var strHTML ='';
        var i = 0, l = data.length;
        while (l--){

            strHTML = strHTML+"<tr>" +
                                "<td>"+(i+1)+"</td>"+
                                "<td>"+data[i].getCategory()+"</td>"+
                                "<td>"+data[i].getPriority()+"</td>"+
                                "<td>"+data[i].getResolution()+"</td>"+
                                "</tr>";

            i++;
        }
        $(".cls-tbl-dashboard-tickets tbody").html(strHTML);

    };

    var _setPartialText = function(){
        //
        $("#h3RecentTicketCount").text(app.model.getRecentTicketCount());
        $("#h3OpenTicketCount").text(app.model.getOpenTicketCount());
        $("#h3ClosedTicketCount").text(app.model.getClosedTicketCount());
        $("#h3AllTicketCount").text(app.model.getAllTicketCount());
        //
        $(".cls-login-user").text('welcome, '+app.model.getSession().getUserName());
    };

    var _getCurrentUserDetails = function(){
        app.model.getSessionUserDetails(function(data){
            _setPartialText();
        });
    };
    var _getHomeDetails = function(callBack){
        app.model.getHomeDetails(function(data){
            callBack();
        });
    };

    var _init = function() {
        _getHomeDetails(function () {
            _getCurrentUserDetails();
            app.model.getApartmentDetails();
            app.model.getUserDetails();
        });
    };

    _init();

};