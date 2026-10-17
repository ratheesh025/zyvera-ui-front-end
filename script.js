
"use strict";

/* ========================================
   1. DOM ELEMENTS
======================================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");

const yearElement = document.getElementById("year");


/* ========================================
   2. COPYRIGHT YEAR
======================================== */

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* ========================================
   3. MOBILE NAVIGATION
======================================== */

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}


/* ========================================
   4. DARK MODE / LIGHT MODE
======================================== */

function applyTheme(theme) {
  const isLight = theme === "light";

  document.body.classList.toggle("light-mode", isLight);

  if (themeIcon) {
    themeIcon.textContent = isLight ? "☾" : "☀";
  }

  if (themeLabel) {
    themeLabel.textContent = isLight ? "Dark mode" : "Light mode";
  }

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode"
    );
  }

  document.documentElement.style.colorScheme = isLight
    ? "light"
    : "dark";
}

// Dark mode is the default.
let savedTheme = "dark";

try {
  const storedTheme = localStorage.getItem("zyvera-theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    savedTheme = storedTheme;
  }
} catch (error) {
  console.warn("Unable to read the saved theme preference.");
}

applyTheme(savedTheme);

// Change the theme when the button is clicked.
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light-mode")
      ? "dark"
      : "light";

    applyTheme(nextTheme);

    try {
      localStorage.setItem("zyvera-theme", nextTheme);
    } catch (error) {
      console.warn("Unable to save the theme preference.");
    }
  });
}


/* ========================================
   5. CLIENT CONTACT FORM
   Cloudflare Pages Functions + Resend
======================================== */

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const submitButton = contactForm.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
    }

    if (formStatus) {
      formStatus.textContent = "Sending your enquiry...";
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: new FormData(contactForm)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to send your enquiry."
        );
      }

      if (formStatus) {
        formStatus.textContent =
          "Thank you! Your enquiry has been submitted successfully.";
      }

      contactForm.reset();

    } catch (error) {
      console.error("Contact form submission failed:", error);

      if (formStatus) {
        formStatus.textContent =
          "Unable to submit your enquiry. Please try again later.";
      }

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}
