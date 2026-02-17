import { PlanetConfig, Star, Asteroid } from './types';

export const PLANETS: PlanetConfig[] = [
  { 
    name: "Matahari", 
    color: "#FDB813", 
    colors: ["#FFFFFF", "#FDB813", "#FF8C00", "#FF4500"], // Core to Corona
    radius: 25, 
    distance: 0, 
    eccentricity: 0,
    speed: 0, 
    description: "Matahari adalah bintang Tipe G (Yellow Dwarf) di pusat Tata Surya. Suhunya mencapai 15 juta derajat Celsius di inti. Massanya menyumbang 99,86% dari total massa tata surya, mengikat semua planet dengan gravitasinya.", 
    type: "star",
    diameter: "1.392.700 km",
    temp: "5.500°C (Fotosfer)",
    dayLength: "25-35 Hari (Rotasi Diferensial)",
    yearLength: "230 Juta Tahun (Orbit Galaksi)",
    funFact: "Cahaya Matahari butuh 8 menit 20 detik untuk sampai ke Bumi."
  },
  { 
    name: "Merkurius", 
    color: "#A5A5A5", 
    colors: ["#EBEBEB", "#A5A5A5", "#707070"],
    radius: 4, 
    distance: 0.39, 
    eccentricity: 0.205, // Orbit sangat lonjong
    speed: 4.1, 
    description: "Planet terdekat dengan Matahari. Permukaannya berlubang-lubang akibat meteorit, mirip Bulan. Karena tidak memiliki atmosfer yang berarti, suhu ekstrem terjadi antara siang (430°C) dan malam (-180°C).", 
    type: "planet",
    diameter: "4.879 km",
    temp: "-173°C hingga 427°C",
    dayLength: "58,6 Hari Bumi",
    yearLength: "88 Hari Bumi",
    funFact: "Orbit Merkurius adalah yang paling eksentrik (lonjong) dari semua planet utama."
  },
  { 
    name: "Venus", 
    color: "#E3BB76", 
    colors: ["#FDF0D5", "#E3BB76", "#C79D55"],
    radius: 7, 
    distance: 0.72, 
    eccentricity: 0.007,
    speed: 1.6, 
    description: "Diselimuti awan asam sulfat tebal yang memantulkan cahaya matahari, menjadikannya objek paling terang kedua di langit malam. Efek rumah kaca yang tak terkendali membuatnya menjadi planet terpanas.", 
    type: "planet",
    diameter: "12.104 km",
    temp: "462°C (Konstan)",
    dayLength: "243 Hari Bumi (Retrograde)",
    yearLength: "225 Hari Bumi",
    funFact: "Venus berotasi dari timur ke barat, kebalikan dari planet lainnya."
  },
  { 
    name: "Bumi", 
    color: "#2255AA", 
    colors: ["#1A3B70", "#2E66A5", "#4B90D6", "#68A86C"], // Ocean, Shallow, Atmosphere, Land hint
    radius: 7.5, 
    distance: 1.00, 
    eccentricity: 0.017,
    speed: 1.0, 
    description: "Satu-satunya planet yang diketahui menunjang kehidupan. Memiliki atmosfer kaya nitrogen dan oksigen, serta medan magnet kuat yang melindunginya dari radiasi surya.", 
    type: "planet",
    diameter: "12.742 km",
    temp: "14°C (Rata-rata)",
    dayLength: "23 Jam 56 Menit",
    yearLength: "365,25 Hari",
    funFact: "Bumi adalah planet dengan densitas (kepadatan) tertinggi di Tata Surya.",
    moons: [
      { 
        name: "Bulan", 
        radius: 2, 
        distance: 14, 
        speed: 12, 
        color: "#CFCFCF",
        description: "Terkunci secara pasang surut dengan Bumi, sehingga selalu memperlihatkan wajah yang sama." 
      }
    ]
  },
  { 
    name: "Mars", 
    color: "#D14A28", 
    colors: ["#E27B58", "#C1440E", "#8B3015"],
    radius: 5, 
    distance: 1.52, 
    eccentricity: 0.094,
    speed: 0.53, 
    description: "Planet berdebu dan dingin dengan atmosfer tipis karbon dioksida. Warna merahnya berasal dari oksida besi (karat) di permukaannya. Memiliki ngarai Valles Marineris yang membentang sejarak Los Angeles ke New York.", 
    type: "planet",
    diameter: "6.779 km",
    temp: "-63°C (Rata-rata)",
    dayLength: "24 Jam 37 Menit",
    yearLength: "687 Hari Bumi",
    funFact: "Memiliki Olympus Mons, gunung berapi setinggi 21 km, tiga kali tinggi Everest.",
    moons: [
      { name: "Phobos", radius: 0.9, distance: 9, speed: 18, color: "#AA9988", description: "Bulan berbentuk kentang yang mengorbit sangat dekat." },
      { name: "Deimos", radius: 0.7, distance: 14, speed: 14, color: "#998877", description: "Lebih kecil dan lebih jauh dari Phobos." }
    ]
  },
  { 
    name: "Jupiter", 
    color: "#D9A066", 
    colors: ["#E3DCCB", "#D9A066", "#C88B3A", "#A16A38"], // Banded structure
    radius: 18, 
    distance: 5.20, 
    eccentricity: 0.049,
    speed: 0.084, 
    description: "Raksasa gas yang didominasi hidrogen dan helium. Tidak memiliki permukaan padat. Pola awan ikoniknya disebabkan oleh angin kencang yang bertiup berlawanan arah (zona dan sabuk).", 
    type: "planet",
    diameter: "139.820 km",
    temp: "-108°C",
    dayLength: "9 Jam 56 Menit",
    yearLength: "11,86 Tahun Bumi",
    funFact: "Jupiter menyusut sekitar 2 cm setiap tahun karena memancarkan lebih banyak panas daripada yang diterima dari Matahari.",
    moons: [
      { name: "Io", radius: 1.5, distance: 24, speed: 8, color: "#D4C06A", description: "Vulkanik aktif." },
      { name: "Europa", radius: 1.3, distance: 30, speed: 6, color: "#B8C9D9", description: "Permukaan es dengan lautan di bawahnya." },
      { name: "Ganymede", radius: 2.0, distance: 38, speed: 4, color: "#8E8276", description: "Bulan terbesar." },
      { name: "Callisto", radius: 1.8, distance: 46, speed: 2, color: "#63584F", description: "Permukaan berkawah tua." }
    ]
  },
  { 
    name: "Saturnus", 
    color: "#EDD59E", 
    colors: ["#F4E2B5", "#EDD59E", "#D4C28D"],
    radius: 15, 
    distance: 9.58, 
    eccentricity: 0.056,
    speed: 0.034, 
    description: "Permata tata surya dengan sistem cincin yang kompleks. Cincinnya terdiri dari miliaran partikel es dan batuan, mulai dari ukuran debu hingga sebesar rumah.", 
    type: "planet", 
    hasRing: true,
    diameter: "116.460 km",
    temp: "-139°C",
    dayLength: "10 Jam 42 Menit",
    yearLength: "29,45 Tahun Bumi",
    funFact: "Angin di Saturnus bisa mencapai kecepatan 1.800 km/jam, jauh lebih cepat daripada di Jupiter.",
    moons: [
      { name: "Titan", radius: 1.9, distance: 38, speed: 3, color: "#D9B850", description: "Memiliki atmosfer tebal dan danau metana." },
      { name: "Rhea", radius: 1.0, distance: 26, speed: 5, color: "#AFAFAF", description: "Bulan es yang padat." }
    ]
  },
  { 
    name: "Uranus", 
    color: "#93B8BE", 
    colors: ["#D1F2F5", "#93B8BE", "#6DA1A8"],
    radius: 10, 
    distance: 19.22, 
    eccentricity: 0.046,
    speed: 0.011, 
    description: "Raksasa es dengan atmosfer yang mengandung air, amonia, dan metana. Suhunya sangat dingin dan merupakan planet dengan atmosfer terdingin di tata surya.", 
    type: "planet",
    diameter: "50.724 km",
    temp: "-197°C",
    dayLength: "17 Jam 14 Menit",
    yearLength: "84 Tahun Bumi",
    funFact: "Berotasi menyamping (kemiringan sumbu 98°), mungkin akibat tabrakan besar di masa lalu.",
    moons: [
      { name: "Titania", radius: 1.1, distance: 22, speed: 4, color: "#C0C0C0", description: "Bulan terbesar Uranus." },
      { name: "Oberon", radius: 1.0, distance: 28, speed: 3, color: "#A0A0A0", description: "Bulan terjauh." }
    ]
  },
  { 
    name: "Neptunus", 
    color: "#3E54E8", 
    colors: ["#5D73F3", "#3E54E8", "#2A3BA8"],
    radius: 10, 
    distance: 30.05, 
    eccentricity: 0.009,
    speed: 0.006, 
    description: "Planet terjauh ini berwarna biru tua pekat karena metana. Memiliki sistem cuaca yang sangat dinamis dengan badai gelap yang muncul dan menghilang.", 
    type: "planet",
    diameter: "49.244 km",
    temp: "-201°C",
    dayLength: "16 Jam 6 Menit",
    yearLength: "164,8 Tahun Bumi",
    funFact: "Gravitasi Neptunus mengganggu orbit Uranus, yang menjadi petunjuk bagi penemuannya.",
    moons: [
      { name: "Triton", radius: 1.4, distance: 22, speed: -4, color: "#D1E2EA", description: "Mengorbit berlawanan arah (retrograde)." }
    ]
  }
];

