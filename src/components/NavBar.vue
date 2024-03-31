<script setup >
import { useStore } from 'vuex';
import { getAuth, signOut } from "firebase/auth";

let store = useStore();
let auth = getAuth();
function addTask() {
    store.commit('CHANGE_TODAY_STATUS', true)
}
function logOut() {
    signOut(auth).then(() => {
        location.reload();
    })
}
function redirect() {
    location.reload();
}
</script>
<template>
    <div class="navbar">
        <div class="navbar_left">
            <div class="navbar_logo">
                <img src="../assets/timeframe.png" @click="redirect" />
            </div>
            <div class="navbar_logo2">
                <img src="../assets/timeframe2.png" @click="redirect" />
            </div>
            <div class="navbar_add" @click="addTask">
                <div class="navbar_add_img">
                    <img src="../assets/add.png" />
                </div>
                <div class="navbar_add_text">Add Task</div>
            </div>
        </div>
        <div class="navbar_right" @click="logOut">
            <div class="navbar_logout" @click="logOut">Log out</div>
        </div>
    </div>
</template>
<style lang="scss">
@import "../style/navbar.scss"
</style>