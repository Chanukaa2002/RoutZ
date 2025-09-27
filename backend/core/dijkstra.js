const dijkstra = (map, start, end) => {
  const distances = {};
  const prev = {};
  const visited = {};

  for (let node in map) {
    distances[node] = Infinity;
    prev[node] = null;
  }
  if (!(start in map) || !(end in map)) {
    return {
      path: [],
      distance: Infinity,
      error: "Invalid start or end",
    };
  }
  distances[start] = 0;

  while (true) {
    let closest = null;
    for (let node in distances) {
      if (
        !visited[node] &&
        (closest === null || distances[node] < distances[closest])
      ) {
        closest = node;
      }
    }
    if (closest === null) break;

    visited[closest] = true;

    const neighbors = map[closest];
    for (let neighbor in neighbors) {
      const w = neighbors[neighbor];
      const newDist = distances[closest] + w;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        prev[neighbor] = closest;
      }
    }
  }

  const path = [];
  let cur = end;
  if (distances[end] === Infinity) {
    return {
      path: [],
      distance: Infinity,
      error: "No Path find",
    };
  }
  while (cur != null) {
    path.unshift(cur);
    cur = prev[cur];
  }

  return {
    path,
    distance: distances[end],
  };
};

export default dijkstra;
