import { Effect } from './globals';
import { effects } from './effects';

const logOnClick = function(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    //console.log("info: " + JSON.stringify(info));
    //console.log("tab: " + JSON.stringify(tab));
}

const sendMenuChoice = function(tab, chosen_effect: Effect) {
    chrome.tabs.sendMessage(tab.id, {
        'chosen_effect': chosen_effect
    });
}

const createMultipleEffectButtons = function(buttons: {title: string, effect: Effect}[], parent_title: string = null) {
    let parent_id = null;
    if (parent_title !== null) {
        parent_id = chrome.contextMenus.create({
            title: parent_title, 
            contexts: ["image"]
        })
    }
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
        title: "Reset",
        effect: Effect.reset
    },
    {
        title: "Random",
        effect: Effect.random
    }
    /* TODO: Replace window.localStorage with storage from chrome extension api, since the popup page is considered its own domain localStorage wont work.
    {
        title: "Custom Convolution",
        effect: Effect.custom_convolution
    }
    */
]);


createMultipleEffectButtons([
    {
        title: "Remove Red",
        effect: Effect.remove_red
    },
    {
        title: "Remove Green",
        effect: Effect.remove_green
    },
    {
        title: "Remove Blue",
        effect: Effect.remove_blue
    },
    {
        title: "Remove Alpha",
        effect: Effect.remove_alpha
    }
], "Channels");

createMultipleEffectButtons([
    {
        title: "Invert",
        effect: Effect.invert
    },
    {
        title: "Grey Scale",
        effect: Effect.greyscale
    }, 
    {
        title: "Threshold (avg. lum.)",
        effect: Effect.threshold
    }
], "Colors");

createMultipleEffectButtons([
    {
        title: "Box Blur",
        effect: Effect.boxblur
    },
    {
        title: "Gaussian Blur",
        effect: Effect.gaussianblur
    },
    {
        title: "Sharpen",
        effect: Effect.sharpen
    }, 
    {
        title: "Sobel",
        effect: Effect.sobelfilter
    }
], "Filters");

createMultipleEffectButtons([
    {
        title: "Highlight Edges",
        effect: Effect.highlight_edges
    }, 
    {
        title: "Enter the matirx",
        effect: Effect.matrix
    }, 
    {
        title: "Hard blur",
        effect: Effect.hardblur
    }
], "Composite");