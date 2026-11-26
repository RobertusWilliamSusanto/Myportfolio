import { useState } from 'preact/hooks';

type CipherMode = 'caesar' | 'vigenere' | 'affine';

function transformCipher(input: string, mode: CipherMode, encrypt: boolean, shift = 3, key = 'SEC'): string {
  const clean = input.toUpperCase();
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '') || 'A';
  let ki = 0;

  return clean
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code < 65 || code > 90) return ch;
      const x = code - 65;
      let out = x;
      if (mode === 'caesar') {
        out = encrypt ? (x + shift) % 26 : (x - shift + 26) % 26;
      } else if (mode === 'vigenere') {
        const k = cleanKey.charCodeAt(ki++ % cleanKey.length) - 65;
        out = encrypt ? (x + k) % 26 : (x - k + 26) % 26;
      } else {
        out = encrypt ? (5 * x + 8) % 26 : (21 * ((x - 8 + 26) % 26)) % 26;
      }
      return String.fromCharCode(out + 65);
    })
    .join('');
}

export default function CipherPreview({ lang = 'id' }: { lang?: 'id' | 'en' }) {
  const [mode, setMode] = useState<CipherMode>('caesar');
  const [encrypt, setEncrypt] = useState(true);
  const [text, setText] = useState('HELLO');
  const [editing, setEditing] = useState(false);

  const output = transformCipher(text, mode, encrypt, 3, 'SEC');

  const titleLabel = lang === 'id' ? 'PRATINJAU CIPHER LANGSUNG' : 'LIVE CIPHER SANDBOX';
  const inputLabel = lang === 'id' ? 'Teks input cipher' : 'Cipher input text';
  const modeAction = encrypt
    ? lang === 'id' ? 'Enkripsi →' : 'Encrypt →'
    : lang === 'id' ? '← Dekripsi' : '← Decrypt';
  const editLabel = lang === 'id' ? 'Ubah Teks' : 'Edit Text';
  const paramsNote = mode === 'caesar' ? 'shift=3' : mode === 'vigenere' ? 'key=SEC' : '5x+8 mod 26';

  return (
    <div
      id="cipher-preview-widget"
      class="mt-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-2.5"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono text-[10px] uppercase tracking-wider text-outline font-semibold">{titleLabel}</span>
        <span class="font-mono text-[10px] text-secondary">{paramsNote}</span>
      </div>

      <div class="flex flex-wrap gap-1" role="radiogroup" aria-label={lang === 'id' ? 'Pilih algoritma cipher' : 'Choose cipher algorithm'}>
        {(['caesar', 'vigenere', 'affine'] as CipherMode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            data-cipher-mode={m}
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            class={`btn-interactive px-2 py-1 rounded font-mono text-[10px] uppercase cursor-pointer min-h-[32px] ${
              mode === m
                ? 'bg-secondary-container text-secondary-fixed font-semibold border border-secondary/40'
                : 'bg-surface-container-high text-on-surface-variant border border-transparent'
            }`}
          >
            {m}
          </button>
        ))}
        <button
          type="button"
          data-cipher-dir
          onClick={() => setEncrypt((v) => !v)}
          class="btn-interactive ml-auto px-2 py-1 rounded bg-surface-container text-primary font-mono text-[10px] cursor-pointer min-h-[32px] border border-outline-variant/30"
        >
          {modeAction}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
        {editing ? (
          <>
            <label for="cipher-preview-input" class="sr-only">{inputLabel}</label>
            <input
              id="cipher-preview-input"
              type="text"
              maxLength={24}
              value={text}
              onInput={(e) => setText((e.target as HTMLInputElement).value)}
              placeholder="HELLO"
              class="w-full px-2.5 py-1.5 rounded bg-surface-container text-primary font-mono text-xs border border-outline-variant/40 focus:outline-none focus:border-secondary"
            />
          </>
        ) : (
          <button
            type="button"
            data-cipher-edit
            onClick={() => setEditing(true)}
            class="w-full px-2.5 py-1.5 rounded bg-surface-container text-primary font-mono text-xs border border-outline-variant/40 flex items-center justify-between gap-2 cursor-pointer text-left min-h-[34px]"
          >
            <span class="truncate">{text}</span>
            <span class="text-[10px] text-outline shrink-0">{editLabel}</span>
          </button>
        )}
        <div
          id="cipher-preview-output"
          class="px-2.5 py-1.5 rounded bg-secondary-container/40 border border-secondary/30 font-mono text-xs text-secondary font-semibold truncate"
          aria-live="polite"
        >
          {output || '—'}
        </div>
      </div>
    </div>
  );
}
