<template lang="pug">
.mt-3
  v-card.pa-2( v-for="ev in events" :key="ev.uuid" @click.native="onSelect(ev)" ) 
    .wrapper
      .text Время: {{ ev.time }}
      .text Датчик: {{ ev.device.name }}
      v-btn.close( fab x-small @click="onClose(ev)" ) X
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  props: {
    storeyMap: Object,
    deviceIds: Array,
  },

  computed: {
    ...mapGetters(['storeyAlarms', 'devices']),

    teasers () {
      return this.deviceIds 
      ? this.storeyAlarms
      .filter(item => this.deviceIds.includes(item.deviceUuid))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      : []
    },

    events () {
      return this.teasers.map(item => {
        let { deviceUuid, time, alarmLevel, uuid } = item
        let obj = { uuid, deviceUuid, time, level: alarmLevel.value }

        let device = this.devices.find(d => d.uuid == deviceUuid)
        if (device) obj['device'] = device

        return obj
      })
    }
  },

  methods: {
    ...mapActions(['resetAlarm']),

    onClose (ev) {
      this.resetAlarm(ev.deviceUuid)
    },

    onSelect (ev) {
      this.$emit('select', ev)
    }
  }
}
</script>

<style scoped>
.wrapper {
  position: relative;
}
.text {
  max-width: 250px;
  text-overflow: ellipsis;
}
.close {
  position: absolute;
  top: -20px;
  right: -20px;
}
</style>