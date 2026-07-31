/*==========================================================
    COSMIMAIL V2
    Built by Cosmiway Labs

    PART 1 — FOUNDATION
==========================================================*/

/*==========================================================
    GLOBAL STATE
==========================================================*/

const state = {

    initialized: false,

    loading: false,

    currentFolder: "inbox",

    selectedEmail: null,

    emails: [],

    filteredEmails: [],

    composeOpen: false,

    composeMinimized: false,

    composeMaximized: false,

    searchQuery: "",

    settingsPage: "general",

    currentUser: null

};

/*==========================================================
    DOM REFERENCES
==========================================================*/

const ui = {

    app: document.querySelector(".app"),

    sidebar: document.querySelector(".sidebar"),

    inbox: document.querySelector(".inbox"),

    reader: document.querySelector(".reader"),

    emailList: document.getElementById("emailList"),

    readerBody: document.getElementById("readerBody"),

    readerTitle: document.querySelector(".reader-title"),

    searchInput: document.getElementById("searchInput"),

    composeWindow: document.getElementById("composeWindow"),

    composeEditor: document.getElementById("composeEditor"),

    composeTo: document.getElementById("composeTo"),

    composeSubject: document.getElementById("composeSubject"),

    settingsPage: document.getElementById("settingsPage"),

    settingsContent: document.getElementById("settingsContent"),

    spinner: document.getElementById("spinner"),

    toast: document.getElementById("toast"),

    dialog: document.getElementById("dialogOverlay"),

    profileMenu: document.getElementById("profileMenu"),

    contextMenu: document.getElementById("contextMenu")

};

/*==========================================================
    INITIALIZATION
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    initializeCosmiMail

);

/*==========================================================
    STARTUP
==========================================================*/

async function initializeCosmiMail(){

    if(state.initialized){

        return;

    }

    state.initialized = true;

    showSpinner("Starting CosmiMail...");

    cacheElements();

    registerEvents();

    await loadSettings();

    await loadAccount();

    await loadInbox();

    hideSpinner();

}

/*==========================================================
    CACHE
==========================================================*/

function cacheElements(){

    console.log(

        "DOM cached."

    );

}

/*==========================================================
    EVENTS
==========================================================*/

function registerEvents(){

    ui.searchInput.addEventListener(

        "input",

        onSearch

    );

}

/*==========================================================
    PLACEHOLDERS
==========================================================*/

async function loadSettings(){

    return;

}

async function loadAccount(){

    return;

}

async function loadInbox(){

    return;

}

/*==========================================================
    SEARCH
==========================================================*/

function onSearch(event){

    state.searchQuery =

        event.target.value

        .trim()

        .toLowerCase();

}

/*==========================================================
    SPINNER
==========================================================*/

function showSpinner(text){

    ui.spinner.classList.add(

        "show"

    );

    const caption =

        document.getElementById(

            "spinnerCaption"

        );

    if(caption){

        caption.textContent = text;

    }

}

function hideSpinner(){

    ui.spinner.classList.remove(

        "show"

    );

}

/*==========================================================
    TOAST
==========================================================*/

function showToast(

    title,

    message

){

    document.getElementById(

        "toastTitle"

    ).textContent = title;

    document.getElementById(

        "toastMessage"

    ).textContent = message;

    ui.toast.classList.add(

        "show"

    );

    setTimeout(

        ()=>{

            ui.toast.classList.remove(

                "show"

            );

        },

        2500

    );

}

/*==========================================================
    PART 2 — EMAIL ENGINE
==========================================================*/

/*==========================================================
    EMAIL LOADING
==========================================================*/

async function loadInbox(){

    try{

        state.loading = true;

        showSkeletons();

        const response = await fetch(

            "/api/emails"

        );

        if(!response.ok){

            throw new Error(

                "Failed to load inbox."

            );

        }

        state.emails =

            await response.json();

        state.filteredEmails =

            [...state.emails];

        renderInbox();

    }

    catch(error){

        console.error(error);

        showToast(

            "Inbox",

            "Unable to load emails."

        );

    }

    finally{

        state.loading = false;

        hideSkeletons();

    }

}

/*==========================================================
    RENDER INBOX
==========================================================*/

function renderInbox(){

    ui.emailList.innerHTML = "";

    if(

        state.filteredEmails.length === 0

    ){

        ui.emailList.innerHTML = `

            <div class="empty-state">

                <h2>No emails</h2>

                <p>

                    Nothing to show.

                </p>

            </div>

        `;

        return;

    }

    state.filteredEmails.forEach(

        createEmailCard

    );

}

/*==========================================================
    EMAIL CARD
==========================================================*/

function createEmailCard(email){

    const card =

        document.createElement(

            "div"

        );

    card.className =

        "mail-item";

    if(email.unread){

        card.classList.add(

            "unread"

        );

    }

    card.innerHTML = `

        <div class="mail-header">

            <div class="mail-from">

                ${email.from}

            </div>

            <div class="mail-time">

                ${email.time}

            </div>

        </div>

        <div class="mail-subject">

            ${email.subject}

        </div>

        <div class="mail-preview">

            ${email.preview}

        </div>

    `;

    card.addEventListener(

        "click",

        ()=>{

            openEmail(

                email.id

            );

        }

    );

    ui.emailList.appendChild(

        card

    );

}

/*==========================================================
    OPEN EMAIL
==========================================================*/

function openEmail(id){

    const email =

        state.emails.find(

            mail=>mail.id===id

        );

    if(!email){

        return;

    }

    state.selectedEmail = email;

    renderReader();

    highlightEmail(id);

}

/*==========================================================
    READER
==========================================================*/

function renderReader(){

    const mail =

        state.selectedEmail;

    if(!mail){

        return;

    }

    ui.readerTitle.textContent =

        mail.subject;

    ui.readerBody.innerHTML = `

        <article class="email">

            <h1 class="email-subject">

                ${mail.subject}

            </h1>

            <div class="email-meta">

                <div class="email-sender">

                    <div class="sender-avatar">

                        ${mail.from.charAt(0)}

                    </div>

                    <div class="sender-details">

                        <div class="sender-name">

                            ${mail.from}

                        </div>

                        <div class="sender-email">

                            ${mail.email}

                        </div>

                    </div>

                </div>

                <div class="email-date">

                    ${mail.date}

                </div>

            </div>

            <div class="email-divider"></div>

            <div class="email-content">

                ${mail.body}

            </div>

        </article>

    `;

}

/*==========================================================
    HIGHLIGHT
==========================================================*/

