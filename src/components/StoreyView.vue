<template lang="pug">
  .ma-2
    div {{ name }}
    img.storey( :src="storeyMap.imageData" :style="style" :width="storeyMap.width + 'px'" :height="storeyMap.height + 'px'" )
</template>

<script>
export default {
  props: {
    storeyMap: Object,
    name: String,
  },

  computed: {
    style () {
      return 'border: 1px solid #000000; background: lightblue; opacity: 0.8'
    }
  }
}
</script>

<style module>
.wrapper {
  display: inline-block;
}
.storey {
  border: 1px solid #000000;
  background: lightblue;
  opacity: 0.8
}            
</style>