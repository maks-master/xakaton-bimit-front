import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    devices: [],

    devicesEditMode:false,
    deviceToEdit:null,

    deviceEditDialog:{
      show:false,
      title:'',
      device:null
    }
  },

  getters: {
    devices: ({ devices }) => devices || []
  },

  mutations: {
    REPLACE_DEVICES: (state, devices) => {
      state.devices = devices
    },

    SET_SENSORS_EDIT_MODE: (state, isEditMode) => {
      state.devicesEditMode = isEditMode
    },

    SET_DEVICE_TO_EDIT: (state, deviceToEdit) => {
      state.deviceToEdit = deviceToEdit
    },

    SET_DEVICE_EDIT_DIALOG: (state, d) => {
      state.deviceEditDialog = d
    }

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