function highlightEmail(id){

    document

        .querySelectorAll(

            ".mail-item"

        )

        .forEach(

            card=>

            card.classList.remove(

                "active"

            )

        );

    const index =

        state.filteredEmails.findIndex(

            mail=>mail.id===id

        );

    if(index===-1){

        return;

    }

    ui.emailList.children[index]

        ?.classList.add(

            "active"

        );

}

/*==========================================================
    SEARCH
==========================================================*/

function onSearch(event){

    state.searchQuery =

        event.target.value

        .trim()

        .toLowerCase();

    state.filteredEmails =

        state.emails.filter(

            mail=>

                mail.subject

                    .toLowerCase()

                    .includes(

                        state.searchQuery

                    )

                ||

                mail.from

                    .toLowerCase()

                    .includes(

                        state.searchQuery

                    )

                ||

                mail.preview

                    .toLowerCase()

                    .includes(

                        state.searchQuery

                    )

        );

    renderInbox();

}

/*==========================================================
    SKELETONS
==========================================================*/

function showSkeletons(){

    ui.emailList.innerHTML = "";

    for(

        let i=0;

        i<8;

        i++

    ){

        const item =

            document.createElement(

                "div"

            );

        item.className =

            "email-placeholder";

        item.innerHTML = `

            <div class="skeleton skeleton-circle"></div>

            <div class="email-placeholder-content">

                <div class="skeleton skeleton-line"></div>

                <div class="skeleton skeleton-line"></div>

            </div>

        `;

        ui.emailList.appendChild(

            item

        );

    }

}

function hideSkeletons(){

}

/*==========================================================
    PART 3 — COMPOSE ENGINE
==========================================================*/

/*==========================================================
    COMPOSE STATE
==========================================================*/

const compose = {

    to: "",

    cc: "",

    bcc: "",

    subject: "",

    body: "",

    attachments: []

};

/*==========================================================
    REGISTER EVENTS
==========================================================*/

function registerComposeEvents(){

    document

        .querySelector(

            ".compose-button"

        )

        ?.addEventListener(

            "click",

            openCompose

        );

    document

        .getElementById(

            "closeCompose"

        )

        ?.addEventListener(

            "click",

            closeCompose

        );

    ui.composeSubject

        ?.addEventListener(

            "input",

            saveDraft

        );

    ui.composeEditor

        ?.addEventListener(

            "input",

            saveDraft

        );

    ui.composeTo

        ?.addEventListener(

            "input",

            saveDraft

        );

}

/*==========================================================
    OPEN
==========================================================*/

function openCompose(){

    state.composeOpen = true;

    ui.composeWindow.classList.remove(

        "hidden"

    );

    ui.composeWindow.classList.remove(

        "minimized"

    );

    ui.composeWindow.classList.add(

        "active"

    );

    ui.composeTo.focus();

}

/*==========================================================
    CLOSE
==========================================================*/

function closeCompose(){

    if(hasUnsavedDraft()){

        showDiscardDialog();

        return;

    }

    resetCompose();

}

/*==========================================================
    RESET
==========================================================*/

function resetCompose(){

    state.composeOpen = false;

    state.composeMinimized = false;

    state.composeMaximized = false;

    ui.composeWindow.className =

        "compose-window hidden";

    compose.to = "";

    compose.cc = "";

    compose.bcc = "";

    compose.subject = "";

    compose.body = "";

    compose.attachments = [];

    ui.composeTo.value = "";

    ui.composeSubject.value = "";

    ui.composeEditor.innerHTML = "";

}

/*==========================================================
    MINIMIZE
==========================================================*/

function minimizeCompose(){

    state.composeMinimized = true;

    ui.composeWindow.classList.add(

        "minimized"

    );

}

/*==========================================================
    RESTORE
==========================================================*/

function restoreCompose(){

    state.composeMinimized = false;

    ui.composeWindow.classList.remove(

        "minimized"

    );

}

/*==========================================================
    MAXIMIZE
==========================================================*/

function maximizeCompose(){

    state.composeMaximized =

        !state.composeMaximized;

    ui.composeWindow.classList.toggle(

        "maximized"

    );

}

/*==========================================================
    DRAFT
==========================================================*/

function saveDraft(){

    compose.to =

        ui.composeTo.value;

    compose.subject =

        ui.composeSubject.value;

    compose.body =

        ui.composeEditor.innerHTML;

    updateDraftIndicator(

        "Saving..."

    );

    clearTimeout(

        saveDraft.timer

    );

    saveDraft.timer =

        setTimeout(

            ()=>{

                updateDraftIndicator(

                    "Saved"

                );

            },

            600

        );

}

/*==========================================================
    DRAFT STATUS
==========================================================*/

function updateDraftIndicator(text){

    const label =

        document.querySelector(

            ".draft-status span"

        );

    if(label){

        label.textContent = text;

    }

}

/*==========================================================
    CHECK DRAFT
==========================================================*/

function hasUnsavedDraft(){

    return(

        compose.to ||

        compose.subject ||

        compose.body ||

        compose.attachments.length

    );

}

/*==========================================================
    ATTACHMENTS
==========================================================*/

function addAttachment(file){

    compose.attachments.push(

        file

    );

    renderAttachments();

}

function removeAttachment(index){

    compose.attachments.splice(

        index,

        1

    );

    renderAttachments();

}

function renderAttachments(){

    const container =

        document.querySelector(

            ".compose-attachments"

        );

    container.innerHTML = "";

    compose.attachments.forEach(

        (file,index)=>{

            const card =

                document.createElement(

                    "div"

                );

            card.className =

                "attachment-card";

            card.innerHTML = `

                <div class="attachment-icon">

                    <i class="fa-solid fa-file"></i>

                </div>

                <div class="attachment-info">

                    <div class="attachment-name">

                        ${file.name}

                    </div>

                    <div class="attachment-size">

                        ${(file.size/1024).toFixed(1)} KB

                    </div>

                </div>

                <div class="attachment-remove">

                    <i class="fa-solid fa-xmark"></i>

                </div>

            `;

            card

                .querySelector(

                    ".attachment-remove"

                )

                .addEventListener(

                    "click",

                    ()=>{

                        removeAttachment(

                            index

                        );

                    }

                );

            container.appendChild(

                card

            );

        }

    );

}

/*==========================================================
    SEND
==========================================================*/

async function sendEmail(){

    if(

        compose.to.trim()===""

    ){

        showToast(

            "Compose",

            "Recipient required."

        );

        return;

    }

    showSpinner(

        "Sending..."

    );

    try{

        await fetch(

            "/api/send",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify(

                    compose

                )

            }

        );

        hideSpinner();

        showToast(

            "Sent",

            "Email sent successfully."

        );

        resetCompose();

    }

    catch(error){

        hideSpinner();

        showToast(

            "Failed",

            "Unable to send email."

        );

    }

}

