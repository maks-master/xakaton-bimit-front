<template lang="pug">
  .ma-2
    div {{ name }}
    img.storey( :src="storeyMap.imageData" :style="imgStyle" )
</template>

<script>
const maxStoreySize = 150

export default {
  props: {
    storeyMap: Object,
    name: String,
  },

  computed: {
    imgStyle () {
      let aspectRatio = this.storeyMap.width / this.storeyMap.height
      let width = aspectRatio >= 1 ? maxStoreySize : maxStoreySize * aspectRatio
      let height = aspectRatio <= 1 ? maxStoreySize : maxStoreySize * aspectRatio
      
      return `border: 1px solid #000000; background: lightblue; opacity: 0.8; width: ${width}px; height: ${height}px;`
    },
  }
}
</script>