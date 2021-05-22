import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    devices: [],
    assignedDevices: [],
    notAssignedDevices: []
  },

  getters: {
    devices: ({ devices }) => devices || [],
    assignedDevices: ({ assignedDevices }) => assignedDevices || [],
    notAssignedDevices: ({ notAssignedDevices }) => notAssignedDevices || []
  },

  mutations: {
    REPLACE_DEVICES: (state, devices) => {
      state.devices = devices

      state.assignedDevices = devices.filter(d => d.elementId && d.position)
      state.notAssignedDevices = devices.filter(d => !d.elementId && !d.position)
    },
  },

  actions: {
    async getDevices ({ commit }) {
      let url = 'http://192.168.1.79:8080/xakaton/devices'
      let response = await fetch(url)
      let json = await response.json()

      commit('REPLACE_DEVICES', json)
    }
  },

  modules: {
    
  },
})
