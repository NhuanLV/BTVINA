const body = document.body;
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const menu = document.querySelector("[data-menu]");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll("[data-category]");
const revealItems = document.querySelectorAll(".reveal");
const counterItems = document.querySelectorAll("[data-counter-target]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageLocale = document.documentElement.lang || "vi-VN";

body.classList.add("js-enabled");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const closeMenu = () => {
  if (!navToggle || !menu) return;
  const openLabel = navToggle.dataset.labelOpen || "Mở menu";
  menu.classList.remove("is-open");
  navToggle.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", openLabel);
  body.classList.remove("nav-open");
};

const openMenu = () => {
  if (!navToggle || !menu) return;
  const closeLabel = navToggle.dataset.labelClose || "Đóng menu";
  menu.classList.add("is-open");
  navToggle.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", closeLabel);
  body.classList.add("nav-open");
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (navToggle && menu) {
  navToggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const clickInsideMenu = menu.contains(event.target);
    const clickToggle = navToggle.contains(event.target);
    if (!clickInsideMenu && !clickToggle && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeMenu();
  });
}

filterButtons.forEach((button) => {
  button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");

  button.addEventListener("click", () => {
    const selected = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });

    projectCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const shouldHide = selected !== "all" && !categories.includes(selected);
      card.classList.toggle("is-hidden", shouldHide);
    });
  });
});

const setCounterValue = (item, value) => {
  const target = Number(item.dataset.counterTarget || 0);
  const isYear = target >= 1900 && target <= 2100;
  item.textContent = isYear ? String(value) : new Intl.NumberFormat(pageLocale).format(value);
};

const animateCounter = (item) => {
  const target = Number(item.dataset.counterTarget || 0);
  if (!target || item.dataset.counted === "true") return;

  item.dataset.counted = "true";

  if (reduceMotion) {
    setCounterValue(item, target);
    return;
  }

  const duration = target > 500 ? 1300 : 950;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    setCounterValue(item, Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      setCounterValue(item, target);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -30px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.55 }
  );

  counterItems.forEach((item) => counterObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counterItems.forEach(animateCounter);
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      formStatus.textContent =
        contactForm.dataset.messageInvalid || "Vui lòng điền đầy đủ thông tin bắt buộc trước khi gửi.";
      contactForm.reportValidity();
      return;
    }

    formStatus.textContent =
      contactForm.dataset.messageSuccess || "Cảm ơn quý khách. B&T sẽ liên hệ lại trong thời gian sớm nhất.";
    contactForm.reset();
  });
}
