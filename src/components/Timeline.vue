<template lang="pug">
div
  .wrapper
    v-card.handler( width="50" height="50" @click="togglePlayPause" )
      v-img( :src="`/icons/${iconName}.png`" height="48" aspect-ratio="1" contain )
    div#timeline( @click="onPause" )
</template>

<script>
import * as d3 from 'd3'
import timeline from '@/components/graph/timeline'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  data () {
    return {
      preparedList: []
    }
  },

  computed: {
    ...mapGetters(['alarms']),
    ...mapState(['isActive']),

    iconName () {
      return this.isActive ? 'pause_button_96px' : 'play_96px'
    }
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
    ...mapActions(['toggleActivity']),

    onPause () {
      this.toggleActivity(false)
    },

    togglePlayPause() {
      this.toggleActivity(!this.isActive)
    },

    reinstall () {
      this.preparedList = this.alarms.map(({ startTime, endTime, uuid, deviceUuid }) => ({ uuid, deviceUuid, start: new Date(startTime), end: new Date(endTime) }))

      d3.select('#timeline')
      .datum(this.preparedList)
      .call(timeline({
        widthResizable: true,
        viewHeight: 70,
        margin: {
          top: 0,
          bottom: 25,
          left: 80,
          right: 25
        },
        onEventClick: this.onClick
      }))
    },

    onClick (event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style scoped>
.wrapper {
  position: relative;
}
.handler {
  position: absolute;
  left: 20px;
  bottom: 30px;
}
</style>