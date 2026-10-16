import {copyButton,pixelIcon,escapeHtml as esc} from './controls.js';
export const badge = (status='Proposed') => `<span class="badge ${status.toLowerCase().replaceAll(' ','-')}">${esc(status)}</span>`;
export const keyGuidance = text => `<p class="key-guidance"><strong>${esc(text)}</strong></p>`;
export const pageIntro = (title, text) => `<div class="chapter-heading"><h1>${esc(title)}.</h1>${text?`<p>${esc(text)}</p>`:''}</div>`;
export const downloadLink = asset => asset.path ? `<a class="download" href="${asset.path}" download aria-label="Download ${esc(asset.name)}">Download ${asset.format} ↓</a>` : '<span class="missing">File not supplied</span>';
export function assetCard(asset) {
  let preview=asset.preview?`<img src="${asset.preview}" alt="${esc(asset.name)}: preview of the actual editable file" loading="lazy">`:
    asset.id==='mascot'?'<img src="/brand/mojo-cat-transparent.svg" alt="Original Mojo cat" loading="lazy">':
    asset.type==='Fonts'?`<span class="mini-word" style="font-family:'${asset.cssFamily}'">Aa</span>`:
    asset.id==='guide'?'<img src="/previews/quick-guide.png" alt="Current Quick Guide" loading="lazy">':
    asset.path?`<span class="mini-word">${esc(asset.name)}</span>`:'<span class="empty-symbol">Asset pending</span>';
  return `<article class="asset-card" data-asset="${esc(asset.id)}"><div class="asset-preview ${asset.id}">${preview}</div><div class="asset-info"><div class="row">${badge(asset.status)}<span class="technical">${asset.format}</span></div><h3>${esc(asset.name)}</h3><p>${esc(asset.use)}</p><div class="asset-actions">${downloadLink(asset)}</div></div></article>`;
}

export function colourCards(palette) {
  return `<div class="palette-region"><div class="swatches" aria-label="Primary colour palette">${palette.map(p=>{
    const rgb=p.hex.slice(1).match(/../g).map(v=>parseInt(v,16)).join(', ');
    const foreground=['#35594A','#1D1B18'].includes(p.hex)?'#FFF8F0':'#1D1B18';
    return `<button type="button" class="swatch hex" style="--swatch-colour:${p.hex};--swatch-text:${foreground}" data-copy="${p.hex}" aria-label="Copy ${esc(p.name)} HEX" aria-describedby="colour-${p.hex.slice(1)}"><span class="swatch-info"><strong>${esc(p.name)}</strong><span class="hex-code">${p.hex}</span><span class="swatch-rgb" id="colour-${p.hex.slice(1)}">RGB ${rgb}</span></span><span class="copy-text"><span class="copy-feedback" aria-hidden="true">Copied.</span></span>${pixelIcon()}</button>`;
  }).join('')}</div></div>`;
}
