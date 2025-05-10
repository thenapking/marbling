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
    this.initialize();
  }

  initialize() {
    for (let i = 0; i < RES; i++) {
      let angle = map(i, 0, RES, 0, TWO_PI);
      let p = createVector(cos(angle), sin(angle));
      p.mult(this.r).add(this.position);
      let v = createVector(cos(angle), sin(angle))
      v.mult(2)
      let agent = new Agent(p, v, this);
      this.agents[i] = agent;
    }
  }

  // doesn't work if the group becomes convex
  interpolate(){
    let agents_to_add = []; 
    for(let i = 0; i < this.agents.length + 1; i++){
      let left = this.agents[i % this.agents.length];
      let right = this.agents[(i + 1) % this.agents.length];
      let dist = left.position.dist(right.position);
      if(dist > 20){
        let mid = p5.Vector.add(left.position, right.position).div(2);
        agents_to_add[i]= new Agent(mid, left.velocity, this);
      }
    }

    let agents_added = 0; 
    for(let i = 0; i < agents_to_add.length; i++){
      let agent = agents_to_add[i];
      if(agent){
        console.log("added agent");
        agents_added++;
        this.agents.splice(i, 0, agent);
        if(agents_added > 10){
          break
        }
      }
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
    let avg_dist = 0;
    let avg_pos = createVector(0, 0);
    let avg_vel = 0

    for(let agent of this.agents){
      agent.update();
      avg_vel += agent.velocity.mag();
      avg_dist += p5.Vector.dist(this.position, agent.position);
      avg_pos.add(agent.position);
    }
    this.average_position = avg_pos.div(this.agents.length);
    this.average_velocity = avg_vel / this.agents.length;
    this.r = avg_dist / this.agents.length;

    // this.interpolate();
    
  }

  separate(){ 
    for(let agent of this.agents){
      agent.separate();
    }
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
