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

            for (let lineIdx = 0; lineIdx < lineCount; ++lineIdx) {
                for (let colIdx = 0; colIdx < colCount; ++colIdx) {
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, -tileWidth * colIdx, -tileHeight * lineIdx);
                    const dataURL = canvas.toDataURL('image/jpeg');

                    const a = document.createElement('a');
                    a.href = dataURL;
                    a.download = `tile_${lineIdx}_${colIdx}.jpeg`;
                    a.click();
                }
            }

        };
    };
    return input;
};
