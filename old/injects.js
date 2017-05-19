console.log("Code injected");

//content script
var clickedEl = null;

document.addEventListener("contextmenu", function(event){
    clickedEl = event.target;
}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request == "getClickedEl") {
        console.log("element:", clickedEl);
        sendResponse(clickedEl);
    }
});