/*==========================================================
    PART 4 — SETTINGS ENGINE
==========================================================*/

/*==========================================================
    SETTINGS STATE
==========================================================*/

const settings = {

    appearance: "dark",

    accent: "sapphire",

    notifications: true,

    shortcuts: true,

    autoSave: true

};

/*==========================================================
    REGISTER EVENTS
==========================================================*/

function registerSettingsEvents(){

    document

        .getElementById(

            "openSettings"

        )

        ?.addEventListener(

            "click",

            openSettings

        );

    document

        .getElementById(

            "settingsBackButton"

        )

        ?.addEventListener(

            "click",

            closeSettings

        );

    document

        .querySelectorAll(

            ".settings-item"

        )

        .forEach(

            item=>{

                item.addEventListener(

                    "click",

                    ()=>{

                        changeSettingsPage(

                            item.dataset.page

                        );

                    }

                );

            }

        );

}

/*==========================================================
    OPEN
==========================================================*/

function openSettings(){

    ui.settingsPage.classList.remove(

        "hidden"

    );

    renderSettings();

}

/*==========================================================
    CLOSE
==========================================================*/

function closeSettings(){

    ui.settingsPage.classList.add(

        "hidden"

    );

}

/*==========================================================
    CHANGE PAGE
==========================================================*/

function changeSettingsPage(page){

    state.settingsPage = page;

    document

        .querySelectorAll(

            ".settings-item"

        )

        .forEach(

            item=>{

                item.classList.toggle(

                    "active",

                    item.dataset.page===page

                );

            }

        );

    renderSettings();

}

/*==========================================================
    RENDER
==========================================================*/

function renderSettings(){

    switch(

        state.settingsPage

    ){

        case "general":

            renderGeneral();

            break;

        case "appearance":

            renderAppearance();

            break;

        case "accounts":

            renderAccounts();

            break;

        case "notifications":

            renderNotifications();

            break;

        case "shortcuts":

            renderShortcuts();

            break;

        case "about":

            renderAbout();

            break;

    }

}

/*==========================================================
    GENERAL
==========================================================*/

function renderGeneral(){

    ui.settingsContent.innerHTML = `

        <h1 class="settings-title">

            General

        </h1>

        <div class="settings-group">

            <div class="settings-card">

                <div class="setting-row">

                    <div class="setting-info">

                        <div class="setting-name">

                            Auto Save Drafts

                        </div>

                        <div class="setting-description">

                            Automatically save drafts.

                        </div>

                    </div>

                    <div class="switch ${settings.autoSave ? "active" : ""}"></div>

                </div>

            </div>

        </div>

    `;

}

/*==========================================================
    APPEARANCE
==========================================================*/

function renderAppearance(){

    ui.settingsContent.innerHTML = `

        <h1 class="settings-title">

            Appearance

        </h1>

        <div class="settings-group">

            <div class="settings-card">

                <div class="setting-row">

                    <div class="setting-info">

                        <div class="setting-name">

                            Accent Color

                        </div>

                    </div>

                    <div class="accent-picker">

                        <div class="accent sapphire"></div>

                        <div class="accent nebula"></div>

                        <div class="accent crimson"></div>

                        <div class="accent graphite"></div>

                        <div class="accent arctic"></div>

                    </div>

                </div>

            </div>

        </div>

    `;

}

/*==========================================================
    ACCOUNTS
==========================================================*/

function renderAccounts(){

    ui.settingsContent.innerHTML = `

        <h1 class="settings-title">

            Accounts

        </h1>

        <div class="settings-group">

            <div class="settings-card">

                <div class="setting-row">

                    <div class="setting-info">

                        <div class="setting-name">

                            Gmail

                        </div>

                        <div class="setting-description">

                            Connected account.

                        </div>

                    </div>

                </div>

            </div>

        </div>

    `;

}

/*==========================================================
    NOTIFICATIONS
==========================================================*/

function renderNotifications(){

    ui.settingsContent.innerHTML = `

        <h1 class="settings-title">

            Notifications

        </h1>

        <div class="settings-group">

            <div class="settings-card">

                <div class="setting-row">

                    <div class="setting-info">

                        <div class="setting-name">

                            Desktop Notifications

                        </div>

                    </div>

                    <div class="switch ${settings.notifications ? "active" : ""}"></div>

                </div>

            </div>

        </div>

    `;

}

/*==========================================================
    SHORTCUTS
==========================================================*/

function renderShortcuts(){

    ui.settingsContent.innerHTML = `

        <h1 class="settings-title">

            Keyboard Shortcuts

        </h1>

        <div class="settings-group">

            <div class="settings-card">

                <div class="setting-row">

                    <div class="setting-info">

                        <div class="setting-name">

                            Enable Shortcuts

                        </div>

                    </div>

                    <div class="switch ${settings.shortcuts ? "active" : ""}"></div>

                </div>

            </div>

        </div>

    `;

}

/*==========================================================
    ABOUT
==========================================================*/

function renderAbout(){

    ui.settingsContent.innerHTML = `

        <div class="about-logo">

            CW

        </div>

        <div class="about-name">

            CosmiMail

        </div>

        <div class="about-version">

            Version 2.0 Alpha

        </div>

        <div class="about-company">

            Built by Cosmiway Labs

        </div>

        <div class="about-footer">

            © 2026 Cosmiway Labs

        </div>

    `;

}

/*==========================================================
    PART 5 — MENUS, DIALOGS & FLOATING UI
==========================================================*/

/*==========================================================
    MENU STATE
==========================================================*/

const menu = {

    active: null

};

/*==========================================================
    REGISTER EVENTS
==========================================================*/

function registerMenuEvents(){

    document.addEventListener(

        "click",

        closeAllMenus

    );

    document.addEventListener(

        "contextmenu",

        openContextMenu

    );

    document.addEventListener(

        "keydown",

        event=>{

            if(event.key==="Escape"){

                closeAllMenus();

                closeDialog();

            }

        }

    );

}

/*==========================================================
    CONTEXT MENU
==========================================================*/

function openContextMenu(event){

    const card =

        event.target.closest(

            ".mail-item"

        );

    if(!card){

        return;

    }

    event.preventDefault();

    menu.active = ui.contextMenu;

    ui.contextMenu.style.left =

        `${event.clientX}px`;

    ui.contextMenu.style.top =

        `${event.clientY}px`;

    ui.contextMenu.classList.remove(

        "hidden"

    );

}

