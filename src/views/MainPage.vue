<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import NavBar from '../components/NavBar.vue'
import { h, render } from 'vue'
import { ref, onMounted, onUpdated, watch } from 'vue'
import { useStore } from 'vuex';
import { db } from '../main.ts'
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { VueSpinnerIos } from 'vue3-spinners';
let store = useStore();
let showEvents = ref<boolean>(false)
let showDetail = ref<boolean>(false)
let showDelete = ref<boolean>(false)
let showEdit = ref<boolean>(false)
let infoDate = ref<object>(false)
let clickDate = ref<string>("")
let clickWeek = ref<string>("")
let tasks = ref<object>(false)
let singleTask = ref<object>(false)
let singleTaskColor = ref<string>(false)
let showColor = ref<boolean>(false)
let countClickColor = ref<number>(0)
let clickButton = ref<string>(false)
let clickText = ref<string>("click")
let blueColor = ref<string>(false)
let greenColor = ref<string>(false)
let orangeColor = ref<string>(false)
let redColor = ref<string>(false)
let purpleColor = ref<string>(false)
let blackColor = ref<string>(false)
let colorContainer = ref<object>(false)
let calendarPage = ref<string>(null)
let isUpdate = ref<boolean>(false)
let isDelete = ref<boolean>(false)
let addPage = ref<boolean>(false)
let titleInput = ref<string>(null)
let clickSave = ref<boolean>(false)
let isLongPress = ref<boolean>(false)
let mouseMoved = ref<boolean>(false)
let isMouseDown = ref<boolean>(false)
let completeSave = ref<boolean>(false)
let myTextarea = ref<string>(null)
let isloading = ref<boolean>(false)
let eventsloading = ref<boolean>(false)
let detailloading = ref<boolean>(false)
let editloading = ref<boolean>(false)
let userUID = ref<string>(false)
let dateStart = ref<object>(null);
let dateStartString = ref<string>(null);
let weekdayStart = ref<string>(null);
let dateEnd = ref<object>(null);
let dateEndString = ref<string>(null);
let weekdayEnd = ref<string>(null);
let EVENTS: object = store.state.events;
let weekdays: Array<string> = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
]
let startX: number = 0;
let startY: number = 0;
let pressTimer = null
let titleFocus: number = 0
let unsubscribe = null;

onMounted(() => {
    onAuthStateChanged(getAuth(), (user) => {
        if (unsubscribe !== null) {
            location.reload();
        }
        userUID.value = user.uid
        let task_all: object = collection(db, 'user', user.uid, 'task')
        isloading.value = true
        unsubscribe = onSnapshot(task_all, (querySnapshot) => {
            if (querySnapshot._snapshot.docChanges.length > 0) {
                querySnapshot.forEach((doc) => {
                    let startDate: object = new Date(doc.data().start)
                    let endDate: object = new Date(doc.data().end)
                    interface task {
                        id: string
                        title: string,
                        start: object,
                        end: object,
                        createAt: object,
                        allDay: boolean,
                        color: string,
                        memo: string
                    }
                    let task: task = { id: doc.data().id, title: doc.data().title, start: startDate, end: endDate, createAt: doc.data().createAt, allDay: true, color: doc.data().color, memo: doc.data().memo }
                    store.commit('UPDATE_EVENT', task)
                })
            } else {
                isloading.value = false
            }
        })
    })
})

watch(store.state.events, () => {
    isloading.value = false
    if (isUpdate.value) {
        detailloading.value = false
        eventDetail(singleTask.value.id)
        isUpdate.value = false
        completeSave.value = true
    }
    if (isDelete.value) {
        backToEvents()
        isDelete.value = false
    }
});
watch(store.state.today, () => {
    if (store.state.today[0]) {
        store.commit('CHANGE_TODAY_STATUS', false)
        let date = new Date()
        date.setUTCHours(0, 0, 0, 0);
        let dateString = date.toUTCString()
        AddNewPage({ start: dateString }, 1)
    }
});


