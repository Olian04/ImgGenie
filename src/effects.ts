import { Effect } from './globals';

export const effects: ((canvas: HTMLCanvasElement) => void)[] = [];

interface IChannels {
    red?: boolean
    green?: boolean
    blue?: boolean
    alpha?: boolean
}

// REGION BEGIN: Effects core

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

const compositeEffect = (canvas:HTMLCanvasElement, effectsToApplyInOrder: Effect[]) => effectsToApplyInOrder.forEach((v, i) => effects[v](canvas) );
const singleConvolutionEffect = (canvas: HTMLCanvasElement, matrix: number[]) => effectCore(canvas, (imgData: ImageData) => imgData.data.set(convolutionFilter(imgData, matrix).data));
const singlePixelEffect = function(canvas: HTMLCanvasElement, callback: (channels: {red: number, green: number, blue: number, alpha: number}) => void) {
    effectCore(canvas, (imgData: ImageData) => {
        let data = imgData.data;
        for(let i=0; i<data.length; i+=4) {
            let channels = { red: data[i], green: data[i+1], blue: data[i+2], alpha: data[i+3] }
            callback(channels);
            data[i] = channels.red, data[i+1] = channels.green, data[i+2] = channels.blue, data[i+3] = channels.alpha;
        }
    });
}; 
const removeChannelsEffect = (canvas: HTMLCanvasElement, channels: IChannels) => singlePixelEffect(canvas, (pixel) => {
    pixel.red = channels.red ? 0 : pixel.red; 
    pixel.green = channels.green ? 0 : pixel.green; 
    pixel.blue = channels.blue ? 0 : pixel.blue; 
    pixel.alpha = channels.alpha ? 0 : pixel.alpha; 
});

// REGION BEGIN: Effects implementation
effects[Effect.random] = (canvas) => {
    const exclude = [Effect.random, Effect.reset, Effect.remove_alpha, Effect.custom_convolution];
    const selection = effects.filter((e, i) => exclude.indexOf(i) < 0);
    selection[Math.floor(Math.random() * selection.length)](canvas);
}
effects[Effect.remove_red] = (canvas) => removeChannelsEffect(canvas, {red: true});
effects[Effect.remove_green] = (canvas) => removeChannelsEffect(canvas, {green: true});
effects[Effect.remove_blue] = (canvas) => removeChannelsEffect(canvas, {blue: true});
effects[Effect.remove_alpha] = (canvas) => removeChannelsEffect(canvas, {alpha: true});
effects[Effect.boxblur] = (canvas) => singleConvolutionEffect(canvas, [
    1/9, 1/9, 1/9, 
    1/9, 1/9, 1/9, 
    1/9, 1/9, 1/9
]);
effects[Effect.sharpen] = (canvas) => singleConvolutionEffect(canvas, [
    0, -1,  0,
    -1,  5, -1,
    0, -1,  0
]);
effects[Effect.invert] = (canvas) => singlePixelEffect(canvas, (pixel) => {
    pixel.red = 255 - pixel.red;
    pixel.green = 255 - pixel.green;
    pixel.blue = 255 - pixel.blue;
});
effects[Effect.greyscale] = (canvas) => singlePixelEffect(canvas, (pixel) => {
    pixel.red = pixel.green = pixel.blue = rgbToLuminosity(pixel.red, pixel.green, pixel.blue);
});
effects[Effect.highlight_edges] = (canvas) => compositeEffect(canvas, [
    Effect.threshold,
    Effect.sobelfilter,
    Effect.greyscale,
    Effect.invert
]);
effects[Effect.matrix] = (canvas) => compositeEffect(canvas, [
    Effect.remove_green,
    Effect.invert,
    Effect.sobelfilter,
    Effect.sharpen,
    Effect.sharpen,
    Effect.remove_red
]);

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

effects[Effect.custom_convolution] = function(canvas: HTMLCanvasElement) {
    let customMatrix = [];
    window.localStorage.getItem('customConvolution').split(',').forEach((v, i) => {
        customMatrix[i] = parseFloat(v);
    });
    effectCore(canvas, (imgData: ImageData) => {
        let output = convolutionFilter(imgData, customMatrix);
        imgData.data.set(output.data);
    });
}