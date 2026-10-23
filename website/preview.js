/* PREVIEW ONLY: banner, "Comments" switch, section labels and "Email Will about this" button for Bob's review.
   To remove before launch: delete this file and the <script src="preview.js"> line in each page. */
(function(){
  var TO='will.is@outlook.com', KEY='mongaFeedback';
  var page=document.body.getAttribute('data-page')||document.title.split('—')[0].trim();
  function getPref(){ try{ return localStorage.getItem(KEY)==='on'; }catch(e){ return false; } }
  function setPref(on){ try{ localStorage.setItem(KEY,on?'on':'off'); }catch(e){} }

  var css=document.createElement('style');
  css.textContent=
  '.pv-banner{background:#a3352b;color:#fff;font:500 1.05rem/1.35 "Barlow Condensed",sans-serif;padding:8px 16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 18px;letter-spacing:.02em}'+
  '.pv-banner a{color:#fff;font-weight:700}'+
  '.pv-switch{display:inline-flex;align-items:center;gap:10px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.5);border-radius:40px;padding:4px 6px 4px 14px;color:#fff;font:600 1.05rem "Barlow Condensed",sans-serif;cursor:pointer}'+
  '.pv-switch .track{position:relative;width:46px;height:24px;border-radius:12px;background:rgba(255,255,255,.35);transition:background .15s}'+
  '.pv-switch .knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .15s}'+
  '.pv-switch[aria-checked="true"] .track{background:#2f4a47}.pv-switch[aria-checked="true"] .knob{left:25px}'+
  '.pv-switch .state{min-width:2.2em;text-align:left}'+
  '.pv-btn{position:fixed;right:16px;bottom:16px;z-index:50;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);background:#a3352b;color:#fff;border:0;border-radius:40px;padding:14px 22px;font:600 1.2rem/1.2 "Barlow Condensed",sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.28);cursor:pointer;text-align:left}'+
  '.pv-btn:hover{background:#86281f}.pv-btn small{display:block;font-weight:500;font-size:.95rem;opacity:.9}'+
  '.pv-btn svg{flex:none;width:26px;height:26px}'+
  '[data-fb]{position:relative}'+
  '.pv-code{position:absolute;top:10px;left:10px;z-index:6;background:#a3352b;color:#fff;font:700 1.05rem/1 "Barlow Condensed",sans-serif;padding:5px 9px;border-radius:3px;box-shadow:0 2px 8px rgba(0,0,0,.25);pointer-events:none}'+
  'body:not(.pv-on) .pv-code, body:not(.pv-on) .pv-btn{display:none!important}'+
  'body.pv-on .lib-head, body.pv-on .lib-main{padding-top:44px}body.pv-on .lib-main .pv-code{top:0;left:0}body.pv-on .lib-head .pv-code{top:0;left:0}'+
  '@media print{.pv-banner,.pv-btn,.pv-code{display:none!important}}';
  document.head.appendChild(css);

  // Banner with the switch
  var bar=document.createElement('aside'); bar.className='pv-banner'; bar.setAttribute('aria-label','Preview notice');
  bar.innerHTML='<span>Preview for Bob. Not the live website yet.</span>'+
    '<button type="button" class="pv-switch" role="switch" aria-checked="false"><span>Comments</span><span class="state">Off</span><span class="track"><span class="knob"></span></span></button>'+
    '<a href="bob.html">How to send Will your comments</a>';
  document.body.insertBefore(bar,document.body.firstChild);
  var sw=bar.querySelector('.pv-switch'), state=sw.querySelector('.state');

  // Section labels (H1, H2 ... G1 ... A1)
  [].forEach.call(document.querySelectorAll('[data-fb]'),function(s){
    var c=s.getAttribute('data-fb').split(' ')[0];
    if(/^[A-Z]\d+$/.test(c)){ var b=document.createElement('span'); b.className='pv-code'; b.textContent=c; b.setAttribute('aria-hidden','true'); s.insertBefore(b,s.firstChild); }
  });

  // Email button
  var btn=document.createElement('button'); btn.type='button'; btn.className='pv-btn';
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span>Email Will about this<small class="pv-where"></small></span>';
  document.body.appendChild(btn);
  var where=btn.querySelector('.pv-where');

  function current(){
    var d=document.querySelector('dialog[open]');
    if(d&&d.id==='reader'){ var t=d.querySelector('#reader-title'); return 'Article: '+(t?t.textContent:''); }
    if(d&&d.id==='lb'){ var c=d.querySelector('#lb-cap'); return 'Photo: '+(c?c.textContent:''); }
    var secs=document.querySelectorAll('[data-fb]'), line=window.innerHeight*0.45, best=null;
    for(var i=0;i<secs.length;i++){ if(secs[i].getBoundingClientRect().top<=line) best=secs[i]; }
    if(best) return best.getAttribute('data-fb');
    return secs.length? secs[0].getAttribute('data-fb') : page;
  }
  function tick(){
    if(!document.body.classList.contains('pv-on')) return;
    var w=current(); if(where.textContent!==w) where.textContent=w;
    var d=document.querySelector('dialog[open]'), host=d||document.body;
    if(btn.parentNode!==host) host.appendChild(btn);
  }
  function apply(on){
    document.body.classList.toggle('pv-on',on);
    sw.setAttribute('aria-checked',String(on)); state.textContent=on?'On':'Off';
    tick();
  }
  sw.addEventListener('click',function(){ var on=!document.body.classList.contains('pv-on'); setPref(on); apply(on); });

  // Keep the label in step: on scroll, clicks, keys, and whenever an article or photo caption changes.
  window.addEventListener('scroll',tick,{passive:true});
  document.addEventListener('click',function(){ setTimeout(tick,0); },true);
  document.addEventListener('keyup',function(){ setTimeout(tick,0); });
  if(window.MutationObserver){
    var mo=new MutationObserver(function(){ tick(); });
    mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['open']});
  }
  setInterval(tick,1000);

  btn.addEventListener('click',function(){
    var w=current();
    var subject='Website: '+page+' - '+w;
    var body='Page: '+page+'\nPart: '+w+'\n\nMy comment:\n\n\n\n(Web address: '+location.href+')';
    location.href='mailto:'+TO+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });

  apply(getPref());
})();