onUpdated(() => {
    if (showEdit.value) { myTextarea.value.scrollTop = myTextarea.value.scrollHeight; }
    let elements = document.getElementsByClassName("dp__input_wrap");
    let editMask = document.getElementsByClassName("edit_mask");
    let eventsMask = document.getElementsByClassName("events_mask");
    let detailMask = document.getElementsByClassName("detail_mask");
    if (elements.length !== 0) {
        let myDiv: object = h('div', { class: "start_space" }, '');
        render(myDiv, elements[0]);
    }
    if (editMask.length !== 0 || eventsMask.length || detailMask.length) {
        calendarPage.value.style.zIndex = "16";
    } else {
        calendarPage.value.style.zIndex = "10";
    }
    if (blueColor.value || greenColor.value || orangeColor.value || redColor.value || purpleColor.value || blackColor.value) {
        if (singleTaskColor.value == "#052196") {
            blueColor.value.focus()
        }
        if (singleTaskColor.value == "#378006") {
            greenColor.value.focus()
        }
        if (singleTaskColor.value == "#fa9200") {
            orangeColor.value.focus()
        }
        if (singleTaskColor.value == "#d10202") {
            redColor.value.focus()
        }
        if (singleTaskColor.value == "#ba02ba") {
            purpleColor.value.focus()
        }
        if (singleTaskColor.value == "#050505") {
            blackColor.value.focus()
        }
    }
    if (addPage.value && !showDetail.value) {
        if (titleFocus == 0) {
            titleFocus++
            titleInput.value.focus()
        }
    }

})

function startPress(event) {
    mouseMoved.value = false
    isMouseDown.value = true;
    startX = event.clientX;
    startY = event.clientY;

    isLongPress.value = false
    showEdit.value = false
    let targetElement = event.target;
    targetElement.getElementsByClassName("fc-daygrid-day-number")

    let inputDate: object = new Date(targetElement.getElementsByClassName("fc-daygrid-day-number")[0].ariaLabel);
    let formattedDate: string = inputDate.toString();
    let ClickDayInfo: object = { start: formattedDate }
    if (inputDate) {
        pressTimer = setTimeout(() => {
            if (!mouseMoved.value) {
                isLongPress.value = true
                AddNewPage(ClickDayInfo, 1)
            }
        }, 500);
    }
}
function endPress() {
    isMouseDown.value = false;
    clearTimeout(pressTimer);
}

function handleMouseMove(event) {
    if (isMouseDown.value) {
        let mouseX: number = event.clientX;
        let mouseY: number = event.clientY;
        let distance: number = Math.sqrt((mouseX - startX) ** 2 + (mouseY - startY) ** 2);
        if (distance > 3) {
            mouseMoved.value = true
        }
    }
};

function AddNewPage(selectInfo, dayCount) {
    let EventID: number = (new Date()).getTime()
    addPage.value = true
    if (dayCount > 1) {
        interface task {
            id: string
            title: string,
            start: string,
            end: string,
            createAt: object,
            allDay: boolean,
            color: string,
            memo: string
        }
        let task: task = { id: EventID.toString(), title: "", start: selectInfo.start.toString(), end: selectInfo.end.toString(), allDay: true, createAt: new Date(), color: "#052196", memo: "" }
        store.commit('ADD_EVENT', task)

        singleTask.value = task
        singleTaskColor.value = task.color
        dateStart.value = new Date(task.start)
        let oneDay: number = 24 * 60 * 60 * 1000;
        let EventEnd: object = new Date(new Date(task.end) - oneDay);
        dateEnd.value = EventEnd
    }

    if (dayCount == 1) {
        interface task {
            id: string
            title: string,
            start: string,
            end: string,
            createAt: object,
            allDay: boolean,
            color: string,
            memo: string
        }
        let task: task = { "id": EventID.toString(), "title": "", "start": selectInfo.start.toString(), "end": selectInfo.start.toString(), "allDay": true, createAt: new Date(), "color": "#052196", "memo": "" }
        store.commit('ADD_EVENT', task)

        singleTask.value = task
        singleTaskColor.value = task.color
        dateStart.value = selectInfo.start
        dateEnd.value = selectInfo.start
    }
    showDelete.value = false
    showDetail.value = false
    showEdit.value = true
    clickText.value = "click"
}

