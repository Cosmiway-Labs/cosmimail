/* ==========================================================
   COSMIMAIL V2
========================================================== */

/* ==========================================================
   CONFIG
========================================================== */

const API = "";

/* ==========================================================
   STATE
========================================================== */

const state = {

    currentLabel: "INBOX",

    nextPageToken: null,

    loading: false,

    selectedEmail: null,

    labels: [],

    emails: []

};

/* ==========================================================
   ELEMENTS
========================================================== */

const sidebar = document.getElementById("sidebar-navigation");

const mailList = document.getElementById("mail-list");

const reader = document.getElementById("reader");

const readerEmpty = document.getElementById("reader-empty");

const loading = document.getElementById("loading-overlay");

const folderTitle = document.getElementById("folder-title");

const mailCount = document.getElementById("mail-count");

const emailSubject = document.getElementById("email-subject");

const emailFrom = document.getElementById("email-from");

const emailTo = document.getElementById("email-to");

const emailDate = document.getElementById("email-date");

const emailBody = document.getElementById("email-body");

/* ==========================================================
   API
========================================================== */

async function api(url, options = {}){

    const response = await fetch(

        API + url,

        {
            credentials:"include",

            ...options
        }

    );

    if(!response.ok){

        throw new Error(

            "Request failed"

        );

    }

    return response.json();

}

/* ==========================================================
   LOADING
========================================================== */

function showLoading(){

    loading.hidden = false;

}

function hideLoading(){

    loading.hidden = true;

}

/* ==========================================================
   INIT
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    init

);

async function init(){

    try{

        showLoading();

        await loadProfile();

        await loadLabels();

        await loadFolder("INBOX");

    }

    catch(error){

        console.error(error);

    }

    finally{

        hideLoading();

    }

}

/* ==========================================================
   PROFILE
========================================================== */

async function loadProfile(){

    const user = await api("/api/me");

    document.getElementById(

        "username"

    ).textContent =

        user.name || "User";

    document.getElementById(

        "useremail"

    ).textContent =

        user.email || "";

    document.getElementById(

        "avatar"

    ).textContent =

        (user.name || "U")

        .trim()

        .charAt(0)

        .toUpperCase();

}

/* ==========================================================
   LABELS
========================================================== */

async function loadLabels(){

    state.labels = await api(

        "/api/gmail/labels"

    );

    renderSidebar();

}

/* ==========================================================
   SIDEBAR
========================================================== */

function renderSidebar(){

    const categories = document.getElementById(

        "categories-group"

    );

    const labels = document.getElementById(

        "labels-group"

    );

    categories.innerHTML =

        "<h2>CATEGORIES</h2>";

    labels.innerHTML =

        "<h2>LABELS</h2>";

    const CATEGORY_NAMES = {

        CATEGORY_PERSONAL:

            "Primary",

        CATEGORY_SOCIAL:

            "Social",

        CATEGORY_PROMOTIONS:

            "Promotions",

        CATEGORY_UPDATES:

            "Updates",

        CATEGORY_FORUMS:

            "Forums"

    };

    state.labels.forEach(label=>{

        if(

            label.id==="CHAT" ||

            label.id==="YELLOW_STAR"

        ){

            return;

        }

        if(

            CATEGORY_NAMES[label.id]

        ){

            categories.appendChild(

                createNavButton(

                    CATEGORY_NAMES[label.id],

                    label.id

                )

            );

            return;

        }

        if(

            label.type==="user"

        ){

            labels.appendChild(

                createNavButton(

                    label.name,

                    label.id

                )

            );

        }

    });

}

/* ==========================================================
   NAV BUTTON
========================================================== */

function createNavButton(

    text,

    labelId

){

    const button =

        document.createElement(

            "button"

        );

    button.className =

        "nav-button";

    button.dataset.label =

        labelId;

    button.innerHTML = `

        <svg viewBox="0 0 24 24">

            <path d="M5 12h14"/>

        </svg>

        <span>${text}</span>

    `;

    button.onclick = ()=>{

        document

            .querySelectorAll(

                ".nav-button"

            )

            .forEach(

                b=>b.classList.remove(

                    "active"

                )

            );

        button.classList.add(

            "active"

        );

        loadFolder(

            labelId

        );

    };

    return button;

}

/* ==========================================================
   LOAD FOLDER
========================================================== */

async function loadFolder(

    label,

    append = false

){

    if(state.loading) return;

    state.loading = true;

    try{

        if(!append){

            state.currentLabel = label;

            state.nextPageToken = null;

            state.emails = [];

            mailList.innerHTML = "";

        }

        showLoading();

        let url =

            `/api/gmail/messages?label=${encodeURIComponent(label)}`;

        if(append && state.nextPageToken){

            url +=

                `&pageToken=${encodeURIComponent(state.nextPageToken)}`;

        }

        const result = await api(url);

        state.nextPageToken =

            result.nextPageToken || null;

        state.emails.push(

            ...result.emails

        );

        renderInbox(

            append

        );

        folderTitle.textContent =

            getFolderName(label);

        mailCount.textContent =

            `${state.emails.length} emails`;

    }

    finally{

        hideLoading();

        state.loading = false;

    }

}

/* ==========================================================
   FRIENDLY NAME
========================================================== */

