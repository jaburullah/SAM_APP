/**
 * Created by jaburur on 16-07-2017.
 */

var Tracking = Tracking || {};
Tracking.model = {};
Tracking.model.ArrayList = function(TemplateClass, data, parent) {
    var _data = data;
    var _list = Object.create( Array.prototype );
    _list = (Array.apply( _list ) || _list);

    var me = {
        //clear: function() {
        //    _data.length = 0;
        //    _list.length = 0;
        //},
        add: function() {
            var index = _data.length;
            _data.length++;
            _data[index] = {};
            if (arguments && arguments.length > 0) _data[index] = arguments[0];
            var item = new TemplateClass(_data[index], parent, me);
            _list.push(item);
            return item;
        },
        //copy: function(rep){
        //    var index = _data.length;
        //    _data.length++;
        //    _data[index] = rep;
        //    var item = new TemplateClass(_data[index], parent, me);
        //    _list.push(item);
        //    return item;
        //},
        findIndex: function(item) {
            var index = -1;
            var id = item.getId ? item.getId() : null;
            for (var i=0; i<_list.length; ++i) {
                var found = (id != null) ?
                _list[i].getId() === id :
                _list[i] === item;
                if (found) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        remove: function(item) {
            var index = this.findIndex(item);
            if (index >=0)
                me.removeByIndex(index);
            return index;
        },
        removeByIndex: function(index) {
            _list.splice(index, 1);
            _data.splice(index, 1);
        },
        //reorder: function(item, pos) {
        //    var index = $.inArray(item, _list);
        //    if (index >=0) {
        //        var _item = _data[index];
        //        me.removeByIndex(index);
        //
        //        _list.splice(pos,0,item);
        //        _data.splice(pos,0,_item);
        //    }
        //    return index;
        //},
        toArray: function() {
            return _list;
        },

        toData: function() {
            return _data;
        },
        //
        //getDefault: function(field, prefix) {
        //    var pattern = new RegExp("^" + prefix + " [1-9][0-9]*$");
        //    var map = {};
        //    for (var i=0; i<_data.length; ++i)
        //    {
        //        if (pattern.test(_data[i][field]))
        //        {
        //            var num = parseInt(_data[i][field].substring(prefix.length+1), 10);
        //            map[num] = true;
        //        }
        //    }
        //    for(var i=1; map[i]===true; ++i) {}
        //    return prefix + " " + (i);
        //}
    };

    //Push the data into the "Array" object
    for (var i=0; i<data.length; ++i)
        _list.push(new TemplateClass(data[i], parent, me));
    _list.add = function() {return me.add();};
    _list.copy = function(rep) {me.copy(rep)};
    _list.getDefault= me.getDefault;

    return me;
};

Tracking.model.base = function(){
    var modelView = {};

    var xhrService = Tracking.service.Xhr();
    var _session = null;
    var _apartment = null,
        _user=null,
        _recentTicket = null,
        _openTicket = null,
        _closeTicket = null,
        _allTicket = null,
        _ticket = null;


    var sessionModel = function(data){
        var _data = data;
        return {
            getUserName:function(){
                return _data ? (_data.name ? _data.name : undefined) : undefined;
            },
            getEmail:function(){
                return _data ? (_data.email ? _data.email : undefined): undefined;
            },
            isAdmin: function(){
                return _data ? (_data.roles ? (_data.roles.indexOf('admin')>=0) : undefined) : undefined;
            },
            clearSession:function(){
                for(var o in modelView){
                    if(o!=='login'){
                        delete modelView[o];
                    }
                }
                _data = null;
            }
        }
    };

    var _login = function (data,callBack){
        xhrService.postMethod('/login',data,function(res){
            _session = sessionModel(res);
            callBack();
        });
    };

    var _getSessionUserDetails = function (callBack){
        xhrService.getMethod('/userDetails',function(res){
            _session = sessionModel(res);
            callBack();
        });
    };

    var _logout = function(data,callBack){
        xhrService.postMethod('/logout',{},function(res){
            callBack(res);
        });
    };

    var _getView = function(view,callBack) {
        if(modelView[view]){
            if(callBack) callBack(modelView[view]);
        }
        else {
            xhrService.getMethod('/getView?view='+view,function(res){
                modelView[res.view] = res.data;
                if(callBack) callBack(modelView[res.view]);
            });
        }

    };

    var _getApartmentDetails = function(callBack){
        xhrService.getMethod('/apartmentDetails',function(res){
            _apartment = new Tracking.model.apartment(xhrService,res);
            if(callBack){
                callBack();
            }

        });
    };

    var _getUserDetails = function(callBack){
        xhrService.getMethod('/allUserDetails',function(res){
            _user = new Tracking.model.user(xhrService,res);
            if(callBack){
                callBack();
            }
        });
    };

    var _getHomeDetails = function(callBack){
        xhrService.getMethod('/homeDetails',function(res){

            _recentTicket = new Tracking.model.ticket(xhrService,res.recent);
            _openTicket = new Tracking.model.ticket(xhrService,res.open);
            _closeTicket = new Tracking.model.ticket(xhrService,res.closed);
            _allTicket = new Tracking.model.ticket(xhrService,res.all);

            if(callBack){
                callBack();
            }
        });
    };

    return {
        getSession:function(){
            return _session;
        },
        getUserDetails:_getUserDetails,
        login:_login,
        logout:_logout,
        getView:_getView,
        getApartmentDetails:_getApartmentDetails,
        getApartmentModel:function(){
            return _apartment;
        },
        getSessionUserDetails:_getSessionUserDetails,
        getUserModel:function(){
            return _user;
        },
        getHomeDetails:_getHomeDetails,
        getRecentTicket:function(){
            return _recentTicket.getTicket();
        },
        getOpenTicket:function(){
            return _openTicket.getTicket();
        },
        getClosedTicket:function(){
            return _closeTicket.getTicket();
        },
        getAllTicket:function(){
            return _allTicket.getTicket();
        },
        getRecentTicketCount:function(){
            return _recentTicket.getTicket().length;
        },
        getOpenTicketCount:function(){
            return _openTicket.getTicket().length;
        },
        getClosedTicketCount:function(){
            return _closeTicket.getTicket().length;
        },
        getAllTicketCount:function(){
            return _allTicket.getTicket().length;
        }
    }

};


Tracking.model.apartment = function(xhr,data){

    var apartmentModel = function(data){
        var _data = data;
        return{
            getId:function(){
                return _data._id;
            },
            getName:function(){
                return _data.name;
            },
            getFloor:function(){
                return _data.floors;
            },
            getAddress:function(){
                return _data.address;
            }
        }

    };
    var _apartment = new Tracking.model.ArrayList(apartmentModel,data);

    return{
        addApartment:function(data,callBack){
            xhr.postMethod('/saveApartment',data,function(res){
                _apartment.add(res);
                callBack(res);
            })
        },
        deleteApartment:function(data,callBack){
            xhr.postMethod('/deleteApartment',{id:data.getId()},function(res){
                _apartment.remove(data);
                callBack(res);
            })
        },
        getApartment:function(){
            return _apartment.toArray();
        }

    }

};

Tracking.model.user = function(xhr,data){

    var userModel = function(data) {

        var _data = data;

        return {
            getId:function(){
                return _data._id;
            },
            getName:function(){
                return _data.name;
            },
            getEmail:function(){
                return _data.email;
            },
            getMobileNo:function(){
                return _data.mobileNo;
            },
            getPassword:function(){
                return _data.password;
            },
            getRoles:function(){
                return _data.roles;
            },
            getApartment:function(){
                return _data.apartment;
            }
        }

    };

    var _user = new Tracking.model.ArrayList(userModel,data);

    return {
        save:function(data,callBack){
            xhr.postMethod('/saveUser',data,function(res){
                _user.add(res);
                callBack(res);
            });
        },
        "delete":function(data,callBack){
            xhr.postMethod('/deleteUser',{id:data.getId()},function(res){
                _user.remove(data);
                callBack(res);
            })
        },
        getAllUser:function(){
            return _user.toArray();
        },
        getManager:function(){
            var user =  _user.toArray();
            var manager = [];
            var i = 0, l  = user.length;
            while (l--){
                if(user[i].getRoles().indexOf('manager')>= 0){
                    manager.push(user[i]);
                }
                i++;
            }
            return manager;
        },
        getUser:function(){
            var allUser =  _user.toArray();
            var user = [];
            var i = 0, l  = allUser.length;
            while (l--){
                if(allUser[i].getRoles().indexOf('user')>= 0){
                    user.push(allUser[i]);
                }
                i++;
            }
            return user;
        }
    }


};

Tracking.model.ticket = function(xhr,data){


    var ticketModel = function(data) {

        var _data = data;

        return {
            getCategory:function(){
                return _data.category;
            },
            getUser:function(){
                return _data.user;
            },
            getManager:function(){
                return _data.manager;
            },
            getApartment:function(){
                return _data.apartment;
            },
            getPriority:function(){
                return _data.priority;
            },
            getStatus:function(){
                return _data.status;
            },
            getResolution:function(){
                return _data.resolution;
            },
            getCreatedDate:function(){
                return _data.createdDate;
            },
            getModifiedDate:function(){
                return _data.modifiedDate;
            }
        }

    };

    var _ticket = new Tracking.model.ArrayList(ticketModel,data);

    return {
        save:function(data,callBack){
            xhr.postMethod('/saveTicket',data,function(res){
                _ticket.add(data);
                callBack(res);
            })
        },
        "delete":function(){

        },
        getTicket:function(){
            return _ticket.toArray();
        }
    }
};
