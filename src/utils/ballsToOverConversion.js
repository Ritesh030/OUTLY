const ballsToOvers = (balls) => {
    const overs = Math.floor(balls / 6)
    const remainingBalls = balls % 6
    return overs + (remainingBalls / 6)  
}

module.exports = {
      ballsToOvers
}