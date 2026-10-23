const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-toggle]");
const menu = document.querySelector("[data-menu]");
const year = document.querySelector("[data-year]");
const form = document.querySelector("[data-form]");
const success = document.querySelector("[data-success]");
const hero = document.querySelector("[data-hero]");
const heroX = document.querySelector("[data-hero-scene]");
const stage = document.querySelector("[data-stage]");
const scene = document.querySelector("[data-scene]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const setNavState = () => {
  nav?.classList.toggle("is-scrolled", window.scrollY > 12);
  if (!hero || !nav) return;
  const heroVisible = hero.getBoundingClientRect().bottom > 140;
  nav.classList.toggle("is-hero", heroVisible);
};

setNavState();
window.addEventListener("scroll", setNavState, { passive: true });
window.addEventListener("resize", setNavState);

const setMenuOpen = (open) => {
  menu?.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  toggle?.setAttribute("aria-expanded", String(open));
  toggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

toggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  setMenuOpen(!menu?.classList.contains("is-open"));
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("click", (event) => {
  if (!menu?.classList.contains("is-open")) return;
  if (nav?.contains(event.target)) return;
  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

if (heroX && !reduceMotion) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let ticking = false;

  const render = () => {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    heroX.style.transform = `rotateX(${10 - currentY * 0.06}deg) rotateY(${-14 + currentX * 0.1}deg) rotate(-6deg) translate3d(${currentX * 0.4}px, ${currentY * 0.4}px, 0)`;
    ticking = false;
  };

  window.addEventListener(
    "mousemove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 56;
      const y = (event.clientY / window.innerHeight - 0.5) * 40;
      targetX = x;
      targetY = y;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    },
    { passive: true }
  );
}

if (stage && scene && !reduceMotion) {
  stage.addEventListener("mousemove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    scene.style.transform = `rotateX(${20 - y * 16}deg) rotateY(${-32 + x * 20}deg)`;
  });

  stage.addEventListener("mouseleave", () => {
    scene.style.transform = "rotateX(20deg) rotateY(-32deg)";
  });
}

if (!reduceMotion) {
  document.querySelectorAll("[data-magnetic]").forEach((button) => {
    const reset = () => {
      button.style.transform = "";
    };

    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      button.style.transform = `translate(${x * 0.28}px, ${y * 0.38}px)`;
    });

    button.addEventListener("mouseleave", reset);
    button.addEventListener("blur", reset);
  });
}

const revealItems = document.querySelectorAll("[data-reveal]");
const revealSections = document.querySelectorAll("section, .footer");

const resetReveals = (items) => {
  items.forEach((item) => {
    item.classList.add("is-reset");
    item.classList.remove("is-in");
  });
};

const playReveals = (section, items) => {
  items.forEach((item) => item.classList.remove("is-reset"));
  void section.offsetWidth;
  items.forEach((item) => item.classList.add("is-in"));
};

if (revealItems.length && "IntersectionObserver" in window && !reduceMotion) {
  revealSections.forEach((section) => {
    const items = section.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) playReveals(section, items);
          else resetReveals(items);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealObserver.observe(section);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-in"));
}

const counters = document.querySelectorAll("[data-count]");
const statsSection = document.querySelector("#scale");
let countToken = 0;

const animateCount = (el, token) => {
  const target = Number(el.dataset.count || 0);
  const duration = 1100;
  const start = performance.now();

  const tick = (now) => {
    if (token !== countToken) return;
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const runCounts = () => {
  const token = ++countToken;
  counters.forEach((el) => {
    el.textContent = "0";
    animateCount(el, token);
  });
};

const resetCounts = () => {
  countToken += 1;
  counters.forEach((el) => {
    el.textContent = "0";
  });
};

if (statsSection && counters.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) runCounts();
        else resetCounts();
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(statsSection);
} else {
  counters.forEach((stat) => {
    stat.textContent = stat.dataset.count || "0";
  });
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  form.reset();
  if (success) {
    success.hidden = false;
  }
});
