import { BufferAttribute, BufferGeometry, Points, PointsMaterial, Vector3 } from 'three';
import IPosition from '../type/IPosition';
import { colormap } from '../CommonAlgorithms';
import { PlaneSplitLines } from './PlaneSplitLines';
import { ScatterPlaneHelper } from './ScatterPlaneHelper';

export class ScatterPoints extends Points<BufferGeometry, PointsMaterial> {
    planes: Array<ScatterPlaneHelper>;

    constructor(list: Array<IPosition>, container, camera) {
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(getVertices(list), 3));
        geometry.computeBoundingBox();
        geometry.setAttribute('color', new BufferAttribute(getVertexColors(geometry, list), 3));
        super(geometry, new PointsMaterial({size: 4, vertexColors: true}));

        this.planes = this.addHelperPlanes(container, camera);
    }

    addHelperPlanes(container, camera) {
        const max = this.geometry.boundingBox.max;
        const min = this.geometry.boundingBox.min;
        const diagonal = max.clone().sub(min);
        max.addScaledVector(diagonal.clone().normalize(), diagonal.length() * 0.05);
        min.addScaledVector(diagonal.clone().normalize(), diagonal.length() * -0.05);
        const center = max.clone().lerp(min, 0.5);

        const planes = [
            this.addHelperPlaneFar(max, min, center, container, camera),
            this.addHelperPlaneBottom(max, min, center, container, camera),
            this.addHelperPlaneLeft(max, min, center, container, camera),
        ];

        const planeSplitLines = new PlaneSplitLines(max.x - min.x, max.y - min.y, max.z - min.z);
        planeSplitLines.position.copy(min);
        this.add(planeSplitLines);

        return planes;
    }


    addHelperPlaneFar (max, min, center, container, camera) {
        const planeMesh = new ScatterPlaneHelper(max.x - min.x, max.y - min.y, container, camera);
        planeMesh.position.set(center.x, center.y, min.z);
        this.add(planeMesh);
        return planeMesh;
    };

    addHelperPlaneBottom (max, min, center, container, camera) {
        const planeMesh = new ScatterPlaneHelper(max.x - min.x, max.z - min.z, container, camera);
        planeMesh.rotateOnWorldAxis(new Vector3(1, 0, 0), Math.PI / 2);
        planeMesh.position.set(center.x, min.y, center.z);
        this.add(planeMesh);
        return planeMesh;
    };

    addHelperPlaneLeft (max, min, center, container, camera) {
        const planeMesh = new ScatterPlaneHelper(max.z - min.z, max.y - min.y, container, camera);
        planeMesh.rotateOnWorldAxis(new Vector3(0, 1, 0), Math.PI / 2);
        planeMesh.position.set(min.x, center.y, center.z);
        this.add(planeMesh);
        return planeMesh;
    };

}


const getVertices = (list: Array<Array<number>>) => {
    return Float32Array.from(list.reduce((total, current) => [...total, ...current], []))
};

const getVertexColors = (geometry: BufferGeometry, list: Array<IPosition>) => {
    const max = geometry.boundingBox.max;
    const min = geometry.boundingBox.min;
    const yRange = max.y - min.y;
    const colors = colormap(100);
    const vertexColors = [];
    list.forEach(pos => {
        const colorIndex = Math.round((pos[1] - min.y) / yRange * 99);
        vertexColors.push(...colors[colorIndex].toArray());
    });
    return Float32Array.from(vertexColors);
};
