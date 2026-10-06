/** Full-section links need the running toolkit; adjacent downloads work standalone. */
export function configureGuideLinks(root=document, standalone=location.protocol==='file:') {
  root.querySelector('.offline-note').hidden=!standalone;
  root.querySelectorAll('[data-toolkit-link]').forEach(link=>{link.hidden=standalone});
}
