// ======================================================
// COSMIMAIL
// STARFIELD ENGINE
// ======================================================

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let W;
let H;

const stars = [];
const mouse = {
    x: 0,
    y: 0
};

const STAR_COUNT = 420;

// ======================================================

function resize(){

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;

}

window.addEventListener("resize", resize);

resize();

// ======================================================

class Star{

    constructor(){

        this.reset();

    }

    reset(){

        this.x = Math.random()*W;

        this.y = Math.random()*H;

        this.size =
            Math.random()*2+0.3;

        this.depth =
            Math.random()*1.2+0.2;

        this.alpha =
            Math.random();

        this.twinkle =
            Math.random()*0.015+0.003;

        this.speed =
            Math.random()*0.08+0.02;

    }

    update(){

        this.alpha+=this.twinkle;

        if(this.alpha>1){

            this.alpha=1;

            this.twinkle*=-1;

        }

        if(this.alpha<0.2){

            this.alpha=0.2;

            this.twinkle*=-1;

        }

        this.y+=this.speed;

        if(this.y>H+10){

            this.y=-10;

            this.x=Math.random()*W;

        }

    }

    draw(){

        const px=
            this.x+
            (mouse.x-W/2)*0.0009*this.depth;

        const py=
            this.y+
            (mouse.y-H/2)*0.0009*this.depth;

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            this.size,
            0,
            Math.PI*2
        );

        ctx.fillStyle=
            `rgba(255,255,255,${this.alpha})`;

        ctx.shadowBlur=12;

        ctx.shadowColor="#ffffff";

        ctx.fill();

    }

}

// ======================================================

for(let i=0;i<STAR_COUNT;i++){

    stars.push(
        new Star()
    );

}

// ======================================================

window.addEventListener(

    "mousemove",

    e=>{

        mouse.x=e.clientX;

        mouse.y=e.clientY;

    }

);

// ======================================================
// SHOOTING STARS
// ======================================================

const meteors=[];

class Meteor{

    constructor(){

        this.reset();

    }

    reset(){

        this.active=false;

        this.wait=
            Math.random()*600+200;

        this.x=
            Math.random()*W*1.5;

        this.y=-150;

        this.length=
            120+Math.random()*180;

        this.speed=
            10+Math.random()*8;

    }

    update(){

        if(!this.active){

            this.wait--;

            if(this.wait<0){

                this.active=true;

            }

            return;

        }

        this.x-=this.speed;

        this.y+=this.speed;

        if(

            this.x<-300 ||

            this.y>H+300

        ){

            this.reset();

        }

    }

    draw(){

        if(!this.active)
            return;

        const g=

            ctx.createLinearGradient(

                this.x,

                this.y,

                this.x+this.length,

                this.y-this.length

            );

        g.addColorStop(

            0,

            "rgba(255,255,255,.9)"

        );

        g.addColorStop(

            1,

            "rgba(255,255,255,0)"

        );

        ctx.beginPath();

        ctx.moveTo(
            this.x,
            this.y
        );

        ctx.lineTo(
            this.x+this.length,
            this.y-this.length
        );

        ctx.strokeStyle=g;

        ctx.lineWidth=2;

        ctx.stroke();

    }

}

for(let i=0;i<4;i++){

    meteors.push(

        new Meteor()

    );

}

// ======================================================

function animate(){

    ctx.clearRect(

        0,

        0,

        W,

        H

    );

    for(const star of stars){

        star.update();

        star.draw();

    }

    for(const meteor of meteors){

        meteor.update();

        meteor.draw();

    }

    requestAnimationFrame(

        animate

    );

}


// ======================================================
// COSMIMAIL APP
// ======================================================

const API_BASE =
"https://starfielddatabase.pythonanywhere.com";

let currentUser = null;
let inbox = [];

// ======================================================

async function api(url){

    const response = await fetch(

        API_BASE + url,

        {

            credentials:"include"

        }

    );

    if(!response.ok){

        throw new Error(

            await response.text()

        );

    }

    return response.json();

}

// ======================================================

async function loadUser(){

    currentUser =

        await api("/api/me");

    document.getElementById(

        "username"

    ).textContent =

        currentUser.name;

    document.getElementById(

        "useremail"

    ).textContent =

        currentUser.email;

    document.querySelector(

        ".avatar"

    ).textContent =

        currentUser.name

            .charAt(0)

            .toUpperCase();

}

// ======================================================

async function loadInbox(){

    const loading =

        document.getElementById(

            "loading"

        );

    loading.classList.remove(

        "hidden"

    );

    const data =

        await api(

            "/api/gmail/inbox"

        );

    inbox = data;

    loading.classList.add(

        "hidden"

    );

    renderInbox();

}

// ======================================================

function senderName(from){

    if(!from)

        return "";

    if(from.includes("<"))

        return from

            .split("<")[0]

            .trim();

    return from;

}

// ======================================================

function shortDate(date){

    return new Date(date)

        .toLocaleDateString(

            undefined,

            {

                month:"short",

                day:"numeric"

            }

        );

}

// ======================================================

function renderInbox(){

    const container =

        document.getElementById(

            "inbox"

        );

    container.innerHTML="";

    document.getElementById(

        "mail-count"

    ).textContent =

        inbox.length +

        " emails";

    for(const email of inbox){

        const card =

            document

            .getElementById(

                "email-template"

            )

            .content

            .firstElementChild

            .cloneNode(true);

        card.dataset.id =

            email.id;

        card.querySelector(

            ".sender"

        ).textContent =

            senderName(

                email.from

            );

        card.querySelector(

            ".subject"

        ).textContent =

            email.subject ||

            "(No Subject)";

        card.querySelector(

            ".snippet"

        ).textContent =

            email.snippet;

        card.querySelector(

            ".email-date"

        ).textContent =

            shortDate(

                email.date

            );

        card.addEventListener(

            "click",

            ()=>{

                openEmail(

                    email.id,

                    card

                );

            }

        );

        container.appendChild(

            card

        );

    }

}

// ======================================================

document

    .getElementById(

        "search"

    )

    .addEventListener(

        "input",

        e=>{

            const q =

                e.target.value

                .toLowerCase();

            document

                .querySelectorAll(

                    ".email-card"

                )

                .forEach(card=>{

                    const text =

                        card.innerText

                        .toLowerCase();

                    card.style.display =

                        text.includes(q)

                        ? ""

                        : "none";

                });

        }

    );

// ======================================================

async function init(){

    try{

        await loadUser();

        await loadInbox();

    }

    catch(err){

        console.error(err);

    }

}

window.addEventListener(

    "DOMContentLoaded",

    init

);


animate();
