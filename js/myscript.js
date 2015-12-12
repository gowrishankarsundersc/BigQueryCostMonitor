// TODO: Ensure the website version matches our expectation

//http://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
var domObserverModule = (function(){
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  return function(dom_node_to_observe, mutation_callback, watch_children) {
    if( MutationObserver ){
      observer_handle = new MutationObserver(function(mutations, observer){
        for(var mutation_idx = 0; mutation_idx < mutations.length; mutation_idx += 1) {
          if(mutation_callback(mutations[mutation_idx])) {
            observer.disconnect();
            break;
          }
        }
      });

      var observer_config = watch_children ?  { childList:true, subtree:true } : {attributes: true};
      observer_handle.observe(dom_node_to_observe, observer_config);
    }
  }
})();


var run_button_node = null;
var masking_button_node = null;

$(document).ready(function() {
  domObserverModule(document.getElementById('body'), hookup_cost_monitor_callback, true);
});

function hookup_cost_monitor_callback(mutation) {
  var query_builder_node = null;
  if (mutation.addedNodes.length) {
    for (var added_node_idx = 0; added_node_idx < mutation.addedNodes.length; added_node_idx += 1) {
      var added_node = mutation.addedNodes[added_node_idx];
      if (added_node.nodeName == "BQ-QUERY-BUILDER") {
        // Proceed only if the added node is the query builder
        query_builder_node = added_node;
        break;
      }
    }
  }

  if (query_builder_node == null) {
    //Dont disconnect the observer yet
    return false;
  }

  // Trigger a click on the validator to ensure the validations are always visible to the user
  $("#query-validator > #validator-indicator").click();

  run_button_node = $("#query-button-bar > .query-run").get(0);

  setup_masking_button(query_builder_node);
  //domObserverModule(run_button_node, position_masking_callback, false);

  $(run_button_node).click(function(event) {
    alert("On-Click works!");
  });

  //Disconnect the observer
  return true;
}

function setup_masking_button(query_builder_node) {
  masking_button_node = $("<div id='monitoring_mask' style='background-color: transparent;'>  </div>");
  $(query_builder_node).append(masking_button_node);
  $(masking_button_node).click(function() {
    console.log("Overlay button clicked");
  });
  position_masking_overlay();
}

function position_masking_callback(mutation) {
  position_masking_overlay();
}

function position_masking_overlay() {
  var rect = run_button_node.getBoundingClientRect();
  console.log(rect.top, rect.right, rect.bottom, rect.left);
  console.log($(run_button_node).height() + " : " + $(run_button_node).width());

  $(masking_button_node).position({
    my: "left top",
    at: "left top",
    of: $(run_button_node)
  });

  $(masking_button_node).height($(run_button_node).outerHeight());
  $(masking_button_node).width($(run_button_node).outerWidth());

  $(masking_button_node);

  // We never want to disconnect
  return false;
}

function alert_query_cost() {
  var query_validation_info = $("#validate-status-box.query-validate-status-text").html();
  var regex = "This query will process ([0-9]*[\.[0-9]+]?) ([T|G|M|K]?B) when run\.";

  matches = regex.exec(query_validation_info);
  if (matches.length == 2) {
    alert (matches[1] + " : " + matches[2]);
  }

  return true;
}