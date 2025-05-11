class Agent {
  constructor(position, velocity, group) {
    this.position = position.copy();
    this.group = group;
    this.dispersion_velocity = velocity || p5.Vector.random2D();
    this.marbling_velocity  = createVector(0, 0);
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

    let effect = sqrt( 1 + f ** 2 / m ** 2)
    p.mult(effect)
    p.limit(5)
    return p;
  }

  hard_edges() {
    if (this.position.x < 11) {
      this.position.x = 11;
    } else if (this.position.x > W - 11) {
      this.position.x = W-11;
    }
    if (this.position.y < 11) {
      this.position.y = 11;
    } else if (this.position.y > H - 11) {
      this.position.y = H-11;
    }
  }

  soft_edges(other_position, other_r) {
    let p = this.apply_force(createVector(0,this.position.y), other_r);
    p.mult(0.05);
    this.edge_velocity.add(p);
  }

  update_by(v, reduction = 0.8){
    v.limit(this.maxSpeed);
    this.position.add(v);
    v.mult(reduction);
    if(v.mag() < 0.001){
      v.mult(0);
    }
  }


  update() {
    this.hard_edges();
    this.update_by(this.dispersion_velocity, 0.9);
    this.hard_edges();
    this.update_by(this.marbling_velocity, 0.75);
    this.hard_edges();
    this.update_by(this.edge_velocity, 0.1);
    this.hard_edges();

    return this.dispersion_velocity;
  }

  // could you rewrite this displacement in terms of the centroid, which
  // average of the positions of the group
  // and the average of the distance of each agent to the centroid 
  // (= the radius for a circle)
  marble(other_position, other_r) {
    let p  = this.apply_force(other_position, other_r);
    this.marbling_velocity.add(p.mult(0.05));
  }
}

