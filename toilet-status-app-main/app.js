// ==========================================
// Firebase 初期化
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } 
    from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, onValue, off } 
    from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4Z-BOUxTddV6bzzC3uGFnpGHq40DoCOU",
    authDomain: "cu-status.firebaseapp.com",
    projectId: "cu-status",
    storageBucket: "cu-status.firebasestorage.app",
    messagingSenderId: "726538825490",
    appId: "1:726538825490:web:77382dbd5ddd8c49b48dcb",
    measurementId: "G-3BJ9WZ4RQC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const database = getDatabase(app);

provider.setCustomParameters({
    hd: "gs4e.chubu.ac.jp"
});

// ==========================================
// ログイン処理
// ==========================================
const loginBtn = document.getElementById("login-btn");
const mainContent = document.getElementById("main-content");

loginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;

            if (!user.email.endsWith("@gs4e.chubu.ac.jp")) {
                signOut(auth).then(() => {
                    alert("中部大学のアドレスでログインしてください。");
                });
                return;
            }

            loginBtn.classList.add("hidden");
            mainContent.classList.remove("hidden");
        })
        .catch((error) => {
            console.error(error);
        });
});

// ==========================================
// 階選択 → 男女選択画面
// ==========================================
let selectedFloor = null;
let currentDbRef = null;

document.querySelectorAll(".floor-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        selectedFloor = btn.dataset.floor;

        document.getElementById("floor-select-screen").classList.add("hidden");
        document.getElementById("gender-select-screen").classList.remove("hidden");

        document.getElementById("main-title").innerText = `Building 9 – ${selectedFloor}F`;
    });
});

// ==========================================
// 男女選択 → MEN/WOMEN の画面へ
// ==========================================
document.querySelectorAll(".gender-card").forEach(btn => {
    btn.addEventListener("click", () => {

        const gender = btn.dataset.gender;

        document.getElementById("gender-select-screen").classList.add("hidden");
        document.getElementById("status-screen").classList.remove("hidden");

        if (gender === "men") {
            document.getElementById("table-men").classList.remove("hidden");
            document.getElementById("table-women").classList.add("hidden");
        } else {
            document.getElementById("table-men").classList.add("hidden");
            document.getElementById("table-women").classList.remove("hidden");
        }

        listenToFloorData(selectedFloor);
    });
});

// ==========================================
// 男女選択画面 → 階選択に戻る
// ==========================================
document.getElementById("back-to-floor").addEventListener("click", () => {
    document.getElementById("gender-select-screen").classList.add("hidden");
    document.getElementById("floor-select-screen").classList.remove("hidden");
});

// ==========================================
// Firebase データ取得
// ==========================================
function listenToFloorData(floor) {
    if (currentDbRef) off(currentDbRef);

    currentDbRef = ref(database, `buildings/building_9/floor_${floor}`);

    onValue(currentDbRef, (snapshot) => {
        const data = snapshot.val();
        updateTable(data);
    });
}

// ==========================================
// テーブル更新（⭕❌版）
// ==========================================
function updateTable(floorData) {
    const menBody = document.getElementById("table-men-body");
    const womenBody = document.getElementById("table-women-body");

    menBody.innerHTML = "";
    womenBody.innerHTML = "";

    if (!floorData) {
        menBody.innerHTML = "<tr><td colspan='2'>データがありません</td></tr>";
        womenBody.innerHTML = "<tr><td colspan='2'>データがありません</td></tr>";
        return;
    }

    const male = floorData.male ? Object.values(floorData.male) : [];
    const female = floorData.female ? Object.values(floorData.female) : [];

    male.forEach(m => {
        menBody.innerHTML += `
            <tr>
                <td>${m.name}</td>
                <td class="${m.isVacant ? "vacant" : "occupied"}">
                    ${m.isVacant ? "⭕" : "❌"}
                </td>
            </tr>
        `;
    });

    female.forEach(f => {
        womenBody.innerHTML += `
            <tr>
                <td>${f.name}</td>
                <td class="${f.isVacant ? "vacant" : "occupied"}">
                    ${f.isVacant ? "⭕" : "❌"}
                </td>
            </tr>
        `;
    });
}

// ==========================================
// 戻るボタン → 男女選択画面に戻る
// ==========================================
document.getElementById("back-btn").addEventListener("click", () => {
    if (currentDbRef) off(currentDbRef);

    document.getElementById("status-screen").classList.add("hidden");
    document.getElementById("gender-select-screen").classList.remove("hidden");
});


