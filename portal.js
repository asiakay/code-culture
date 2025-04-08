// =====================
// PORTAL INITIALIZATION
// =====================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all sketches
  const sketches = {
    resistance: initResistance(),
    reflection: initReflection(),
    realignment: initRealignment()
  };

  // Activate navigation
  initNavigation();

  // Set initial active section
  activateSection('resistance');
});

// =====================
// SECTION MANAGEMENT
// =====================
function initNavigation() {
  const sparks = document.querySelectorAll('.nav-spark');
  
  sparks.forEach(spark => {
    spark.addEventListener('click', (e) => {
      const targetSection = e.target.dataset.section;
      activateSection(targetSection);
    });
  });
}

function activateSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('section').forEach(section => {
    section.classList.remove('active');
  });

  // Show target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
    
    // Trigger resize for p5 canvases
    if (window.p5Instances && window.p5Instances[sectionId]) {
      const canvas = document.getElementById(`${sectionId}-canvas`);
      window.p5Instances[sectionId].resizeCanvas(canvas.offsetWidth, canvas.offsetHeight);
    }
  }
}

// =====================
// RESISTANCE SECTION
// =====================
function initResistance() {
  return new p5((p) => {
    let particles = [];
    const quotes = [
      "Code is never neutral.",
      "Algorithms amplify bias.",
      "Resistance is binary and analog."
    ];

    p.setup = () => {
      const canvas = p.createCanvas(
        document.getElementById('resistance-canvas').offsetWidth,
        document.getElementById('resistance-canvas').offsetHeight
      );
      canvas.parent('resistance-canvas');
      
      // Initialize particles
      for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
      }
    };

    class Particle {
      constructor() {
        this.pos = p.createVector(p.random(p.width), p.random(p.height));
        this.vel = p.createVector(p.random(-1, 1), p.random(-1, 1));
        this.acc = p.createVector(0, 0);
        this.maxspeed = 2;
        this.h = p.random(160, 200);
      }
      
      update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxspeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.edges();
      }
      
      edges() {
        if (this.pos.x > p.width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = p.width;
        if (this.pos.y > p.height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = p.height;
      }
      
      show() {
        p.stroke(0, 255, 208, this.h);
        p.strokeWeight(1.5);
        p.point(this.pos.x, this.pos.y);
      }
      
      applyForce(force) {
        this.acc.add(force);
      }
    }

    p.draw = () => {
      p.background(10, 26, 47, 10);
      
      particles.forEach(particle => {
        // Mouse repulsion
        let d = p.dist(p.mouseX, p.mouseY, particle.pos.x, particle.pos.y);
        if (d < 100) {
          let force = p.createVector(particle.pos.x - p.mouseX, particle.pos.y - p.mouseY);
          force.setMag(5);
          particle.applyForce(force);
          
          // Occasionally show quotes
          if (p.frameCount % 120 === 0 && p.random() > 0.9) {
            showQuote(particle.pos);
          }
        }
        
        particle.update();
        particle.show();
      });
    };

    function showQuote(pos) {
      p.push();
      p.fill(0, 255, 208);
      p.textSize(14);
      p.textAlign(p.CENTER);
      p.text(
        quotes[Math.floor(p.random(quotes.length))],
        pos.x,
        pos.y - 20
      );
      p.pop();
    }

    p.windowResized = () => {
      p.resizeCanvas(
        document.getElementById('resistance-canvas').offsetWidth,
        document.getElementById('resistance-canvas').offsetHeight
      );
    };
  });
}

