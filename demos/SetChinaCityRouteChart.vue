<template>
    <div>
        <textarea cols="50" rows="8" v-model="list"></textarea>
        <button @click="display">generate china city route chart</button>
    </div>
</template>

<script>
    export default {
        name: "set-china-city-route-chart",
        data() {
            return {
                list:
`[
    {"from": "北京", "to": "上海", "weight": 2},
    {"from": "上海", "to": "武汉", "weight": 3},
    {"from": "哈尔滨", "to": "拉萨", "weight": 4}
]`
            }
        },
        methods: {
            display() {
                localStorage.setItem('list', this.list);
                this.$router.push('china-city-route-chart-display');
            }
        }
    }
</script>

<style scoped>
    textarea {
        display: block;
    }
</style>