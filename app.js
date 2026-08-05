// Konfigurasi Kunci Supabase
const supabaseUrl = 'https://qonlatvxeqziofszmkiu.supabase.co'; 
const supabaseKey = 'sb_publishable_7G0MD_Qw0JaIh5bRwGtzcg_VJ1iAqQl';
const db = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Sistem terhubung!");

// ==========================================
// --- MESIN BERANDA UTAMA DENGAN PAGING ---
// ==========================================
let semuaDataUMKM = [];
let dataYangDitampilkan = [];
let halamanBerandaAktif = 1;
const itemPerHalamanBeranda = 9;

async function loadBeranda() {
    const { data, error } = await db.from('profil_umkm').select('*').order('id', { ascending: false });
    const loading = document.getElementById('loading-beranda');
    const wadahKatalog = document.getElementById('katalog-umkm');

    loading.classList.add('hidden');
    wadahKatalog.classList.remove('hidden');

    if (error || !data || data.length === 0) {
        wadahKatalog.innerHTML = `<div class="col-span-3 text-center py-10 text-gray-500 font-medium">Belum ada UMKM yang terdaftar atau mengatur profil.</div>`;
        return;
    }

    semuaDataUMKM = data;
    dataYangDitampilkan = data;
    renderKatalogPaging();
}

function renderKatalogPaging() {
    const wadahKatalog = document.getElementById('katalog-umkm');
    const containerPaging = document.getElementById('paging-beranda-container');
    wadahKatalog.innerHTML = '';

    const totalData = dataYangDitampilkan.length;
    const totalHalaman = Math.ceil(totalData / itemPerHalamanBeranda) || 1;

    if (halamanBerandaAktif > totalHalaman) halamanBerandaAktif = totalHalaman;
    if (halamanBerandaAktif < 1) halamanBerandaAktif = 1;

    const awal = (halamanBerandaAktif - 1) * itemPerHalamanBeranda;
    const akhir = awal + itemPerHalamanBeranda;
    const dataHalamanIni = dataYangDitampilkan.slice(awal, akhir);

    if (dataHalamanIni.length === 0) {
        wadahKatalog.innerHTML = `<div class="col-span-3 text-center py-10 text-gray-500 font-medium">Pencarian tidak ditemukan.</div>`;
        containerPaging.classList.add('hidden');
        return;
    }

    dataHalamanIni.forEach(umkm => {
        const foto = umkm.foto_profil || 'https://via.placeholder.com/600x400?text=Foto+Belum+Tersedia';
        
        let kategori = umkm.kategori || 'Umum';
        if (kategori === 'Souvenir') kategori = 'Suvenir';

        const nama = umkm.nama_usaha || 'Tanpa Nama Usaha';
        const deskripsi = umkm.deskripsi ? umkm.deskripsi.substring(0, 90) + '...' : 'Tidak ada deskripsi fasilitas.';
        
        let rawWa = umkm.nomor_wa || '';
        if (rawWa.startsWith('0')) {
            rawWa = '62' + rawWa.substring(1);
        }

        wadahKatalog.innerHTML += `
            <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                    <div class="h-48 w-full bg-gray-200 relative">
                        <img src="${foto}" class="w-full h-full object-cover" alt="${nama}">
                        <span class="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">${kategori}</span>
                    </div>
                    <div class="p-5">
                        <h4 class="text-xl font-bold text-gray-900 mb-1">${nama}</h4>
                        <p class="text-gray-600 text-sm leading-relaxed">${deskripsi}</p>
                    </div>
                </div>
                <div class="p-5 pt-0 flex gap-2">
                    <a href="detail.html?id=${umkm.user_id}" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg font-semibold text-sm transition-colors shadow flex items-center justify-center">
                        🔍 Lihat Detail
                    </a>
                </div>
            </div>
        `;
    });

    if (totalHalaman > 1) {
        containerPaging.classList.remove('hidden');
        containerPaging.classList.add('flex');
        document.getElementById('info-halaman-beranda').innerText = `Halaman ${halamanBerandaAktif} dari ${totalHalaman}`;
        document.getElementById('btn-beranda-prev').disabled = (halamanBerandaAktif === 1);
        document.getElementById('btn-beranda-next').disabled = (halamanBerandaAktif === totalHalaman);
    } else {
        containerPaging.classList.add('hidden');
    }
}

