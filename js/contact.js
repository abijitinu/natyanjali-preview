/* ==========================================================================
   Contact page: the message form and the three location cards.
   Settings (locations, phone, WhatsApp, registrationUrl) are in js/config.js.
   ========================================================================== */
(function () {
  "use strict";

  var config = window.NATYANJALI || {};
  var normalisePhone = (window.NatyanjaliUtils || {}).normalisePhone;

  /* ------------------------------------------------------------------------
     Location cards: a map, the address and a Get directions button for each place
     ------------------------------------------------------------------------ */
  function buildLocations() {
    var grid = document.getElementById("location-grid");
    var places = Array.isArray(config.locations) ? config.locations : [];
    var section = document.getElementById("locations");
    if (!grid) return;
    if (!places.length) {
      if (section) section.hidden = true;
      return;
    }

    var centres = 0;
    places.forEach(function (place) {
      var target = place.map || place.address || place.name;
      var card = document.createElement("article");
      card.className = "card location-card";

      var visual;
      if (place.online) {
        // The online classes have no address, so this card shows the ornament instead of a map
        visual = document.createElement("div");
        visual.className = "location-map location-online";
        var mark = document.createElement("img");
        mark.src = "images/ornament-gold.png";
        mark.alt = "";
        mark.width = 390;
        mark.height = 352;
        visual.appendChild(mark);
      } else {
        visual = document.createElement("iframe");
        visual.className = "location-map";
        visual.title = "Map of our " + place.name + " centre";
        visual.loading = "lazy";
        visual.referrerPolicy = "no-referrer-when-downgrade";
        visual.src = "https://maps.google.com/maps?q=" + encodeURIComponent(target) + "&z=16&output=embed";
      }

      var body = document.createElement("div");
      body.className = "location-body";

      var number = document.createElement("p");
      number.className = "label";
      number.textContent = place.online ? "Online" : "Centre " + String(++centres).padStart(2, "0");

      var name = document.createElement("h3");
      name.className = "heading";
      name.textContent = place.name;

      var address = document.createElement("p");
      address.className = "location-address";
      address.textContent = place.address || "";

      var action = document.createElement("a");
      action.className = "btn btn-secondary btn-block";
      if (place.online) {
        action.href = place.link || "classes.html#online";
        action.textContent = place.linkText || "See online batches";
      } else {
        action.href = place.directions || "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(target);
        action.target = "_blank";
        action.rel = "noopener";
        action.textContent = "Get directions";
        action.setAttribute("aria-label", "Get directions to our " + place.name + " centre");
      }

      body.appendChild(number);
      body.appendChild(name);
      if (place.address) body.appendChild(address);
      body.appendChild(action);
      card.appendChild(visual);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------------
     Message form
     ------------------------------------------------------------------------ */
  var form = document.getElementById("message-form");
  if (form) initMessageForm();

  function initMessageForm() {
    var submit = document.getElementById("message-submit");
    var alertBox = document.getElementById("message-alert");
    var done = document.getElementById("message-done");
    var consent = document.getElementById("msgConsent");

    // The location choices come from the same list as the cards
    var select = document.getElementById("msgLocation");
    (Array.isArray(config.locations) ? config.locations : []).forEach(function (place) {
      var option = document.createElement("option");
      option.value = place.name;
      option.textContent = place.name;
      select.appendChild(option);
    });

    function fieldBox(name) { return form.querySelector('[data-field="' + name + '"]'); }

    function showError(name, message) {
      var box = fieldBox(name);
      var error = box.querySelector(".field-error");
      if (!error) return;
      if (!error.id) error.id = "msg-" + name + "-error";
      box.classList.add("has-error");
      error.textContent = message;
      error.hidden = false;
      box.querySelectorAll("input, textarea").forEach(function (control) {
        control.setAttribute("aria-invalid", "true");
        control.setAttribute("aria-describedby", error.id);
      });
    }

    function clearError(name) {
      var box = fieldBox(name);
      if (!box) return;
      var error = box.querySelector(".field-error");
      if (!error) return;
      box.classList.remove("has-error");
      error.hidden = true;
      box.querySelectorAll("input, textarea").forEach(function (control) {
        control.removeAttribute("aria-invalid");
        control.removeAttribute("aria-describedby");
      });
    }

    function validate() {
      var el = form.elements;
      var problems = [];
      function check(name, message) {
        if (message) { showError(name, message); problems.push(name); } else { clearError(name); }
      }
      check("name", el.name.value.trim() ? "" : "Please enter your name.");
      check("phone", normalisePhone && normalisePhone(el.phone.value) ? "" : "Please enter a 10-digit mobile number.");
      check("email", el.email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.email.value.trim()) ? "That email doesn't look right. Please check it." : "");
      check("message", el.message.value.trim() ? "" : "Please write your message.");
      check("consent", consent.checked ? "" : "Please tick this box so we can reply to you.");
      return problems;
    }

    function readForm() {
      var el = form.elements;
      return {
        type: "message",
        name: el.name.value.trim(),
        phone: normalisePhone(el.phone.value),
        email: el.email.value.trim(),
        location: el.location.value,
        message: el.message.value.trim(),
        website: el.website.value
      };
    }

    function whatsappLink(data) {
      if (!config.whatsapp) return "";
      var lines = ["Hello, I have a question for Natyanjali Nṛtta Kalakshetra.", "", data.message, "", "Name: " + data.name, "Phone: " + data.phone];
      if (data.location) lines.push("About: " + data.location);
      return "https://wa.me/" + String(config.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(lines.join("\n"));
    }

    function fallbackLink(data) {
      var href = whatsappLink(data);
      if (href) return { href: href, text: "Send it on WhatsApp instead." };
      if (config.phone) return { href: "tel:" + config.phone.replace(/\s/g, ""), text: "Call us on " + config.phone + "." };
      return null;
    }

    function showAlert(message, link) {
      alertBox.textContent = message;
      if (link) {
        alertBox.appendChild(document.createTextNode(" "));
        var anchor = document.createElement("a");
        anchor.href = link.href;
        anchor.textContent = link.text;
        anchor.target = "_blank";
        anchor.rel = "noopener";
        alertBox.appendChild(anchor);
      }
      alertBox.hidden = false;
    }

    function setBusy(busy) {
      submit.setAttribute("aria-busy", busy ? "true" : "false");
      submit.disabled = busy;
      submit.textContent = busy ? "Sending…" : "Send message";
    }

    function showDone(title, text, whatsappHref) {
      document.getElementById("message-done-title").textContent = title;
      document.getElementById("message-done-text").textContent = text;
      var button = document.getElementById("message-whatsapp");
      button.hidden = !whatsappHref;
      if (whatsappHref) button.href = whatsappHref;
      form.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
      done.parentElement.scrollIntoView({ block: "center" });
    }

    function send(data) {
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, 20000);
      // text/plain keeps this a simple request, which Google Apps Script accepts
      return fetch(config.registrationUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
        signal: controller.signal
      })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (result) {
          if (!result || result.ok !== true) throw new Error("Not saved");
        })
        .finally(function () { clearTimeout(timer); });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      alertBox.hidden = true;

      var problems = validate();
      if (problems.length) {
        var first = fieldBox(problems[0]).querySelector("input, textarea");
        if (first) first.focus();
        return;
      }

      var data = readForm();

      // A filled spam trap means a bot. Look finished, send nothing.
      if (data.website) {
        showDone("Thank you", "Your message has been received.", "");
        return;
      }

      if (!config.registrationUrl) {
        var whatsappHref = whatsappLink(data);
        if (whatsappHref) {
          showDone("One last step", "Tap the button below and press send in WhatsApp. Your message isn't sent until you do.", whatsappHref);
        } else {
          showAlert("Messages aren't connected yet, so this has not been sent.", fallbackLink(data));
        }
        return;
      }

      setBusy(true);
      send(data)
        .then(function () {
          showDone("Thank you, " + data.name, "We've received your message and will get back to you on " + data.phone + " within 2 working days.", "");
        })
        .catch(function () {
          showAlert("We couldn't send your message. It's still here, so please try again.", fallbackLink(data));
        })
        .finally(function () { setBusy(false); });
    });

    // Clear a field's error as soon as the person starts fixing it
    form.addEventListener("input", function (event) {
      if (event.target.name) clearError(event.target.name);
    });
    consent.addEventListener("change", function () {
      submit.classList.toggle("is-waiting", !consent.checked);
    });

    document.getElementById("message-again").addEventListener("click", function () {
      form.reset();
      submit.classList.add("is-waiting");
      done.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }

  buildLocations();
})();
