/**
 * EDWIN TRANSPORTS - Application JavaScript
 * Interactivité, Audio Web Synthesizer (Air Horn), Modales, Animations & Toast
 * Synchronisation dynamique TrucksBook (Chauffeurs, Km, Livraisons, Convois)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initAirHorn();
  initFleetFilter();
  initRecruitmentModal();
  initLightbox();
  
  // Chargement des données dynamiques (TrucksBook)
  loadLiveVTCData();

  // Actualisation automatique toutes les 1 heures (3600 secondes)
  setInterval(() => {
    loadLiveVTCData(true);
  }, 3600000);
});

/* ==========================================================================
   1. Audio Synthesizer : Klaxon / Trompe à Air Compressé VTC
   ========================================================================== */
function initAirHorn() {
  const hornButtons = document.querySelectorAll('.btn-horn-sound');
  let audioCtx = null;

  function playTruckHorn() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const duration = 1.2;

      // Fréquences harmoniques de doubles trompes de camion
      const frequencies = [196, 247, 392, 494];

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const distortion = audioCtx.createWaveShaper();
      distortion.curve = makeDistortionCurve(15);
      distortion.oversample = '2x';

      masterGain.connect(distortion);
      distortion.connect(audioCtx.destination);

      frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();

        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 0.1);
        osc.frequency.linearRampToValueAtTime(freq * 0.98, now + duration);

        oscGain.gain.setValueAtTime(0.25 / frequencies.length, now);

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + duration);
      });

      hornButtons.forEach(btn => {
        btn.classList.add('horn-active');
        setTimeout(() => btn.classList.remove('horn-active'), duration * 1000);
      });

      showToast('🔊 POUUUUËT ! Trompe pneumatique Edwin Transports activée !', 'info');
    } catch (e) {
      console.warn('AudioContext not allowed or not supported yet', e);
    }
  }

  function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  hornButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      playTruckHorn();
    });
  });
}

/* ==========================================================================
   2. Menu Mobile Responsive
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

/* ==========================================================================
   3. Filtre de la Flotte Réelle
   ========================================================================== */
function initFleetFilter() {
  const filterButtons = document.querySelectorAll('.fleet-filter-btn');

  if (!filterButtons.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-red-600', 'text-white', 'border-red-500');
        b.classList.add('bg-zinc-900', 'text-zinc-400', 'border-zinc-800');
      });

      btn.classList.remove('bg-zinc-900', 'text-zinc-400', 'border-zinc-800');
      btn.classList.add('bg-red-600', 'text-white', 'border-red-500');

      const filter = btn.getAttribute('data-filter');
      const cards = document.querySelectorAll('.fleet-card');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.classList.add('animate-fadeIn');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   4. Chargement Dynamique des Données VTC (TrucksBook, Chauffeurs, Flotte, Convois)
   ========================================================================== */