function gantiHalamanBeranda(arah) {
    halamanBerandaAktif += arah;
    renderKatalogPaging();
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function filterKatalog() {
    const keyword = document.getElementById('input-cari').value.toLowerCase();
    const kategoriPilihan = document.getElementById('filter-kategori').value;

    dataYangDitampilkan = semuaDataUMKM.filter(umkm => {
        const cocokNama = (umkm.nama_usaha || '').toLowerCase().includes(keyword) || (umkm.deskripsi || '').toLowerCase().includes(keyword);
        
        let cocokKategori = false;
        if (kategoriPilihan === 'Semua') {
            cocokKategori = true;
        } else if (kategoriPilihan === 'Suvenir') {
            cocokKategori = (umkm.kategori === 'Suvenir' || umkm.kategori === 'Souvenir');
        } else {
            cocokKategori = (umkm.kategori === kategoriPilihan);
        }

        return cocokNama && cocokKategori;
    });

    halamanBerandaAktif = 1;
    renderKatalogPaging();
}


// ==========================================
// --- FITUR LOGIN & LUPA PASSWORD ---
// ==========================================
async function register() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const notif = document.getElementById('pesan-notif');
    notif.className = "block p-3 rounded bg-yellow-100 text-yellow-700 text-sm";
    notif.innerText = "Memproses pendaftaran...";
    const { error } = await db.auth.signUp({ email: email, password: pass });
    if (error) notif.innerText = "Gagal: " + error.message;
    else {
        notif.className = "block p-3 rounded bg-green-100 text-green-700 text-sm";
        notif.innerText = "Berhasil! Silakan klik Masuk.";
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const notif = document.getElementById('pesan-notif');
    notif.className = "block p-3 rounded bg-yellow-100 text-yellow-700 text-sm";
    notif.innerText = "Memproses login...";
    
    const { data, error } = await db.auth.signInWithPassword({ email: email, password: pass });
    if (error) {
        notif.innerText = "Gagal: " + error.message;
    } else {
        notif.className = "block p-3 rounded bg-green-100 text-green-700 text-sm";
        notif.innerText = "Berhasil masuk, mengalihkan...";
        
        setTimeout(() => {
            if (email === "admin@bunaken.com") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }
        }, 1200);
    }
}

async function lupaPassword() {
    const email = document.getElementById('email').value;
    const notif = document.getElementById('pesan-notif');

    if (!email) {
        alert("Mohon ketik terlebih dahulu email Anda pada kolom Email di atas.");
        return;
    }

    notif.className = "block p-3 rounded bg-yellow-100 text-yellow-700 text-sm";
    notif.classList.remove('hidden');
    notif.innerText = "Mengirim link pemulihan ke email...";

    const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href.replace('login.html', 'dashboard.html'),
    });

    if (error) {
        notif.className = "block p-3 rounded bg-red-100 text-red-700 text-sm";
        notif.innerText = "Gagal: " + error.message;
    } else {
        notif.className = "block p-3 rounded bg-green-100 text-green-700 text-sm";
        notif.innerText = "Berhasil! Periksa kotak masuk/spam email Anda untuk tautan reset password.";
    }
}


// ==========================================
// --- MESIN KOMPRESI FOTO ---
// ==========================================
function kompresFoto(file, maxWidth = 800) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                }, 'image/jpeg', 0.75);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}


// ==========================================
// --- FITUR DASHBOARD UMKM ---
// ==========================================
let currentUser = null; 
let fotoUtamaLama = null; 

async function cekSesi() {
    setTimeout(async () => {
        const { data: { session } } = await db.auth.getSession();
        if (!session) {
            alert("Silakan login kembali.");
            window.location.href = "login.html";
            return;
        }
        currentUser = session.user;
        loadProfil();
    }, 500); 
}

async function logout() {
    await db.auth.signOut();
    window.location.href = "login.html";
}

function toggleFormPassword() {
    const container = document.getElementById('form-ganti-pass-container');
    const ikon = document.getElementById('ikon-panah');
    container.classList.toggle('hidden');
    ikon.innerText = container.classList.contains('hidden') ? '▼' : '▲';
}

async function ubahPasswordBaru() {
    const passwordBaru = document.getElementById('input_password_baru').value;
    const passwordKonfirmasi = document.getElementById('input_password_konfirmasi').value;
    const notif = document.getElementById('pesan-ganti-pass');

    if (!passwordBaru || passwordBaru.length < 6) {
        notif.innerText = "Gagal: Password baru minimal 6 karakter.";
        notif.className = "text-red-600 text-sm mt-1 font-medium";
        return;
    }

    if (passwordBaru !== passwordKonfirmasi) {
        notif.innerText = "Gagal: Konfirmasi password tidak sama!";
        notif.className = "text-red-600 text-sm mt-1 font-medium";
        return;
    }

    notif.innerText = "Memperbarui password...";
    notif.className = "text-yellow-600 text-sm mt-1 font-medium";

    const { error } = await db.auth.updateUser({ password: passwordBaru });

    if (error) {
        notif.innerText = "Gagal: " + error.message;
        notif.className = "text-red-600 text-sm mt-1 font-medium";
    } else {
        notif.innerText = "Berhasil! Password baru Anda sudah disimpan.";
        notif.className = "text-green-600 text-sm mt-1 font-medium";
        document.getElementById('input_password_baru').value = '';
        document.getElementById('input_password_konfirmasi').value = '';
    }
}

