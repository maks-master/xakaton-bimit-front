<template lang="pug">
  v-app
    v-app-bar(app elevation="1" height="78px")
        v-spacer
        v-btn(icon @click="drawer = !drawer")
            v-icon mdi-cog-clockwise

    v-navigation-drawer(v-model="drawer" absolute right style="padding-top:78px;")
      DeviceList

    v-main(app)
      v-container
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