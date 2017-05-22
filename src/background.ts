import { Effect } from './globals';

const logOnClick = function(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
}

const sendMenuChoice = function(tab, chosen_effect: Effect) {
    chrome.tabs.sendMessage(tab.id, {
        'chosen_effect': chosen_effect
    });
}

let remove_channel = chrome.contextMenus.create({
    title: "Remove Channel", 
    contexts: ["image"]
});
chrome.contextMenus.create({
    title: "Red", 
    contexts: ["image"],
    parentId: remove_channel,
    onclick: (info, tab) => {
        logOnClick(info, tab);
        sendMenuChoice(tab, Effect.remove_red);
    }
});
chrome.contextMenus.create({
    title: "Green", 
    contexts: ["image"],
    parentId: remove_channel,
    onclick: (info, tab) => {
        logOnClick(info, tab);
        sendMenuChoice(tab, Effect.remove_green);
    }
});
chrome.contextMenus.create({
    title: "Blue", 
    contexts: ["image"],
    parentId: remove_channel,
    onclick: (info, tab) => {
        logOnClick(info, tab);
        sendMenuChoice(tab, Effect.remove_blue);
    }
});
chrome.contextMenus.create({
    title: "Alpha", 
    contexts: ["image"],
    parentId: remove_channel,
    onclick: (info, tab) => {
        logOnClick(info, tab);
        sendMenuChoice(tab, Effect.remove_alpha);
    }
});

chrome.contextMenus.create({
    title: "Invert Colors", 
    contexts: ["image"],
    onclick: (info, tab) => {
        logOnClick(info, tab);
        sendMenuChoice(tab, Effect.invert);
    }
});
