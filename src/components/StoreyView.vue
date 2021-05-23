<template lang="pug">
  .main.ma-2
    div( :class="{ 'selected': selected }" ) {{ name }}
    .wrapper( :style="wrapperStyle" )
      img.storey( :src="storeyMap.imageData" :style="imgStyle" @click="onImageClick" )

    .teaser( v-if="hasAlert" :style="teaserStyle" ) {{ lastTeaser.time }}
</template>

<script>
import { mapGetters } from 'vuex'
const maxStoreySize = 110

export default {
  props: {
    storeyMap: Object,
    name: String,
    maxSize: {
      type: [String, Number],
      default: maxStoreySize
    },
    selected: Boolean,
    devices: Array,
  },

  data () {
    return {
      colors: ['yellow', 'orange', 'red', 'purple']
    }
  },

  computed: {
    ...mapGetters(['storeyAlarms']),

    teasers () {
      return this.devices 
      ? this.storeyAlarms
      .filter(item => this.devices.includes(item.deviceUuid))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      : []
    },

    lastTeaser () {
      if (this.teasers.length == 0) return null
      return this.teasers[0]
    },

    teaserStyle () {  
      let color = this.colors[this.lastTeaser.alarmLevel.value]
      return `background-color: ${color};`
    },

    hasAlert () {
      return this.teasers.length > 0
    },

    size () {
      let aspectRatio = this.storeyMap.width / this.storeyMap.height
      let width = aspectRatio >= 1 ? this.maxSize : this.maxSize * aspectRatio
      let height = aspectRatio >= 1 ? this.maxSize / aspectRatio : this.maxSize
      return { width, height }
    },

    wrapperStyle () {
      return `width: ${12 + +this.maxSize}px; height: ${12 + +this.maxSize}px;`
    },

    imgStyle () {
      let { width, height } = this.size
      return `align-self: center; width: ${width}px; height: ${height}px;`
    },
  },

  methods: {
    onImageClick (event) {
      let x = event.offsetX * this.storeyMap.width / this.size.width
      let y = event.offsetY * this.storeyMap.height / this.size.height

      this.$emit('imageclick', [x, y])
    }
  }
}
</script>

<style scoped>
.main {
  position: relative;
}
.wrapper {
  display: flex;
  justify-content: center;
  border: 1px solid gray; 
  padding: 5px;
}
.selected {
  color: cornflowerblue;
  text-decoration: underline;
}
.teaser {
  position: absolute;
  top: 28px;
  left: 5px;
  width: calc(100% - 10px);
  padding: 5px;
  font-size: 12px;
}
</style>