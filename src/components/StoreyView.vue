<template lang="pug">
  .ma-2
    div( :class="{ 'selected': selected }" ) {{ name }}
    .wrapper( :style="wrapperStyle" )
      img.storey( :src="storeyMap.imageData" :style="imgStyle" )
</template>

<script>
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
  },

  computed: {
    wrapperStyle () {
      return `width: ${12 + +this.maxSize}px; height: ${12 + +this.maxSize}px;`
    },

    imgStyle () {
      let aspectRatio = this.storeyMap.width / this.storeyMap.height
      let width = aspectRatio >= 1 ? this.maxSize : this.maxSize * aspectRatio
      let height = aspectRatio >= 1 ? this.maxSize / aspectRatio : this.maxSize
      
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
.selected {
  color: cornflowerblue;
  text-decoration: underline;
}
</style>