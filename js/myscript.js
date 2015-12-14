// TODO: Ensure the website version matches assumptions on the site

var COST_PER_TB = 5;
var STORAGE_LOWER_TO_HIGHER = 1024;

function get_cost_limit_in_dollars() {
  // TODO: This needs to be stored as an option and fetched each time.
  return localStorage["bq_limit"];
}

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


//The RUN QUERY button
function find_run_button() {
  return $("#query-button-bar > .query-run").get(0);
}

// The text box containing information on the query costs/validation
function get_query_validation_text_node() {
  return $("#validate-status-box > .query-validate-status-text").get(0);
}

// Shamelessly ripped off from http://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
function getColor(value){
  //value from 0 to 1
  var hue=((1-value)*120).toString(10);
  return ["hsl(",hue,",100%,50%)"].join("");
}

var masking_button_node = null;

$(document).ready(function() {
  alert("limit: " + get_cost_limit_in_dollars());
  domObserverModule(document.getElementById('body'), hookup_cost_monitor_callback, true);
  $(".compose-query").click();
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

  // Trigger a click on the validator to ensure the query validations and costs are always visible to the user
  $("#query-validator > #validator-indicator").click();

  $(find_run_button()).click(function() {
    console.log('Query button has been clicked');
  });

  setup_masking_button(query_builder_node);
  domObserverModule(find_run_button(), position_masking_callback, false);
  domObserverModule(get_query_validation_text_node(), validation_callback, true);

  //Disconnect the observer
  return true;
}

function setup_masking_button(query_builder_node) {
  masking_button_node = $("<div id='monitoring_mask' style='background-color: transparent;'>  </div>");
  $(query_builder_node).append(masking_button_node);
  $(masking_button_node).click(function() {
    validate_query_cost();
  });
  position_masking_overlay();
}

function position_masking_callback(mutation) {
  var x = mutation;
  position_masking_overlay();
}

function position_masking_overlay() {
  var run_button_node = find_run_button();
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

function validation_callback(mutation) {
  console.log("Validation changed");
  console.dir(mutation);

  var query_cost = get_query_cost();
  var badgeText = "N/A";

  if (query_cost) {
    badgeText = "$" + (query_cost >= 10 ? Math.ceil(query_cost) : query_cost);
  } else {
    // Set color values alone here
  }

  //chrome.runtime.sendMessage({query_status: {text: badgeText}}, function(response) {
  //  console.log(response.received);
  //});

  // We never want to disconnect
  return false;
}

function get_query_cost() {
  var query_validation_info = $(get_query_validation_text_node()).html();
  var regex = /^This query will process ([0-9]*[\.[0-9]+]?) ([T|G|M|K]?B) when run\.$/g;

  var matches = regex.exec(query_validation_info);
  var cost = 0;
  if (matches && matches.length == 3) {
    var raw_data_count = parseFloat(matches[1]);
    switch(matches[2]) {
      case "KB":
        raw_data_count /= STORAGE_LOWER_TO_HIGHER;
      case "MB":
        raw_data_count /= STORAGE_LOWER_TO_HIGHER;
      case "GB":
        raw_data_count /= STORAGE_LOWER_TO_HIGHER;
    }
    return (raw_data_count * COST_PER_TB).toFixed(2);
  } else {
    return null;
  }
}

function validate_query_cost() {
  var query_cost = get_query_cost();
  if (query_cost == null) {
    console.log("Could not fetch the cost of the query. So, skipping validation");
    $(find_run_button()).click();
  }

  var cost_limit = get_cost_limit_in_dollars();
  if (query_cost > cost_limit) {
    alert("Query costs $" + query_cost + " which is more than the limit of $" + cost_limit);
  } else {
    console.log("Query cost is $" + query_cost);
    $(find_run_button()).click();
  }

  return true;
}