// LOGIKA KHUSUS UNTUK TOGGLE 24 JAM
function toggleJam24() {
    const is24 = document.getElementById('jam_24').checked;
    const inBuka = document.getElementById('jam_buka');
    const inTutup = document.getElementById('jam_tutup');
    
    inBuka.disabled = is24;
    inTutup.disabled = is24;
    
    if (is24) {
        inBuka.value = '';
        inTutup.value = '';
    } else {
        inBuka.value = '08:00';
        inTutup.value = '17:00';
    }
}

function tambahBarisProduk(nama = '', harga = '') {
    const wadah = document.getElementById('wadah_produk');
    const div = document.createElement('div');
    div.className = "flex gap-2 produk-item";
    div.innerHTML = `
        <input type="text" placeholder="Nama Produk" value="${nama}" class="w-1/2 border rounded p-2 text-base outline-none">
        <input type="number" placeholder="Harga" value="${harga}" class="w-1/2 border rounded p-2 text-base outline-none">
        <button type="button" onclick="this.parentElement.remove()" class="bg-red-100 text-red-600 px-3 rounded hover:bg-red-200 font-bold">X</button>
    `;
    wadah.appendChild(div);
}

function tambahBarisGaleri(urlFoto = '') {
    const wadah = document.getElementById('wadah_input_galeri');
    const jumlahBaris = wadah.children.length;
    
    if (jumlahBaris >= 5 && !urlFoto) {
        alert("Maksimal galeri adalah 5 foto.");
        return;
    }

    const div = document.createElement('div');
    div.className = "flex items-center gap-2 galeri-item-row bg-white p-2 rounded border border-gray-200";
    
    if (urlFoto) {
        div.innerHTML = `
            <img src="${urlFoto}" class="w-12 h-12 object-cover rounded border" data-existing="${urlFoto}">
            <span class="text-xs text-gray-600 flex-1 truncate">Foto Tersimpan</span>
            <button type="button" onclick="this.parentElement.remove()" class="bg-red-100 text-red-600 px-2.5 py-1 rounded hover:bg-red-200 font-bold text-xs">Hapus</button>
        `;
    } else {
        div.innerHTML = `
            <input type="file" accept="image/*" class="input-file-galeri w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            <button type="button" onclick="this.parentElement.remove()" class="bg-red-100 text-red-600 px-2.5 py-1 rounded hover:bg-red-200 font-bold text-xs">Hapus</button>
        `;
    }
    wadah.appendChild(div);
}

function renderFotoUtama() {
    const wadah = document.getElementById('preview_foto_utama');
    const img = document.getElementById('img_preview_utama');
    if (fotoUtamaLama) {
        img.src = fotoUtamaLama;
        wadah.classList.remove('hidden');
    } else {
        wadah.classList.add('hidden');
    }
}

function hapusFotoUtama() {
    fotoUtamaLama = null;
    renderFotoUtama();
}

