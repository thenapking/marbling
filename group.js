class Group {
  constructor(x, y, r, idx) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.position = createVector(x, y); 
    this.idx = idx;

    this.agents = [];
    this.initialize();
  }

  initialize() {
    for (let i = 0; i < RES; i++) {
      let angle = map(i, 0, RES, 0, TWO_PI);
      let p = createVector(cos(angle), sin(angle));
      p.mult(this.r).add(this.position);
      let v = createVector(cos(angle), sin(angle))
      v.mult(0.5)
      let agent = new Agent(p, v, this);
      this.agents[i] = agent;
    }
  }

  marble(position, r) {  
    for(let agent of this.agents){
      agent.marble(position, r);
    }   
  }

  edges(){
    for(let agent of this.agents){
      agent.edge_force();
    }
  }

  update(){
    let average_position = 0;

    for(let agent of this.agents){
      let previous_position = agent.pos2.copy();
      agent.update();
      average_position += dist(previous_position.x, previous_position.y, agent.pos2.x, agent.pos2.y);
    }

    let new_r = average_position /= this.agents.length;
    return new_r;

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
  }
}
