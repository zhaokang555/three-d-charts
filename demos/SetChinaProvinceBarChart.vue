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
                    <option v-for="option in options" :value="option">{{option}}</option>
                </select>
                value:
                <input v-model.number="inputValue" type="number">
                <button @click="add">add new line</button>
            </li>
        </ul>
        <button @click="display">generate chine province bar chart</button>
    </div>
</template>

<script>
    import { chinaProvinceList as provinceList } from "../src";

    export default {
        name: "set-china-province-bar-chart",
        data() {
            return {
                inputKey: '',
                inputValue: 0,
                list: [
                    {key: '广东省', value: 110760.94},
                    {key: '江苏省', value: 102700.00},
                    {key: '山东省', value: 73129.00},
                    {key: '浙江省', value: 64613.00},
                    {key: '河南省', value: 54997.07},
                    {key: '四川省', value: 48598.80},
                    {key: '台湾省', value: 45855},
                    {key: '福建省', value: 43903.89},
                    {key: '湖北省', value: 43443.46},
                    {key: '湖南省', value: 41781.49},
                    {key: '上海市', value: 38700.58},
                    {key: '安徽省', value: 38680.60},
                    {key: '河北省', value: 36206.90},
                    {key: '北京市', value: 36102.60},
                    {key: '陕西省', value: 26181.86},
                    {key: '江西省', value: 25691.50},
                    {key: '辽宁省', value: 25115.00},
                    {key: '重庆市', value: 25002.79},
                    {key: '云南省', value: 24500.00},
                    {key: '广西壮族自治区', value: 22156.69},
                    {key: '贵州省', value: 17826.56},
                    {key: '山西省', value: 17651.93},
                    {key: '内蒙古自治区', value: 17360.00},
                    {key: '天津市', value: 14083.73},
                    {key: '新疆维吾尔自治区', value: 13797.58},
                    {key: '黑龙江省', value: 13698.50},
                    {key: '吉林省', value: 12311.32},
                    {key: '甘肃省', value: 9016.70},
                    {key: '海南省', value: 5532.39},
                    {key: '宁夏回族自治区', value: 3920.55},
                    {key: '青海省', value: 3005.92},
                    {key: '西藏自治区', value: 1902.74},
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
                // make sure inputKey is a valid province name
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
                this.$router.push('china-province-bar-chart-display');
            }
        }
    }
</script>

<style scoped>

</style>