function closeAllMenus(){

    document

        .querySelectorAll(

            ".menu"

        )

        .forEach(

            menu=>{

                menu.classList.add(

                    "hidden"

                );

            }

        );

}

/*==========================================================
    PROFILE MENU
==========================================================*/

function toggleProfileMenu(){

    const hidden =

        ui.profileMenu.classList.contains(

            "hidden"

        );

    closeAllMenus();

    if(hidden){

        ui.profileMenu.classList.remove(

            "hidden"

        );

    }

}

/*==========================================================
    DIALOG
==========================================================*/

function showDialog({

    title,

    subtitle,

    confirmText="Continue",

    cancelText="Cancel",

    confirmAction=null

}){

    document.getElementById(

        "dialogTitle"

    ).textContent = title;

    document.getElementById(

        "dialogSubtitle"

    ).textContent = subtitle;

    document.getElementById(

        "dialogConfirm"

    ).textContent = confirmText;

    document.getElementById(

        "dialogCancel"

    ).textContent = cancelText;

    ui.dialog.classList.add(

        "show"

    );

    const confirm =

        document.getElementById(

            "dialogConfirm"

        );

    confirm.onclick = ()=>{

        closeDialog();

        if(confirmAction){

            confirmAction();

        }

    };

}

function closeDialog(){

    ui.dialog.classList.remove(

        "show"

    );

}

/*==========================================================
    COMMON DIALOGS
==========================================================*/

function showDiscardDialog(){

    showDialog({

        title:

            "Discard draft?",

        subtitle:

            "Your unsaved changes will be lost.",

        confirmText:

            "Discard",

        confirmAction:

            resetCompose

    });

}

function showDeleteDialog(callback){

    showDialog({

        title:

            "Delete email?",

        subtitle:

            "This email will be moved to Trash.",

        confirmText:

            "Delete",

        confirmAction:

            callback

    });

}

function showSignOutDialog(){

    showDialog({

        title:

            "Sign out?",

        subtitle:

            "You'll need to sign in again.",

        confirmText:

            "Sign Out",

        confirmAction:

            signOut

    });

}

/*==========================================================
    TOASTS
==========================================================*/

let toastTimer = null;

function showToast(

    title,

    message

){

    clearTimeout(

        toastTimer

    );

    document.getElementById(

        "toastTitle"

    ).textContent = title;

    document.getElementById(

        "toastMessage"

    ).textContent = message;

    ui.toast.classList.add(

        "show"

    );

    toastTimer =

        setTimeout(

            ()=>{

                ui.toast.classList.remove(

                    "show"

                );

            },

            2600

        );

}

/*==========================================================
    TOOLTIPS
==========================================================*/

function attachTooltips(){

    document

        .querySelectorAll(

            "[title]"

        )

        .forEach(

            element=>{

                element.addEventListener(

                    "mouseenter",

                    ()=>{

                        /* Future tooltip */

                    }

                );

            }

        );

}

/*==========================================================
    PART 6 — KEYBOARD SHORTCUTS & APP CONTROLLER
==========================================================*/

/*==========================================================
    APP CONTROLLER
==========================================================*/

function initializeControllers(){

    registerComposeEvents();

    registerSettingsEvents();

    registerMenuEvents();

    registerKeyboardShortcuts();

}

/*==========================================================
    FOLDER NAVIGATION
==========================================================*/

function switchFolder(folder){

    if(

        state.currentFolder===folder

    ){

        return;

    }

    state.currentFolder=folder;

    document

        .querySelectorAll(

            ".sidebar-item"

        )

        .forEach(

            item=>{

                item.classList.remove(

                    "active"

                );

            }

        );

    document

        .querySelector(

            `[data-folder="${folder}"]`

        )

        ?.classList.add(

            "active"

        );

    showSpinner(

        "Loading folder..."

    );

    loadFolder(folder);

}

async function loadFolder(folder){

    try{

        const response=

            await fetch(

                `/api/folder/${folder}`

            );

        if(!response.ok){

            throw new Error();

        }

        state.emails=

            await response.json();

        state.filteredEmails=[

            ...state.emails

        ];

        renderInbox();

    }

    catch(error){

        showToast(

            "Folder",

            "Unable to load folder."

        );

    }

    finally{

        hideSpinner();

    }

}

/*==========================================================
    REFRESH
==========================================================*/

async function refreshInbox(){

    showSpinner(

        "Refreshing..."

    );

    await loadInbox();

    hideSpinner();

}

/*==========================================================
    KEYBOARD SHORTCUTS
==========================================================*/

function registerKeyboardShortcuts(){

    document.addEventListener(

        "keydown",

        handleKeyboardShortcut

    );

}

function handleKeyboardShortcut(event){

    const key=

        event.key.toLowerCase();

    const ctrl=

        event.ctrlKey||

        event.metaKey;

    if(

        ctrl&&

        key==="n"

    ){

        event.preventDefault();

        openCompose();

        return;

    }

    if(

        ctrl&&

        key==="f"

    ){

        event.preventDefault();

        ui.searchInput.focus();

        ui.searchInput.select();

        return;

    }

    if(

        ctrl&&

        key==="r"

    ){

        event.preventDefault();

        refreshInbox();

        return;

    }

    if(

        ctrl&&

        key==="."

    ){

        event.preventDefault();

        openSettings();

        return;

    }

    if(

        key==="escape"

    ){

        if(

            state.composeOpen

        ){

            closeCompose();

        }

        closeDialog();

        closeAllMenus();

        return;

    }

    if(

        key==="delete"

    ){

        if(

            state.selectedEmail

        ){

            showDeleteDialog(

                ()=>{

                    deleteCurrentEmail();

                }

            );

        }

    }

}

/*==========================================================
    EMAIL ACTIONS
==========================================================*/

function deleteCurrentEmail(){

    if(

        !state.selectedEmail

    ){

        return;

    }

    const id=

        state.selectedEmail.id;

    state.emails=

        state.emails.filter(

            mail=>mail.id!==id

        );

    state.filteredEmails=

        state.filteredEmails.filter(

            mail=>mail.id!==id

        );

    state.selectedEmail=null;

    renderInbox();

    ui.readerBody.innerHTML=`

        <div class="empty-state">

            <h2>

                No email selected

            </h2>

            <p>

                Select an email from the inbox.

            </p>

        </div>

    `;

    showToast(

        "Deleted",

        "Email moved to Trash."

    );

}

function archiveCurrentEmail(){

    if(

        !state.selectedEmail

    ){

        return;

    }

    showToast(

        "Archived",

        "Email archived."

    );

}

