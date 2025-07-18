const SPACING_FACTOR = 1.25; // WAS 1.25
const MAX_AGE = 100;  
const DISPERSION_RATIO = 0.5;
const GROUP_INITIAL_SEPARATION_FACTOR = 4/u
const GROUP_SEPARATION = 8/u // when any agent is within this distance, the group stops dispersing

class Group {
  constructor(x, y, radius, idx) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.position = createVector(x, y); 
    this.idx = idx;

    this.agents = [];
    this.springs = [];
    this.radial_springs = [];
    this.central_agent = null;
    this.initialize(radius);
    this.age = 0;
    this.inside = false;
    this.parent = null;
    this.children = [];
    this.dispersion_factor = 0.5;
    this.active = true;
  }

  initialize(radius) {
    this.central_agent = new Agent(this.position, createVector(0, 0), this);
    let resolution = this.calculate_resolution();

    for (let i = 0; i < resolution; i++) {
      let angle = map(i, 0, resolution, 0, TWO_PI);
      let p = createVector(cos(angle), sin(angle));
      p.mult(radius).add(this.position);
      let v = p5.Vector.sub(p, this.position).normalize();  
      v.mult(1)
      let agent = new Agent(p, v, this);
      this.agents.push(agent);
    }

    for (let stride = 1; stride <= 2; stride++) {
      for (let i = 0; i < this.agents.length; i++) {
        const a = this.agents[i];
        const b = this.agents[(i + stride) % this.agents.length];
        const length = dist(a.position.x, a.position.y, b.position.x, b.position.y);
        this.springs.push(new Spring(a, b, length, 0.4));
      }
    }   
    
    for(let i = 0; i < this.agents.length; i++){
      let a = this.agents[i];
      let b = this.central_agent;
      let length = dist(a.position.x, a.position.y, b.position.x, b.position.y);
      this.radial_springs.push(new Spring(a, b, length, 0.02));
    }
  }

  calculate_resolution(){
    let r = Math.round(this.radius);
    let res = Math.floor(TWO_PI * r / (AGENT_RADIUS*2*SPACING_FACTOR));
    if(res % 2 !== 0) { res -= 1 }
    if(res % 4 !== 0) { res -= 2 } 
    return res;
  }

  constrain(){
    let prev = this.agents[this.agents.length - 1].position;
  
    for(let i = 0; i < this.agents.length; i++){
      let agent = this.agents[i];
      let v = agent.position;
      let spring = this.springs[i];

      if(v.dist(prev) > spring.length*3){
        spring.update();
      }
      prev = v;
    }
  }

  disperse(agent){
    if(this.age > 100) { return; }
    
    let valid = true;
    for(let other of drops){
      if(other === this) continue; 
      if(agent.in(other)){
        valid = false;
        break;
      }
    }

    if(valid) { this.disp(agent); }
    if(this.parent) { this.disp(agent); }
    
  }

  disp(agent){
    let v = p5.Vector.sub(agent.position, this.position).normalize();  
    let sf = map(this.age, 0, MAX_AGE, this.dispersion_factor, 0);
    v.mult(sf);
    agent.addForce(v);
  }

  update(){
    // if(!this.active) { return; }
    this.intersecting();
    this.constrain();

    for(let spring of this.radial_springs){
      spring.update();
    }
    
    let new_position = createVector(0,0)
    let new_radius = 0;
    let active = 0;
    for(let agent of this.agents){
      this.disperse(agent);
      agent.update()
      agent.separating = false;
      new_position.add(agent.position);
      if(agent.active) {
        active++;
      }
    }

    this.position = new_position.copy().div(this.agents.length);
    this.central_agent.position = this.position;

    for(let agent of this.agents){
      new_radius += p5.Vector.dist(agent.position, this.position);
    }
    new_radius = new_radius / this.agents.length;
    this.radius = new_radius;
    this.age++;
    if(active === 0 || this.age > MAX_AGE){
      this.active = false;
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


  intersecting(){
    let n = this.agents.length;
    for(let drop of drops){
      if(drop === this) continue; 

      let count = this.number_of_agents_in(drop);
      
      if(count > 0 && count < n){
        for(let agent of this.agents){
          agent.separating = true;
        }
        return true;
      }
    }

    return false;
  }


  number_of_agents_in(drop){
    if(drop === this) return 0;

    let count = 0;
    for (let agent of this.agents) {

      if(agent.in(drop)){
        count++;
      }
    }

    return count;
  }

  draw(){
    if(debug){
      this.draw_debug();
    } else {
      this.draw_filled();
    }
  }

  draw_spokes(modulo = 1){
    strokeWeight(2);
    noFill();

    beginShape();
      for(let agent of this.agents){
        let v = agent.position;
        vertex(v.x, v.y);
      }
    endShape(CLOSE);

    for(let i = 0; i < this.radial_springs.length; i++){
      if(modulo > 1 && i % modulo !== 0) continue; // Skip if modulo condition is not met
      let spring = this.radial_springs[i];
      spring.draw();
    }
  }

  draw_debug(){
    noFill();
    strokeWeight(2);

    fill(palette[this.idx]);
    for(let agent of this.agents){
      agent.draw();
    }

    circle(this.position.x, this.position.y, 5);

    noFill();
    strokeWeight(1);
    for(let spring of this.springs){
      spring.draw();
    }

    for(let spring of this.radial_springs){
      spring.draw();
    }
  }

  draw_filled() {
    fill(palette[this.idx]);
    noStroke();
    
    beginShape();
      for(let agent of agents){
        let v = agent.position;
        vertex(v.x, v.y);
      }
    endShape(CLOSE);

    
  }
}
