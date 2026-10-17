/* Runs before styles/rendering in the toolkit and the standalone Quick Guide. */
(function(){
 var key='mojo-theme',choice='system',system=window.matchMedia('(prefers-color-scheme: dark)');
 function valid(value){return ['light','dark','system'].includes(value)?value:'system'}
 try{choice=valid(localStorage.getItem(key))}catch(error){}
 function sync(){document.querySelectorAll('[data-theme-option]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.themeOption===choice))})}
 function apply(){var theme=choice==='system'?(system.matches?'dark':'light'):choice;document.documentElement.dataset.theme=theme;document.documentElement.dataset.themePreference=choice;document.documentElement.style.colorScheme=theme;var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#201C18':'#FFF8F0';sync()}
 function choose(value){choice=valid(value);try{localStorage.setItem(key,choice)}catch(error){}apply()}
 window.MojoTheme={getPreference:function(){return choice},setPreference:choose,syncControls:sync};
 apply();system.addEventListener('change',function(){if(choice==='system')apply()});
 document.addEventListener('click',function(event){var button=event.target.closest('[data-theme-option]');if(button)choose(button.dataset.themeOption)});
 document.addEventListener('keydown',function(event){
  var button=event.target.closest('[data-theme-option]');if(!button)return;
  var directions={ArrowLeft:-1,ArrowRight:1,Home:0,End:2};if(!(event.key in directions))return;
  var buttons=Array.from(button.closest('[data-theme-control]').querySelectorAll('[data-theme-option]')),index=buttons.indexOf(button);
  var next=event.key==='Home'||event.key==='End'?directions[event.key]:(index+directions[event.key]+buttons.length)%buttons.length;
  event.preventDefault();buttons[next].focus();choose(buttons[next].dataset.themeOption);
 });
 document.addEventListener('DOMContentLoaded',sync);
 window.addEventListener('storage',function(event){if(event.key===key){choice=valid(event.newValue);apply()}});
})();
