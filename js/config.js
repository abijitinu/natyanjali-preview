/* ==========================================================================
   Site settings. This is the only file you need to edit to go live.
   Leave a value as "" if you don't have it. That item simply won't show.
   ========================================================================== */

window.NATYANJALI = {
  // Instagram username, without the @. The account must be public.
  instagram: "natyanjali_nrtta_kalakshethra",

  // The JSON feed link from Behold, for the moving photo strip. README.md explains
  // how to get it. Without it, the site shows Instagram's fixed grid of posts instead.
  instagramFeed: "",

  // The Google Apps Script web app URL that saves registrations to your
  // Google Sheet. README.md explains how to get it.
  registrationUrl: "",

  // WhatsApp number with country code and no spaces, like "919XXXXXXXXX".
  whatsapp: "",

  // Phone and email show on the Contact page and in the footer.
  // WhatsApp above also shows on the Contact page. The address is footer only.
  phone: "",
  email: "",
  address: "Kakkanad, Chalakudy and Potta, Kerala",

  // The three class locations on the Contact page, one card with a map each.
  //   address: shown on the card.
  //   map:     what the map is centred on. Use exact coordinates for a precise pin, like
  //            "10.0159,76.3419" (in Google Maps, right-click the spot and tap the numbers to copy
  //            them), or a place name that Google Maps can find.
  // These are PLACEHOLDERS: well-known spots near each place, so the cards have something to show.
  // Replace them with the real address and map point of each class before the site goes live.
  locations: [
    { name: "Kakkanad", address: "Near Civil Station, Kakkanad, Kochi, Kerala", map: "Civil Station, Kakkanad, Kochi, Kerala" },
    { name: "Chalakudy", address: "Near the railway station, Chalakudy, Thrissur, Kerala", map: "Chalakudy Railway Station, Kerala" },
    { name: "Potta", address: "Potta, Chalakudy, Thrissur, Kerala", map: "Potta, Thrissur, Kerala" }
  ],

  // The quiet background music (audio/tambura.mp3). It plays by default, and visitors can stop
  // it with the round button in the corner. Set music to false to remove it and the button.
  music: true,

  // How loud the music is, from 0 (silent) to 1 (the recording at full volume). 0.12 is very quiet.
  musicVolume: 0.12
};
