import JSZip from 'jszip';

export default (tileWidth = 3600, tileHeight = 3600,
                colIdxOffset = 0, rowIdxOffset = 0) => {
    const input = document.createElement<'input'>('input');
    input.type = 'file';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files[0];
        const fileExt = file.name.split('.').reverse()[0];

        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = tileWidth;
            canvas.height = tileHeight;
            const ctx = canvas.getContext('2d');
            const colCount = Math.ceil(img.width / tileWidth);
            const rowCount = Math.ceil(img.height / tileHeight);
            const zip = new JSZip();
            const promises = [];

            for (let colIdx = 0; colIdx < colCount; ++colIdx) {
                for (let rowIdx = 0; rowIdx < rowCount; ++rowIdx) {
                    const topLeftX = tileWidth * colIdx;
                    const topLeftY = tileHeight * rowIdx;
                    canvas.width = Math.min(tileWidth, img.width - topLeftX);
                    canvas.height = Math.min(tileHeight, img.height - topLeftY);

                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, -topLeftX, -topLeftY);
                    const fileName = `tile_${colIdx + colIdxOffset}_${rowIdx + rowIdxOffset}_${canvas.width}x${canvas.height}.${fileExt}`;
                    console.log('processing:', fileName);
                    const promise = toBlob(canvas, fileExt).then(blob => {
                        zip.file(fileName, blob);
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

const toBlob = (canvas, fileExt) => {
    return new Promise<Blob>(resolve => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/' + fileExt);
    });
};
