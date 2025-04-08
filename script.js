// Main portal interaction
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const sparks = document.querySelectorAll('.nav-spark');
    
    sparks.forEach(spark => {
        spark.addEventListener('click', () => {
            const target = spark.dataset.section;
            
            sections.forEach(section => {
                section.classList.remove('active');
                if(section.id === target) {
                    section.classList.add('active');
                }
            });
        });
    });
});

// p5.js canvases
const resistanceSketch = (p) => {
    let particles = [];
    
    p.setup = () => {
        let canvas = p.createCanvas(
            document.getElementById('resistance-canvas').offsetWidth,
            document.getElementById('resistance-canvas').offsetHeight
        );
        canvas.parent('resistance-canvas');
        
        for(let i = 0; i < 100; i++) {
            particles.push(new Particle());
        }
    };
    
    p.draw = () => {
        p.background(10, 26, 47, 10);
        
        for(let particle of particles) {
            particle.update();
            particle.show();
            
            // Resistance behavior - particles push away from mouse
            let d = p.dist(p.mouseX, p.mouseY, particle.pos.x, particle.pos.y);
            if(d < 100) {
                let force = p.createVector(particle.pos.x - p.mouseX, particle.pos.y - p.mouseY);
                force.setMag(5);
                particle.applyForce(force);
            }
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
        
        applyForce(force) {
            this.acc.add(force);
        }
        
        update() {
            this.vel.add(this.acc);
            this.vel.limit(this.maxspeed);
            this.pos.add(this.vel);
            this.acc.mult(0);
            
            this.edges();
        }
        
        edges() {
            if(this.pos.x > p.width) this.pos.x = 0;
            if(this.pos.x < 0) this.pos.x = p.width;
            if(this.pos.y > p.height) this.pos.y = 0;
            if(this.pos.y < 0) this.pos.y = p.height;
        }
        
        show() {
            p.stroke(0, 255, 208, this.h);
            p.strokeWeight(2);
            p.point(this.pos.x, this.pos.y);
        }
    }
};

// Initialize all sketches
new p5(resistanceSketch);

// Additional sketches for reflection and realignment would follow similar patterns
// with different visual behaviors matching their themes