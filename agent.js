class Agent {
  constructor(position, velocity, group) {
    this.position = position.copy();
    this.group = group;
    this.dispersion_velocity = velocity || p5.Vector.random2D();
    this.marbling_velocity  = createVector(0, 0);
    this.separation_velocity = createVector(0, 0);
    this.edge_velocity = createVector(0, 0);

    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxSpeed = 20;
    this.maxForce = 0.025;
    this.active = true;
    this.size = 0;
    this.left = null;
    this.right = null;
  }
  
  apply_force(other_position, f, min_dist = W*2) {
    if(f < 0.001) { return; }

    
    let p = p5.Vector.sub(this.position, other_position);
    let d = p5.Vector.dist(this.position, other_position);
    let m = p.mag()

    if(m < 0.001) { return; }
    if(d > min_dist) { return; }

    let effect = 0.5 * sqrt( 1 + f ** 2 / m ** 2)

    p.mult(effect)
    p.limit(5)
    return p;
  }

  hard_edges() {
    if (this.position.x < 0) {
      this.position.x = 1;
    } else if (this.position.x > W) {
      this.position.x = W-1;
    }
    if (this.position.y < 0) {
      this.position.y = 1;
    } else if (this.position.y > H) {
      this.position.y = H-1;
    }
  }

  update_by(v, reduction = 0.8){
    v.limit(this.maxSpeed);
    this.position.add(v);
    v.mult(reduction);
    if(v.mag() < 0.001){
      v.mult(0);
    }
  }

  intersects(drop) {
    let inside = false;
    let n = drop.agents.length;
    for(let i = 1; i < n; i++) {
      let j = (i - 1) % n;

      let pi = drop.agents[i].position;
      let pj = drop.agents[j].position;

      
      
      let intersect = ((pi.y > this.position.y) != (pj.y > this.position.y)) && (this.position.x < (pj.x - pi.x) * (this.position.y - pi.y) / (pj.y - pi.y) + pi.x);
      if (intersect) inside = !inside;
    }

    return inside;
  }
  
  update() {
    this.update_by(this.dispersion_velocity, 0.8);
    this.update_by(this.marbling_velocity, 0.75);
    this.update_by(this.separation_velocity, 0.8);
  }

  separate(other_position, other_r) {
    let p = this.apply_force(other_position, other_r);
    p.mult(0.1);
    this.separation_velocity.add(p);
  }

  marble(other_position, other_r) {
    let p  = this.apply_force(other_position, other_r);
    this.marbling_velocity.add(p);
  }
}

