import * as $ from 'jquery';
import { Effect } from './globals';
import { effects } from './effects';

let clickedImageSource: string = null;
let clickedEl: Element = null;
$(document).contextmenu((eventObject: JQueryMouseEventObject) => {
    // Locates the target of the right click that opened the context menu.
    clickedEl = eventObject.target;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.chosen_effect !== undefined) {
        let img = <HTMLImageElement>clickedEl;
        if (!img.getAttribute("original-source")) {
            img.setAttribute("original-source", img.src); // Store the original image
        }
        replaceImage(img, request.chosen_effect);
    }
});

const replaceImage = function(img: HTMLImageElement, chosenEffect: Effect) {
    if (chosenEffect === Effect.reset) {
        img.src = img.getAttribute("original-source"); // Fetch original image
        img.removeAttribute("original-source"); // Cleanup
        return;
    }
    let canvas = getCanvasFromImageTag(img);
    effects[chosenEffect](canvas);
    img.src = canvas.toDataURL("image/png");
}

const getCanvasFromImageTag = function(img: HTMLImageElement): HTMLCanvasElement {
  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext("2d").drawImage(img, 0, 0);
  return canvas
}