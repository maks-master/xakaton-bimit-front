<template lang="pug">
  div#timeline
</template>

<script>
import * as d3 from 'd3'
import timeline from '@/components/graph/timeline'
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      preparedList: []
    }
  },

  computed: {
    ...mapGetters(['alarms']),
  },

  watch: {
    alarms () {
      this.reinstall()
    }
  },

  mounted() {
    this.reinstall()
  },

  methods: {
    reinstall () {
      this.preparedList = this.alarms.map(({ startTime, endTime, uuid }) => ({ uuid, start: new Date(startTime), end: new Date(endTime) }))

      d3.select('#timeline')
      .datum(this.preparedList)
      .call(timeline({
        widthResizable: true,
        viewHeight: 70,
        margin: {
          top: 0,
          bottom: 25,
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