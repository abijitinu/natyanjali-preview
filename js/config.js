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

  // The school's public phone number, as listed on its Google Maps page.
  phone: "+91 62826 45865",

  // Google reviews. The home page shows the rating and a button to read the reviews on Google.
  // Update the rating and count now and then. Leave googleReviewsUrl as "" to hide the section.
  googleReviewsUrl: "https://maps.app.goo.gl/mmk3zCq8bppAyDqNA",
  googleRating: "5.0",
  googleReviewCount: 80,

  // Testimonials shown on the home page under the rating. Add each one with the family's
  // permission, in the same wording they gave, like:
  //   { quote: "Words from the family.", name: "Parent of a student", detail: "Kakkanad" },
  testimonials: [],

  // The links to your admission form and your enquiry form (from your admissions app).
  //   admissionUrl: the Register section is one button that opens this form in a new tab, instead of the built-in form.
  //   inquiryUrl:   every "Ask a question" button, and the button on the Contact page, open this form in a new tab.
  //                 Without it, the Contact page has our own message form.
  admissionUrl: "https://tufee.codedbypatel.com/admission/7IOQ4S",
  inquiryUrl: "https://tufee.codedbypatel.com/enquiry/7IOQ4S",

  // One line at the very top of every page, for things like "Admissions are open for the new academic
  // year." Leave it as "" to show nothing. The link is optional, like "classes.html".
  announcement: "",
  announcementLink: "",
  announcementLinkText: "See the classes",

  // Phone and email show on the Contact page and in the footer.
  // WhatsApp above also shows on the Contact page. The address is footer only.
  email: "",
  address: "Kakkanad (Kochi) and Potta (Chalakudy), Kerala",

  // The places on the Contact page, one card each: two centres with a map, and Online.
  //   address: shown on the card.
  //   map:     what the map is centred on. A place name that Google Maps can find, or exact coordinates
  //            like "10.0159,76.3419" (in Google Maps, right-click the spot and tap the numbers to copy them).
  //   directions (optional): the link the Get directions button opens. Without it, Google Maps routes to `map`.
  //   online: true makes a card without a map, for the online classes.
  locations: [
    {
      name: "Kakkanad",
      address: "Natyanjali Nṛtta Kalakshetra, AKG Road, Vikasavani, Thengode P.O, Kochi",
      map: "Natyanjali Nrtta Kalakshetra, Vikasavani, AKG Rd, Thengod, Kochi 682030",
      directions: "https://maps.app.goo.gl/FAgqTr89zSoRQ1wdA",
      // Opening hours of the centre, as listed on Google Maps.
      hours: [
        ["Monday", "9 am – 8 pm"],
        ["Tuesday, Wednesday", "9 am – 6:30 pm"],
        ["Thursday, Friday", "9 am – 7:30 pm"],
        ["Saturday, Sunday", "9 am – 6:30 pm"]
      ]
    },
    {
      name: "Potta",
      address: "Natyanjali Nṛtta Kalakshetra, Near Dhanya Mission Hospital, Potta, Chalakudy",
      map: "Dhanya Mission Hospital, Potta, Chalakudy, Kerala"
    },
    {
      name: "Online",
      online: true,
      address: "Live classes over video for students in India and abroad. Timings are arranged by country and change with the season.",
      link: "classes.html#online",
      linkText: "See online batches"
    }
  ],

  // The quiet background music (audio/tambura.mp3). It plays by default, and visitors can stop
  // it with the round button in the corner. Set music to false to remove it and the button.
  music: true,

  // How loud the music is, from 0 (silent) to 1 (the recording at full volume). 0.12 is very quiet.
  musicVolume: 0.12
};
