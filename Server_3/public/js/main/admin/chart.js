class SmoothChart {
    constructor(canvasId, data) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = data;
        
        this.padding = { top: 40, right: 20, bottom: 35, left: 35 }; 
        this.height = 200; 
        
        this.width = 0;
        this.points = [];
        this.maxY = 0;
        this.pathLine = new Path2D();
        this.pathFill = new Path2D();
        this.styles = {};
        this.animationId = null;

        this.init();
    }

    init() {
        this.updateStyles();
        
        // Mousemove: 항상 현재의 rect 정보를 기반으로 계산 (반응형 대응)
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            this.draw(x);
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.draw(null);
        });

        // ResizeObserver: 부모 요소 크기 변화 감지
        new ResizeObserver(() => this.resize()).observe(this.canvas.parentNode);
    }

    getCssVar(name) {
        return getComputedStyle(document.body).getPropertyValue(name).trim();
    }

    hexToRgba(hex, alpha) {
        if (!hex) return `rgba(0,0,0,${alpha})`;
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    getFormattedDate(offset) {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    }

    updateStyles() {
        const p100 = this.getCssVar('--primary100') || '#3f51b5';
        const p200 = this.getCssVar('--primary200') || '#6572ba';
        const bg100 = this.getCssVar('--background100') || '#ffffff';
        const textOnP = this.getCssVar('--textOnPrimary') || '#e3e7ff';
        const textAxis = this.getCssVar('--text200') || '#818181'; 

        this.styles = {
            line: p100,
            fillStart: this.hexToRgba(p100, 0.4),
            fillEnd: this.hexToRgba(p100, 0.05),
            bar: this.hexToRgba(p200, 0.3),
            dotFill: p100,
            dotStroke: bg100,
            textBg: p100,
            textColor: textOnP,
            axisColor: textAxis,
            lineWidth: 3
        };
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        
        // [수정됨] 스타일은 100%로 두어 Flexbox가 제어하게 함
        this.canvas.style.width = '100%';
        this.canvas.style.height = `${this.height}px`;

        // [수정됨] 브라우저가 계산한 실제 픽셀 크기를 가져옴
        const rect = this.canvas.getBoundingClientRect();
        
        // 내부 논리 너비 업데이트
        this.width = rect.width;

        // 캔버스 해상도(버퍼)는 DPR을 곱해서 선명하게 설정
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        
        this.ctx.scale(dpr, dpr);

        this.calculatePaths();
        this.draw(null);
    }

    calculatePaths() {
        const { width, height, data, padding } = this;
        this.maxY = Math.max(...data) || 1; 

        const leftInnerMargin = 20; 
        const availWidth = width - (padding.left + leftInnerMargin) - padding.right;
        const availHeight = height - padding.top - padding.bottom; 

        this.points = data.map((val, i) => ({
            x: (padding.left + leftInnerMargin) + (i * (availWidth / (data.length - 1))),
            y: (height - padding.bottom) - ((val / this.maxY) * availHeight)
        }));

        if (this.points.length === 0) return;

        this.pathLine = new Path2D();
        this.pathLine.moveTo(padding.left, this.points[0].y); 
        this.pathLine.lineTo(this.points[0].x, this.points[0].y);
        
        for (let i = 0; i < this.points.length - 1; i++) {
            const midX = (this.points[i].x + this.points[i+1].x) / 2;
            const midY = (this.points[i].y + this.points[i+1].y) / 2;
            this.pathLine.quadraticCurveTo(this.points[i].x, this.points[i].y, midX, midY);
        }
        
        const last = this.points[this.points.length-1];
        this.pathLine.lineTo(last.x, last.y);
        this.pathLine.lineTo(width, last.y);

        this.pathFill = new Path2D(this.pathLine);
        this.pathFill.lineTo(width, height); 
        this.pathFill.lineTo(padding.left, height);
        this.pathFill.closePath();
    }

    draw(mouseX) {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        this.animationId = requestAnimationFrame(() => {
            const { ctx, width, height, styles } = this;
            ctx.clearRect(0, 0, width, height);

            this.drawAxisLabels();

            if (this.points.length === 0) return;

            // -- A. 채우기 --
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, styles.fillStart);
            gradient.addColorStop(1, styles.fillEnd);
            ctx.fillStyle = gradient;
            ctx.fill(this.pathFill);

            // -- B. 선 --
            ctx.lineWidth = styles.lineWidth;
            ctx.strokeStyle = styles.line;
            ctx.lineCap = 'round';
            ctx.stroke(this.pathLine);

            // -- C. 인터랙션 --
            if (mouseX !== null) {
                this.drawCursor(mouseX);
            }
        });
    }

    drawAxisLabels() {
        const { ctx, height, padding, maxY, styles, width } = this;
        
        ctx.fillStyle = styles.axisColor;
        ctx.font = '11px sans-serif';
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(maxY, padding.left - 8, padding.top);
        ctx.fillText(0, padding.left - 8, height - padding.bottom);

        const leftInnerMargin = 20;
        const firstPointX = padding.left + leftInnerMargin;
        const lastPointX = width - padding.right;

        const dateStart = this.getFormattedDate(30);
        const dateEnd = this.getFormattedDate(0);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(dateStart, firstPointX, height - padding.bottom + 8);
        ctx.fillText(dateEnd, lastPointX, height - padding.bottom + 8);
    }

    drawCursor(mouseX) {
        const { ctx, height, width, padding, points, data, styles } = this;
        
        const leftInnerMargin = 20; 
        const startX = padding.left + leftInnerMargin;
        const availWidth = width - startX - padding.right;
        const stepX = availWidth / (data.length - 1);
        
        const relativeX = mouseX - startX;
        const index = Math.round(relativeX / stepX);

        if (index >= 0 && index < points.length) {
            const target = points[index];
            const valueText = data[index];

            ctx.beginPath();
            ctx.moveTo(target.x, height + 15); 
            ctx.lineTo(target.x, target.y);
            ctx.lineWidth = 30;
            ctx.strokeStyle = styles.bar;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(target.x, target.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = styles.dotFill;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = styles.dotStroke;
            ctx.stroke();

            ctx.font = 'bold 12px sans-serif';
            const textMetrics = ctx.measureText(valueText);
            const boxWidth = textMetrics.width + 16;
            const boxHeight = 22;
            const boxY = target.y - 35;

            let boxX = target.x - (boxWidth / 2);
            if (boxX < 0) boxX = 0;
            else if (boxX + boxWidth > width) boxX = width - boxWidth;

            ctx.fillStyle = styles.textBg;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
            else ctx.rect(boxX, boxY, boxWidth, boxHeight);
            ctx.fill();

            ctx.fillStyle = styles.textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(valueText, boxX + (boxWidth / 2), boxY + (boxHeight / 2));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvases = document.querySelectorAll('.chartCanvas');
    canvases.forEach(canvas => {
        if (canvas.dataset.points) {
            const id = canvas.id;
            const points = JSON.parse(canvas.dataset.points);
            new SmoothChart(id, points);
        }
    });
});