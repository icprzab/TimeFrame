<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

let emailText = ref<string>("")
let emailAlert = ref<string>("")
let emailAlertText = ref<string>("*Email can not be empty")
let passwordText = ref<string>("")
let passwordAlert = ref<string>("")
let passwordAlertText = ref<string>("*password can not be empty")

let router = useRouter();

function handleSubmit() {
    if (emailText.value === "") {
        emailAlertText.value = "*Email can not be empty"
        emailAlert.value.style.opacity = 1
    }
    if (passwordText.value === "") {
        passwordAlertText.value = "*password can not be empty"
        passwordAlert.value.style.opacity = 1
    }
    if ((emailText.value !== "") && (passwordText.value !== "")) {
        let auth = getAuth();
        signInWithEmailAndPassword(auth, emailText.value, passwordText.value)
            .then((userCredential) => {
                let user = userCredential.user
                if (user) {
                    router.push("/main_page")
                }

            })
            .catch(function (error) {
                if (error.code == "auth/invalid-email") {
                    emailAlertText.value = "*Invalid Email"
                    emailAlert.value.style.opacity = 1
                }
                if (error.code == "auth/wrong-password") {
                    passwordAlertText.value = "*Invalid Password"
                    passwordAlert.value.style.opacity = 1
                }
                if (error.code == "auth/invalid-credential") {
                    passwordAlertText.value = "*Invalid Password"
                    passwordAlert.value.style.opacity = 1
                }
            });
    }

}
function cancelEmailAlert() {
    emailAlert.value.style.opacity = 0
}
function cancelPasswordAlert() {
    passwordAlert.value.style.opacity = 0
}
function homePage() {
    router.push("/")
}
</script>
<template>
    <div class="login">
        <header class="login_header">
            <div class="login_logo">
                <img src="../assets/timeframe.png" @click="homePage" />
            </div>
        </header>
        <div class="login_body">
            <div class="login_body_container">
                <div class="login_topic"> Log in</div>
                <div class="login_text">
                    Email
                </div>
                <div class="login_input">
                    <input placeholder="test@gmail.com" v-model="emailText" @focus="cancelEmailAlert" />
                </div>
                <div class="login_alert" ref="emailAlert">
                    {{ emailAlertText }}
                </div>
                <div class="login_text">
                    Password
                </div>
                <div class="login_input">
                    <input placeholder="testtest" v-model="passwordText" @focus="cancelPasswordAlert" />
                </div>
                <div class="login_alert" ref="passwordAlert"> {{ passwordAlertText }}</div>
                <button @click="handleSubmit">Submit</button>
                <router-link to="/register" class="login_change">not registered yet? register here</router-link>

            </div>
        </div>
    </div>
</template>
<style lang="scss">
@import "../style/login.scss"
</style>