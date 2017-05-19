import * as $ from 'jquery';

console.log("Code injected");

//content script
var clickedEl = null;

$(document).mousedown((eventObject: JQueryMouseEventObject) => {
    console.log(eventObject.target);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == "getClickedEl") {
        console.log("element:", clickedEl);
        sendResponse(clickedEl);
    }
});


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.color) {
        console.log('Receive color = ' + msg.color);
        document.body.style.backgroundColor = msg.color;
        sendResponse('Change color to ' + msg.color);
    } else {
        sendResponse('Color message is none.');
    }
});
