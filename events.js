function eventParser(topic) {
  var event = {};
  var tokens = topic.split(' ');
  event.day = tokens[0];
  if (!event.day.match(/^\d\d\/\d\d\/\d\d\d\d+$/)) {
    throw 'Not in expected format';
  }
  var dateTokens = tokens[0].split('/');
  event.date = new Date(dateTokens[2], dateTokens[1] - 1, dateTokens[0], 0, 0);

  if (tokens[1].match(/^\d\d:\d\d+$/)) {
    event.time = tokens[1];
    event.title = topic.substr(17);
  } else {
    event.time = "";
    event.title = topic.substr(11);
  }

  return event;
};

function parseEvents(data) {
  data.topic_list.topics.forEach(function(topic) {
    var event;
    try {
      event = eventParser(topic.title);
    } catch(e) {
      return;
    }
    if (event.date > Date.now() - 86400000) {
      eventsExist = true;
      var link = "https://community.lambdaspace.gr/t/" + topic.id;
      document.getElementById("events").innerHTML += "<tr class=\"clickable\" url=\"" + link + "\"> <td>" + event.day + "</td> <td>" + event.time + "</td> <td>" + event.title + "</td> </tr>";
    }
  });
};

var eventsExist = false;
var port = chrome.runtime.connect({name: "eventData"});

port.onMessage.addListener(function(eventsJSON) {
  parseEvents(JSON.parse(eventsJSON));

  if (eventsExist) {
    Array.from(document.getElementsByClassName("clickable")).forEach(function(eventRow) {
      eventRow.onclick = function() {
        window.open(eventRow.getAttribute("url"));
      };
    });
  } else {
    document.getElementById("events").outerHTML = "<p> There are currently no upcoming events <br> Check again later and have a nice day :) </p>";
  }

  document.getElementsByTagName("script")[0].remove();

  //Send the current content of body to the background script
  chrome.runtime.connect({name: "HTMLData"}).postMessage(document.getElementsByTagName("body")[0].innerHTML);

  //Set the popup's HTML document to the dummy one
  chrome.browserAction.setPopup({popup: "eventsDummy.html"});
});
