<template lang="pug">
  v-app
    v-app-bar(app elevation="1" height="48px")
      v-toolbar-title BIMIT Хакатон - Цех №5
      v-spacer
      v-btn(icon @click="drawer = !drawer")
        v-icon mdi-cog-clockwise

    v-navigation-drawer(v-model="drawer" absolute right style="padding-top:48px;")
      DeviceList

    v-main(app)
      v-container.ma-0.pa-0.container-wrapper(fluid)
        router-view

    v-footer.py-5(padless)

</template>

<script>
  import DeviceList from '@/components/DeviceList'

  export default {
    components:{
      DeviceList
    },

    data: () => ({
      drawer:false
    }),

    mounted () {
      
    },

    computed: {
      
    },

    watch:{
      
    },

    methods: {
      
    }
  }
</script>

<style scoped>
.container-wrapper {
  height: 100%;
}
</style>