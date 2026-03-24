// ========================================
// COMPLETE WORKING ANIMATIONS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    console.log('Animations script loaded');
    
    // ========== 1. SCROLL REVEAL ANIMATION ==========
    const revealElements = document.querySelectorAll('.feature-card, .step-item, .section-header, .hero-content, .stat-item');
    
    function checkReveal() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 80) {
                element.classList.add('revealed');
            }
        });
    }
    
    // Set initial styles for reveal elements
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    // Add CSS for revealed class
    const style = document.createElement('style');
    style.textContent = `
        .feature-card.revealed,
        .step-item.revealed,
        .section-header.revealed,
        .hero-content.revealed,
        .stat-item.revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Check on scroll and load
    window.addEventListener('scroll', checkReveal);
    window.addEventListener('load', checkReveal);
    checkReveal();
    
    // ========== 2. NAVBAR SCROLL EFFECT ==========
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
    
    // ========== 3. CARD HOVER ANIMATIONS ==========
    const cards = document.querySelectorAll('.feature-card, .step-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // ========== 4. BUTTON RIPPLE EFFECT ==========
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.cssText = `
                position: absolute;
                top: ${y}px;
                left: ${x}px;
                width: 0px;
                height: 0px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: translate(-50%, -50%);
                animation: rippleEffect 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple keyframes
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes rippleEffect {
            0% {
                width: 0;
                height: 0;
                opacity: 0.5;
            }
            100% {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // ========== 5. STATS COUNTER ANIMATION ==========
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateStats() {
        statNumbers.forEach(stat => {
            const text = stat.innerText;
            const number = parseInt(text);
            
            if (!isNaN(number)) {
                let current = 0;
                const increment = number / 50;
                let animated = false;
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !animated) {
                            animated = true;
                            const interval = setInterval(() => {
                                current += increment;
                                if (current >= number) {
                                    stat.innerText = number + '+';
                                    clearInterval(interval);
                                } else {
                                    stat.innerText = Math.floor(current) + '+';
                                }
                            }, 30);
                            observer.unobserve(entry.target);
                        }
                    });
                });
                
                observer.observe(stat);
            }
        });
    }
    
    animateStats();
    
    // ========== 6. FLOATING ANIMATION FOR AVATARS ==========
    const avatars = document.querySelectorAll('.ai-avatar, .candidate-avatar');
    avatars.forEach(avatar => {
        avatar.style.animation = 'floatAvatar 4s ease-in-out infinite';
    });
    
    // Add float keyframes if not exists
    if (!document.querySelector('#floatKeyframes')) {
        const floatStyle = document.createElement('style');
        floatStyle.id = 'floatKeyframes';
        floatStyle.textContent = `
            @keyframes floatAvatar {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-12px);
                }
            }
        `;
        document.head.appendChild(floatStyle);
    }
    
    // ========== 7. PULSE RING ANIMATION ==========
    const pulseRings = document.querySelectorAll('.pulse-ring');
    pulseRings.forEach(ring => {
        ring.style.animation = 'pulseRing 2s ease-out infinite';
    });
    
    // Add pulse keyframes
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulseRing {
            0% {
                transform: scale(1);
                opacity: 0.6;
            }
            100% {
                transform: scale(1.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(pulseStyle);
    
    // ========== 8. GRADIENT TEXT ANIMATION ==========
    const gradientTexts = document.querySelectorAll('.gradient-text');
    gradientTexts.forEach(text => {
        text.style.animation = 'gradientShift 3s ease infinite';
    });
    
    // Add gradient keyframes
    const gradientStyle = document.createElement('style');
    gradientStyle.textContent = `
        @keyframes gradientShift {
            0%, 100% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
        }
    `;
    document.head.appendChild(gradientStyle);
    
    // ========== 9. MOBILE MENU ==========
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu && navLinks) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(overlay);
        
        function closeMenu() {
            navLinks.classList.remove('active');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            document.body.style.overflow = '';
        }
        
        function openMenu() {
            navLinks.classList.add('active');
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            document.body.style.overflow = 'hidden';
        }
        
        mobileMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        overlay.addEventListener('click', closeMenu);
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
    }
    
    // ========== 10. SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // ========== 11. BUBBLE POP ANIMATION FOR SPEECH BUBBLES ==========
    const speechBubbles = document.querySelectorAll('.speech-bubble, .response-bubble');
    speechBubbles.forEach(bubble => {
        bubble.style.animation = 'bubblePop 0.5s ease forwards';
    });
    
    // Add bubble keyframes
    const bubbleStyle = document.createElement('style');
    bubbleStyle.textContent = `
        @keyframes bubblePop {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(bubbleStyle);
    
    console.log('✅ All animations are active!');
    
    // Add a visible test indicator (remove in production)
    const testBadge = document.createElement('div');
    testBadge.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #14b8a6;
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 9999;
        font-family: monospace;
        opacity: 0.7;
        pointer-events: none;
    `;
    testBadge.innerHTML = '✨ Animations Active ✨';
    document.body.appendChild(testBadge);
    
    // Remove test badge after 3 seconds
    setTimeout(() => {
        testBadge.style.opacity = '0';
        setTimeout(() => testBadge.remove(), 1000);
    }, 3000);
});