function starCurrentEmail(){

    if(

        !state.selectedEmail

    ){

        return;

    }

    state.selectedEmail.starred=

        !state.selectedEmail.starred;

    showToast(

        state.selectedEmail.starred

            ? "Starred"

            : "Unstarred",

        state.selectedEmail.starred

            ? "Added to Starred."

            : "Removed from Starred."

    );

}

/*==========================================================
    SIGN OUT
==========================================================*/

function signOut(){

    showSpinner(

        "Signing out..."

    );

    setTimeout(

        ()=>{

            hideSpinner();

            window.location.href="/logout";

        },

        800

    );

}

/*==========================================================
    START EVERYTHING
==========================================================*/

initializeControllers();

/*==========================================================
    PART 7 — FLASK API & GMAIL BRIDGE
==========================================================*/

/*==========================================================
    API
==========================================================*/

const api = {

    base: "https://starfielddatabase.pythonanywhere.com"

};

/*==========================================================
    REQUEST
==========================================================*/

async function apiRequest(

    endpoint,

    options={}

){

    const response=

        await fetch(

            api.base+endpoint,

            {

                headers:{

                    "Content-Type":

                        "application/json"

                },

                credentials:

                    "same-origin",

                ...options

            }

        );

    if(

        !response.ok

    ){

        throw new Error(

            response.statusText

        );

    }

    return await response.json();

}

/*==========================================================
    ACCOUNT
==========================================================*/

async function loadAccount(){

    try{

        const account=

            await apiRequest(

                "/api/account"

            );

        state.currentUser=

            account;

        updateProfile(

            account

        );

    }

    catch(error){

        console.error(

            error

        );

    }

}

function updateProfile(

    account

){

    document.querySelector(

        ".profile-name"

    ).textContent=

        account.name;

    document.querySelector(

        ".profile-email"

    ).textContent=

        account.email;

}

/*==========================================================
    GMAIL
==========================================================*/

async function syncInbox(){

    showSpinner(

        "Syncing Gmail..."

    );

    try{

        await apiRequest(

            "/api/sync",

            {

                method:"POST"

            }

        );

        await loadInbox();

        showToast(

            "Synced",

            "Inbox updated."

        );

    }

    catch(error){

        showToast(

            "Sync Failed",

            "Unable to reach Gmail."

        );

    }

    finally{

        hideSpinner();

    }

}

/*==========================================================
    SEND
==========================================================*/

async function sendCurrentEmail(){

    showSpinner(

        "Sending..."

    );

    try{

        await apiRequest(

            "/api/send",

            {

                method:"POST",

                body:JSON.stringify({

                    to:

                        compose.to,

                    cc:

                        compose.cc,

                    bcc:

                        compose.bcc,

                    subject:

                        compose.subject,

                    body:

                        compose.body

                })

            }

        );

        hideSpinner();

        showToast(

            "Email Sent",

            "Message delivered."

        );

        resetCompose();

    }

    catch(error){

        hideSpinner();

        showToast(

            "Send Failed",

            "Unable to send email."

        );

    }

}

/*==========================================================
    DELETE
==========================================================*/

async function deleteEmail(

    id

){

    await apiRequest(

        `/api/email/${id}`,

        {

            method:"DELETE"

        }

    );

}

/*==========================================================
    STAR
==========================================================*/

async function toggleStar(

    id

){

    await apiRequest(

        `/api/email/${id}/star`,

        {

            method:"POST"

        }

    );

}

/*==========================================================
    ARCHIVE
==========================================================*/

async function archiveEmail(

    id

){

    await apiRequest(

        `/api/email/${id}/archive`,

        {

            method:"POST"

        }

    );

}

/*==========================================================
    MARK READ
==========================================================*/

async function markRead(

    id

){

    await apiRequest(

        `/api/email/${id}/read`,

        {

            method:"POST"

        }

    );

}

/*==========================================================
    DRAFT
==========================================================*/

async function saveDraftRemote(){

    await apiRequest(

        "/api/draft",

        {

            method:"POST",

            body:JSON.stringify(

                compose

            )

        }

    );

}

/*==========================================================
    ATTACHMENTS
==========================================================*/

async function uploadAttachment(

    file

){

    const form=

        new FormData();

    form.append(

        "file",

        file

    );

    const response=

        await fetch(

            "/api/upload",

            {

                method:"POST",

                body:form

            }

        );

    return await response.json();

}

/*==========================================================
    CONNECTION
==========================================================*/

async function pingServer(){

    try{

        await apiRequest(

            "/api/ping"

        );

    }

    catch(error){

        showToast(

            "Offline",

            "Server unavailable."

        );

    }

}

/*==========================================================
    PART 8 — ACCOUNT & MAIL PROVIDER
==========================================================*/

/*==========================================================
    ACCOUNT
==========================================================*/

async function loadAccount(){

    try{

        const response=

            await apiRequest(

                "/api/me"

            );

        state.currentUser={

            name:response.name,

            email:response.email,

            loggedIn:response.logged_in

        };

        renderCurrentUser();

    }

    catch(error){

        console.error(

            error

        );

        showToast(

            "Account",

            "Not signed in."

        );

    }

}

/*==========================================================
    PROFILE
==========================================================*/

function renderCurrentUser(){

    if(

        !state.currentUser

    ){

        return;

    }

    document.querySelector(

        ".profile-name"

    ).textContent=

        state.currentUser.name;

    document.querySelector(

        ".profile-email"

    ).textContent=

        state.currentUser.email;

}

/*==========================================================
    PROVIDER
==========================================================*/

const provider={

    current:"gmail"

};

/*==========================================================
    LOAD MAIL
==========================================================*/

async function loadFolder(folder){

    showSpinner(

        "Loading..."

    );

    try{

        switch(

            provider.current

        ){

            case "gmail":

                await loadGmailFolder(

                    folder

                );

                break;

            default:

                throw new Error(

                    "Unsupported provider."

                );

        }

    }

    finally{

        hideSpinner();

    }

}

/*==========================================================
    GMAIL
==========================================================*/

async function loadGmailFolder(folder){

    let label="INBOX";

    switch(folder){

        case "inbox":

            label="INBOX";

            break;

        case "sent":

            label="SENT";

            break;

        case "trash":

            label="TRASH";

            break;

        case "starred":

            label="STARRED";

            break;

    }

    const response=

        await apiRequest(

            `/api/gmail/messages?label=${label}`

        );

    state.emails=

        response.emails;

    state.filteredEmails=[

        ...state.emails

    ];

    renderInbox();

}

/*==========================================================
    OPEN EMAIL
==========================================================*/

