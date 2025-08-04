export interface MenuDropdownItem {
  id: string | number;
  text: string;
  icon: string;
  type?: 'image' | 'fontawesome';
  path?: string;
}

export interface MenuItem {
  id: string;
  text: string;
  icon: string;
  path?: string;
  dropdown?: MenuDropdownItem[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'casino',
    text: 'CASINO',
    icon: 'Coins', // Changed from 'Casino' to 'Coins'
    path: '/casino',
    dropdown: [
      { id: 'evo', text: 'Evolution Gaming', icon: '/src/assets/lobbies/evo.png', type: 'image', path: '/lobby?provider=evo' },
      { id: 'pragmatic', text: 'Pragmatic Play', icon: '/src/assets/lobbies/pragmatic.png', type: 'image', path: '/lobby?provider=pragmatic' },
      { id: 'microgaming', text: 'Microgaming', icon: '/src/assets/lobbies/microgaming.png', type: 'image', path: '/lobby?provider=microgaming' },
      { id: 'netent', text: 'NetEnt', icon: '/src/assets/lobbies/netent.jpg', type: 'image', path: '/lobby?provider=netent' },
      { id: 'playtech', text: 'Playtech', icon: '/src/assets/lobbies/playtech.png', type: 'image', path: '/lobby?provider=playtech' },
    ]
  },
  {
    id: 'nohu',
    text: 'NỔ HŨ',
    icon: 'Coins',
    path: '/nohu',
    dropdown: [
      { id: 'slot1', text: 'Classic Slots', icon: 'Cherry', path: '/nohu?type=classic' },
      { id: 'slot2', text: 'Video Slots', icon: 'Star', path: '/nohu?type=video' },
      { id: 'slot3', text: 'Progressive Slots', icon: 'Zap', path: '/nohu?type=progressive' },
      { id: 'slot4', text: 'Jackpot Slots', icon: 'Trophy', path: '/nohu?type=jackpot' },
    ]
  },
  {
    id: 'banca',
    text: 'BẮN CÁ',
    icon: 'Fish',
    path: '/banca',
    dropdown: [
      { id: 'fish1', text: 'Ocean Hunter', icon: 'Waves', path: '/banca?game=ocean' },
      { id: 'fish2', text: 'Fish World', icon: 'Fish', path: '/banca?game=world' },
      { id: 'fish3', text: 'Deep Sea', icon: 'Anchor', path: '/banca?game=deepsea' },
    ]
  },
  {
    id: 'thethao',
    text: 'THỂ THAO',
    icon: 'Trophy', // Changed from 'Football' to 'Trophy'
    path: '/thethao',
    dropdown: [
      { id: 'sports', text: 'Sports Betting', icon: '/src/assets/lobbies/sports.png', type: 'image', path: '/thethao?type=sports' },
      { id: 'football', text: 'Football', icon: 'Circle', path: '/thethao?sport=football' },
      { id: 'basketball', text: 'Basketball', icon: 'Circle', path: '/thethao?sport=basketball' },
      { id: 'tennis', text: 'Tennis', icon: 'Circle', path: '/thethao?sport=tennis' },
    ]
  },
  {
    id: 'gamebai',
    text: 'GAME BÀI',
    icon: 'Spade',
    path: '/gamebai',
    dropdown: [
      { id: 'poker', text: 'Poker', icon: 'Spade', path: '/gamebai?game=poker' },
      { id: 'blackjack', text: 'Blackjack', icon: 'Heart', path: '/gamebai?game=blackjack' },
      { id: 'baccarat', text: 'Baccarat', icon: 'Diamond', path: '/gamebai?game=baccarat' },
      { id: 'roulette', text: 'Roulette', icon: 'Circle', path: '/gamebai?game=roulette' },
    ]
  },
  {
    id: 'daga',
    text: 'ĐÁ GÀ',
    icon: 'Bird',
    path: '/daga',
    dropdown: [
      { id: 'live1', text: 'Live Arena 1', icon: 'Eye', path: '/daga?arena=1' },
      { id: 'live2', text: 'Live Arena 2', icon: 'Eye', path: '/daga?arena=2' },
      { id: 'live3', text: 'Live Arena 3', icon: 'Eye', path: '/daga?arena=3' },
    ]
  },
  {
    id: 'xoso',
    text: 'XỔ SỐ',
    icon: 'Ticket',
    path: '/xoso',
    dropdown: [
      { id: 'keno', text: 'Keno', icon: 'Hash', path: '/xoso?game=keno' },
      { id: 'lotto', text: 'Lotto', icon: 'Hash', path: '/xoso?game=lotto' },
      { id: 'powerball', text: 'Powerball', icon: 'Zap', path: '/xoso?game=powerball' },
    ]
  }
];