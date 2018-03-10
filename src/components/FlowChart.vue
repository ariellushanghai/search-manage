<template lang="pug">

</template>

<script>
  import G6 from '@antv/g6';

  G6.track(false);
  
  export default {
    name: "FlowChart",
    props: ['dom_id', 'data'],
    data() {
      return {
        net: null
      };
    },
    computed: {},
    mounted() {
      this.setChart(this.dom_id);
    },
    beforeDestroy: function () {

    },
    methods: {
      setChart(id) {
        this.net = new G6.Net({
          id: id,
          width: document.querySelector(this.dom_id).getBoundingClientRect().width,
          height: document.querySelector(this.dom_id).getBoundingClientRect().height
        });
        this.net.source(this.data.nodes, this.data.edges);
        this.net.render();
      }
    }
  }
</script>

<style lang="stylus" scoped>

</style>
