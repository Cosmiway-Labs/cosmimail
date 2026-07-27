const API_BASE = "https://starfielddatabase.pythonanywhere.com";

async function getCurrentUser() {
    try {
        const response = await fetch(`${API_BASE}/api/me`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            console.log("Not logged in:", data);
            return null;
        }

        console.log("COSMIMAIL USER:", data);

        return data;
    } catch (error) {
        console.error("Could not connect to CosmiMail backend:", error);
        return null;
    }
}

async function initCosmiMail() {
    console.log("🚀 CosmiMail booting...");

    const user = await getCurrentUser();

    if (!user) {
        console.log("No active CosmiMail session.");
        return;
    }

    console.log(`Welcome to CosmiMail, ${user.name}!`);
    console.log(`Connected Google account: ${user.email}`);
}

document.addEventListener("DOMContentLoaded", initCosmiMail);
