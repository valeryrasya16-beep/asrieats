const USER_ID = sessionStorage.getItem('user_id');
const USER_NAME = sessionStorage.getItem('user_name');
const USER_ROLE = sessionStorage.getItem('user_role');

if (!USER_ID) { window.location.href = 'index.html'; }

let menu = [], cart = {}, orderData = {}, activeCat = 'semua', activeKantin = null;
let currentUserPoints = 0; 
let activeVoucher = null; 
let activeVoucherPoints = 0; 
const KANTIN_NAMES = { 
  'warung_nusantara': 'Warung Nusantara', 
  'warung_sederhana': 'Warung Sederhana', 
  'warung_modern': 'Warung Modern',
  'warung_bakso_joss': 'Warung Bakso Joss',
  'warung_mie_ayam': 'Warung Mie Ayam',
  'warung_wareg': 'Warung Wareg'
};

// ==========================================
// KAMUS GAMBAR OTOMATIS
// ==========================================
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
  'Spaghetti': 'Spaghetti.jpg',
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
  if (fileName) { return `${BUCKET_URL}${encodeURIComponent(fileName)}`; }
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
function showPage(id) { document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.getElementById(id).classList.add('active'); if (id === 'cartPage') { document.getElementById('namaInput').value = USER_NAME; renderCart(); } window.scrollTo(0, 0); }

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
  document.getElementById('kantinSelect').value = kantinId;
  pickKantin(kantinId);
  showPage('menuPage');
}

