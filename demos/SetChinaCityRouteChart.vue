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
    {"from": "上海", "to": "北京", "weight": 5},
    {"from": "武汉", "to": "北京", "weight": 2},
    {"from": "拉萨", "to": "北京", "weight": 1}
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