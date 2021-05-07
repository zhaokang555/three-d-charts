<template>
    <div>
        <textarea cols="50" rows="32" v-model="list"></textarea>
        <button @click="display">generate bar chart 2 args</button>
    </div>
</template>

<script>
    export default {
        name: "set-bar-chart-2-args",
        data() {
            return {
                list:
`[
    [
        {"key": "A1", "value": 100},
        {"key": "B1", "value": 200},
        {"key": "C1", "value": 300},
        {"key": "D1", "value": 400}
    ],
    [
        {"key": "A2", "value": 110},
        {"key": "B2", "value": 210},
        {"key": "C2", "value": 310},
        {"key": "D2", "value": 410}
    ],
    [
        {"key": "A3", "value": 120},
        {"key": "B3", "value": 220},
        {"key": "C3", "value": 320},
        {"key": "D3", "value": 420}
    ],
    [
        {"key": "A4", "value": 130},
        {"key": "B4", "value": 230},
        {"key": "C4", "value": 330},
        {"key": "D4", "value": 430}
    ],
    [
        {"key": "A5", "value": 140},
        {"key": "B5", "value": 240},
        {"key": "C5", "value": 340},
        {"key": "D5", "value": 440}
    ]
]`
            }
        },
        methods: {

            display() {
                localStorage.setItem("list", this.list);
                location.href = "bar-chart-2-args/display/index.html";
            }
        }
    }
</script>

<style scoped>
    textarea {
        display: block;
    }
</style>