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
          :devices="s.devices"
          :selected="current && current.storeyMap.storeyId == s.storeyMap.storeyId" 
          @click.native="onStoreyClick(s)" 
          )
    
    
    timeline.timeline( @click="onEventClick" )

    v-card.main-plan( v-if="current" )
      storey-view( :storeyMap="current.storeyMap" :name="current.name" max-size="300" @imageclick="onPlanClick" )
      alert-list( :storeyMap="current.storeyMap" :device-ids="current.devices" @select="onEventClick" )
      v-btn.main-plan__close( fab small @click="onCancelStorey" ) X

    .buttons
      v-tooltip( v-for="(s, idx) in sensors" :key="s.icon" right open-delay=300)
        template( v-slot:activator="{ on, attrs }" )
          v-card.mt-4( :color="s.type == sensorType ? '#1DE9B6' : ''" width="50" height="50" v-on="on" @click="onSwicth(s.type)" )
            v-img( :src="`/icons/${s.icon}.png`" height="48" aspect-ratio="1" contain )
        span {{ s.tip }}

    .opacityslider
      v-slider(v-model="modelOacity" max="1" min="0.3" step="0.05")

    v-dialog(v-model="deviceEditDialog.show" v-if="deviceEditDialog.device" max-width="500")
      v-card
        v-card-title {{ deviceEditDialog.title }}

        v-card-text
          v-text-field(v-model="deviceEditDialog.device.name" label="Название")
          v-text-field(v-model="deviceEditDialog.device.frequency" label="Частота")
          v-text-field(v-model="deviceEditDialog.device.minValue" label="Минимум")
          v-text-field(v-model="deviceEditDialog.device.maxValue" label="Максимум")
          v-select(v-model="deviceEditDialog.device.deviceType" :items="deviceTypes" item-text="title" item-value="value" label="Тип датчика" return-object)
          v-select(v-model="deviceEditDialog.device.deviceState" :items="deviceEnumStates" item-text="title" item-value="value" label="Состояние датчика" return-object)

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
  import AlertList from "@/components/AlertList"  

  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

  import { SensorType } from '@/assets/enums'

  const worldPos = math.vec3();

  export default {

    components: {
      StoreyView,
      Timeline,
      AlertList,
    },

    data: () => ({
      panel: [],
      storeys: [],
      current: null,
      modelOacity:0.6
    }),

    watch: {
      devices: 'onDeviceUpdate',
      deviceToEdit: 'bindEditMode',
      deviceStates: 'onDeviceStatesUpdate',
      modelOacity(val){
        this.model.opacity = val
      }
    },

    computed: {
      ...mapState(['devicesEditMode', 'deviceToEdit', 'deviceEditDialog', 'sensorType', 'deviceStates','deviceTypes','deviceEnumStates']),
      ...mapGetters(['devices']),

      sensors () {
        return [
          { type: SensorType.TEMPERATURE, icon: 'temperature_high_96px', tip: 'Показать только температурные датчики' },
          { type: SensorType.LUMINOSITY, icon: 'light_96px', tip: 'Показать только датчики освещения' },
          { type: SensorType.POWER, icon: 'lightning_bolt_96px', tip: 'Показать только датчики напряжения' },
        ]
      }
    },

    mounted () {
      this.init()
    },

    methods: {
      ...mapActions(['switchSensors','saveDevice']),
      ...mapMutations(['SET_DEVICE_TO_SAVE','SET_DEVICE_EDIT_DIALOG']),

      onEventClick (event) {
        let { deviceUuid } = event
        let device = this.devices.find(item => item.uuid === deviceUuid)

        if (device) {
          let object = this.deviceMeshes.find(d => d.id == device.uuid)
          // let node = this.viewer.scene.objects[device.elementId]
          console.log(device);
          console.log(object);

          // this.viewer.cameraFlight.flyTo({ component: object, fitFOV: 75 })

          let { x, y, z } = device.cameraPosition

console.log(device.cameraPosition)

          this.viewer.camera.eye = [x, y, z]
          this.viewer.camera.look = [device.position.x, device.position.y, device.position.z]
          
          object.selected = true
        }
      },

      // onAlertClick (event) {

      // },

      onSwicth (type) {
        this.switchSensors(type)
        this.showSwitchedSensors()
      },

      showSwitchedSensors(){

        this.devices.forEach(device => {
          let object = this.deviceMeshes.find(d => d.id == device.uuid)
          if (object) {
            let { deviceType } = device
            let visible = deviceType && deviceType.value == this.sensorType
            if (visible && this.current) {
              let store = this.findStoreyFromElement(device.elementId)
              visible = store && store.id == this.current.storeyMap.storeyId
            } 
            object.visible = visible
          }
        })
      },

      onDeviceStatesUpdate () {
        this.deviceStates.forEach(item => {
          let { deviceUuid, color, alarm } = item
          let object = this.deviceMeshes.find(d => d.id == deviceUuid)

          let colors = [
            [255, 255, 0],
            [255, 111, 0],
            [211, 47, 47],
            [125, 87, 194],
          ]

          let scales = [2, 4, 6, 8]

          if (object) {
            if (alarm) {
              let { value } = alarm.alarmLevel
              object.colorize = colors[value].map(c => +c / 255)

              let scale = scales[value]
              object.scale = [scale, scale, scale]
              // object.scale = [value + 2, value + 2, value + 2]
            } 
            else {
              object.colorize = color.split(',').map(c => +c / 255)
              object.scale = [1, 1, 1]
            }
          }
        })
      },

      onDeviceUpdate () {
        this.devices.forEach(device => {
          this.addDevice(device)
        })
        this.onSwicth(SensorType.TEMPERATURE)
        this.buildStoreyMapsMenu()
      },

      init() {
        this.deviceMeshes = []
        this.hitHelper = null

        this.viewer = new Viewer({
          canvasId: "myCanvas",
          transparent: true,
          saoEnabled: true,
          pbrEnabled: true,
          backfaces: true,
        })

        this.viewer.camera.eye = [ -1, 1, 5 ]
        this.viewer.camera.look = [ -1, 0, 0 ]
        // this.viewer.camera.up = [ 0.25, 0.22, -0.94 ]
        this.viewer.camera.projection = "perspective";

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
          this.viewer.scene.setObjectsOpacity(this.viewer.metaScene.getObjectIDsByType("IfcDoor"), 0.3)
          // this.buildStoreyMapsMenu()

          this.viewer.cameraFlight.flyTo(this.model)
          // this.viewer.cameraFlight.flyTo({ fit: true })
          // this.viewer.scene.setObjectsOpacity(this.viewer.metaScene.getObjectIDsByType("IfcDoor"), 0.3)
          // this.buildStoreyMapsMenu()
          
          this.$store.dispatch('getDevices')
          this.$store.dispatch('getAlarms')
          this.$store.dispatch('getDeviceStates')

          this.model.opacity = this.modelOacity
        })

        this.viewer.cameraControl.on("picked", (pickResult) => {
          if (this.deviceToEdit && this.hitHelper && this.hitHelper.node.position) {
            let device_EDIT = JSON.parse(JSON.stringify(this.deviceToEdit))
            if (!device_EDIT.position || device_EDIT.position == null) device_EDIT.position = {}
            device_EDIT.position.x = this.hitHelper.node.position[0]
            device_EDIT.position.y = this.hitHelper.node.position[1]
            device_EDIT.position.z = this.hitHelper.node.position[2]

            if (!device_EDIT.cameraPosition || device_EDIT.cameraPosition == null) device_EDIT.cameraPosition = {}
            device_EDIT.cameraPosition.x = this.viewer.camera.eye[0]
            device_EDIT.cameraPosition.y = this.viewer.camera.eye[1]
            device_EDIT.cameraPosition.z = this.viewer.camera.eye[2]
            device_EDIT.elementId = pickResult.entity.id

            if (!device_EDIT.deviceType || device_EDIT.deviceType == null) device_EDIT.deviceType = {}
            device_EDIT.deviceType.title = 'Температура'
            device_EDIT.deviceType.name = 'TEMPERATURE'
            device_EDIT.deviceType.value = 0

            if (!device_EDIT.deviceState || device_EDIT.deviceState == null) device_EDIT.deviceState = {}
            device_EDIT.deviceType.title = 'В сети'
            device_EDIT.deviceType.name = 'ONLINE'
            device_EDIT.deviceType.value = 0

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

          let list = []
          this.devices.forEach(item => {
            let sm = this.findStoreyFromElement(item.elementId)
            if (sm && sm.id == storeyMap.storeyId) {
              list.push(item.uuid)
            }
          })

          let metaObject = this.viewer.metaScene.metaObjects[storeyId]
          this.storeys.push({ storeyMap, name: metaObject.name, devices: list })
        }
      },

      onCancelStorey () {
        this.current = null
        this.cameraMemento.restoreCamera(this.viewer.scene)
        this.objectsMemento.restoreObjects(this.viewer.scene)

        //this.deviceMeshes.map(m => m.visible = true)
        this.onSwicth(this.sensorType)
      },

      onStoreyClick (storey) {
        let { storeyMap } = storey

        this.storeyViewsPlugin.showStoreyObjects(storeyMap.storeyId, {
          hideOthers: true,
          useObjectStates: false
        })

        this.storeyViewsPlugin.gotoStoreyCamera(storeyMap.storeyId, {
          projection: "perspective",
          duration: 2.0,
        })

        this.current = storey

        this.showSwitchedSensors()
      },

      onPlanClick (imagePos) {
        // const imagePos = [event.offsetX, event.offsetY]
        
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
          })
        }
      },

      addDevice (device) {
        if (device.elementId && device.position) {
          let { deviceType } = device
          let visible = deviceType && deviceType.value == this.sensorType

          let n = new Node(this.model, {
            id: device.uuid,
            pickable: false,
            visible,
            position: [device.position.x, device.position.y, device.position.z],

            children: [
              new Mesh(this.model, {
                geometry: new VBOGeometry(this.viewer.scene, buildSphereGeometry({radius: .2})),
                // material: new PhongMaterial(this.viewer.scene, {emissive: [0, 0, 0], diffuse: [0, 0, 0]}),
                material: new PhongMaterial(this.viewer.scene),
                pickable: false
              })
            ]
          });

          this.deviceMeshes.push(n);
        }
      },

      bindEditMode(){
        if (this.deviceToEdit && this.devicesEditMode) {
          if (!this.onMouseMove) this.bindMouseMove()
          this.viewer.scene.input.setEnabled(true);
        } else {
          this.viewer.scene.input.setEnabled(false);
        }
        this.hitHelper.hide()
      },

      bindMouseMove(){
        let viewer = this.viewer
        if (!this.hitHelper) this.makeHelpMesh()
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
                visible: false,
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
        let pos = [this.deviceEditDialog.device.position.x,this.deviceEditDialog.device.position.y,this.deviceEditDialog.device.position.z]

        this.findStoreyFromElement(this.deviceEditDialog.device.elementId)

        this.saveDevice(this.deviceEditDialog.device)
        if (this.hitHelper) this.hitHelper.hide();
        let uuid = this.deviceEditDialog.device.uuid
        let object = this.deviceMeshes.find(d => d.id == uuid)
        if (!object) {
          this.addDevice(this.deviceEditDialog.device)
        }
        object = this.deviceMeshes.find(d => d.id == uuid)
        object.position = pos

        this.cancelEditSensor()
      },

      findStoreyFromElement(elementId){
        let element = this.viewer.metaScene.metaObjects[elementId]
        if (element) {
          if (element.type == 'IfcBuildingStorey') return element
          let parent = element.parent
          if (parent != null) return this.findStoreyFromElement(parent.id)
        }
        return null
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
.opacityslider {
  position: absolute;
  right: 20px;
  width: 200px
}
</style>