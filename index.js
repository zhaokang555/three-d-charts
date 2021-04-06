class SetBarChart extends HTMLElement {
    template = `<div>
                    <ul>
                        <template>
                            <li>
                                key: <input type="text"> 
                                value: <input type="number">
                                <button>x</button>
                            </li>
                        </template>
                        <li>
                            key: <input type="text" value="AAA"> 
                            value: <input type="number" value="3">
                            <button>x</button>
                        </li>
                        <li>
                            key: <input type="text" value="BBBB"> 
                            value: <input type="number" value="4">
                            <button>x</button>
                        </li>
                        <li>
                            key: <input type="text" value="CCCCC"> 
                            value: <input type="number" value="5">
                            <button>x</button>
                        </li>
                        <li>
                            key: <input type="text" value="DDDDDD"> 
                            value: <input type="number" value="6">
                            <button>x</button>
                        </li>
                    </ul>
                    <button class="add-new-line">add new line</button>    
                    <button class="display">display bar chart</button>    
                </div>`;

    /**
     * @type {ShadowRoot}
     */
    shadow = null;

    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.innerHTML = this.template;
        this.shadow.querySelector('button.add-new-line').addEventListener('click', this.addNewLine);
        this.shadow.querySelector('button.display').addEventListener('click', this.onClickDisplay);
        this.addNewLine();
    }

    onClickDisplay = () => {
        const liList = Array.from(this.shadow.querySelectorAll('ul li'));
        const keys = [];
        const values = [];
        liList.forEach(li => {
            const key = li.querySelector('input[type=text]').value;
            const value = Number.parseFloat(li.querySelector('input[type=number]').value);

            console.log(key, value);
            if (key !== '' && !Number.isNaN(value)) {
                keys.push(key);
                values.push(value);
            }
        });

        localStorage.setItem('keys', JSON.stringify(keys));
        localStorage.setItem('values', JSON.stringify(values));

        location.href = '/demos/bar-chart/display/index.html';
    };

    addNewLine = () => {
        const ul = this.shadow.querySelector('ul');
        const li = ul.querySelector('template').content.cloneNode(true).querySelector('li');
        li.querySelector('button').addEventListener('click', () => li.remove());
        ul.appendChild(li);
    };
}

customElements.define('set-bar-chart', SetBarChart);