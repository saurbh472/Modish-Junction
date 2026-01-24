// Header and Footer Scripts

// ========== POPUP MODAL FUNCTIONS ==========
function openPopup(event, type) {
    event.preventDefault();
    event.stopPropagation();

    const modal = document.getElementById("popupModal");
    const title = document.getElementById("popupTitle");
    const text = document.getElementById("popupText");

    if (type === "shipping") {
        title.innerText = "Shipping Policy";
        text.innerText = "Orders are shipped within 3–5 business days.";
    } 
    else if (type === "returns") {
        title.innerText = "Return & Exchange Policy";
        text.innerText = "Returns accepted within 7 days (opening video required).";
    } 
    else if (type === "privacy") {
        title.innerText = "Privacy Policy";
        text.innerText = "Your personal information is never shared.";
    } 
    else if (type === "stores") {
        title.innerText = "Store Locator";
        text.innerText = "Currently online only. Stores coming soon.";
    } 
    else if (type === "about") {
        title.innerText = "About Us";
        text.innerText = "Modish Junction – Where Comfort Meets Fashion.";
    }

    const rect = event.target.getBoundingClientRect();

    modal.style.top = window.scrollY + rect.bottom + 10 + "px";
    modal.style.left = window.scrollX + rect.left + "px";

    modal.classList.add("active");
}

function closePopup() {
    document.getElementById("popupModal").classList.remove("active");
}

// Stop click inside popup
document.addEventListener('DOMContentLoaded', function() {
    const popupContent = document.querySelector(".popup-content");
    if (popupContent) {
        popupContent.addEventListener("click", function(e) {
            e.stopPropagation();
        });
    }
});

// Close when clicking outside
document.addEventListener("click", function() {
    closePopup();
});

// Close with ESC
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closePopup();
});

// ========== MOBILE MENU FUNCTIONS ==========
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
        mobileNav.classList.toggle("active");
    });

    // Close menu when clicking a link (except sale link)
    document.querySelectorAll(".mobile-nav a:not(#saleLinkMobile)").forEach(link => {
        link.addEventListener("click", () => {
            mobileNav.classList.remove("active");
        });
    });
}

// ========== MOBILE DROPDOWN TOGGLE ==========
document.querySelectorAll(".mobile-dropdown > span").forEach(span => {
    span.addEventListener("click", function (e) {
        e.stopPropagation();

        const submenu = this.nextElementSibling;

        // Close other open submenus
        document.querySelectorAll(".mobile-submenu").forEach(menu => {
            if (menu !== submenu) menu.classList.remove("open");
        });

        submenu.classList.toggle("open");
    });
});

// ========== MOBILE SALE LINK ==========
const saleLinkMobile = document.getElementById("saleLinkMobile");
if (saleLinkMobile) {
    saleLinkMobile.addEventListener("click", function (e) {
        e.preventDefault();

        // Trigger desktop sale logic
        const saleLink = document.getElementById("saleLink");
        if (saleLink) {
            saleLink.click();
        }

        // Close mobile menu after click
        if (mobileNav) {
            mobileNav.classList.remove("active");
        }
    });
}

// ========== HEADER SCROLL EFFECT ==========
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
            header.style.boxShadow = '0 5px 30px rgba(0,0,0,0.2)';
        } else {
            header.classList.remove('scrolled');
            header.style.boxShadow = '0 4px 30px rgba(212, 89, 59, 0.15)';
        }
    }
});