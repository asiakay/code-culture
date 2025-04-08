const realignmentSketch = (p) => {
    let fft;
    let audioContext;
    let mic;
    let audioEnabled = false;
    let frequencies = [];

    p.setup = () => {
        let canvas = p.createCanvas(
            document.getElementById('realignment-canvas').offsetWidth,
            document.getElementById('realignment-canvas').offsetHeight
        );
        canvas.parent('realignment-canvas');
        
        // Set up audio elements
        document.getElementById('audio-toggle').addEventListener('click', toggleAudio);
        
        // Initialize frequency bars in DOM
        const container = document.querySelector('.frequency-bars');
        for(let i = 0; i < 32; i++) {
            const bar = document.createElement('div');
            bar.className = 'frequency-bar';
            container.appendChild(bar);
        }
    };

    async function toggleAudio() {
        if(!audioEnabled) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                await p.userStartAudio();
                
                mic = new p5.AudioIn();
                mic.start(() => {
                    audioEnabled = true;
                    document.getElementById('audio-toggle').textContent = 'Sensors Active';
                    
                    fft = new p5.FFT();
                    fft.setInput(mic);
                });
            } catch(err) {
                console.error("Audio activation failed:", err);
            }
        } else {
            if(mic) mic.stop();
            audioEnabled = false;
            document.getElementById('audio-toggle').textContent = 'Activate Audio Sensors';
        }
    }

    p.draw = () => {
        p.background(10, 26, 47, 150);
        
        if(audioEnabled && fft) {
            // Get frequency data
            let spectrum = fft.analyze();
            
            // Update DOM frequency bars
            const bars = document.querySelectorAll('.frequency-bar');
            for(let i = 0; i < bars.length; i++) {
                const index = Math.floor(p.map(i, 0, bars.length, 0, spectrum.length));
                const height = p.map(spectrum[index], 0, 255, 0, 100);
                bars[i].style.height = `${height}px`;
                bars[i].style.background = `hsl(${p.map(i, 0, bars.length, 160, 300)}, 100%, 50%)`;
            }
            
            // Draw circular frequency visualization
            p.push();
            p.translate(p.width/2, p.height/2);
            p.noFill();
            
            for(let i = 0; i < spectrum.length; i++) {
                let angle = p.map(i, 0, spectrum.length, 0, p.TWO_PI);
                let amp = spectrum[i];
                let r = p.map(amp, 0, 256, 50, p.width/2);
                
                p.stroke(p.map(i, 0, spectrum.length, 160, 300), 100, 50, 150);
                p.strokeWeight(2);
                p.line(
                    p.cos(angle) * 50,
                    p.sin(angle) * 50,
                    p.cos(angle) * r,
                    p.sin(angle) * r
                );
            }
            p.pop();
        } else {
            // Default visualization when audio isn't active
            p.fill(0, 255, 208, 50);
            p.noStroke();
            
            for(let i = 0; i < 20; i++) {
                let size = p.noise(p.frameCount * 0.01 + i) * 100;
                p.ellipse(
                    p.width/2 + p.sin(p.frameCount * 0.02 + i) * 200,
                    p.height/2 + p.cos(p.frameCount * 0.02 + i) * 200,
                    size
                );
            }
        }
    };
};
