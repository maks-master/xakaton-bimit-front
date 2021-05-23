import Vue from 'vue'
import Vuex from 'vuex'

import { unionBy } from 'lodash'
import debounce from 'lodash/debounce'

Vue.use(Vuex)

import { SensorType } from '@/assets/enums'

let lastTime = null

// eslint-disable-next-line
let host = window.settings.server.url

async function getAlarms (sensorType) {
  let url = `${host}/device/${sensorType}/alarms`
  if (lastTime) {
    url += `/${lastTime}`
  }
  
  let response = await fetch(url)
  let { time, alarms } = await response.json()
  
  if (alarms && time) {
    lastTime = time
    return alarms
  }
  return []
}

async function getDeviceStates () {
  let url = `${host}/model/devices/state`
  let response = await fetch(url)
  let json = await response.json()

  return json
}

// eslint-disable-next-line
const debounced_getAlarms = debounce(getAlarms, 500)
// eslint-disable-next-line
const debounced_getDeviceStates = debounce(getDeviceStates, 500)


export default new Vuex.Store({
  state: {
    devices: [],

    deviceTypes:[],
    deviceEnumStates:[],

    devicesEditMode:false,
    deviceToEdit:null,

    deviceEditDialog:{
      show:false,
      title:'',
      device:null
    },

    alarms: [],
    sensorType: SensorType.TEMPERATURE,

    deviceStates: [],
    isActive: true,
  },

  getters: {
    devices: ({ devices }) => devices || [],
    alarms: ({ alarms }) => alarms || [],
    storeyAlarms: ({ deviceStates }) => deviceStates.filter(i => i.alarm).map(i => i.alarm),
  },

  mutations: {
    REPLACE_DEVICES: (state, devices) => {
      state.devices = devices
    },

    REPLACE_DEVICETYPES: (state, deviceTypes) => {
      state.deviceTypes = deviceTypes
    },

    REPLACE_DEVICESTATES: (state, deviceEnumStates) => {
      state.deviceEnumStates = deviceEnumStates
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
      state.isActive = true
      lastTime = null
    },

    UPDATE_DEVICE_STATES: (state, states) => {
      state.deviceStates = states
    },

    SET_ACTIVITY: (state, active) => {
      state.isActive = active
    }
  },

  actions: {
    async getDeviceTypes ({ commit }) {
      let url = host+'/devices/types'
      let response = await fetch(url)
      let json = await response.json()
      commit('REPLACE_DEVICETYPES', json)
    },

    async getDeviceEnumStates ({ commit }) {
      let url = host+'/devices/states'
      let response = await fetch(url)
      let json = await response.json()

      commit('REPLACE_DEVICESTATES', json)
    },

    async getDevices ({ commit, dispatch }) {
      let url = host+'/devices'
      let response = await fetch(url)
      let json = await response.json()

      dispatch('getDeviceTypes')
      dispatch('getDeviceEnumStates')

      commit('REPLACE_DEVICES', json)
    },

    toggleActivity ({ commit }, active) {
      commit('SET_ACTIVITY', active)
    },

    async getAlarms ({ commit, dispatch, state }) {
      if (state.isActive) {
        let alarms = await debounced_getAlarms(state.sensorType)
        commit('ADD_ALARMS', alarms)

        // let url = `${host}/device/${state.sensorType}/alarms`
        // if (lastTime) {
        //   url += `/${lastTime}`
        // }
  
        // let response = await fetch(url)
        // let { time, alarms } = await response.json()
  
        // if (alarms && time) {
        //   commit('ADD_ALARMS', alarms)
        //   lastTime = time
        // }
      }

      setTimeout(() => {
        dispatch('getAlarms')
      }, 500)
    },

    async getDeviceStates ({ commit, dispatch }) {
      let json = await debounced_getDeviceStates()

      // let url = `${host}/model/devices/state`
      // let response = await fetch(url)
      // let json = await response.json()

      if (json) {
        commit('UPDATE_DEVICE_STATES', json)
      }

      setTimeout(() => {
        dispatch('getDeviceStates')
      }, 500)
    },

    async saveDevice ({ commit }, device) {
      let response = await fetch(
        host+'/devices', 
        {method: 'PUT',headers: {'Content-Type': 'application/json;charset=utf-8'},
        body: JSON.stringify(device)
      })
      let json = await response.json()
      commit('UPDATE_DEVICE',json)
    },


    switchSensors({ commit }, sensorType) {
      commit('SET_SENSOR_TYPE', sensorType)
    },

    resetAlarm (ctx, deviceUuid) {
      let url = host + `/model/device/${deviceUuid}/read`
      fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json;charset=utf-8' }})
    }

  },

  modules: {
    
  },
})