async function loadProfil() {
    const { data, error } = await db.from('profil_umkm').select('*').eq('user_id', currentUser.id).single();
    
    document.getElementById('wadah_produk').innerHTML = '';
    document.getElementById('wadah_input_galeri').innerHTML = '';

    if (data) {
        document.getElementById('nama_usaha').value = data.nama_usaha || '';
        document.getElementById('kategori').value = data.kategori || 'Homestay';
        document.getElementById('deskripsi').value = data.deskripsi || '';
        document.getElementById('nomor_wa').value = data.nomor_wa || '';
        document.getElementById('link_maps').value = data.link_maps || '';
        document.getElementById('link_medsos').value = data.link_medsos || '';
        document.getElementById('promosi').value = data.promosi || '';
        
        const jamOp = data.jam_operasional || '';
        const cb24 = document.getElementById('jam_24');
        const inBuka = document.getElementById('jam_buka');
        const inTutup = document.getElementById('jam_tutup');
        const selHari = document.getElementById('hari_buka');
        
        if(selHari) {
            if (jamOp.includes('Senin - Sabtu')) selHari.value = 'Senin - Sabtu';
            else if (jamOp.includes('Senin - Jumat')) selHari.value = 'Senin - Jumat';
            else if (jamOp.includes('Akhir Pekan')) selHari.value = 'Sabtu - Minggu (Akhir Pekan)';
            else selHari.value = 'Setiap Hari';
        }

        if (jamOp.includes('24 Jam')) {
            if(cb24) cb24.checked = true;
            if(inBuka) { inBuka.disabled = true; inBuka.value = ''; }
            if(inTutup) { inTutup.disabled = true; inTutup.value = ''; }
        } else {
            if(cb24) cb24.checked = false;
            if(inBuka) inBuka.disabled = false;
            if(inTutup) inTutup.disabled = false;
            
            const times = jamOp.match(/\d{2}[:.]\d{2}/g);
            if (times && times.length >= 2) {
                if(inBuka) inBuka.value = times[0].replace('.', ':');
                if(inTutup) inTutup.value = times[1].replace('.', ':');
            } else {
                if(inBuka) inBuka.value = '08:00';
                if(inTutup) inTutup.value = '17:00';
            }
        }

        if (data.foto_profil) {
            fotoUtamaLama = data.foto_profil;
            renderFotoUtama();
        }

        if (data.galeri_foto && data.galeri_foto.length > 0) {
            data.galeri_foto.forEach(url => tambahBarisGaleri(url));
        } else {
            tambahBarisGaleri(); 
        }

        if (data.produk_layanan && data.produk_layanan.length > 0) {
            data.produk_layanan.forEach(item => tambahBarisProduk(item.nama, item.harga));
        } else {
            tambahBarisProduk(); 
        }
        aktifkanTombolQR();
    } else {
        tambahBarisGaleri();
        tambahBarisProduk(); 
    }
}

async function simpanProfil() {
    const notif = document.getElementById('pesan-dashboard');
    notif.className = "block p-3 rounded-lg bg-yellow-100 text-yellow-700 text-base font-medium text-center mt-2";
    notif.innerText = "Menyimpan data...";

    let nomorWaInput = document.getElementById('nomor_wa').value.trim();
    if (nomorWaInput.startsWith('0')) {
        nomorWaInput = '62' + nomorWaInput.substring(1);
    }

    const hariBuka = document.getElementById('hari_buka') ? document.getElementById('hari_buka').value : 'Setiap Hari';
    let jamOperasionalFinal = '';
    
    const is24 = document.getElementById('jam_24') ? document.getElementById('jam_24').checked : false;
    
    if (is24) {
        jamOperasionalFinal = `${hariBuka}, Buka 24 Jam`;
    } else {
        const buka = document.getElementById('jam_buka') ? document.getElementById('jam_buka').value : '';
        const tutup = document.getElementById('jam_tutup') ? document.getElementById('jam_tutup').value : '';
        if (buka && tutup) {
            jamOperasionalFinal = `${hariBuka}, ${buka} - ${tutup} WITA`;
        } else {
            jamOperasionalFinal = 'Tidak ada info jam';
        }
    }

    let listProduk = [];
    const barisProduk = document.querySelectorAll('.produk-item');
    barisProduk.forEach(baris => {
        const inputNama = baris.querySelector('input[type="text"]');
        const inputHarga = baris.querySelector('input[type="number"]');
        if (inputNama && inputNama.value.trim() !== '') {
            listProduk.push({ nama: inputNama.value, harga: inputHarga ? inputHarga.value : '' });
        }
    });

    let linkFotoUtama = fotoUtamaLama; 
    const fileFotoUtamaMentah = document.getElementById('foto_profil').files[0];
    if (fileFotoUtamaMentah) {
        const fileFotoUtama = await kompresFoto(fileFotoUtamaMentah); 
        const namaFile = `${currentUser.id}_utama_${Date.now()}.jpg`;
        const { error: uploadErr } = await db.storage.from('umkm-media').upload(namaFile, fileFotoUtama);
        if (!uploadErr) {
            const { data: { publicUrl } } = db.storage.from('umkm-media').getPublicUrl(namaFile);
            linkFotoUtama = publicUrl;
        }
    }

    let listGaleriBaru = [];
    const barisGaleri = document.querySelectorAll('.galeri-item-row');
    
    for (let i = 0; i < barisGaleri.length; i++) {
        const imgExist = barisGaleri[i].querySelector('img');
        const inputFile = barisGaleri[i].querySelector('.input-file-galeri');

        if (imgExist) {
            listGaleriBaru.push(imgExist.getAttribute('data-existing'));
        } else if (inputFile && inputFile.files[0]) {
            const fileKompres = await kompresFoto(inputFile.files[0]);
            const namaFile = `${currentUser.id}_galeri_${Date.now()}_${i}.jpg`;
            const { error: uploadErr } = await db.storage.from('umkm-media').upload(namaFile, fileKompres);
            if (!uploadErr) {
                const { data: { publicUrl } } = db.storage.from('umkm-media').getPublicUrl(namaFile);
                listGaleriBaru.push(publicUrl);
            }
        }
    }

    const profilData = {
        user_id: currentUser.id,
        nama_usaha: document.getElementById('nama_usaha').value,
        kategori: document.getElementById('kategori').value,
        deskripsi: document.getElementById('deskripsi').value,
        nomor_wa: nomorWaInput,
        link_maps: document.getElementById('link_maps').value,
        link_medsos: document.getElementById('link_medsos').value,
        jam_operasional: jamOperasionalFinal,
        promosi: document.getElementById('promosi').value,
        foto_profil: linkFotoUtama,
        galeri_foto: listGaleriBaru,
        produk_layanan: listProduk 
    };

    const { data: existingData } = await db.from('profil_umkm').select('id').eq('user_id', currentUser.id).single();
    let saveError = null;

    if (existingData) {
        const { error: updateError } = await db.from('profil_umkm').update(profilData).eq('user_id', currentUser.id);
        saveError = updateError;
    } else {
        const { error: insertError } = await db.from('profil_umkm').insert([profilData]);
        saveError = insertError;
    }

    if (saveError) {
        notif.className = "block p-3 rounded-lg bg-red-100 text-red-700 text-base font-medium text-center mt-2";
        notif.innerText = "Gagal menyimpan: " + saveError.message;
    } else {
        notif.className = "block p-3 rounded-lg bg-green-100 text-green-700 text-base font-medium text-center mt-2";
        notif.innerText = "Hore! Data dan Foto berhasil disimpan!";
        document.getElementById('foto_profil').value = '';
        fotoUtamaLama = linkFotoUtama;
        loadProfil(); 
        aktifkanTombolQR();
    }
}

