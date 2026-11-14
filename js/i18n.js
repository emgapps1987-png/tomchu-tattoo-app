// ---------------------------------------------------------------------
// שפות: עברית (ברירת מחדל), English, Русский, العربية
// הקוד והתוכן כתובים בעברית; בשפה אחרת מתרגמים את מה שמוצג על המסך
// לפי מילון (js/i18n-data.js). הצהרת הבריאות והמאמרים נשארים בעברית.
// ---------------------------------------------------------------------
import { I18N } from './i18n-data.js';

export const LANGS = [
  { id: 'he', label: 'עברית', short: 'עב', dir: 'rtl' },
  { id: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { id: 'ru', label: 'Русский', short: 'RU', dir: 'ltr' },
  { id: 'ar', label: 'العربية', short: 'ع', dir: 'rtl' }
];

const saved = (() => { try { return localStorage.getItem('tt-lang'); } catch (e) { return null; } })();
export const LANG = LANGS.some((l) => l.id === saved) ? saved : 'he';
export const langInfo = LANGS.find((l) => l.id === LANG);

const D = I18N[LANG] || null;
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const HE = /[֐-׿]/;

// טקסטים שמורכבים ממספר/תאריך + מילים
const W = {
  enlarge: { en: 'enlarge', ru: 'увеличить', ar: 'للتكبير' },
  day: { en: 'Day', ru: 'День', ar: 'اليوم' },
  of: { en: 'of', ru: 'из', ar: 'من' },
  started: { en: 'Started on', ru: 'Начало:', ar: 'البداية في' },
  here: { en: 'you are here', ru: 'вы здесь', ar: 'أنت هنا' },
  healthOnly: {
    en: 'The health declaration is available in Hebrew only. Need help? Message Tom on WhatsApp.',
    ru: 'Медицинская анкета доступна только на иврите. Нужна помощь? Напишите Том в WhatsApp.',
    ar: 'التصريح الصحي متوفر باللغة العبرية فقط. تحتاج مساعدة؟ راسل توم عبر واتساب.'
  },
  articlesOnly: {
    en: 'Articles are available in Hebrew only.',
    ru: 'Статьи доступны только на иврите.',
    ar: 'المقالات متوفرة باللغة العبرية فقط.'
  }
};
export const word = (k) => (W[k] && W[k][LANG]) || '';

const PATTERNS = [
  [/^(.+) – להגדלה$/, (m) => `${tr(m[1])} – ${word('enlarge')}`],
  [/^(.+) · Tomchu Tattoo$/, (m) => `${tr(m[1])} · Tomchu Tattoo`],
  [/^יום (\d+) מתוך (\d+)$/, (m) => `${word('day')} ${m[1]} ${word('of')} ${m[2]}`],
  [/^יום (\d+) · (.+)$/, (m) => `${word('day')} ${m[1]} · ${tr(m[2])}`],
  [/^(\d+) מתוך (\d+)$/, (m) => `${m[1]} ${word('of')} ${m[2]}`],
  [/^התחלתם ב־(\S+) ·$/, (m) => `${word('started')} ${m[1]} ·`],
  [/^(.+) · את\/ה כאן$/, (m) => `${tr(m[1])} · ${word('here')}`]
];

// תרגום מחרוזת אחת (אם אין תרגום – חוזרת העברית)
export function tr(s) {
  if (!D || s == null) return s;
  const k = norm(String(s));
  if (!HE.test(k)) return s;
  if (D[k] != null) return D[k];
  for (const [re, fn] of PATTERNS) { const m = k.match(re); if (m) return fn(m); }
  return s;
}

const ATTRS = ['aria-label', 'placeholder', 'title', 'alt'];
const skipEl = (el) => !el || el.closest('[data-i18n-skip],script,style,#print-area');

function translateText(n) {
  const v = n.nodeValue; if (!v || !HE.test(v)) return;
  if (skipEl(n.parentElement)) return;
  const t = tr(v); if (t === v) return;
  const lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
  n.nodeValue = lead + t + trail;
}
function translateEl(el) {
  if (skipEl(el)) return;
  ATTRS.forEach((a) => { const v = el.getAttribute(a); if (v && HE.test(v)) { const t = tr(v); if (t !== v) el.setAttribute(a, t); } });
}
export function translateTree(root) {
  if (!D || !root) return;
  if (root.nodeType === 3) { translateText(root); return; }
  if (root.nodeType !== 1) return;
  translateEl(root);
  root.querySelectorAll('*').forEach(translateEl);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) translateText(n);
}

export function startI18n() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = langInfo.dir;
  if (!D) return;
  translateTree(document.body);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') translateText(m.target);
      else if (m.type === 'attributes') translateEl(m.target);
      else m.addedNodes.forEach(translateTree);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}

export function setLang(id) {
  try { localStorage.setItem('tt-lang', id); } catch (e) {}
  location.reload();
}
