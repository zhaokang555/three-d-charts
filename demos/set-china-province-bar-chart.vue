<template>
    <div>
        <ul>
            <li v-for="(kv, index) in list" :key="index">
                province: {{kv.key}}, value: {{kv.value}}
                <button @click="remove(index)">x</button>
            </li>
            <li>
                province:
                <select v-model="inputKey">
                    <option v-for="option in options" value="p">{{option}}</option>
                </select>
                value:
                <input v-model.number="inputValue" type="number">
                <button @click="add">add new line</button>
            </li>
        </ul>
        <button @click="display">display</button>
    </div>
</template>

<script>
    const provinceList = [
        "北京市",
        "天津市",
        "河北省",
        "山西省",
        "内蒙古自治区",
        "辽宁省",
        "吉林省",
        "黑龙江省",
        "上海市",
        "江苏省",
        "浙江省",
        "安徽省",
        "福建省",
        "江西省",
        "山东省",
        "河南省",
        "湖北省",
        "湖南省",
        "广东省",
        "广西壮族自治区",
        "海南省",
        "重庆市",
        "四川省",
        "贵州省",
        "云南省",
        "西藏自治区",
        "陕西省",
        "甘肃省",
        "青海省",
        "宁夏回族自治区",
        "新疆维吾尔自治区",
        "台湾省",
        "香港特别行政区",
        "澳门特别行政区",
    ];

    export default {
        name: "set-china-province-bar-chart",
        data() {
            return {
                provinceList,
                inputKey: '',
                inputValue: 0,
                list: [
                    {key: '北京市', value: 100},
                    {key: '湖北省', value: 200},
                ]
            }
        },
        computed: {
            keys() {
                return this.list.map(kv => kv.key);
            },
            options() {
                return provinceList.filter(p => this.keys.indexOf(p) === -1);
            }
        },
        methods: {
            add() {
                if (provinceList.indexOf(this.inputKey) > -1 && !Number.isNaN(this.inputValue)) {
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
                location.href = 'china-province-bar-chart/display/index.html';
            }
        }
    }
</script>

<style scoped>

</style>