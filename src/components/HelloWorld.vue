<template lang="pug">
  canvas#myCanvas
</template>

<script>
  import { Viewer } from '@xeokit/xeokit-sdk/src/viewer/Viewer.js'
  import { XKTLoaderPlugin } from '@xeokit/xeokit-sdk/src/plugins/XKTLoaderPlugin/XKTLoaderPlugin.js'

  import {Mesh, Node, PhongMaterial, buildBoxGeometry, ReadableGeometry} from "@xeokit/xeokit-sdk/src/viewer/scene"

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

        this.model = this.xktLoader.load({
          id: "myModel",
          src: "./model/ov.xkt",
          metaModelSrc: "./model/ov.json",
          edges: true
        });

        this.model.on("loaded", () => {
          console.log('model loaded')
          this.addMesh()
          this.viewer.cameraFlight.flyTo(this.model)
        });

        this.viewer.cameraControl.on("picked", (pickResult) => {
          console.log('‼️ Res pickResult:', pickResult)
          console.log('‼️ Res pickResult._worldPos:', pickResult._worldPos)
          console.log('‼️ Res pickResult.position:', pickResult.position)
          console.log('‼️ Res pickResult.entity.id:', pickResult.entity.id)
        })

      },

      addMesh(){
        const boxGeometry = new ReadableGeometry(this.viewer.scene, buildBoxGeometry({
            xSize: 1,
            ySize: 1,
            zSize: 1
        }));

        new Node(this.viewer.scene, {
            id: "table",
            isModel: false,
            rotation: [0, 50, 0],
            position: [0, 0, 0],
            scale: [1, 1, 1],

            children: [

                new Mesh(this.viewer.scene, {
                    id: "redLeg",
                    isObject: true,
                    position: [-4, -6, -4],
                    scale: [1, 3, 1],
                    rotation: [0, 0, 0],
                    material: new PhongMaterial(this.viewer.scene, {
                        diffuse: [1, 0.3, 0.3]
                    }),
                    geometry: boxGeometry
                }),

                new Mesh(this.viewer.scene, {
                    id: "greenLeg",
                    isObject: true,
                    position: [4, -6, -4],
                    scale: [1, 3, 1],
                    rotation: [0, 0, 0],
                    material: new PhongMaterial(this.viewer.scene, {
                        diffuse: [0.3, 1.0, 0.3]
                    }),
                    geometry: boxGeometry
                }),

                new Mesh(this.viewer.scene, {
                    id: "blueLeg",
                    isObject: true,
                    position: [4, -6, 4],
                    scale: [1, 3, 1],
                    rotation: [0, 0, 0],
                    material: new PhongMaterial(this.viewer.scene, {
                        diffuse: [0.3, 0.3, 1.0]
                    }),
                    geometry: boxGeometry
                }),

                new Mesh(this.viewer.scene, {
                    id: "yellowLeg",
                    isObject: true,
                    position: [-4, -6, 4],
                    scale: [1, 3, 1],
                    rotation: [0, 0, 0],
                    material: new PhongMaterial(this.viewer.scene, {
                          diffuse: [1.0, 1.0, 0.0]
                    }),
                    geometry: boxGeometry
                }),

                new Mesh(this.viewer.scene, {
                    id: "tableTop",
                    isObject: true,
                    position: [0, -3, 0],
                    scale: [6, 0.5, 6],
                    rotation: [0, 0, 0],
                    material: new PhongMaterial(this.viewer.scene, {
                        diffuse: [1.0, 0.3, 1.0]
                    }),
                    geometry: boxGeometry
                })
            ]
        });
      }
    }
  }
</script>

<style scoped>
  #myCanvas {width:100%;height:100%;}
</style>