function getFolderName(label){

    const map = {

        INBOX:"Inbox",

        STARRED:"Starred",

        IMPORTANT:"Important",

        SENT:"Sent",

        DRAFT:"Drafts",

        SPAM:"Spam",

        TRASH:"Trash",

        CATEGORY_PERSONAL:"Primary",

        CATEGORY_SOCIAL:"Social",

        CATEGORY_PROMOTIONS:"Promotions",

        CATEGORY_UPDATES:"Updates",

        CATEGORY_FORUMS:"Forums"

    };

    return map[label] || label;

}

/* ==========================================================
   RENDER INBOX
========================================================== */

function renderInbox(

    append = false

){

    const template =

        document.getElementById(

            "email-template"

        );

    if(!append){

        mailList.innerHTML = "";

    }

    const start =

        append

        ? mailList.children.length

        : 0;

    for(

        let i = start;

        i < state.emails.length;

        i++

    ){

        const email =

            state.emails[i];

        const node =

            template.content

                .firstElementChild

                .cloneNode(true);

        node.querySelector(

            ".mail-sender"

        ).textContent =

            email.from;

        node.querySelector(

            ".mail-subject"

        ).textContent =

            email.subject ||

            "(No Subject)";

        node.querySelector(

            ".mail-snippet"

        ).textContent =

            email.snippet;

        node.querySelector(

            ".mail-date"

        ).textContent =

            email.date;

        node.onclick = ()=>{

            openEmail(

                email.id,

                node

            );

        };

        mailList.appendChild(

            node

        );

    }

}

/* ==========================================================
   OPEN EMAIL
========================================================== */

async function openEmail(

    messageId,

    element

){

    try{

        showLoading();

        document

            .querySelectorAll(

                ".mail-item"

            )

            .forEach(item=>

                item.classList.remove(

                    "active"

                )

            );

        element.classList.add(

            "active"

        );

        const email = await api(

            `/api/gmail/email/${messageId}`

        );

        reader.hidden = false;

        readerEmpty.hidden = true;

        emailSubject.textContent =

            email.subject ||

            "(No Subject)";

        emailFrom.textContent =

            email.from;

        emailTo.textContent =

            email.to;

        emailDate.textContent =

            email.date;

        emailBody.textContent =

            email.body;

        state.selectedEmail =

            email;

    }

    catch(error){

        console.error(error);

    }

    finally{

        hideLoading();

    }

}

/* ==========================================================
   INFINITE SCROLL
========================================================== */

mailList.addEventListener(

    "scroll",

    ()=>{

        if(

            state.loading ||

            !state.nextPageToken

        ){

            return;

        }

        const remaining =

            mailList.scrollHeight -

            mailList.scrollTop -

            mailList.clientHeight;

        if(

            remaining < 800

        ){

            loadFolder(

                state.currentLabel,

                true

            );

        }

    }

);

/* ==========================================================
   REFRESH
========================================================== */

document

    .getElementById(

        "refresh-button"

    )

    .onclick = ()=>{

        loadFolder(

            state.currentLabel

        );

    };

/* ==========================================================
   SEARCH
========================================================== */

document

    .getElementById(

        "search"

    )

    .addEventListener(

        "keydown",

        e=>{

            if(

                e.key !== "Enter"

            ){

                return;

            }

            searchMail(

                e.target.value

            );

        }

    );

/* ==========================================================
   SEARCH
========================================================== */

async function searchMail(

    query

){

    if(

        !query.trim()

    ){

        loadFolder(

            state.currentLabel

        );

        return;

    }

    showLoading();

    try{

        const result = await api(

            `/api/gmail/search?q=${encodeURIComponent(query)}`

        );

        state.emails =

            result.emails;

        state.nextPageToken =

            result.nextPageToken;

        renderInbox();

        folderTitle.textContent =

            "Search";

        mailCount.textContent =

            `${state.emails.length} results`;

    }

    finally{

        hideLoading();

    }

}

/* ==========================================================
   COMPOSE
========================================================== */

const composePanel =
    document.getElementById(
        "compose-panel"
    );

document
    .getElementById(
        "compose-button"
    )
    .onclick = ()=>{

        composePanel.hidden = false;

    };

document
    .getElementById(
        "compose-close"
    )
    .onclick = ()=>{

        composePanel.hidden = true;

    };

/* ==========================================================
   ESCAPE
========================================================== */

document.addEventListener(

    "keydown",

    event=>{

        if(event.key==="Escape"){

            composePanel.hidden = true;

        }

    }

);

/* ==========================================================
   TOAST
========================================================== */

const toast =

    document.getElementById(

        "toast"

    );

let toastTimer;

function showToast(

    text

){

    clearTimeout(

        toastTimer

    );

    toast.textContent =

        text;

    toast.hidden = false;

    toastTimer = setTimeout(

        ()=>{

            toast.hidden = true;

        },

        2500

    );

}

/* ==========================================================
   ERROR HANDLER
========================================================== */

window.addEventListener(

    "unhandledrejection",

    event=>{

        console.error(

            event.reason

        );

        showToast(

            "Something went wrong."

        );

    }

);

/* ==========================================================
   RESIZE
========================================================== */

window.addEventListener(

    "resize",

    ()=>{

        // future responsive logic

    }

);

/* ==========================================================
   UTILITIES
========================================================== */

function clearReader(){

    reader.hidden = true;

    readerEmpty.hidden = false;

    emailSubject.textContent = "";

    emailFrom.textContent = "";

    emailTo.textContent = "";

    emailDate.textContent = "";

    emailBody.textContent = "";

}

/* ==========================================================
   LOG
========================================================== */

console.log(

    "%cCosmiMail",

    "font-size:22px;font-weight:700;color:#4DA6FF"

);

console.log(

    "Ready for launch 🚀"

);

