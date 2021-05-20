import JSZip from 'jszip';

/**
 * @return {HTMLInputElement}
 */
export default (tileWidth = 1000, tileHeight = 1000) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
        const file = e.target.files[0];

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = tileWidth;
            canvas.height = tileHeight;
            const ctx = canvas.getContext('2d');
            const lineCount = Math.ceil(img.height / tileHeight);
            const colCount = Math.ceil(img.width / tileWidth);
            const zip = new JSZip();
            const promises = [];

            for (let lineIdx = 0; lineIdx < lineCount; ++lineIdx) {
                for (let colIdx = 0; colIdx < colCount; ++colIdx) {
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, -tileWidth * colIdx, -tileHeight * lineIdx);
                    const promise = toBlob(canvas).then(blob => {
                        zip.file(`tile_${lineIdx}_${colIdx}.jpeg`, blob);
                    });
                    promises.push(promise);
                }
            }

            Promise.all(promises).then(() => {
                zip.generateAsync({type: 'base64'}).then(function (content) {
                    const a = document.createElement('a');
                    a.href = 'data:application/zip;base64,' + content;
                    a.download = `tiles.zip`;
                    a.click();
                });
            });
        };
    };
    return input;
};

const toBlob = (canvas) => {
    return new Promise(resolve => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg');
    });
};
