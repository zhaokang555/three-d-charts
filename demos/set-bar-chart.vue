<template>
    <div>
        <ul>
            <li v-for="(kv, index) in list" :key="index">
                key: {{kv.key}}, value: {{kv.value}}
                <button @click="remove(index)">x</button>
            </li>
            <li>
                key:
                <input v-model="inputKey" type="text">
                value:
                <input v-model.number="inputValue" type="number">
                <button @click="add">add new line</button>
            </li>
        </ul>
        <button @click="display">display</button>
    </div>
</template>

<script>
    export default {
        name: "set-bar-chart",
        data() {
            return {
                inputKey: '',
                inputValue: 0,
                list: [
                    {key: 'AAA', value: 3},
                    {key: 'BBBB', value: 4},
                    {key: 'CCCCC', value: 5},
                    {key: 'DDDDDD', value: 6},
                ]
            }
        },
        methods: {
            add() {
                if (this.inputKey && !Number.isNaN(this.inputValue)) {
                    this.list.push({
                        key: this.inputKey,
                        value: this.inputValue,
                    });
                    this.inputKey = '';
                    this.inputValue = 0;
                }
            },
            remove(index) {
                this.list.splice(index, 1);
            },
            display() {
                localStorage.setItem('list', JSON.stringify(this.list));
                location.href = 'bar-chart/display/index.html';
            }
        }
    }
</script>

<style scoped>

</style>