async function openEmail(id){

    showSpinner(

        "Opening..."

    );

    try{

        const mail=

            await apiRequest(

                `/api/gmail/email/${id}`

            );

        state.selectedEmail=

            mail;

        renderReader();

    }

    finally{

        hideSpinner();

    }

}

/*==========================================================
    LABELS
==========================================================*/

async function loadLabels(){

    try{

        const labels=

            await apiRequest(

                "/api/gmail/labels"

            );

        state.labels=

            labels;

    }

    catch(error){

        console.error(

            error

        );

    }

}

/*==========================================================
    REFRESH
==========================================================*/

async function refreshInbox(){

    await loadFolder(

        state.currentFolder

    );

}

/*==========================================================
    FUTURE
==========================================================*/

/*

Future providers:

provider.current="outlook"

provider.current="yahoo"

provider.current="icloud"

Nothing else in the UI changes.

Only these provider
functions.

*/

/*==========================================================
    PART 9 — RICH TEXT EDITOR
==========================================================*/

/*==========================================================
    EDITOR
==========================================================*/

const editor={

    element:null,

    selection:null

};

/*==========================================================
    INITIALIZE
==========================================================*/

function initializeEditor(){

    editor.element=

        ui.composeEditor;

    if(!editor.element){

        return;

    }

    editor.element.addEventListener(

        "mouseup",

        rememberSelection

    );

    editor.element.addEventListener(

        "keyup",

        rememberSelection

    );

    editor.element.addEventListener(

        "paste",

        handlePaste

    );

    editor.element.addEventListener(

        "drop",

        handleDrop

    );

    editor.element.addEventListener(

        "dragover",

        event=>{

            event.preventDefault();

        }

    );

}

/*==========================================================
    SELECTION
==========================================================*/

function rememberSelection(){

    const selection=

        window.getSelection();

    if(

        selection.rangeCount

    ){

        editor.selection=

            selection.getRangeAt(0);

    }

}

function restoreSelection(){

    if(

        !editor.selection

    ){

        return;

    }

    const selection=

        window.getSelection();

    selection.removeAllRanges();

    selection.addRange(

        editor.selection

    );

}

/*==========================================================
    FORMAT
==========================================================*/

function applyFormat(command,value=null){

    restoreSelection();

    document.execCommand(

        command,

        false,

        value

    );

    rememberSelection();

    ui.composeEditor.focus();

}

/*==========================================================
    COMMON ACTIONS
==========================================================*/

function bold(){

    applyFormat(

        "bold"

    );

}

function italic(){

    applyFormat(

        "italic"

    );

}

function underline(){

    applyFormat(

        "underline"

    );

}

function strike(){

    applyFormat(

        "strikeThrough"

    );

}

function orderedList(){

    applyFormat(

        "insertOrderedList"

    );

}

function unorderedList(){

    applyFormat(

        "insertUnorderedList"

    );

}

/*==========================================================
    ALIGNMENT
==========================================================*/

function alignLeft(){

    applyFormat(

        "justifyLeft"

    );

}

function alignCenter(){

    applyFormat(

        "justifyCenter"

    );

}

function alignRight(){

    applyFormat(

        "justifyRight"

    );

}

/*==========================================================
    LINK
==========================================================*/

function insertLink(){

    const url=

        prompt(

            "Enter URL"

        );

    if(

        !url

    ){

        return;

    }

    applyFormat(

        "createLink",

        url

    );

}

/*==========================================================
    IMAGE
==========================================================*/

function insertImage(){

    const url=

        prompt(

            "Image URL"

        );

    if(

        !url

    ){

        return;

    }

    applyFormat(

        "insertImage",

        url

    );

}

/*==========================================================
    CLEAR
==========================================================*/

function clearFormatting(){

    applyFormat(

        "removeFormat"

    );

}

/*==========================================================
    PASTE
==========================================================*/

function handlePaste(event){

    const items=

        event.clipboardData.items;

    for(

        const item of items

    ){

        if(

            item.type.startsWith(

                "image"

            )

        ){

            const file=

                item.getAsFile();

            addAttachment(

                file

            );

        }

    }

}

/*==========================================================
    DROP
==========================================================*/

function handleDrop(event){

    event.preventDefault();

    for(

        const file

        of

        event.dataTransfer.files

    ){

        addAttachment(

            file

        );

    }

}

/*==========================================================
    TOOLBAR
==========================================================*/

function registerToolbar(){

    document

        .querySelectorAll(

            "[data-command]"

        )

        .forEach(

            button=>{

                button.addEventListener(

                    "click",

                    ()=>{

                        const cmd=

                            button.dataset.command;

                        switch(cmd){

                            case"bold":

                                bold();

                                break;

                            case"italic":

                                italic();

                                break;

                            case"underline":

                                underline();

                                break;

                            case"strike":

                                strike();

                                break;

                            case"ordered":

                                orderedList();

                                break;

                            case"unordered":

                                unorderedList();

                                break;

                            case"left":

                                alignLeft();

                                break;

                            case"center":

                                alignCenter();

                                break;

                            case"right":

                                alignRight();

                                break;

                            case"link":

                                insertLink();

                                break;

                            case"image":

                                insertImage();

                                break;

                            case"clear":

                                clearFormatting();

                                break;

                        }

                    }

                );

            }

        );

}

/*==========================================================
    SHORTCUTS
==========================================================*/

document.addEventListener(

    "keydown",

    event=>{

        if(

            !state.composeOpen

        ){

            return;

        }

        const ctrl=

            event.ctrlKey||

            event.metaKey;

        if(

            !ctrl

        ){

            return;

        }

        switch(

            event.key.toLowerCase()

        ){

            case"b":

                event.preventDefault();

                bold();

                break;

            case"i":

                event.preventDefault();

                italic();

                break;

            case"u":

                event.preventDefault();

                underline();

                break;

        }

    }

);

/*==========================================================
    START
==========================================================*/

initializeEditor();

registerToolbar();

/*==========================================================
    PART 10 — WINDOW ENGINE & POLISH
==========================================================*/

/*==========================================================
    WINDOW
==========================================================*/

const windowState={

    dragging:false,

    resizing:false,

    startX:0,

    startY:0,

    startLeft:0,

    startTop:0,

    startWidth:0,

    startHeight:0

};

/*==========================================================
    INITIALIZE
==========================================================*/

function initializeWindow(){

    const header=

        document.querySelector(

            ".compose-header"

        );

    if(header){

        header.addEventListener(

            "mousedown",

            beginDrag

        );

    }

    document.addEventListener(

        "mousemove",

        dragWindow

    );

    document.addEventListener(

        "mouseup",

        endDrag

    );

}

