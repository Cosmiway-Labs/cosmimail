/*==========================================================
    COSMIMAIL V3
    Built by Cosmiway Labs

    PART 1 — FOUNDATION
==========================================================*/

/*==========================================================
    CONFIG
==========================================================*/

const CONFIG = {

    apiBase: "https://starfielddatabase.pythonanywhere.com",

    inboxPageSize: 20,

    toastDuration: 2600

};

/*==========================================================
    GLOBAL STATE
==========================================================*/

const state = {

    initialized: false,

    loading: false,

    loadingMore: false,

    currentFolder: "inbox",

    currentUser: null,

    selectedEmail: null,

    searchQuery: "",

    emails: [],

    filteredEmails: [],

    nextPageToken: null

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

    readerTitle: document.querySelector(".reader-title"),

    readerBody: document.getElementById("readerBody"),

    searchInput: document.getElementById("searchInput"),

    composeWindow: document.getElementById("composeWindow"),

    composeTo: document.getElementById("composeTo"),

    composeSubject: document.getElementById("composeSubject"),

    composeEditor: document.getElementById("composeEditor"),

    settingsPage: document.getElementById("settingsPage"),

    settingsContent: document.getElementById("settingsContent"),

    spinner: document.getElementById("spinner"),

    toast: document.getElementById("toast"),

    dialog: document.getElementById("dialogOverlay"),

    profileMenu: document.getElementById("profileMenu"),

    contextMenu: document.getElementById("contextMenu")

};

/*==========================================================
    UTILITIES
==========================================================*/

function debug(...args){

    console.log(

        "[CosmiMail]",

        ...args

    );

}

function escapeHTML(text){

    const div = document.createElement(

        "div"

    );

    div.textContent = text ?? "";

    return div.innerHTML;

}

function formatDate(date){

    if(!date){

        return "";

    }

    return new Date(date)

        .toLocaleString();

}

/*==========================================================
    API
==========================================================*/

