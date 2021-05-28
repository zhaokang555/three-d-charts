3D charts library, using Three.js

# Features

- bar-chart
- bar-chart-2-args
- china-province-bar-chart
- city-route-chart
- tile-map-tool

![bar-chart](./readme-pic/bar-chart.png)
![bar-chart-2-args](./readme-pic/bar-chart-2-args.png)
![china-province-bar-chart](./readme-pic/china-province-bar-chart.png)
![city-route-chart](./readme-pic/city-route-chart.png)

# Demos online

https://zhaokang555.github.io/three-d-charts-demos

# Install

## Use npm

`npm i three-d-charts --save`

```js
const ThreeDCharts = require('three-d-charts');
```

or 

```js
import ThreeDCharts from 'three-d-charts';
```

## Global import in browser

```html
<script src="path/to/three-d-charts"></script>
<script>
console.log(window.ThreeDCharts)
</script>
```

# API

```ts
ThreeDCharts.initBarChart: (list: IList, container: HTMLElement): () => void
ThreeDCharts.initBarChart2Args: (lists: Array<IList>, container: HTMLElement): () => void
ThreeDCharts.initChinaProvinceBarChart: (list: IList, container: HTMLElement): () => void
ThreeDCharts.initCityRouteChart: (list: Array<IRoute>, container: HTMLElement, extraCities: Array<ICity> = []): () => void
ThreeDCharts.tileMapTool: (tileWidth = 3600, tileHeight = 3600,
                                          colIdxOffset = 0, rowIdxOffset = 0) => HTMLInputElement

type IList = Array<{
  key: string;
  value: number;
}>;

interface IRoute {
    from: string;
    to: string;
    weight: number;
}

interface ICity {
    name: string;
    coordinates: ICoordinates;
}

type ICoordinates = [number, number];
```

# Local run demos

- `npm i`
- `npm run dev`
- open `localhost:1234/index.html`

# Build demos
- `npm run build:demos`
note: remember move `three-d-charts-demos/Alibaba_PuHuiTi_Regular.json` to your server `/` path since I used `parcel-plugin-static-files-copy`