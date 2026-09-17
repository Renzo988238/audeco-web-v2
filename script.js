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
  const asunto=`Caso de consumidor — ${nombre||'AUDECO'}`;
  const cuerpo=[
    `Nombre: ${nombre}`,
    `Correo: ${correo}`,
    telefono?`Teléfono: ${telefono}`:null,
    empresa?`Empresa o proveedor: ${empresa}`:null,
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

// Current year
$('#year').textContent=new Date().getFullYear();
