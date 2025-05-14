const AGENT_RADIUS = 5;
const desiredSeparation = 10;
const MAX_SPEED = 3;
const MAX_FORCE = 0.1;
const SEPARATION = 1.5
class Agent {
  constructor(position, velocity, group) {
    this.position = position.copy();
    this.group = group;

    this.velocity = velocity.copy();
    this.acceleration = createVector(0, 0);
    this.radius  = AGENT_RADIUS;
  }

  separation() {
    let steer = createVector(0, 0);
    let count = 0;
    
    for(let drop of drops){
      for (let other of drop.agents) {
        if (other === this) continue;
    
        // vector from other→b
        let diff = p5.Vector.sub(this.position, other.position);
    
        if      (diff.x >  width/2) diff.x -= width;
        else if (diff.x < -width/2) diff.x += width;
        if      (diff.y >  height/2) diff.y -= height;
        else if (diff.y < -height/2) diff.y += height;
    
        let d = diff.mag();
        if (d > 0 && d < this.radius * 2) {
          diff.normalize().div(d);
          steer.add(diff);
          count++;
        }
      }
    }
  
    if (count > 0) {
      steer.div(count);
      steer.setMag(MAX_SPEED).sub(this.velocity).limit(MAX_FORCE);
    }
    return steer;
  }

  update(){
    let separation = this.separation(this).mult(SEPARATION); 
    this.velocity.add(separation);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    this.position.x = (this.position.x + width) % width;
    this.position.y = (this.position.y + height) % height;

    this.velocity.mult(0.95);
  }

}

