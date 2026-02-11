/* =========================================================
   GSAP 动画主逻辑 — GTA6 风格滚动驱动动画
   ========================================================= */

// NOTE: 等待 DOM 和 GSAP 都就绪后再初始化
document.addEventListener('DOMContentLoaded', () => {
    // 确保 GSAP 已加载
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ======================== 自定义光标 ========================
    initCursor();

    // ======================== 预加载 ========================
    initLoader();
});

/* ---------------------------------------------------------
   自定义光标
   --------------------------------------------------------- */
function initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');

    if (!cursor || !follower) return;

    // NOTE: 跳过移动端
    if (window.innerWidth <= 768) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 光标跟随动画 — 主光标紧跟，从光标带延迟
    function updateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        followerX += (mouseX - followerX) * 0.08;
        followerY += (mouseY - followerY) * 0.08;

        cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
        follower.style.transform = `translate(${followerX - 18}px, ${followerY - 18}px)`;

        requestAnimationFrame(updateCursor);
    }
    updateCursor();
}

/* ---------------------------------------------------------
   预加载画面
   --------------------------------------------------------- */
function initLoader() {
    const loader = document.getElementById('loader');
    const progressBar = document.querySelector('.loader-progress-bar');
    const heroImage = document.getElementById('hero-image');

    if (!loader) {
        initAnimations();
        return;
    }

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress > 100) progress = 100;
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        if (progress >= 100) {
            clearInterval(interval);
            // 确保图片已加载
            if (heroImage && heroImage.complete) {
                hideLoader();
            } else if (heroImage) {
                heroImage.addEventListener('load', hideLoader);
            } else {
                hideLoader();
            }
        }
    }, 120);

    function hideLoader() {
        gsap.to(loader, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                loader.style.display = 'none';
                initAnimations();
            }
        });
    }
}

/* ---------------------------------------------------------
   主动画初始化
   --------------------------------------------------------- */
function initAnimations() {
    heroEntrance();
    heroScrollAnimation();
    zoomRevealAnimation();
    storyAnimation();
    parallaxAnimation();
    endingAnimation();
}

/* =========================================================
   SECTION 1: HERO 入场动画
   ========================================================= */
function heroEntrance() {
    const tl = gsap.timeline({ delay: 0.2 });

    // 照片缓慢放大露出
    tl.to('#hero-image', {
        scale: 1.05,
        duration: 2,
        ease: 'power2.out',
    }, 0);

    // 标题逐字入场
    tl.to('.hero-title-line', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
    }, 0.5);

    // 上方标签
    tl.to('#hero-subtitle-top', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, 0.8);

    // 英文副标题
    tl.to('#hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, 1.0);

    // 日期
    tl.to('#hero-date', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
    }, 1.2);

    // 滚动提示
    tl.to('#scroll-indicator', {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
    }, 1.8);
}

/* =========================================================
   SECTION 1: HERO 滚动动画
   ========================================================= */
function heroScrollAnimation() {
    // 照片随滚动继续缩放，内容渐出
    gsap.to('#hero-image', {
        scale: 1.0,
        filter: 'brightness(0.4) saturate(0.8)',
        scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        }
    });

    // Hero 内容向上消失
    gsap.to('.hero-content', {
        y: -100,
        opacity: 0,
        scrollTrigger: {
            trigger: '#hero',
            start: '30% top',
            end: '80% top',
            scrub: 1,
        }
    });

    // 滚动提示渐出
    gsap.to('#scroll-indicator', {
        opacity: 0,
        scrollTrigger: {
            trigger: '#hero',
            start: '10% top',
            end: '30% top',
            scrub: 1,
        }
    });
}

/* =========================================================
   SECTION 2: 缩放揭示动画
   ========================================================= */
function zoomRevealAnimation() {
    // NOTE: 核心效果 — 照片从小圆圈放大到全屏，配合缩放
    const zoomTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#zoom-reveal',
            start: 'top top',
            end: '70% top',
            scrub: 1.5,
            pin: '#zoom-container',
            pinSpacing: false,
        }
    });

    // 圆形 clip-path 从 8% 扩展到 100%
    zoomTl.to('#zoom-image', {
        clipPath: 'circle(75% at 50% 50%)',
        scale: 1,
        duration: 1,
        ease: 'none',
    });

    // 文字信息渐入
    gsap.to('#zoom-text-1', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: {
            trigger: '#zoom-reveal',
            start: '50% top',
            end: '70% top',
            scrub: 1,
        }
    });
}

/* =========================================================
   SECTION 3: 文字故事逐行淡入
   ========================================================= */
function storyAnimation() {
    // 标签淡入
    gsap.to('#story-eyebrow', {
        opacity: 1,
        duration: 0.6,
        scrollTrigger: {
            trigger: '#story',
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
        }
    });

    // NOTE: 每一行文字随滚动逐行浮现，营造阅读节奏感
    const storyLines = document.querySelectorAll('.story-line');
    storyLines.forEach((line, index) => {
        gsap.to(line, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            scrollTrigger: {
                trigger: line,
                start: 'top 85%',
                end: 'top 60%',
                scrub: 1,
            }
        });
    });
}

/* =========================================================
   SECTION 4: 视差分层动画
   ========================================================= */
function parallaxAnimation() {
    // 背景层 — 慢速滚动
    gsap.to('#parallax-back .parallax-img', {
        y: '-20%',
        scrollTrigger: {
            trigger: '#parallax',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
        }
    });

    // 中间层 — 文字卡片浮现
    gsap.to('.parallax-text-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        scrollTrigger: {
            trigger: '#parallax',
            start: 'top 60%',
            end: 'top 20%',
            scrub: 1,
        }
    });

    // 前景层 — 数据统计浮现
    gsap.to('.parallax-stats', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: {
            trigger: '#parallax',
            start: '30% 60%',
            end: '50% 30%',
            scrub: 1,
        }
    });

    // NOTE: 中间层微妙的上浮，比背景快，营造深度感
    gsap.to('#parallax-mid', {
        y: -60,
        scrollTrigger: {
            trigger: '#parallax',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
        }
    });

    // 前景数据层更快的上浮
    gsap.to('#parallax-front', {
        y: -100,
        scrollTrigger: {
            trigger: '#parallax',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
        }
    });
}

/* =========================================================
   SECTION 5: 结尾动画
   ========================================================= */
function endingAnimation() {
    // 菱形照片遮罩展开
    gsap.to('#ending-mask', {
        opacity: 1,
        scale: 1,
        duration: 1,
        scrollTrigger: {
            trigger: '#ending',
            start: 'top 70%',
            end: 'top 30%',
            scrub: 1,
        }
    });

    // 菱形缓慢旋转
    gsap.to('#ending-mask', {
        rotation: 360,
        scrollTrigger: {
            trigger: '#ending',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 3,
        }
    });

    // 结尾标题逐行浮现
    gsap.to('.ending-title-line', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        scrollTrigger: {
            trigger: '#ending-title',
            start: 'top 75%',
            end: 'top 45%',
            scrub: 1,
        }
    });

    // 署名信息淡入
    gsap.to('#ending-credits', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
            trigger: '#ending-credits',
            start: 'top 85%',
            end: 'top 60%',
            scrub: 1,
        }
    });

    // NOTE: 底部光晕随滚动增强，模拟余晖效果
    gsap.to('.ending-bg-glow', {
        opacity: 1.5,
        scale: 1.2,
        scrollTrigger: {
            trigger: '#ending',
            start: 'top 50%',
            end: 'bottom bottom',
            scrub: 2,
        }
    });
}
