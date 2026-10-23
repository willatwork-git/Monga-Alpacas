/* Shared page behaviour: sticky header, menu button, section highlighting. */
(function(){
  var header=document.querySelector('.top'); if(!header) return;
  var nav=header.querySelector('nav'), btn=header.querySelector('.menu-btn');
  // Old links to articles on the home page: send them to the article library.
  if(/^#read\//.test(location.hash) && !document.querySelector('a[data-article][data-summary]')){ location.replace('articles.html'+location.hash); return; }
  function setHdr(){ document.documentElement.style.setProperty('--hdr',(header.offsetHeight+8)+'px'); }
  if(btn){
    btn.addEventListener('click',function(){ var open=!header.classList.contains('menu-open'); header.classList.toggle('menu-open',open); btn.setAttribute('aria-expanded',String(open)); setHdr(); });
    nav.addEventListener('click',function(e){ if(e.target.closest('a')){ header.classList.remove('menu-open'); btn.setAttribute('aria-expanded','false'); } });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&header.classList.contains('menu-open')){ header.classList.remove('menu-open'); btn.setAttribute('aria-expanded','false'); btn.focus(); } });
  }
  // Section highlighting on the home page (links that point to #sections on this page).
  // Home page sections without their own menu link light up the nearest page link (Bob -> articles, photos -> gallery).
  function key(a){ var h=a.getAttribute('href'); return h.indexOf('#')>-1 ? h.split('#')[1] : h; }
  var extra={paddock:'buy', bob:'articles.html', album:'gallery.html'};
  var onHome=!!document.getElementById('buy') && !document.body.classList.contains('no-spy');
  var links=onHome ? [].slice.call(nav.querySelectorAll('a')).filter(function(a){ return /^(index\.html)?#|^(articles|gallery)\.html$/.test(a.getAttribute('href')); }) : [];
  var secs=[]; links.forEach(function(a){ var id=key(a); if(id.indexOf('.html')<0){ var el=document.getElementById(id); if(el) secs.push({el:el,id:id}); } });
  Object.keys(extra).forEach(function(k){ var el=document.getElementById(k); if(el) secs.push({el:el,id:extra[k]}); });
  var current=null,ticking=false;
  function update(){
    ticking=false; header.classList.toggle('is-scrolled',window.scrollY>8);
    if(!secs.length) return;
    var line=header.offsetHeight+window.innerHeight*0.3, active=null, best=-Infinity;
    secs.forEach(function(s){ var t=s.el.getBoundingClientRect().top; if(t<=line&&t>best){best=t;active=s.id;} });
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4 && document.getElementById('contact')) active='contact';
    if(active===current) return; current=active;
    links.forEach(function(a){ if(key(a)===active) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll',function(){ if(!ticking){ticking=true;requestAnimationFrame(update);} },{passive:true});
  window.addEventListener('resize',function(){ setHdr(); update(); });
  setHdr(); update();
})();
