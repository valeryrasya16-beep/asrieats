const USER_ID = sessionStorage.getItem('user_id');
const USER_NAME = sessionStorage.getItem('user_name');
const USER_ROLE = sessionStorage.getItem('user_role');

if (!USER_ID) { window.location.href = 'index.html'; }

let menu = [], cart = [], orderData = {}, activeCat = 'semua', activeKantin = null;
let currentUserPoints = 0; 
let activeVoucher = null; 
let activeVoucherPoints = 0; 
let pendingSwitchKantinId = null;

let pendingAddItemId = null;
let isAddingFromMenu = false; 
let currentCartIndexToEdit = null; 
let currentOrderType = null; 
let menuChannel = null; 

// Variabel penampung sementara buat level pedas
let tempSpicyLevel = null;

// Variabel buat nyimpen email baru sementara
let pendingNewEmail = null; 

// ==========================================
// LOGIKA PENYIMPANAN NOTIFIKASI
// ==========================================
function getNotifStorageKey() {
  return USER_ROLE === 'guest' ? 'notif_guest' : 'notif_user_' + USER_ID;
}

let notifications = [];
if (USER_ROLE === 'guest') {
  notifications = JSON.parse(sessionStorage.getItem(getNotifStorageKey()) || '[]');
} else {
  notifications = JSON.parse(localStorage.getItem(getNotifStorageKey()) || '[]');
}

function saveNotifications() {
  if (USER_ROLE === 'guest') {
    sessionStorage.setItem(getNotifStorageKey(), JSON.stringify(notifications));
  } else {
    localStorage.setItem(getNotifStorageKey(), JSON.stringify(notifications));
  }
}
// ==========================================

const voiceAudio = new Audio('https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/suara/ttsmaker-file-2026-10-25-18-49-43.mp3');
voiceAudio.preload = 'auto';
voiceAudio.volume = 1.0;

function isUserEligibleForPoints() {
  return USER_ROLE === 'mahasiswa' || USER_ROLE === 'pelanggan';
}

const KANTIN_NAMES = { 
  'warung_nusantara': 'Warung Nusantara', 
  'warung_sederhana': 'Warung Sederhana', 
  'warung_modern': 'Warung Modern',
  'warung_bakso_joss': 'Warung Bakso Joss',
  'warung_mie_ayam': 'Warung Mie Ayam',
  'warung_wareg': 'Warung Wareg'
};

const BUCKET_URL = "https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/gambar-menu/";
const IMAGE_MAP = {
  'Nasi Bakar Tuna S': 'nasi bakar tuna.jpg',
  'Nasi Bakar Tuna L': 'nasi bakar tuna.jpg',
  'Nasi Bakar Tuna XL': 'nasi bakar tuna.jpg',
  'Nasi Bakar Ayam S': 'nasi bakar.jpg',
  'Nasi Bakar Ayam L': 'nasi bakar.jpg',
  'Nasi Bakar Ayam XL': 'nasi bakar.jpg',
  'Nasi Bakar Usus S': 'nasi bakar usus .jpg',
  'Nasi Bakar Usus L': 'nasi bakar usus .jpg',
  'Nasi Bakar Usus XL': 'nasi bakar usus .jpg',
  'Mineral': 'air mineral.jpg',
  'Nasi Ayam Bakar': 'nasi ayam bakar.jpg',
  'Nasi Ikan Bakar': 'Nasi Ikan Bakar.jpg',
  'Nasi Bebek Bakar': 'Nasi Bebek Bakar.jpg',
  'Es Teh': 'Es Teh..jpg',
  'Dimsum': 'Dimsum.jpg',
  'Spaghetti Carbonara': 'Resep-Spaghetti-Carbonara-Gurih-dan-Creamy-Ala-Restoran-Italia-.jpg.webp',       
  'Spaghetti Aglio e Olio': '28111939213_fc18b29d8f_o.jpg',    
  'Spaghetti Bolognese': 'https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/gambar-menu/Spaghetti.jpg',
  'Kroket': 'Kroket.jpg',
  'Mini Pizza': 'Mini Pizza.jpg',
  'Bakso Kecil': 'mie bakso kecil.jpg',
  'Bakso Besar': 'Bakso Biasa.jpg',
  'Bakso Kecil + Tetelan': 'Bakso + Tetelan.jpg',
  'Bakso Besar + Tetelan': 'bakso besar tetelan rill.webp',
  'Mie Ayam': 'Mie Ayam Biasa.jpg',
  'Mie Ayam + Bakso': 'mie ayam + bakso.jpg',
  'Mie Ayam + Pangsit Rebus': 'mie ayam pangsit rebus ril.jpeg',
  'Mie Ayam + Bakso + Pangsit': 'Mie Ayam Bakso & Pangsit..jpg',
  'Nasi Goreng': 'Nasi Goreng..jpg',
  'Nasi Goreng + Ati Ampela': 'Nasi Goreng Ati Ampela..jpg',
  'Mie Goreng': 'Mie Goreng..jpg',
  'Mie Goreng Seafood': 'mie goreng seafood.jpg',
  'Mie Rebus': 'mie rebus.jpg',
  'Kwetiau': 'Kwetiau Goreng.jpg'
};

