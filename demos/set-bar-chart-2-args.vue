<template>
    <div>
        <textarea cols="50" rows="32" v-model="lists"></textarea>
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
        {"key": "R1C1", "value": 100},
        {"key": "R1C2", "value": 200},
        {"key": "R1C3", "value": 300},
        {"key": "R1C4", "value": 400}
    ],
    [
        {"key": "R2C1", "value": 110},
        {"key": "R2C2", "value": 210},
        {"key": "R2C3", "value": 310},
        {"key": "R2C4", "value": 410}
    ],
    [
        {"key": "R3C1", "value": 120},
        {"key": "R3C2", "value": 220},
        {"key": "R3C3", "value": 320},
        {"key": "R3C4", "value": 420}
    ],
    [
        {"key": "R4C1", "value": 130},
        {"key": "R4C2", "value": 230},
        {"key": "R4C3", "value": 330},
        {"key": "R4C4", "value": 430}
    ],
    [
        {"key": "R5C1", "value": 140},
        {"key": "R5C2", "value": 240},
        {"key": "R5C3", "value": 340},
        {"key": "R5C4", "value": 440}
    ]
]`
            }
        },
        methods: {

            display() {
                localStorage.setItem("lists", this.lists);
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