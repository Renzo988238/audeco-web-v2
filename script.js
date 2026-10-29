const $=(s)=>document.querySelector(s), $$=(s)=>document.querySelectorAll(s);

// Mobile navigation
const menu=$('.menu-toggle'), nav=$('.main-nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
$$('.main-nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));

// Scroll progress
const progress=$('#progress');
window.addEventListener('scroll',()=>{const h=document.documentElement;progress.style.width=`${(h.scrollTop/(h.scrollHeight-h.clientHeight))*100}%`},{passive:true});

// Reveal on scroll
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));

// Institutional details accordion
const details=$('.details'), toggle=$('.details-toggle');
toggle?.addEventListener('click',()=>{const open=details.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});

// Rights modal
const modal=$('#info-modal'), modalTitle=$('#modal-title'), modalText=$('#modal-text');
const rights={
 informacion:['Información','Las personas consumidoras tienen derecho a recibir información relevante, veraz, suficiente, oportuna y fácilmente accesible sobre los productos y servicios que adquieren.'],
 idoneidad:['Idoneidad','La idoneidad se relaciona con la correspondencia entre lo que una persona razonablemente espera y lo que recibe, considerando lo ofrecido, informado y acordado.'],
 reclamo:['Reclamo','Las personas consumidoras cuentan con mecanismos para formular reclamos frente a problemas en sus relaciones de consumo y obtener una respuesta.'],
 intereses:['Protección','La protección del consumidor comprende la defensa de sus intereses económicos y de otros derechos reconocidos por el marco de protección al consumidor.']
};
$$('[data-modal]').forEach(btn=>btn.addEventListener('click',()=>{const data=rights[btn.dataset.modal];modalTitle.textContent=data[0];modalText.textContent=data[1];modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')}));
$$('[data-close]').forEach(el=>el.addEventListener('click',closeModal));
function closeModal(){modal?.classList.remove('show');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('show'))closeModal()});

// Formulario de contacto (sitio estático: arma un correo con lo escrito, no hay backend propio)
const contactForm=$('#contact-form'), fallback=$('#form-fallback'), fallbackText=$('#fallback-text'), fallbackCopy=$('#fallback-copy');
contactForm?.addEventListener('submit',e=>{
  e.preventDefault();
  const f=new FormData(contactForm);
  const nombre=(f.get('nombre')||'').trim();
  const correo=(f.get('correo')||'').trim();
  const telefono=(f.get('telefono')||'').trim();
  const empresa=(f.get('empresa')||'').trim();
  const mensaje=(f.get('mensaje')||'').trim();
  const exterior=f.get('ubicacion')==='Extranjero';
  const pais=(f.get('pais')||'').trim();
  const asunto=`Caso de consumidor${exterior?' (desde el extranjero)':''} — ${nombre||'AUDECO'}`;
  const cuerpo=[
    `Nombre: ${nombre}`,
    `Correo: ${correo}`,
    telefono?`Teléfono: ${telefono}`:null,
    empresa?`Empresa o proveedor: ${empresa}`:null,
    exterior?`Ubicación: En el extranjero${pais?` (${pais})`:''} — compra realizada en el Perú`:null,
    '',
    'Qué pasó:',
    mensaje
  ].filter(Boolean).join('\n');
  // Intento principal: abrir el correo del visitante ya redactado
  window.location.href=`mailto:audeco9@gmail.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  // Respaldo siempre visible: por si el dispositivo no tiene correo configurado
  if(fallback&&fallbackText){
    fallbackText.value=`Para: audeco9@gmail.com\nAsunto: ${asunto}\n\n${cuerpo}`;
    fallback.hidden=false;
    fallback.scrollIntoView({behavior:'smooth',block:'center'});
  }
});
// Mostrar el campo de país solo si la persona está en el extranjero
const locSelect=$('select[name="ubicacion"]'), countryField=$('#country-field');
locSelect?.addEventListener('change',()=>{if(countryField)countryField.hidden=locSelect.value!=='Extranjero'});
if(location.hash==='#desde-el-extranjero'&&locSelect){locSelect.value='Extranjero';if(countryField)countryField.hidden=false}
fallbackCopy?.addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText(fallbackText.value);
    fallbackCopy.textContent='¡Copiado!';
    fallbackCopy.classList.add('copied');
    setTimeout(()=>{fallbackCopy.textContent='Copiar mensaje';fallbackCopy.classList.remove('copied')},2200);
  }catch{
    fallbackText.select();
    document.execCommand('copy');
  }
});

// Ventana de Facebook: botón fijo a la derecha; en el inicio (PC) aparece abierta hasta que la minimicen
const FB_PAGE='https://www.facebook.com/AudecoPe';
const fbw=document.createElement('div');
fbw.className='fbw';
fbw.innerHTML=`
  <div class="fbw-panel" id="fbw-panel" role="region" aria-label="Últimas publicaciones de AUDECO en Facebook">
    <div class="fbw-head"><strong>Lo último de AUDECO</strong><button class="fbw-min" type="button" aria-label="Minimizar">–</button></div>
    <div class="fbw-body"></div>
    <a class="fbw-foot" href="${FB_PAGE}" target="_blank" rel="noopener noreferrer">Abrir nuestra página en Facebook →</a>
  </div>
  <button class="fbw-btn" type="button" aria-expanded="false" aria-controls="fbw-panel">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"/></svg>
    <span>Nuestras novedades</span><i class="fbw-dot"></i>
  </button>`;
document.body.appendChild(fbw);
const fbwBtn=fbw.querySelector('.fbw-btn'), fbwBody=fbw.querySelector('.fbw-body');
function fbwLoad(){
  // El plugin de Facebook se carga recién al abrir, para no hacer lenta la página
  if(fbwBody.firstChild)return;
  const w=Math.min(340,window.innerWidth-28);
  fbwBody.innerHTML=`<iframe title="Publicaciones de AUDECO en Facebook" src="https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(FB_PAGE)}&tabs=timeline&width=${w}&height=430&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&locale=es_LA" width="${w}" height="430" style="border:none;overflow:hidden;display:block;margin:auto" scrolling="no" allow="encrypted-media" loading="lazy"></iframe>`;
}
function fbwSet(open,remember){
  fbw.classList.toggle('open',open);
  fbwBtn.setAttribute('aria-expanded',open);
  if(open)fbwLoad();
  if(remember){try{localStorage.setItem('fbw-min',open?'0':'1')}catch{}}
}
fbwBtn.addEventListener('click',()=>fbwSet(!fbw.classList.contains('open'),true));
fbw.querySelector('.fbw-min').addEventListener('click',()=>fbwSet(false,true));
const isHome=/(^\/$|index\.html$)/.test(location.pathname);
let fbwMin=false;try{fbwMin=localStorage.getItem('fbw-min')==='1'}catch{}
if(isHome&&!fbwMin&&window.innerWidth>=900)setTimeout(()=>fbwSet(true,false),1200);

// Current year
$('#year').textContent=new Date().getFullYear();