function aktifkanTombolQR() {
    const btnQr = document.getElementById('btn-qr');
    if (btnQr) {
        btnQr.disabled = false;
        btnQr.className = "w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded shadow cursor-pointer text-base";
    }
}

function generateQR() {
    const baseUrl = window.location.href.replace('dashboard.html', '');
    const linkPromosi = baseUrl + 'detail.html?id=' + currentUser.id;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkPromosi)}`;
    
    const namaUsaha = document.getElementById('nama_usaha').value || 'Usaha Bunaken';
    document.getElementById('qr-nama-usaha').innerText = namaUsaha;
    document.getElementById('qr-image').src = apiUrl;
    
    const linkElemen = document.getElementById('link-halaman-usaha');
    linkElemen.href = linkPromosi;
    linkElemen.innerText = "🔗 Buka Halaman Web Usaha Saya";

    const resultDiv = document.getElementById('qr-result');
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('flex');
}

async function unduhQR() {
    const namaUsaha = document.getElementById('nama_usaha').value || 'Usaha Bunaken';
    const qrImgSrc = document.getElementById('qr-image').src;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 600;
    canvas.height = 750;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💳 QR Code Digital Promosi', canvas.width / 2, 75);
    
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#1E40AF';
    ctx.fillText(namaUsaha, canvas.width / 2, 120);
    
    const imgQR = new Image();
    imgQR.crossOrigin = 'anonymous';
    imgQR.src = qrImgSrc;
    
    imgQR.onload = function() {
        const qrSize = 380;
        const xPos = (canvas.width - qrSize) / 2;
        const yPos = 155;
        
        ctx.fillStyle = '#F9FAFB';
        ctx.fillRect(xPos - 15, yPos - 15, qrSize + 30, qrSize + 30);
        
        ctx.drawImage(imgQR, xPos, yPos, qrSize, qrSize);
        
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#6B7280';
        ctx.fillText('Scan untuk info & pemesanan', canvas.width / 2, 595);
        
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText('Digitalisasi UMKM Pulau Bunaken', canvas.width / 2, 690);
        
        const linkDownload = document.createElement('a');
        linkDownload.download = `Stiker-QR-${namaUsaha.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        linkDownload.href = canvas.toDataURL('image/png');
        document.body.appendChild(linkDownload);
        linkDownload.click();
        document.body.removeChild(linkDownload);
    };
    
    imgQR.onerror = function() {
        alert("Gagal memuat gambar QR Code untuk diunduh. Silakan coba sesaat lagi.");
    };
}