function getImageUrl(menuName) {
  const fileName = IMAGE_MAP[menuName];
  if (fileName) { 
    if (fileName.startsWith('http')) { return fileName; }
    return `${BUCKET_URL}${encodeURIComponent(fileName)}`; 
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';
}

const KANTIN_DATA_HOME = [
  { id: 'warung_nusantara', title: 'Warung Nusantara', loc: 'Taman Asri, Kios 1', desc: 'Spesialis nasi bakar dengan aneka isian lezat. Tersedia porsi S, L, dan XL untuk memuaskan selera Anda.', img: 'https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/gambar-menu/Warung%20Nusantara.png' },
  { id: 'warung_sederhana', title: 'Warung Sederhana', loc: 'Taman Asri, Kios 2', desc: 'Menu masakan rumahan dengan bumbu bakar khas. Nikmati Ayam, Ikan, atau Bebek Bakar dengan harga bersahabat.', img: 'https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/gambar-menu/Warung%20Sederhana.png' },
  { id: 'warung_modern', title: 'Warung Modern', loc: 'Taman Asri, Kios 3', desc: 'Pilihan tepat untuk pecinta kuliner barat dan camilan. Tersedia dimsum, spaghetti, hingga mini pizza.', img: 'https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/gambar-menu/Warung%20Modern.png' },
  { id: 'warung_bakso_joss', title: 'Warung Bakso Joss', loc: 'Taman Asri, Kios 4', desc: 'Bakso sapi kenyal dengan kuah kaldu gurih. Bisa tambah tetelan untuk rasa yang lebih mantap!', img: 'https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/gambar-menu/Warung%20Bakso%20Joss.png' },
  { id: 'warung_mie_ayam', title: 'Warung Mie Ayam', loc: 'Taman Asri, Kios 5', desc: 'Mie ayam klasik dengan topping bakso dan pangsit. Porsi pas untuk makan siang mahasiswa.', img: 'https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/gambar-menu/Warung%20Mie%20Ayam.png' },
  { id: 'warung_wareg', title: 'Warung Wareg', loc: 'Taman Asri, Kios 6', desc: 'Solusi lapar dengan nasi goreng dan mie pilihan. Tersedia varian seafood dan ati ampela yang menggugah selera.', img: 'https://bwqqcbocgqgvjqyzcdrv.supabase.co/storage/v1/object/public/gambar-menu/Warung%20Wareg.png' }
];

function fmt(n) { return 'Rp ' + n.toLocaleString('id-ID'); }
function showToast(msg) { const t = document.getElementById('toast'); if(t) { t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); } }

// FUNGSI BARU: Custom Alert (Gantiin alert browser)
function showCustomAlert(message) {
  document.getElementById('customAlertMessage').textContent = message;
  document.getElementById('customAlertModal').classList.add('active');
}

function showPage(id, isReplace = false) { 
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); 
  document.getElementById(id).classList.add('active'); 
  
  if (id === 'cartPage') { 
    document.getElementById('namaInput').value = USER_NAME; 
    renderCart(); 
  } 
  window.scrollTo(0, 0); 
  
  if (isReplace) {
    history.replaceState({ page: id }, '', '#' + id);
  } else if (history.state === null || history.state.page !== id) {
    history.pushState({ page: id }, '', '#' + id);
  }
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.page) {
    if (event.state.page === 'cartPage' && cart.length === 0) {
        showPage('menuPage', true);
        return;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(event.state.page).classList.add('active');
    if (event.state.page === 'cartPage') { 
      document.getElementById('namaInput').value = USER_NAME; 
      renderCart(); 
    }
    window.scrollTo(0, 0);
  } else {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('homePage').classList.add('active');
  }
});

// ==========================================
// LOGIKA NOTIFIKASI (LONCENG)
// ==========================================
function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  const unreadCount = notifications.filter(n => !n.read).length;
  
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

function openNotificationModal() {
  const list = document.getElementById('notifList');
  
  if (notifications.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px;">Belum ada notifikasi pesanan.</p>';
  } else {
    list.innerHTML = notifications.map(n => `
      <div style="background: var(--bg); border: 1px solid var(--border); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
        <div style="font-weight: 700; color: var(--green); margin-bottom: 5px;">${KANTIN_NAMES[n.kantin_id] || n.kantin_id}</div>
        <div style="font-size: 13px; color: var(--text); margin-bottom: 5px;">Pesanan (${n.order_type}) sudah siap diambil.</div>
        <div style="font-size: 11px; color: var(--muted);">${n.time}</div>
      </div>
    `).join('');
  }
  
  document.getElementById('notificationModal').classList.add('active');
  notifications.forEach(n => n.read = true);
  saveNotifications();
  updateNotifBadge();
}

function openClearNotifModal() {
  document.getElementById('notificationModal').classList.remove('active');
  document.getElementById('confirmClearNotifModal').classList.add('active');
}

function closeClearNotifModal() {
  document.getElementById('confirmClearNotifModal').classList.remove('active');
  document.getElementById('notificationModal').classList.add('active');
}

function executeClearNotif() {
  notifications = [];
  saveNotifications();
  updateNotifBadge();
  document.getElementById('confirmClearNotifModal').classList.remove('active');
  openNotificationModal(); 
}

function closeNotificationModal() {
  document.getElementById('notificationModal').classList.remove('active');
}

// ==========================================

function renderHomeCards() {
  const grid = document.getElementById('homeCanteenGrid');
  if (!grid) return;
  grid.innerHTML = KANTIN_DATA_HOME.map(k => `
    <div class="canteen-card">
      <div class="canteen-img-wrapper">
        <img src="${k.img}" alt="${k.title}">
      </div>
      <div class="canteen-info">
        <div class="canteen-title">${k.title}</div>
        <div class="canteen-loc"><i class="fas fa-map-marker-alt"></i> ${k.loc}</div>
        <p class="canteen-desc">${k.desc}</p>
        <button class="btn-primary" onclick="pesanDariBeranda('${k.id}')" style="margin-top: 15px;">Pesan di ${k.title}</button>
      </div>
    </div>
  `).join('');
}

function pesanDariBeranda(kantinId) {
  updateKantinDisplay(kantinId);
  pickKantin(kantinId);
  showPage('menuPage');
}

