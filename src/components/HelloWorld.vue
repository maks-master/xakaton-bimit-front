<template lang="pug">
  canvas#myCanvas
</template>

<script>
  import { Viewer } from '@xeokit/xeokit-sdk/src/viewer/Viewer.js'
  import { XKTLoaderPlugin } from '@xeokit/xeokit-sdk/src/plugins/XKTLoaderPlugin/XKTLoaderPlugin.js'

  export default {
    name: 'HelloWorld',

    data: () => ({
      
    }),

    mounted () {
      this.init()
    },

    methods: {
      init() {
        this.viewer = new Viewer({
          canvasId: "myCanvas",
          transparent: true,
          saoEnabled: false
        })

        this.xktLoader = new XKTLoaderPlugin(this.viewer);

        const model = this.xktLoader.load({
          id: "myModel",
          src: "./model/ov.xkt",
          metaModelSrc: "./model/ov.json",
          edges: true
        });

        model.on("loaded", () => {
          console.log('model loaded')
          this.viewer.cameraFlight.flyTo(model)
        });


      }
    }
  }
</script>

<style scoped>
  #myCanvas {width:100%;height:100%;}
</style>