/*==========================================================
    DRAG
==========================================================*/

function beginDrag(event){

    if(

        state.composeMaximized

    ){

        return;

    }

    windowState.dragging=true;

    const rect=

        ui.composeWindow.getBoundingClientRect();

    windowState.startX=event.clientX;

    windowState.startY=event.clientY;

    windowState.startLeft=rect.left;

    windowState.startTop=rect.top;

}

function dragWindow(event){

    if(

        !windowState.dragging

    ){

        return;

    }

    const dx=

        event.clientX-

        windowState.startX;

    const dy=

        event.clientY-

        windowState.startY;

    ui.composeWindow.style.left=

        `${windowState.startLeft+dx}px`;

    ui.composeWindow.style.top=

        `${windowState.startTop+dy}px`;

    ui.composeWindow.style.right=

        "auto";

    ui.composeWindow.style.bottom=

        "auto";

}

function endDrag(){

    windowState.dragging=false;

}

/*==========================================================
    REMEMBER SIZE
==========================================================*/

function saveWindowState(){

    localStorage.setItem(

        "composeWindow",

        JSON.stringify({

            left:

                ui.composeWindow.style.left,

            top:

                ui.composeWindow.style.top,

            width:

                ui.composeWindow.style.width,

            height:

                ui.composeWindow.style.height

        })

    );

}

function restoreWindowState(){

    const raw=

        localStorage.getItem(

            "composeWindow"

        );

    if(

        !raw

    ){

        return;

    }

    const data=

        JSON.parse(

            raw

        );

    ui.composeWindow.style.left=

        data.left;

    ui.composeWindow.style.top=

        data.top;

    ui.composeWindow.style.width=

        data.width;

    ui.composeWindow.style.height=

        data.height;

}

/*==========================================================
    ANIMATIONS
==========================================================*/

function fadeIn(element){

    element.classList.remove(

        "hidden"

    );

    requestAnimationFrame(

        ()=>{

            element.classList.add(

                "show"

            );

        }

    );

}

function fadeOut(element){

    element.classList.remove(

        "show"

    );

    setTimeout(

        ()=>{

            element.classList.add(

                "hidden"

            );

        },

        180

    );

}

/*==========================================================
    RIPPLE
==========================================================*/

function attachRipples(){

    document

        .querySelectorAll(

            "button"

        )

        .forEach(

            button=>{

                button.addEventListener(

                    "click",

                    createRipple

                );

            }

        );

}

function createRipple(event){

    const button=

        event.currentTarget;

    const ripple=

        document.createElement(

            "span"

        );

    ripple.className=

        "ripple";

    const rect=

        button.getBoundingClientRect();

    ripple.style.left=

        `${event.clientX-rect.left}px`;

    ripple.style.top=

        `${event.clientY-rect.top}px`;

    button.appendChild(

        ripple

    );

    setTimeout(

        ()=>{

            ripple.remove();

        },

        500

    );

}

/*==========================================================
    AUTO RESIZE
==========================================================*/

function handleResize(){

    if(

        state.composeMaximized

    ){

        ui.composeWindow.style.width=

            `${window.innerWidth}px`;

        ui.composeWindow.style.height=

            `${window.innerHeight}px`;

    }

}

window.addEventListener(

    "resize",

    handleResize

);

/*==========================================================
    CLOCK
==========================================================*/

function updateRelativeTimes(){

    document

        .querySelectorAll(

            ".mail-time"

        )

        .forEach(

            element=>{

                /* Future relative time updates */

            }

        );

}

/*==========================================================
    START
==========================================================*/

initializeWindow();

restoreWindowState();

attachRipples();

setInterval(

    updateRelativeTimes,

    60000

);

/*==========================================================
    PART 11 — APPLICATION INTEGRATION
==========================================================*/

/*==========================================================
    SIDEBAR
==========================================================*/

function initializeSidebar(){

    document

        .querySelectorAll(

            ".sidebar-item"

        )

        .forEach(

            item=>{

                item.addEventListener(

                    "click",

                    ()=>{

                        const folder=

                            item.dataset.folder;

                        if(folder){

                            switchFolder(

                                folder

                            );

                        }

                    }

                );

            }

        );

}

/*==========================================================
    READER
==========================================================*/

function initializeReader(){

    document

        .querySelectorAll(

            ".reader-actions button"

        )

        .forEach(

            button=>{

                button.addEventListener(

                    "click",

                    handleReaderAction

                );

            }

        );

}

function handleReaderAction(event){

    const action=

        event.currentTarget.dataset.action;

    switch(action){

        case"archive":

            archiveCurrentEmail();

            break;

        case"delete":

            showDeleteDialog(

                deleteCurrentEmail

            );

            break;

        case"star":

            starCurrentEmail();

            break;

        case"reply":

            replyToCurrent();

            break;

        case"forward":

            forwardCurrent();

            break;

    }

}

/*==========================================================
    COMPOSE BUTTONS
==========================================================*/

function initializeComposeButtons(){

    document

        .querySelector(

            ".send"

        )

        ?.addEventListener(

            "click",

            sendCurrentEmail

        );

    document

        .querySelector(

            ".attach-button"

        )

        ?.addEventListener(

            "click",

            openAttachmentPicker

        );

    document

        .querySelector(

            ".minimize"

        )

        ?.addEventListener(

            "click",

            minimizeCompose

        );

    document

        .querySelector(

            ".maximize"

        )

        ?.addEventListener(

            "click",

            maximizeCompose

        );

}

/*==========================================================
    FILE PICKER
==========================================================*/

function openAttachmentPicker(){

    const input=

        document.createElement(

            "input"

        );

    input.type="file";

    input.multiple=true;

    input.onchange=()=>{

        for(

            const file

            of

            input.files

        ){

            addAttachment(

                file

            );

        }

    };

    input.click();

}

/*==========================================================
    REPLY
==========================================================*/

function replyToCurrent(){

    if(

        !state.selectedEmail

    ){

        return;

    }

    openCompose();

    compose.to=

        state.selectedEmail.email;

    compose.subject=

        "Re: "+state.selectedEmail.subject;

    ui.composeTo.value=

        compose.to;

    ui.composeSubject.value=

        compose.subject;

}

/*==========================================================
    FORWARD
==========================================================*/

function forwardCurrent(){

    if(

        !state.selectedEmail

    ){

        return;

    }

    openCompose();

    compose.subject=

        "Fwd: "+state.selectedEmail.subject;

    ui.composeSubject.value=

        compose.subject;

    ui.composeEditor.innerHTML=

        "<br><br><hr><br>"+

        state.selectedEmail.body;

}

