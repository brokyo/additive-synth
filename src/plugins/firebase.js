import Vue from 'vue'
import VueFire from 'vuefire'
import Firebase from 'firebase'

Vue.use(VueFire)

var config = {
    apiKey: "AIzaSyCnAXNBs-GYYgYVUqdeY941OkDxwct0INA",
    authDomain: "underconstructionclub1.firebaseapp.com",
    databaseURL: "https://underconstructionclub1.firebaseio.com",
    projectId: "underconstructionclub1",
    storageBucket: "",
    messagingSenderId: "555911740372"
};

let firebase = Firebase.initializeApp(config)
let db = firebase.database()

import VTooltip from 'v-tooltip'
Vue.use(VTooltip)

export { db }
