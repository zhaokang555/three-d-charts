<template>
    <div ref="container" style="height: 100%"></div>
</template>

<script>
    import {initBarChart2Args} from '../src';

    export default {
        name: "BarChart2ArgsDisplay",
        data() {
            return {
                clean: () => null,
            }
        },
        mounted() {
            const lists = JSON.parse(localStorage.getItem('lists')) || [];
            this.clean = initBarChart2Args(lists, this.$refs.container);
        },
        beforeDestroy() {
            this.clean();
        },
    }
</script>

<style scoped>

</style>