function cetakQR() {
    const isiKotakQR = document.getElementById('area-cetak-qr').innerHTML;
    const jendelaprint = window.open('', '', 'height=600,width=600');
    
    jendelaprint.document.write('<html><head><title>Cetak QR Code UMKM</title>');
    jendelaprint.document.write('<style>body { font-family: sans-serif; text-align: center; padding-top: 40px; } img { width: 250px; height: 250px; margin: 15px auto; display: block; } h4 { font-size: 22px; margin-bottom: 5px; } p { color: #666; font-size: 14px; }</style>');
    jendelaprint.document.write('</head><body>');
    jendelaprint.document.write(isiKotakQR);
    jendelaprint.document.write('</body></html>');
    
    jendelaprint.document.close();
    jendelaprint.focus();
    
    setTimeout(() => {
        jendelaprint.print();
        jendelaprint.close();
    }, 500);
}


// ==========================================
// --- FITUR PANEL ADMIN (ADMIN.HTML) ---
// ==========================================
let halamanAktif = 1;
const dataPerHalaman = 10;
let semuaDataAdmin = [];

async function cekAdminSesi() {
    const { data: { session } } = await db.auth.getSession();
    if (!session || session.user.email !== "admin@bunaken.com") {
        alert("Akses ditolak! Halaman ini khusus Administrator.");
        window.location.href = "login.html";
        return;
    }
    muatDataAdmin();
}

async function logoutAdmin() {
    await db.auth.signOut();
    window.location.href = "login.html";
}

function toggleFormPasswordAdmin() {
    const container = document.getElementById('form-ganti-pass-admin-container');
    const ikon = document.getElementById('ikon-panah-admin');
    container.classList.toggle('hidden');
    ikon.innerText = container.classList.contains('hidden') ? '▼' : '▲';
}

async function ubahPasswordAdmin() {
    const passwordBaru = document.getElementById('admin_password_baru').value;
    const passwordKonfirmasi = document.getElementById('admin_password_konfirmasi').value;
    const notif = document.getElementById('pesan-ganti-pass-admin');

    if (!passwordBaru || passwordBaru.length < 6) {
        notif.innerText = "Gagal: Password baru minimal 6 karakter.";
        notif.className = "text-red-600 text-sm mt-1 font-medium";
        return;
    }

    if (passwordBaru !== passwordKonfirmasi) {
        notif.innerText = "Gagal: Konfirmasi password tidak sama!";
        notif.className = "text-red-600 text-sm mt-1 font-medium";
        return;
    }

    notif.innerText = "Memperbarui password admin...";
    notif.className = "text-yellow-600 text-sm mt-1 font-medium";

    const { error } = await db.auth.updateUser({ password: passwordBaru });

    if (error) {
        notif.innerText = "Gagal: " + error.message;
        notif.className = "text-red-600 text-sm mt-1 font-medium";
    } else {
        notif.innerText = "Berhasil! Password admin telah diperbarui.";
        notif.className = "text-green-600 text-sm mt-1 font-medium";
        document.getElementById('admin_password_baru').value = '';
        document.getElementById('admin_password_konfirmasi').value = '';
    }
}

async function muatDataAdmin() {
    const { data, error } = await db.from('profil_umkm').select('*').order('id', { ascending: false });
    if (!error && data) {
        semuaDataAdmin = data;
        renderTabelAdmin();
    }
}

