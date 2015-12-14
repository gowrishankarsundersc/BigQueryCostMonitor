/**
 * Created by gowrishankar.sunder on 12/13/15.
 */

var limits = new Array();
limits["cost"] = [0, 100];
limits["data"] = [0, 20];

var limit_ratio = 0.5; // This needs to be fetched from Chrome Storage and pre-calculated

function sync_value_from_store() {
    chrome.storage.sync.get({
        bq_limit: 50
    }, function(values) {
        limit_ratio = get_ratio(values.bq_limit);
        setup_slider(limit_ratio)
    });
}

function get_ratio(cost) {
    return cost/(limits["cost"][1] - limits["cost"][0]);
}
function get_cost(ratio) {
    return (limits["cost"][0] + ratio * (limits["cost"][1] - limits["cost"][0])).toFixed(2);
}

function get_data(ratio) {
    return (limits["data"][0] + ratio * (limits["data"][1] - limits["data"][0])).toFixed(2);
}

function setup_labels(ratio) {
    $("#cost").html("$" + get_cost(ratio));
    $("#data").html(get_data(ratio)+ " TBs");
}

function setup_slider(ratio) {
    setup_labels(ratio);
    $("#slider").simpleSlider("setRatio", ratio);
}

$(document).ready(function() {
    // Setup the value from storage as soon as possible
    sync_value_from_store();

    $("#slider").simpleSlider({theme: "volume", highlight: true});
    setup_slider(limit_ratio)

    $("#slider").bind("slider:ready slider:changed", function (event, data) {
        setup_labels(data.ratio);
        limit_ratio = data.ratio;
    });

    $("#save").click(function() {
        var cost_limit = get_cost(limit_ratio);
        console.log("Setting cost limit to $" + cost_limit);
        chrome.storage.sync.set({
            bq_limit: cost_limit
        }, function() {
            // Update status to let user know options were saved.
            console.log("New value saved");
        });
    });

    $("#clear").click(function() {
        sync_value_from_store();
    });
});