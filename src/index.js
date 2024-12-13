import CanvasScene from './CanvasScene.js'

const canvasScene = new CanvasScene("canvas", {
    translateX: "translateX",
    translateY: "translateY",
    rotate: "rotate",
    pivotX: "pivotX",
    pivotY: "pivotY",
    outputs: {
        leftBottom: "LeftBottom",
        leftTop: "LeftTop",
        rightBottom: "RightBottom",
        rightTop: "RightTop",
        center: "Center"
    },
});

canvasScene.drawScene();