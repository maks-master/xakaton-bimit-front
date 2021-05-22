<template lang="pug">

  div
    canvas#myCanvas
    .wrapper
      .storeys
        storey-view( v-for="{ storeyMap, name } in storeys" :key="storeyMap.storeyId" :storeyMap="storeyMap" :name="name" @click.native="onStoreyClick(storeyMap)" )
    v-btn( @click="onCancelStorey" ) cancel

</template>

<script>
  import { Viewer } from '@xeokit/xeokit-sdk/src/viewer/Viewer.js'
  import { XKTLoaderPlugin } from '@xeokit/xeokit-sdk/src/plugins/XKTLoaderPlugin/XKTLoaderPlugin.js'

  import {Mesh, Node, PhongMaterial, buildBoxGeometry, ReadableGeometry} from "@xeokit/xeokit-sdk/src/viewer/scene"
  // eslint-disable-next-line
  import { StoreyViewsPlugin, math, CameraMemento, ObjectsMemento } from "@xeokit/xeokit-sdk"

  import StoreyView from '@/components/StoreyView'

  export default {

    components: {
      StoreyView
    },

    data: () => ({
      storeys: []
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
          src: "./model/scene.xkt",
          metaModelSrc: "./model/scene.json",
          edges: true
        })

        this.storeyViewsPlugin = new StoreyViewsPlugin(this.viewer)

        this.model.on("loaded", () => {
          console.log('model loaded')
          // this.addMesh()
          this.viewer.cameraFlight.flyTo(this.model)
          this.viewer.scene.setObjectsOpacity(this.viewer.metaScene.getObjectIDsByType("IfcDoor"), 0.3)
          this.buildStoreyMapsMenu()
        })

        this.viewer.cameraControl.on("picked", (pickResult) => {
          console.log('‼️ Res pickResult:', pickResult)
          console.log('‼️ Res pickResult._worldPos:', pickResult._worldPos)
          console.log('‼️ Res pickResult.position:', pickResult.position)
          console.log('‼️ Res pickResult.entity.id:', pickResult.entity.id)
        })
      },

      buildStoreyMapsMenu() {
        this.cameraMemento = new CameraMemento() // Saves 3D perspective camera to restore
        this.cameraMemento.saveCamera(this.viewer.scene)

        this.objectsMemento = new ObjectsMemento();

        const storeyIds = Object.keys(this.storeyViewsPlugin.storeys);

        // eslint-disable-next-line
        const canStandOnTypes = { // IFC types we can stand on in first-person mode
            IfcSlab: true,
            IfcStair: true,
            IfcFloor: true,
            IfcFooting: true
        };

        for (var i = 0, len = storeyIds.length; i < len; i++) {

            const storeyId = storeyIds[i];

            const storeyMap = this.storeyViewsPlugin.createStoreyMap(storeyId, {
                format: "png",
                width: 200,
                useObjectStates: true
            });

            let metaObject = this.viewer.metaScene.metaObjects[storeyId]
            this.storeys.push({ storeyMap, name: metaObject.name })

            // img.onmouseenter = () => {
            //     img.style.cursor = "default";
            // };

            // img.onmousemove = (e) => {
            //     img.style.cursor = "default";
            //     const imagePos = [e.offsetX, e.offsetY];
            //     const pickResult = this.storeyViewsPlugin.pickStoreyMap(storeyMap, imagePos, {});
            //     if (pickResult) {
            //         const entity = pickResult.entity;
            //         const metaObject = this.viewer.metaScene.metaObjects[entity.id];
            //         if (metaObject) {
            //             if (canStandOnTypes[metaObject.type]) {
            //                 img.style.cursor = "pointer";
            //             }
            //         }
            //     }
            // };

            // img.onmouseleave = () => {
            //     img.style.cursor = "default";
            // };

            // const worldPos = math.vec3();

            // img.onclick = (e) => {

            //     const imagePos = [e.offsetX, e.offsetY];

            //     const pickResult = this.storeyViewsPlugin.pickStoreyMap(storeyMap, imagePos, {
            //         pickSurface: true
            //     });

            //     if (pickResult) {

            //         worldPos.set(pickResult.worldPos);

            //         // Set camera vertical position at the mid point of the storey's vertical
            //         // extents - note how this is adapts to whichever of the X, Y or Z axis is
            //         // designated the World's "up" axis

            //         const camera = this.viewer.scene.camera;
            //         const idx = camera.xUp ? 0 : (camera.yUp ? 1 : 2); // Find the right axis for "up"
            //         const storey = this.storeyViewsPlugin.storeys[storeyMap.storeyId];
            //         worldPos[idx] = (storey.aabb[idx] + storey.aabb[3 + idx]) / 2;

            //         this.viewer.cameraFlight.flyTo({
            //             eye: worldPos,
            //             up: this.viewer.camera.worldUp,
            //             look: math.addVec3(worldPos, this.viewer.camera.worldForward, []),
            //             projection: "perspective",
            //             duration: 1.5
            //         }, () => {
            //             this.viewer.cameraControl.navMode = "firstPerson";
            //             this.viewer.cameraControl.followPointer = false;
            //         });
            //     } else {
            //         cameraMemento.restoreCamera(this.viewer.scene, () => {
            //             this.viewer.cameraControl.navMode = "planView";
            //         });
            //     }
            // };
        }
      },

      onCancelStorey () {
        this.cameraMemento.restoreCamera(this.viewer.scene)
        this.objectsMemento.restoreObjects(this.viewer.scene)
      },

      onStoreyClick (storeyMap) {
        console.log(storeyMap.storeyId)

        this.cameraMemento.saveCamera(this.viewer.scene)
        this.objectsMemento.saveObjects(this.viewer.scene)

        this.storeyViewsPlugin.showStoreyObjects(storeyMap.storeyId, {
          hideOthers: true,
          useObjectStates: false
        })

        this.storeyViewsPlugin.gotoStoreyCamera(storeyMap.storeyId, {
            projection: "perspective", // Perspective projection
            duration: 2.0,       // 2.5 second transition
            fitFOV: 65,
            done: () => {
                this.viewer.cameraControl.planView = true; // Disable rotation
            }
        })
      },

      addMesh () {
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
        })
      }
    }
  }
</script>

<style scoped>
#myCanvas {
  width: 100%;
  height: 400px;
}
.wrapper {
  overflow: auto;
}
.storeys {
  display: flex;
  justify-content: stretch;
}
</style>