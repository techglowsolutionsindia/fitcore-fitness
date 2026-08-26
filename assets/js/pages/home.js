/* ==================================================
   FITCORE FITNESS - HOME PAGE JAVASCRIPT
================================================== */

"use strict";

/* ==================================================
   MEMBER TESTIMONIALS SLIDER
================================================== */

const testimonialsSlider = document.querySelector("[data-testimonials-slider]");

if (testimonialsSlider) {
  const track = testimonialsSlider.querySelector("[data-testimonials-track]");

  const cards = Array.from(track.querySelectorAll(".testimonial-card"));

  const prevButton = testimonialsSlider.querySelector(
    "[data-testimonial-prev]",
  );

  const nextButton = testimonialsSlider.querySelector(
    "[data-testimonial-next]",
  );

  const dotsContainer = document.querySelector("[data-testimonial-dots]");

  let currentIndex = 0;

  /* ==================================================
     GET VISIBLE TESTIMONIAL COUNT
  ================================================== */

  const getVisibleCards = () => {
    if (window.innerWidth <= 650) {
      return 1;
    }

    if (window.innerWidth <= 991) {
      return 2;
    }

    return 3;
  };

  /* ==================================================
     CREATE TESTIMONIAL DOTS
  ================================================== */

  const createDots = () => {
    dotsContainer.innerHTML = "";

    const visibleCards = getVisibleCards();

    const totalPages = Math.ceil(cards.length / visibleCards);

    for (let index = 0; index < totalPages; index++) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "testimonial-dot";

      dot.setAttribute("aria-label", `Show testimonial group ${index + 1}`);

      dot.addEventListener("click", () => {
        currentIndex = index * visibleCards;

        updateSlider();
      });

      dotsContainer.appendChild(dot);
    }
  };

  /* ==================================================
   UPDATE TESTIMONIAL SLIDER
================================================== */

  const updateSlider = () => {
    const visibleCards = getVisibleCards();

    const maxIndex = Math.max(0, cards.length - visibleCards);

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    const firstCard = cards[0];

    const trackStyles = window.getComputedStyle(track);

    const gap = parseFloat(trackStyles.gap) || 0;

    const cardWidth = firstCard.getBoundingClientRect().width;

    const moveAmount = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${moveAmount}px)`;

    /* ==================================================
     UPDATE TESTIMONIAL DOTS
  ================================================== */

    const dots = dotsContainer.querySelectorAll(".testimonial-dot");

    const totalPages = dots.length;

    const activePage =
      currentIndex === maxIndex
        ? totalPages - 1
        : Math.floor(currentIndex / visibleCards);

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activePage);
    });

    /* ==================================================
     DISABLE TESTIMONIAL END ARROWS
  ================================================== */

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === maxIndex;
  };

  /* ==================================================
     PREVIOUS TESTIMONIALS
  ================================================== */

  prevButton.addEventListener("click", () => {
    const visibleCards = getVisibleCards();

    currentIndex = Math.max(0, currentIndex - visibleCards);

    updateSlider();
  });

  /* ==================================================
     NEXT TESTIMONIALS
  ================================================== */

  nextButton.addEventListener("click", () => {
    const visibleCards = getVisibleCards();

    const maxIndex = Math.max(0, cards.length - visibleCards);

    currentIndex = Math.min(maxIndex, currentIndex + visibleCards);

    updateSlider();
  });

  /* ==================================================
     TESTIMONIALS RESIZE
  ================================================== */

  window.addEventListener("resize", () => {
    currentIndex = 0;

    createDots();
    updateSlider();
  });

  /* ==================================================
     INITIALIZE TESTIMONIALS
  ================================================== */

  createDots();
  updateSlider();
}

/* ==================================================
   CONTACT FORM VALIDATION + SUCCESS MESSAGE
================================================== */

const contactForm = document.getElementById("contactForm");
const contactSuccessMessage = document.getElementById("contactSuccessMessage");

if (contactForm && contactSuccessMessage) {
  let successTimer;

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    /* STOP IF ANY REQUIRED FIELD IS INVALID */
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    /* REMOVE ANY PREVIOUS TIMER */
    clearTimeout(successTimer);

    /* ==================================================
   DELAY SUCCESS MESSAGE TO SIMULATE FORM PROCESSING
================================================== */

    setTimeout(() => {
      /* SHOW SUCCESS MESSAGE AFTER 1.5 SECONDS */
      contactSuccessMessage.classList.add("show");

      /* CLEAR ALL FORM FIELDS */
      contactForm.reset();

      /* HIDE SUCCESS MESSAGE AFTER 5 SECONDS */
      successTimer = setTimeout(() => {
        contactSuccessMessage.classList.remove("show");
      }, 3000);
    }, 1500);
  });
}
