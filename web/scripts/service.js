/**
 * Created by jaburur on 16-07-2017.
 */
var Tracking = Tracking || {};
Tracking.service = {};

Tracking.service.Xhr = function() {
    //var _url = 'http://localhost:8083';
    var _url = 'https://lakalaka.herokuapp.com';

    var _updateURL = function(url){
        return _url+url;
    };

    var ajaxQueue = [];

    var _ajax = function (obj){
        $.ajax({
            url: _updateURL(obj.url),
            dataType: "json",
            type: obj.type,
            contentType: 'application/json',
            data: obj.data && JSON.stringify(obj.data) || null,
            processData: false,
            success: function( res){
                _successCallBack(res,obj);
                if(obj.success) obj.success(res.data);
            },
            error: function(err ){
                _errorCallBack(err,obj);
                if(obj.error) obj.error(err);
            }
        });
    };

    var removeAjaxQueue = function (obj) {

        var i= 0, l = ajaxQueue.length;

        while (l--){
            if(obj.id === ajaxQueue[i].id)
            {
                ajaxQueue.splice(i,1);
                break;
            }
            i++;
        }


    };

    var _successCallBack = function(data,obj){
        removeAjaxQueue(obj);
    };

    var _errorCallBack = function(data,obj){
        removeAjaxQueue(obj);
    };

    var xhrService = {
        getMethod:function(url,callBack,errCallBack){
            var ajaxObj = {
                id: new Date().getTime(),
                url: url,
                type: 'get',
                success: callBack || _successCallBack,
                error: errCallBack || _errorCallBack
            };

            var xhr = _ajax(ajaxObj);
            ajaxObj.xhr = xhr;
            ajaxQueue.push(ajaxObj);
        },
        postMethod:function(url,data,callBack,errCallBack){
            var ajaxObj = {
                id: new Date().getTime(),
                url: url,
                type: 'post',
                data:data,
                success: callBack || _successCallBack,
                error: errCallBack || _errorCallBack
            };

            var xhr = _ajax(ajaxObj);
            ajaxObj.xhr = xhr;
            ajaxQueue.push(ajaxObj);
        }
    };

    return xhrService

};