function closeAlert() {
    clickSave.value = false
}

function eventDetail(id: string) {
    detailloading.value = true
    eventsloading.value = false
    let getEventDetail: object = doc(db, "user", userUID.value, "task", id)
    getDoc(getEventDetail)
        .then(response => {
            if (response.data() !== undefined) {
                interface task {
                    id: string
                    title: string,
                    start: string,
                    end: string,
                    color: string,
                    memo: string
                }
                let task: task = { id: response.data().id, title: response.data().title, start: response.data().start, end: response.data().end, color: response.data().color, memo: response.data().memo }
                showEdit.value = false;
                showEvents.value = false
                showColor.value = false
                showDetail.value = true
                singleTask.value = task
                dateStart.value = new Date(task.start)
                let oneDay: number = 24 * 60 * 60 * 1000;
                let EventEnd: object = new Date(new Date(task.end) - oneDay);
                dateEnd.value = EventEnd

                let YearStart: number = dateStart.value.getFullYear();
                let MonStart: string = String(dateStart.value.getMonth() + 1);
                let dayStart: string = String(dateStart.value.getDate());
                let dayOfWeekStart: string = String(dateStart.value.getDay())
                weekdayStart.value = weekdays[dayOfWeekStart]
                dateStartString.value = YearStart + "/" + MonStart.padStart(2, "0") + "/" + dayStart.padStart(2, "0")

                let YearEnd: number = dateEnd.value.getFullYear();
                let MonEnd: string = String(dateEnd.value.getMonth() + 1);
                let dayEnd: string = String(dateEnd.value.getDate());
                let dayOfWeekEnd: string = String(dateEnd.value.getDay())
                weekdayEnd.value = weekdays[dayOfWeekEnd]
                dateEndString.value = YearEnd + "/" + MonEnd.padStart(2, "0") + "/" + dayEnd.padStart(2, "0")
                editloading.value = false
                detailloading.value = false
            }
        })
}

function editEvent() {
    clickText.value = "click";
    singleTaskColor.value = singleTask.value.color
    showDelete.value = false
    showDetail.value = false
    showColor.value = false
    editloading.value = false
    detailloading.value = false
    eventsloading.value = false
    showEdit.value = true
}

function handleOutsideClick() {
    if (colorContainer.value) {
        if (countClickColor.value > 0) {
            showColor.value = false
            colorContainer.value = false
            clickButton.value.style.width = "48px";
            clickText.value = "click";
            countClickColor.value = 0
        }
        if (countClickColor.value == 0 && showColor.value) {
            countClickColor.value++
        }
    }
}

function changeColor() {
    clickButton.value.style.width = "25px";
    clickText.value = "";
    showColor.value = true
}


function formatStart(date) {
    let Year: number = date.getFullYear();
    let Mon: string = String(date.getMonth() + 1);
    let day: string = String(date.getDate());
    let dayOfWeek: string = String(date.getDay())
    if (date > new Date(dateEnd.value)) {
        dateEnd.value = String(date)
        dateStart.value = String(date)
    } else {
        dateStart.value = String(date)
    }
    return `${Year}-${Mon.padStart(2, "0")}-${day.padStart(2, "0")}  ${weekdays[dayOfWeek].substring(0, 3)} `;
}

function formatEnd(date) {
    let Year = date.getFullYear();
    let Mon = String(date.getMonth() + 1);
    let day = String(date.getDate());
    let dayOfWeek = String(date.getDay())
    if (date < new Date(dateStart.value)) {
        dateStart.value = String(date)
        dateEnd.value = String(date)
    } else {
        dateEnd.value = String(date)
    }
    return `${Year}-${Mon.padStart(2, "0")}-${day.padStart(2, "0")}  ${weekdays[dayOfWeek].substring(0, 3)} `;
}

function openCalendar() {
    showColor.value = false
    colorContainer.value = false
    countClickColor.value = 0
    clickButton.value.style.width = "48px";
    clickText.value = "click";
    let elementLine = document.getElementsByClassName("edit_line");
    elementLine[1].style.setProperty('background-color', "transparent", 'important')
}
function closedCalendar() {
    let elementLine = document.getElementsByClassName("edit_line");
    elementLine[1].style.setProperty('background-color', '#e3e3e3', 'important')
}