/*==========================================================
    PROFILE
==========================================================*/

function initializeProfile(){

    document

        .querySelector(

            ".profile-avatar"

        )

        ?.addEventListener(

            "click",

            event=>{

                event.stopPropagation();

                toggleProfileMenu();

            }

        );

}

/*==========================================================
    STARTUP
==========================================================*/

async function startApplication(){

    initializeSidebar();

    initializeReader();

    initializeComposeButtons();

    initializeProfile();

    initializeEditor();

    registerToolbar();

    await loadAccount();

    await loadLabels();

    await loadFolder(

        "inbox"

    );

    showToast(

        "CosmiMail",

        "Ready."

    );

}

/*==========================================================
    WINDOW LOAD
==========================================================*/

window.addEventListener(

    "load",

    ()=>{

        startApplication();

    }

);

/*==========================================================
    FUTURE
==========================================================*/

/*

Future ideas:

- Multiple Gmail accounts

- Outlook provider

- Yahoo provider

- Drag mails between folders

- Offline cache

- Background sync

- AI email summaries

- Smart categories

- Rules engine

- Scheduled send

*/

/*==========================================================
    PART 12 — BACKEND WIRING & CLEANUP
==========================================================*/

/*==========================================================
    SAFE API
==========================================================*/

async function safeRequest(request){

    try{

        return await request();

    }

    catch(error){

        console.error(error);

        hideSpinner();

        showToast(

            "Connection Error",

            "Unable to reach the server."

        );

        return null;

    }

}

/*==========================================================
    LOAD ACCOUNT
==========================================================*/

async function loadAccount(){

    const response=

        await safeRequest(

            ()=>apiRequest(

                "/api/me"

            )

        );

    if(

        !response

    ){

        return;

    }

    state.currentUser=response;

    renderCurrentUser();

}

/*==========================================================
    LOAD LABELS
==========================================================*/

async function loadLabels(){

    const labels=

        await safeRequest(

            ()=>apiRequest(

                "/api/gmail/labels"

            )

        );

    if(!labels){

        return;

    }

    state.labels=labels;

}

/*==========================================================
    LOAD EMAIL
==========================================================*/

async function openEmail(id){

    const mail=

        await safeRequest(

            ()=>apiRequest(

                `/api/gmail/email/${id}`

            )

        );

    if(!mail){

        return;

    }

    state.selectedEmail=mail;

    renderReader();

}

/*==========================================================
    REFRESH
==========================================================*/

async function refreshInbox(){

    showSpinner(

        "Refreshing..."

    );

    await loadFolder(

        state.currentFolder

    );

    hideSpinner();

}

/*==========================================================
    SIDEBAR COUNTS
==========================================================*/

function updateFolderCounts(){

    document

        .querySelector(

            ".badge"

        )

        .textContent=

            state.filteredEmails

            .filter(

                mail=>!mail.read

            )

            .length;

}

/*==========================================================
    EMPTY STATES
==========================================================*/

function showEmptyReader(){

    ui.readerTitle.textContent=

        "Select an email";

    ui.readerBody.innerHTML=`

        <div class="empty-state">

            <i class="fa-regular fa-envelope-open"></i>

            <h2>

                No email selected

            </h2>

            <p>

                Choose an email from the inbox.

            </p>

        </div>

    `;

}

function showEmptyInbox(){

    ui.emailList.innerHTML=`

        <div class="empty-state">

            <i class="fa-regular fa-folder-open"></i>

            <h2>

                Nothing here

            </h2>

            <p>

                This folder is empty.

            </p>

        </div>

    `;

}

/*==========================================================
    UTILITIES
==========================================================*/

function escapeHTML(text){

    const div=

        document.createElement(

            "div"

        );

    div.textContent=text;

    return div.innerHTML;

}

function formatDate(date){

    return new Date(

        date

    ).toLocaleString();

}

/*==========================================================
    LOGGING
==========================================================*/

function debug(...args){

    console.log(

        "[CosmiMail]",

        ...args

    );

}

/*==========================================================
    STARTUP
==========================================================*/

async function boot(){

    debug(

        "Booting..."

    );

    await startApplication();

    debug(

        "Ready."

    );

}

window.addEventListener(

    "load",

    boot

);

/*==========================================================
    PART 13 — RELEASE BUILD
==========================================================*/

/*==========================================================
    VERSION
==========================================================*/

const APP={

    name:"CosmiMail",

    version:"2.0.0-alpha",

    company:"Cosmiway Labs"

};

/*==========================================================
    PERFORMANCE
==========================================================*/

function beginPerformance(){

    console.time(

        "CosmiMail Startup"

    );

}

function endPerformance(){

    console.timeEnd(

        "CosmiMail Startup"

    );

}

/*==========================================================
    ERROR HANDLER
==========================================================*/

window.addEventListener(

    "error",

    event=>{

        console.error(

            event.error

        );

        showToast(

            "Unexpected Error",

            "Something went wrong."

        );

    }

);

window.addEventListener(

    "unhandledrejection",

    event=>{

        console.error(

            event.reason

        );

        showToast(

            "Request Failed",

            "Please try again."

        );

    }

);

/*==========================================================
    CLEANUP
==========================================================*/

function cleanup(){

    closeAllMenus();

    closeDialog();

}

/*==========================================================
    VISIBILITY
==========================================================*/

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            document.hidden

        ){

            saveWindowState();

        }

    }

);

/*==========================================================
    BEFORE UNLOAD
==========================================================*/

window.addEventListener(

    "beforeunload",

    ()=>{

        saveWindowState();

    }

);

/*==========================================================
    HEALTH CHECK
==========================================================*/

function verifyDOM(){

    const required=[

        ui.emailList,

        ui.readerBody,

        ui.composeWindow,

        ui.composeEditor,

        ui.settingsPage,

        ui.spinner,

        ui.toast,

        ui.dialog

    ];

    const missing=

        required.filter(

            element=>!element

        );

    if(

        missing.length

    ){

        console.warn(

            "Missing DOM elements:",

            missing.length

        );

    }

}

/*==========================================================
    APPLICATION READY
==========================================================*/

async function initializeApplication(){

    beginPerformance();

    verifyDOM();

    cleanup();

    await boot();

    endPerformance();

    console.log(

`================================================

 ${APP.name}

 Version ${APP.version}

 ${APP.company}

 Frontend Ready.

================================================`

    );

}

/*==========================================================
    START
==========================================================*/

window.addEventListener(

    "DOMContentLoaded",

    initializeApplication

);

/*==========================================================
    END OF FILE
==========================================================*/

