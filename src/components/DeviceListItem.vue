<template lang="pug">
  .wrapper
    div Название: {{ device.name }}
    div Тип датчика: {{ device.deviceType.title }}
    div Состояние: {{ device.deviceState.title }}
</template>

<script>
export default {
  props: {
    device: Object,
  },
}
</script>

<style module>
.wrapper {
  border: 1px solid black;
  padding: 5px;
  margin: 5px;
}
</style>