async function fetchUserData() {
  if (USER_ROLE === 'mahasiswa') {
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

function renderVoucherOptions() {
  const container = document.getElementById('voucherContainer');
  const list = document.getElementById('voucherList');
  
  if (USER_ROLE !== 'mahasiswa' || currentUserPoints < 10) {
    container.style.display = 'none'; 
    if (activeVoucher) { activeVoucher = null; activeVoucherPoints = 0; renderCart(); }
    return;
  }
  
  container.style.display = 'block';
  let html = '';

  let maxTier = Math.floor(currentUserPoints / 10) * 10;
  
  for (let pts = maxTier; pts >= 10; pts -= 10) {
    let persen = pts / 2; 
    html += `<label style="display:flex; align-items:center; gap:10px; font-size:14px; margin-bottom:10px;">
      <input type="radio" name="voucher" value="${persen}" onchange="pilihVoucher(${persen}, ${pts})" ${activeVoucher === persen ? 'checked' : ''} style="width:auto;"> 
      <b>Tukar ${pts} Poin</b> (Diskon ${persen}%)
    </label>`;
  }

  html += `<label style="display:flex; align-items:center; gap:10px; font-size:14px; margin-top: 10px; border-top: 1px dashed var(--border); padding-top: 10px;">
    <input type="radio" name="voucher" value="0" onchange="pilihVoucher(0, 0)" ${!activeVoucher ? 'checked' : ''} style="width:auto;"> 
    Tidak pakai voucher
  </label>`;

  list.innerHTML = html;
}

function pilihVoucher(persen, pointsUsed) {
  activeVoucher = persen > 0 ? persen : null;
  activeVoucherPoints = pointsUsed > 0 ? pointsUsed : 0;
  renderCart();
}

async function openProfileModal() {
  document.getElementById('profileModal').classList.add('active');
  
  if (USER_ROLE === 'mahasiswa') {
    document.getElementById('pointCardDisplay').style.display = 'block';
    document.getElementById('guestCardDisplay').style.display = 'none';
    fetchUserData(); 
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
          return `
            <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text); margin-top:6px;">
              <span>${name} <b style="color:var(--muted); font-size:11px;">x${qty}</b></span>
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
          ${d} • Antrean ${o.no_antrean} • Status: <b>${o.status}</b>
        </div>
        
        <div style="background: var(--bg); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
          ${itemDetails}
          <div style="border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px; display:flex; justify-content:space-between; font-size:13px; font-weight:bold;">
            <span>Total (+ Pajak)</span>
            <span>${fmt(o.total_amount)}</span>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top: 10px;">
          <button onclick="hapusRiwayat(${o.id})" style="background:none; border:none; color:var(--red, #dc4a3d); cursor:pointer; padding:5px; font-size:12px; display:flex; align-items:center; gap:5px;">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// LOGIKA CUSTOM MODAL HAPUS
// ==========================================
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
    openProfileModal(); // Refresh tampilan riwayat di dalam profil
  } else { 
    alert('Gagal menghapus riwayat'); 
  }
}

function logout() { sessionStorage.clear(); window.location.href = 'index.html'; }

async function pickKantin(kantinId) {
  if (Object.keys(cart).length > 0 && activeKantin !== kantinId) {
    if (!confirm('Ganti warung akan mengosongkan keranjang. Lanjut?')) { document.getElementById('kantinSelect').value = activeKantin || ''; return; }
    cart = {}; updateCartBadge();
  }
  activeKantin = kantinId || null;
  activeVoucher = null;
  activeVoucherPoints = 0;
  if (!activeKantin) return;
  
  document.getElementById('menuGrid').innerHTML = '<div style="text-align:center; padding:3rem;">Memuat menu...</div>';
  menu = await getMenu(activeKantin);
  fetchUserData(); 
  filterCat('semua', document.querySelector('.cat-btn'));
}

function renderMenu(cat) {
  const grid = document.getElementById('menuGrid');
  if (!activeKantin) { grid.innerHTML = '<div style="text-align:center; padding:3rem;">Pilih warung dulu.</div>'; return; }
  
  let filtered = cat === 'semua' ? menu : menu.filter(m => m.category === cat);
  if (filtered.length === 0) { grid.innerHTML = '<div style="text-align:center; padding:3rem;">Menu kosong.</div>'; return; }

  grid.innerHTML = filtered.map(item => {
    const imgUrl = getImageUrl(item.name);

    return `
    <div class="menu-card">
      <div class="menu-img"><img src="${imgUrl}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'"></div>
      <div class="menu-name">${item.name}</div>
      <div class="menu-desc">${item.description}</div>
      <span class="menu-price">${fmt(item.price)}</span>
      <button class="add-btn" onclick="addToCart(${item.id})">Tambah</button>
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

function addToCart(id) { cart[id] = (cart[id] || 0) + 1; updateCartBadge(); showToast('Ditambahkan ke keranjang'); }

function changeQty(id, delta) { 
  cart[id] = (cart[id] || 0) + delta; 
  if (cart[id] <= 0) delete cart[id]; 
  updateCartBadge(); 
  
  if (Object.keys(cart).length === 0) { 
    showToast('Keranjang kosong');
    showPage('menuPage');
    document.getElementById('mejaInput').value = '';
    document.getElementById('catatInput').value = '';
  } else {
    renderCart(); 
  }
}

function updateCartBadge() { document.getElementById('cartBadge').textContent = Object.values(cart).reduce((a, b) => a + b, 0); }
function showCart() { if (Object.keys(cart).length === 0) { showToast('Keranjang kosong'); return; } showPage('cartPage'); }

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');
  const keys = Object.keys(cart).filter(k => cart[k] > 0);
  if (keys.length === 0) { itemsEl.innerHTML = '<div class="empty-cart">Keranjang kosong</div>'; summaryEl.innerHTML = ''; return; }

  itemsEl.innerHTML = keys.map(id => {
    const item = menu.find(m => m.id == id);
    const imgUrl = getImageUrl(item.name);
    return `<div class="cart-item"><div class="cart-item-info"><div class="cart-item-icon"><img src="${imgUrl}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop'"></div><div><div class="cart-item-name">${item.name}</div><div class="cart-item-price">${fmt(item.price)}</div></div></div><div class="qty-controls"><button class="qty-btn" onclick="changeQty(${id}, -1)">−</button><span class="qty-num">${cart[id]}</span><button class="qty-btn" onclick="changeQty(${id}, 1)">+</button></div></div>`;
  }).join('');

  const subtotal = keys.reduce((s, id) => s + (menu.find(m => m.id == id).price * cart[id]), 0);
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

  if (!document.getElementById('antriInput').value) { document.getElementById('antriInput').value = 'A-' + String(Math.floor(Math.random() * 89) + 10); }
}

function proceedToPayment() {
  const name = document.getElementById('namaInput').value.trim();
  const meja = document.getElementById('mejaInput').value.trim();
  const catat = document.getElementById('catatInput').value.trim();

  if (!name || name.length < 3) { 
    showToast('Nama Pemesan minimal 3 karakter!'); 
    return; 
  }
  if (!meja) { 
    showToast('Nomor Meja harus diisi!'); 
    return; 
  }

  const keys = Object.keys(cart).filter(k => cart[k] > 0);
  const subtotal = keys.reduce((s, id) => s + (menu.find(m => m.id == id).price * cart[id]), 0);
  const tax = Math.round(subtotal * 0.1);
  
  let discount = 0;
  if (activeVoucher) discount = Math.round(subtotal * (activeVoucher / 100)); 
  const total = subtotal + tax - discount;

  const itemsString = keys.map(id => { const item = menu.find(m => m.id == id); return `${item.name}|${item.price}|${cart[id]}|${item.price * cart[id]}`; }).join(';');
  const waktuLokal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  let earnedPoints = 0;
  keys.forEach(id => {
    const item = menu.find(m => m.id == id);
    const qty = cart[id];
    if (item.price < 10000) earnedPoints += 1 * qty;
    else if (item.price <= 20000) earnedPoints += 2 * qty;
    else earnedPoints += 3 * qty;
  });

  orderData = { name, meja, catat, total, items: itemsString, rawKeys: [...keys], kantin: activeKantin, waktu: waktuLokal, discount, earnedPoints };

  document.getElementById('payAmount').textContent = fmt(total);
  document.getElementById('orderInfoPay').innerHTML = `
    <div class="info-row"><span>Warung</span><span>${KANTIN_NAMES[activeKantin]}</span></div>
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
    no_antrean: document.getElementById('antriInput').value,
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
    let sisaPoin = currentUserPoints;
    
    if (USER_ROLE === 'mahasiswa') {
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

    document.getElementById('successAntrean').textContent = finalData.no_antrean;
    document.getElementById('successInfo').innerHTML = `
      <div class="info-row"><span>Nama</span><span>${orderData.name}</span></div>
      <div class="info-row"><span>Meja</span><span>${orderData.meja}</span></div>
      <div class="info-row"><span>Total Bayar</span><span>${fmt(orderData.total)}</span></div>
      ${USER_ROLE === 'mahasiswa' ? `<div class="info-row" style="color:var(--green);"><span>Poin Didapat</span><span>+${orderData.earnedPoints} Poin</span></div>` : ''}
    `;
    showPage('successPage');
  } catch (err) {
    alert("Gagal: " + err.message);
  } finally {
    btn.disabled = false; btn.textContent = "Konfirmasi Pembayaran";
  }
}

function resetAll() {
  cart = {}; orderData = {}; activeVoucher = null; activeVoucherPoints = 0;
  document.querySelectorAll('input').forEach(i => { if(i.id !== 'namaInput') i.value = ''; });
  updateCartBadge(); showPage('menuPage');
}

// ==========================================
// LOGIKA AUTO-SLIDE BACKGROUND BERANDA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('navUserName').textContent = USER_NAME;
  renderHomeCards();

  // Mulai animasi slider
  const slides = document.querySelectorAll('.hero-bg');
  if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 4000); // Ganti foto setiap 4 detik
  }
});