function updateEvent() {
    clickSave.value = true
    if (singleTask.value.title !== "") {
        editloading.value = true
        let correctEndDay: number = new Date(dateEnd.value).setDate(new Date(dateEnd.value).getDate() + 1);
        let updateEventInfo: object = doc(db, "user", userUID.value, "task", singleTask.value.id)
        getDoc(updateEventInfo)
            .then(response => {
                if (response.data() !== undefined) {
                    updateDoc(updateEventInfo, { id: singleTask.value.id, title: singleTask.value.title, start: new Date(dateStart.value).toString(), end: new Date(correctEndDay).toString(), createAt: new Date(), allDay: true, color: singleTaskColor.value, memo: singleTask.value.memo })
                    infoDate.value = new Date(dateStart.value)
                    let year: number = new Date(dateStart.value).getFullYear();
                    let month: number = new Date(dateStart.value).getMonth() + 1;
                    let day: number = new Date(dateStart.value).getDate();
                    clickDate.value = year + "/" + month.toString().padStart(2, "0") + "/" + day.toString().padStart(2, "0")
                    clickWeek.value = new Date(dateStart.value).toString().slice(0, 3)
                    isUpdate.value = true
                } else {
                    let correctEndDay: number = new Date(dateEnd.value).setDate(new Date(dateEnd.value).getDate() + 1);
                    store.commit('UPDATE_EVENT', { id: singleTask.value.id, title: singleTask.value.title, start: new Date(dateStart.value).toString(), end: new Date(correctEndDay).toString(), createAt: new Date(), allDay: true, color: singleTaskColor.value, memo: singleTask.value.memo })
                    setDoc(updateEventInfo, { id: singleTask.value.id, title: singleTask.value.title, start: new Date(dateStart.value).toString(), end: new Date(correctEndDay).toString(), allDay: true, createAt: new Date(), color: singleTaskColor.value, memo: singleTask.value.memo })
                    infoDate.value = new Date(dateStart.value)
                    let year: number = new Date(dateStart.value).getFullYear();
                    let month: number = new Date(dateStart.value).getMonth() + 1;
                    let day: number = new Date(dateStart.value).getDate();
                    clickDate.value = year + "/" + month.toString().padStart(2, "0") + "/" + day.toString().padStart(2, "0")
                    clickWeek.value = new Date(dateStart.value).toString().slice(0, 3)
                    isUpdate.value = true
                }
            })
    }
}

function backToEvents() {
    eventsloading.value = true
    let getEventInfo: object = collection(db, "user", userUID.value, "task")
    getDocs(getEventInfo)
        .then((response) => {
            let postInfo = response.docs.map((doc) => ({
                ...doc.data(),
            }));
            let eventFilter = postInfo.filter((evt) => {
                let eventStart: object = new Date(evt.start);
                let eventEnd: object = new Date(evt.end);
                let theDate: object = infoDate.value;
                return ((eventStart <= theDate) && (eventEnd >= theDate))
            })
            let pickEvent: object = []
            eventFilter.forEach(item => {
                pickEvent.push({ id: item.id, title: item.title, start: new Date(item.start), end: new Date(item.end), color: item.color, createAt: item.createAt, memo: item.memo })
            })
            pickEvent.sort((a, b) => a.createAt - b.createAt);
            tasks.value = pickEvent
            tasks.value = pickEvent
            showDelete.value = false
            showEdit.value = false
            showDetail.value = false
            showEvents.value = true
            eventsloading.value = false
        })
}

function closePopup() {
    if (addPage.value && !showDetail.value && !completeSave.value) {
        if (!showDelete.value) {
            showDelete.value = true
        }
    } else {
        if (!showDelete.value) {
            dateStart.value = null
            dateEnd.value = null
            showEdit.value = false
            showDetail.value = false
            showEvents.value = false
            singleTask.value = false
            tasks.value = false
            showDelete.value = false
            clickSave.value = false
            addPage.value = false
            showColor.value = false
            titleFocus = 0
            completeSave.value = false
            eventsloading.value = false
            detailloading.value = false
            editloading.value = false
            countClickColor.value = 0
        }
    }
};

