<template lang="pug">
  .ma-2
    div( :class="{ 'selected': selected }" ) {{ name }}
    .wrapper( :style="wrapperStyle" )
      img.storey( :src="storeyMap.imageData" :style="imgStyle" @click="onImageClick" )
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