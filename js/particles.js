/* =========================================================
   粒子/光线效果 — 模拟黄昏光线散射
   ========================================================= */

// NOTE: 粒子从画面右下角（太阳方向）向外扩散，颜色在暖橙到金色之间变化

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 80;
        this.scrollProgress = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.animationId = null;

        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollProgress = window.scrollY / maxScroll;
        });
    }

    // NOTE: 粒子颜色随滚动进度从暖橙变化到冷蓝，呼应照片的色彩过渡
    getParticleColor(progress) {
        const colors = [
            { r: 232, g: 145, b: 58 },  // 暖橙
            { r: 240, g: 176, b: 96 },  // 金色
            { r: 200, g: 110, b: 47 },  // 深橙
            { r: 42, g: 90, b: 124 },   // 天蓝
        ];

        const idx = Math.floor(progress * (colors.length - 1));
        const nextIdx = Math.min(idx + 1, colors.length - 1);
        const t = (progress * (colors.length - 1)) - idx;

        const color = colors[idx];
        const next = colors[nextIdx];

        return {
            r: Math.round(color.r + (next.r - color.r) * t),
            g: Math.round(color.g + (next.g - color.g) * t),
            b: Math.round(color.b + (next.b - color.b) * t),
        };
    }

    createParticle() {
        // 粒子从右下角区域生成，模拟太阳光线方向
        const spawnArea = Math.random();
        let x, y;

        if (spawnArea < 0.6) {
            // 右下角区域
            x = this.width * (0.6 + Math.random() * 0.4);
            y = this.height * (0.6 + Math.random() * 0.4);
        } else if (spawnArea < 0.8) {
            // 右侧
            x = this.width * (0.8 + Math.random() * 0.2);
            y = Math.random() * this.height;
        } else {
            // 随机位置（稀疏分布）
            x = Math.random() * this.width;
            y = Math.random() * this.height;
        }

        const color = this.getParticleColor(Math.random());
        const size = Math.random() * 2.5 + 0.5;

        return {
            x,
            y,
            originX: x,
            originY: y,
            size,
            baseSize: size,
            color,
            alpha: Math.random() * 0.5 + 0.1,
            baseAlpha: Math.random() * 0.5 + 0.1,
            // 粒子缓慢向左上方飘动
            vx: (Math.random() - 0.7) * 0.3,
            vy: (Math.random() - 0.7) * 0.2,
            // 闪烁参数
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinklePhase: Math.random() * Math.PI * 2,
            life: 0,
            maxLife: Math.random() * 400 + 200,
        };
    }

    init() {
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.createParticle();
            p.life = Math.random() * p.maxLife;
            this.particles.push(p);
        }
    }

    update() {
        // 根据滚动进度调整粒子数量和亮度
        const scrollFactor = 1 - this.scrollProgress * 0.5;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life++;

            // 生命周期结束时重生
            if (p.life >= p.maxLife) {
                this.particles[i] = this.createParticle();
                continue;
            }

            // 运动
            p.x += p.vx;
            p.y += p.vy;

            // 鼠标交互 — 粒子轻微远离鼠标
            const dx = p.x - this.mouseX;
            const dy = p.y - this.mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                p.x += (dx / dist) * force * 0.5;
                p.y += (dy / dist) * force * 0.5;
            }

            // 闪烁
            p.twinklePhase += p.twinkleSpeed;
            const twinkle = Math.sin(p.twinklePhase) * 0.5 + 0.5;
            p.alpha = p.baseAlpha * twinkle * scrollFactor;
            p.size = p.baseSize * (0.8 + twinkle * 0.4);

            // 淡入淡出
            const lifeRatio = p.life / p.maxLife;
            if (lifeRatio < 0.1) {
                p.alpha *= lifeRatio / 0.1;
            } else if (lifeRatio > 0.8) {
                p.alpha *= (1 - lifeRatio) / 0.2;
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (const p of this.particles) {
            if (p.alpha <= 0.01) continue;

            // 光晕效果
            const gradient = this.ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size * 3
            );
            gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`);
            gradient.addColorStop(0.4, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha * 0.3})`);
            gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // 粒子核心亮点
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${Math.min(p.color.r + 40, 255)}, ${Math.min(p.color.g + 40, 255)}, ${Math.min(p.color.b + 20, 255)}, ${p.alpha * 0.8})`;
            this.ctx.fill();
        }
    }

    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// 页面加载后初始化粒子系统
window.addEventListener('load', () => {
    // NOTE: 延迟初始化，等待预加载完成后再启动粒子
    setTimeout(() => {
        new ParticleSystem('particles-canvas');
    }, 100);
});
