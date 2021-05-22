<template lang="pug">
  div
    | Датчики
    device-list-item( v-for="d in devices" :key="d.uuid" :device="d" )
      
</template>

<script>
import { mapGetters } from 'vuex'
import DeviceListItem from '@/components/DeviceListItem'

export default {
  components: {
    DeviceListItem
  },

  computed: {
    ...mapGetters(['devices']),
  },
}
</script>