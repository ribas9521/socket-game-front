export default interface PlayerInterface {
  id: string,
  x: number,
  y: number,
  body: Matter.Body
  speed?: number
  moveUp: (engine: Matter.Engine) => void
  moveDown: (engine: Matter.Engine) => void
  moveLeft: (engine: Matter.Engine) => void
  moveRight: (engine: Matter.Engine) => void
}
