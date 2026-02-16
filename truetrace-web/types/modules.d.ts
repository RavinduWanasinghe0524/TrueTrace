declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs' {
    const worker: string;
    export default worker;
}

declare module 'canvas' {
    interface CanvasRenderingContext2D {
        fillStyle: string;
        fillRect(x: number, y: number, width: number, height: number): void;
        font: string;
        textAlign: CanvasTextAlign;
        fillText(text: string, x: number, y: number): void;
    }

    interface Canvas {
        getContext(type: '2d'): CanvasRenderingContext2D;
        toBuffer(type: 'image/jpeg', options?: { quality: number }): Buffer;
        width: number;
        height: number;
    }

    export function createCanvas(width: number, height: number): Canvas;
}
