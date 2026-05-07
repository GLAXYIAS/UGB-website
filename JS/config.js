export const games = [
  {
    id: "slope",
    title: "Slope",
    url: "Games/slope/index.html",
    desc: "A fast-paced 3D platformer. Avoid obstacles and stay on the track as you accelerate down the neon slope!",
    tags: ["3D", "Action", "Runner"],
    popular: true
  }
];

export function getMostPopular() {
    return games.filter(game => game.popular);
}
