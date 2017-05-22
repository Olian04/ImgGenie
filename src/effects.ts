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
    let imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    effectBody(imgData);
    ctx.putImageData(imgData, 0, 0);
}

const convolutionFilter = function(imgData: ImageData, filter: number[]) {
    if (filter.length !== 9) {
        throw RangeError("Filter needs to be an array of 9 numbers. This represents a flattened 3x3 matrix");
    }
    let originData =  imgData.data;
    let outputData = new Uint8ClampedArray(imgData.data);;
    for(let i=0; i<outputData.length; i+=4) { /* RGBA */
        let r = 0,  g = 0,  b = 0;
        for (let j = 0; j < 9; j++) {
            let k = i+j*4-(4*4) ; // k = pixel to set + current filter index * RGBA - (offset to reach beginning of filter * RGBA)
            if (k < 0 || k >= originData.length) {
                continue; // If k is outside the image
            }
            r += originData[k] * filter[j];
            g += originData[k+1] * filter[j];
            b += originData[k+2] * filter[j];
        }
        outputData[i] = r, outputData[i+1] = g, outputData[i+2] = b, outputData[i+3] = originData[i+3];
    }
    originData.set(outputData);
}

const removeChannels = function(imgData: ImageData, channels: IChannels) {
    let data = imgData.data;
    for(let i=0; i<data.length; i+=4) { /* RGBA */
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
        let data = imgData.data;
        for(let i=0; i<data.length; i+=4) { /* RGBA */
            data[i] = 255 - data[i];  // RED
            data[i+1] = 255 - data[i+1];  // GREEN
            data[i+2] = 255 - data[i+2];  // BLUE
        }
    });
}

effects[Effect.greyscale] = function(canvas: HTMLCanvasElement) {
    effectCore(canvas, (imgData: ImageData) => {
        let data = imgData.data;
        for(let i=0; i<data.length; i+=4) { /* RGBA */
            let r = data[i];
            let g = data[i+1];
            let b =  data[i+2];
            let luminosity = 0.2126*r + 0.7152*g + 0.0722*b;
            data[i] = data[i+1] = data[i+2] = luminosity;
        }
    });
}

effects[Effect.boxblur] = function(canvas: HTMLCanvasElement) {
    effectCore(canvas, (imgData: ImageData) => {
        convolutionFilter(imgData, [
            1/9, 1/9, 1/9, 
            1/9, 1/9, 1/9, 
            1/9, 1/9, 1/9
        ]);
    });
}

effects[Effect.sharpen] = function(canvas: HTMLCanvasElement) {
    effectCore(canvas, (imgData: ImageData) => {
        convolutionFilter(imgData, [
            0, -1,  0,
            -1,  5, -1,
            0, -1,  0
        ]);
    });
}

