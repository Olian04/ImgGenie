import * as $ from 'jquery';
import { Effect } from './globals';

let effects: ((canvas: HTMLCanvasElement) => void)[] = [];
let clickedEl: Element = null;

$(document).contextmenu((eventObject: JQueryMouseEventObject) => {
    // Locates the target of the right click that opened the context menu.
    clickedEl = eventObject.target;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Response:', request);
    if (request.chosen_effect !== undefined) {
        replaceImage(<HTMLImageElement>clickedEl, request.chosen_effect);
    }
});

const replaceImage = function(img: HTMLImageElement, chosenEffect: Effect) {
    let canvas = getCanvasFromImageTag(img);
    effects[chosenEffect](canvas);
    let dataURL = canvas.toDataURL("image/png");
    img.src = dataURL;
}

const getCanvasFromImageTag = function(img: HTMLImageElement): HTMLCanvasElement {
  let canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext("2d").drawImage(img, 0, 0);
  return canvas
}

const effectCore = function(canvas: HTMLCanvasElement, effectBody: (imgData: ImageData) => void) {
    let ctx = canvas.getContext('2d');
    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    effectBody(imgData);
    ctx.putImageData(imgData, 0, 0);
}

const removeChannels = function(imgData: ImageData, channels: {red?: boolean, green?: boolean, blue?: boolean, alpha?: boolean}) {
    var data = imgData.data;
    for(var i=0; i<data.length; i+=4) { /* RGBA */
        data[i] = channels.red ? 0 : data[i]; 
        data[i+1] = channels.green ? 0 : data[i+1]; 
        data[i+2] = channels.blue ? 0 : data[i+2]; 
        data[i+3] = channels.alpha ? 0 : data[i+3]; 
    }
}

effects[Effect.invert] = (canvas: HTMLCanvasElement) => {
    effectCore(canvas, (imgData: ImageData) => {
        var data = imgData.data;
        for(var i=0; i<data.length; i+=4) { /* RGBA */
            data[i] = 255 - data[i];  // RED
            data[i+1] = 255 - data[i+1];  // GREEN
            data[i+2] = 255 - data[i+2];  // BLUE
        }
    });
}

effects[Effect.remove_red] = (canvas: HTMLCanvasElement) => {
    effectCore(canvas, (imgData: ImageData) => {
        removeChannels(imgData, {
            red: true
        });
    });
}
effects[Effect.remove_green] = (canvas: HTMLCanvasElement) => {
    effectCore(canvas, (imgData: ImageData) => {
        removeChannels(imgData, {
            green: true
        });
    });
}
effects[Effect.remove_blue] = (canvas: HTMLCanvasElement) => {
    effectCore(canvas, (imgData: ImageData) => {
        removeChannels(imgData, {
            blue: true
        });
    });
}
effects[Effect.remove_alpha] = (canvas: HTMLCanvasElement) => {
    effectCore(canvas, (imgData: ImageData) => {
        removeChannels(imgData, {
            alpha: true
        });
    });
}
