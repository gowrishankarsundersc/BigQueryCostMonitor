/**
 * Created by gowrishankar.sunder on 12/13/15.
 */

var tab_query_status = new Array();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (sender.tab) {
            console.log("Received a message from tab: " + sender.tab.id);
            tab_query_status[sender.tab.id] = request.query_status;
            sendResponse({received: true})
        }
});

function update_badge_status(badge_info) {
    chrome.browserAction.setBadgeText({text: badge_info.text});
}
