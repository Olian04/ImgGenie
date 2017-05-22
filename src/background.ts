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

const createMultipleEffectButtons = function(buttons: {title: string, effect: Effect}[], parent_id = null) {
    for (let i = 0; i < buttons.length; i++) {
        chrome.contextMenus.create({
            title: buttons[i].title, 
            contexts: ["image"],
            parentId: parent_id,
            onclick: (info, tab) => {
                logOnClick(info, tab);
                sendMenuChoice(tab, buttons[i].effect);
            }
        });
    }
}

createMultipleEffectButtons([
    {
        title: "Red",
        effect: Effect.remove_red
    },
    {
        title: "Green",
        effect: Effect.remove_green
    },
    {
        title: "Blue",
        effect: Effect.remove_blue
    },
    {
        title: "Alpha",
        effect: Effect.remove_alpha
    }
], chrome.contextMenus.create({
    title: "Remove Channel", 
    contexts: ["image"]
}));

createMultipleEffectButtons([
    {
        title: "Invert Colors",
        effect: Effect.invert
    },
    {
        title: "Grey Scale",
        effect: Effect.greyscale
    }
]);
