<template lang="pug">
  div#timeline
</template>

<script>
import * as d3 from 'd3'
import timeline from '@/components/graph/timeline'

export default {
  props: {
    data: {
      type: Array
    }
  },

  data () {
    return {
      preparedList: []
    }
  },

  watch: {
    data () {
      this.reinstall()
    }
  },

  mounted() {
    this.reinstall()
  },

  methods: {
    reinstall () {
      this.preparedList = [...this.data]

      d3.select('#timeline')
      .datum(this.preparedList)
      .call(timeline({
        widthResizable: true,
        viewHeight: 150,
        margin: {
          top: -150,
          bottom: 30,
          left: 25,
          right: 25
        },
        onEventClick: this.onClick
      }))
      console.log(this.data);
    },

    onClick (event) {
      console.log(event);
    }
  }
}
</script>