async function loadLiveVTCData(isAutoRefresh = false) {
  try {
    const res = await fetch(`data/company_data.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('Impossible de charger company_data.json');
    const data = await res.json();

    updateStatisticsCounters(data.company);
    if (data.fleet && data.fleet.length) {
      renderRealFleet(data.fleet);
    }
    renderDriversTable(data.drivers);
    updateSyncBadge(data.updated_at);

    if (isAutoRefresh) {
      showToast('🔄 Synchronisation 1h effectuée : Flotte et classement chauffeurs actualisés !', 'info');
    }
  } catch (err) {
    console.warn('Fallback local pour données VTC:', err);
  }
}

function updateStatisticsCounters(company) {
  if (!company) return;

  const monthKmCounter = document.getElementById('stat-month-km');
  const monthDelivCounter = document.getElementById('stat-month-deliveries');
  const totalKmCounter = document.getElementById('stat-total-km');
  const driversCounter = document.getElementById('stat-total-drivers');

  if (monthKmCounter && company.total_km_month !== undefined) {
    monthKmCounter.setAttribute('data-target', company.total_km_month);
    animateCounter(monthKmCounter, company.total_km_month);
  }
  if (monthDelivCounter && company.total_deliveries_month !== undefined) {
    monthDelivCounter.setAttribute('data-target', company.total_deliveries_month);
    animateCounter(monthDelivCounter, company.total_deliveries_month);
  }
  if (totalKmCounter && company.total_km !== undefined) {
    totalKmCounter.setAttribute('data-target', company.total_km);
    animateCounter(totalKmCounter, company.total_km);
  }
  if (driversCounter && company.total_drivers !== undefined) {
    driversCounter.setAttribute('data-target', company.total_drivers);
    animateCounter(driversCounter, company.total_drivers);
  }
}

function animateCounter(element, target) {
  let current = 0;
  const duration = 1200;
  const step = Math.max(1, target / (duration / 25));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      element.textContent = target.toLocaleString('fr-FR');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString('fr-FR');
    }
  }, 25);
}

/**
 * Rendu dynamique de la flotte réelle utilisée par les chauffeurs (Aucun camion fictif)
 */
function renderRealFleet(fleet) {
  const container = document.getElementById('fleet-cards-container');
  if (!container || !fleet || !fleet.length) return;

  container.innerHTML = '';

  fleet.forEach(item => {
    const card = document.createElement('div');
    const filterKey = item.model.toLowerCase().replace(/\s+/g, '-');
    card.className = 'fleet-card card-glossy rounded-2xl overflow-hidden group border border-zinc-800/80 hover:border-red-600/50 transition-all';
    card.setAttribute('data-category', filterKey);

    const driversBadges = (item.drivers || []).map(dr => {
      const isOwner = dr.includes('Fondateur');
      return isOwner
        ? `<span class="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">👑 ${escapeHTML(dr)}</span>`
        : `<span class="px-2 py-0.5 rounded bg-zinc-800 text-slate-200 text-xs font-mono font-bold">🇫🇷 ${escapeHTML(dr)}</span>`;
    }).join(' ');

    const iconType = item.model.includes('Volvo') ? 'gauge' : (item.model.includes('S') ? 'shield' : 'truck');

    card.innerHTML = `
      <div class="h-52 bg-gradient-to-t from-black via-zinc-900 to-zinc-800 relative flex items-center justify-center p-6 border-b border-zinc-800">
        <div class="text-center space-y-2">
          <i data-lucide="${iconType}" class="w-20 h-20 ${item.model.includes('S') ? 'text-slate-200' : 'text-red-500'} mx-auto filter drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]"></i>
          <span class="text-xs font-mono uppercase text-slate-300 tracking-widest block font-bold">${escapeHTML(item.title)}</span>
          <span class="text-[10px] text-emerald-400 font-mono block">✓ Télémétrie TrucksBook Live</span>
        </div>
        <span class="absolute top-4 right-4 bg-red-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow">${escapeHTML(item.badge)}</span>
        <span class="absolute top-4 left-4 bg-zinc-950/80 border border-red-500/40 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded">${item.drivers_count} Chauffeur${item.drivers_count > 1 ? 's' : ''}</span>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold font-display uppercase text-white">${escapeHTML(item.model)}</h3>
          <span class="text-xs text-red-400 font-mono">${escapeHTML(item.specs.specialty || 'Flotte Edwin')}</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          ${escapeHTML(item.description)}
        </p>
        <div class="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
          <span class="text-[10px] uppercase font-mono text-zinc-500 block font-semibold">Chauffeurs attitrés TrucksBook :</span>
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${driversBadges}
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-zinc-800">
          <div><span class="text-zinc-500">Châssis :</span> ${escapeHTML(item.specs.chassis || 'Standard')}</div>
          <div><span class="text-zinc-500">Puissance :</span> ${escapeHTML(item.specs.power || '730 CH')}</div>
          <div><span class="text-zinc-500">Boîte :</span> ${escapeHTML(item.specs.transmission || 'Automatique')}</div>
          <div><span class="text-zinc-500">Livrée :</span> Rouge Carmin / Noir</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

/**
 * Rendu STRICTEMENT MENSUEL du classement des chauffeurs
 * (Conforme à l'exigence : "je veux que mensuel pas tout le temps")
 */
function renderDriversTable(drivers) {
  const tbody = document.getElementById('drivers-table-body');
  if (!tbody || !drivers || !drivers.length) return;

  tbody.innerHTML = '';

  // Tri STRICTEMENT MENSUEL : km_month en premier, puis deliveries_month
  const sortedDrivers = [...drivers].sort((a, b) => {
    const kmDiff = (b.km_month ?? 0) - (a.km_month ?? 0);
    if (kmDiff !== 0) return kmDiff;
    const delivDiff = (b.deliveries_month ?? 0) - (a.deliveries_month ?? 0);
    if (delivDiff !== 0) return delivDiff;
    return (b.km_all ?? 0) - (a.km_all ?? 0);
  });

  sortedDrivers.forEach((driver, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-zinc-900/60 transition-colors';

    let rankBadge = `#${idx + 1}`;
    if (idx === 0) rankBadge = '👑 #1';
    else if (idx === 1) rankBadge = '🥈 #2';
    else if (idx === 2) rankBadge = '🥉 #3';

    const flag = driver.country === 'be' ? '🇧🇪' : '🇫🇷';
    const roleBadge = driver.is_owner 
      ? '<span class="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">DIR</span>'
      : '';

    const kmMonth = driver.km_month ?? 0;
    const delivMonth = driver.deliveries_month ?? 0;
    const kmTotal = driver.km_all ?? driver.km ?? 0;

    tr.innerHTML = `
      <td class="py-4 px-4 font-bold ${idx === 0 ? 'text-amber-400' : 'text-slate-300'}">${rankBadge}</td>
      <td class="py-4 px-4 font-bold text-white flex items-center gap-2 font-sans">
        <span class="w-2 h-2 rounded-full ${kmMonth > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}"></span>
        <span>${flag} ${escapeHTML(driver.name)}</span>
        ${roleBadge}
      </td>
      <td class="py-4 px-4 text-slate-300">
        <span class="text-white font-bold text-sm flex items-center gap-1.5">
          <i data-lucide="truck" class="w-3.5 h-3.5 text-red-500"></i>
          ${escapeHTML(driver.truck || 'Non renseigné')}
        </span>
        <span class="text-[10px] text-zinc-500 block">Télémétrie TrucksBook</span>
      </td>
      <td class="py-4 px-4">
        <span class="px-2 py-0.5 rounded bg-red-950/80 text-red-300 text-[10px]">
          ${escapeHTML(driver.pole || 'Transport')}
        </span>
      </td>
      <td class="py-4 px-4 text-right font-bold text-red-400 text-sm font-mono">
        ${kmMonth.toLocaleString('fr-FR')} km
      </td>
      <td class="py-4 px-4 text-right text-emerald-400 font-bold font-mono">
        ${delivMonth} mission${delivMonth > 1 ? 's' : ''}
      </td>
      <td class="py-4 px-4 text-right text-slate-400 font-mono text-[11px]">
        ${kmTotal.toLocaleString('fr-FR')} km
      </td>
    `;
    tbody.appendChild(tr);
  });
  if (window.lucide) lucide.createIcons();
}



function updateSyncBadge(updatedAt) {
  const syncBadge = document.getElementById('sync-status-badge');
  if (syncBadge && updatedAt) {
    syncBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> TrucksBook Synchro : ${escapeHTML(updatedAt)} (Auto 1h)`;
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* ==========================================================================
   5. Modale & Formulaire de Recrutement
   ========================================================================== */
function initRecruitmentModal() {
  const openModalBtns = document.querySelectorAll('.btn-open-recruitment');
  const closeModalBtns = document.querySelectorAll('.btn-close-recruitment');
  const modal = document.getElementById('recruitment-modal');
  const recruitForm = document.getElementById('recruitment-form');

  if (!modal) return;

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  });

  if (recruitForm) {
    recruitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pseudo = document.getElementById('driver-pseudo').value;
      const truckType = document.getElementById('driver-pref').value;

      modal.classList.add('hidden');
      document.body.style.overflow = '';
      recruitForm.reset();

      showToast(`🚛 Candidature reçue pour ${pseudo} (${truckType}) ! Notre équipe RH VTC vous contactera sur Discord.`, 'success');
    });
  }
}



/* ==========================================================================
   7. Visionneuse Lightbox Galerie
   ========================================================================== */
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-thumb');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');

  if (!lightbox || !galleryItems.length) return;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-full') || item.getAttribute('src');
      const title = item.getAttribute('data-title') || 'Convoi Edwin Transports';
      lightboxImg.src = src;
      lightboxCaption.textContent = title;
      lightbox.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('modal-backdrop')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   8. Système de Notifications Toast
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';

  const icon = type === 'success' ? '✅' : '📢';
  toast.innerHTML = `<span>${icon}</span><div>${message}</div>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}
