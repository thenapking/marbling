class Agent {
  constructor(position, velocity, group) {
    this.position = position.copy();
    this.pos2 = position.copy();
    this.group = group;
    this.velocity = velocity || p5.Vector.random2D();
    this.acceleration = createVector(0, 0);
    this.maxSpeed = 1;
    this.maxForce = 0.025;
    this.active = true;
    this.size = 0;
  }
  
  applyForce(force, m = 1) {
    force.mult(m);
    this.acceleration.add(force);
  }

  edge_force() {
    let left =   createVector(0, this.position.y);
    let right =  createVector(W, this.position.y);
    let top =    createVector(this.position.x, 0);
    let bottom = createVector(this.position.x, H);
    let left_force = 1/(this.position.x);
    let top_force = 1/(this.position.y);
    let bottom_force = 1/(H - this.position.y);
    let right_force = 1/(W - this.position.x);

    let sf = map(NDROPS, 0, MAX_DROPS, 4, 2);
    sf *= MW
    constrain(left_force, 0, 1);
    constrain(top_force, 0, 1);
    constrain(bottom_force, 0, 1);
    constrain(right_force, 0, 1);

    this.marble(left, left_force * sf)
    this.marble(top, top_force * sf)
    this.marble(bottom, bottom_force * sf);
    this.marble(right, right_force * sf);

  }

  edges(d = 0) {
    if (this.position.x < d) {
      this.position.x = d;
    } else if (this.position.x > W-d) {
      this.position.x = W-d;
    }
    if (this.position.y < d) {
      this.position.y = d;
    } else if (this.position.y > H-d) {
      this.position.y = H-d;
    }
  }

  
  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.pos2.add(this.velocity);
    this.acceleration.mult(0);
    this.velocity.mult(0.95); // important to get this right for the cube-y effect
    if (this.velocity.mag() < 0.001) {
      this.active = false;
      this.velocity.mult(0);
    }
  }

  marble(other_position, r) {
    let p = this.position.copy();
    p.sub(other_position);
    let m = p.mag();

    // in order to reduce the strength of the marblng
    // as more paint is added
    // we need to scale this radius here
    let sf = map(NDROPS, 0, MAX_DROPS, 1, 0.8);
    r = r*sf

    let root = sqrt(1 + (r * r) / (m * m));
    p.mult(root);
    p.add(other_position);
    this.position.set(p);
    this.edges();
  }
}
