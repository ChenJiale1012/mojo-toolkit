/** Shared, dependency-free controls used by the toolkit and standalone guide. */
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function pixelIcon(name='copy') {
  const paths={copy:'M6 2h10v2h2v12h-2V4H6zM2 6h10v2h2v10H2zm2 2v8h8V8z',banners:'M2 3h16v14H2zm2 2v10h12V5zm2 2h8v2H6zm0 4h5v2H6z',presentation:'M2 2h16v12h-7v3h4v2H5v-2h4v-3H2zm2 2v8h12V4zm2 2h8v2H6z',email:'M2 4h16v12H2zm2 2v2h2v2h2v2h4v-2h2V8h2V6h-2v2h-2v2H8V8H6V6zm0 5v3h12v-3h-2v2H6v-2z',meeting:'M2 4h11v12H2zm2 2v8h7V6zm11 1h2V5h2v10h-2v-2h-2z',poster:'M4 2h12v16H4zm2 2v12h8V4zm2 2h4v4H8zm0 6h4v2H8z',search:'M4 2h7v2h2v7h-2v2H4v-2H2V4h2zm0 2v7h7V4zm9 8h2v2h2v2h2v3h-3v-2h-2v-2h-2z'};
  return `<svg class="pixel-icon" viewBox="0 0 20 20" aria-hidden="true" shape-rendering="crispEdges"><path d="${paths[name]||paths.copy}"/></svg>`;
}
export function copyButton(text, label='Copy text', extraClass='', visibleLabel=label) {
  return `<button type="button" class="copy-button ${extraClass}" data-copy="${escapeHtml(text)}" aria-label="${escapeHtml(label)}">${pixelIcon()}<span class="copy-text"><span class="copy-label">${escapeHtml(visibleLabel)}</span><span class="copy-feedback" aria-hidden="true">Copied</span></span></button>`;
}
export function searchControl(id='global-search', inputId='search-input', value='') {
  return `<form id="${id}" data-toolkit-search class="search-control"><label for="${inputId}" class="pixel-search-icon">${pixelIcon('search')}<span class="sr-only">Search the toolkit</span></label><input id="${inputId}" aria-label="Search toolkit" placeholder="Search the toolkit" value="${escapeHtml(value)}"><button type="submit" aria-label="Run search">↵</button></form>`;
}
export function bindCopyControls(root=document, announce=()=>{}) {
  const timers=new WeakMap();
  const handler=async event=>{
    const button=event.target.closest('[data-copy]');
    if(!button||button.disabled||button.getAttribute('aria-disabled')==='true')return;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      clearTimeout(timers.get(button));button.classList.add('copied');announce('Copied');
      timers.set(button,setTimeout(()=>button.classList.remove('copied'),1800));
    } catch { announce('Clipboard unavailable. Select and copy the displayed text.'); }
  };
  root.addEventListener('click',handler);
  return ()=>root.removeEventListener('click',handler);
}
export function bindSearchControls(root=document, navigate=term=>{location.hash='search='+encodeURIComponent(term)}) {
  const handler=event=>{
    if(!event.target.matches('[data-toolkit-search]'))return;
    event.preventDefault();navigate(event.target.querySelector('input').value.trim());
  };
  root.addEventListener('submit',handler);
  return ()=>root.removeEventListener('submit',handler);
}
