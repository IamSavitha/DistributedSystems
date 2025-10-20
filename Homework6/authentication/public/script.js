// Smooth scroll
document.querySelectorAll('a[data-scroll]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // If the navbar is open (mobile), close it after clicking a link:
      const navCollapse = document.getElementById('navMain');
      if (navCollapse?.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse);
        bsCollapse.hide();
      }
    });
  });
  
  // Active section highlight
  const sections = document.querySelectorAll('[data-section]');
  const navLinks = [...document.querySelectorAll('a[data-scroll]')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === id);
        });
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(sec => observer.observe(sec));
  
  // Toggle Programs list
  const toggleBtn = document.getElementById('togglePrograms');
  const programList = document.getElementById('programList');
  if (toggleBtn && programList) {
    toggleBtn.addEventListener('click', () => {
      const hidden = programList.classList.toggle('hidden');
      toggleBtn.textContent = hidden ? 'Show' : 'Hide';
      toggleBtn.setAttribute('aria-expanded', String(!hidden));
    });
  }
  
  // Form validation (native) + friendly message
  const form = document.getElementById('feedbackForm');
  const formMsg = document.getElementById('formMsg');
  if (form) {
    form.addEventListener('submit', e => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        formMsg.textContent = 'Please fill out all fields correctly.';
        formMsg.className = 'error';
        // Optional: show Bootstrap validation styling
        form.classList.add('was-validated');
        return;
      }
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      form.reset();
      form.classList.remove('was-validated');
  
      formMsg.textContent = `Thanks, ${data.name}! We received your message.`;
      formMsg.className = 'success';
    });
  }
  
  // Back-to-top button
  const toTop = document.getElementById('backToTop');
  const revealTopBtn = () => {
    if (!toTop) return;
    const scrolled = window.scrollY > 400;
    toTop.classList.toggle('show', scrolled);
  };
  if (toTop) {
    window.addEventListener('scroll', revealTopBtn, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    revealTopBtn();
  }
  