async function fetchUserData() {
  if (isUserEligibleForPoints()) {
    if (activeKantin) {
      const { data: kantinPoin } = await sb.from('user_kantin_points').select('points').eq('user_id', USER_ID).eq('kantin_id', activeKantin).single();
      currentUserPoints = kantinPoin ? kantinPoin.points : 0;
      
      document.getElementById('userPointsDisplay').textContent = currentUserPoints;
      renderVoucherOptions();

      document.getElementById('pointCardTitle').textContent = `Poin di ${KANTIN_NAMES[activeKantin]}`;
      document.getElementById('modalPoints').textContent = currentUserPoints;
      document.getElementById('pointCardSub').textContent = "Poin ini hanya bisa dipakai di warung ini.";
    } else {
      currentUserPoints = 0;
      document.getElementById('pointCardTitle').textContent = "Poin Belum Dipilih";
      document.getElementById('modalPoints').textContent = "-";
      document.getElementById('pointCardSub').textContent = "Pilih warung dulu di halaman utama.";
    }
  }
}

function updateKantinDisplay(kantinId) {
  const textEl = document.getElementById('kantinSelectText');
  if (textEl) {
    textEl.textContent = kantinId && KANTIN_NAMES[kantinId] ? KANTIN_NAMES[kantinId] : 'Silahkan Pilih Warung';
  }
}

function openKantinModal() {
  const list = document.getElementById('kantinOptionsList');
  let html = '';
  
  for (const [id, name] of Object.entries(KANTIN_NAMES)) {
    let isActive = (activeKantin === id);
    html += `
      <div class="voucher-opt ${isActive ? 'active' : ''}" onclick="selectKantinFromModal('${id}')">
        <div class="voucher-opt-title">${name}</div>
        ${isActive ? '<i class="fas fa-check-circle" style="color:var(--green);"></i>' : ''}
      </div>
    `;
  }
  
  list.innerHTML = html;
  document.getElementById('kantinModal').classList.add('active');
}

function closeKantinModal() { document.getElementById('kantinModal').classList.remove('active'); }

function selectKantinFromModal(kantinId) {
  closeKantinModal();
  pickKantin(kantinId);
}

function renderVoucherOptions() {
  const container = document.getElementById('voucherContainer');
  const list = document.getElementById('voucherOptionsList');
  const selectedText = document.getElementById('selectedVoucherText');
  
  if (!isUserEligibleForPoints() || currentUserPoints < 10) {
    container.style.display = 'none'; 
    if (activeVoucher) { activeVoucher = null; activeVoucherPoints = 0; renderCart(); }
    return;
  }
  
  container.style.display = 'block';
  
  if (activeVoucher) {
    selectedText.innerHTML = `Tukar ${activeVoucherPoints} Poin (Diskon ${activeVoucher}%)`;
    selectedText.style.color = 'var(--green)';
  } else {
    selectedText.innerHTML = 'Tidak pakai voucher';
    selectedText.style.color = 'var(--muted)';
  }

  let html = '';
  html += `
    <div class="voucher-opt ${!activeVoucher ? 'active' : ''}" onclick="selectVoucherFromModal(0, 0)">
      <div>
        <div class="voucher-opt-title">Tidak pakai voucher</div>
        <div class="voucher-opt-desc">Gunakan poin Anda nanti</div>
      </div>
      ${!activeVoucher ? '<i class="fas fa-check-circle" style="color:var(--green);"></i>' : ''}
    </div>
  `;

  let maxTier = Math.floor(currentUserPoints / 10) * 10;
  
  for (let pts = maxTier; pts >= 10; pts -= 10) {
    let persen = pts / 2; 
    let isActive = (activeVoucher == persen);
    html += `
      <div class="voucher-opt ${isActive ? 'active' : ''}" onclick="selectVoucherFromModal(${persen}, ${pts})">
        <div>
          <div class="voucher-opt-title">Tukar ${pts} Poin</div>
          <div class="voucher-opt-desc">Dapatkan diskon ${persen}%</div>
        </div>
        ${isActive ? '<i class="fas fa-check-circle" style="color:var(--green);"></i>' : ''}
      </div>
    `;
  }
  list.innerHTML = html;
}

function openVoucherModal() { document.getElementById('voucherModal').classList.add('active'); }
function closeVoucherModal() { document.getElementById('voucherModal').classList.remove('active'); }

function selectVoucherFromModal(persen, pointsUsed) {
  activeVoucher = parseInt(persen) > 0 ? parseInt(persen) : null;
  activeVoucherPoints = parseInt(pointsUsed) > 0 ? parseInt(pointsUsed) : 0;
  closeVoucherModal();
  renderVoucherOptions();
  renderCart();
}

// ==========================================
// LOGIKA PILIH PEDAS (REVISI)
// ==========================================
function openSpicyModal() {
  let currentLevel = null; 
  if (!isAddingFromMenu && currentCartIndexToEdit !== null && cart[currentCartIndexToEdit]) {
    currentLevel = cart[currentCartIndexToEdit].spicy;
  }
  
  tempSpicyLevel = currentLevel;
  renderSpicyOptions();
  document.getElementById('spicyModal').classList.add('active');
}

function renderSpicyOptions() {
  const list = document.getElementById('spicyOptionsList');
  const options = ["Tidak Pedas", "Sedang", "Extra Pedas"];
  let html = '';
  
  options.forEach(opt => {
    let isActive = (tempSpicyLevel === opt);
    html += `
      <div class="voucher-opt ${isActive ? 'active' : ''}" onclick="selectSpicyOption('${opt}')">
        <div class="voucher-opt-title">${opt}</div>
        ${isActive ? '<i class="fas fa-check-circle" style="color:var(--green);"></i>' : ''}
      </div>
    `;
  });
  
  list.innerHTML = html;
}

function selectSpicyOption(level) {
  tempSpicyLevel = level;
  renderSpicyOptions(); // Cuma update tampilan ceklis
}

function confirmSpicySelection() {
  if (!tempSpicyLevel) {
    showToast('Silakan pilih level pedas terlebih dahulu!');
    return;
  }

  if (isAddingFromMenu && pendingAddItemId) {
    const existingIndex = cart.findIndex(c => c.id == pendingAddItemId && c.spicy === tempSpicyLevel);
    
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({ id: pendingAddItemId, qty: 1, spicy: tempSpicyLevel, note: '' });
    }
    updateCartBadge();
    showToast('Ditambahkan ke keranjang'); 
    
    if (document.getElementById('cartPage').classList.contains('active')) {
      renderCart();
    }
  } else if (currentCartIndexToEdit !== null) {
    cart[currentCartIndexToEdit].spicy = tempSpicyLevel;
    renderCart();
  }
  
  closeSpicyModal();
}

