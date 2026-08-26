/* ==================================================
   FITCORE FITNESS - GLOBAL JAVASCRIPT
================================================== */

"use strict";

/* ==================================================
   STICKY HEADER
================================================== */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", () => {
  if (window.scrollY > 30) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

/* ==================================================
   MOBILE NAVIGATION
================================================== */

const menuToggle = document.querySelector("[data-menu-toggle]");
const navbar = document.querySelector("[data-navbar]");

if (menuToggle && navbar) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("open");

    document.body.classList.toggle("menu-open", isOpen);

    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navbar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("open");
      document.body.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ==================================================
   FAQ ACCORDION
================================================== */

const accordionTriggers = document.querySelectorAll(".accordion-trigger");

accordionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".accordion-item");
    const content = item.querySelector(".accordion-content");
    const icon = trigger.querySelector(".accordion-icon");

    const isOpen = trigger.getAttribute("aria-expanded") === "true";

    accordionTriggers.forEach((otherTrigger) => {
      const otherItem = otherTrigger.closest(".accordion-item");

      const otherContent = otherItem.querySelector(".accordion-content");

      const otherIcon = otherTrigger.querySelector(".accordion-icon");

      otherTrigger.setAttribute("aria-expanded", "false");
      otherContent.style.maxHeight = null;

      if (otherIcon) {
        otherIcon.textContent = "+";
      }
    });

    if (!isOpen) {
      trigger.setAttribute("aria-expanded", "true");
      content.style.maxHeight = content.scrollHeight + "px";

      if (icon) {
        icon.textContent = "−";
      }
    }
  });
});

/* ==================================================
   HOME PAGE SECTION SCROLL SPY
================================================== */

const navLinks = document.querySelectorAll('.navbar-link[href^="#"]');

const sections = [];

navLinks.forEach((link) => {
  const target = document.querySelector(link.getAttribute("href"));

  if (target) {
    sections.push({
      section: target,
      link: link,
    });
  }
});

window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY + window.innerHeight * 0.35;

  let currentLink = null;

  sections.forEach((item) => {
    if (scrollPosition >= item.section.offsetTop) {
      currentLink = item.link;
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
  });

  if (currentLink) {
    currentLink.classList.add("active");
  }
});

/* ==================================================
   MEMBERSHIP PLAN MODAL
================================================== */

const planModal = document.querySelector("#plan-modal");
const planModalButtons = document.querySelectorAll(".plan-modal-btn");
const planModalCloseButtons = document.querySelectorAll(
  "[data-plan-modal-close]",
);

const planModalTitle = document.querySelector("#plan-modal-title");
const planModalPrice = document.querySelector("#plan-modal-price");
const planModalText = document.querySelector("#plan-modal-text");
const planModalFeatures = document.querySelector("#plan-modal-features");
const planModalContact = document.querySelector("#plan-modal-contact");

const membershipPlans = {
  basic: {
    title: "Basic Plan",
    price: "₹999",
    text: "A simple and affordable plan for members who want regular gym access and essential workout facilities.",
    features: [
      "Full gym floor access",
      "Standard strength and cardio equipment",
      "Locker room access",
      "2 group classes per week",
      "General workout assistance",
      "Access during regular gym hours",
    ],
  },

  standard: {
    title: "Standard Plan",
    price: "₹1,799",
    text: "A balanced membership for members who want greater training support, full equipment access and unlimited classes.",
    features: [
      "Full gym floor access",
      "Complete equipment access",
      "Personal training sessions",
      "Unlimited group classes",
      "Training guidance",
      "Workout progress support",
      "Locker and changing room access",
    ],
  },

  premium: {
    title: "Premium Plan",
    price: "₹2,699",
    text: "Our most complete membership for members who want focused coaching, transformation support and priority assistance.",
    features: [
      "Full gym floor access",
      "Complete equipment access",
      "Personal training sessions",
      "Body transformation guidance",
      "Priority trainer support",
      "Workout progress reviews",
      "Unlimited group classes",
      "Locker and changing room access",
    ],
  },
};

function openPlanModal(planKey) {
  const plan = membershipPlans[planKey];

  if (!plan || !planModal) return;

  planModalTitle.textContent = plan.title;

  planModalPrice.innerHTML = `
    ${plan.price} <span>/ Month</span>
  `;

  planModalText.textContent = plan.text;

  planModalFeatures.innerHTML = "";

  plan.features.forEach((feature) => {
    const listItem = document.createElement("li");
    listItem.textContent = feature;
    planModalFeatures.appendChild(listItem);
  });

  planModal.classList.add("active");
  planModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closePlanModal() {
  if (!planModal) return;

  planModal.classList.remove("active");
  planModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

planModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openPlanModal(button.dataset.plan);
  });
});

planModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closePlanModal);
});

if (planModalContact) {
  planModalContact.addEventListener("click", closePlanModal);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePlanModal();
  }
});
