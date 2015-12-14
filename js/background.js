/**
 * Created by gowrishankar.sunder on 12/13/15.
 */

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (sender.tab) {
            console.log("Received a message from tab: " + sender.tab.id);
            if (request.bq_limit) {
                console.log("Sending the limit of " + localStorage["bq_limit"]);
                sendResponse({bq_limit: localStorage["bq_limit"]});
            }

            else if (request.cost) {
                update_badge_status(sender.tab.id, request.cost, request.ratio);
                sendResponse({});
            }
        }
    });

// Shamelessly ripped off from http://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
function pickHex(weight) {
    var higher_color_code = [255, 0, 0];
    var lower_color_code = [0, 255, 0];
    var w = weight * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(higher_color_code[0] * w1 + lower_color_code[0] * w2),
        Math.round(higher_color_code[1] * w1 + lower_color_code[1] * w2),
        Math.round(higher_color_code[2] * w1 + lower_color_code[2] * w2)];
    return rgb;
}

function update_badge_status(tabId, cost, ratio) {
    chrome.browserAction.setBadgeText({text: "$" + cost, tabId: tabId});

    var rgb_for_cost = pickHex(ratio);
    rgb_for_cost.push(255); // Badge expects RGBA - so making it opaque always
    chrome.browserAction.setBadgeBackgroundColor({color: rgb_for_cost, tabId: tabId});
}