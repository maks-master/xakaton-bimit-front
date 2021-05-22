<template lang="pug">
  v-card
    v-card-title Датчики
    v-card-text
      v-tabs(v-model="tab")
        v-tab
          v-icon mdi-eye
        v-tab
          v-icon mdi-cog-counterclockwise

      v-tabs-items(v-model="tab")
        v-tab-item
          v-divider
          v-list-item
            v-list-item-content
              v-list-item-subtitle Привязанные
          v-divider

          v-list(dense)
            v-list-item(v-for="d in assignedDevices" :key="d.uuid")
              v-list-item-content
                v-list-item-title {{ d.name }}
                v-list-item-subtitle {{ dataBySensor(d) }}

          v-divider.mb-2
          v-list-item
            v-list-item-content
              v-list-item-subtitle Не привязанные
          v-divider

          v-list(dense)
            v-list-item(v-for="d in notAssignedDevices" :key="d.uuid")
              v-list-item-content
                v-list-item-title {{ d.name }}

        v-tab-item
          v-list-item(v-if="tab == 1")
            v-list-item-content Режим установки датчиков
          v-divider

          v-radio-group(v-model="radioGroup")
            v-list-item-subtitle.my-2 Привязанные
            v-row(no-gutters v-for="d in assignedDevices" :key="d.uuid")
              v-col
                v-radio(:label="d.name" :value="d.uuid")
              v-col(cols=2)
                v-btn(icon @click="showEditSensor(d)")
                  v-icon mdi-pencil
            v-list-item-subtitle.my-2 Не привязанные
            v-row(no-gutters v-for="d in notAssignedDevices" :key="d.uuid")
              v-col
                v-radio(:label="d.name" :value="d.uuid")
              v-col(cols=2)
                v-btn(icon @click="showEditSensor(d)")
                  v-icon mdi-pencil
      
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'


export default {
  components: {
    
  },

  data: () => ({
    drawer:false,
    tab:0,
    radioGroup:null
  }),

  mounted(){
    
  },

  watch: {
    tab(val){
      if (val == 1) this.SET_SENSORS_EDIT_MODE(true)
      else {
        this.radioGroup = null
        this.SET_SENSORS_EDIT_MODE(false)
      }
    },
    radioGroup(val){
      let sens = null
      if (val != null) sens = this.devices.find(d => d.uuid == val)
      this.SET_DEVICE_TO_EDIT(sens)
    },
    // deviceStates(val){

    // }
  },

  computed: {
    ...mapState(['deviceToEdit','deviceDataToSave','deviceStates']),
    ...mapGetters(['devices']),

    assignedDevices(){
      return this.devices.filter(d => d.elementId && d.position)
    },
    notAssignedDevices(){
      return this.devices.filter(d => !d.elementId || !d.position)
    }
  },

  methods: {
    ...mapMutations(['SET_SENSORS_EDIT_MODE','SET_DEVICE_TO_EDIT','SET_DEVICE_EDIT_DIALOG']),
    showEditSensor(d){
      let deviceEditDialog = {
        show:true,
        title:'Редактировать устройство',
        device:JSON.parse(JSON.stringify(d))
      }
      this.SET_DEVICE_EDIT_DIALOG(deviceEditDialog)
    },

    dataBySensor(d){
      let out = ''
      let data = this.deviceStates.find(sd => sd.deviceUuid == d.uuid)
      if (data) out = `avg:${data.average}, max:${data.max}, min:${data.min}`
      return out
    }
  }
}
</script>