function renderTabelAdmin() {
    const tbody = document.getElementById('tabel-umkm-body');
    const keyword = document.getElementById('admin-search').value.toLowerCase();

    const dataFilter = semuaDataAdmin.filter(item => 
        (item.nama_usaha || '').toLowerCase().includes(keyword)
    );

    const totalData = dataFilter.length;
    const totalHalaman = Math.ceil(totalData / dataPerHalaman) || 1;
    
    if (halamanAktif > totalHalaman) halamanAktif = totalHalaman;
    if (halamanAktif < 1) halamanAktif = 1;

    const awal = (halamanAktif - 1) * dataPerHalaman;
    const akhir = awal + dataPerHalaman;
    const dataHalamanIni = dataFilter.slice(awal, akhir);

    tbody.innerHTML = '';
    if (dataHalamanIni.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Tidak ada data ditemukan.</td></tr>`;
    } else {
        dataHalamanIni.forEach((umkm, index) => {
            const nomorUrut = awal + index + 1;
            
            let kategoriAdmin = umkm.kategori || '-';
            if (kategoriAdmin === 'Souvenir') kategoriAdmin = 'Suvenir';

            tbody.innerHTML += `
                <tr class="hover:bg-gray-50">
                    <td class="p-3 text-gray-500">${nomorUrut}</td>
                    <td class="p-3 font-semibold text-gray-900">${umkm.nama_usaha || 'Tanpa Nama'}</td>
                    <td class="p-3"><span class="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded font-medium">${kategoriAdmin}</span></td>
                    <td class="p-3 text-gray-600">${umkm.nomor_wa || '-'}</td>
                    <td class="p-3 text-center">
                        <a href="detail.html?id=${umkm.user_id}" target="_blank" class="text-blue-600 hover:underline mr-3 text-sm font-medium">Lihat</a>
                        <button onclick="hapusKontenAdmin('${umkm.user_id}', '${umkm.nama_usaha}')" class="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded text-xs font-semibold">Hapus Konten</button>
                    </td>
                </tr>
            `;
        });
    }

    document.getElementById('info-halaman').innerText = `Halaman ${halamanAktif} dari ${totalHalaman}`;
    document.getElementById('btn-prev').disabled = (halamanAktif === 1);
    document.getElementById('btn-next').disabled = (halamanAktif === totalHalaman || totalHalaman === 0);
}

function gantiHalaman(arah) {
    halamanAktif += arah;
    renderTabelAdmin();
}

function cariDataAdmin() {
    halamanAktif = 1;
    renderTabelAdmin();
}

async function hapusKontenAdmin(userId, namaUsaha) {
    const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus konten profil "${namaUsaha}" karena melanggar aturan? Data akan hilang dari direktori publik.`);
    if (!konfirmasi) return;

    const { error } = await db.from('profil_umkm').delete().eq('user_id', userId);
    
    if (error) {
        alert("Gagal menghapus konten: " + error.message);
    } else {
        alert("Konten berhasil dihapus!");
        muatDataAdmin();
    }
}

// --- FITUR GENERATE QR UTAMA SUPER HD DI ADMIN ---
function initQRUtamaAdmin() {
    const imgElement = document.getElementById('qr-utama-img');
    const textElement = document.getElementById('text-url-utama');
    
    if (!imgElement) return;

    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    const linkUtama = baseUrl + 'index.html';
    
    // Menggunakan API ukuran besar (600x600) untuk tampilan preview yang jernih
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(linkUtama)}`;
    
    imgElement.src = apiUrl;
    textElement.innerText = linkUtama;
}

async function unduhQRUtamaHD() {
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    const linkUtama = baseUrl + 'index.html';
    
    // Mengambil QR Code dengan resolusi masif (1200x1200) untuk hasil cetak HD tanpa pecah
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&data=${encodeURIComponent(linkUtama)}`;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 950;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#2563EB'; // Border biru konsisten
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌊 SELAMAT DATANG DI PULAU BUNAKEN', canvas.width / 2, 95);
    
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#4B5563';
    ctx.fillText('Scan untuk Menjelajahi Direktori Wisata & UMKM', canvas.width / 2, 135);
    
    const imgQR = new Image();
    imgQR.crossOrigin = 'anonymous';
    imgQR.src = qrImgSrc;
    
    imgQR.onload = function() {
        const qrSize = 500;
        const xPos = (canvas.width - qrSize) / 2;
        const yPos = 170;
        
        ctx.fillStyle = '#F9FAFB';
        ctx.fillRect(xPos - 20, yPos - 20, qrSize + 40, qrSize + 40);
        ctx.drawImage(imgQR, xPos, yPos, qrSize, qrSize);
        
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#1E40AF';
        ctx.fillText('Pusat Informasi & Direktori Resmi Warga Lokal', canvas.width / 2, 735);
        
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText('© 2026 Digitalisasi Promosi Wisata Pulau Bunaken', canvas.width / 2, 840);
        
        const linkDownload = document.createElement('a');
        linkDownload.download = 'QR-Code-Utama-Bunaken-HD.png';
        linkDownload.href = canvas.toDataURL('image/png');
        document.body.appendChild(linkDownload);
        linkDownload.click();
        document.body.removeChild(linkDownload);
    };
    
    imgQR.onerror = function() {
        alert("Gagal mengunduh QR Code HD. Pastikan koneksi internet stabil.");
    };
}


