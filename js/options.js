/**
 * Created by gowrishankar.sunder on 12/13/15.
 */

var limits = new Array();
limits["cost"] = [0, 100];
limits["data"] = [0, 20];

var limit_ratio = null;
var local_storage_key = "bq_limit";

function sync_value_from_store() {
    chrome.storage.sync.get({
        bq_limit: 50
    }, function(values) {
        limit_ratio = get_ratio(values.bq_limit);
        setup_slider(limit_ratio);
    });
}

function get_ratio(cost) {
    return Math.max(0, cost - limits["cost"][0])/(limits["cost"][1] - limits["cost"][0]);
}
function get_cost(ratio) {
    return (limits["cost"][0] + ratio * (limits["cost"][1] - limits["cost"][0])).toFixed(2);
}

function get_data(ratio) {
    return (limits["data"][0] + ratio * (limits["data"][1] - limits["data"][0])).toFixed(2);
}

function setup_labels(ratio) {
    $("#cost").html("$ " + get_cost(ratio));
    $("#data").html(get_data(ratio)+ " TBs");
}

function setup_slider(ratio) {
    setup_labels(ratio);
    $("#slider").simpleSlider("setRatio", ratio);
}

$(document).ready(function() {
    // Setup the value from storage as soon as possible
    limit_ratio = get_ratio(localStorage[local_storage_key]);

    $("#slider").simpleSlider({theme: "volume", highlight: true});
    setup_slider(limit_ratio);

    $("#slider").bind("slider:changed", function (event, data) {
        setup_labels(data.ratio);
        limit_ratio = data.ratio;
    });

    $("#save").click(function() {
        var cost_limit = get_cost(limit_ratio);
        console.log("Setting cost limit to $" + cost_limit);
        localStorage[local_storage_key] = cost_limit;
    });

    $("#clear").click(function() {
        limit_ratio = localStorage[local_storage_key];
        setup_slider(limit_ratio);
    });
});