async function apiRequest(

    endpoint,

    options = {}

){

    const response = await fetch(

        CONFIG.apiBase + endpoint,

        {

            credentials: "include",

            headers: {

                "Content-Type":

                    "application/json"

            },

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
    STARTUP
==========================================================*/

async function startApplication(){

    if(

        state.initialized

    ){

        return;

    }

    state.initialized = true;

    debug(

        "Starting CosmiMail..."

    );

}
/*==========================================================
    PART 2 — INITIALIZATION
==========================================================*/

/*==========================================================
    VERIFY DOM
==========================================================*/

function verifyDOM(){

    const required = [

        ui.emailList,

        ui.readerBody,

        ui.readerTitle,

        ui.searchInput,

        ui.composeWindow,

        ui.composeEditor,

        ui.settingsPage,

        ui.spinner,

        ui.toast,

        ui.dialog

    ];

    const missing = required.filter(

        element => !element

    );

    if(

        missing.length

    ){

        console.warn(

            `Missing ${missing.length} required DOM element(s).`

        );

    }

}

/*==========================================================
    REGISTER EVENTS
==========================================================*/

function registerEvents(){

    ui.searchInput?.addEventListener(

        "input",

        handleSearch

    );

    document.addEventListener(

        "keydown",

        handleKeyboardShortcuts

    );

}

/*==========================================================
    INITIALIZE UI
==========================================================*/

function initializeUI(){

    hideSpinner();

    hideToast();

    closeDialog();

    closeAllMenus();

}

/*==========================================================
    START APPLICATION
==========================================================*/

async function startApplication(){

    if(

        state.initialized

    ){

        return;

    }

    state.initialized = true;

    debug(

        "Starting CosmiMail..."

    );

    verifyDOM();

    initializeUI();

    registerEvents();

    await loadAccount();

    await loadFolder(

        "inbox"

    );

    debug(

        "CosmiMail Ready."

    );

}

/*==========================================================
    START
==========================================================*/

window.addEventListener(

    "DOMContentLoaded",

    startApplication

);

/*==========================================================
    PART 3 — INBOX ENGINE
==========================================================*/

/*==========================================================
    LOAD FOLDER
==========================================================*/

async function loadFolder(folder){

    if(

        state.loading

    ){

        return;

    }

    state.loading = true;

    state.currentFolder = folder;

    state.nextPageToken = null;

    state.emails = [];

    state.filteredEmails = [];

    showSpinner(

        "Loading..."

    );

    showSkeletons();

    try{

        const response = await apiRequest(

            `/api/gmail/messages?label=${getFolderLabel(folder)}`

        );

        state.emails =

            response.emails || [];

        state.filteredEmails =

            [...state.emails];

        state.nextPageToken =

            response.nextPageToken || null;

        renderInbox();

    }

    catch(error){

        console.error(

            error

        );

        showToast(

            "Inbox",

            "Unable to load emails."

        );

    }

    finally{

        state.loading = false;

        hideSkeletons();

        hideSpinner();

    }

}

/*==========================================================
    LOAD MORE EMAILS
==========================================================*/

async function loadMoreEmails(){

    if(

        state.loadingMore ||

        !state.nextPageToken

    ){

        return;

    }

    state.loadingMore = true;

    try{

        const response = await apiRequest(

            `/api/gmail/messages?label=${getFolderLabel(state.currentFolder)}&pageToken=${state.nextPageToken}`

        );

        state.emails.push(

            ...response.emails

        );

        filterEmails();

        state.nextPageToken =

            response.nextPageToken || null;

        renderInbox();

    }

    catch(error){

        console.error(

            error

        );

    }

    finally{

        state.loadingMore = false;

    }

}

/*==========================================================
    FILTER EMAILS
==========================================================*/

function filterEmails(){

    const query =

        state.searchQuery;

    if(

        query === ""

    ){

        state.filteredEmails =

            [...state.emails];

        return;

    }

    state.filteredEmails =

        state.emails.filter(

            email =>

                email.subject

                    ?.toLowerCase()

                    .includes(query)

                ||

                email.from

                    ?.toLowerCase()

                    .includes(query)

                ||

                email.snippet

                    ?.toLowerCase()

                    .includes(query)

        );

}

/*==========================================================
    SEARCH
==========================================================*/

function handleSearch(event){

    state.searchQuery =

        event.target.value

        .trim()

        .toLowerCase();

    filterEmails();

    renderInbox();

}

/*==========================================================
    RENDER INBOX
==========================================================*/

function renderInbox(){

    ui.emailList.innerHTML = "";

    if(

        state.filteredEmails.length === 0

    ){

        showEmptyInbox();

        return;

    }

    state.filteredEmails.forEach(

        renderEmailCard

    );

}

/*==========================================================
    EMAIL CARD
==========================================================*/

function renderEmailCard(email){

    const card =

        document.createElement(

            "div"

        );

    card.className =

        "mail-item";

    card.innerHTML = `

        <div class="mail-header">

            <div class="mail-from">

                ${escapeHTML(email.from)}

            </div>

            <div class="mail-time">

                ${escapeHTML(email.date)}

            </div>

        </div>

        <div class="mail-subject">

            ${escapeHTML(email.subject)}

        </div>

        <div class="mail-preview">

            ${escapeHTML(email.snippet)}

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
    FOLDER LABELS
==========================================================*/

function getFolderLabel(folder){

    switch(folder){

        case "sent":

            return "SENT";

        case "trash":

            return "TRASH";

        case "starred":

            return "STARRED";

        default:

            return "INBOX";

    }

}

/*==========================================================
    PART 4 — INFINITE SCROLL
==========================================================*/

/*==========================================================
    SCROLL OBSERVER
==========================================================*/

let inboxObserver = null;

/*==========================================================
    INITIALIZE
==========================================================*/

function initializeInfiniteScroll(){

    if(

        inboxObserver

    ){

        inboxObserver.disconnect();

    }

    const sentinel =

        document.createElement(

            "div"

        );

    sentinel.id =

        "inboxSentinel";

    ui.emailList.appendChild(

        sentinel

    );

    inboxObserver =

        new IntersectionObserver(

            handleInfiniteScroll,

            {

                root: ui.inbox,

                rootMargin: "250px",

                threshold: 0

            }

        );

    inboxObserver.observe(

        sentinel

    );

}

/*==========================================================
    CALLBACK
==========================================================*/

function handleInfiniteScroll(entries){

    const entry =

        entries[0];

    if(

        !entry.isIntersecting

    ){

        return;

    }

    loadMoreEmails();

}

/*==========================================================
    REFRESH OBSERVER
==========================================================*/

function refreshInfiniteScroll(){

    inboxObserver?.disconnect();

    initializeInfiniteScroll();

}

/*==========================================================
    PART 5 — READER ENGINE
==========================================================*/

/*==========================================================
    OPEN EMAIL
==========================================================*/

async function openEmail(id){

    if(

        state.loading

    ){

        return;

    }

    state.loading = true;

    showSpinner(

        "Opening..."

    );

    try{

        const email = await apiRequest(

            `/api/gmail/email/${id}`

        );

        state.selectedEmail = email;

        renderReader();

        highlightSelectedEmail(id);

    }

    catch(error){

        console.error(

            error

        );

        showToast(

            "Reader",

            "Unable to open email."

        );

    }

    finally{

        state.loading = false;

        hideSpinner();

    }

}

/*==========================================================
    RENDER READER
==========================================================*/

function renderReader(){

    const email =

        state.selectedEmail;

    if(

        !email

    ){

        showEmptyReader();

        return;

    }

    ui.readerTitle.textContent =

        email.subject;

    ui.readerBody.innerHTML = `

        <article class="email">

            <h1 class="email-subject">

                ${escapeHTML(email.subject)}

            </h1>

            <div class="email-meta">

                <div class="email-sender">

                    <div class="sender-avatar">

                        ${escapeHTML(

                            email.from.charAt(0)

                        )}

                    </div>

                    <div class="sender-details">

                        <div class="sender-name">

                            ${escapeHTML(

                                email.from

                            )}

                        </div>

                        <div class="sender-email">

                            ${escapeHTML(

                                email.to || ""

                            )}

                        </div>

                    </div>

                </div>

                <div class="email-date">

                    ${escapeHTML(

                        email.date

                    )}

                </div>

            </div>

            <div class="email-divider"></div>

            <div class="email-content">

                ${email.body}

            </div>

        </article>

    `;

}

/*==========================================================
    HIGHLIGHT
==========================================================*/

function highlightSelectedEmail(id){

    document

        .querySelectorAll(

            ".mail-item"

        )

        .forEach(

            card =>

                card.classList.remove(

                    "active"

                )

        );

    const index =

        state.filteredEmails.findIndex(

            email =>

                email.id === id

        );

    if(

        index === -1

    ){

        return;

    }

    ui.emailList.children[index]

        ?.classList.add(

            "active"

        );

}

/*==========================================================
    EMPTY READER
==========================================================*/

function showEmptyReader(){

    ui.readerTitle.textContent =

        "Select an email";

    ui.readerBody.innerHTML = `

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

/*==========================================================
    PART 6 — COMPOSE ENGINE
==========================================================*/

/*==========================================================
    OPEN
==========================================================*/

function openCompose(){

    state.compose.open = true;

    state.compose.minimized = false;

    ui.composeWindow.classList.remove(

        "hidden",

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

    if(

        hasDraft()

    ){

        showDiscardDialog();

        return;

    }

    resetCompose();

}

/*==========================================================
    RESET
==========================================================*/

function resetCompose(){

    state.compose = {

        open: false,

        minimized: false,

        maximized: false,

        to: "",

        cc: "",

        bcc: "",

        subject: "",

        body: "",

        attachments: []

    };

    ui.composeWindow.className =

        "compose-window hidden";

    ui.composeTo.value = "";

    ui.composeSubject.value = "";

    ui.composeEditor.innerHTML = "";

}

/*==========================================================
    MINIMIZE
==========================================================*/

function minimizeCompose(){

    state.compose.minimized = true;

    ui.composeWindow.classList.add(

        "minimized"

    );

}

/*==========================================================
    MAXIMIZE
==========================================================*/

function maximizeCompose(){

    state.compose.maximized =

        !state.compose.maximized;

    ui.composeWindow.classList.toggle(

        "maximized"

    );

}

/*==========================================================
    SAVE DRAFT
==========================================================*/

function saveDraft(){

    state.compose.to =

        ui.composeTo.value;

    state.compose.subject =

        ui.composeSubject.value;

    state.compose.body =

        ui.composeEditor.innerHTML;

}

/*==========================================================
    HAS DRAFT
==========================================================*/

function hasDraft(){

    return(

        state.compose.to ||

        state.compose.subject ||

        state.compose.body ||

        state.compose.attachments.length

    );

}

/*==========================================================
    PART 7 — SETTINGS ENGINE
==========================================================*/

/*==========================================================
    OPEN SETTINGS
==========================================================*/

function openSettings(){

    ui.settingsPage.classList.remove(

        "hidden"

    );

    renderSettings();

}

/*==========================================================
    CLOSE SETTINGS
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

    state.settings.page = page;

    document

        .querySelectorAll(

            ".settings-item"

        )

        .forEach(

            item =>

                item.classList.toggle(

                    "active",

                    item.dataset.page === page

                )

        );

    renderSettings();

}

/*==========================================================
    RENDER SETTINGS
==========================================================*/

function renderSettings(){

    switch(

        state.settings.page

    ){

        case "general":

            renderGeneralSettings();

            break;

        case "appearance":

            renderAppearanceSettings();

            break;

        case "accounts":

            renderAccountSettings();

            break;

        case "notifications":

            renderNotificationSettings();

            break;

        case "shortcuts":

            renderShortcutSettings();

            break;

        case "about":

            renderAboutSettings();

            break;

    }

}

/*==========================================================
    PART 8 — DIALOGS, TOASTS & FLOATING UI
==========================================================*/

/*==========================================================
    TOAST
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

    toastTimer = setTimeout(

        hideToast,

        CONFIG.toastDuration

    );

}

function hideToast(){

    ui.toast.classList.remove(

        "show"

    );

}

/*==========================================================
    DIALOG
==========================================================*/

function showDialog({

    title,

    subtitle,

    confirmText = "Continue",

    cancelText = "Cancel",

    onConfirm = null

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

    document.getElementById(

        "dialogConfirm"

    ).onclick = ()=>{

        closeDialog();

        onConfirm?.();

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

            "Unsaved changes will be lost.",

        confirmText:

            "Discard",

        onConfirm:

            resetCompose

    });

}

function showDeleteDialog(){

    showDialog({

        title:

            "Delete email?",

        subtitle:

            "This email will be moved to Trash.",

        confirmText:

            "Delete",

        onConfirm:

            deleteCurrentEmail

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

        onConfirm:

            signOut

    });

}

/*==========================================================
    MENUS
==========================================================*/

function closeAllMenus(){

    ui.profileMenu.classList.add(

        "hidden"

    );

    ui.contextMenu.classList.add(

        "hidden"

    );

}

function toggleProfileMenu(){

    const hidden =

        ui.profileMenu.classList.contains(

            "hidden"

        );

    closeAllMenus();

    if(

        hidden

    ){

        ui.profileMenu.classList.remove(

            "hidden"

        );

    }

}

function openContextMenu(event){

    const card =

        event.target.closest(

            ".mail-item"

        );

    if(

        !card

    ){

        return;

    }

    event.preventDefault();

    closeAllMenus();

    ui.contextMenu.style.left =

        `${event.clientX}px`;

    ui.contextMenu.style.top =

        `${event.clientY}px`;

    ui.contextMenu.classList.remove(

        "hidden"

    );

}

/*==========================================================
    PART 9 — APPLICATION CONTROLLER
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

                        const folder =

                            item.dataset.folder;

                        if(

                            !folder ||

                            folder === state.currentFolder

                        ){

                            return;

                        }

                        loadFolder(

                            folder

                        );

                    }

                );

            }

        );

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
    READER ACTIONS
==========================================================*/

function initializeReaderActions(){

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

    switch(

        event.currentTarget.dataset.action

    ){

        case "reply":

            replyToCurrent();

            break;

        case "forward":

            forwardCurrent();

            break;

        case "archive":

            archiveCurrentEmail();

            break;

        case "delete":

            showDeleteDialog();

            break;

        case "star":

            starCurrentEmail();

            break;

    }

}

/*==========================================================
    KEYBOARD SHORTCUTS
==========================================================*/

function handleKeyboardShortcuts(event){

    const ctrl =

        event.ctrlKey ||

        event.metaKey;

    const key =

        event.key.toLowerCase();

    if(

        ctrl &&

        key === "n"

    ){

        event.preventDefault();

        openCompose();

        return;

    }

    if(

        ctrl &&

        key === "f"

    ){

        event.preventDefault();

        ui.searchInput.focus();

        ui.searchInput.select();

        return;

    }

    if(

        ctrl &&

        key === "r"

    ){

        event.preventDefault();

        loadFolder(

            state.currentFolder

        );

        return;

    }

    if(

        ctrl &&

        key === "."

    ){

        event.preventDefault();

        openSettings();

        return;

    }

    if(

        event.key === "Escape"

    ){

        closeAllMenus();

        closeDialog();

        return;

    }

}

/*==========================================================
    INITIALIZE CONTROLLERS
==========================================================*/

function initializeControllers(){

    initializeSidebar();

    initializeProfile();

    initializeReaderActions();

}

/*==========================================================
    PART 10 — RICH TEXT EDITOR
==========================================================*/

/*==========================================================
    COMMANDS
==========================================================*/

const editorCommands = {

    bold: "bold",

    italic: "italic",

    underline: "underline",

    strike: "strikeThrough",

    ordered: "insertOrderedList",

    unordered: "insertUnorderedList",

    left: "justifyLeft",

    center: "justifyCenter",

    right: "justifyRight",

    clear: "removeFormat"

};

/*==========================================================
    SELECTION
==========================================================*/

let editorSelection = null;

function saveEditorSelection(){

    const selection =

        window.getSelection();

    if(

        selection.rangeCount

    ){

        editorSelection =

            selection.getRangeAt(0);

    }

}

function restoreEditorSelection(){

    if(

        !editorSelection

    ){

        return;

    }

    const selection =

        window.getSelection();

    selection.removeAllRanges();

    selection.addRange(

        editorSelection

    );

}

/*==========================================================
    FORMAT
==========================================================*/

function applyEditorCommand(command){

    restoreEditorSelection();

    document.execCommand(

        command,

        false,

        null

    );

    saveEditorSelection();

    ui.composeEditor.focus();

}

/*==========================================================
    LINK
==========================================================*/

function insertLink(){

    const url =

        prompt(

            "Enter URL"

        );

    if(

        !url

    ){

        return;

    }

    restoreEditorSelection();

    document.execCommand(

        "createLink",

        false,

        url

    );

}

/*==========================================================
    IMAGE
==========================================================*/

function insertImage(){

    const url =

        prompt(

            "Image URL"

        );

    if(

        !url

    ){

        return;

    }

    restoreEditorSelection();

    document.execCommand(

        "insertImage",

        false,

        url

    );

}

/*==========================================================
    TOOLBAR
==========================================================*/

function initializeToolbar(){

    document

        .querySelectorAll(

            "[data-command]"

        )

        .forEach(

            button=>{

                button.addEventListener(

                    "click",

                    ()=>{

                        const command =

                            button.dataset.command;

                        if(

                            command === "link"

                        ){

                            insertLink();

                            return;

                        }

                        if(

                            command === "image"

                        ){

                            insertImage();

                            return;

                        }

                        applyEditorCommand(

                            editorCommands[command]

                        );

                    }

                );

            }

        );

}

/*==========================================================
    ATTACHMENTS
==========================================================*/

function initializeAttachments(){

    ui.composeEditor.addEventListener(

        "paste",

        handlePaste

    );

    ui.composeEditor.addEventListener(

        "drop",

        handleDrop

    );

    ui.composeEditor.addEventListener(

        "dragover",

        event=>{

            event.preventDefault();

        }

    );

}

function handlePaste(event){

    for(

        const item

        of

        event.clipboardData.items

    ){

        if(

            item.type.startsWith(

                "image"

            )

        ){

            addAttachment(

                item.getAsFile()

            );

        }

    }

}

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
    INITIALIZE
==========================================================*/

function initializeEditor(){

    ui.composeEditor.addEventListener(

        "mouseup",

        saveEditorSelection

    );

    ui.composeEditor.addEventListener(

        "keyup",

        saveEditorSelection

    );

    initializeToolbar();

    initializeAttachments();

}

/*==========================================================
    PART 11 — WINDOW ENGINE & APPLICATION
==========================================================*/

/*==========================================================
    WINDOW STATE
==========================================================*/

const windowState = {

    dragging: false,

    startX: 0,

    startY: 0,

    left: 0,

    top: 0

};

/*==========================================================
    DRAGGING
==========================================================*/

function beginWindowDrag(event){

    if(

        state.compose.maximized

    ){

        return;

    }

    windowState.dragging = true;

    const rect =

        ui.composeWindow.getBoundingClientRect();

    windowState.startX =

        event.clientX;

    windowState.startY =

        event.clientY;

    windowState.left =

        rect.left;

    windowState.top =

        rect.top;

}

function dragWindow(event){

    if(

        !windowState.dragging

    ){

        return;

    }

    const dx =

        event.clientX -

        windowState.startX;

    const dy =

        event.clientY -

        windowState.startY;

    ui.composeWindow.style.left =

        `${windowState.left + dx}px`;

    ui.composeWindow.style.top =

        `${windowState.top + dy}px`;

}

function endWindowDrag(){

    windowState.dragging = false;

}

/*==========================================================
    SAVE WINDOW
==========================================================*/

function saveWindow(){

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

function restoreWindow(){

    const saved =

        localStorage.getItem(

            "composeWindow"

        );

    if(

        !saved

    ){

        return;

    }

    const windowData =

        JSON.parse(saved);

    Object.assign(

        ui.composeWindow.style,

        windowData

    );

}

/*==========================================================
    ERROR HANDLING
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

window.addEventListener(

    "beforeunload",

    saveWindow

);

/*==========================================================
    APPLICATION STARTUP
==========================================================*/

window.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        verifyDOM();

        initializeControllers();

        initializeEditor();

        initializeUI();

        restoreWindow();

        await startApplication();

    }

);

