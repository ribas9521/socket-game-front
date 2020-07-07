import PlayerInterface from './types'
import Matter from "matter-js";

class Player implements PlayerInterface {

  public x: number;
  public y: number;
  public id: string
  public body: Matter.Body
  public speed: number

  constructor(x: number, y: number, id: string) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.speed = 5;
    this.body = Matter.Bodies.circle(
      x,
      y,
      20,
      {
        isStatic: false,
      }
    );
    this.body.label = id
  }

  getSpawnedBody(engine: Matter.Engine): Matter.Body {
    return engine.world.bodies.filter((body) => body.label === this.id)[0]
  }

  moveUp(engine: Matter.Engine): void {
    const vector = Matter.Vector.create(0, -1 * this.speed);
    Matter.Body.setVelocity(this.getSpawnedBody(engine), vector);
  }
  moveDown(engine: Matter.Engine): void {
    const vector = Matter.Vector.create(0, 1 * this.speed);
    Matter.Body.setVelocity(this.getSpawnedBody(engine), vector);
  }
  moveLeft(engine: Matter.Engine): void {
    const vector = Matter.Vector.create(-1 * this.speed, 0);
    Matter.Body.setVelocity(this.getSpawnedBody(engine), vector);
  }
  moveRight(engine: Matter.Engine): void {
    const vector = Matter.Vector.create(1 * this.speed, 0);
    Matter.Body.setVelocity(this.getSpawnedBody(engine), vector);
  }
}

export default Player