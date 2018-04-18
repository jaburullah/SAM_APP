/**
 * Created by jaburur on 12-08-2017.
 */
var Tracking = Tracking || {};
Tracking.utils = Tracking.utils || {};

Tracking.utils.buildDropDown = function (opt) {
    var model = opt.model;
    var i = 1, l = model.length, strHTML = '';
    while (l--) {
        var ind = i - 1;
        strHTML = strHTML + "<option value='" + model[ind].getId() + "'>" + model[ind].getName() + "</option>";
        i++;
    }
    $(opt.selector).html(strHTML);
    $(opt.selector).val('').fSelect({placeholder: opt.placeHolder});
    $(opt.selector).fSelect("reload");

};

Tracking.utils.clearDropDown = function(opt){

    $(opt.selector).parent().find(".fs-dropdown").find(".fs-option").removeClass('selected');
    $(opt.selector).fSelect('reloadDropdownLabel');
}