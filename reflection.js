const reflectionSketch = (p) => {
    let img;
    let distortion = 50;
    let capture;

    p.setup = () => {
        let canvas = p.createCanvas(
            document.getElementById('reflection-canvas').offsetWidth,
            document.getElementById('reflection-canvas').offsetHeight
        );
        canvas.parent('reflection-canvas');
        
        // Create video capture for mirror effect
        capture = p.createCapture(p.VIDEO);
        capture.size(p.width, p.height);
        capture.hide();
        
        // Set up distortion control
        document.getElementById('distortion').addEventListener('input', (e) => {
            distortion = e.target.value;
        });
    };

    p.draw = () => {
        p.background(10, 26, 47);
        
        if(capture.loadedmetadata) {
            // Apply distortion effect
            p.push();
            p.translate(p.width, 0);
            p.scale(-1, 1);
            
            for(let y = 0; y < p.height; y += 5) {
                let waveOffset = p.sin(p.frameCount * 0.05 + y * 0.05) * distortion;
                p.copy(
                    capture,
                    0, y, p.width, 5,
                    waveOffset, y, p.width, 5
                );
            }
            p.pop();
            
            // Add digital noise overlay
            p.loadPixels();
            for(let i = 0; i < p.pixels.length; i += 4) {
                if(Math.random() > 0.97) {
                    p.pixels[i] = 255;     // R
                    p.pixels[i+1] = 0;      // G
                    p.pixels[i+2] = 255;    // B
                }
            }
            p.updatePixels();
        }
    };
};