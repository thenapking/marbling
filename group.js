const RES = 200;
const SPACING_FACTOR = 1.25;
class Group {
  constructor(x, y, radius, idx) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.position = createVector(x, y); 
    this.idx = idx;

    this.agents = [];
    this.initialize(radius);

  }

  initialize(radius) {
    let resolution = this.calculate_resolution();
    for (let i = 0; i < resolution; i++) {
      let angle = map(i, 0, resolution, 0, TWO_PI);
      let p = createVector(cos(angle), sin(angle));
      p.mult(radius).add(this.position);
      let v = createVector(cos(angle), sin(angle))
      v.mult(2)
      let agent = new Agent(p, v, this);
      this.agents[i] = agent;
    }
  }

  resample(){
    let vertices = [];
    let prev = this.agents[this.agents.length - 1].position;
    for(let i = 0; i < this.agents.length; i++){
      let agent = this.agents[i];
      let v = agent.position;
      if(v.dist(prev) > AGENT_RADIUS*4){
        let new_position = p5.Vector.lerp(v, prev, 0.5)
        let velocity_mag  = agent.dispersion_velocity.mag();
        let new_velocity = p5.Vector.sub(new_position, this.position).normalize().mult(velocity_mag);
        let new_agent = new Agent(new_position, new_velocity, this);
        vertices.push(new_agent);
      }
      vertices.push(agent);
      prev = v;
    }
    this.agents = vertices;
  }

  calculate_resolution(){
    let r = this.radius;
    let res = Math.floor(TWO_PI * r / (AGENT_RADIUS*2*SPACING_FACTOR));
    
    return res;
  }


  update(){
    for(let agent of this.agents){
      agent.update()
    }
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
        let v = agent.position;
        circle(v.x, v.y, agent.radius * 2);
      }
    }
  }
}
