<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from 'vue'
import { VueSpinnerIos } from 'vue3-spinners';

onMounted(() => {
    if (document.body.offsetWidth < 1000) {
        router.push("/login")
    }
})
let router = useRouter();

function scrollDownPage() {
    window.scrollTo({
        top: document.body.offsetHeight,
        behavior: 'smooth'
    });
}
function backToTOP() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function loginPage() {
    router.push("/login")
}
</script>
<template>
    <div class="home">
        <div class="home_header">
            <div class="home_logo">
                <img src="../assets/timeframe.png" />
            </div>
            <button @click="loginPage">Log in</button>
        </div>
        <div class="home_top_scroll">
            <h1 @click="scrollDownPage">
                SCROLL
                <svg version="1.1" id="svg-arrow-down" xmlns="http://www.w3.org/2000/svg" @click="scrollDownPage"
                    xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22 35"
                    style="enable-background:new 0 0 22 35;" xml:space="preserve">
                    <polygon class="arrow" style="fill:#000000;" points="20.58,11.584 12.004,20.158 12.004,0 9.996,0 9.996,20.158 1.42,11.584 0,13.004 11,24
					22,13.004 "></polygon>
                </svg>
            </h1>
        </div>
        <div class="home_background">
            <div class="home_title">
                <div class="home_title_top">Make your life easier!</div>
                <div class="home_title_bottom">Clearly record your daily schedule.</div>
            </div>
            <img src="../assets/pencil.png" />
            <div class="home_title_room">
                <img src="../assets/room.jpg" />
            </div>
        </div>
        <div class="home_body">
            <div class="home_content_container">
                <div class="home_content">
                    <div class="home_content_text">1. Classify different tasks by color.</div>
                    <video class="home_content_video" preload="metadata" src=" ../assets/color.mp4" loop autoplay muted>
                    </video>
                </div>
            </div>
            <div class="home_content_container">
                <div class="home_content">
                    <div class="home_content_text">2. Click and select the period then release the mouse to add a task.
                    </div>
                    <video class="home_content_video" preload="metadata" src=" ../assets/multi_date.mp4" loop autoplay
                        muted>
                    </video>
                </div>
            </div>
            <div class="home_content_container">
                <div class="home_content">
                    <div class="home_content_text">
                        3. Click on the date and hold down the mouse until the window popup to add a specific date
                        task.
                    </div>
                    <video class="home_content_video" preload="metadata" src=" ../assets/single_date.mp4" loop autoplay
                        muted>
                    </video>
                </div>
            </div>
            <div class="home_bottom_scroll">
                <h1 @click="backToTOP">
                    <svg version="1.1" id="svg-arrow-down" xmlns="http://www.w3.org/2000/svg" @click="backToTOP"
                        xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22 35"
                        style="enable-background:new 0 0 22 35;" xml:space="preserve">
                        <polygon class="arrow" style="fill:#000000;" points="20.58,11.584 12.004,20.158 12.004,0 9.996,0 9.996,20.158 1.42,11.584 0,13.004 11,24
					22,13.004 "></polygon>
                    </svg>
                    BACK TO TOP
                </h1>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
@import "../style/home.scss"
</style>