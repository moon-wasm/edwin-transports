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
  initConvoyRSVP();
  initLightbox();
  
  // Chargement des données dynamiques (TrucksBook & Convois)
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
   3. Filtre de la Flotte
   ========================================================================== */
function initFleetFilter() {
  const filterButtons = document.querySelectorAll('.fleet-filter-btn');
  const fleetCards = document.querySelectorAll('.fleet-card');

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

      fleetCards.forEach(card => {
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
   4. Chargement Dynamique des Données VTC (TrucksBook, Chauffeurs, Convois)
   ========================================================================== */
async function loadLiveVTCData(isAutoRefresh = false) {
  try {
    const res = await fetch(`data/company_data.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('Impossible de charger company_data.json');
    const data = await res.json();

    updateStatisticsCounters(data.company);
    renderDriversTable(data.drivers);
    renderConvoys(data.upcoming_convoys);
    updateSyncBadge(data.updated_at);

    if (isAutoRefresh) {
      showToast('🔄 Synchronisation 1h effectuée : Chauffeurs, kilomètres et convois actualisés !', 'info');
    }
  } catch (err) {
    console.warn('Fallback local pour données VTC:', err);
  }
}

function updateStatisticsCounters(company) {
  if (!company) return;

  const kmCounter = document.getElementById('stat-total-km');
  const driversCounter = document.getElementById('stat-total-drivers');
  const deliveriesCounter = document.getElementById('stat-total-deliveries');

  if (kmCounter) {
    kmCounter.setAttribute('data-target', company.total_km);
    animateCounter(kmCounter, company.total_km);
  }
  if (driversCounter) {
    driversCounter.setAttribute('data-target', company.total_drivers);
    animateCounter(driversCounter, company.total_drivers);
  }
  if (deliveriesCounter) {
    deliveriesCounter.setAttribute('data-target', company.total_deliveries);
    animateCounter(deliveriesCounter, company.total_deliveries);
  }
}

function animateCounter(element, target) {
  let current = 0;
  const duration = 1500;
  const step = target / (duration / 25);
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

function renderDriversTable(drivers) {
  const tbody = document.getElementById('drivers-table-body');
  if (!tbody || !drivers || !drivers.length) return;

  // Tri par kilomètres réels décroissants
  const sortedDrivers = [...drivers].sort((a, b) => (b.km || 0) - (a.km || 0));

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

    tr.innerHTML = `
      <td class="py-4 px-4 font-bold ${idx === 0 ? 'text-amber-400' : 'text-slate-300'}">${rankBadge}</td>
      <td class="py-4 px-4 font-bold text-white flex items-center gap-2 font-sans">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
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
      <td class="py-4 px-4 text-right font-bold text-white text-sm">${(driver.km || 0).toLocaleString('fr-FR')} km</td>
      <td class="py-4 px-4 text-right text-emerald-400 font-bold">${driver.deliveries || 0} missions</td>
      <td class="py-4 px-4 text-right text-slate-400 font-mono text-[11px]">${escapeHTML(driver.frequent_cargo || 'Fret')}</td>
    `;
    tbody.appendChild(tr);
  });
  if (window.lucide) lucide.createIcons();
}

/**
 * Gestion des convois avec RETRAIT AUTOMATIQUE DES CONVOIS PASSÉS
 */
function renderConvoys(convoys) {
  const container = document.getElementById('convoys-container');
  if (!container || !convoys) return;

  const now = new Date();

  // Filtrage strict : on retire tout convoi dont la date est passée
  const activeConvoys = convoys.filter(c => {
    if (!c.date_iso) return true;
    const convoyDate = new Date(c.date_iso);
    return convoyDate >= now;
  });

  if (!activeConvoys.length) {
    container.innerHTML = `
      <div class="card-glossy p-8 rounded-2xl text-center space-y-3">
        <i data-lucide="calendar-off" class="w-12 h-12 text-slate-500 mx-auto"></i>
        <h4 class="text-lg font-bold text-white">Aucun convoi actif pour le moment</h4>
        <p class="text-xs text-slate-400">Le dernier convoi est terminé. Le prochain itinéraire sera annoncé prochainement sur notre Discord !</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const main = activeConvoys[0];
  container.innerHTML = `
    <div class="card-glossy rounded-3xl p-8 lg:p-10 border-red-900/40 relative overflow-hidden mb-6">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <div class="lg:col-span-8 space-y-6">
          <div class="flex flex-wrap items-center gap-3">
            <span class="px-3 py-1 rounded-md bg-red-600 text-white font-mono text-xs font-bold tracking-wider uppercase">
              Prochain Convoi Officiel
            </span>
            <span class="text-xs font-mono text-slate-400">
              <i data-lucide="server" class="w-3.5 h-3.5 inline text-red-500 mr-1"></i> Serveur : ${escapeHTML(main.server || 'Simulation 1')}
            </span>
            <span class="text-xs font-mono text-slate-400">
              <i data-lucide="radio" class="w-3.5 h-3.5 inline text-red-500 mr-1"></i> CB : ${escapeHTML(main.cb_channel || 'Canal 19')}
            </span>
          </div>

          <h3 class="text-2xl sm:text-4xl font-display font-extrabold text-white uppercase">
            ${escapeHTML(main.title)}
          </h3>

          <p class="text-slate-300 text-sm leading-relaxed max-w-2xl">
            Rassemblement officiel Edwin Transports sur TruckersMP. Remorque conseillée : <strong class="text-red-400">${escapeHTML(main.recommended_trailer || 'Tous pôles')}</strong>. Peinture entreprise obligatoire.
          </p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span class="text-[11px] text-zinc-500 uppercase block font-semibold">Départ</span>
              <span class="text-sm font-bold text-white">${escapeHTML(main.departure)}</span>
            </div>
            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span class="text-[11px] text-zinc-500 uppercase block font-semibold">Arrivée</span>
              <span class="text-sm font-bold text-white">${escapeHTML(main.destination)}</span>
            </div>
            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span class="text-[11px] text-zinc-500 uppercase block font-semibold">Rassemblement</span>
              <span class="text-sm font-bold text-red-400">${escapeHTML(main.meetup_time || '20h30')}</span>
            </div>
            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span class="text-[11px] text-zinc-500 uppercase block font-semibold">Départ Convoi</span>
              <span class="text-sm font-bold text-emerald-400">${escapeHTML(main.departure_time || '21h00')}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4 pt-4">
            <button type="button" class="btn-rsvp-convoy btn-red-primary">
              Participer au Convoi
            </button>
            <a href="https://trucksbook.eu/company/231468" target="_blank" rel="noopener noreferrer" class="btn-metallic text-xs font-bold uppercase tracking-wider">
              <i data-lucide="file-spreadsheet" class="w-4 h-4 text-red-500"></i> TrucksBook #231468
            </a>
            <a href="https://discord.gg/cUuRqxmy6" target="_blank" rel="noopener noreferrer" class="btn-metallic text-xs font-bold uppercase tracking-wider">
              <i data-lucide="message-square" class="w-4 h-4 text-indigo-400"></i> Vocal Discord
            </a>
          </div>

        </div>

        <div class="lg:col-span-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl text-center space-y-4">
          <span class="text-xs font-mono uppercase text-zinc-400 block tracking-wider">Inscrits Confirmés</span>
          <div class="text-5xl font-black font-display text-white">
            <span id="convoy-attendees-count" class="red-gradient-text">${main.attendees_count || 42}</span>
            <span class="text-lg text-zinc-500 font-normal">/ 50</span>
          </div>
          <p class="text-xs text-slate-400">Places réservées pour nos membres et chauffeurs invités.</p>
          <div class="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div class="bg-red-600 h-full rounded-full" style="width: 84%"></div>
          </div>
          <div class="text-[11px] text-emerald-400 font-mono flex items-center justify-center gap-1">
            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Escorte de tête & queue confirmée
          </div>
        </div>

      </div>
    </div>
  `;

  initConvoyRSVP();
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
   6. Réservation de Convoi (RSVP)
   ========================================================================== */
function initConvoyRSVP() {
  const rsvpBtns = document.querySelectorAll('.btn-rsvp-convoy');

  rsvpBtns.forEach(btn => {
    let booked = false;
    btn.addEventListener('click', () => {
      const badgeCount = document.getElementById('convoy-attendees-count');
      let currentCount = badgeCount ? parseInt(badgeCount.textContent, 10) : 42;

      if (!booked) {
        booked = true;
        btn.innerHTML = `✓ Place Réservée`;
        btn.classList.remove('btn-red-primary');
        btn.classList.add('bg-emerald-600', 'text-white', 'border-emerald-400');
        if (badgeCount) badgeCount.textContent = currentCount + 1;
        showToast('📍 Inscription confirmée ! Rendez-vous sur le serveur Simulation 1 avec la peinture officielle.', 'success');
      } else {
        booked = false;
        btn.innerHTML = `Participer au Convoi`;
        btn.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-400');
        btn.classList.add('btn-red-primary');
        if (badgeCount) badgeCount.textContent = Math.max(0, currentCount - 1);
        showToast('ℹ️ Désinscription du convoi prise en compte.', 'info');
      }
    });
  });
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
