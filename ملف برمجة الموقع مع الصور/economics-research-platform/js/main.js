// ============================================
// Main Application Module
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize modules
    Auth.init();

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    document.getElementById('mobileToggle').addEventListener('click', function() {
        document.getElementById('navLinks').classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            document.getElementById('navLinks').classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Animated counter for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = target.toLocaleString('ar-SA');
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current).toLocaleString('ar-SA');
            }
        }, 16);
    };

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    statNumbers.forEach(stat => observer.observe(stat));

    // Create particles
    createParticles();

    // Initialize admin section visibility
    if (Auth.isAdmin()) {
        document.getElementById('admin').style.display = 'block';
    }

    // Load saved settings
    const settings = Utils.storage.get('settings');
    if (settings) {
        document.getElementById('siteName').value = settings.siteName || 'منصة البحث العلمي';
        document.getElementById('adminEmail').value = settings.adminEmail || '';
        document.getElementById('maxReferences').value = settings.maxReferences || 100;
        document.getElementById('enableRegistration').checked = settings.enableRegistration !== false;
    }
});

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 2}px;
            height: ${Math.random() * 6 + 2}px;
            background: rgba(255,255,255,${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 10}s infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }
}

// Global function for saving activity (used by all modules)
function saveActivity(type) {
    const activities = Utils.storage.get('activities') || [];
    activities.push({ 
        type, 
        timestamp: new Date().toISOString(), 
        userId: Auth.currentUser ? Auth.currentUser.id : null 
    });
    Utils.storage.set('activities', activities);
}
