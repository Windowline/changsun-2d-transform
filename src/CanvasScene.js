import {multiplyMatrices3x3, multiplyMatrixVector3, vectorToStr} from './MathUtils.js';

class CanvasScene {
    constructor(canvasId, options) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.halfWidth = this.canvas.width / 2;
        this.halfHeight = this.canvas.height / 2;
        this.scale = 100;
        this.transX = 0;
        this.transY = 0;
        this.degree = 0;
        this.pivotX = 0;
        this.pivotY = 0;
        this.animating = false;

        // Inputs
        this.translateXInput = document.getElementById(options.translateX);
        this.translateYInput = document.getElementById(options.translateY);
        this.rotateInput = document.getElementById(options.rotate);
        this.pivotXInput = document.getElementById(options.pivotX);
        this.pivotYInput = document.getElementById(options.pivotY);

        // Outputs
        this.leftBottomOutput = document.getElementById(options.outputs.leftBottom);
        this.leftTopOutput = document.getElementById(options.outputs.leftTop);
        this.rightBottomOutput = document.getElementById(options.outputs.rightBottom);
        this.rightTopOutput = document.getElementById(options.outputs.rightTop);
        this.centerOutput = document.getElementById(options.outputs.center);

        const inputs = [
            this.translateXInput,
            this.translateYInput,
            this.rotateInput,
            this.pivotXInput,
            this.pivotYInput
        ];

        inputs.forEach(input => {
            input.addEventListener("focus", () => this.clearDefault(input));
            input.addEventListener("blur", () => this.restoreDefault(input));
            input.addEventListener("input", () => {this.updateRectInfo(); this.drawScene();});
        });

        this.turnBtn = document.getElementById(options.turn);
        this.turnBtn.addEventListener("click", () => {this.turnAnimate(); this.drawScene();});
    }

    clearDefault(input) {
        if (input.value === "0") {
            input.value = "";
        }
    }

    restoreDefault(input) {
        if (input.value.trim() === "") {
            input.value = "0";
            this.updateRectInfo();
            this.drawScene();
        }
    }

    drawAxes() {
        this.ctx.strokeStyle = "black";
        this.ctx.beginPath();
        this.ctx.moveTo(this.halfWidth, 0);
        this.ctx.lineTo(this.halfWidth, this.canvas.height);
        this.ctx.moveTo(0, this.halfHeight);
        this.ctx.lineTo(this.canvas.width, this.halfHeight);
        this.ctx.stroke();

        this.ctx.fillStyle = "black";
        this.ctx.font = "8px Arial";
        for (let i = -this.halfWidth; i <= this.halfWidth; i += 50) {
            if (i === 0)
                continue;
            this.ctx.fillText(i, this.halfWidth + i, this.halfHeight - 5);
            this.ctx.fillText(-i, this.halfWidth + 5, this.halfHeight + i);
        }
    }


    updateRectInfo() {
        if (this.animating) {
            return;
        }

        this.transX = this.getInputValue(this.translateXInput);
        this.transY = this.getInputValue(this.translateYInput) * (-1);
        this.degree = this.getInputValue(this.rotateInput);
        this.pivotX = this.getInputValue(this.pivotXInput);
        this.pivotY = this.getInputValue(this.pivotYInput) * (-1);
    }

    turnAnimate() {
        if (this.animating) {
            return;
        }

        this.animating = true;
        const duration = 1000;
        const startTime = performance.now();
        const startDegree = this.degree;
        const targetDegree = startDegree + 360;

        const easeInOut = (t) => {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }
        const animate = (currentTime) => {
            const elapsed = performance.now() - startTime;
            const ratio = Math.min(elapsed / duration, 1);
            const easeRatio = easeInOut(ratio);
            this.degree = easeRatio * targetDegree + (1.0 - easeRatio) * startDegree;

            this.drawScene();

            if (ratio < 1) {
                requestAnimationFrame(animate);
            } else {
                this.animating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    drawScene() {
        const rectTransform = this.buildRectTransform(
            this.transX, this.transY,
            this.pivotX, this.pivotY,
            this.degree
        );

        this.displayPositions(rectTransform);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawAxes();

        this.ctx.save();
        this.drawRect(rectTransform);
        this.drawPivot(this.transX, this.transY, this.pivotX, this.pivotY);
        this.ctx.restore();
    }

    buildRectTransform(translateX, translateY, pivotX, pivotY, degree) {
        const radian = (degree * Math.PI) / 180;
        const cos = Math.cos(radian);
        const sin = Math.sin(radian);

        const translateToOrigin = [
            [1, 0, -pivotX],
            [0, 1, -pivotY],
            [0, 0, 1]
        ];

        const basisTransform = [
            [cos, sin, 0],
            [-sin, cos, 0],
            [0, 0, 1]
        ];

        const translateBack = [
            [1, 0, pivotX + translateX],
            [0, 1, pivotY + translateY],
            [0, 0, 1]
        ];

        let transform = multiplyMatrices3x3(
            translateBack,
            multiplyMatrices3x3(basisTransform, translateToOrigin)
        );

        transform[0][0] *= this.scale;
        transform[0][1] *= -this.scale;
        transform[1][0] *= this.scale;
        transform[1][1] *= -this.scale;

        return transform;
    }

    drawRect(transform) {
        this.ctx.setTransform(
            transform[0][0], transform[0][1],
            transform[1][0], transform[1][1],
            transform[0][2] + this.halfWidth,
            transform[1][2] + this.halfHeight
        );

        this.ctx.fillStyle = "lightgray";
        this.ctx.fillRect(0, 0, 1, 1);
    }

    drawPivot(translateX, translateY, pivotX, pivotY) {
        this.ctx.setTransform(
            1, 0,
            0, 1,
            pivotX + translateX + this.halfWidth,
            pivotY + translateY + this.halfHeight
        );

        this.ctx.fillStyle = "red";
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    displayPositions(transform) {
        const leftBottom = multiplyMatrixVector3(transform, [0, 0, 1]);
        const leftTop = multiplyMatrixVector3(transform, [0, 1, 1]);
        const rightBottom = multiplyMatrixVector3(transform, [1, 0, 1]);
        const rightTop = multiplyMatrixVector3(transform, [1, 1, 1]);
        const center = multiplyMatrixVector3(transform, [0.5, 0.5, 1]);
        this.leftBottomOutput.textContent = `Left Bottom: ${vectorToStr(leftBottom)}`;
        this.leftTopOutput.textContent = `Left Top: ${vectorToStr(leftTop)}`;
        this.rightBottomOutput.textContent = `Right Bottom: ${vectorToStr(rightBottom)}`;
        this.rightTopOutput.textContent = `Right Top: ${vectorToStr(rightTop)}`;
        this.centerOutput.textContent = `Center: ${vectorToStr(center)}`;
    }

    getInputValue(input, defaultValue = 0) {
        const v = parseInt(input);
        return isNaN(v) ? defaultValue : v;
    }
}

export default CanvasScene;
