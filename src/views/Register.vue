<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from 'vue'
import { db } from '../main.ts'
import { auth } from '../main.ts'
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

let emailText = ref<string>("")
let emailAlert = ref<string>("")
let emailAlertText = ref<string>("*Email can not be empty")
let passwordText = ref<string>("")
let passwordAlert = ref<string>("")
let passwordAlertText = ref<string>("*password can not be empty")
let router = useRouter();
async function handleSubmit() {
    if (emailText.value === "") {
        emailAlertText.value = "*Email can not be empty"
        emailAlert.value.style.opacity = 1
    }
    if (passwordText.value === "") {
        passwordAlertText.value = "*password can not be empty"
        passwordAlert.value.style.opacity = 1
    }


    if (emailText.value !== "" && passwordText.value.length >= 6) {
        let { user } = await createUserWithEmailAndPassword(auth, emailText.value, passwordText.value).then(
            () => {
                passwordAlert.value.style.color = "#0bd104",
                    passwordAlert.value.style.fontWeight = 700,
                    passwordAlertText.value = "Registration complete! please go to log in page.",
                    passwordAlert.value.style.opacity = 1
            }
        ).catch(function (error) {
            if (error.code == "auth/email-already-in-use") {
                passwordAlert.value.style.opacity = 0
                passwordAlert.value.style.color = "red"
                passwordAlert.value.style.fontWeight = 400
                emailAlertText.value = "*Invalid-email"
                emailAlert.value.style.opacity = 1
            }
            if (error.code == "auth/invalid-email") {
                passwordAlert.value.style.opacity = 0
                passwordAlert.value.style.color = "red"
                passwordAlert.value.style.fontWeight = 400
                emailAlertText.value = "*Invalid-email"
                emailAlert.value.style.opacity = 1
            }
        });
        let collectionRef = doc(db, "user", user.uid, "task", "start")
        await setDoc(collectionRef, {})
    }
    if (passwordText.value.length < 6 && passwordText.value !== "") {
        passwordAlertText.value = "*Password must be at least 6 characters in length."
        passwordAlert.value.style.opacity = 1
    }
}
function cancelEmailAlert() {
    passwordAlert.value.style.opacity = 0
    passwordAlert.value.style.color = "red"
    passwordAlert.value.style.fontWeight = 400
    emailAlert.value.style.opacity = 0
}
function cancelPasswordAlert() {
    passwordAlert.value.style.opacity = 0
    passwordAlert.value.style.color = "red"
    passwordAlert.value.style.fontWeight = 400

}
function homePage() {
    passwordAlert.value.style.opacity = 0
    passwordAlert.value.style.color = "red"
    passwordAlert.value.style.fontWeight = 400
    router.push("/")
}
</script>
<template>
    <div class="register">
        <header class="register_header">
            <div class="register_logo">
                <img src="../assets/timeframe.png" @click="homePage" />
            </div>
        </header>
        <div class="register_body">
            <div class="register_body_container">
                <div class="register_topic">Register</div>
                <div class="register_text">
                    Email
                </div>
                <div class="register_input">
                    <input placeholder="text@gmail.com" v-model="emailText" @focus="cancelEmailAlert" />
                </div>
                <div class="register_alert" ref="emailAlert">
                    {{ emailAlertText }}
                </div>
                <div class="register_text">
                    Password
                </div>
                <div class="register_input">
                    <input placeholder="text" v-model="passwordText" @focus="cancelPasswordAlert" />
                </div>
                <div class="register_alert" ref="passwordAlert"> {{ passwordAlertText }}</div>
                <button @click="handleSubmit">Submit</button>
                <router-link to="/login" class="register_change">Go to log in</router-link>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
@import "../style/register.scss"
</style>