function closeDelete() {
    showDelete.value = false
}

function deletePage() {
    showDelete.value = true
}
function deleteEvent() {
    showDelete.value = false
    editloading.value = true
    let deleteRef: object = doc(db, "user", userUID.value, "task", singleTask.value.id);
    deleteDoc(deleteRef).then(() => {
        store.commit('DELETE_EVENT', { id: singleTask.value.id })
        if (!addPage.value || (addPage.value && clickSave.value)) {
            isDelete.value = true
        }
        addPage.value = false
        titleFocus = 0
        closePopup()
    })
}


let calendarOptions: object = ref({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev',
        center: 'title',
        right: 'next'
    },
    titleFormat: (info) => `${info.date.year} / ${info.date.month + 1}`,
    selectable: true,
    firstDay: 1,
    fixedWeekCount: false,
    dayMaxEvents: 3,
    dateClick: (info) => {
        if (!isLongPress.value) {
            eventsloading.value = true
            showEvents.value = true;
            let originalString: string = info.dateStr;
            let newString: string = originalString.replace(/-/g, "/");
            let jsonString: string = new Date(info.date).toString()
            let jsonSlice: string = jsonString.slice(0, 3)
            clickDate.value = newString
            clickWeek.value = jsonSlice
            let getEventsInfo: object = collection(db, "user", userUID.value, "task")
            getDocs(getEventsInfo)
                .then((response) => {
                    let postInfo = response.docs.map((doc) => ({
                        ...doc.data(),
                    }));
                    infoDate.value = new Date(info.dateStr)
                    let eventFilter = postInfo.filter((evt) => {
                        let eventStart: object = new Date(evt.start);
                        let eventEnd: object = new Date(evt.end);
                        let theDate: object = new Date(info.dateStr);
                        return ((eventStart <= theDate) && (eventEnd >= theDate))
                    })
                    let pickEvent = []
                    eventFilter.forEach(item => {
                        pickEvent.push({ id: item.id, title: item.title, start: new Date(item.start), end: new Date(item.end), color: item.color, createAt: item.createAt })
                    })
                    pickEvent.sort((a, b) => a.createAt - b.createAt);
                    tasks.value = pickEvent
                    eventsloading.value = false
                })
        }
    },
    select: (selectInfo) => {
        let oneDay: number = 24 * 60 * 60 * 1000;
        let startDay: number = selectInfo.start;
        let endDay: number = selectInfo.end - oneDay;
        let count: number = Math.round(Math.abs((startDay - endDay) / oneDay));
        let dayCount: number = (count + 1);
        if (dayCount > 1) {
            AddNewPage(selectInfo, dayCount)
        }
    },
    moreLinkClick: function (info) {
        let moreLink = dayCell.querySelector('.fc-more-link');
        if (moreLink) {
            moreLink.addEventListener('click', function (event) {
                event.preventDefault();
            });
        }
    },
    editable: true,
    events: EVENTS,
    eventOrder: 'createAt',
})


