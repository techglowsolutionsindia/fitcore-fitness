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
   CONTACT FORM VALIDATION + EMAIL SUBMISSION
================================================== */

const contactForm = document.getElementById("contactForm");
const contactSuccessMessage = document.getElementById("contactSuccessMessage");

if (contactForm && contactSuccessMessage) {
  const contactSubmitButton = contactForm.querySelector('[type="submit"]');

  let successTimer;
  let isSubmitting = false;

  /* Contact Form Submission Started */
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    clearTimeout(successTimer);
    contactSuccessMessage.classList.remove("show");

    const formData = new FormData(contactForm);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    if (Object.values(payload).some((value) => !value)) {
      alert("Please complete all required fields.");
      return;
    }

    isSubmitting = true;

    if (contactSubmitButton) {
      contactSubmitButton.disabled = true;
      contactSubmitButton.textContent = "SENDING...";
    }

    try {
      const response = await fetch(
        "https://fitcore-fitness-api.onrender.com/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (
        response.ok &&
        result.ownerEmailAccepted === true &&
        result.customerEmailAccepted === true
      ) {
        contactSuccessMessage.textContent =
          "Your message was submitted successfully. Thank you for contacting FitCore Fitness!";

        contactSuccessMessage.classList.add("show");
        contactForm.reset();

        successTimer = setTimeout(() => {
          contactSuccessMessage.classList.remove("show");
        }, 5000);
      } else {
        alert(
          result.message ||
            "We could not complete your enquiry. Please contact FitCore Fitness directly.",
        );
      }
    } catch (error) {
      console.error("FitCore Fitness contact form error:", error);

      alert(
        "Unable to connect to the enquiry service. Please try again later.",
      );
    } finally {
      isSubmitting = false;

      if (contactSubmitButton) {
        contactSubmitButton.disabled = false;
        contactSubmitButton.textContent = "SEND MESSAGE";
      }
    }
  });
  /* Contact Form Submission Ended */
}
