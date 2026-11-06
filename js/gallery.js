/* ==========================================================================
   Gallery page: a Pinterest-style photo layout, and a full-screen viewer with
   arrows to move between photos. The photos themselves are plain HTML in
   gallery.html, so the page works without this script.
   ========================================================================== */
(function () {
  "use strict";

  // The photos in the order they're written in gallery.html. The viewer follows this order.
  var openers = Array.prototype.slice.call(document.querySelectorAll(".gallery-open"));

  /* ------------------------------------------------------------------------
     Pinterest-style layout: each photo goes into whichever column is shortest,
     so the columns stay level and the photos read left to right.
     Without JavaScript, the page falls back to plain CSS columns.
     ------------------------------------------------------------------------ */
  var grid = document.getElementById("gallery-grid");
  var items = grid ? Array.prototype.slice.call(grid.querySelectorAll(".gallery-item")) : [];
  var columnCount = 0;

  function wantedColumns() {
    if (window.matchMedia("(max-width: 520px)").matches) return 2;
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    var gap = parseFloat(getComputedStyle(grid).columnGap) || 12;
    return Math.max(1, Math.floor((grid.clientWidth + gap) / (11 * rem + gap)));
  }

  function layout() {
    var count = wantedColumns();
    if (count === columnCount) return;
    columnCount = count;

    var gap = parseFloat(getComputedStyle(grid).columnGap) || 12;
    var width = (grid.clientWidth - gap * (count - 1)) / count;
    var columns = [];
    var heights = [];
    for (var i = 0; i < count; i++) {
      var column = document.createElement("div");
      column.className = "gallery-column";
      columns.push(column);
      heights.push(0);
    }

    items.forEach(function (item) {
      var image = item.querySelector("img");
      var ratio = (parseFloat(image.getAttribute("height")) / parseFloat(image.getAttribute("width"))) || (image.naturalHeight / image.naturalWidth) || 1;
      var shortest = heights.indexOf(Math.min.apply(null, heights));
      columns[shortest].appendChild(item);
      heights[shortest] += width * ratio + gap;
    });

    // Remove the old columns (now empty), then add the new ones
    Array.prototype.slice.call(grid.querySelectorAll(".gallery-column")).forEach(function (old) {
      if (old.parentNode === grid) grid.removeChild(old);
    });
    columns.forEach(function (column) { grid.appendChild(column); });
    grid.classList.add("is-masonry");
  }

  if (grid && items.length) {
    layout();
    var resizing;
    window.addEventListener("resize", function () {
      clearTimeout(resizing);
      resizing = setTimeout(layout, 120);
    });
  }

  /* ------------------------------------------------------------------------
     Full-screen viewer
     ------------------------------------------------------------------------ */
  var dialog = document.getElementById("lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;
  if (!openers.length) return;

  var image = document.getElementById("lightbox-image");
  var caption = document.getElementById("lightbox-caption");
  var previous = document.getElementById("lightbox-prev");
  var next = document.getElementById("lightbox-next");
  var current = 0;

  function show(index) {
    current = (index + openers.length) % openers.length;
    var opener = openers[current];
    image.src = opener.getAttribute("data-full");
    image.alt = opener.querySelector("img").alt;
    caption.textContent = opener.getAttribute("data-caption") || "";
  }

  openers.forEach(function (opener, index) {
    opener.addEventListener("click", function () {
      show(index);
      dialog.showModal();
    });
  });

  // With a single photo there is nowhere to go, so the arrows are hidden
  if (openers.length < 2) {
    previous.hidden = true;
    next.hidden = true;
  }

  previous.addEventListener("click", function () { show(current - 1); });
  next.addEventListener("click", function () { show(current + 1); });
  document.getElementById("lightbox-close").addEventListener("click", function () { dialog.close(); });

  // A tap on the dark area around the photo closes it
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (openers.length < 2) return;
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
})();