// ==========================================
// --- FITUR HALAMAN PUBLIK (DETAIL.HTML) ---
// ==========================================
async function loadDetailUMKM() {
    const urlParams = new URLSearchParams(window.location.search);
    const idUmkm = urlParams.get('id');

    if (!idUmkm) {
        document.getElementById('loading').innerText = "Mohon pindai QR Code yang valid.";
        return;
    }

    const { data, error } = await db.from('profil_umkm').select('*').eq('user_id', idUmkm).single();

    if (error || !data) {
        document.getElementById('loading').innerText = "Toko/UMKM belum mengatur profil mereka atau telah dihapus oleh Admin.";
        return;
    }

    document.getElementById('loading').classList.add('hidden');
    document.getElementById('konten-utama').classList.remove('hidden');

    document.getElementById('d-nama').innerText = data.nama_usaha || 'Tanpa Nama';
    document.getElementById('d-kategori').innerText = data.kategori || '-';
    document.getElementById('d-deskripsi').innerText = data.deskripsi || 'Tidak ada deskripsi.';
    document.getElementById('d-jam').innerText = data.jam_operasional || 'Tidak ada info jam';
    document.getElementById('d-promo').innerText = data.promosi || 'Sedang tidak ada promo';
    
    if (data.foto_profil) document.getElementById('d-foto').src = data.foto_profil;

    if (data.nomor_wa) {
        let rawWa = data.nomor_wa;
        if (rawWa.startsWith('0')) {
            rawWa = '62' + rawWa.substring(1);
        }
        
        const btnWa = document.getElementById('btn-wa');
        if (btnWa) {
            const teksPesan = `Halo ${data.nama_usaha}, saya melihat usaha Anda dari Info Wisata Bunaken.`;
            btnWa.href = `https://wa.me/${rawWa}?text=${encodeURIComponent(teksPesan)}`;
            btnWa.classList.remove('hidden');
            btnWa.classList.add('flex');
        }

        const btnTelp = document.getElementById('btn-telp');
        if (btnTelp) {
            btnTelp.href = `tel:${rawWa}`;
            btnTelp.classList.remove('hidden');
            btnTelp.classList.add('flex');
        }
    }

    if (data.link_maps) {
        const btnMaps = document.getElementById('btn-maps');
        if (btnMaps) {
            btnMaps.href = data.link_maps;
            btnMaps.classList.remove('hidden');
            btnMaps.classList.add('flex');
        }
    }

    if (data.link_medsos && data.link_medsos.trim() !== '') {
        const wrapperMedsos = document.getElementById('wrapper-medsos');
        const linkMedsos = document.getElementById('d-medsos');
        if (wrapperMedsos && linkMedsos) {
            linkMedsos.href = data.link_medsos;
            linkMedsos.innerText = `🔗 ${data.link_medsos}`;
            wrapperMedsos.classList.remove('hidden');
        }
    }

    const wadahProduk = document.getElementById('d-produk');
    if (wadahProduk) {
        wadahProduk.innerHTML = ''; 
        if (data.produk_layanan && data.produk_layanan.length > 0) {
            data.produk_layanan.forEach(item => {
                let hargaFormat = item.harga;
                if (!isNaN(item.harga) && item.harga !== '') {
                    hargaFormat = Number(item.harga).toLocaleString('id-ID');
                }

                wadahProduk.innerHTML += `
                    <div class="flex justify-between items-center border-b border-gray-200 py-2">
                        <span class="text-sm text-gray-700">${item.nama}</span>
                        <span class="text-sm font-bold text-gray-900 text-right w-32 truncate">Rp ${hargaFormat}</span>
                    </div>`;
            });
        } else {
            wadahProduk.innerHTML = '<p class="text-xs text-gray-500 text-center py-2">Belum ada daftar produk.</p>';
        }
    }

    const wadahGaleri = document.getElementById('d-galeri');
    const btnLeft = document.getElementById('btn-scroll-left');
    const btnRight = document.getElementById('btn-scroll-right');
    
    if (wadahGaleri) {
        wadahGaleri.innerHTML = ''; 
        if (data.galeri_foto && data.galeri_foto.length > 0) {
            data.galeri_foto.forEach(link => {
                wadahGaleri.innerHTML += `<img src="${link}" onclick="bukaLightbox('${link}')" class="flex-none h-28 object-cover rounded-lg shadow border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity duration-200 snap-center" style="width: calc(33.333% - 0.35rem);" alt="Galeri">`;
            });
            
            if (data.galeri_foto.length > 3) {
                if (btnLeft) btnLeft.classList.remove('hidden');
                if (btnRight) btnRight.classList.remove('hidden');
            }
        } else {
            wadahGaleri.innerHTML = '<p class="text-xs text-gray-500 w-full text-center py-4">Belum ada foto galeri.</p>';
        }
    }
}

function bukaLightbox(url) {
    document.getElementById('lightbox-img').src = url;
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
}

function tutupLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
}
