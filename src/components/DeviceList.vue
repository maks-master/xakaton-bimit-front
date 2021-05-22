<template lang="pug">
  div
    v-list-item
      v-list-item-content
        v-list-item-title Датчики
        v-divider.my-2
        
        v-btn-toggle(v-model="toggle")
          v-btn(icon small)
            v-icon mdi-eye
          v-btn(icon small)
            v-icon mdi-cog-counterclockwise

    
    v-list-item(v-if="toggle == 1")
      v-list-item-content Режим установки датчиков
    

    v-divider
    v-list-item
      v-list-item-content
        v-list-item-subtitle Привязанные
    v-divider

    v-list(dense)
      v-list-item(v-for="d in assignedDevices" :key="d.uuid")
        v-list-item-content
          v-list-item-title {{ d.name }}

    v-divider.mb-2
    v-list-item
      v-list-item-content
        v-list-item-subtitle Не привязанные
    v-divider

    v-list(dense)
      v-list-item(v-for="d in notAssignedDevices" :key="d.uuid")
        v-list-item-content
          v-list-item-title {{ d.name }}
      
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'


export default {
  components: {
    
  },

  data: () => ({
    drawer:false,
    toggle:0
  }),

  mounted(){
    
  },

  watch: {
    toggle(val){
      if (val == 0) this.SET_SENSORS_EDIT_MODE(false)
      if (val == 1) this.SET_SENSORS_EDIT_MODE(true)
    }
  },

  computed: {
    ...mapGetters(['devices']),
    assignedDevices(){
      return this.devices.filter(d => d.elementId && d.position)
    },
    notAssignedDevices(){
      return this.devices.filter(d => !d.elementId || !d.position)
    }
  },

  methods: {
    ...mapMutations(['SET_SENSORS_EDIT_MODE'])

  }
}
</script>