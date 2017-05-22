import { Effect } from './globals';

export const effects: ((canvas: HTMLCanvasElement) => void)[] = [];

interface IChannels {
    red?: boolean
    green?: boolean
    blue?: boolean
     alpha?: boolean
}

const effectCore = function(canvas: HTMLCanvasElement, effectBody: (imgData: ImageData) => void) {
    let ctx = canvas.getContext('2d');
    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    effectBody(imgData);
    ctx.putImageData(imgData, 0, 0);
}

const removeChannels = function(imgData: ImageData, channels: IChannels) {
    var data = imgData.data;
    for(var i=0; i<data.length; i+=4) { /* RGBA */
        data[i] = channels.red ? 0 : data[i]; 
        data[i+1] = channels.green ? 0 : data[i+1]; 
        data[i+2] = channels.blue ? 0 : data[i+2]; 
        data[i+3] = channels.alpha ? 0 : data[i+3]; 
    }
}

// REGION BEGIN: Effects

const removeChannelsEffect = function(canvas: HTMLCanvasElement, channels: IChannels) {
    effectCore(canvas, (imgData: ImageData) => removeChannels(imgData,  channels) );
}
effects[Effect.remove_red] = (canvas) => removeChannelsEffect(canvas, {red: true});
effects[Effect.remove_green] = (canvas) => removeChannelsEffect(canvas, {green: true});
effects[Effect.remove_blue] = (canvas) => removeChannelsEffect(canvas, {blue: true});
effects[Effect.remove_alpha] = (canvas) => removeChannelsEffect(canvas, {alpha: true});

effects[Effect.invert] = function(canvas: HTMLCanvasElement) {
    effectCore(canvas, (imgData: ImageData) => {
        var data = imgData.data;
        for(var i=0; i<data.length; i+=4) { /* RGBA */
            data[i] = 255 - data[i];  // RED
            data[i+1] = 255 - data[i+1];  // GREEN
            data[i+2] = 255 - data[i+2];  // BLUE
        }
    });
}

effects[Effect.greyscale] = function(canvas: HTMLCanvasElement) {
    effectCore(canvas, (imgData: ImageData) => {
        var data = imgData.data;
        for(var i=0; i<data.length; i+=4) { /* RGBA */
            let r = data[i];
            let g = data[i+1];
            let b =  data[i+2];
            let luminosity = 0.2126*r + 0.7152*g + 0.0722*b;
            data[i] = data[i+1] = data[i+2] = luminosity;
        }
    });
}
