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
    this.left = null;
    this.right = null;
  }
  
  apply_force(other_position, f, min_dist = W*2) {
    if(f < 0.001) { return; }
    let p = p5.Vector.sub(this.position, other_position);
    let d = p5.Vector.dist(this.position, other_position);
    let m = p.magSq()

    if(m < 0.001) { return; }
    if(d > min_dist) { return; }

    let effect = sqrt(1 + (f ** 2) / m);


    p.mult(effect).add(other_position);

    this.position.set(p);
  }

  separate(){
    for(let drop of drops){
      if(drop == this.group){ continue }

      for(let agent of drop.agents){
        let d = this.group.r/2;
        this.apply_force(agent.position, 0.5, d);
      }
    }
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

    let sf = 3
    constrain(left_force, 0, 1);
    constrain(top_force, 0, 1);
    constrain(bottom_force, 0, 1);
    constrain(right_force, 0, 1);

    this.apply_force(left, left_force * sf);
    this.apply_force(right, right_force * sf);
    this.apply_force(top, top_force * sf);
    this.apply_force(bottom, bottom_force * sf);
    this.edges();

  }

  edges(d = 1) {
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
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.velocity.mult(0.95); // important to get this right for the cube-y effect
    if (this.velocity.mag() < 0.001) {
      this.active = false;
      this.velocity.mult(0);
    }
  }

  marble(other_position, r) {
    this.apply_force(other_position, r);
    this.edges();
  }
}
