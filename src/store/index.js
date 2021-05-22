import Vue from 'vue'
import Vuex from 'vuex'

import { unionBy } from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    devices: [],
    assignedDevices: [],
    notAssignedDevices: [],
    alarms: [],
    lastTime: null
  },

  getters: {
    devices: ({ devices }) => devices || [],
    assignedDevices: ({ assignedDevices }) => assignedDevices || [],
    notAssignedDevices: ({ notAssignedDevices }) => notAssignedDevices || [],
    alarms: ({ alarms }) => alarms || []
  },

  mutations: {
    REPLACE_DEVICES: (state, devices) => {
      state.devices = devices

      state.assignedDevices = devices.filter(d => d.elementId && d.position)
      state.notAssignedDevices = devices.filter(d => !d.elementId && !d.position)
    },

    ADD_ALARMS: (state, alarms) => {
      state.alarms = unionBy(state.alarms, alarms)
    },

    SAVE_LAST_TIME: (state, time) => {
      state.lastTime = time
    }
  },

  actions: {
    async getDevices ({ commit }) {
      let url = 'http://192.168.1.79:8080/xakaton/devices'
      let response = await fetch(url)
      let json = await response.json()

      commit('REPLACE_DEVICES', json)
    },

    async getAlarms ({ commit, dispatch, state }) {
      let url = 'http://192.168.1.25:8080/xakaton/device/0/alarms'
      if (state.lastTime) {
        url += `/${state.lastTime}`
      }
      
      let response = await fetch(url)
      let json = await response.json()

      commit('ADD_ALARMS', json.alarms)
      commit('SAVE_LAST_TIME', json.time)

      setTimeout(() => {
        dispatch('getAlarms')
      }, 400)
    },

  },

  modules: {
    
  },
})
