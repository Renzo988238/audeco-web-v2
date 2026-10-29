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

// Publicaciones de Facebook: sección en el inicio y botón fijo a la derecha en todas las páginas
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
// Las publicaciones se leen de novedades.json: para agregar una, se edita ese archivo
const ICONO=(d)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TIPO_ICONO={
  Evento:ICONO('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  Alerta:ICONO('<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>'),
  Comunicado:ICONO('<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6"/>'),
  Actividad:ICONO('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 4a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>'),
  Publicación:ICONO('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>')
};
let novedades=null;
function fechaCorta(iso){
  const d=new Date(iso+'T12:00:00');
  return isNaN(d)?'':d.toLocaleDateString('es-PE',{day:'numeric',month:'long',year:'numeric'});
}
function esc(t){const d=document.createElement('div');d.textContent=t??'';return d.innerHTML}
async function cargarNovedades(){
  try{novedades??=await fetch('/novedades.json',{cache:'no-cache'}).then(r=>r.json())}catch{novedades=[]}
  return novedades.slice().sort((x,y)=>y.fecha.localeCompare(x.fecha));
}
// Quita los hashtags y el enlace a formularios para que el resumen se lea limpio
function resumen(n){
  return [n.titulo,n.texto].filter(Boolean).join(' ').replace(/#[\p{L}\p{N}_]+/gu,'').replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim();
}
const sinPosts=()=>`<p class="fb-empty">Mira nuestras últimas publicaciones en <a href="${FB_PAGE}" target="_blank" rel="noopener noreferrer">Facebook</a>.</p>`;
// Lista compacta (ventana flotante)
async function renderFeed(box){
  const items=(await cargarNovedades()).slice(0,+box.dataset.limit||4);
  if(!items.length){box.innerHTML=sinPosts();return}
  box.innerHTML=items.map(n=>`
    <a class="fb-item" href="${esc(n.enlace||FB_PAGE)}" target="_blank" rel="noopener noreferrer">
      ${n.imagen?`<img class="fb-thumb" src="${esc(n.imagen)}" alt="" loading="lazy">`:`<span class="fb-thumb fb-icon" aria-hidden="true">${TIPO_ICONO[n.tipo]||TIPO_ICONO.Publicación}</span>`}
      <span class="fb-text">
        <small>${fechaCorta(n.fecha)}</small>
        <span>${esc(resumen(n))}</span>
        <em>Ver en Facebook →</em>
      </span>
    </a>`).join('');
}
// Tipo de post según su contenido: infografía (solo imagen), artículo (texto largo) o publicación
function clasificar(n){
  const t=resumen({texto:n.texto}), largo=(n.titulo+' '+n.texto).length;
  if(n.imagen&&t.length<40&&!n.titulo)return{tipo:'Infografía',accion:'Ver infografía'};
  if(largo>500)return{tipo:'Artículo',accion:'Leer artículo completo'};
  return{tipo:'Publicación',accion:'Ver en Facebook'};
}
// Tarjetas grandes con foto (inicio)
async function renderCards(box){
  const items=(await cargarNovedades()).slice(0,+box.dataset.limit||3);
  if(!items.length){box.innerHTML=sinPosts();return}
  box.innerHTML=items.map(n=>{
    const c=clasificar(n), titulo=resumen({titulo:n.titulo}), texto=resumen({texto:n.texto});
    return `
    <a class="fb-card ${c.tipo==='Infografía'?'is-info':''}" href="${esc(n.enlace||FB_PAGE)}" target="_blank" rel="noopener noreferrer">
      <span class="fb-card-img">${n.imagen
        ?`<img class="fb-card-blur" src="${esc(n.imagen)}" alt="" aria-hidden="true"><img class="fb-card-photo" src="${esc(n.imagen)}" alt="" loading="lazy">`
        :`<img class="fb-card-logo" src="/logo-audeco.png?v=5" alt="">`}</span>
      <span class="fb-card-body">
        <small><b>${c.tipo}</b> · ${fechaCorta(n.fecha)}</small>
        ${titulo?`<strong class="fb-card-title">${esc(titulo)}</strong>`:''}
        ${texto?`<span class="fb-card-text ${titulo?'':'solo'}">${esc(texto)}</span>`:''}
        <em>${c.accion} →</em>
      </span>
    </a>`}).join('');
}
function fbwLoad(){
  if(!fbwBody.firstChild){fbwBody.dataset.limit=4;renderFeed(fbwBody)}
}
function fbwSet(open){
  fbw.classList.toggle('open',open);
  fbwBtn.setAttribute('aria-expanded',open);
  if(open)fbwLoad();
}
fbwBtn.addEventListener('click',()=>fbwSet(!fbw.classList.contains('open')));
fbw.querySelector('.fbw-min').addEventListener('click',()=>fbwSet(false));
// Sección «Últimas publicaciones» del inicio
$$('.fb-cards').forEach(renderCards);

// Current year
$('#year').textContent=new Date().getFullYear();
