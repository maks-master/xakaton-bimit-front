<template lang="pug">
  div
    v-list-item
      v-list-item-content
        v-list-item-title Датчики

    v-list(dense)
      v-list-item(v-for="d in devices" :key="d.uuid" :device="d")
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
  },
}
</script>