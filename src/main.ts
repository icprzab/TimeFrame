import './assets/main.css'
import App from './App.vue'
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { VueSpinnersPlugin } from 'vue3-spinners'
import router from './router'
import * as Icons from '@element-plus/icons-vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const firebaseConfig: object = {
  apiKey: JSON.parse(import.meta.env.VITE_SOME_KEY).apiKey,
  authDomain: JSON.parse(import.meta.env.VITE_SOME_KEY).authDomain,
  projectId: JSON.parse(import.meta.env.VITE_SOME_KEY).projectId,
  storageBucket: JSON.parse(import.meta.env.VITE_SOME_KEY).storageBucket,
  messagingSenderId: JSON.parse(import.meta.env.VITE_SOME_KEY).messagingSenderId,
  appId: JSON.parse(import.meta.env.VITE_SOME_KEY).appId
}

const firestoreSetup: object = initializeApp(firebaseConfig)
export const db: object = getFirestore(firestoreSetup)
export const auth = getAuth(firestoreSetup)
const app = createApp(App)
Object.keys(Icons).forEach((key) => {
  app.component(key, Icons[key])
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    onAuthStateChanged(auth, (user) => {
      try {
        const uid: string = user.uid
        if (uid) {
          next()
        }
      } catch (error) {
        next({
          path: '/'
        })
      }
    })
  } else next()
})

const store: object = createStore({
  state: {
    events: [],
    today: [false]
  },

  mutations: {
    ADD_EVENT: (state, event) => {
      state.events.push(event)
    },
    UPDATE_EVENT: (state, { id, title, start, end, createAt, allDay, color, memo }) => {
      let index: number = state.events.findIndex((_event) => _event.id === id)
      if (index != -1) {
        state.events[index].title = title
        state.events[index].start = start
        state.events[index].end = end
        state.events[index].createAt = createAt
        state.events[index].allDay = allDay
        state.events[index].color = color
        state.events[index].memo = memo
      } else {
        state.events.push({
          id: id,
          title: title,
          start: start,
          end: end,
          createAt: createAt,
          allDay: allDay,
          color: color,
          memo: memo
        })
      }
    },
    DELETE_EVENT: (state, { id }) => {
      let index: number = state.events.findIndex((_event) => _event.id === id)
      state.events.splice(index, 1)
    },
    CHANGE_TODAY_STATUS: (state, status) => {
      state.today[0] = status
    }
  }
})

app.component('VueDatePicker', VueDatePicker)
app.use(VueSpinnersPlugin)
app.use(router)
app.use(store)
app.mount('#app')
