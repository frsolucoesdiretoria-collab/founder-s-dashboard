document.addEventListener('DOMContentLoaded', function () {
    console.log('Axis Protocol v5-3-6 Initialized');

    /* ============================================
       CONNECTING DOTS (Particles.js)
       ============================================ */
    if (typeof Particles !== 'undefined') {
        Particles.init({
            selector: '#particles-js',
            maxParticles: 70,
            color: '#FFFFFF',
            connectParticles: true,
            speed: 0.5,
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        maxParticles: 40,
                        color: '#c7c7c7',
                        connectParticles: true
                    }
                }
            ]
        });
    }

    /* ============================================
       CLICK & GLOW EFFECT
       ============================================ */
    const glowContainer = document.getElementById('glow-container');

    document.addEventListener('click', function (e) {
        const glow = document.createElement('div');
        glow.className = 'glow-effect';
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';

        glowContainer.appendChild(glow);

        // Remove after animation
        setTimeout(() => {
            glow.remove();
        }, 1000);
    });

    /* ============================================
       CALCULATOR LOGIC
       ============================================ */
    const inputAvgValue = document.getElementById('calc-avg-value');
    const inputApptsDay = document.getElementById('calc-appts-day');
    const inputFailuresDay = document.getElementById('calc-failures-day');
    const inputDaysMonth = document.getElementById('calc-days-month');

    const resMonthlyLoss = document.getElementById('res-monthly-loss');
    const resAnnualLoss = document.getElementById('res-annual-loss');
    const resRecoverable = document.getElementById('res-recoverable');

    function calculate() {
        const avgValue = parseFloat(inputAvgValue.value) || 0;
        const apptsDay = parseFloat(inputApptsDay.value) || 0;
        const failuresDay = parseFloat(inputFailuresDay.value) || 0;
        const daysMonth = parseFloat(inputDaysMonth.value) || 0;

        const monthlyLoss = avgValue * failuresDay * daysMonth;
        const annualLoss = monthlyLoss * 12;
        // Assume Axis recovers 80% of losses
        const recoverable = monthlyLoss * 0.8;

        resMonthlyLoss.innerText = formatCurrency(monthlyLoss);
        resAnnualLoss.innerText = formatCurrency(annualLoss);
        resRecoverable.innerText = formatCurrency(recoverable);
    }

    function formatCurrency(value) {
        return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Add listeners
    [inputAvgValue, inputApptsDay, inputFailuresDay, inputDaysMonth].forEach(input => {
        if (input) {
            input.addEventListener('input', calculate);
        }
    });

    // Initial calculation
    calculate();

    /* ============================================
       SCROLL REVEAL (Simple)
       ============================================ */
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card-panel, .axis-section-title').forEach(el => {
        el.style.opacity = '0'; // Initial state for reveal
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });

    // CSS for reveal
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal-on-scroll {
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .reveal-on-scroll.animate__fadeInUp {
            opacity: 1 !important;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});
