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
    this.springs = [];
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
      this.agents.push(agent);
    }

    for (let stride = 1; stride <= 3; stride++) {
      for (let i = 0; i < this.agents.length; i++) {
        const a = this.agents[i];
        const b = this.agents[(i + stride) % this.agents.length];
        const length = dist(a.position.x, a.position.y, b.position.x, b.position.y);
        this.springs.push(new Spring(a, b, length, 0.2));
      }
    }

    
  }

  calculate_resolution(){
    let r = this.radius;
    let res = Math.floor(TWO_PI * r / (AGENT_RADIUS*2*SPACING_FACTOR));
    
    return res;
  }


  update(){
    this.intersecting();

    for(let spring of this.springs){
      spring.update();
    }

    for(let agent of this.agents){
      agent.update()
      agent.separating = false;
    }
  }

  intersecting(){
    let n = this.agents.length;
    for(let drop of drops){
      if(drop === this) continue; 
      let count = 0;
      for (let agent of this.agents) {
        if (this === agent) continue;

        if(agent.in(drop)){
          count++;
        }
      }
      if(count > 0 && count < n){
        for(let agent of this.agents){
          agent.separating = true;
        }
        return true;
      }
    }
    return false;
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
        agent.draw();
      }

      noFill();
      strokeWeight(1);
      for(let spring of this.springs){
        spring.draw();
      }
    }
  }
}
