<template lang="pug">

  .wrapper
    canvas#myCanvas
    
    .storeys-wrapper
      .storeys
        storey-view( 
          v-for="s in storeys" 
          :key="s.storeyMap.storeyId" 
          :storeyMap="s.storeyMap" 
          :name="s.name" 
          :selected="current && current.storeyMap.storeyId == s.storeyMap.storeyId" 
          @click.native="onStoreyClick(s)" 
          )
    
    timeline.timeline( :data="events" )

    v-card.main-plan( v-if="current" )
      storey-view( :storeyMap="current.storeyMap" :name="current.name" max-size="300" @click.native="onPlanClick" )
      v-btn.main-plan__close( fab small @click="onCancelStorey" ) X

    .buttons
      v-tooltip( right open-delay=300)
        template( v-slot:activator="{ on, attrs }" )
          v-btn( width="40" height="50" tile v-on="on" )
            v-img( src="/icons/light_96px.png" height="48" contain )
        span Показать только температурные датчики

      v-tooltip( right open-delay=300)
        template( v-slot:activator="{ on, attrs }" )
          v-btn.mt-4( width="40" height="50" tile v-on="on" )
            v-img( src="/icons/light_96px.png" height="48" contain )
        span Показать только датчики освещения

      v-tooltip( right open-delay=300)
        template( v-slot:activator="{ on, attrs }" )
          v-btn.mt-4( width="40" height="50" tile v-on="on" )
            v-img( src="/icons/lightning_bolt_96px.png" height="48" contain )
        span Показать только датчики напряжения

    v-dialog(v-model="deviceEditDialog.show" v-if="deviceEditDialog.device" max-width="500")
      v-card
        v-card-title {{ deviceEditDialog.title }}

        v-card-text
          v-text-field(v-model="deviceEditDialog.device.name" label="Название")
          v-text-field(v-model="deviceEditDialog.device.frequency" label="Частота")
          v-text-field(v-model="deviceEditDialog.device.minValue" label="Минимум")
          v-text-field(v-model="deviceEditDialog.device.maxValue" label="Максимум")

          div позиция {{ deviceEditDialog.device.position }}
          div камера {{ deviceEditDialog.device.cameraPosition }}
          div elementId {{ deviceEditDialog.device.elementId }}
        v-card-actions
          v-spacer
          v-btn(@click="cancelEditSensor") Отмена
          v-btn(@click="saveEditSensor") Сохранить

</template>

