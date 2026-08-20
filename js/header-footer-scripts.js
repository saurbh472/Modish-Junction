// ============================================
// MODISH JUNCTION - UNIVERSAL HEADER & FOOTER SCRIPTS
// File: js/header-footer-scripts.js
// ============================================

function isRootPage() {
  const p = window.location.pathname.replace(/\\/g, '/');
  return !p.includes('/western-wear/') && !p.includes('/Ethnic-wear/') && !p.includes('/Sale/');
}

function getBasePrefix() {
  return isRootPage() ? './' : '../';
}

// Load Header and Footer automatically with path normalization
function loadHeaderAndFooter() {
  const prefix = getBasePrefix();
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    fetch(`${prefix}includes/header.html`)
      .then(res => {
        if (!res.ok) throw new Error('Header not found at ' + prefix);
        return res.text();
      })
      .then(html => {
        let fixedHtml = html;
        if (!isRootPage()) {
          // Change ./ to ../ for subfolder pages
          fixedHtml = fixedHtml.replace(/(src|href)=["']\.\/([^"']+)["']/g, '$1="../$2"');
        } else {
          // Ensure ./ for root pages
          fixedHtml = fixedHtml.replace(/(src|href)=["']\.\.\/([^"']+)["']/g, '$1="./$2"');
        }
        headerPlaceholder.innerHTML = fixedHtml;
        initHeaderLogic();
        if (typeof updateCartCount === 'function') {
          updateCartCount();
        }
        if (typeof updateWishlistCount === 'function') {
          updateWishlistCount();
        }
      })
      .catch(err => console.error("Error loading header:", err));
  }

  if (footerPlaceholder) {
    fetch(`${prefix}includes/footer.html`)
      .then(res => {
        if (!res.ok) throw new Error('Footer not found at ' + prefix);
        return res.text();
      })
      .then(html => {
        let fixedHtml = html;
        if (!isRootPage()) {
          // Change ./ to ../ for subfolder pages
          fixedHtml = fixedHtml.replace(/(src|href)=["']\.\/([^"']+)["']/g, '$1="../$2"');
        } else {
          // Ensure ./ for root pages
          fixedHtml = fixedHtml.replace(/(src|href)=["']\.\.\/([^"']+)["']/g, '$1="./$2"');
        }
        footerPlaceholder.innerHTML = fixedHtml;
        if (typeof updateCartCount === 'function') {
          updateCartCount();
        }
      })
      .catch(err => console.error("Error loading footer:", err));
  }
}

function initHeaderLogic() {
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");

  if (menuBtn && mobileNav) {
    menuBtn.onclick = () => {
      mobileNav.classList.toggle("active");
    };

    document.querySelectorAll(".mobile-nav a").forEach(link => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("active");
      });
    });
  }

  document.querySelectorAll(".mobile-dropdown > span").forEach(span => {
    span.onclick = function (e) {
      e.stopPropagation();
      const submenu = this.nextElementSibling;
      document.querySelectorAll(".mobile-submenu").forEach(menu => {
        if (menu !== submenu) menu.classList.remove("open");
      });
      if (submenu) submenu.classList.toggle("open");
    };
  });
}

// ========== POPUP MODAL FUNCTIONS ==========
function openPopup(event, type) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const modal = document.getElementById("popupModal");
  const title = document.getElementById("popupTitle");
  const text = document.getElementById("popupText");

  if (!modal || !title || !text) return;

  if (type === "shipping") {
    title.innerText = "Shipping Policy";
    text.innerText = "Orders are shipped within 3–5 business days.";
  } else if (type === "returns") {
    title.innerText = "Return & Exchange Policy";
    text.innerText = "Returns accepted within 7 days (opening video required).";
  } else if (type === "privacy") {
    title.innerText = "Privacy Policy";
    text.innerText = "Your personal information is never shared.";
  } else if (type === "stores") {
    title.innerText = "Store Locator";
    text.innerText = "Currently online only. Stores coming soon.";
  } else if (type === "about") {
    title.innerText = "About Us";
    text.innerText = "Modish Junction – Where Comfort Meets Fashion.";
  }

  if (event && event.target) {
    const rect = event.target.getBoundingClientRect();
    modal.style.top = window.scrollY + rect.bottom + 10 + "px";
    modal.style.left = window.scrollX + rect.left + "px";
  }

  modal.classList.add("active");
}

function closePopup() {
  const modal = document.getElementById("popupModal");
  if (modal) modal.classList.remove("active");
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.classList && e.target.classList.contains("popup-modal")) {
    closePopup();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});

// Auto run loader on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadHeaderAndFooter);
} else {
  loadHeaderAndFooter();
}
