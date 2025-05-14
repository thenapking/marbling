const RES = 200;
const SPACING_FACTOR = 1.25;
const MAX_AGE = 100;  
const DISPERSION_RATIO = 0.5;
class Group {
  constructor(x, y, radius, idx) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.position = createVector(x, y); 
    this.idx = idx;

    this.agents = [];
    this.springs = [];
    this.initialize(radius);
    this.age = 0;
    this.inside = false;
    this.parent = null;
    this.children = [];
    this.dispersion_factor = 1;

  }

  initialize(radius) {
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

    for (let stride = 1; stride <= 3; stride++) {
      for (let i = 0; i < this.agents.length; i++) {
        const a = this.agents[i];
        const b = this.agents[(i + stride) % this.agents.length];
        const length = dist(a.position.x, a.position.y, b.position.x, b.position.y);
        this.springs.push(new Spring(a, b, length, 0.05));
      }
    }    
  }

  calculate_resolution(){
    let r = this.radius;
    let res = Math.floor(TWO_PI * r / (AGENT_RADIUS*2*SPACING_FACTOR));
    
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
    this.intersecting();
    this.constrain();
    
    let new_position = createVector(0,0)
    for(let agent of this.agents){
      this.disperse(agent);
      agent.update()
      agent.separating = false;
      new_position.add(agent.position);
    }

    this.position = new_position.copy().div(this.agents.length);
    this.age++;
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

  // FIX THE NAMING AND LOGIC
  wrong_logic(drop){
    if(drop === this) return false;

    let count = this.number_of_agents_in(drop);
    let it_works = (count == this.agents.length);

    if(it_works){
      console.log(drop.idx, "contains", this.idx);
      return true;
    } else {
      console.log(drop.idx, "does not contain", this.idx);
      return false;
    }

  }

  contains(drop){
    return drop.wrong_logic(this);
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

  draw() {
    if(debug){
      noFill();
      strokeWeight(2);
    } else {
      fill(palette[this.idx]);
      noStroke();
    }

    beginShape();
      for(let agent of this.agents){
        let v = agent.position;
        vertex(v.x, v.y);
      }
    endShape(CLOSE);

    if(debug){
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
    }
  }
}
