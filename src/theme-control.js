const choices=[
 ['light','Light','M9 1h2v3H9zM9 16h2v3H9zM1 9h3v2H1zM16 9h3v2h-3zM3 3h2v2H3zM15 3h2v2h-2zM3 15h2v2H3zM15 15h2v2h-2zM7 5h6v2h2v6h-2v2H7v-2H5V7h2zm1 2v1H7v4h1v1h4v-1h1V8h-1V7z'],
 ['dark','Dark','M9 2h3v2h-2v2H9v5h2v2h5v-1h2v3h-2v2h-3v1H7v-1H4v-2H2v-3H1V8h1V5h2V3h5zm-4 3v2H4v5h1v2h3v2h5v-1h1v-1h-4v-2H8V9H7V6h1V4H7v1z'],
 ['system','Use system setting','M2 2h16v12h-7v2h4v2H5v-2h4v-2H2zm2 2v8h12V4z']
];
export function themeControl(location='header'){
 return `<div class="theme-control theme-control--${location}" role="group" aria-label="Colour theme">${choices.map(([value,label,path])=>`<button type="button" class="theme-option" data-theme-option="${value}" aria-label="${label}" title="${label}" aria-pressed="${value==='system'}"><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" shape-rendering="crispEdges"><path fill-rule="evenodd" d="${path}"/></svg></button>`).join('')}</div>`;
}
