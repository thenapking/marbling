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
    // p.limit(5)
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

  intersects(position, drop){

    let inside = false;
    let n= drop.agents.length
    for(let i = 0, j = n - 1; i < n; j = i++) {
      let xi = drop.agents[i].position.x;
      let yi = drop.agents[i].position.y;
      let xj = drop.agents[j].position.x;
      let yj = drop.agents[j].position.y;

      if ((yi > position.y) !== (yj > position.y) && (position.x < (xj - xi) * (position.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;

  }

  update_by(v, reduction = 0.8){
    let new_position = this.position.copy();
    v.limit(this.maxSpeed);
    new_position.add(v);
    v.mult(reduction);

    let intersects_other_drop = false;
    for(let other of drops){
      if(other == this.group){ continue; }
      if(this.intersects(new_position, other)){
        intersects_other_drop = true;
        break;
      }
    }

    if(!intersects_other_drop){
      this.position = new_position;
    }
    
    if(v.mag() < 0.001){
      v.mult(0);
    }
    
  }


  update() {
    this.update_by(this.dispersion_velocity, 0.9);

    return this.dispersion_velocity;
  }

  // could you rewrite this displacement in terms of the centroid, which
  // average of the positions of the group
  // and the average of the distance of each agent to the centroid 
  // (= the radius for a circle)
  marble(other_position, other_r) {
    this.position = this.apply_force(other_position, other_r);
  }
}

