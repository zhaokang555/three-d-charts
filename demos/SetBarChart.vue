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
        <button @click="display">generate bar chart</button>
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
                    {key: '广东省', value: 110760.94},
                    {key: '浙江省', value: 64613.00},
                    {key: '台湾省', value: 45855},
                    {key: '湖北省', value: 43443.46},
                    {key: '北京市', value: 36102.60},
                    {key: '西藏自治区', value: 1902.74},
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
                this.$router.push('bar-chart-display');
            }
        }
    }
</script>

<style scoped>

</style>