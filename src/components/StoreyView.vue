<template lang="pug">
  .ma-2
    div {{ name }}
    .wrapper( :style="wrapperStyle" )
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
    wrapperStyle () {
      return `width: ${maxStoreySize + 12}px; height: ${maxStoreySize + 12}px;`
    },

    imgStyle () {
      let aspectRatio = this.storeyMap.width / this.storeyMap.height
      let width = aspectRatio >= 1 ? maxStoreySize : maxStoreySize * aspectRatio
      let height = aspectRatio >= 1 ? maxStoreySize / aspectRatio : maxStoreySize
      
      return `align-self: center; width: ${width}px; height: ${height}px;`
    },
  }
}
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  border: 1px solid gray; 
  padding: 5px;
}
</style>