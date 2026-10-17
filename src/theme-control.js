export function themeControl(location='sidebar'){
 return `<label class="theme-control theme-control--${location}"><span${location==='mobile'?' class="sr-only"':''}>Theme</span><select data-theme-select aria-label="Colour theme"><option value="light">Light</option><option value="dark">Dark</option><option value="system" selected>System</option></select></label>`;
}
