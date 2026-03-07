// Po załadowaniu całej zawartości DOM, wykonaj skrypt
document.addEventListener("DOMContentLoaded", () => {
  // Pobierz wszystkie sekcje na stronie
  const sections = document.querySelectorAll(".section");
  // Pobierz wszystkie linki w menu bocznym
  const menuLinks = document.querySelectorAll(".side-menu a");
  // Pobierz element menu bocznego
  const sideMenu = document.querySelector(".side-menu");
  // Pobierz główny kontener (zakładając, że to on obsługuje scrollowanie)
  const mainContainer = document.querySelector('main');
  const root = document.documentElement;
  const SUN_MIN = 50;
  const SUN_MAX = 90;
  const SUN_START = { r: 255, g: 204, b: 0 };
  const SUN_END = { r: 255, g: 167, b: 6 };

  /**
   * Funkcja do animacji tekstu.
   * Powoduje zanikanie i przesuwanie tekstu w górę, a następnie pojawianie się go z efektem.
   * @param {HTMLElement} element - Element HTML do animowania.
   */
  function animateText(element) {
    element.style.opacity = '0'; // Ustaw początkową przezroczystość na 0
    element.style.transform = 'translateY(-20px)'; // Przesuń element 20px w górę
    element.style.transition = 'opacity 0.3s ease, transform 0.3s ease'; // Dodaj płynne przejście
  
    // Wymuszamy reflow, aby przeglądarka zarejestrowała zmiany stylów przed animacją
    void element.offsetHeight;
  
    // Animujemy cały tekst po następnej klatce animacji
    requestAnimationFrame(() => {
      element.style.opacity = '1'; // Ustaw przezroczystość na 1 (widoczny)
      element.style.transform = 'translateY(0)'; // Przywróć element do pierwotnej pozycji
    });
  }
  
  /**
   * Zwraca aktualną pozycję scrolla głównego kontenera lub okna.
   * @returns {number} Aktualna pozycja scrolla.
   */
  function getScrollPosition() {
    return mainContainer ? mainContainer.scrollTop : window.scrollY;
  }

  function updateSunScale() {
    const maxScroll = mainContainer
      ? (mainContainer.scrollHeight - mainContainer.clientHeight)
      : (document.documentElement.scrollHeight - window.innerHeight);

    const progress = maxScroll > 0
      ? Math.min(Math.max(getScrollPosition() / maxScroll, 0), 1)
      : 0;

    const sunSize = SUN_MIN + (SUN_MAX - SUN_MIN) * progress;
    const sunR = Math.round(SUN_START.r + (SUN_END.r - SUN_START.r) * progress);
    const sunG = Math.round(SUN_START.g + (SUN_END.g - SUN_START.g) * progress);
    const sunB = Math.round(SUN_START.b + (SUN_END.b - SUN_START.b) * progress);
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const sunTintAlpha = isMobile
      ? (0.03 + (0.15 * progress))
      : (0.08 + (0.42 * progress));
    const sunTintAlphaMid = sunTintAlpha * 0.55;
    const sunTintAlphaLow = sunTintAlpha * 0.18;
    const viewportMin = Math.min(window.innerWidth, window.innerHeight);
    const sunGlowSize = (sunSize / 100) * viewportMin;

    root.style.setProperty('--sun-size', `${sunSize.toFixed(2)}%`);
    root.style.setProperty('--sun-r', `${sunR}`);
    root.style.setProperty('--sun-g', `${sunG}`);
    root.style.setProperty('--sun-b', `${sunB}`);
    root.style.setProperty('--sun-tint-alpha', `${sunTintAlpha.toFixed(3)}`);
    root.style.setProperty('--sun-tint-alpha-mid', `${sunTintAlphaMid.toFixed(3)}`);
    root.style.setProperty('--sun-tint-alpha-low', `${sunTintAlphaLow.toFixed(3)}`);
    root.style.setProperty('--sun-glow-size', `${sunGlowSize.toFixed(1)}px`);
  }


  // Zmienna do przechowywania ostatnio aktywnej sekcji
  let lastActiveSection = null;

  /**
   * Funkcja aktualizująca aktywną sekcję na podstawie pozycji scrolla.
   * Odpowiada za podświetlanie linków w menu, animowanie tekstu w sekcjach
   * i zmianę koloru menu bocznego.
   */
  function updateActiveSection() {
    const currentPos = getScrollPosition(); // Pobierz aktualną pozycję scrolla
    let activeSection = null; // Zmienna do przechowywania aktualnie aktywnej sekcji

    // Iteruj przez wszystkie sekcje, aby znaleźć aktywną
    sections.forEach(section => {
      const rect = section.getBoundingClientRect(); // Pobierz rozmiar i pozycję sekcji
      // Oblicz górną pozycję sekcji względem początku głównego kontenera
      const sectionTop = rect.top + mainContainer.scrollTop - mainContainer.offsetTop;

      // Sprawdź, czy aktualna pozycja scrolla jest blisko górnej pozycji sekcji
      if (Math.abs(currentPos - sectionTop) < 100) {
        activeSection = section; // Ustaw sekcję jako aktywną
      }
    });

    // Jeśli znaleziono aktywną sekcję i różni się ona od ostatnio aktywnej
    if (activeSection && activeSection !== lastActiveSection) {
      // Animujemy teksty (h1, h2, h3, p) w nowej aktywnej sekcji
      const textElements = activeSection.querySelectorAll('h1, h2, h3, p');
      textElements.forEach(element => {
        animateText(element);
      });

      // Aktualizuj aktywny link w menu
      menuLinks.forEach(link => {
        link.classList.remove('active'); // Usuń klasę 'active' ze wszystkich linków
        // Jeśli href linku odpowiada id aktywnej sekcji, dodaj klasę 'active'
        if (link.getAttribute('href') === `#${activeSection.id}`) {
          link.classList.add('active');
        }
      });

      // Zdefiniuj mapowanie klas sekcji na klasy kolorów menu - opisane w styles.css
      const menuClasses = {
        'light': 'menu-light',
        'dark': 'menu-dark',
        'dark-blue': 'menu-dark-blue',  
      };

      // Usuń wszystkie klasy kolorów menu z menu bocznego
      Object.values(menuClasses).forEach(className => {
        sideMenu.classList.remove(className);
      });

      // Dodaj odpowiednią klasę koloru menu na podstawie klasy aktywnej sekcji
      for (const [sectionClass, menuClass] of Object.entries(menuClasses)) {
        if (activeSection.classList.contains(sectionClass)) {
          sideMenu.classList.add(menuClass);
          break; // Przestań szukać po znalezieniu dopasowania
        }
      }

      // Zapisz aktualną sekcję jako ostatnio aktywną
      lastActiveSection = activeSection;
    }
  }

  // Dodaj obsługę kliknięć dla linków w menu bocznym
  menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      // Obsługuj przewijanie tylko dla linków kotwiczących na tej samej stronie
      if (!href || !href.startsWith("#")) {
        return;
      }

      e.preventDefault();

      // Usuń klasę 'active' ze wszystkich linków menu
      menuLinks.forEach(menuLink => menuLink.classList.remove('active'));
      // Dodaj klasę 'active' do klikniętego linku
      link.classList.add('active');

      // Pobierz id sekcji docelowej z atrybutu href
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId); // Pobierz element sekcji docelowej

      // Jeśli sekcja docelowa istnieje, przewiń do niej płynnie
      if (targetSection) {
        mainContainer.scrollTo({
          top: targetSection.offsetTop,
          behavior: "smooth"
        });
      }
    });
  });

  // Dodajemy debounce (opóźnienie) dla lepszej wydajności scrollowania
  let scrollTimeout;
  mainContainer.addEventListener('scroll', () => {
    // Anuluj poprzednią animację, jeśli istnieje
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    // Zaplanuj aktualizacje na następną klatkę animacji
    scrollTimeout = requestAnimationFrame(() => {
      updateActiveSection();
      updateSunScale();
    });
  });

  // Wywołaj początkową aktualizację po załadowaniu strony
  updateActiveSection();
  updateSunScale();
  window.addEventListener('resize', updateSunScale);
});

// Drugi blok kodu wykonywany po załadowaniu DOM, obsługujący menu hamburgerowe
document.addEventListener("DOMContentLoaded", () => {
  // Pobierz element menu hamburgerowego
  const hamburger = document.querySelector(".hamburger-menu");
  // Pobierz element menu bocznego
  const sideMenu = document.querySelector(".side-menu");

  // Dodaj obsługę kliknięcia dla menu hamburgerowego
  hamburger.addEventListener("click", () => {
    // Przełącz klasę 'active' na menu bocznym (pokaż/ukryj)
    sideMenu.classList.toggle("active");
  });

  // Dodaj obsługę kliknięć dla linków w menu bocznym (dla zamknięcia menu po kliknięciu)
  document.querySelectorAll(".side-menu a").forEach(link => {
    link.addEventListener("click", () => {
      // Usuń klasę 'active' z menu bocznego (ukryj menu)
      sideMenu.classList.remove("active");
    });
  });
});