export const generateStars = (count: number): Star[] => {
  const stars: Star[] = [];
  const starColors = ["#FFFFFF", "#D6EBFF", "#FFF4D6", "#FFDAB8"]; // White, Blue-ish, Yellow-ish, Red-ish
  for(let i=0; i<count; i++) {
    stars.push({
      x: Math.random() * 4000 - 2000,
      y: Math.random() * 4000 - 2000,
      size: Math.random() * 1.5 + 0.2,
      opacity: Math.random() * 0.8 + 0.2,
      color: starColors[Math.floor(Math.random() * starColors.length)]
    });
  }
  return stars;
};

export const generateAsteroids = (count: number): Asteroid[] => {
  const asteroids: Asteroid[] = [];
  for(let i=0; i<count; i++) {
    // Belt between Mars (1.52) and Jupiter (5.20)
    // Scaled roughly for visualization
    const minDist = 2.2;
    const maxDist = 3.2;
    const distance = Math.random() * (maxDist - minDist) + minDist;
    
    asteroids.push({
      angle: Math.random() * Math.PI * 2,
      distance: distance,
      speed: (1 / Math.sqrt(distance)) * 4,
      size: Math.random() * 1.5 + 0.5,
      offset: Math.random() * 0.2
    });
  }
  return asteroids;
};