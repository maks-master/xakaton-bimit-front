<template lang="pug">
  v-app 
    router-view
    //- HelloWorld
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',

  components: {
    HelloWorld,
  },

  data: () => ({
    //
  })
};
</script>
