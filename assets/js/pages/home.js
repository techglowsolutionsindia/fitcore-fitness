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

  /* Contact Phone Number Validation Started */
  const phoneInput = contactForm.querySelector("#phone");
  const phonePrefix = "+91 ";

  if (phoneInput) {
    phoneInput.value = phonePrefix;

    phoneInput.addEventListener("focus", () => {
      if (!phoneInput.value.trim()) {
        phoneInput.value = phonePrefix;
      }

      if (phoneInput.value === phonePrefix) {
        phoneInput.setSelectionRange(phonePrefix.length, phonePrefix.length);
      }
    });

    phoneInput.addEventListener("input", () => {
      const value = phoneInput.value;

      if (!value || value === "+91") {
        phoneInput.value = phonePrefix;
        return;
      }

      if (value.startsWith(phonePrefix)) {
        const digits = value.slice(phonePrefix.length).replace(/\D/g, "");

        phoneInput.value = phonePrefix + digits.slice(0, 10);
        return;
      }

      if (value.startsWith("+")) {
        phoneInput.value = value.replace(/[^\d+ ]/g, "");
        return;
      }

      const digits = value.replace(/\D/g, "");
      phoneInput.value = phonePrefix + digits.slice(0, 10);
    });

    phoneInput.addEventListener("blur", () => {
      if (!phoneInput.value.trim()) {
        phoneInput.value = phonePrefix;
      }
    });
  }
  /* Contact Phone Number Validation Ended */

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

    const phoneMatch = payload.phone.match(/^\+([1-9]\d{0,2}) (\d{4,14})$/);

    const isValidPhone =
      phoneMatch &&
      (phoneMatch[1] === "91"
        ? /^[6-9]\d{9}$/.test(phoneMatch[2])
        : phoneMatch[1].length + phoneMatch[2].length <= 15);

    if (!isValidPhone) {
      alert(
        "Please enter a valid phone number with country code and a space, for example +91 9876543210.",
      );
      phoneInput?.focus();
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

        if (phoneInput) {
          phoneInput.value = phonePrefix;
        }

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
