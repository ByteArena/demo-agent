const { vector: { Vector2 }, comm } = require('bytearena-sdk');

const computeAvoidanceForce = require('./computeAvoidanceForce');

process.on('SIGTERM', () => process.exit());

function move({ perception, sendMoves }) {
    const avoidanceForce = computeAvoidanceForce(perception);
    const speed = avoidanceForce.mag() > 0 ? perception.specs.maxSpeed / 3 : perception.specs.maxSpeed;
    const seekingForce = new Vector2(Math.random() * 30 * (Math.random() > .5 ? -1 : 1), Math.random() * 30 * (Math.random() > .5 ? -1 : 1));

    const moves = [];

    steering = (new Vector2())
        .add(avoidanceForce.clone().mag(100))
        .add(seekingForce.clone().mag(1))
        .mag(speed);

    moves.push({ Method: 'steer', Arguments: steering.toArray(5) });
    moves.push({ Method: 'shoot', Arguments: [0, 10] });

    // Pushing batch of mutations
    sendMoves(moves)
    .catch(err => { console.error(err); });
}

comm.connect(
    process.env.PORT,
    process.env.HOST,
    process.env.AGENTID
)
.then(({ onTick, onClose }) => {
    onTick(move)

    onClose(() => {
        console.log("CLOSING")
    })
});

// setInterval(function() {
//     throw new Error("I'm dead")
// }, 3000)
