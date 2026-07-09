let prodiTerpilih = "";
let dosenTerpilih = "";
let passwordTarget = "";
let driveTarget = ""; // Menyimpan link drive target dosen terpilih
let dataDosenGlobal = {}; // Variabel global untuk menyimpan data dari serverless function

async function muatDataDosen() {
  try {
    const response = await fetch("/.netlify/functions/akses-rahasia");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    dataDosenGlobal = await response.json();
    console.log("Data Dosen berhasil dimuat:", dataDosenGlobal);
    // Setelah data dimuat, Anda mungkin ingin memanggil fungsi inisialisasi UI di sini
    pilihProdi(); // Panggil fungsi untuk mengisi dropdown prodi
  } catch (error) {
    console.error("Gagal memuat data dosen:", error);
    tampilkanError("Gagal memuat data. Mohon coba lagi.");
  }
}

// Panggil saat halaman dimuat
document.addEventListener("DOMContentLoaded", muatDataDosen);

// Otomatis men-generate semua Radio Buttons Prodi ke layar
const prodiContainer = document.getElementById("prodi-container");
Object.keys(dataDosen).forEach((prodi, idx) => {
  const div = document.createElement("div");
  div.className = "radio-item";
  div.innerHTML = `
      <input type="radio" name="prodi_option" id="prodi_${idx}" value="${prodi}" onchange="pilihProdi(this.value)">
      <label style="font-weight: normal; margin:0; cursor:pointer;" for="prodi_${idx}">${prodi}</label>
  `;
  prodiContainer.appendChild(div);
});

function pilihProdi() {
  const prodiTerpilih = document.querySelector(
    'input[name="prodi"]:checked',
  ).value;
  const selectDosen = document.getElementById("selectDosen");
  selectDosen.innerHTML = '<option value="">Pilih Dosen</option>'; // Reset options

  // Pastikan dataDosenGlobal sudah ada
  if (dataDosenGlobal[prodiTerpilih]) {
    dataDosenGlobal[prodiTerpilih].forEach((dosen) => {
      const opt = document.createElement("option");
      opt.value = dosen.nama;
      opt.textContent = dosen.nama;
      selectDosen.appendChild(opt);
    });
  }
}

// Fungsi tombol mata untuk sembunyikan/tampilkan password
function togglePasswordVisibility() {
  const passInput = document.getElementById("password-input");
  const eyeIcon = document.getElementById("eye-icon");
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.textContent = "🙈";
  } else {
    passInput.type = "password";
    eyeIcon.textContent = "👁️";
  }
}

function tampilkanError(teks) {
  const errDiv = document.getElementById("error-message");
  errDiv.textContent = teks;
  errDiv.style.display = "block";
  window.scrollTo(0, 0);
}

function sembunyikanError() {
  document.getElementById("error-message").style.display = "none";
}

function keHalaman1() {
  sembunyikanError();
  document.getElementById("password-input").value = "";
  document.getElementById("password-input").type = "password";
  document.getElementById("eye-icon").textContent = "👁️";

  document.getElementById("page-2").classList.remove("active");
  document.getElementById("page-3").classList.remove("active");
  document.getElementById("page-1").classList.add("active");

  document.getElementById("badge-2").classList.remove("active");
  document.getElementById("badge-3").classList.remove("active");
  document.getElementById("badge-1").classList.add("active");
}

function keHalaman2() {
  sembunyikanError();
  const prodiTerpilih = document.querySelector(
    'input[name="prodi"]:checked',
  ).value;
  const selectDosen = document.getElementById("selectDosen");
  const idxDosen = selectDosen.selectedIndex;

  if (idxDosen === 0) {
    tampilkanError("Mohon pilih dosen terlebih dahulu.");
    return;
  }

  // Gunakan dataDosenGlobal yang sudah dimuat
  const objekDosen = dataDosenGlobal[prodiTerpilih][idxDosen - 1]; // -1 karena "Pilih Dosen" adalah indeks 0

  if (objekDosen) {
    dosenTerpilih = objekDosen.nama;
    passwordTarget = objekDosen.pass;
    driveTarget = objekDosen.drive;

    // Update UI dengan data yang relevan
    document.getElementById("displayDosen").textContent = dosenTerpilih;
    document.getElementById("displayProdi").textContent = prodiTerpilih;
    // ... update elemen lain di halaman 2 dan 3

    // Lanjutkan ke halaman 2
    document.getElementById("page1").classList.remove("active");
    document.getElementById("page2").classList.add("active");
    document.getElementById("step1").classList.remove("active");
    document.getElementById("step2").classList.add("active");
  } else {
    tampilkanError("Data dosen tidak ditemukan.");
  }
}

function keHalaman3() {
  const inputPass = document.getElementById("password-input").value;

  if (inputPass !== passwordTarget) {
    tampilkanError(
      "Password angka salah! Periksa kembali kode akses unik dosen tersebut.",
    );
    return;
  }

  sembunyikanError();
  document.getElementById("final-dosen").textContent = dosenTerpilih;

  document.getElementById("page-2").classList.remove("active");
  document.getElementById("page-3").classList.add("active");

  document.getElementById("badge-2").classList.remove("active");
  document.getElementById("badge-3").classList.add("active");

  // Jika data link 'drive' dosen ada, gunakan link tersebut. Jika kosong, gunakan pencarian default.
  const tautanDrive =
    driveTarget && driveTarget !== "https://drive.google.com/..."
      ? driveTarget
      : "https://drive.google.com/drive/search?q=" +
        encodeURIComponent(dosenTerpilih);

  window.open(tautanDrive, "_blank");

  document.getElementById("btn-redirect").onclick = function () {
    window.open(tautanDrive, "_blank");
  };
}
