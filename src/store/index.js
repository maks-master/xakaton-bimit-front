import Vue from 'vue'
import Vuex from 'vuex'

import { unionBy } from 'lodash'

Vue.use(Vuex)

import { SensorType } from '@/assets/enums'

let lastTime = null

// eslint-disable-next-line
let host = window.settings.server.url

export default new Vuex.Store({
  state: {
    devices: [],
    assignedDevices: [],
    notAssignedDevices: [],
    alarms: [],
    sensorType: SensorType.TEMPERATURE
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

    SET_SENSOR_TYPE: (state, type) => {
      state.sensorType = type
      state.alarms = []
      lastTime = null
    },
  },

  actions: {
    async getDevices ({ commit }) {
      let url = 'http://192.168.1.79:8080/xakaton/devices'
      let response = await fetch(url)
      let json = await response.json()

      commit('REPLACE_DEVICES', json)
    },

    async getAlarms ({ commit, dispatch, state }) {
      let url = `http://192.168.1.25:8080/xakaton/device/${state.sensorType}/alarms`
      if (lastTime) {
        url += `/${lastTime}`
      }

      let response = await fetch(url)
      let { time, alarms } = await response.json()

      if (alarms && time) {
        commit('ADD_ALARMS', alarms)
        lastTime = time
      }

      setTimeout(() => {
        dispatch('getAlarms')
      }, 400)
    },

    switchSensors({ commit }, sensorType) {
      commit('SET_SENSOR_TYPE', sensorType)
    }

  },

  modules: {
    
  },
})
