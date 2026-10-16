import {chapters} from './content.js';
import {escapeHtml as esc} from './controls.js';

// All twelve illustrations share a 20×20 pixel grid and a two-pixel stroke weight.
const drawings = {
 overview: '<path d="M6 2h8v2h2v2h2v12H2V6h2V4h2zm0 4H4v4h5V4H6zm5-2v6h5V6h-2V4zM4 12v4h5v-4zm7 0v4h5v-4z"/><path class="nav-icon-detail" d="M5 14h2v2H5zm8-6h2v2h-2z"/>',
 foundations: '<path d="M6 2h8v8H6zm2 2v4h4V4zM1 11h8v8H1zm2 2v4h4v-4zm8-2h8v8h-8zm2 2v4h4v-4z"/><path class="nav-icon-detail" d="M8 4h4v2H8zm-5 9h4v2H3zm10 0h4v2h-4z"/>',
 logos: '<image href="/brand/mojo-cat-transparent.svg" x="0" y="1" width="20" height="18" style="image-rendering:pixelated"/>',
 colour: '<path d="M2 2h10v10H2zm2 2v6h6V4zm10 2h4v12H6v-4h2v2h8V8h-2z"/><path class="nav-icon-detail" d="M6 6h2v2H6zm6 6h2v2h-2z"/>',
 typography: '<path d="M2 3h16v6h-2V5h-4v10h3v2H5v-2h3V5H4v4H2z"/><path class="nav-icon-detail" d="M10 5h2v10h-2z"/>',
 voice: '<path d="M2 2h16v12h-8v2H8v2H4v-4H2zm2 2v8h2v3h2v-3h8V4zm2 3h2v2H6zm4 0h4v2h-4z"/>',
 templates: '<path d="M6 2h12v14h-4v2H2V6h4zm2 2v8h8V4zM4 8v8h8v-2H6V8z"/><path class="nav-icon-detail" d="M10 6h4v2h-4zm0 3h4v2h-4z"/>',
 imagery: '<path d="M1 3h18v14H1zm2 2v10h14V5zm2 2h2v2H5zm6 0h2v2h2v2h-2v2h-2zm-6 4h2v-2h2v4H5z"/>',
 components: '<path d="M2 2h10v4h6v12H8v-4H2zm2 2v8h4V6h2V4zm6 4v8h6V8z"/><path class="nav-icon-detail" d="M10 8h2v4h-2z"/>',
 campus: '<path d="M6 2h2v2h4V2h2v2h2v2h2v6h-4v6H6v-6H2V6h2V4h2zm0 4H4v4h4v6h4v-6h4V8h-2V6h-2v2H8V6z"/>',
 downloads: '<path d="M2 2h6v2h2V2h6v6h-2V4h-2v10h-2V6H8V4H4v10h4v2H2zm10 6h2v6h2v-2h2v4h-2v2h-2v-2h-2z"/><path class="nav-icon-detail" d="M6 6h2v2H6zm0 4h2v2H6z"/>',
 requests: '<path d="M2 2h10v2H4v12h10v-4h2v6H2zm12 2h4v4h-2v2h-2v2h-2v2H8v-4h2V8h2V6h2zm0 4h-2v2h-2v2h2v-2h2zm2-2v2h2V6z"/><path class="nav-icon-detail" d="M6 6h4v2H6z"/>'
};
const labels = {campus:'Merchandise', downloads:'Quick guide'};
export const navigationItems = [{id:'overview',title:'Overview'}, ...chapters];
export function navigationIcon(id) {
 return `<svg class="nav-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false" shape-rendering="crispEdges">${drawings[id]}</svg>`;
}
export function navigationRow(item, active) {
 return `<a href="#${item.id}" class="nav-link${active===item.id?' active':''}"${active===item.id?' aria-current="page"':''}>${navigationIcon(item.id)}<span class="nav-label">${esc(labels[item.id]||item.title)}</span></a>`;
}
export function sidebarNavigation(active) {
 const groups = [['The brand',chapters.slice(0,5)],['Make with Mojo',chapters.slice(5,9)],['Resources',chapters.slice(9)]];
 return `<nav id="navigation" aria-label="Toolkit sections">${navigationRow(navigationItems[0],active)}${groups.map(([title,items])=>`<div class="nav-section"><p class="nav-group">${title}</p>${items.map(item=>navigationRow(item,active)).join('')}</div>`).join('')}</nav>`;
}
