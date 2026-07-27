// =====================================================
// STARFIELD ENGINE
// =====================================================

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];

const STAR_COUNT = 350;

const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
};

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

// =====================================================

class Star {

    constructor() {

        this.reset();

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

    }

    reset() {

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.radius = Math.random() * 1.8 + 0.2;

        this.alpha = Math.random();

        this.speed = Math.random() * 0.12 + 0.02;

        this.twinkle = Math.random() * 0.02 + 0.002;

        this.depth = Math.random() * 1 + 0.2;

    }

    update() {

        this.alpha += this.twinkle;

        if (this.alpha >= 1 || this.alpha <= 0.2) {

            this.twinkle *= -1;

        }

        this.y += this.speed;

        if (this.y > canvas.height + 10) {

            this.y = -10;
            this.x = Math.random() * canvas.width;

        }

    }

    draw() {

        const offsetX =
            (mouse.x - canvas.width / 2)
            * 0.0008
            * this.depth;

        const offsetY =
            (mouse.y - canvas.height / 2)
            * 0.0008
            * this.depth;

        ctx.beginPath();

        ctx.arc(
            this.x + offsetX,
            this.y + offsetY,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(255,255,255,${this.alpha})`;

        ctx.shadowBlur = 12;

        ctx.shadowColor = "#ffffff";

        ctx.fill();

    }

}

// =====================================================

for (let i = 0; i < STAR_COUNT; i++) {

    stars.push(new Star());

}

// =====================================================

window.addEventListener("mousemove", e => {

    mouse.x = e.clientX;
    mouse.y = e.clientY;

});

// =====================================================

function animateStarfield() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (const star of stars) {

        star.update();

        star.draw();

    }

    requestAnimationFrame(
        animateStarfield
    );

}

// =====================================================
// SHOOTING STARS
// =====================================================

const shootingStars = [];

class ShootingStar {

    constructor() {
        this.reset();
    }

    reset() {

        this.x = Math.random() * canvas.width * 1.5;

        this.y = -100;

        this.length = 120 + Math.random() * 180;

        this.speed = 12 + Math.random() * 10;

        this.opacity = .5 + Math.random() * .5;

        this.active = false;

        this.wait =
            Math.random() * 700 + 250;

    }

    update() {

        if (!this.active) {

            this.wait--;

            if (this.wait <= 0)
                this.active = true;

            return;

        }

        this.x -= this.speed;

        this.y += this.speed;

        if (
            this.x < -300 ||
            this.y > canvas.height + 300
        ) {
            this.reset();
        }

    }

    draw() {

        if (!this.active)
            return;

        const grad =
            ctx.createLinearGradient(
                this.x,
                this.y,
                this.x + this.length,
                this.y - this.length
            );

        grad.addColorStop(
            0,
            `rgba(255,255,255,${this.opacity})`
        );

        grad.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );

        ctx.beginPath();

        ctx.moveTo(this.x, this.y);

        ctx.lineTo(
            this.x + this.length,
            this.y - this.length
        );

        ctx.strokeStyle = grad;

        ctx.lineWidth = 2;

        ctx.stroke();

    }

}

for(let i=0;i<3;i++)
    shootingStars.push(new ShootingStar());

animateStarfield();

// =====================================================
// COSMIMAIL
// =====================================================

const API_BASE = "https://starfielddatabase.pythonanywhere.com";

// =====================================================

async function getCurrentUser() {

    const response = await fetch(
        `${API_BASE}/api/me`,
        {
            credentials: "include"
        }
    );

    if(!response.ok)
        return null;

    return await response.json();

}

// =====================================================

async function getInbox(){

    const response = await fetch(
        `${API_BASE}/api/gmail/inbox`,
        {
            credentials:"include"
        }
    );

    if(!response.ok)
        throw new Error("Couldn't load inbox.");

    return await response.json();

}

// =====================================================

function formatDate(date){

    return new Date(date)
        .toLocaleDateString(
            undefined,
            {
                month:"short",
                day:"numeric"
            }
        );

}

// =====================================================

function getSenderName(from){

    if(from.includes("<"))
        return from.split("<")[0].trim();

    return from;

}

// =====================================================

function renderInbox(emails){

    const inbox =
        document.getElementById("inbox");

    inbox.innerHTML="";

    document.getElementById(
        "mail-count"
    ).textContent =
        `${emails.length} emails`;

    for(const email of emails){

        const card =
            document.createElement("div");

        card.className =
            "email-card fade-in";

        card.innerHTML=`

<div class="email-header">

<div class="sender">

${getSenderName(email.from)}

</div>

<div class="email-date">

${formatDate(email.date)}

</div>

</div>

<div class="subject">

${email.subject || "(No Subject)"}

</div>

<div class="snippet">

${email.snippet}

</div>

`;

        inbox.appendChild(card);

    }

}

// =====================================================

async function initCosmiMail(){

    console.log("🚀 CosmiMail");

    const user =
        await getCurrentUser();

    if(!user){

        console.log(
            "Not logged in."
        );

        return;

    }

    document.getElementById(
        "username"
    ).textContent =
        user.name;

    document.getElementById(
        "useremail"
    ).textContent =
        user.email;

    document.querySelector(
        ".avatar"
    ).textContent =
        user.name[0].toUpperCase();

    const emails =
        await getInbox();

    renderInbox(emails);

}

// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    initCosmiMail
);
