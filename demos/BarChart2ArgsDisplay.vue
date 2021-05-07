<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initBarChart2Args} from '../src';

    export default {
        name: "BarChart2Args",
        mounted() {
            const lists = JSON.parse(localStorage.getItem('lists')) || [];
            initBarChart2Args(lists, this.$refs.container);
        }
    }
</script>

<style scoped>

</style>