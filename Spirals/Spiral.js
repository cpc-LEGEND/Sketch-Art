// sketch.js - click to add spiraling lines toward the center

let spirals = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB, 255);
  background(18);
  strokeCap(ROUND);
}

function draw() {
  // We don't clear the background so spirals remain. Use small translucent overlay for subtle fade if desired.
  
  //FOR FADE
  background(18, 8);

  for (let s of spirals) s.draw();
}

function mousePressed() {
  // Add a spiral centered at the mouse click
  spirals.push(new Spiral(mouseX, mouseY));
}

function keyPressed() {
  if (key === 'c' || key === 'C') {
    spirals = [];
    background(18);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Spiral {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;

    // parameters for the spiral
    this.maxRadius = random(120, min(width, height) * 0.45);
    this.turns = random(3, 7); // number of full turns toward the center
    this.segmentsPerTurn = int(random(60, 140));
    this.total = int(this.turns * this.segmentsPerTurn);

  // two colors to interpolate between while spinning
  this.colorA = color(random(60, 255), random(40, 200), random(80, 255), 200);
  this.colorB = color(random(60, 255), random(40, 200), random(80, 255), 200);

    // stroke weight varies along the spiral
    this.startWeight = random(1.2, 6);
    this.endWeight = random(0.2, 2);

  // jitter for organic look
  this.jitter = random(0.2, 2.4);

  // spinning / oscillation parameters
  this.spinMax = random(PI * 0.2, PI * 1.2); // max rotation amplitude (radians)
  this.spinFreq = random(0.008, 0.03); // speed of oscillation
  this.spinPhase = random(TWO_PI);

    // Build points along a logarithmic/polar-like spiral toward the center
    // store as offsets relative to center so we can rotate easily
    this.points = [];
    for (let i = 0; i <= this.total; i++) {
      let t = i / this.total; // 0..1
      // angle grows with t
      let angle = t * TWO_PI * this.turns;
      // radius decreases from maxRadius -> 0 (or small)
      // Use a curve for nicer spacing (ease-out)
      let r = lerp(this.maxRadius, 2, pow(t, 1.0));

      // add a little noise-based jitter so lines are not perfectly uniform
      let j = (noise(cx * 0.0005 + i * 0.01, cy * 0.0005 + i * 0.01) - 0.5) * this.jitter * (1 - t);
      let rx = (r + j) * cos(angle);
      let ry = (r + j) * sin(angle);

      // width for this segment
      let w = lerp(this.startWeight, this.endWeight, t) * (1 + noise(i * 0.02) * 0.7);

      this.points.push({ rx, ry, w, t });
    }

    // optional: rotate color hue across the spiral
    this.hueShift = random(-40, 40);
  }

  draw() {
    // compute oscillation factor for spin and color (0..1)
    let osc = (sin((frameCount * this.spinFreq) + this.spinPhase) + 1) * 0.5;
    let rot = lerp(-this.spinMax, this.spinMax, osc); // rotate between -max..max

    // current color interpolated between colorA and colorB
    let curColor = lerpColor(this.colorA, this.colorB, osc);

    push();
    translate(this.cx, this.cy);
    rotate(rot);
    noFill();

    // draw a few layered strokes for richness
    for (let layer = 0; layer < 2; layer++) {
      let alphaMult = layer === 0 ? 1 : 0.55;
      let alpha = alphaMult * 200;
      stroke(red(curColor), green(curColor), blue(curColor), alpha);

      for (let i = 1; i < this.points.length; i++) {
        let p0 = this.points[i - 1];
        let p1 = this.points[i];
        strokeWeight((p0.w + p1.w) * 0.5 * (layer === 0 ? 1 : 0.6));
        line(p0.rx, p0.ry, p1.rx, p1.ry);
      }
    }

    // thin highlight that also shifts color slightly (lighter)
    stroke(255, 200);
    strokeWeight(0.9);
    for (let i = 1; i < this.points.length; i += 6) {
      let p0 = this.points[i - 1];
      let p1 = this.points[i];
      line(p0.rx, p0.ry, p1.rx, p1.ry);
    }

    pop();
  }
}