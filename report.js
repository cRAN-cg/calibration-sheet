// Calibration Sheet reporter: where a page's readings go.
//
//   ?report=https://host/base   readings go to https://host/base/event
//                               (remembered for this tab, so links keep it)
//   no ?report, served by a rig readings go to ./event on the same host
//   no ?report, on GitHub Pages readings stay on the page (nothing is sent)
//
// Every reading is one GET (or a beacon when the page goes away):
//   <endpoint>?type=<kind>&...fields...&inst=<page load id>&seq=<n>
// `inst` tells page loads apart (two tabs, a reload); `seq` orders the
// readings of one load. See README.md for the kinds and their fields.
(function () {
  var q = new URLSearchParams(location.search), r = q.get('report');
  try {
    if (r) sessionStorage.setItem('sheet.report', r);
    else r = sessionStorage.getItem('sheet.report');
  } catch (e) {}
  var base = r ? r.replace(/\/+$/, '') + '/event'
       : (/\.github\.io$/.test(location.hostname) || location.protocol === 'file:') ? null : 'event';
  var inst = Math.random().toString(36).slice(2, 10), seq = 0;
  function url(q) { seq++; return base + '?' + q + '&inst=' + inst + '&seq=' + seq; }
  window.Sheet = {
    inst: inst,
    endpoint: base,
    send: function (q) {
      if (!base) return;
      // cross-origin: an opaque GET is enough, the reply is never read
      fetch(url(q), { cache: 'no-store', mode: r ? 'no-cors' : 'same-origin', keepalive: true }).catch(function () {});
    },
    beacon: function (q) {
      if (!base) return;
      try { navigator.sendBeacon(url(q)); } catch (e) {}
    }
  };
})();
