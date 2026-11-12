import { locales } from './paths.js';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Content files mark a term in another language as <en>...</en> or
// <nl>...</nl>. On the page that becomes a span with a lang attribute.
export function text(value) {
  return escapeHtml(value)
    .replaceAll(/&lt;(en|nl)&gt;/g, '<span lang="$1">')
    .replaceAll(/&lt;\/(en|nl)&gt;/g, '</span>');
}

// For attributes and other places where a span is not allowed.
export function plain(value) {
  return escapeHtml(String(value).replaceAll(/<\/?(en|nl)>/g, ''));
}

// https://github.com/Niels023/ becomes github.com/Niels023
export function shortUrl(url) {
  return url.replace('https://', '').replace('www.', '').replace(/\/$/, '');
}

// "PHP, MySQL en Git" in Dutch, "PHP, MySQL and Git" in English.
export function sentenceList(items, lang) {
  return new Intl.ListFormat(locales[lang], { type: 'conjunction' }).format(items);
}