// =====================
// REFLECTION SECTION
// =====================
function initReflection() {
  return new p5((p) => {
    let capture;
    let distortion = 50;

    p.setup = () => {
      const canvas = p.createCanvas(
        document.getElementById('reflection-canvas').offsetWidth,
        document.getElementById('reflection-canvas').offsetHeight
      );
      canvas.parent('reflection-canvas');
      
      // Webcam capture
      capture = p.createCapture(p.VIDEO);
      capture.size(p.width, p.height);
      capture.hide();
      
      // Distortion control
      document.getElementById('distortion').addEventListener('input', (e) => {
        distortion = e.target.value * 2;
      });
    };

    p.draw = () => {
      p.background(10, 26, 47);
      
      if (capture.loadedmetadata) {
        // Mirrored distortion effect
        p.push();
        p.translate(p.width, 0);
        p.scale(-1, 1);
        
        for (let y = 0; y < p.height; y += 8) {
          let waveOffset = p.sin(p.frameCount * 0.03 + y * 0.03) * distortion;
          p.copy(
            capture,
            0, y, p.width, 8,
            waveOffset, y, p.width, 8
          );
        }
        p.pop();
        
        // Digital noise
        if (distortion > 60) {
          p.loadPixels();
          for (let i = 0; i < p.pixels.length; i += p.floor(p.random(10, 50))) {
            if (p.random() > 0.7) {
              p.pixels[i] = 255;
              p.pixels[i+1] = p.random(100, 255);
              p.pixels[i+2] = p.random(100, 255);
            }
          }
          p.updatePixels();
        }
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(
        document.getElementById('reflection-canvas').offsetWidth,
        document.getElementById('reflection-canvas').offsetHeight
      );
    };
  });
}

// =====================
// REALIGNMENT SECTION
// =====================
function initRealignment() {
  return new p5((p) => {
    let fft;
    let mic;
    let audioEnabled = false;
    const frequencies = Array(32).fill(0);

    p.setup = () => {
      const canvas = p.createCanvas(
        document.getElementById('realignment-canvas').offsetWidth,
        document.getElementById('realignment-canvas').offsetHeight,
        p.WEBGL
      );
      canvas.parent('realignment-canvas');
      
      // Audio toggle
      document.getElementById('audio-toggle').addEventListener('click', toggleAudio);
      
      // Initialize frequency bars
      initFrequencyBars();
    };

    async function toggleAudio() {
      if (!audioEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          mic = audioContext.createMediaStreamSource(stream);
          fft = new p5.FFT();
          fft.setInput(mic);
          audioEnabled = true;
          document.getElementById('audio-toggle').textContent = 'Sensors Active';
        } catch (err) {
          console.error("Audio error:", err);
        }
      } else {
        if (mic) mic.mediaStream.getTracks().forEach(track => track.stop());
        audioEnabled = false;
        document.getElementById('audio-toggle').textContent = 'Activate Audio Sensors';
      }
    }

    function initFrequencyBars() {
      const container = document.querySelector('.frequency-bars');
      container.innerHTML = '';
      
      for (let i = 0; i < 32; i++) {
        const bar = document.createElement('div');
        bar.className = 'frequency-bar';
        bar.style.height = '0px';
        container.appendChild(bar);
      }
    }

    p.draw = () => {
      p.clear();
      p.background(10, 26, 47, 150);
      
      if (audioEnabled && fft) {
        const spectrum = fft.analyze();
        
        // Update frequency bars
        const bars = document.querySelectorAll('.frequency-bar');
        bars.forEach((bar, i) => {
          const index = Math.floor(p.map(i, 0, bars.length, 0, spectrum.length));
          frequencies[i] = p.lerp(frequencies[i], spectrum[index], 0.1);
          const height = p.map(frequencies[i], 0, 255, 0, 100);
          bar.style.height = `${height}px`;
          bar.style.background = `hsl(${p.map(i, 0, bars.length, 160, 300)}, 100%, 50%)`;
        });
        
        // Draw frequency circle
        p.push();
        p.rotateY(p.frameCount * 0.01);
        
        p.beginShape();
        for (let i = 0; i < spectrum.length; i++) {
          let angle = p.map(i, 0, spectrum.length, 0, p.TWO_PI);
          let r = p.map(spectrum[i], 0, 255, 50, p.width/3);
          
          p.fill(
            p.map(i, 0, spectrum.length, 160, 300),
            100,
            p.map(spectrum[i], 0, 255, 50, 100),
            0.7
          );
          p.noStroke();
          p.vertex(
            p.cos(angle) * r,
            p.sin(angle) * r,
            0
          );
        }
        p.endShape(p.CLOSE);
        
        // Central pulse
        let pulseSize = p.map(fft.getEnergy("mid"), 0, 255, 10, 50);
        p.fill(0, 255, 208, 150);
        p.ellipse(0, 0, pulseSize, pulseSize);
        
        p.pop();
      } else {
        // Idle state
        p.push();
        p.rotateY(p.frameCount * 0.01);
        p.fill(0, 255, 208, 50);
        p.noStroke();
        p.ellipse(0, 0, 100, 100);
        p.pop();
      }
    };

    p.windowResized = () => {
      p.resizeCanvas(
        document.getElementById('realignment-canvas').offsetWidth,
        document.getElementById('realignment-canvas').offsetHeight
      );
    };
  });
}

// Store p5 instances globally
window.p5Instances = {
  resistance: null,
  reflection: null,
  realignment: null
};