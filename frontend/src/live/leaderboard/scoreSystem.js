const scores = {}

export function addPoints(studentId, points) {

  if (!scores[studentId]) {
    scores[studentId] = 0
  }

  scores[studentId] += points

}

export function getLeaderboard() {

  const arr = Object.keys(scores).map(id => ({
    id,
    score: scores[id]
  }))

  arr.sort((a,b)=> b.score - a.score)

  return arr

}

export function getTopStudent() {

  const board = getLeaderboard()

  if(board.length === 0) return null

  return board[0].id

}