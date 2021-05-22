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

    devicesEditMode:false,
    deviceToEdit:null,

    deviceEditDialog:{
      show:false,
      title:'',
      device:null
    },

    alarms: [],
    sensorType: SensorType.TEMPERATURE,

    deviceStates: []
  },

  getters: {
    devices: ({ devices }) => devices || [],
    alarms: ({ alarms }) => alarms || []
  },

  mutations: {
    REPLACE_DEVICES: (state, devices) => {
      state.devices = devices
    },

    UPDATE_DEVICE:(state, device) => {
      state.devices.map(d => {
        if (d.uuid == device.uuid) d = device
      })
    },

    SET_SENSORS_EDIT_MODE: (state, isEditMode) => {
      state.devicesEditMode = isEditMode
    },

    SET_DEVICE_TO_EDIT: (state, deviceToEdit) => {
      state.deviceToEdit = deviceToEdit
    },

    SET_DEVICE_EDIT_DIALOG: (state, d) => {
      state.deviceEditDialog = d
    },

    ADD_ALARMS: (state, alarms) => {
      state.alarms = unionBy(state.alarms, alarms)
    },

    SET_SENSOR_TYPE: (state, type) => {
      state.sensorType = type
      state.alarms = []
      lastTime = null
    },

    UPDATE_DEVICE_STATES: (state, states) => {
      state.deviceStates = states
    }
  },

  actions: {
    async getDevices ({ commit }) {
      let url = host+'/devices'
      let response = await fetch(url)
      let json = await response.json()

      commit('REPLACE_DEVICES', json)
    },

    async getAlarms ({ commit, dispatch, state }) {
      let url = `${host}/device/${state.sensorType}/alarms`
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

    async getDeviceStates ({ commit, dispatch }) {
      let url = `${host}/model/devices/state`
      let response = await fetch(url)
      let json = await response.json()

      if (json) {
        commit('UPDATE_DEVICE_STATES', json)
      }

      setTimeout(() => {
        dispatch('getDeviceStates')
      }, 400)
    },

    async saveDevice ({ commit }, device) {
      let response = await fetch(
        host+'/xakaton/devices', 
        {method: 'PUT',headers: {'Content-Type': 'application/json;charset=utf-8'},
        body: JSON.stringify(device)
      })
      let json = await response.json()
      commit('UPDATE_DEVICE',json)
    },


    switchSensors({ commit }, sensorType) {
      commit('SET_SENSOR_TYPE', sensorType)
    }

  },

  modules: {
    
  },
})
