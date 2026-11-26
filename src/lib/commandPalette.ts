import { lazyAnimate } from './lazyMotion';

export interface PaletteCommand {
  id: string;
  group: string;
  label: string;
  hint: string;
  run: () => void;
}

function buildCommands(lang: 'id' | 'en'): PaletteCommand[] {
  const isId = lang === 'id';
  const navGroup = isId ? 'Navigasi' : 'Navigation';
  const projGroup = isId ? 'Proyek Teknis' : 'Projects';
  const actGroup = isId ? 'Aksi Cepat' : 'Quick Actions';

  const sections: Array<{ id: string; label: string; hint: string }> = isId
    ? [
        { id: 'about', label: 'Tentang & Profil', hint: '#about' },
        { id: 'projects', label: 'Portofolio Proyek', hint: '#projects' },
        { id: 'experience', label: 'Pengalaman & Kepemimpinan', hint: '#experience' },
        { id: 'skills', label: 'Matriks Keahlian', hint: '#skills' },
        { id: 'education', label: 'Pendidikan & Sertifikasi', hint: '#education' },
        { id: 'contact', label: 'Kontak & Email', hint: '#contact' }
      ]
    : [
        { id: 'about', label: 'About & Profile', hint: '#about' },
        { id: 'projects', label: 'Technical Projects', hint: '#projects' },
        { id: 'experience', label: 'Experience & Leadership', hint: '#experience' },
        { id: 'skills', label: 'Skills Matrix', hint: '#skills' },
        { id: 'education', label: 'Education & Certifications', hint: '#education' },
        { id: 'contact', label: 'Contact & Email', hint: '#contact' }
      ];

  const navCmds: PaletteCommand[] = sections.map((s) => ({
    id: `nav-${s.id}`,
    group: navGroup,
    label: s.label,
    hint: s.hint,
    run: () => {
      document.getElementById(s.id)?.scrollIntoView({ behavior: 'auto' });
    }
  }));

  const seenTriggers = new Set<string>();
  const projCmds: PaletteCommand[] = [];
  document.querySelectorAll<HTMLElement>('#projects-grid article').forEach((card) => {
    const titleBtn = card.querySelector<HTMLElement>('h3 button[data-project-trigger]');
    const triggerBtn = titleBtn || card.querySelector<HTMLElement>('[data-project-trigger]');
    const triggerId = triggerBtn?.getAttribute('data-project-trigger');
    const title = titleBtn?.textContent?.trim() || triggerBtn?.textContent?.trim() || '';
    if (!triggerId || !title || seenTriggers.has(triggerId)) return;
    seenTriggers.add(triggerId);
    projCmds.push({
      id: `proj-${triggerId}`,
      group: projGroup,
      label: title,
      hint: card.getAttribute('data-domain') || '',
      run: () => triggerBtn?.click()
    });
  });

  const actionCmds: PaletteCommand[] = [
    {
      id: 'act-theme',
      group: actGroup,
      label: isId ? 'Ganti Tema Gelap / Terang' : 'Toggle Dark / Light Theme',
      hint: 'theme',
      run: () => {
        document.querySelector<HTMLElement>('.theme-toggle-btn')?.click();
      }
    },
    {
      id: 'act-lang',
      group: actGroup,
      label: isId ? 'Switch to English (/en)' : 'Ganti ke Bahasa Indonesia (/)',
      hint: isId ? '/en' : '/',
      run: () => {
        const hash = window.location.hash || '';
        window.location.href = (isId ? '/en' : '/') + hash;
      }
    },
    {
      id: 'act-copy',
      group: actGroup,
      label: isId ? 'Salin Alamat Email' : 'Copy Email Address',
      hint: 'clipboard',
      run: () => {
        const btn = document.querySelector<HTMLElement>('button[onclick*="copyEmailAddress"]');
        if (btn) btn.click();
      }
    },
    {
      id: 'act-cv',
      group: actGroup,
      label: isId ? 'Unduh CV (PDF)' : 'Download CV (PDF)',
      hint: 'CV.pdf',
      run: () => {
        const a = document.querySelector<HTMLAnchorElement>('a[href="/CV.pdf"]');
        if (a) a.click();
      }
    }
  ];

  return [...projCmds, ...navCmds, ...actionCmds];
}

