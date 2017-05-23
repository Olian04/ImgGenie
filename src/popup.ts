import * as $ from 'jquery';

const storeCustomMatrix = function() {
    let matrix = []
    let mIndex = 0;
    $("#customMatrix").children().each((i, e) => {
        let inputElement = <HTMLInputElement>e;
        if (!inputElement.type) {
            return; // Not an inputElement
        }
        matrix[mIndex] = inputElement.value;
        mIndex += 1;
    });
    window.localStorage.setItem('customConvolution', matrix.toString());
}

$(function() {
    storeCustomMatrix();
});

$("#customMatrix").children().each((i, e) => {
    let inputElement = <HTMLInputElement>e;
    if (!inputElement.type) {
        return; // Not an inputElement
    }
    $(inputElement).change((event) => {
        
    });
});

