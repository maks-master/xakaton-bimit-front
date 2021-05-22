<template lang="pug">

  div
    canvas#myCanvas
    div#storeys

</template>

<script>
  import { Viewer } from '@xeokit/xeokit-sdk/src/viewer/Viewer.js'
  import { XKTLoaderPlugin } from '@xeokit/xeokit-sdk/src/plugins/XKTLoaderPlugin/XKTLoaderPlugin.js'

  import {Mesh, Node, PhongMaterial, buildBoxGeometry, ReadableGeometry} from "@xeokit/xeokit-sdk/src/viewer/scene"
  import { StoreyViewsPlugin, math, CameraMemento } from "@xeokit/xeokit-sdk"

  export default {
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
        const cameraMemento = new CameraMemento() // Saves 3D perspective camera to restore
        cameraMemento.saveCamera(this.viewer.scene)

        const storeyDiv = document.getElementById("storeys")
        const storeyIds = Object.keys(this.storeyViewsPlugin.storeys);

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
                width: 300,
                useObjectStates: true
            });

            const img = document.createElement("img");
            img.src = storeyMap.imageData;
            img.style.border = "1px solid #000000";
            img.style.background = "lightblue";
            img.style.width = storeyMap.width + "px";
            img.style.height = storeyMap.height + "px";
            img.style.opacity = 0.8;

            storeyDiv.appendChild(img);

            img.onmouseenter = () => {
                img.style.cursor = "default";
            };

            img.onmousemove = (e) => {
                img.style.cursor = "default";
                const imagePos = [e.offsetX, e.offsetY];
                const pickResult = this.storeyViewsPlugin.pickStoreyMap(storeyMap, imagePos, {});
                if (pickResult) {
                    const entity = pickResult.entity;
                    const metaObject = this.viewer.metaScene.metaObjects[entity.id];
                    if (metaObject) {
                        if (canStandOnTypes[metaObject.type]) {
                            img.style.cursor = "pointer";
                        }
                    }
                }
            };

            img.onmouseleave = () => {
                img.style.cursor = "default";
            };

            const worldPos = math.vec3();

            img.onclick = (e) => {

                const imagePos = [e.offsetX, e.offsetY];

                const pickResult = this.storeyViewsPlugin.pickStoreyMap(storeyMap, imagePos, {
                    pickSurface: true
                });

                if (pickResult) {

                    worldPos.set(pickResult.worldPos);

                    // Set camera vertical position at the mid point of the storey's vertical
                    // extents - note how this is adapts to whichever of the X, Y or Z axis is
                    // designated the World's "up" axis

                    const camera = this.viewer.scene.camera;
                    const idx = camera.xUp ? 0 : (camera.yUp ? 1 : 2); // Find the right axis for "up"
                    const storey = this.storeyViewsPlugin.storeys[storeyMap.storeyId];
                    worldPos[idx] = (storey.aabb[idx] + storey.aabb[3 + idx]) / 2;

                    this.viewer.cameraFlight.flyTo({
                        eye: worldPos,
                        up: this.viewer.camera.worldUp,
                        look: math.addVec3(worldPos, this.viewer.camera.worldForward, []),
                        projection: "perspective",
                        duration: 1.5
                    }, () => {
                        this.viewer.cameraControl.navMode = "firstPerson";
                        this.viewer.cameraControl.followPointer = false;
                    });
                } else {
                    cameraMemento.restoreCamera(this.viewer.scene, () => {
                        this.viewer.cameraControl.navMode = "planView";
                    });
                }
            };
        }
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
</style>