/* Runs before first paint so the saved theme and sidebar state apply without a flash. */
try{var d=document.documentElement,t=localStorage.getItem('cs-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');d.dataset.theme=t;if(localStorage.getItem('cs-side')==='1')d.classList.add('side-collapsed')}catch(e){}
