const canvas = document.querySelector('canvas')

console.log(canvas)

const ctx = canvas.getContext('2d')
const dpr = window.devicePixelRatio

console.log(ctx)
console.log(dpr)

const canvasWidth = innerWidth
const canvasHeight = innerHeight

canvas.style.width = canvasWidth + 'px'
canvas.style.height = canvasHeight + 'px'

canvas.width = canvasWidth * dpr
canvas.height = canvasHeight * dpr
ctx.scale(dpr, dpr)

const feGaussianBlur = document.querySelector('feGaussianBlur')
const feColorMatrix = document.querySelector('feColorMatrix')

const controls = new function(){
  this.blurValue = 40
  this.alphaChannel = 100
  this.alphaOffeset = -23
  this.acc = 1.03
}

let gui = new dat.GUI()

const f1 = gui.addFolder('Gooey Effect')
const f2 = gui.addFolder('Particle Property')
f1.open()
f2.open()

f1.add(controls, 'blurValue', 0, 100).onChange(value => {
  feGaussianBlur.setAttribute('stdDeviation', value)
})
f1.add(controls, 'alphaChannel', 1, 200).onChange(value => {
  feColorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${value} ${controls.alphaOffeset}')
})
f1.add(controls, 'alphaOffeset', -40, 40).onChange(value => {
  feColorMatrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${controls.alphaChannel} ${value}')
})
f2.add(controls, 'acc', 1, 1.5, 0.01).onChange(value => {
  particles.forEach(particle => particle.acc = value)
})

// 사각형 그리기 : fillRect
// ctx.fillRect(10, 10, 50, 50)

// 원 그리기
// 1. beginPath로 시작
// 2. arc매서드 작성(시작하는 x위치, 시작하는 y위치, 반지름, 시작각도, 끝나는각도, 반/시계방향)
// 3. fill 혹은 stroke
// 4. clothPath로 마무리

class Particle {
  constructor(x, y, radius, vy) {
    this.x = x
    this.y = y
    this.radius = radius
    this.vy = vy
    this.acc = 1.01 //1이하는 브레이크하듯이 멈추고 1이상은 가속도를 받아 빨라짐
  }
  update(){
    this.vy *= this.acc //가속도부분
    this.y += this.vy
  }
  draw(){
    ctx.beginPath()
    ctx.arc(this.x, this.y,this.radius, 0, Math.PI / 180 * 360)
    ctx.fillStyle = 'orange' //fill의 스타일 지정
    ctx.fill()
    ctx.closePath()
  }
}

// const x = 100
// const y = 100
// const radius = 50
// const particle = new Particle(x, y, radius)
const TOTAL = 20
const randomNumBetween = (min, max) => {
  return Math.random() * (max - min + 1) + min
}

let particles = []

for (let i = 0; i < TOTAL; i++){
  const x = randomNumBetween(0, canvasWidth)
  const y = randomNumBetween(0, canvasHeight)
  const radius = randomNumBetween(50, 100)
  const vy = randomNumBetween(1, 5)
  const particle = new Particle(x, y, radius, vy)
  particles.push(particle)
}
console.log(particles)

// fps의 조건을 설정을 위한 변수 세팅
let interval = 1000 / 60
let now, delta
let then = Date.now()

// 애니메이션 효과 삽입 : 매번 지우고 새로 그리는 애니메이션 작동 중 (보이지는 않고있음)
function animate(){
  window.requestAnimationFrame(animate)
  // fps의 조건을 설정
  now = Date.now()
  delta = now - then

  if (delta < interval) return

  // "새로" 그려지는 행위를 위해서 삽입하는 코드(즉 지우는 코드)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  // 1초에 x를 1px 이동시키기 -> 모든 모니터마다 같은 결과물을 출력시키기 위해서는(다른 주사율에서도) fps의 조건을 설정해줘야 함
  // particle.y += 1
  // particle.draw()

  particles.forEach(particle => {
    particle.update()
    particle.draw()

    if (particle.y - particle.radius> canvasHeight) {
      particle.y = -particle.radius
      particle.x = randomNumBetween(0, canvasWidth)
      particle.radius = randomNumBetween(50, 100)
      particle.vy = randomNumBetween(1, 5)
    }
  })

  then = now - (delta % interval)
}

animate()