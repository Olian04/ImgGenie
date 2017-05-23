export enum Effect {
    reset,
    random,
    remove_red,
    remove_green,
    remove_blue,
    remove_alpha,
    invert,
    greyscale,
    boxblur,
    gaussianblur,
    sharpen,
    sobelfilter,
    highlight_edges,
    threshold,
    matrix,
    custom_convolution,
    hardblur
}

//TODO: Implement Convolution filters after having read this guide https://www.html5rocks.com/en/tutorials/canvas/imagefilters/