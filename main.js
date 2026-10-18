/* Kitchen & Co — scripts du site */

// Numéro WhatsApp K&Co (+212 661 491 543), format international sans + ni espaces
var WA_NUMBER = '212661491543';

function waLink(msg) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg); }

document.addEventListener('DOMContentLoaded', function () {
  // Menu mobile
  var burger = document.querySelector('.burger'), nav = document.querySelector('.nav');
  if (burger && nav) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Liens WhatsApp : <a data-wa="message">
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa') || 'Bonjour K&Co !');
    a.target = '_blank'; a.rel = 'noopener';
  });

  // Filtres de la carte
  var pills = document.querySelectorAll('#menu-filters .pill');
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      var c = p.getAttribute('data-cat');
      pills.forEach(function (x) { x.classList.toggle('on', x === p); x.setAttribute('aria-pressed', x === p ? 'true' : 'false'); });
      document.querySelectorAll('.menu-sec').forEach(function (s) { s.hidden = !(c === 'all' || s.id === c); });
    });
  });

  // Atelier présélectionné via ?atelier=
  var params = new URLSearchParams(location.search);
  var at = params.get('atelier');
  if (at) {
    var sel = document.querySelector('select[name="atelier"]');
    if (sel) { sel.value = at; }
  }
  // Boutons « Je m'inscris » qui remplissent le formulaire
  document.querySelectorAll('[data-pick-atelier]').forEach(function (b) {
    b.addEventListener('click', function () {
      var sel = document.querySelector('select[name="atelier"]');
      if (sel) sel.value = b.getAttribute('data-pick-atelier');
    });
  });

  // Date minimale = demain
  var t = new Date(); t.setDate(t.getDate() + 1);
  document.querySelectorAll('input[type="date"]').forEach(function (d) { d.min = t.toISOString().slice(0, 10); });

  // Formulaires → message WhatsApp pré-rempli
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null, lines = [];
      form.querySelectorAll('.field').forEach(function (f) {
        var inputs = f.querySelectorAll('input,select,textarea');
        if (!inputs.length) return;
        var label = f.getAttribute('data-label') || '';
        var value;
        if (inputs[0].type === 'checkbox') {
          value = Array.prototype.filter.call(inputs, function (i) { return i.checked; }).map(function (i) { return i.value; }).join(', ');
        } else {
          value = inputs[0].value.trim();
        }
        var required = f.hasAttribute('data-required');
        var bad = required && !value;
        if (!bad && value && inputs[0].type === 'tel' && value.replace(/\D/g, '').length < 9) bad = true;
        if (!bad && value && inputs[0].type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) bad = true;
        f.classList.toggle('err', bad);
        var msg = f.querySelector('.msg');
        if (msg) msg.textContent = bad ? (value ? 'Ce champ semble incorrect.' : 'Ce champ est obligatoire.') : '';
        inputs[0].setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && !firstBad) firstBad = inputs[0];
        if (value) {
          if (inputs[0].type === 'date') value = value.split('-').reverse().join('/');
          lines.push('• ' + label + ' : ' + value);
        }
      });
      if (firstBad) { firstBad.focus(); return; }
      var text = 'Bonjour K&Co ! ' + form.getAttribute('data-form') + '\n' + lines.join('\n');
      var url = waLink(text);
      var ok = form.querySelector('.ok');
      if (ok) {
        ok.innerHTML = 'Merci ! Votre demande s\'ouvre dans WhatsApp, il ne reste qu\'à l\'envoyer. Rien ne s\'est ouvert ? <a href="' + url + '" target="_blank" rel="noopener">Cliquez ici</a>.';
        ok.classList.add('show');
      }
      window.open(url, '_blank', 'noopener');
    });
  });
});
