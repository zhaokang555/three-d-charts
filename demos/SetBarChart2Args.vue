<template>
    <div>
        <textarea cols="50" rows="20" v-model="lists"></textarea>
        <button @click="display">generate bar chart 2 args</button>
    </div>
</template>

<script>
    export default {
        name: "set-bar-chart-2-args",
        data() {
            return {
                lists:
`[
    [
        {"key": "2016广东省", "value": 79512.05},
        {"key": "2016浙江省", "value": 46485},
        {"key": "2016台湾省", "value": 33400},
        {"key": "2016湖北省", "value": 32297.91}
    ],
    [
        {"key": "2017广东省", "value": 89900},
        {"key": "2017浙江省", "value": 51768},
        {"key": "2017台湾省", "value": 39072},
        {"key": "2017湖北省", "value": 36522.95}
    ],
    [
        {"key": "2018广东省", "value": 97277.77},
        {"key": "2018浙江省", "value": 56197.15},
        {"key": "2018台湾省", "value": 39000},
        {"key": "2018湖北省", "value": 39366.55}
    ],
    [
        {"key": "2019广东省", "value": 107671.07},
        {"key": "2019浙江省", "value": 63252.00},
        {"key": "2019台湾省", "value": 42180.68},
        {"key": "2019湖北省", "value": 45828.31}
    ],
    [
        {"key": "2020广东省", "value": 110760.94},
        {"key": "2020浙江省", "value": 64613.00},
        {"key": "2020台湾省", "value": 45855},
        {"key": "2020湖北省", "value": 43443.46}
    ]
]`
            }
        },
        methods: {
            display() {
                localStorage.setItem('lists', this.lists);
                this.$router.push('bar-chart-2-args-display');
            }
        }
    }
</script>

<style scoped>
    textarea {
        display: block;
    }
</style>