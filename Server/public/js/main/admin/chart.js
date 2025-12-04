class SmoothChart {
    constructor(canvasId, data) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = data;
        
        // [설정]
        // left: 35 (Y축 텍스트)
        // right: 20 (우측 여백)
        // bottom: 35 (X축 날짜)
        this.padding = { top: 40, right: 20, bottom: 35, left: 35 }; 
        this.height = 200; // 높이는 고정 (CSS에서 제어하고 싶으면 이 부분도 rect.height로 변경 가능)
        
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
        
        // 마우스 이벤트
        this.canvas.addEventListener('mousemove', (e) => {
            // [중요] 마우스 좌표를 계산할 때 매번 현재 캔버스의 위치와 크기를 다시 가져옴
            const rect = this.canvas.getBoundingClientRect();
            // 캔버스 내부 X 좌표 (0 ~ width)
            const x = e.clientX - rect.left;
            this.draw(x);
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.draw(null);
        });

        // [중요] 부모 요소가 리사이즈 될 때 캔버스 크기 재조정
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

    // [핵심 수정] 리사이즈 로직
    resize() {
        // 1. 현재 브라우저에 렌더링된 캔버스의 실제 크기(CSS 크기)를 가져옵니다.
        // parentNode가 아니라 canvas 자체의 rect를 가져와야 정확합니다.
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // 2. 클래스 내부 변수 업데이트
        this.width = rect.width;
        // 높이는 CSS가 100%라면 rect.height를 쓰고, 고정이면 this.height를 유지
        // 여기서는 CSS에 height: 200px이 없다면 rect.height를 쓰는게 안전할 수 있음
        // 만약 CSS에 height가 지정되어 있다면 this.height = rect.height; 로 변경하세요.
        
        // 3. 캔버스 해상도(Attribute)를 실제 크기 * DPR로 설정 (선명도 확보)
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        
        // 4. 스타일 크기 강제 지정 (CSS Flexbox와 충돌 방지)
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        
        // 5. 컨텍스트 스케일 조정
        this.ctx.scale(dpr, dpr);

        // 6. 경로 재계산 및 그리기
        this.calculatePaths();
        this.draw(null);
    }

    calculatePaths() {
        const { width, height, data, padding } = this;
        this.maxY = Math.max(...data) || 1; 

        const leftInnerMargin = 20; 

        // 유효 너비 계산
        const availWidth = width - (padding.left + leftInnerMargin) - padding.right;
        const availHeight = height - padding.top - padding.bottom; 

        // 1. 좌표 계산
        this.points = data.map((val, i) => ({
            x: (padding.left + leftInnerMargin) + (i * (availWidth / (data.length - 1))),
            y: (height - padding.bottom) - ((val / this.maxY) * availHeight)
        }));

        if (this.points.length === 0) return;

        // 2. 선 경로
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

        // 3. 채우기 경로
        this.pathFill = new Path2D(this.pathLine);
        this.pathFill.lineTo(width, height); 
        this.pathFill.lineTo(padding.left, height);
        this.pathFill.closePath();
    }

    draw(mouseX) {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        
        this.animationId = requestAnimationFrame(() => {
            const { ctx, width, height, styles } = this;
            // 지울 때는 width, height 그대로 사용 (내부 해상도 기준 아님)
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
        
        // Y축
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(maxY, padding.left - 8, padding.top);
        ctx.fillText(0, padding.left - 8, height - padding.bottom);

        // X축
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