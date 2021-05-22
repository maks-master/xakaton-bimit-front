<template lang="pug">
  div
    v-list-item
      v-list-item-content
        v-list-item-title Датчики

    v-divider
    v-list-item
      v-list-item-content
        v-list-item-title Привязанные
    v-divider

    v-list(dense)
      v-list-item(v-for="d in assignedDevices" :key="d.uuid")
        v-list-item-content
          v-list-item-title {{ d.name }}

    v-divider.mb-2
    v-list-item
      v-list-item-content
        v-list-item-title Не привязанные
    v-divider

    v-list(dense)
      v-list-item(v-for="d in notAssignedDevices" :key="d.uuid")
        v-list-item-content
          v-list-item-title {{ d.name }}
      
</template>

<script>
import { mapGetters } from 'vuex'


export default {
  components: {
    
  },

  data: () => ({
    drawer:false
  }),

  mounted(){
    
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
}
</script>