const RES = 200;
class Group {
  constructor(x, y, r, idx) {
    this.x = x;
    this.y = y;
    this.r = r;

    this.position = createVector(x, y); 
    this.average_position = createVector(x, y);
    this.average_velocity = 1;
    this.idx = idx;

    this.agents = [];
    this.initialize(r);

  }

  initialize(r) {
    for (let i = 0; i < RES; i++) {
      let angle = map(i, 0, RES, 0, TWO_PI);
      let p = createVector(cos(angle), sin(angle));
      p.add(this.position);
      let v = createVector(cos(angle), sin(angle))
      v.mult(r)
      let agent = new Agent(p, v, this);
      this.agents[i] = agent;
    }
  }


  marble(position, r) {  
    for(let agent of this.agents){
      let p = agent.position.copy();
      p.sub(position);
      let m = p.mag();
      let root = sqrt(1 + (r * r) / (m * m));
      p.mult(root);
      p.add(position);
      agent.position.set(p);
    }   
    
  }



  edges(){
    let left = false;

    for(let agent of this.agents){
      if(agent.position.x < 30 && agent.position.x > 10){
        left = true;
        break;
      }
    }
    if(left){
      for(let agent of this.agents){
        agent.soft_edges(createVector(0, this.average_position.y), 5);
      }
    }
  }

  update(){
    let avg_dist = 0;
    let avg_pos = createVector(0, 0);
    let avg_vel = 0
    let dispersion_velocity = createVector(0, 0);
    for(let agent of this.agents){
      
      dispersion_velocity.add(agent.update());
      avg_vel += agent.velocity.mag();
      avg_pos.add(agent.position);
      avg_dist += p5.Vector.dist(this.average_position, agent.position);
    }


    this.average_position = avg_pos.div(this.agents.length);
    this.average_velocity = avg_vel / this.agents.length;

    let new_r = avg_dist / this.agents.length;
    
    this.r = new_r;

    return dispersion_velocity;
    
  }

  draw() {
    fill(palette[this.idx]);
    noStroke();

    beginShape();
    for(let agent of this.agents){
      let v = agent.position;
      vertex(v.x, v.y);
    }
    endShape(CLOSE);

    if(debug){
      noFill();
      strokeWeight(2);
      stroke(255,0,0);
      circle(this.average_position.x, this.average_position.y, this.r*2);
    }
  }
}
