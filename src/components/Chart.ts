export abstract class Chart {
    protected frameHooks: Array<() => void> = [];
    protected cleanHooks: Array<() => void> = [];
    private _cancelId: number;

    render = () => {
        this._cancelId = requestAnimationFrame(this.render);
        this.frameHooks.forEach(cb => cb());
    };

    clean() {
        cancelAnimationFrame(this._cancelId);
        this.cleanHooks.forEach(cb => cb());
    }
}