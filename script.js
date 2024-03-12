
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const $sprites = document.querySelector('#sprites')
const $bricks = document.querySelector('#bricks')

const scoreDisplay = document.createElement('div')

canvas.height = 400
canvas.width = 448

const playButton = document.querySelector('.play')
const pauseButton = document.querySelector('.pause')

// Variables de nuestro juego
let counter = 0
playButton.disabled = true

// Variables de la pelota
const ballRadius = 3
let x = canvas.width / 2
let y = canvas.height - 30

// Velocidad de la pelota
let dx = 1
let dy = -1

// Variables de la raqueta
const paddleHeight = 10
const paddleWidth = 50

let paddleX = (canvas.width - paddleWidth) / 2
let paddleY = canvas.height - paddleHeight - 20

let rightPressed = false
let leftPressed = false

const paddleSpeed = 2

// Variables de los ladrillos
let totalScore = 0
let score = 0

const brickRowCount = 6
const brickColumnCount = 12

const brickWidth = 32
const brickHeight = 16

const brickPadding = 1
const brickOffsetTop = 80
const brickOffsetLeft = 25
const bricks = []

const BRICK_STATUS = {
  ACTIVE: 1,
  DESTROYED: 0
}



// Generar ladrillos
for (let column = 0; column < brickColumnCount; column++) {
  // Creamos un array por columna
  bricks[column] = [];

  // Iteramos por las filas
  for (let row = 0; row < brickRowCount; row++) {
    // Calculamos la posición X y Y del ladrillo
    const brickX = column * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = row * (brickHeight + brickPadding) + brickOffsetTop;

    // Generamos un número aleatorio para color
    const random = Math.floor(Math.random() * 8);

    // Creamos un objeto para cada ladrillo
    bricks[column][row] = {
      x: brickX,
      y: brickY,
      status: BRICK_STATUS.ACTIVE, // Activado
      color: random // Número aleatorio para el color
    };
  }
}

/**
 * Dibuja la bola en la pantalla
 */
function drawBall() {
    ctx.beginPath();  // Inicio del camino
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);  // Dibuja la bola
    ctx.fillStyle = '#fff';  // Color de la bola
    ctx.fill();  // Dibuja la bola
    ctx.closePath();  // Cierra el camino
}

/**
 * Dibuja la raqueta en la pantalla
 */
function drawPaddle() {
    ctx.fillStyle = '#fff';  // Color de la raqueta
    ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);  // Dibuja la raqueta

    ctx.drawImage(
        $sprites,  // Imagen de la que se saca el sprite
        29,  // clipX Coordenada de inicio de donde se saca el sprite
        174,  // clipY Coordenada de inicio de donde se saca el sprite
        paddleWidth,  // El tamaño del dibujo
        paddleHeight,  // El tamaño del dibujo
        paddleX,  // Posición X del dibujo
        paddleY,  // Posición Y del dibujo
        paddleWidth,  // Ancho del dibujo
        paddleHeight  // Alto del dibujo
    );
}

function drawBricks() {
    /*
     * Dibujamos todas las casillas
     */
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r]
            /*
             * Si la casilla ya ha sido destruida, saltamos a la siguiente
             */
            if (currentBrick.status === BRICK_STATUS.DESTROYED) {
                continue;
            }

            const clipX = currentBrick.color * 32
            ctx.drawImage(
                $bricks,
                clipX, /* clip x */
                0, /* clip y */
                brickWidth, /* clip width */
                brickHeight, /* clip height */
                currentBrick.x, /* dest x */
                currentBrick.y, /* dest y */
                brickWidth, /* dest width */
                brickHeight /* dest height */
            )
        }
    }
}


function collisionDetection() {
    /*
     * Revisamos si la pelota está tocando el lateral del canvas
     */
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx
    }
    /*
     * Revisamos si la pelota está tocando el borde superior del canvas
     */
    if (y + dy < ballRadius) {
        dy = -dy
    }


    /*
     * Revisamos antes de que toque el final del camnvas si ha tocado la raqueta
     */

    const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth
    /*
     * Revisamos si la pelota está tocando la raqueta
     */
    const isBallTouchingPaddle = y + dy > paddleY && y + dy < paddleY + paddleHeight

    if (isBallSameXAsPaddle && isBallTouchingPaddle) {
        dy = -dy // Cambiamos direccion de la pelota
    }
    else if (y + dy > canvas.height - ballRadius) {
        console.log('GAME OVER')
        playButton.disabled = false
        //stop the game
        //document.location.reload()
    }

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r]
            /*
             * Si la casilla ya ha sido destruida, saltamos a la siguiente
             */
            if (currentBrick.status === BRICK_STATUS.DESTROYED) {
                continue;
            }

            const isBallSameXAsBrick = x > currentBrick.x && x < currentBrick.x + brickWidth
            const isBallSameYAsBrick = y > currentBrick.y && y < currentBrick.y + brickHeight


            if (isBallSameXAsBrick && isBallSameYAsBrick) {
                dy = -dy

                score = (currentBrick.color + 1) * 10
                totalScore += score
                /*
                 * Incrementamos el contador de puntos
                 */
                console.log(totalScore)
                /*
                 * Actualizamos el texto con el nuevo puntaje
                 */
                document.getElementById("score").textContent = totalScore;
                /*
                 * Agregamos el texto de puntaje temporalmente al body
                 */
                document.body.appendChild(scoreDisplay)
                /*
                 * Limpiamos el texto de puntaje después de 500ms
                 */
                setTimeout(() => document.body.removeChild(scoreDisplay), 500)

                currentBrick.status = BRICK_STATUS.DESTROYED

            }
        }
    }
}
       


/* Función encargada de mover la pelota */
function moverBall() {
    x += dx;
    y += dy;
}


/* Función encargada de mover la raqueta */
function moverPaddle() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    }
    else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }
}


/* Función encargada de borrar el canvas y limpiar la pantalla */
function limpiarCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/* Función encargada de inicializar los eventos de teclado */
function inicializarEventos() {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(event) {
        const { key } = event;
        if (key === 'Right' || key === 'ArrowRight') {
            rightPressed = true;
        }
        else if (key === 'Left' || key === 'ArrowLeft') {
            leftPressed = true;
        }
    }


    function keyUpHandler(event) {
        const { key } = event;
        if (key === 'Right' || key === 'ArrowRight') {
            rightPressed = false;
        }
        else if (key === 'Left' || key === 'ArrowLeft') {
            leftPressed = false;
        }
    }


    playButton.addEventListener('click', () => {
        document.location.reload();
    });

}


/*
 * Función encargada de dibujar la animación
 * requestAnimationFrame llama a la función draw cada vez que
 * el navegador este listo para renderizar algo
 * por eso se llama en el metodo draw
 */
function dibujar() {
    limpiarCanvas();

    // dibujar elementos
    drawBall();
    drawPaddle(); 
    drawBricks();

    //colisiones y movimientos
   collisionDetection();
   moverBall();
   moverPaddle();

    window.requestAnimationFrame(dibujar);
}

dibujar();
inicializarEventos();
initEvents()