<script>
  import { Viewer } from '@xeokit/xeokit-sdk/src/viewer/Viewer.js'
  import { XKTLoaderPlugin } from '@xeokit/xeokit-sdk/src/plugins/XKTLoaderPlugin/XKTLoaderPlugin.js'

  // eslint-disable-next-line
  import { Mesh, Node, PhongMaterial, buildBoxGeometry, ReadableGeometry, VBOGeometry, buildSphereGeometry } from "@xeokit/xeokit-sdk/src/viewer/scene"

  // eslint-disable-next-line
  import { StoreyViewsPlugin, math, CameraMemento, ObjectsMemento } from "@xeokit/xeokit-sdk"

  import StoreyView from '@/components/StoreyView'
  import Timeline from "@/components/Timeline"  

  import { mapState, mapGetters, mapMutations } from 'vuex'

  const worldPos = math.vec3();

  export default {

    components: {
      StoreyView,
      Timeline,
    },

    data: () => ({
      panel: [],
      storeys: [],
      current: null,
      events: [
        {
          name: "",
          start: new Date(2021, 4, 21),
          end: new Date(2021, 4, 25),
          uuid: "123",
        },
        {
          name: "",
          start: new Date(2021, 4, 19),
          end: new Date(2021, 4, 24),
          uuid: "abs",
        },
        {
          name: "",
          start: new Date(2021, 4, 15),
          end: new Date(2021, 4, 18),
          uuid: "qwerty",
        },
        {
          name: "",
          start: new Date(2021, 4, 22),
          end: new Date(2021, 4, 23),
          uuid: "qwerty",
        }
      ]
    }),

    watch: {
      devices: 'onDeviceUpdate',
      deviceToEdit: 'bindEditMode',
    },

    computed: {
      ...mapState(['devicesEditMode','deviceToEdit','deviceEditDialog']),
      ...mapGetters(['devices'])
    },

    mounted () {
      this.init()
    },

    methods: {
      ...mapMutations(['SET_DEVICE_TO_SAVE','SET_DEVICE_EDIT_DIALOG']),
      onDeviceUpdate () {
        this.devices.forEach(device => {
          this.addDevice(device)
        })
        this.buildStoreyMapsMenu()
      },

      init() {
        this.lastEntity = null
        this.viewer = new Viewer({
          canvasId: "myCanvas",
          transparent: true,
          saoEnabled: true,
          pbrEnabled: true,
          backfaces: true,
        })

        this.makeHelpMesh()

        let objectDefaults = { 
          IfcSpace: { 
            pickable: false, 
            opacity: 0.2,
            visible: false,
          },
          IfcWindow: {
            colorize: [0.2578125, 0.6953125, 0.84765625],
            opacity: 0.6
          }
        }

        this.xktLoader = new XKTLoaderPlugin(this.viewer);

        this.model = this.xktLoader.load({
          id: "myModel",
          src: "./model/scene.xkt",
          metaModelSrc: "./model/scene.json",
          edges: true,
          objectDefaults,
        })

        this.storeyViewsPlugin = new StoreyViewsPlugin(this.viewer)

        this.model.on("loaded", () => {
          this.viewer.cameraFlight.flyTo(this.model)
          this.viewer.scene.setObjectsOpacity(this.viewer.metaScene.getObjectIDsByType("IfcDoor"), 0.3)
          // this.buildStoreyMapsMenu()
          this.$store.dispatch('getDevices')
          this.$store.dispatch('getAlarms')
        })

        this.viewer.cameraControl.on("picked", (pickResult) => {
          console.log('‼️ Res pickResult:', pickResult)
          console.log('‼️ Res pickResult._worldPos:', pickResult._worldPos)
          console.log('‼️ Res pickResult.position:', pickResult.position)
          console.log('‼️ Res pickResult.entity.id:', pickResult.entity.id)

          if (this.deviceToEdit && this.hitHelper && this.hitHelper.node.position) {
            console.log('‼️ HELPER:', this.deviceToEdit)
            console.log('‼️ HELPER:', this.hitHelper.node.position)

            let device_EDIT = JSON.parse(JSON.stringify(this.deviceToEdit))
            if (device_EDIT.position == null) device_EDIT.position = {}
            device_EDIT.position.x = this.hitHelper.node.position[0]
            device_EDIT.position.y = this.hitHelper.node.position[1]
            device_EDIT.position.z = this.hitHelper.node.position[2]

            if (device_EDIT.cameraPosition == null) device_EDIT.cameraPosition = {}
            device_EDIT.cameraPosition.x = this.viewer.camera.eye[0]
            device_EDIT.cameraPosition.y = this.viewer.camera.eye[1]
            device_EDIT.cameraPosition.z = this.viewer.camera.eye[2]
            device_EDIT.elementId = pickResult.entity.id

            let d = {
              show:true,
              title:'Редактировать устройство',
              device:JSON.parse(JSON.stringify(device_EDIT))
            }
            this.SET_DEVICE_EDIT_DIALOG(d)
          }
        })
      },

      buildStoreyMapsMenu() {
        this.cameraMemento = new CameraMemento()
        this.cameraMemento.saveCamera(this.viewer.scene)

        this.objectsMemento = new ObjectsMemento()
        this.objectsMemento.saveObjects(this.viewer.scene)

        const storeyIds = Object.keys(this.storeyViewsPlugin.storeys);

        // eslint-disable-next-line
        const canStandOnTypes = {
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
        this.current = null
        this.cameraMemento.restoreCamera(this.viewer.scene)
        this.objectsMemento.restoreObjects(this.viewer.scene)
      },

      onStoreyClick (storey) {
        let { storeyMap } = storey
        console.log(storeyMap.storeyId)

        // this.cameraMemento.saveCamera(this.viewer.scene)
        // this.objectsMemento.saveObjects(this.viewer.scene)

        this.storeyViewsPlugin.showStoreyObjects(storeyMap.storeyId, {
          hideOthers: true,
          useObjectStates: false
        })

        this.storeyViewsPlugin.gotoStoreyCamera(storeyMap.storeyId, {
          // projection: "ortho",
          projection: "perspective", // Perspective projection
          duration: 2.0,       // 2.5 second transition
          // fitFOV: 65,
          // done: () => {
          //   this.viewer.cameraControl.planView = true; // Disable rotation
          // }
        })

        this.current = storey
      },

      onPlanClick (e) {
        const imagePos = [e.offsetX, e.offsetY]
        
        const pickResult = this.storeyViewsPlugin.pickStoreyMap(this.current.storeyMap, imagePos, {
          pickSurface: true
        })
        
        if (pickResult) {
          console.log(pickResult)
          worldPos.set(pickResult.worldPos)

          const camera = this.viewer.scene.camera
          const idx = camera.xUp ? 0 : (camera.yUp ? 1 : 2)
          const storey = this.storeyViewsPlugin.storeys[this.current.storeyMap.storeyId]
          worldPos[idx] = (storey.aabb[idx] + storey.aabb[3 + idx]) / 2

          this.viewer.cameraFlight.flyTo({
              eye: worldPos,
              up: this.viewer.camera.worldUp,
              look: math.addVec3(worldPos, this.viewer.camera.worldForward, []),
              projection: "perspective",
              duration: 1.5
          }, () => {
            this.viewer.cameraControl.navMode = "firstPerson";
          })
        } else {
          this.storeyViewsPlugin.gotoStoreyCamera(this.current.storeyMap.storeyId, {
            // projection: "ortho",
            projection: "perspective",
            duration: 1.5,
            // done: () => {
            //   this.viewer.cameraControl.navMode = "planView"
            // }
          })
        }
      },

      addDevice (device) {
        if (device.elementId && device.position){
          // let object = this.viewer.metaScene.metaObjects[device.elementId]
          // console.log(object);

          const boxGeometry = new ReadableGeometry(this.viewer.scene, buildBoxGeometry({
              xSize: 1,
              ySize: 1,
              zSize: 1
          }))

          new Mesh(this.model, {
            id: device.uuid,
            // isModel: true,
            // pickable: true,
            position: [device.position.x, device.position.y, device.position.z],
            scale: [1, 1, 1],
            rotation: [0, 0, 0],
            material: new PhongMaterial(this.viewer.scene, {
                diffuse: [1.0, 0.3, 1.0]
            }),
            geometry: boxGeometry
          })

          // new Node(this.viewer.scene, {
          //     id: device.uuid,
          //     isModel: true,
          //     rotation: [0, 0, 0],
          //     position: [device.position.x, device.position.y, device.position.z],
          //     scale: [1, 1, 1],

          //     children: [
          //       new Mesh(this.viewer.scene, {
          //         id: `${device.uuid}_mesh`,
          //         isObject: true,
          //         position: [0, 0, 0],
          //         scale: [1, 1, 1],
          //         rotation: [0, 0, 0],
          //         material: new PhongMaterial(this.viewer.scene, {
          //             diffuse: [1.0, 0.3, 1.0]
          //         }),
          //         geometry: boxGeometry
          //       })
          //     ]
          // })
        }
      },

      bindEditMode(){
        this.hitHelper.hide()
        console.log(this.devicesEditMode)
        if (this.deviceToEdit && this.devicesEditMode) {
          if (!this.onMouseMove) this.bindMouseMove()
          this.viewer.scene.input.setEnabled(true);
        } else {
          this.viewer.scene.input.setEnabled(false);
        }
      },

      bindMouseMove(){
        let viewer = this.viewer
        let hitHelper = this.hitHelper
        this.onMouseMove = viewer.scene.input.on("mousemove", function (coords) {

            var hit = viewer.scene.pick({
                canvasPos: coords,
                pickSurface: true
            });

            if (hit) {
              hitHelper.show(hit);
            } else {
              hitHelper.hide();
            }
        })
      },

      makeHelpMesh(){
        let viewer = this.viewer
        this.hitHelper = new (function () {

            const zeroVec = new Float32Array([0, 0, -1]);
            const quat = new Float32Array(4);

            this.node = new Node(viewer.scene, {
                pickable: false,
                visible: true,
                position: [0, 0, 0],

                children: [
                    new Mesh(viewer.scene, {
                        geometry: new VBOGeometry(viewer.scene, buildSphereGeometry({radius: .2})),
                        material: new PhongMaterial(viewer.scene, {emissive: [1, 0, 0], diffuse: [0, 0, 0]}),
                        pickable: false
                    }),
                    new Mesh(viewer.scene, {
                        geometry: new VBOGeometry(viewer.scene, {
                            primitive: "lines",
                            positions: [
                                0.0, 0.0, 0.0, 0.0, 0.0, -2.0
                            ],
                            indices: [0, 1]
                        }),
                        material: new PhongMaterial(viewer.scene, {emissive: [1, 1, 0], diffuse: [0, 0, 0], lineWidth: 4}),
                        pickable: false
                    })
                ]
            });

            var node = this.node
            

            this.show = function (hit) {
                node.position = hit.worldPos;
                node.visible = true;

                (this._dir = this._dir || math.vec3()).set(hit.worldNormal || [0, 0, 1]);
                math.vec3PairToQuaternion(zeroVec, this._dir, quat);
                node.quaternion = quat;
            };

            this.hide = function () {
                node.visible = false;
            };
        })();
        
      },

      cancelEditSensor(){
        let d = {
          show:false,
          title:'',
          device:null
        }
        this.SET_DEVICE_EDIT_DIALOG(d)
      },

      saveEditSensor(){
        console.log(this.deviceEditDialog)
        console.log(this.deviceEditDialog.device)
      }

    }
  }

</script>

<style scoped>
.wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}
#myCanvas {
  width: 100%;
  /* height: 400px; */
  height: calc(100% - 77px - 162px - 2 * 10px);
  /* flex: 1 1 auto; */
}
.storeys-wrapper {
  overflow: auto;
  margin-bottom: 10px;
  margin-top: 10px;
  /* height: 182px; */
}
.storeys {
  display: flex;
  justify-content: stretch;
}
/* .timeline {
  height: 77px;
} */
.main-plan {
  position: absolute;
  right: 20px;
  top: 60px;
  padding: 20px;
  overflow-y: hidden;
  height: auto;
  pointer-events: all;
  width: auto;
  user-select: none;
  overflow: visible;
}
.main-plan__close {
  position: absolute;
  top: -15px;
  right: -15px;
}
.buttons {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 20px;
  left: 20px;
}
</style>