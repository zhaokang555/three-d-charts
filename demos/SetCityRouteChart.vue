<template>
    <div>
        <textarea cols="50" rows="12" v-model="list"></textarea>
        <button @click="display">generate china city route chart</button>
    </div>
</template>

<script>
    export default {
        name: "set-city-route-chart",
        data() {
            return {
                list:
`[
    {"from": "哈尔滨", "to": "北京", "weight": 10},
    {"from": "台北", "to": "北京", "weight": 8},
    {"from": "首尔", "to": "北京", "weight": 7},
    {"from": "东京", "to": "北京", "weight": 7},
    {"from": "乌鲁木齐", "to": "北京", "weight": 3},
    {"from": "拉萨", "to": "北京", "weight": 2},
    {"from": "曼谷", "to": "北京", "weight": 1},
    {"from": "孟买", "to": "北京", "weight": 1},
    {"from": "开罗", "to": "北京", "weight": 1},
    {"from": "纽约", "to": "北京", "weight": 1},
    {"from": "莫斯科", "to": "北京", "weight": 1},
    {"from": "布宜诺斯艾利斯", "to": "北京", "weight": 1}
]`
            }
        },
        methods: {
            display() {
                localStorage.setItem('list', this.list);
                this.$router.push('city-route-chart-display');
            }
        }
    }
</script>

<style scoped>
    textarea {
        display: block;
    }
</style>