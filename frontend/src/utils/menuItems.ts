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
  type?: 'image' | 'fontawesome';
}

export const menuItems: MenuItem[] = [
  {
    id: 'casino',
    text: 'CASINO',
    icon: '/lovable-uploads/de3e3037-01f8-42a0-9ec3-cd3a105f3f71.png',
    type: 'image',
    path: '/casino',
    dropdown: [
      { id: 20, text: 'EVO Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/evo.png', type: "image" },
      { id: 5, text: 'BG Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/bg.png', type: "image" },
      { id: 7, text: 'SE Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/se.png', type: "image" },
      { id: 19, text: 'SA Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/sa.png', type: "image" },
      { id: 28, text: 'AB Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/ab.png', type: "image" },
      { id: 33, text: 'GD Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/gd.png', type: "image" },
      { id: 38, text: 'PP Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/pp.png', type: "image" },
      { id: 1019, text: 'YB Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/yb.png', type: "image" },
      { id: 1021, text: 'OG Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/og.png', type: "image" },
      { id: 1024, text: 'AFB Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/afb.png', type: "image" },
    ]
  },
  {
    id: 'nohu',
    text: 'NỔ HŨ',
    icon: '/lovable-uploads/7190c282-59db-4f45-95b5-19ad77174422.png',
    type: 'image',
    path: '/nohu',
    dropdown: [
      { id: 2, text: 'CQ9 Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/cq9.png', type: "image" },
      { id: 3, text: 'PP Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/pp.png', type: "image" },
      { id: 13, text: 'WM Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/wm.png', type: "image" },
      { id: 14, text: 'SBO Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/sbo.png', type: "image" },
      { id: 16, text: 'FK Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/fg.png', type: "image" },
      { id: 22, text: 'YG Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/yg.png', type: "image" },
      { id: 29, text: 'MG Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/mg.png', type: "image" },
      { id: 35, text: 'PG Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/pg.png', type: "image" },
      { id: 1010, text: 'YGR Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/ygr.png', type: "image" },
      { id: 1018, text: 'PT Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/pt.png', type: "image" },
      { id: 1020, text: 'JIL Điện tử', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/jili.png', type: "image" },
    ]
  },
  {
    id: 'banca',
    text: 'BẮN CÁ',
    icon: '/lovable-uploads/ca245fec-f6bb-49eb-92b4-867d65591308.png',
    type: 'image',
    path: '/banca',
    dropdown: [
      { id: 1020, text: 'JIL Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/jili.png', type: "image" },
      { id: 1012, text: 'TCG Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/tcg.png', type: "image" },
    ]
  },
  {
    id: 'thethao',
    text: 'THỂ THAO',
    icon: '/lovable-uploads/f4f2c744-94ef-4340-a202-577d71ae9fe4.png',
    type: 'image',
    path: '/thethao',
    dropdown: [
      { id: 44, text: 'SABA Thể Thao', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/saba.png', type: "image" },
      { id: 1015, text: 'AFB Thể Thao', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/afb.png', type: "image" },
      { id: 1022, text: 'BTI Thể Thao', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/bti.png', type: "image" },
      { id: 1053, text: 'PANDA Thể Thao', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/pd.png', type: "image" },
      { id: 1070, text: 'WS168 Thể Thao', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/ws168.png', type: "image" },
      { id: 1080, text: 'LUCKY Thể Thao', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/lk.png', type: "image" },
      { id: 1086, text: 'APG Thể Thao', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/apg.png', type: "image" }
    ]
  },
  {
    id: 'gamebai',
    text: 'GAME BÀI',
    icon: '/lovable-uploads/78123f22-e96e-4ad4-842e-3d3b9e9db79e.png',
    type: 'image',
    path: '/gamebai',
    dropdown: [
      { id: 10, text: 'JOKER Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/jg.png', type: "image" },
      { id: 1011, text: 'Mipoker Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/mp.png', type: "image" },
      { id: 1013, text: 'JGR Trực tuyến', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/jgr.png', type: "image" },
    ]
  },
  {
    id: 'daga',
    text: 'ĐÁ GÀ',
    icon: '/lovable-uploads/5d52ec90-de21-4da7-bea3-b529b5a8bf20.png',
    type: 'image',
    path: '/daga',
    dropdown: [
      { id: 1001, text: 'WS168 Đá Gà', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/ws168.png', type: "image" },
      { id: 1002, text: 'AOG Đá Gà', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/aog.png', type: "image" },
    ]
  },
  {
    id: 'xoso',
    text: 'XỔ SỐ',
    icon: '/lovable-uploads/d0bb457d-1803-4367-87c4-62402a5bc566.png',
    type: 'image',
    path: '/xoso',
    dropdown: [
      { id: 1003, text: 'TC XỔ SỐ', icon: 'https://qk3x72.katawee.net/system-requirement/Web.Portal/_Common/Supplier/30x30/tcg.png', type: "image" },
    ]
  },
];