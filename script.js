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

    // Pindahkan inisialisasi radio button ke sini, gunakan dataDosenGlobal
    const prodiContainer = document.getElementById("prodi-container");
    Object.keys(dataDosenGlobal).forEach((prodi, idx) => { // Perbaikan di sini: dataDosenGlobal
      const div = document.createElement("div");
      div.className = "radio-item";
      div.innerHTML = `
          <input type="radio" name="prodi_option" id="prodi_${idx}" value="${prodi}" onchange="pilihProdi(this.value)">
          <label style="font-weight: normal; margin:0; cursor:pointer;" for="prodi_${idx}">${prodi}</label>
      `;
      prodiContainer.appendChild(div);
    });
    
    // Pilih prodi pertama secara default dan panggil pilihProdi untuk mengisi dropdown dosen
    if (Object.keys(dataDosenGlobal).length > 0) {
        const firstProdiKey = Object.keys(dataDosenGlobal)[0];
        document.getElementById(`prodi_0`).checked = true; // Asumsi id prodi_0 adalah prodi pertama
        pilihProdi(firstProdiKey); 
    }

  } catch (error) {
    console.error("Gagal memuat data dosen:", error);
    tampilkanError("Gagal memuat data. Mohon coba lagi.");
  }
}

// Panggil saat halaman dimuat
document.addEventListener("DOMContentLoaded", muatDataDosen);

function pilihProdi(namaProdiYangDipilih) { // Menerima argumen
  prodiTerpilih = namaProdiYangDipilih; // Set variabel global
  const selectDosen = document.getElementById("dosen-select"); // ID select box di index.html
  selectDosen.innerHTML = '<option value="">-- Pilih Nama Dosen --</option>'; // Reset options

  // Pastikan dataDosenGlobal sudah ada dan prodi yang dipilih tersedia
  if (dataDosenGlobal[prodiTerpilih]) {
    dataDosenGlobal[prodiTerpilih].forEach((dosen, index) => {
      const opt = document.createElement("option");
      opt.value = index; // Menggunakan index sebagai nilai option
      opt.textContent = dosen.nama;
      selectDosen.appendChild(opt);
    });
  }
  sembunyikanError();
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
  // Gunakan prodiTerpilih yang sudah di-set oleh fungsi pilihProdi
  // Tidak perlu querySelector lagi karena prodiTerpilih sudah global
  // Pastikan variabel global `prodiTerpilih` sudah terisi
  if (!prodiTerpilih) { // Pastikan prodiTerpilih sudah di set
      tampilkanError("Peringatan: Silakan pilih Program Studi terlebih dahulu!");
      return;
  }

  const selectDosen = document.getElementById("dosen-select"); // Pastikan ID ini benar
  const idxDosen = selectDosen.value; // Ini adalah index dosen, bukan nama

  if (idxDosen === "") {
    tampilkanError("Peringatan: Silakan pilih nama dosen!");
    return;
  }

  // Gunakan dataDosenGlobal yang sudah dimuat
  // idxDosen adalah value dari option, yang kita set sebagai index array
  const objekDosen = dataDosenGlobal[prodiTerpilih][parseInt(idxDosen)]; 

  if (objekDosen) {
    dosenTerpilih = objekDosen.nama;
    passwordTarget = objekDosen.pass;
    driveTarget = objekDosen.drive;

    document.getElementById("review-prodi").textContent = prodiTerpilih;
    document.getElementById("review-dosen").textContent = dosenTerpilih;

    document.getElementById("page-1").classList.remove("active");
    document.getElementById("page-2").classList.add("active");

    document.getElementById("badge-1").classList.remove("active");
    document.getElementById("badge-2").classList.add("active");
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
