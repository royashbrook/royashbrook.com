// games, used by the home teaser + /games + /llms.txt.
// small browser games, each on its own <name>.royashbrook.com PWA origin, free forever.
// hand-listed (they are not in Roy's tool topic). links render in order: play, repo.
export const games = [
  {
    name: 'quarry',
    desc: 'mine rocks, fill your pack, sell, upgrade, dig deeper.',
    play: 'https://quarry.royashbrook.com',
    repo: 'https://github.com/royashbrook/quarry',
  },
  {
    name: 'scoopaloo',
    desc: 'run a fast, cheerful ice cream stand, one shift at a time.',
    play: 'https://scoopaloo.royashbrook.com',
    repo: 'https://github.com/royashbrook/scoopaloo',
  },
  {
    name: 'sort it',
    desc: 'a cosy sorting puzzle.',
    play: 'https://sortit.royashbrook.com',
    repo: 'https://github.com/royashbrook/sortit',
  },
  {
    name: 'shoot it',
    desc: 'grow your crowd through maths gates, pop the slimes.',
    play: 'https://shootit.royashbrook.com',
    repo: 'https://github.com/royashbrook/shootit',
  },
  {
    name: 'craft rush',
    desc: 'a blocky crowd-runner. grow your mob, blast creepers, beat the boss.',
    play: 'https://craftrush.royashbrook.com',
    repo: 'https://github.com/royashbrook/craftrush',
  },
  {
    name: 'quantamari',
    desc: 'roll up the scale of everything, from below known physics to beyond the observable universe.',
    play: 'https://quantamari.royashbrook.com',
    repo: 'https://github.com/royashbrook/quantamari',
  },
];

// the link types in display order, for the card meta + llms.txt.
export const gameLinkOrder = ['play', 'repo'];
