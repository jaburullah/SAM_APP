/**
 * Created by jaburur on 16-07-2017.
 */
var Tracking = Tracking || {};
Tracking.controller = Tracking.controller || {};

Tracking.controller.base = function(){

    var _view = 'login';

    this.model = Tracking.model.base();

    this.setView = function(view){
        _view = view || _view;
        this.model.getView(_view,function(res){
            $('.cls-body').html(res);
        });

    };

};

var app = new Tracking.controller.base();



var _init = function (){
    app.setView();
    //make chain the  controllers

};


_init();