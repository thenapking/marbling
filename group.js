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
      v.mult(0.5)
      let agent = new Agent(p, v, this);
      this.agents[i] = agent;
    }
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

    // beginShape();
    //   for(let agent of this.agents){
    //     let v = agent.position;
    //     vertex(v.x, v.y);
    //   }
    // endShape(CLOSE);

    if(debug){
      fill(palette[this.idx]);
      for(let agent of this.agents){
        let v = agent.position;
        circle(v.x, v.y, agent.radius * 2);
      }
    }
  }
}
