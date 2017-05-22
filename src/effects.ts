import { Effect } from './globals';

export const effects: ((canvas: HTMLCanvasElement) => void)[] = [];

interface IChannels {
    red?: boolean
    green?: boolean
    blue?: boolean
    alpha?: boolean
}

const rgbToLuminosity = (r, g, b) =>  0.2126*r + 0.7152*g + 0.0722*b; // Calculates the luminosity of a pixel based on its rbg values.

const effectCore = function(canvas: HTMLCanvasElement, effectBody: (imgData: ImageData) => void) {
    let ctx = canvas.getContext('2d');
    let imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    effectBody(imgData);
    ctx.putImageData(imgData, 0, 0);
}

const convolutionFilter = function(imgData: ImageData, filter: number[]): ImageData {
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
    return new ImageData(outputData, imgData.width, imgData.height);
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
            let r = data[i], g = data[i+1], b =  data[i+2];
            data[i] = data[i+1] = data[i+2] = rgbToLuminosity(r,g,b);
        }
    });
}

effects[Effect.threshold] = function(canvas: HTMLCanvasElement) {
    effectCore(canvas, (imgData: ImageData) => {
        let data = imgData.data;
        let totalLuminosity = 0;
        let countedPixels = 0;
         for(let i=0; i<data.length; i+=4) { /* Calculating average luminosity */
             let luminosity = rgbToLuminosity(data[i], data[i+1], data[i+2]);
             if (luminosity < 230 && luminosity > 25) { /* Ignore all  almost-white or almost-black pixels */
                totalLuminosity += luminosity;
                countedPixels += 1;
             }
        }
        let threshold = totalLuminosity / countedPixels;
        for(let i=0; i<data.length; i+=4) { /* RGBA */
            data[i] = data[i+1] = data[i+2] = (rgbToLuminosity(data[i], data[i+1], data[i+2]) >= threshold) ? 255 : 0;
        }
    });
}

effects[Effect.boxblur] = function(canvas: HTMLCanvasElement) {
    effectCore(canvas, (imgData: ImageData) => {
        let output =convolutionFilter(imgData, [
            1/9, 1/9, 1/9, 
            1/9, 1/9, 1/9, 
            1/9, 1/9, 1/9
        ]);
        imgData.data.set(output.data);
    });
}

effects[Effect.sharpen] = function(canvas: HTMLCanvasElement) {
    effectCore(canvas, (imgData: ImageData) => {
        let output = convolutionFilter(imgData, [
            0, -1,  0,
            -1,  5, -1,
            0, -1,  0
        ]);
        imgData.data.set(output.data);
    });
}

effects[Effect.sobelfilter] = function(canvas: HTMLCanvasElement) {
    effects[Effect.greyscale](canvas);
    effectCore(canvas, (imgData: ImageData) => {
        let horizontal = convolutionFilter(imgData, [    
            -1, -2, -1,
             0,  0,  0,
             1,  2,  1
        ]);
        let vertical = convolutionFilter(imgData, [    
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1
        ]);
        for (var i=0; i < imgData.data.length; i+=4) {
            // make the vertical gradient red
            var v = Math.abs(vertical.data[i]);
            imgData.data[i] = v;
            // make the horizontal gradient green
            var h = Math.abs(horizontal.data[i]);
            imgData.data[i+1] = h;
            // and mix in some blue for aesthetics
            imgData.data[i+2] = (v+h)/4;
            imgData.data[i+3] = 255; // opaque alpha
        }
    });
}

effects[Effect.highlight_edges] = function(canvas: HTMLCanvasElement) {
    effects[Effect.threshold](canvas);
    effects[Effect.sobelfilter](canvas);
    effects[Effect.greyscale](canvas);
    effects[Effect.invert](canvas);
}

effects[Effect.matrix] = function(canvas: HTMLCanvasElement) {
    effects[Effect.remove_green](canvas);
    effects[Effect.invert](canvas);
    effects[Effect.sobelfilter](canvas);
    effects[Effect.sharpen](canvas);
    effects[Effect.sharpen](canvas);
    effects[Effect.remove_red](canvas);
}