</script>
<template>
    <div class="vuespinner_mask" v-if="isloading">
        <VueSpinnerIos size="55" color="#474747" class="vueSpinner" />
    </div>
    <NavBar />
    <div class="calendar" ref="calendarPage" @click="handleOutsideClick">
        <div class="events" v-if="showEvents">
            <div class="events_mask" @click="closePopup"></div>
            <div class="events_container">
                <div class="events_header">
                    <div class="events_header_date">
                        <div>{{ clickDate }}</div>
                        <div class="events_header_week">{{ clickWeek }}</div>
                    </div>
                    <div class="events_header_close" @click="closePopup">
                        <Close />
                    </div>
                </div>
                <div class="events_body">
                    <div class="vuespinner_inside_mask" v-if="eventsloading">
                        <VueSpinnerIos size="40" color="#474747" class="vueSpinner_inside" />
                    </div>
                    <div class="events_body_container" v-for="(task, index) in tasks" :key="index" v-if="tasks.length != 0"
                        @click="eventDetail(task.id)">
                        <div class="events_body_title" :style="{ backgroundColor: task.color }">{{ task.title }}</div>
                    </div>
                    <div class="events_body_empty" v-else>
                        <div>No task</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="detail" v-if="showDetail">
            <div class="detail_mask" @click="closePopup"></div>
            <div class="detail_container">
                <div class="vuespinner_inside_mask" v-if="detailloading">
                    <VueSpinnerIos size="40" color="#474747" class="vueSpinner_inside" />
                </div>
                <div class="detail_header" :style="{ backgroundColor: singleTask.color }">
                    <div class="detail_header_date">
                        <div class="detail_header_back" @click="backToEvents" v-if="!addPage && !completeSave">
                            <Back />
                        </div>
                        <div class="detail_header_title">{{ singleTask.title }}</div>
                    </div>
                    <div class="detail_header_right">
                        <div class="detail_header_edit" @click="editEvent">
                            <img src="../assets/pen.png" />
                        </div>
                        <div class="detail_header_close" @click="closePopup">
                            <Close />
                        </div>
                    </div>
                </div>
                <div class="detail_body_container">
                    <div class="detail_body">
                        <div class="detail_top">
                            <div class="detail_top_img">
                                <img src="../assets/clock.png" />
                            </div>
                            <div class="detail_top_text">
                                <div>
                                    <div class="detail_top_weekday">{{ weekdayStart }}</div>
                                    <div class="detail_top_day">{{ dateStartString }}</div>
                                </div>
                                <div class="detail_top_to">
                                    <img src="../assets/double_right.png" />
                                </div>
                                <div>
                                    <div class="detail_top_weekday">{{ weekdayEnd }}</div>
                                    <div class="detail_top_day">{{ dateEndString }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="detail_line_container">
                            <div class="detail_line"></div>
                        </div>
                        <div class="detail_bottom">
                            <div class="detail_bottom_img">
                                <img src="../assets/notes.png" />
                            </div>
                            <div class="detail_bottom_text" v-if="singleTask.memo">
                                {{ singleTask.memo }}
                            </div>
                            <div class="detail_bottom_text" style="color: #adadad;font-weight: 400;" v-else>
                                No memo
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="edit" v-if="showEdit">
            <div class="edit_mask" @click="closePopup"></div>
            <form class="edit_container">
                <div class="vuespinner_inside_mask" v-if="editloading">
                    <VueSpinnerIos size="40" color="#474747" class="vueSpinner_inside" />
                </div>
                <div class="edit_delete" v-if="showDelete">
                    <div class="edit_delete_mask"></div>
                    <div class="edit_delete_container">
                        <div class="edit_delete_body">
                            <div class="edit_delete_top">
                                <p>Are you sure to delete this task?</p>
                                <div @click="closeDelete">
                                    <Close />
                                </div>
                            </div>
                            <div class="edit_delete_button">
                                <button @click="closeDelete">
                                    Cancel
                                </button>
                                <button @click.prevent="deleteEvent"
                                    style="borderWidth:0 ; backgroundColor:red ;color:white;box-shadow: 1px 1px 2px #828282;">
                                    Delete
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
                <div class="edit_header">
                    <div class="edit_header_left" v-if="!addPage || (addPage && completeSave)">
                        <Back class="edit_header_back" @click="eventDetail(singleTask.id)" />
                        <div v-if="!singleTask.title && clickSave">*Title field is required.</div>
                    </div>
                    <div class="edit_header_left" v-else>
                        <Close class="edit_header_hidden" />
                        <div v-if="!singleTask.title && clickSave">*Title field is required.</div>
                    </div>
                    <div class="edit_header_save" :style="{ color: singleTaskColor }" @click="updateEvent">
                        save
                    </div>
                </div>
                <div class="edit_body">
                    <input v-model="singleTask.title" class="edit_input" placeholder="Click to Add title"
                        @focus="closeAlert" ref="titleInput" maxlength="14" />
                    <div class="edit_color">
                        <div class="edit_color_img">
                            <img src="../assets/palette.png" />
                        </div>
                        <div class="edit_color_text">Event Color</div>
                        <div class="edit_color_button" @click="changeColor" ref="clickButton">
                            {{ clickText }}
                        </div>
                    </div>
                    <div class="edit_color_container" v-if="showColor" ref="colorContainer" @click.stop>
                        <input type="radio" style="backgroundColor:#052196" class="edit_color_selected blue" id="blue"
                            name="blue" value="#052196" v-model="singleTaskColor" ref="blueColor" />
                        <input style="backgroundColor:#378006" type="radio" id="green" name="green" value="#378006"
                            v-model="singleTaskColor" ref="greenColor" class="edit_color_selected green" />
                        <input type="radio" style="backgroundColor:#fa9200" class="edit_color_selected orange" id="orange"
                            name="orange" value="#fa9200" v-model="singleTaskColor" ref="orangeColor" />
                        <input type="radio" style="backgroundColor:#d10202" class="edit_color_selected red" id="red"
                            name="red" value="#d10202" v-model="singleTaskColor" ref="redColor" />
                        <input type="radio" style="backgroundColor:#ba02ba" class="edit_color_selected purple" id="purple"
                            name="purple" value="#ba02ba" v-model="singleTaskColor" ref="purpleColor" />
                        <input type="radio" style="backgroundColor:#050505" class="edit_color_selected black" id="black"
                            name="black" value="#050505" v-model="singleTaskColor" ref="blackColor" />
                    </div>
                    <div class="edit_line_container">
                        <div class="edit_line"></div>
                    </div>
                    <div class="edit_date">
                        <div class="edit_start_container">
                            <div class="edit_start">
                                <div class="edit_start_left">
                                    <div class="edit_start_img">
                                        <img src="../assets/clock.png" />
                                    </div>
                                    <div class="edit_start_title">Start</div>
                                </div>
                                <VueDatePicker v-model="dateStart" :format="formatStart" @open="openCalendar"
                                    @closed="closedCalendar">
                                </VueDatePicker>
                            </div>
                        </div>
                        <div class="edit_end_container">
                            <div class="edit_end">
                                <div class="edit_end_left">
                                    <div class="edit_end_img">
                                        <img src="../assets/calendar.png" />
                                    </div>
                                    <div class="edit_end_title">End</div>
                                </div>
                                <VueDatePicker v-model="dateEnd" :format="formatEnd" @open="openCalendar"
                                    @closed="closedCalendar">
                                </VueDatePicker>
                            </div>
                        </div>
                    </div>
                    <div class="edit_line_container">
                        <div class="edit_line"></div>
                    </div>
                    <div class="edit_memo">
                        <div class="edit_memo_icon">
                            <img src="../assets/notes.png" />
                        </div>
                        <div class="edit_memo_text">Memo</div>
                    </div>
                    <textarea class="edit_memo_textarea" v-model="singleTask.memo" placeholder="Click to Add memo"
                        ref="myTextarea"></textarea>
                    <div class="edit_delete_icon">
                        <div class="edit_delete_img" @click="deletePage">
                            <img src="../assets/delete.png" />
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <FullCalendar class="fullcalendar" :options="calendarOptions" @mousedown="startPress" @mouseup="endPress"
            @mouseleave="endPress" @mousemove="handleMouseMove" />
    </div>
</template>

<style  lang="scss">
@import "../style/mainpage.scss";

.dp__input_focus {
    background-color: v-bind(singleTaskColor) !important;
}

.edit_color_button {
    background-color: v-bind(singleTaskColor) !important;
}

.dp__theme_light {
    --dp-primary-color: v-bind(singleTaskColor) !important;
}

.memo_textarea:focus {
    outline-color: v-bind(singleTaskColor) !important;
    border-color: v-bind(singleTaskColor) !important;
    border-width: 2.5px !important;
}

.edit_input:focus {
    outline-color: v-bind(singleTaskColor) !important;
    border-color: v-bind(singleTaskColor) !important;
    border-width: 0 0 2.5px 0 !important;
}
</style>