export function openCommandPalette(
  lang: 'id' | 'en',
  triggerEl: HTMLElement | null
): void {
  const isId = lang === 'id';
  const cmds = buildCommands(lang);
  let dialog = document.getElementById('cmd-palette-dialog') as HTMLDialogElement | null;

  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'cmd-palette-dialog';
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', isId ? 'Menu perintah cepat' : 'Quick command palette');
    dialog.className =
      'project-dialog backdrop:bg-black/85 bg-surface-container border border-outline-variant/40 rounded-2xl p-0 max-w-lg w-[92vw] text-on-surface shadow-2xl m-auto z-[220] focus:outline-none';
    dialog.innerHTML = `
      <div class="flex flex-col max-h-[75vh]">
        <div class="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/25">
          <span class="font-mono text-xs text-secondary font-bold" aria-hidden="true">&gt;_</span>
          <label for="cmd-palette-input" class="sr-only">${isId ? 'Cari proyek, bagian, atau aksi' : 'Search projects, sections, or actions'}</label>
          <input id="cmd-palette-input" type="text" autocomplete="off" placeholder="${isId ? 'Cari proyek, bagian, atau aksi...' : 'Search projects, sections, or actions...'}" class="w-full bg-transparent text-sm text-primary placeholder:text-outline focus:outline-none" />
          <button type="button" id="cmd-palette-close" class="px-2 py-1 rounded bg-surface-container-high font-mono text-[11px] text-outline hover:text-primary min-h-[36px] cursor-pointer" aria-label="${isId ? 'Tutup menu perintah' : 'Close command palette'}">ESC</button>
        </div>
        <div id="cmd-palette-list" role="listbox" class="p-2 overflow-y-auto flex flex-col gap-1 max-h-[55vh]"></div>
      </div>
    `;
    document.body.appendChild(dialog);
  }

  const input = dialog.querySelector<HTMLInputElement>('#cmd-palette-input')!;
  const list = dialog.querySelector<HTMLElement>('#cmd-palette-list')!;
  const closeBtn = dialog.querySelector<HTMLButtonElement>('#cmd-palette-close')!;
  let activeIndex = 0;
  let filtered = cmds;

  const renderList = () => {
    list.innerHTML = '';
    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'px-3 py-6 text-center font-mono text-xs text-outline';
      empty.textContent = isId ? 'Tidak ada hasil yang cocok.' : 'No matching commands.';
      list.appendChild(empty);
      return;
    }
    filtered.forEach((cmd, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = `cmd-opt-${cmd.id}`;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', String(idx === activeIndex));
      btn.className = `w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left text-xs sm:text-sm min-h-[44px] cursor-pointer ${
        idx === activeIndex
          ? 'bg-secondary-container text-secondary-fixed font-semibold'
          : 'text-on-surface hover:bg-surface-container-high'
      }`;
      const left = document.createElement('span');
      left.className = 'truncate';
      left.textContent = cmd.label;
      const right = document.createElement('span');
      right.className = 'font-mono text-[11px] opacity-75 shrink-0';
      right.textContent = `${cmd.group} · ${cmd.hint}`;
      btn.appendChild(left);
      btn.appendChild(right);
      btn.addEventListener('click', () => {
        closeDialog(false);
        cmd.run();
      });
      list.appendChild(btn);
    });
  };

  const closeDialog = (restoreFocus = true) => {
    if (dialog && dialog.open) dialog.close();
    document.body.style.overflow = '';
    if (restoreFocus && triggerEl && document.contains(triggerEl)) {
      requestAnimationFrame(() => triggerEl.focus());
    }
  };

  input.oninput = () => {
    const q = input.value.trim().toLowerCase();
    filtered = q ? cmds.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)) : cmds;
    activeIndex = 0;
    renderList();
  };

  dialog.onkeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' && filtered.length > 0) {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % filtered.length;
      renderList();
    } else if (e.key === 'ArrowUp' && filtered.length > 0) {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
      renderList();
    } else if (e.key === 'Enter' && document.activeElement === input && filtered[activeIndex]) {
      e.preventDefault();
      const chosen = filtered[activeIndex];
      closeDialog(false);
      chosen.run();
    } else if (e.key === 'Tab') {
      const focusables = [input, closeBtn, ...Array.from(list.querySelectorAll<HTMLElement>('button'))];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  dialog.onclose = () => {
    document.body.style.overflow = '';
  };
  dialog.onclick = (e: MouseEvent) => {
    if (e.target === dialog) closeDialog(true);
  };
  closeBtn.onclick = () => closeDialog(true);

  input.value = '';
  filtered = cmds;
  activeIndex = 0;
  renderList();
  if (!dialog.open) {
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    input.focus();
    const panel = dialog.firstElementChild;
    if (panel) {
      void lazyAnimate(panel, { opacity: [0.4, 1], transform: ['translateY(6px) scale(0.985)', 'translateY(0) scale(1)'] }, { duration: 0.18 });
    }
  }
}
