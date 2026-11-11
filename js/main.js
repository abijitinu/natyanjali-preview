(function () {
  "use strict";

  var config = window.NATYANJALI || {};

  /* ------------------------------------------------------------------------
     The footer rosette: two rings of 12 lotus petals, in fine gold line
     ------------------------------------------------------------------------ */
  function buildRosette() {
    var svg = document.getElementById("rosette");
    var NS = "http://www.w3.org/2000/svg";
    var STROKE = 1.25; // Stays this fine at any size, to match the other gold line artwork
    var gold = getComputedStyle(document.documentElement).getPropertyValue("--gold-on-dark").trim();

    function el(name, attrs, parent) {
      var node = document.createElementNS(NS, name);
      Object.keys(attrs).forEach(function (key) { node.setAttribute(key, attrs[key]); });
      parent.appendChild(node);
      return node;
    }

    function petal(inner, outer, width) {
      var near = 500 - inner;
      var far = 500 - outer;
      var span = outer - inner;
      return "M500 " + near +
        " C" + (500 + width) + " " + (near - span * 0.3) + " " + (500 + width) + " " + (near - span * 0.72) + " 500 " + far +
        " C" + (500 - width) + " " + (near - span * 0.72) + " " + (500 - width) + " " + (near - span * 0.3) + " 500 " + near + "Z";
    }

    var group = el("g", { fill: "none", stroke: gold, "stroke-width": STROKE, "stroke-linejoin": "round" }, svg);
    for (var i = 0; i < 12; i++) {
      el("path", { d: petal(170, 485, 118), transform: "rotate(" + i * 30 + " 500 500)", "vector-effect": "non-scaling-stroke" }, group);
      el("path", { d: petal(70, 300, 62), transform: "rotate(" + (i * 30 + 15) + " 500 500)", "vector-effect": "non-scaling-stroke" }, group);
    }
    el("circle", { cx: 500, cy: 500, r: 26, "vector-effect": "non-scaling-stroke" }, group);
  }

  /* ------------------------------------------------------------------------
     Registration form
     ------------------------------------------------------------------------ */
  var form = document.getElementById("registration-form");
  var submitButton = document.getElementById("submit-button");
  var alertBox = document.getElementById("form-alert");
  var done = document.getElementById("form-done");
  var guardianField = document.getElementById("guardian-field");
  var consent = document.getElementById("consent");

  function selectBatch(name) {
    var radio = form.querySelector('input[name="batch"][value="' + name + '"]');
    if (radio) radio.checked = true;
    updateGuardian();
    clearError("batch");
  }

  function batchForAge(age) {
    return age < 18 ? "Kids" : "Ladies";
  }

  function currentAge() {
    var age = parseInt(form.elements.age.value, 10);
    return age >= 5 && age <= 99 ? age : null;
  }

  function needsGuardian() {
    var age = currentAge();
    if (age !== null) return age < 18;
    var batch = form.elements.batch.value;
    return batch === "Kids";
  }

  function updateGuardian() {
    var show = needsGuardian();
    guardianField.hidden = !show;
    form.elements.guardianName.required = show;
    // Kids also give their school and standard
    document.getElementById("school-field").hidden = !show;
    document.getElementById("standard-field").hidden = !show;
    form.elements.schoolName.required = show;
    form.elements.standard.required = show;
    if (!show) clearError("guardianName");
  }

  function fieldBox(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  function showError(name, message) {
    var box = fieldBox(name);
    var error = box.querySelector(".field-error");
    box.classList.add("has-error");
    error.textContent = message;
    error.hidden = false;
    box.querySelectorAll("input, select, textarea").forEach(function (control) {
      control.setAttribute("aria-invalid", "true");
      if (!error.id) error.id = name + "-error";
      var described = control.getAttribute("aria-describedby") || "";
      if (described.indexOf(error.id) === -1) {
        control.setAttribute("aria-describedby", (described + " " + error.id).trim());
      }
    });
  }

  function clearError(name) {
    var box = fieldBox(name);
    if (!box) return;
    var error = box.querySelector(".field-error");
    if (!error) return;
    box.classList.remove("has-error");
    error.hidden = true;
    box.querySelectorAll("input, select, textarea").forEach(function (control) {
      control.removeAttribute("aria-invalid");
      if (error.id) {
        var described = (control.getAttribute("aria-describedby") || "").replace(error.id, "").trim();
        if (described) control.setAttribute("aria-describedby", described);
        else control.removeAttribute("aria-describedby");
      }
    });
  }

  // Accepts 10-digit Indian mobiles (with or without 0 / 91 / +91) and
  // international numbers written with a leading +.
  function normalisePhone(value) {
    var trimmed = value.trim();
    var digits = trimmed.replace(/\D/g, "");
    if (trimmed.charAt(0) === "+" && digits.indexOf("91") !== 0) {
      return digits.length >= 8 && digits.length <= 15 ? "+" + digits : null;
    }
    if (digits.length === 12 && digits.indexOf("91") === 0) digits = digits.slice(2);
    if (digits.length === 11 && digits.charAt(0) === "0") digits = digits.slice(1);
    return /^[6-9]\d{9}$/.test(digits) ? "+91" + digits : null;
  }

  function validate() {
    var el = form.elements;
    var problems = [];

    function check(name, message) {
      if (message) {
        showError(name, message);
        problems.push(name);
      } else {
        clearError(name);
      }
    }

    check("studentName", el.studentName.value.trim() ? "" : "Please enter the student's name.");
    check("age", currentAge() === null ? "Please enter an age between 5 and 99." : "");
    check("location", el.location.value ? "" : "Please choose a class location.");
    check("batch", el.batch.value ? "" : "Please choose a batch.");
    check("guardianName", needsGuardian() && !el.guardianName.value.trim() ? "Please enter a parent or guardian's name." : "");
    check("schoolName", needsGuardian() && !el.schoolName.value.trim() ? "Please enter the school the student attends." : "");
    check("standard", needsGuardian() && !el.standard.value.trim() ? "Please enter the standard (class) the student studies in." : "");
    check("address", el.address.value.trim() ? "" : "Please enter the address.");
    check("phone", normalisePhone(el.phone.value) ? "" : "Please enter a 10-digit mobile number.");
    check("email", el.email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.email.value.trim()) ? "That email doesn't look right. Please check it." : "");
    check("preferredTime", el.preferredTime.value ? "" : "Please choose your preferred days.");
    check("consent", consent.checked ? "" : "Please tick this box so we can contact you.");

    return problems;
  }

  function readForm() {
    var el = form.elements;
    return {
      studentName: el.studentName.value.trim(),
      age: currentAge(),
      location: el.location.value,
      batch: el.batch.value,
      guardianName: needsGuardian() ? el.guardianName.value.trim() : "",
      schoolName: needsGuardian() ? el.schoolName.value.trim() : "",
      standard: needsGuardian() ? el.standard.value.trim() : "",
      address: el.address.value.trim(),
      phone: normalisePhone(el.phone.value),
      email: el.email.value.trim(),
      experience: el.experience.value,
      preferredTime: el.preferredTime.value,
      healthNote: el.healthNote.value.trim(),
      message: el.message.value.trim(),
      website: el.website.value
    };
  }

  function whatsappLink(data) {
    if (!config.whatsapp) return "";
    var number = String(config.whatsapp).replace(/\D/g, "");
    var lines = [
      "Hello, I would like to join Natyanjali Nṛtta Kalakshetra.",
      "",
      "Student: " + data.studentName + " (age " + data.age + ")",
      "Location: " + data.location,
      "Batch: " + data.batch
    ];
    if (data.guardianName) lines.push("Parent or guardian: " + data.guardianName);
    if (data.schoolName) lines.push("School: " + data.schoolName + (data.standard ? ", " + data.standard : ""));
    lines.push("Address: " + data.address);
    lines.push("Phone: " + data.phone);
    lines.push("Experience: " + data.experience);
    lines.push("Preferred days: " + data.preferredTime);
    if (data.healthNote) lines.push("Injury or health note: " + data.healthNote);
    if (data.message) lines.push("Note: " + data.message);
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  function setBusy(busy) {
    submitButton.setAttribute("aria-busy", busy ? "true" : "false");
    submitButton.disabled = busy;
    submitButton.textContent = busy ? "Sending…" : "Send registration";
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

  function fallbackLink(data) {
    var href = whatsappLink(data);
    if (href) return { href: href, text: "Send it on WhatsApp instead." };
    if (config.phone) return { href: "tel:" + config.phone.replace(/\s/g, ""), text: "Call us on " + config.phone + "." };
    return null;
  }

  function showDone(title, text, whatsappHref) {
    document.getElementById("done-title").textContent = title;
    document.getElementById("done-text").textContent = text;
    var whatsappButton = document.getElementById("done-whatsapp");
    whatsappButton.hidden = !whatsappHref;
    if (whatsappHref) whatsappButton.href = whatsappHref;
    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    done.parentElement.scrollIntoView({ block: "center" });
  }

  function sendRegistration(data) {
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

  function onSubmit(event) {
    event.preventDefault();
    alertBox.hidden = true;

    var problems = validate();
    if (problems.length) {
      var first = fieldBox(problems[0]).querySelector("input, select, textarea");
      if (first) first.focus();
      return;
    }

    var data = readForm();
    var whatsappHref = whatsappLink(data);

    // A filled spam trap means a bot. Look finished, send nothing.
    if (data.website) {
      showDone("Thank you", "Your registration has been received.", "");
      return;
    }

    if (!config.registrationUrl) {
      if (whatsappHref) {
        showDone("One last step", "Tap the button below and press send in WhatsApp. Your registration isn't complete until you do.", whatsappHref);
      } else {
        showAlert("Online registration isn't connected yet, so this has not been sent.", fallbackLink(data));
      }
      return;
    }

    setBusy(true);
    sendRegistration(data)
      .then(function () {
        showDone(
          "Thank you, " + data.studentName,
          "We've received your registration and will call you on " + data.phone + " within 2 working days to confirm the batch and timing." + (data.email ? " A confirmation has also been sent to " + data.email + "." : ""),
          ""
        );
      })
      .catch(function () {
        showAlert("We couldn't send your registration. Your details are still here, so please try again.", fallbackLink(data));
      })
      .finally(function () { setBusy(false); });
  }

  function initForm() {
    form.addEventListener("submit", onSubmit);

    form.elements.age.addEventListener("input", function () {
      var age = currentAge();
      if (age !== null) selectBatch(batchForAge(age));
      updateGuardian();
    });

    form.addEventListener("change", function (event) {
      if (event.target.name === "batch") updateGuardian();
    });

    // Clear a field's error as soon as the person starts fixing it
    form.addEventListener("input", function (event) {
      if (event.target.name) clearError(event.target.name);
    });

    consent.addEventListener("change", function () {
      submitButton.classList.toggle("is-waiting", !consent.checked);
    });

    document.getElementById("done-again").addEventListener("click", function () {
      form.reset();
      submitButton.classList.add("is-waiting");
      updateGuardian();
      done.hidden = true;
      form.hidden = false;
      form.elements.studentName.focus();
    });
  }

  /* ------------------------------------------------------------------------
     Instagram profile
     ------------------------------------------------------------------------ */
  // The fixed grid from Instagram's profile embed: shown when there's no feed, or the feed fails.
  function showInstagramGrid(handle) {
    var frame = document.getElementById("ig-frame");
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.instagram.com/" + handle + "/embed/";
    iframe.title = "Latest posts from @" + handle + " on Instagram";
    iframe.loading = "lazy";
    iframe.setAttribute("scrolling", "no");
    frame.appendChild(iframe);
    frame.hidden = false;

    // The embed's rows are square, so its height follows its width
    function fit() {
      iframe.style.height = Math.round(frame.clientWidth * (2 / 3) + 170) + "px";
    }
    fit();
    window.addEventListener("resize", fit);
  }

  function loadInstagramFeed(url) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 8000);
    return fetch(url, { signal: controller.signal })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (feed) {
        var posts = (feed && feed.posts) || [];
        return posts.filter(function (post) {
          return post.permalink && post.sizes && post.sizes.medium && post.sizes.medium.mediaUrl;
        });
      })
      .finally(function () { clearTimeout(timer); });
  }

  function instagramTile(post, isClone) {
    var item = document.createElement("li");
    var link = document.createElement("a");
    var image = document.createElement("img");
    var words = String(post.altText || post.prunedCaption || "").trim();

    item.className = isClone ? "ig-tile ig-clone" : "ig-tile";
    link.href = post.permalink;
    link.target = "_blank";
    link.rel = "noopener";
    image.src = post.sizes.medium.mediaUrl;
    image.alt = isClone ? "" : words.slice(0, 140) || "Post on Instagram";
    image.loading = "lazy";
    image.decoding = "async";
    if (isClone) {
      item.setAttribute("aria-hidden", "true");
      link.tabIndex = -1;
    }

    // A soft colour from the photo fills the tile while it loads
    var dominant = post.colorPalette && post.colorPalette.dominant;
    if (/^\d{1,3},\d{1,3},\d{1,3}$/.test(dominant || "")) link.style.backgroundColor = "rgb(" + dominant + ")";

    link.appendChild(image);
    item.appendChild(link);
    return item;
  }

  function showInstagramCarousel(posts) {
    var carousel = document.getElementById("ig-carousel");
    var track = document.getElementById("ig-track");
    var pause = document.getElementById("ig-pause");

    posts.forEach(function (post) { track.appendChild(instagramTile(post, false)); });
    carousel.hidden = false;

    // The strip loops by sliding half its length, so it needs two identical halves,
    // each wider than the widest screen. A short feed is repeated until it is.
    var tileWidth = track.firstChild.getBoundingClientRect().width;
    var setsPerHalf = Math.ceil(2560 / (tileWidth * posts.length));
    for (var i = 1; i < setsPerHalf * 2; i++) {
      posts.forEach(function (post) { track.appendChild(instagramTile(post, true)); });
    }

    // Keeps the same gentle pace whatever the number of photos
    var halfLength = tileWidth * posts.length * setsPerHalf;
    track.style.setProperty("--ig-duration", Math.round(halfLength / 30) + "s");

    // Pointers pause it by hovering. This button covers touch screens and keyboards.
    pause.hidden = false;
    pause.addEventListener("click", function () {
      var paused = carousel.classList.toggle("is-paused");
      pause.textContent = paused ? "Play" : "Pause";
      pause.setAttribute("aria-pressed", paused ? "true" : "false");
    });
  }

  function initInstagram() {
    var handle = String(config.instagram || "").trim().replace(/^@/, "");
    var section = document.getElementById("instagram");
    var footerLink = document.getElementById("footer-instagram");
    if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
      if (section) section.hidden = true;
      footerLink.parentElement.hidden = true;
      return;
    }

    var profile = "https://www.instagram.com/" + handle + "/";
    footerLink.href = profile;

    // Only the Gallery page shows the feed
    if (!section) return;

    var follow = document.getElementById("ig-follow");
    follow.href = profile;

    if (!config.instagramFeed) {
      showInstagramGrid(handle);
      return;
    }
    loadInstagramFeed(config.instagramFeed)
      .then(function (posts) {
        if (posts.length) showInstagramCarousel(posts);
        else showInstagramGrid(handle);
      })
      .catch(function () { showInstagramGrid(handle); });
  }

  /* ------------------------------------------------------------------------
     Footer
     ------------------------------------------------------------------------ */
  function initFooter() {
    var contact = document.getElementById("footer-contact");
    if (config.address) document.getElementById("footer-address").textContent = config.address;

    function add(href, text) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      item.appendChild(link);
      contact.appendChild(item);
    }
    if (config.phone) add("tel:" + config.phone.replace(/\s/g, ""), config.phone);
    if (config.email) add("mailto:" + config.email, config.email);

    document.getElementById("year").textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------------
     Contact page: each way to reach us appears once it's set in config.js
     ------------------------------------------------------------------------ */
  function initContactList() {
    var list = document.getElementById("contact-list");
    if (!list) return;

    function add(label, href, text, newTab) {
      var row = document.createElement("div");
      var term = document.createElement("dt");
      var detail = document.createElement("dd");
      var link = document.createElement("a");
      term.className = "label";
      term.textContent = label;
      link.href = href;
      link.textContent = text;
      if (newTab) {
        link.target = "_blank";
        link.rel = "noopener";
      }
      detail.appendChild(link);
      row.appendChild(term);
      row.appendChild(detail);
      list.appendChild(row);
    }

    var inquiry = safeUrl(config.inquiryUrl);
    if (inquiry) add("Enquiry form", inquiry, "Open the enquiry form", true);
    if (config.phone) add("Phone", "tel:" + config.phone.replace(/\s/g, ""), config.phone);
    if (config.whatsapp) add("WhatsApp", "https://wa.me/" + String(config.whatsapp).replace(/\D/g, ""), "Message us on WhatsApp", true);
    if (config.email) add("Email", "mailto:" + config.email, config.email);

    var handle = String(config.instagram || "").trim().replace(/^@/, "");
    if (/^[A-Za-z0-9._]{1,30}$/.test(handle)) add("Instagram", "https://www.instagram.com/" + handle + "/", "@" + handle, true);
  }

  /* ------------------------------------------------------------------------
     Sections fade up gently the first time they scroll into view
     ------------------------------------------------------------------------ */
  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.visibilityState !== "visible") return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-hidden");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px" });

    var selector = [
      ".register-intro", ".form-card", ".section-head", ".journey-list li", ".journey-photo",
      ".seated-figure > img", ".seated-reflection", ".ig-carousel", ".ig-frame", ".ig-actions",
      ".about-card", ".gallery-item", ".batch-card", ".glance-card", ".about-cta > *", ".footer-top"
    ].join(",");

    document.querySelectorAll(selector).forEach(function (element) {
      element.classList.add("reveal", "reveal-hidden");
      observer.observe(element);
    });
  }

  // The Contact page's message form (js/contact.js) uses the same phone-number check
  window.NatyanjaliUtils = { normalisePhone: normalisePhone };

  /* ------------------------------------------------------------------------
     Links, announcement and the Call / WhatsApp line. All of them are set in js/config.js.
     ------------------------------------------------------------------------ */
  function safeUrl(value) {
    var url = String(value || "").trim();
    return /^https?:\/\//i.test(url) ? url : "";
  }

  function initLinks() {
    var admission = safeUrl(config.admissionUrl);
    var inquiry = safeUrl(config.inquiryUrl);
    var builtIn = document.getElementById("admission-builtin");
    var external = document.getElementById("admission-external");
    // With an admission link, the Register section is one button to that form, not our own form
    if (admission && builtIn && external) {
      builtIn.hidden = true;
      external.hidden = false;
      document.getElementById("admission-open").href = admission;
    }
    if (inquiry) {
      // On the Contact page, the message form becomes one button to the enquiry form
      var messageForm = document.getElementById("message-form");
      var enquiryBox = document.getElementById("enquiry-external");
      if (messageForm && enquiryBox) {
        messageForm.hidden = true;
        var doneBox = document.getElementById("message-done");
        if (doneBox) doneBox.hidden = true;
        enquiryBox.hidden = false;
        document.getElementById("enquiry-open").href = inquiry;
        document.getElementById("message-title").textContent = "Ask us a question";
      }
      // Every "Ask a question" button goes straight to the enquiry form
      document.querySelectorAll("[data-inquiry]").forEach(function (link) {
        link.href = inquiry;
        link.target = "_blank";
        link.rel = "noopener";
      });
    }
  }

  function initReviews() {
    var section = document.getElementById("reviews");
    if (!section) return;
    var url = safeUrl(config.googleReviewsUrl);
    var items = Array.isArray(config.testimonials) ? config.testimonials.filter(function (t) { return t && t.quote; }) : [];
    if (!url && !items.length) return;
    section.hidden = false;

    var card = section.querySelector(".rating-card");
    var rating = Number(config.googleRating);
    var count = Number(config.googleReviewCount);
    if (url && rating > 0) {
      document.getElementById("rating-number").textContent = rating.toFixed(1);
      document.getElementById("rating-text").textContent = "Rated on Google" + (count > 0 ? " by " + count + " people" : "");
      document.getElementById("reviews-link").href = url;
    } else if (url) {
      document.getElementById("rating-number").parentNode.hidden = true;
      document.getElementById("rating-text").hidden = true;
      document.getElementById("reviews-link").href = url;
    } else {
      card.hidden = true;
    }

    var grid = document.getElementById("testimonial-grid");
    items.forEach(function (t) {
      var figure = document.createElement("figure");
      figure.className = "card testimonial";
      var quote = document.createElement("blockquote");
      quote.textContent = String(t.quote);
      var who = document.createElement("figcaption");
      who.textContent = [t.name, t.detail].filter(Boolean).join(" · ");
      figure.appendChild(quote);
      figure.appendChild(who);
      grid.appendChild(figure);
    });
  }

  function initAnnouncement() {
    var text = String(config.announcement || "").trim();
    var page = document.querySelector(".page");
    if (!text || !page) return;
    var bar = document.createElement("div");
    var line = document.createElement("p");
    bar.className = "announcement";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Announcement");
    line.appendChild(document.createTextNode(text));
    var target = String(config.announcementLink || "").trim();
    if (/^(https?:\/\/|[a-z0-9_-]+\.html|#)/i.test(target)) {
      var link = document.createElement("a");
      link.href = target;
      link.textContent = config.announcementLinkText || "Find out more";
      line.appendChild(document.createTextNode(" "));
      line.appendChild(link);
    }
    bar.appendChild(line);
    page.insertBefore(bar, page.firstChild);
  }

  function initHeroContact() {
    var box = document.getElementById("hero-contact");
    if (!box) return;
    var phone = String(config.phone || "").replace(/\s/g, "");
    var number = String(config.whatsapp || "").replace(/\D/g, "");
    var call = document.getElementById("hero-call");
    var chat = document.getElementById("hero-whatsapp");
    if (phone) {
      call.href = "tel:" + phone;
      call.hidden = false;
    }
    if (number) {
      chat.href = "https://wa.me/" + number + "?text=" + encodeURIComponent("Hello, I'd like to know about the classes at Natyanjali Nṛtta Kalakshetra.");
      chat.hidden = false;
    }
    document.getElementById("hero-or").hidden = !(phone && number);
    box.hidden = !(phone || number);
  }

  buildRosette();
  initLinks();
  initAnnouncement();
  initHeroContact();
  initReviews();
  initContactList();
  if (form) {
    initForm();
    updateGuardian();
  }
  initInstagram();
  initFooter();
  initReveal();
})();