function closeSpicyModal() { 
  document.getElementById('spicyModal').classList.remove('active'); 
  currentCartIndexToEdit = null;
  pendingAddItemId = null;
  isAddingFromMenu = false;
  tempSpicyLevel = null;
}
// ==========================================

async function openProfileModal() {
  document.getElementById('profileModal').classList.add('active');
  document.getElementById('profileUserNameDisplay').textContent = USER_NAME;

  if (isUserEligibleForPoints()) {
    document.getElementById('pointCardDisplay').style.display = 'block';
    document.getElementById('guestCardDisplay').style.display = 'none';
    fetchUserData(); 
    
    if (USER_ROLE === 'pelanggan') {
      document.getElementById('pointCardTitle').textContent = "Poin Pelanggan";
    }
  } else {
    document.getElementById('pointCardDisplay').style.display = 'none';
    document.getElementById('guestCardDisplay').style.display = 'block';
  }

  const list = document.getElementById('historyList');
  list.innerHTML = '<p style="text-align:center; color:var(--muted);">Memuat riwayat...</p>';
  
  const { data } = await sb.from('orders').select('*').eq('user_id', USER_ID).order('created_at', { ascending: false });
  
  if (!data || data.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:var(--muted);">Belum ada riwayat pesanan.</p>';
    return;
  }

  list.innerHTML = data.map(o => {
    const d = new Date(o.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
    let itemDetails = '';
    if (o.items) {
      itemDetails = o.items.split(';').map(itemStr => {
        const parts = itemStr.split('|');
        if (parts.length >= 4) {
          const name = parts[0];
          const qty = parseInt(parts[2]);
          const subTotal = parseInt(parts[3]);
          const spicy = parts[4] ? `<span style="color:var(--danger); font-size:11px;">(${parts[4]})</span>` : '';
          return `
            <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text); margin-top:6px;">
              <span>${name} ${spicy} <b style="color:var(--muted); font-size:11px;">x${qty}</b></span>
              <span>${fmt(subTotal)}</span>
            </div>`;
        }
        return '';
      }).join('');
    }

    return `
      <div class="history-item" style="padding-bottom: 15px; border-bottom: 1px dashed var(--border); margin-bottom: 15px;">
        <div class="history-header" style="margin-bottom: 5px;">
          <span style="color:var(--primary); font-weight:600;">${KANTIN_NAMES[o.kantin_id] || o.kantin_id}</span>
          <span style="color:var(--green); font-weight:700;">${fmt(o.total_amount)}</span>
        </div>
        <div class="history-detail" style="margin-bottom: 10px;">
          ${d} • Meja ${o.no_meja} • Status: <b>${o.status}</b>
        </div>
        
        <div style="background: var(--bg); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
          ${itemDetails}
          <div style="border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px; display:flex; justify-content:space-between; font-size:13px; font-weight:bold;">
            <span>Total (+ Pajak)</span>
            <span>${fmt(o.total_amount)}</span>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top: 10px;">
          <button onclick="hapusRiwayat(${o.id})" style="background:none; border:none; color:var(--red, #dc4a3d); cursor:pointer; padding:5px; font-size:12px; display:flex; align-items: center; gap:5px;">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openEditProfileModal() {
  document.getElementById('editNameInput').value = USER_NAME;
  document.getElementById('editEmailInput').value = USER_ID;
  document.getElementById('editProfileError').style.display = 'none';
  
  if (USER_ROLE === 'mahasiswa') {
    document.getElementById('emailInputGroup').style.display = 'none';
  } else {
    document.getElementById('emailInputGroup').style.display = 'block';
  }
  
  document.getElementById('editProfileModal').classList.add('active');
}

function closeEditProfileModal() {
  document.getElementById('editProfileModal').classList.remove('active');
}

async function saveProfileChanges() {
  const newName = document.getElementById('editNameInput').value.trim();
  const newEmail = document.getElementById('editEmailInput').value.trim();
  const err = document.getElementById('editProfileError');
  const btn = document.getElementById('btnSaveProfile');

  if (!newName || newName.length < 3) {
    err.textContent = "Nama minimal 3 karakter!"; err.style.display = 'block'; return;
  }
  
  let newId = USER_ID;
  if (USER_ROLE !== 'mahasiswa') {
    if (!newEmail) {
      err.textContent = "Email tidak boleh kosong!"; err.style.display = 'block'; return;
    }
    newId = newEmail;
  }

  btn.disabled = true; btn.textContent = "Menyimpan...";
  err.style.display = 'none';

  try {
    // JIKA EMAIL BERUBAH (Khusus Pelanggan)
    if (newId !== USER_ID) {
      // Cek apakah email baru udah dipake orang lain di tabel public.users
      const { data: exist } = await sb.from('users').select('id').eq('id', newId).single();
      if (exist) {
        err.textContent = "Email sudah digunakan akun lain!"; err.style.display = 'block';
        btn.disabled = false; btn.textContent = "Simpan Perubahan"; return;
      }

      // Minta Supabase Auth ngirim OTP ke email baru
      const { error: authErr } = await sb.auth.updateUser({ email: newId });
      
      if (authErr) throw authErr;

      // Tampilkan modal OTP
      pendingNewEmail = newId;
      closeEditProfileModal();
      document.getElementById('otpChangeEmailModal').classList.add('active');
      document.getElementById('btnConfirmOtpChange').disabled = false;
      document.getElementById('btnConfirmOtpChange').textContent = "Verifikasi & Simpan";
      
      showCustomAlert("Kode OTP telah dikirim ke email baru Anda. Silakan cek kotak masuk/spam.");
      
    } else {
      // JIKA EMAIL TETAP (Cuma ganti nama)
      const { error: updateErr } = await sb.from('users').update({ nama: newName }).eq('id', USER_ID);
      if (updateErr) throw updateErr;

      sessionStorage.setItem('user_name', newName);
      document.getElementById('navUserName').textContent = newName;
      document.getElementById('profileUserNameDisplay').textContent = newName;
      
      closeEditProfileModal();
      showCustomAlert('Nama profil berhasil diupdate!');
      
      setTimeout(() => { window.location.reload(); }, 1500);
    }

  } catch (error) {
    err.textContent = "Gagal menyimpan: " + error.message;
    err.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = "Simpan Perubahan";
  }
}

// FUNGSI BARU: Konfirmasi OTP Ganti Email
async function confirmEmailChangeOTP() {
  const token = document.getElementById('otpChangeInput').value.trim();
  const err = document.getElementById('otpChangeError');
  const btn = document.getElementById('btnConfirmOtpChange');

  if (!token) { err.textContent = "Masukkan kode OTP!"; err.style.display = 'block'; return; }

  btn.disabled = true; btn.textContent = "Memverifikasi...";
  err.style.display = 'none';

  try {
    // 1. Verifikasi OTP email_change
    const { error: verifyErr } = await sb.auth.verifyOtp({
      email: pendingNewEmail,
      token: token,
      type: 'email_change'
    });

    if (verifyErr) throw verifyErr;

    // 2. Jika sukses, update ID di tabel public.users
    const newName = document.getElementById('editNameInput').value.trim();
    const { error: updateErr } = await sb.from('users').update({ id: pendingNewEmail, nama: newName }).eq('id', USER_ID);
    if (updateErr) throw updateErr;

    // 3. Update ID di tabel orders dan points
    await sb.from('orders').update({ user_id: pendingNewEmail }).eq('user_id', USER_ID);
    await sb.from('user_kantin_points').update({ user_id: pendingNewEmail }).eq('user_id', USER_ID);

    // 4. Update session
    sessionStorage.setItem('user_id', pendingNewEmail);
    sessionStorage.setItem('user_name', newName);

    // 👇 LOGOUT PAKSA DARI SUPABASE AUTH 👇
    await sb.auth.signOut();

    closeOtpChangeEmailModal();
    showCustomAlert('Email dan Profil berhasil diubah! Silakan login kembali.');
    
    setTimeout(() => { 
      sessionStorage.clear();
      window.location.href = 'index.html'; 
    }, 2000);

  } catch (error) {
    err.textContent = "Kode OTP salah atau sudah kedaluwarsa."; err.style.display = 'block';
  } finally {
    btn.disabled = false; btn.textContent = "Verifikasi & Simpan";
  }
}

function closeOtpChangeEmailModal() {
  document.getElementById('otpChangeEmailModal').classList.remove('active');
  document.getElementById('otpChangeError').style.display = 'none';
  pendingNewEmail = null;
}

let deleteTargetId = null;

function hapusRiwayat(id) {
  deleteTargetId = id;
  document.getElementById('confirmDeleteModal').classList.add('active');
}

function closeConfirmModal() {
  document.getElementById('confirmDeleteModal').classList.remove('active');
  deleteTargetId = null;
}

async function executeDelete() {
  if (!deleteTargetId) return;
  
  const btn = document.getElementById('btnConfirmDelete');
  btn.disabled = true;
  btn.textContent = 'Menghapus...';

  const { error } = await sb.from('orders').delete().eq('id', deleteTargetId);
  
  closeConfirmModal();
  btn.disabled = false;
  btn.textContent = 'Hapus';

  if (!error) {
    showToast('Riwayat berhasil dihapus'); 
    openProfileModal(); 
  } else { 
    showCustomAlert('Gagal menghapus riwayat'); 
  }
}

function openClearCartModal() {
  document.getElementById('confirmClearCartModal').classList.add('active');
}

function closeClearCartModal() {
  document.getElementById('confirmClearCartModal').classList.remove('active');
}

function executeClearCart() {
  cart = [];
  updateCartBadge();
  closeClearCartModal();
  showToast('Keranjang berhasil dikosongkan');
  showPage('menuPage');
}

function openLogoutModal() {
  const title = document.getElementById('logoutTitle');
  const desc = document.getElementById('logoutDesc');

  if (USER_ROLE === 'guest') {
    title.textContent = 'Yakin Mau Keluar?';
    desc.innerHTML = 'Anda saat ini masuk sebagai <b>Guest</b>. Jika keluar, sesi ini akan berakhir dan Anda <b>tidak bisa melihat riwayat pesanan</b> Anda lagi.';
  } else {
    title.textContent = 'Yakin Mau Logout?';
    desc.innerHTML = 'Anda harus masuk kembali untuk bisa memesan makanan.';
  }

  document.getElementById('confirmLogoutModal').classList.add('active');
}

function closeLogoutModal() {
  document.getElementById('confirmLogoutModal').classList.remove('active');
}

function executeLogout() {
  sessionStorage.clear(); 
  window.location.href = 'index.html'; 
}

function pickKantin(kantinId) {
  if (cart.length > 0 && activeKantin !== kantinId) {
    pendingSwitchKantinId = kantinId;
    updateKantinDisplay(activeKantin);
    document.getElementById('confirmSwitchModal').classList.add('active');
    return;
  }
  loadKantin(kantinId);
}

function closeSwitchModal() {
  document.getElementById('confirmSwitchModal').classList.remove('active');
  pendingSwitchKantinId = null;
}

function executeSwitchKantin() {
  if (!pendingSwitchKantinId) return;
  
  cart = []; 
  updateCartBadge();
  
  updateKantinDisplay(pendingSwitchKantinId);
  const target = pendingSwitchKantinId;
  
  closeSwitchModal();
  loadKantin(target);
}

async function loadKantin(kantinId) {
  activeKantin = kantinId || null;
  activeVoucher = null;
  activeVoucherPoints = 0;
  currentCartIndexToEdit = null; 
  
  updateKantinDisplay(activeKantin);

  const catTabs = document.getElementById('catTabs');

  if (!activeKantin) {
    catTabs.style.display = 'none';
    document.getElementById('menuGrid').innerHTML = '';
    document.getElementById('sectionTitle').textContent = 'Pilih Warung Terlebih Dahulu';
    return;
  }
  
  catTabs.style.display = 'flex';
  document.getElementById('menuGrid').innerHTML = '<div style="text-align:center; padding:3rem;">Memuat menu...</div>';
  menu = await getMenu(activeKantin);
  fetchUserData(); 
  
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.cat-btn').classList.add('active');
  
  document.getElementById('sectionTitle').textContent = 'Menu Pilihan';
  renderMenu('semua');

  if (typeof initMenuRealtimeListener === 'function') {
    initMenuRealtimeListener(activeKantin);
  }
}

function renderMenu(cat) {
  const grid = document.getElementById('menuGrid');
  if (!activeKantin) { grid.innerHTML = ''; return; }
  
  let filtered = cat === 'semua' ? menu : menu.filter(m => m.category === cat);
  if (filtered.length === 0) { grid.innerHTML = '<div style="text-align:center; padding:3rem;">Menu kosong.</div>'; return; }

  grid.innerHTML = filtered.map(item => {
    const imgUrl = getImageUrl(item.name);
    const points = item.price < 10000 ? 1 : (item.price <= 20000 ? 2 : 3);
    
    const isAvailable = item.is_available !== false; 
    
    const pointBadge = isUserEligibleForPoints() ? `<span style="background: #FFF3E0; color: #E65100; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap;">+${points} 🪙</span>` : '';
    
    const habisBadge = !isAvailable ? `<span style="background: #FEE2E2; color: #DC4A3D; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap;">Habis</span>` : '';

    const btnHtml = isAvailable 
      ? `<button class="add-btn" onclick="addToCart(${item.id})">Tambah</button>`
      : `<button class="add-btn" style="background:#cbd5e1; cursor:not-allowed;" disabled>Habis</button>`;

    return `
    <div class="menu-card" style="${!isAvailable ? 'opacity: 0.7;' : ''}">
      <div class="menu-img">
        <img src="${imgUrl}" alt="${item.name}" style="${!isAvailable ? 'filter: grayscale(100%);' : ''}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'">
      </div>
      <div class="menu-name">${item.name}</div>
      <div class="menu-desc">${item.description}</div>
      <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 1rem;">
        <span class="menu-price" style="margin-bottom: 0;">${fmt(item.price)}</span>
        ${isAvailable ? pointBadge : habisBadge}
      </div>
      ${btnHtml}
    </div>
  `}).join('');
}

function filterCat(cat, el) {
  if (!activeKantin) { showToast('Pilih warung dulu!'); return; }
  activeCat = cat; document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active')); if (el) el.classList.add('active');
  const titles = { semua: 'Menu Pilihan', makanan: 'Makanan', minuman: 'Minuman', snack: 'Snack' };
  document.getElementById('sectionTitle').textContent = titles[cat] || 'Menu';
  renderMenu(cat);
}

function addToCart(id) {
  const item = menu.find(m => m.id == id);
  
  if (item.is_available === false) {
    showToast('Maaf, menu ini sedang habis.');
    return;
  }

  const isMinuman = item.category === 'minuman';
  
  if (isMinuman) {
    const existingIndex = cart.findIndex(c => c.id == id && c.spicy === null);
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({ id: id, qty: 1, spicy: null, note: '' });
    }
    updateCartBadge(); 
    showToast('Ditambahkan ke keranjang'); 
    
    if (document.getElementById('cartPage').classList.contains('active')) {
      renderCart();
    }
  } else {
    pendingAddItemId = id;
    isAddingFromMenu = true;
    openSpicyModal();
  }
}

function openSpicyModalForCart(index) {
  currentCartIndexToEdit = index;
  isAddingFromMenu = false;
  openSpicyModal();
}

function changeQty(index, delta) { 
  cart[index].qty += delta; 
  if (cart[index].qty <= 0) cart.splice(index, 1); 
  
  updateCartBadge(); 
  
  if (cart.length === 0) { 
    showToast('Keranjang kosong');
    showPage('menuPage');
    document.getElementById('mejaInput').value = '';
  } else {
    renderCart(); 
  }
}

function updateCartBadge() { 
  document.getElementById('cartBadge').textContent = cart.reduce((a, b) => a + b.qty, 0); 
}

function showCart() { 
  if (cart.length === 0) { showToast('Keranjang kosong'); return; } 
  showPage('cartPage'); 
}

function updateItemNote(index, val) {
  cart[index].note = val;
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');
  
  if (cart.length === 0) { 
    itemsEl.innerHTML = '<div class="empty-cart">Keranjang kosong</div>'; 
    summaryEl.innerHTML = ''; 
    return; 
  }

  itemsEl.innerHTML = cart.map((c, index) => {
    const item = menu.find(m => m.id == c.id);
    const imgUrl = getImageUrl(item.name);
    
    let spicyBtn = '';
    if (c.spicy !== null) {
      spicyBtn = `
        <button onclick="openSpicyModalForCart(${index})" style="margin-top: 5px; font-size: 11px; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border); background: var(--bg); cursor: pointer; display: flex; align-items: center; gap: 5px; transition: 0.2s;">
          <i class="fas fa-pepper-hot" style="color: var(--danger);"></i> ${c.spicy}
        </button>
      `;
    }

    const plusAction = c.spicy === null ? `changeQty(${index}, 1)` : `addToCart(${c.id})`;

    return `
    <div class="cart-item" style="flex-direction: column; align-items: stretch;">
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div class="cart-item-info">
          <div class="cart-item-icon"><img src="${imgUrl}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'"></div>
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${fmt(item.price)}</div>
            ${spicyBtn}
          </div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" onclick="${plusAction}">+</button>
        </div>
      </div>
      <div style="margin-top: 10px; width: 100%;">
        <input type="text" placeholder="Tambah catatan (misal: tanpa sayur)" value="${c.note || ''}" oninput="updateItemNote(${index}, this.value)" style="width: 100%; padding: 8px 12px; border: 1px dashed var(--border); border-radius: 6px; font-size: 12px; font-family: inherit; outline: none;">
      </div>
    </div>`;
  }).join('');

  const subtotal = cart.reduce((s, c) => {
    const item = menu.find(m => m.id == c.id);
    return s + (item.price * c.qty);
  }, 0);
  
  const tax = Math.round(subtotal * 0.1);
  
  let discount = 0;
  if (activeVoucher) { discount = Math.round(subtotal * (activeVoucher / 100)); }
  
  const total = subtotal + tax - discount;

  summaryEl.innerHTML = `
    <div class="cart-summary">
      <div class="summary-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="summary-row"><span>Pajak (10%)</span><span>${fmt(tax)}</span></div>
      ${discount > 0 ? `<div class="summary-row" style="color:var(--green); font-weight:600;"><span>Diskon Voucher (${activeVoucher}%)</span><span>- ${fmt(discount)}</span></div>` : ''}
      <div class="summary-row total"><span>Total</span><span>${fmt(total)}</span></div>
    </div>`;
}

function setOrderType(type) {
  currentOrderType = type;
  const btnDineIn = document.getElementById('btnDineIn');
  const btnTakeAway = document.getElementById('btnTakeAway');
  const mejaFormGroup = document.getElementById('mejaFormGroup');

  if (type === 'Dine In') {
    btnDineIn.style.background = 'var(--primary-btn)';
    btnDineIn.style.color = 'white';
    btnDineIn.style.borderColor = 'var(--primary-btn)';
    
    btnTakeAway.style.background = 'transparent';
    btnTakeAway.style.color = 'var(--text)';
    btnTakeAway.style.borderColor = 'var(--border)';
    
    mejaFormGroup.style.display = 'block'; 
  } else if (type === 'Take Away') {
    btnTakeAway.style.background = 'var(--primary-btn)';
    btnTakeAway.style.color = 'white';
    btnTakeAway.style.borderColor = 'var(--primary-btn)';
    
    btnDineIn.style.background = 'transparent';
    btnDineIn.style.color = 'var(--text)';
    btnDineIn.style.borderColor = 'var(--border)';
    
    mejaFormGroup.style.display = 'none'; 
  } else {
    btnDineIn.style.background = 'transparent';
    btnDineIn.style.color = 'var(--text)';
    btnDineIn.style.borderColor = 'var(--border)';
    
    btnTakeAway.style.background = 'transparent';
    btnTakeAway.style.color = 'var(--text)';
    btnTakeAway.style.borderColor = 'var(--border)';
    
    mejaFormGroup.style.display = 'none'; 
  }
}

function proceedToPayment() {
  const name = document.getElementById('namaInput').value.trim();
  let meja = document.getElementById('mejaInput').value.trim();

  if (!currentOrderType) {
    showToast('Silakan pilih Tipe Pesanan (Dine In / Take Away) terlebih dahulu!'); 
    return; 
  }

  if (!name || name.length < 3) { 
    showToast('Nama Pemesan minimal 3 karakter!'); 
    return; 
  }
  
  if (currentOrderType === 'Dine In') {
    if (!meja) { showToast('Nomor Meja harus diisi untuk Dine In!'); return; }
    if (!/^\d+$/.test(meja)) { showToast('Nomor Meja hanya boleh berisi angka!'); return; }
    if (meja.length > 2) { showToast('Nomor Meja maksimal 2 angka!'); return; }
  } else {
    meja = '-'; 
  }

  const subtotal = cart.reduce((s, c) => {
    const item = menu.find(m => m.id == c.id);
    return s + (item.price * c.qty);
  }, 0);
  
  const tax = Math.round(subtotal * 0.1);
  
  let discount = 0;
  if (activeVoucher) discount = Math.round(subtotal * (activeVoucher / 100)); 
  const total = subtotal + tax - discount;

  const itemsString = cart.map(c => { 
    const m = menu.find(x => x.id == c.id); 
    return `${m.name}|${m.price}|${c.qty}|${m.price * c.qty}|${c.spicy || ''}|${c.note || ''}`; 
  }).join(';');

  const waktuLokal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  let earnedPoints = 0;
  cart.forEach(c => {
    const item = menu.find(m => m.id == c.id);
    if (item.price < 10000) earnedPoints += 1 * c.qty;
    else if (item.price <= 20000) earnedPoints += 2 * c.qty;
    else earnedPoints += 3 * c.qty;
  });

  orderData = { name, meja, catat: `[${currentOrderType}]`, total, items: itemsString, rawCart: [...cart], kantin: activeKantin, waktu: waktuLokal, discount, earnedPoints };

  document.getElementById('payAmount').textContent = fmt(total);
  document.getElementById('orderInfoPay').innerHTML = `
    <div class="info-row"><span>Warung</span><span>${KANTIN_NAMES[activeKantin]}</span></div>
    <div class="info-row"><span>Tipe</span><span>${currentOrderType}</span></div>
    <div class="info-row"><span>Nama</span><span>${name}</span></div>
    <div class="info-row"><span>Meja</span><span>${meja}</span></div>
    ${discount > 0 ? `<div class="info-row"><span>Diskon</span><span style="color:var(--green);">- ${fmt(discount)}</span></div>` : ''}
  `;
  showPage('paymentPage');
}

async function confirmPayment() {
  const btn = document.querySelector('#paymentPage .btn-primary');
  btn.disabled = true; btn.textContent = "Memproses...";

  const finalData = {
    no_meja: orderData.meja,
    nama_pemesan: orderData.name,
    total_amount: orderData.total,
    catatan: orderData.catat,
    items: orderData.items,
    status: 'Proses',
    kantin_id: orderData.kantin,
    tipe_user: USER_ROLE,
    user_id: USER_ID
  };

  try {
    await saveOrder(finalData);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const { count: activeQueueCount } = await sb.from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('kantin_id', activeKantin)
      .neq('status', 'Selesai')
      .gte('created_at', today.toISOString()); 

    let queueWarningHtml = '';
    if (activeQueueCount && activeQueueCount >= 5) {
      queueWarningHtml = `
        <div style="background: #FFF3CD; color: #856404; border: 1px solid #FFEEBA; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: left; font-size: 13px; line-height: 1.5;">
          <i class="fas fa-exclamation-triangle" style="color: #F4A261; margin-right: 8px;"></i>
          <b>Warung sedang ramai!</b><br>
          Mohon maaf jika menunggu lebih lama, pesanan Anda akan segera diproses.
        </div>
      `;
    }

    let sisaPoin = currentUserPoints;
    
    if (isUserEligibleForPoints()) {
      if (activeVoucherPoints > 0) {
        sisaPoin -= activeVoucherPoints;
      }
      sisaPoin += orderData.earnedPoints;
      
      const { data: cekPoin } = await sb.from('user_kantin_points').select('*').eq('user_id', USER_ID).eq('kantin_id', activeKantin).single();
      
      if (cekPoin) {
        await sb.from('user_kantin_points').update({ points: sisaPoin }).eq('user_id', USER_ID).eq('kantin_id', activeKantin);
      } else {
        await sb.from('user_kantin_points').insert([{ user_id: USER_ID, kantin_id: activeKantin, points: sisaPoin }]);
      }
    }

    cart = [];             
    updateCartBadge();     

    document.getElementById('successInfo').innerHTML = `
      <div class="info-row"><span>Nama</span><span>${orderData.name}</span></div>
      <div class="info-row"><span>Meja</span><span>${orderData.meja}</span></div>
      <div class="info-row"><span>Total Bayar</span><span>${fmt(orderData.total)}</span></div>
      ${isUserEligibleForPoints() ? `<div class="info-row" style="color:var(--green);"><span>Poin Didapat</span><span>+${orderData.earnedPoints} Poin</span></div>` : ''}
      
      ${queueWarningHtml}
    `;
    
    showPage('successPage', true);
  } catch (err) {
    showCustomAlert("Gagal: " + err.message);
  } finally {
    btn.disabled = false; btn.textContent = "Konfirmasi Pembayaran";
  }
}

function resetAll() {
  cart = []; orderData = {}; activeVoucher = null; activeVoucherPoints = 0; currentCartIndexToEdit = null;
  document.querySelectorAll('input').forEach(i => { if(i.id !== 'namaInput') i.value = ''; });
  currentOrderType = null; 
  setOrderType(null); 
  updateCartBadge(); showPage('menuPage');
}

function initTakeAwayListener() {
  sb.channel('takeaway-status-' + USER_ID)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${USER_ID}` }, (payload) => {
      const newOrder = payload.new;
      const oldOrder = payload.old;

      if (newOrder.status === 'Selesai' && oldOrder.status !== 'Selesai' && newOrder.catatan && newOrder.catatan.includes('[Take Away]')) {
        
        let notifiedOrders = JSON.parse(sessionStorage.getItem('notified_takeaway') || '[]');
        if (!notifiedOrders.includes(newOrder.id)) {
          notifiedOrders.push(newOrder.id);
          sessionStorage.setItem('notified_takeaway', JSON.stringify(notifiedOrders));
          
          document.getElementById('takeAwayReadyModal').classList.add('active');
          
          const now = new Date();
          const tgl = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
          const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          
          notifications.push({
            id: newOrder.id,
            kantin_id: newOrder.kantin_id,
            order_type: 'Take Away',
            time: `${tgl} • ${jam}`,
            read: false 
          });
          
          saveNotifications(); 
          updateNotifBadge();

          try {
            let audioBeep = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
            audioBeep.volume = 1.0; 
            audioBeep.play().catch(e => console.log('Audio autoplay diblokir browser'));

            voiceAudio.currentTime = 0; 
            voiceAudio.play().catch(err => {
              let msg = new SpeechSynthesisUtterance("Pesanan telah selesai, silakan ambil di kasir.");
              msg.lang = 'id-ID';
              window.speechSynthesis.speak(msg);
            });
            
          } catch(e) { console.log('Fitur suara tidak didukung'); }
        }
      }
    })
    .subscribe();
}

function initMenuRealtimeListener(kantinId) {
  if (menuChannel) {
    sb.removeChannel(menuChannel);
  }

  menuChannel = sb.channel('menu-status-' + kantinId)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu', filter: `kantin_id=eq.${kantinId}` }, (payload) => {
      const updatedMenu = payload.new;
      
      const index = menu.findIndex(m => m.id === updatedMenu.id);
      
      if (index !== -1) {
        menu[index] = updatedMenu;
        
        renderMenu(activeCat);

        if (updatedMenu.is_available === false) {
          showToast(`⚠️ ${updatedMenu.name} baru saja habis!`);
        } else {
          showToast(`✅ ${updatedMenu.name} sudah tersedia kembali!`);
        }
      }
    })
    .subscribe();
}

document.addEventListener('DOMContentLoaded', () => {
  if (!history.state) {
    history.replaceState({ page: 'homePage' }, '', '#homePage');
  }

  document.getElementById('navUserName').textContent = USER_NAME;
  renderHomeCards();
  
  updateNotifBadge();

  document.body.addEventListener('click', () => {
    if (voiceAudio.paused) {
      voiceAudio.play().then(() => {
        voiceAudio.pause(); 
        voiceAudio.currentTime = 0;
      }).catch(e => {});
    }
  }, { once: true });

  initTakeAwayListener();

  const slides = document.querySelectorAll('.hero-bg');
  if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 4000); 
  }
});
