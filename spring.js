// Simple spring between two particles
class Spring {
  constructor(A, B, length, stiffness) {
    this.A = A;
    this.B = B;
    this.length = length;
    this.stiffness  = stiffness;
    this.damping    = 0.4;
  }

  update() {
    const delta = p5.Vector.sub(this.A.position, this.B.position);
    const dst   = delta.mag();

    if (dst < 0.001) return;
    const deform   = dst - this.length;
    const restore = this.stiffness * deform
    let dd = createVector(0, 0);
    if(dst > 0) {
      dd = p5.Vector.div(delta, dst);
    } 
    const force  = p5.Vector.mult(dd, restore);

    // Apply spring force
    this.A.addForce(force.copy().mult(-1));
    this.B.addForce(force);

    // Damping based on relative velocity
    const relVel = p5.Vector.sub(this.A.velocity, this.B.velocity);
    const damp   = relVel.mult(this.damping);
    this.A.addForce(damp.copy().mult(-1));
    this.B.addForce(damp);
  }

  draw() {
    line(
      this.A.position.x, this.A.position.y,
      this.B.position.x, this.B.position.y
    );
  }
}
