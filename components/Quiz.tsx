import React, { useState } from 'react';
import { SpaceAudio } from '../audio';
import { 
  X, Award, HelpCircle, AlertTriangle, CheckCircle, RefreshCcw, 
  Gamepad2, ArrowLeft, ChevronRight, Gauge 
} from 'lucide-react';

interface QuizProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  answerIdx: number;
  explanation: string;
}

interface QuizPack {
  id: number;
  title: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  description: string;
  questions: Question[];
}

const QUIZ_PACKS: QuizPack[] = [
  {
    id: 1,
    title: "Dasar-Dasar Tata Surya",
    difficulty: "Mudah",
    description: "Uji pengetahuan dasar mengenai matahari, planet terrestrial, raksasa gas, dan hukum orbit mendasar.",
    questions: [
      {
        id: 1,
        question: "Manakah planet terpanas di seluruh Tata Surya?",
        options: ["Merkurius", "Venus", "Mars", "Jupiter"],
        answerIdx: 1,
        explanation: "Meskipun Merkurius paling dekat dengan Matahari, Venus adalah yang terpanas (sekitar 462°C) karena efek rumah kaca ekstrem dari atmosfer karbon dioksidanya yang super tebal!"
      },
      {
        id: 2,
        question: "Gunung berapi raksasa Olympus Mons setinggi 21 km terdapat di planet...",
        options: ["Bumi", "Venus", "Mars", "Saturnus"],
        answerIdx: 2,
        explanation: "Mars memiliki gunung berapi Olympus Mons yang tingginya mencapai 21 km (tiga kali tinggi Gunung Everest) karena kerak Mars tidak bergerak seperti lempeng tektonik Bumi."
      },
      {
        id: 3,
        question: "Berapa lama waktu yang dibutuhkan cahaya Matahari untuk mencapai permukaan Bumi?",
        options: ["3 detik", "8 menit 20 detik", "1 jam", "Instant / Tanpa jeda"],
        answerIdx: 1,
        explanation: "Cahaya merambat dengan kecepatan 300.000 km per detik. Dengan jarak rata-rata Bumi-Matahari sekitar 150 juta km, cahaya membutuhkan waktu sekitar 8 menit 20 detik."
      },
      {
        id: 4,
        question: "Planet manakah yang memiliki kepadatan (densitas) paling rendah, bahkan kurang dari air?",
        options: ["Jupiter", "Uranus", "Neptunus", "Saturnus"],
        answerIdx: 3,
        explanation: "Saturnus didominasi oleh gas hidrogen dan helium dengan massa jenis sangat kecil. Jika ada wadah air raksasa yang cukup besar untuk menampungnya, Saturnus akan terapung!"
      },
      {
        id: 5,
        question: "Satelit alami (bulan) manakah yang memiliki atmosfer tebal dan danau hidrokarbon cair?",
        options: ["Europa (Jupiter)", "Titan (Saturnus)", "Triton (Neptunus)", "Bulan (Bumi)"],
        answerIdx: 1,
        explanation: "Titan, satelit saturnus, adalah satu-satunya satelit di tata surya dengan atmosfer tebal dan siklus cairan aktif berupa metana dan etana cair di permukaannya."
      },
      {
        id: 6,
        question: "Mengapa Uranus berputar menyamping seperti menggelinding dengan kemiringan sumbu 98°?",
        options: [
          "Karena kecepatannya terlalu tinggi",
          "Akibat hantaman planet seukuran Bumi di masa lalu",
          "Ditarik oleh gaya gravitasi langsung galaksi",
          "Karena tidak memiliki satelit alami"
        ],
        answerIdx: 1,
        explanation: "Para ilmuwan percaya Uranus ditabrak oleh sebuah protoplanet batuan besar seukuran Bumi miliaran tahun yang lalu, yang selamanya mengubah sudut rotasi porosnya."
      },
      {
        id: 7,
        question: "Berapa tahun sekali Komet Halley yang legendaris dapat terlihat dari Bumi?",
        options: ["5 tahun sekali", "12 tahun sekali", "75 - 76 tahun sekali", "500 tahun sekali"],
        answerIdx: 2,
        explanation: "Komet Halley adalah komet periodik pendek dengan orbit elips sangat lonjong yang kembali ke bagian dalam tata surya setiap 75 hingga 76 tahun sekali."
      },
      {
        id: 8,
        question: "Di manakah letak Sabuk Asteroid Tata Surya kita berada?",
        options: ["Antara Merkurius & Venus", "Antara Mars & Jupiter", "Di luar garis orbit Pluto", "Mengepung matahari dari kutub"],
        answerIdx: 1,
        explanation: "Sabuk Asteroid utama terletak di daerah antara orbit Mars dan Jupiter. Daerah ini dipenuhi sisa materi planetesimal purba yang gagal menyatu menjadi planet akibat pengaruh gravitasi kuat Jupiter."
      },
      {
        id: 9,
        question: "Manakah planet terkecil di Tata Surya saat ini?",
        options: ["Merkurius", "Mars", "Pluto", "Bumi"],
        answerIdx: 0,
        explanation: "Merkurius adalah planet terkecil dengan diameter hanya 4.879 km (tidak jauh lebih besar dari Bulan). Pluto tidak lagi dihitung sebagai planet utama sejak definisi diperluas pada tahun 2006."
      },
      {
        id: 10,
        question: "Berapa jumlah planet kerdil (dwarf planets) resmi yang dikonfirmasi oleh IAU saat ini?",
        options: ["1", "3", "5", "12"],
        answerIdx: 2,
        explanation: "International Astronomical Union secara resmi merilis lima planet kerdil resmi yaitu: Ceres, Pluto, Haumea, Makemake, dan Eris. Ratusan calon lainnya sedang diteliti."
      }
    ]
  },
  {
    id: 2,
    title: "Planet-Planet Terestrial",
    difficulty: "Mudah",
    description: "Jelajahi dunia berbatu di lingkaran terdalam Tata Surya kita: Merkurius, Venus, Bumi, dan Mars.",
    questions: [
      {
        id: 1,
        question: "Mengapa Merkurius hampir tidak memiliki atmosfer pelindung?",
        options: [
          "Karena tidak mempunya medan magnet",
          "Suhu panas menyerap semua molekul hidrogen",
          "Terlalu dekat dengan angin Matahari super kencang & gravitasi lemah",
          "Telah ditarik seluruhnya oleh tarikan gravitasi planet Venus"
        ],
        answerIdx: 2,
        explanation: "Merkurius dekat sekali dengan Matahari, sehingga dihantam angin surya konstan yang melongsorkan atmosfernya. Gravitasinya yang juga lemah membuat gas ringan mudah melarikan diri ke luar angkasa."
      },
      {
        id: 2,
        question: "Pernyataan ekstrem manakah yang benar mengenai rotasi planet Venus?",
        options: [
          "Satu hari di Venus lebih lama dari satu tahunnya",
          "Venus berputar dengan kemiringan ekstrem 180 derajat",
          "Sisi malam Venus tidak pernah mendapat cahaya seumur hidupnya",
          "Venus tidak berotasi pada porosnya sama sekali"
        ],
        answerIdx: 0,
        explanation: "Venus berotasi sangat lambat. Membutuhkan 243 hari Bumi untuk satu kali rotasi pada porosnya, sedangkan revolusi mengitari matahari hanya butuh 225 hari Bumi!"
      },
      {
        id: 3,
        question: "Zat kimia apakah yang dominan menyebabkan lapisan permukaan Mars tampak berwarna merah karat?",
        options: ["Tembaga sulfat", "Besi oksida (Karat besi)", "Kandungan belerang murni", "Batu kapur berkapur"],
        answerIdx: 1,
        explanation: "Warna kemerahan khas Mars berasal dari kelimpahan senyawa besi oksida (Fe2O3) atau senyawa karat di debu permukaannya yang terbawa angin menyelimuti seluruh planet."
      },
      {
        id: 4,
        question: "Berapa persen wilayah permukaan Bumi yang ditutupi oleh samudra air cair?",
        options: ["Sekitar 50%", "Sekitar 71%", "Sekitar 85%", "Sekitar 91%"],
        answerIdx: 1,
        explanation: "Hampir tiga perempat permukaan Bumi kita ditutupi oleh air, yaitu sekitar 71%, menjadikannya satu-satunya planet di tata surya dengan lautan cair stabil di permukaannya."
      },
      {
        id: 5,
        question: "Planet manakah yang memiliki kawah tubrukan raksasa bernama Caloris Basin?",
        options: ["Mars", "Bumi", "Venus", "Merkurius"],
        answerIdx: 3,
        explanation: "Caloris Basin adalah salah satu kawah tabrakan terbesar di Tata Surya (lebar 1.550 km) yang terbentuk di Merkurius akibat tabrakan asteroid raksasa miliaran tahun silam."
      },
      {
        id: 6,
        question: "Apa nama dua satelit alami berukuran kecil berbentuk kental mirip kentang yang mengitari Mars?",
        options: ["Titan & Rhea", "Europa & Ganymede", "Phobos & Deimos", "Io & Callisto"],
        answerIdx: 2,
        explanation: "Mars memiliki dua bulan mungil bernama Phobos (berarti Takut) dan Deimos (berarti Panik), yang kemungkinan besar adalah objek asteroid sabuk utama yang terjebak gravitasi Mars."
      },
      {
        id: 7,
        question: "Atmosfer ekstrem di permukaan planet Venus sangat masif, tekanannya setara dengan...",
        options: [
          "Puncak gunung tertinggi Everest",
          "Terbang dengan jet supersonic udara",
          "Kedalaman 900 meter di bawah laut Bumi",
          "Inti bumi bagian luar"
        ],
        answerIdx: 2,
        explanation: "Atmosfer tebal karbon dioksida Venus sangat berat. Tekanan udara di permukaannya adalah 92 kali lipat tekanan atmosfer Bumi, setara dengan tekanan air laut pada kedalaman 900 meter!"
      },
      {
        id: 8,
        question: "Berapa lama jangka waktu presisi yang diperlukan Bumi untuk mengelilingi matahari?",
        options: ["365 hari pas", "365,25 hari", "366 hari pas", "360 hari pas"],
        answerIdx: 1,
        explanation: "Bumi membutuhkan waktu sekitar 365,25 hari untuk mengitari matahari sekali penuh. Fraksi 0,25 inilah yang dikumpulkan menjadi 1 hari tambahan setiap 4 tahun sekali (tahun kabisat)."
      },
      {
        id: 9,
        question: "Apakah planet terrestrial (planet berbatu batuan) terbesar di Tata Surya kita?",
        options: ["Venus", "Bumi", "Mars", "Merkurius"],
        answerIdx: 1,
        explanation: "Bumi adalah planet batuan terbesar dalam hal diameter, massa, kepadatan, dan kuat gravitasi permukaan, melampaui sedikit ukuran Venus yang sering dijuluki kembarannya."
      },
      {
        id: 10,
        question: "Mars memiliki sistem ngarai raksasa terdalam di Tata Surya yang bernama...",
        options: ["Olympus Mons", "Valles Marineris", "Ma'adim Vallis", "Grand Canyon Mars"],
        answerIdx: 1,
        explanation: "Valles Marineris adalah ngarai terdalam dan terpanjang di Tata Surya, dengan panjang mencapai 4.000 km, lebar 200 km, dan kedalaman mencapai 7 km (jauh mengalahkan Grand Canyon Bumi)."
      }
    ]
  },
  {
    id: 3,
    title: "Raksasa Gas & Es",
    difficulty: "Mudah",
    description: "Uji pengetahuan tentang raksasa gas Jupiter dan Saturnus, serta dunia es luar Uranus dan Neptunus.",
    questions: [
      {
        id: 1,
        question: "Planet manakah yang memiliki massa terbesar, bahkan 2,5 kali gabungan seluruh planet lainnya?",
        options: ["Uranus", "Saturnus", "Jupiter", "Neptunus"],
        answerIdx: 2,
        explanation: "Jupiter adalah raja para planet. Massanya sangat besar (318 kali massa Bumi), menjadikannya poros rotasi sekunder terkuat yang mempengaruhi kelangsungan lintasan orbit tata surya."
      },
      {
        id: 2,
        question: "Bintik Merah Raksasa (Great Red Spot) yang berada di permukaan Jupiter sebenarnya adalah...",
        options: [
          "Daratan berapi aktif yang berpijar merah",
          "Badai antisiklon raksasa yang telah bergejolak ratusan tahun",
          "Pantulan cahaya matahari dari kutub es karbon",
          "Lubang runtuhan yang menembus pusat inti planet"
        ],
        answerIdx: 1,
        explanation: "Bintik Merah Raksasa di Jupiter adalah badai pusaran badai bertekanan tinggi (antisiklon) yang sangat masif, lebarnya bahkan cukup besar untuk menelan seluruh planet Bumi bulat-bulat."
      },
      {
        id: 3,
        question: "Atmosfer gas di planet Saturnus didominasi oleh kandungan utama gas apakah?",
        options: ["Karbon monoksida & Metana", "Oksigen & Nitrogen", "Hidrogen & Helium", "Klorin & Fluorin"],
        answerIdx: 2,
        explanation: "Sebagai raksasa gas sejati, Saturnus sebagian besar terbentuk dari gas Hidrogen (96%) dan Helium (3%) dengan jejak amonia segar di puncak awannya."
      },
      {
        id: 4,
        question: "Planet manakah yang mendapatkan julukan raksasa es biru muda karena gas metana menyerap cahaya merah?",
        options: ["Neptunus", "Uranus", "Jupiter", "Merkurius"],
        answerIdx: 1,
        explanation: "Uranus tampak berwarna biru kehijauan yang khas karena gas metana di atmosfer atas menyerap frekuensi warna merah dari cahaya matahari yang masuk dan merefleksikannya kembali."
      },
      {
        id: 5,
        question: "Badai cepat bergemuruh ekstrem di Neptunus dipantau NASA berbentuk bercak hitam besar bernama...",
        options: ["Black Eye Spot", "Great Dark Spot", "Kawah Gelap Amri", "Great Red Belt"],
        answerIdx: 1,
        explanation: "Ditemukan oleh Voyager 2 tahun 1989, Great Dark Spot adalah pusaran badai antisiklon raksasa di Neptunus yang memiliki karakteristik menyerupai bintik merah Jupiter namun berubah-ubah posisi."
      },
      {
        id: 6,
        question: "Berapa lama rotasi yang dibutuhkan Saturnus untuk menyelesaikan satu putaran porosnya?",
        options: ["Sekitar 10,7 jam", "Sekitar 24 jam", "Sekitar 88 hari", "Sekitar 10 jam kurang"],
        answerIdx: 0,
        explanation: "Meskipun ukurannya sangat raksasa, Saturnus berputar sangat cepat pada porosnya (rotasi sekitar 10,7 jam), menjadikannya planet tercepat kedua setelah Jupiter."
      },
      {
        id: 7,
        question: "Sistem cincin planet manakah yang paling luas, terang, dan terlihat megah berkilau?",
        options: ["Uranus", "Jupiter", "Saturnus", "Neptunus"],
        answerIdx: 2,
        explanation: "Meskipun semua planet raksasa memiliki cincin, cincin Saturnus adalah yang paling menakjubkan yang terbentuk dari miliaran bongkahan es murni, debu batuan silikat, dan debu karbon."
      },
      {
        id: 8,
        question: "Siapa astronom berkebangsaan Inggris yang legendaris menemukan planet Uranus tahun 1781?",
        options: ["Galileo Galilei", "William Herschel", "Isaac Newton", "Edwin Hubble"],
        answerIdx: 1,
        explanation: "Sir William Herschel mengamati Uranus menggunakan teleskop buatannya sendiri di halaman rumahnya pada 13 Maret 1781, mengawali penemuan planet modern pertama di peradaban kita."
      },
      {
        id: 9,
        question: "Berapa jumlah cincin tipis, buram, dan sangat gelap yang terdeteksi mengitari planet Uranus?",
        options: ["3 cincin", "9 cincin", "13 cincin", "22 cincin"],
        answerIdx: 2,
        explanation: "Uranus memiliki sistem cincin ganda yang tipis dan redup sebanyak 13 cincin individual yang tersebar dalam struktur sempit di sekeliling wilayah ekuator dinamisnya."
      },
      {
        id: 10,
        question: "Manakah planet raksasa gas yang memiliki kepadatan atau gravitasi permukaan terkuat setelah Jupiter?",
        options: ["Saturnus", "Uranus", "Neptunus", "Ceres"],
        answerIdx: 2,
        explanation: "Neptunus adalah raksasa gas terpadat di Tata Surya. Meskipun volumenya lebih kecil dari Uranus, massanya lebih besar, memberikan kuat tarikan gravitasi permukaan terbesar kedua."
      }
    ]
  },
  {
    id: 4,
    title: "Satelit Alami & Bulan",
    difficulty: "Sedang",
    description: "Analisis berbagai satelit alami unik yang mengitari planet-planet utama dari es Europa hingga atmosfer Titan.",
    questions: [
      {
        id: 1,
        question: "Satelit alami (bulan) manakah yang memegang rekor terbesar di seluruh Tata Surya kita?",
        options: ["Titan (Saturnus)", "Ganymede (Jupiter)", "Bulan (Bumi)", "Triton (Neptunus)"],
        answerIdx: 1,
        explanation: "Ganymede memiliki diameter 5.268 km, bahkan ukurannya lebih besar dari planet Merkurius! Ganymede juga menjadi satu-satunya satelit alami yang memiliki medan magnet internal sendiri."
      },
      {
        id: 2,
        question: "Samudra air cair melimpah di bawah lapisan es tebal yang sangat berpotensi mengandung kehidupan makroba terletak di...",
        options: ["Io (Jupiter)", "Europa (Jupiter)", "Phobos (Mars)", "Titan (Saturnus)"],
        answerIdx: 1,
        explanation: "Europa ditutupi lapisan es air yang mulus namun retak-retak. Jilatan energi panas gravitasi dari Jupiter melelehkan es di bawah permukaannya menjadi samudra air asin hangat raksasa."
      },
      {
        id: 3,
        question: "Bulan paling aktif secara vulkanik di seluruh Tata Surya yang dipenuhi oleh letusan belerang adalah...",
        options: ["Callisto", "Io", "Triton", "Mimas"],
        answerIdx: 1,
        explanation: "Io adalah bulan terdalam Jupiter. Gaya pasang laut gravitasi dari Jupiter dan bulan tetangga meregangkan Io konstan, menghasilkan panas pasang surut ekstrem yang memicu ratusan gunung berapi aktif."
      },
      {
        id: 4,
        question: "Mengapa kita di Bumi selalu melihat sisi wajah Bulan yang sama sepanjang waktu sepanjang tahun?",
        options: [
          "Karena Bulan tidak melakukan rotasi mandiri",
          "Interaksi pancaran radiasi langsung ozon Bumi",
          "Fenomena penguncian pasang surut (Tidal Locking)",
          "Bulan bergerak lurus sejajar khatulistiwa"
        ],
        answerIdx: 2,
        explanation: "Bulan terkunci pasang surut (Tidal Locking) dengan Bumi. Periode rotasi poros Bulan persis sama dengan periode revolusi orbitnya terhadap Bumi (sekitar 27,3 hari)."
      },
      {
        id: 5,
        question: "Satelit alami besar milik Neptunus manakah yang mengorbit berlawanan arah dari rotasi planetnya?",
        options: ["Nereid", "Proteus", "Triton", "Larissa"],
        answerIdx: 2,
        explanation: "Triton adalah satu-satunya bulan besar di tata surya dengan orbit mundur (retrograde). Ini membuktikan bahwa Triton awalnya adalah objek luar Sabuk Kuiper yang ditangkap oleh gravitasi Neptunus."
      },
      {
        id: 6,
        question: "Bulan Saturnus manakah yang menyemburkan geyser uap air es raksasa dari retakan hangat kutub selatannya?",
        options: ["Rhea", "Dione", "Enceladus", "Tethys"],
        answerIdx: 2,
        explanation: "Semburan geyser air es Enceladus terdeteksi dari celah retakan 'Tiger Stripes' di kutub selatannya. Sebagian partikel air es yang dilontarkan ini berkontribusi membentuk Cincin E luar milik Saturnus."
      },
      {
        id: 7,
        question: "Satelit Mars manakah yang orbitnya mengalami penyusutan spiral lambat mendekati ajal tabrakan?",
        options: ["Phobos", "Deimos", "Charon", "Janus"],
        answerIdx: 0,
        explanation: "Phobos mengorbit sangat dekat dengan Mars. Setiap 100 tahun, orbitnya turun 1,8 meter. Diperkirakan dalam 30-50 juta tahun mendatang, Phobos akan hancur menjadi cincin baru di Mars atau menabraknya."
      },
      {
        id: 8,
        question: "Berapa perbandingan proporsi kasar diameter Bulan kita jika diukur terhadap raga Bumi?",
        options: ["Sekitar 1/2 ukuran Bumi", "Sekitar 1/4 ukuran Bumi", "Sekitar 1/10 ukuran Bumi", "Sekitar 1/100 ukuran Bumi"],
        answerIdx: 1,
        explanation: "Bulan kita memiliki diameter sebesar 3.474 km, yaitu sekitar 27% atau berkisar 1/4 dari diameter Bumi murni, rasio yang tergolong sangat besar dibanding satelit planet lain."
      },
      {
        id: 9,
        question: "Satelit Saturnus manakah yang memiliki bentukan mirip kue empanada atau UFO akibat gundukan debu cincin?",
        options: ["Pan", "Atlas", "Titan", "Rhea"],
        answerIdx: 0,
        explanation: "Pan adalah bulan gembala kecil Saturnus di celah Encke. Gravitasi ringkasnya menyapu sisa debu cincin di jalurnya, mengandapkannya sepanjang khatulistiwa sehingga tampak melebar datar layaknya UFO."
      },
      {
        id: 10,
        question: "Bulan Pluto manakah yang sangat dominan besar hingga memindahkan titik sirkulasi rotasi keluar Pluto?",
        options: ["Styx", "Nix", "Kerberos", "Charon"],
        answerIdx: 3,
        explanation: "Charon berukuran setengah dari diameter Pluto. Hal ini membuat titik barisenter (pusat gravitasi orbit bersama) terletak di ruang hampa di antara keduanya, menjadikan mereka sistem planet ganda."
      }
    ]
  },
  {
    id: 5,
    title: "Matahari - Bintang Kita",
    difficulty: "Mudah",
    description: "Pelajari rahasia reaktor energi raksasa termonuklir yang menyatukan seluruh orbit Tata Surya kita.",
    questions: [
      {
        id: 1,
        question: "Reaksi fisika melimpah apakah yang menghasilkan kilatan energi tak terbatas di inti sel surya Matahari?",
        options: ["Fisi Nuklir", "Fusi Nuklir (Hidrogen menyatu menjadi Helium)", "Pembakaran Oksidasi Batu Bara", "Geothermal Korona"],
        answerIdx: 1,
        explanation: "Suhu ekstrem (15 juta °C) dan tekanan mahadasyat di inti Matahari memicu reaksi Fusi Nuklir, di mana setiap detiknya jutaan ton hidrogen melebur menjadi helium murni, melepaskan energi radiasi masif."
      },
      {
        id: 2,
        question: "Berapakah estimasi kisaran suhu yang merata di bagian permukaan luar Fotosfer Matahari?",
        options: ["Sekitar 1.500 °C", "Sekitar 5.500 °C", "Sekitar 15 Juta °C", "Sekitar 100.000 °C"],
        answerIdx: 1,
        explanation: "Meskipun intinya mencapai 15 juta derajat Celcius, suhu di permukaan koroner bawah fotosfer Matahari mendingin hingga berkisar 5.500 derajat Celcius (9.932 derajat Fahrenheit)."
      },
      {
        id: 3,
        question: "Atmosfer luar Matahari yang tampak berkilau membentuk berkas mahkota saat gerhana total adalah...",
        options: ["Kromosfer", "Korona", "Fotosfer", "Heliosfer"],
        answerIdx: 1,
        explanation: "Korona adalah lapisan atmosfer terluar plasma yang membentang jutaan kilometer ke ruang angkasa. Suhu di korona naik aneh hingga mencapai 1 sampai 3 juta derajat Celcius!"
      },
      {
        id: 4,
        question: "Elemen dasar gas atau unsur kimia apakah yang paling melimpah menyusun tubuh gas bintang Matahari kita?",
        options: ["Helium", "Oksigen", "Hidrogen", "Karbon Dioksida"],
        answerIdx: 2,
        explanation: "Matahari didominasi oleh unsur gas Hidrogen yang melingkupi sekitar 73% hingga 74% dari keseluruhan massanya, disusul oleh Helium sebesar 24% hingga 25%."
      },
      {
        id: 5,
        question: "Berapakah estimasi usia perkembangan bintang kuning kerdil Matahari kita saat ini?",
        options: ["1 Miliar Tahun", "4,6 Miliar Tahun", "13,8 Miliar Tahun", "100 Miliar Tahun"],
        answerIdx: 1,
        explanation: "Matahari terbentuk bersamaan dengan tata surya sekitar 4,6 Miliar tahun yang lalu dari runtuhnya gravitasi awan molekul raksasa purba seiring ledakan supernova tetangga."
      },
      {
        id: 6,
        question: "Fenomena semburan energi tak terduga yang meluncur mengkilat akibat puntiran medan magnet Matahari disebut?",
        options: ["Solar Wind", "Solar Flare", "Sunspots", "Aurora Bintang"],
        answerIdx: 1,
        explanation: "Solar Flare adalah ledakan radiasi instan intensitas tinggi di permukaan Matahari yang melepaskan energi setara jutaan bom hidrogen, memancarkan partikel bermuatan ke seluruh wilayah orbit."
      },
      {
        id: 7,
        question: "Tabrakan angin matahari dengan perisai magnetik Bumi memicu tarian tirai berpendar memukau dinamakan...",
        options: ["Pelangi Polar", "Aurora Borealis & Australis", "Halo Gerhana", "Awan Noctilucent"],
        answerIdx: 1,
        explanation: "Aurora terjadi ketika ion partikel bermuatan dari angin surya bergesekan dengan molekul oksigen/nitrogen atmosfer di sekitar kutub geomagnetik Bumi, melepaskan foton cahaya spektakuler berwarna-warni."
      },
      {
        id: 8,
        question: "Berapa kali lipat diameter fisik Matahari jika dibandingkan langsung dengan diameter Bumi?",
        options: ["Sekitar 10 kali lipat", "Sekitar 109 kali lipat", "Sekitar 1.000 kali lipat", "Sekitar 10.000 kali lipat"],
        answerIdx: 1,
        explanation: "Diameter Matahari mencapai 1,39 juta kilometer, yaitu kira-kira 109 kali lipat diameter Bumi kita. Sebanyak 1,3 juta replika Bumi dapat muat dimasukkan ke dalam bola Matahari."
      },
      {
        id: 9,
        question: "Berapakah persentase total kelimpahan massa seluruh isi Tata Surya yang terkonsentrasi di dalam Matahari?",
        options: ["50%", "75%", "99,86%", "99.99%"],
        answerIdx: 2,
        explanation: "Matahari memikat gravitasi karena menyimpan sekitar 99,86% dari massa total seluruh Tata Surya kita. Sisanya terbagi rata di planet-planet utama (terutama Jupiter) dan asteroid."
      },
      {
        id: 10,
        question: "Lapisan fisik Matahari manakah yang memancarkan cahaya tampak langsung ke Bumi setiap hari?",
        options: ["Fotosfer", "Kromosfer", "Zona Konveksi", "Zona Radiasi"],
        answerIdx: 0,
        explanation: "Fotosfer adalah permukaan tampak Matahari yang setebal beberapa ratus kilometer. Lapisan ini memancarkan cahaya tampak (foton) yang menyebar meluncur melintasi antariksa ke permukaan Bumi."
      }
    ]
  },
  {
    id: 6,
    title: "Komet, Asteroid & Meteoroid",
    difficulty: "Sedang",
    description: "Telusuri asal usul sisa reruntuhan debu es primordial penyusun sabuk asteroid dan komet hulu dingin.",
    questions: [
      {
        id: 1,
        question: "Dari wilayah awan gas dingin hipotetis manakah komet dengan lintasan orbit ribuan tahun berasal?",
        options: ["Sabuk Asteroid", "Sabuk Kuiper", "Awan Oort", "Awan Nebula Orion"],
        answerIdx: 2,
        explanation: "Komet periode panjang dipercaya berasal dari Awan Oort, cangkang bulat berukuran bola raksasa di pinggiran terluar tata surya yang dipenuhi triliunan objek es beku purba."
      },
      {
        id: 2,
        question: "Mengapa para astronom sering menjuluki komet sebagai 'bola salju kotor' (dirty snowballs)?",
        options: [
          "Karena mengorbit meluncur menyemburkan lendir cair",
          "Tersusun atas campuran es air, gas karbon monoksida beku, amonia, dan debu batuan silikat",
          "Merupakan meteoroid yang tertutup salju karbon tebal",
          "Permukaannya dipenuhi sisa muntahan belerang berkapur"
        ],
        answerIdx: 1,
        explanation: "Komet adalah kumpulan batuan fosil beku purba tersusun dari es air, karbon monoksida beku, metana beku, amonia kering, dilapisi debu padat batuan silikat kaya zat karbon dari fajar pembentukan tata surya."
      },
      {
        id: 3,
        question: "Apa julukan fenomena berkilau saat batuan asteroid/meteoroid menyala lumat bergesekan dengan atmosfer Bumi?",
        options: ["Supernova kerdil", "Meteor (Bintang jatuh)", "Koma bercahaya", "Pelangi Ionik"],
        answerIdx: 1,
        explanation: "Meteor atau 'bintang jatuh' adalah kilatan pijar cahaya panas akibat gesekan kinetik batuan antariksa kecil (meteoroid) saat memasuki ketebalan atmosfer Bumi dengan kecepatan supersonik."
      },
      {
        id: 4,
        question: "Sisa batuan pembakar luar angkasa yang lolos benturan atmosfer dan sukses menyentuh tanah Bumi disebut...",
        options: ["Meteorit", "Meteoritoid", "Teletit", "Batu Bulan"],
        answerIdx: 0,
        explanation: "Jika batuan penjelajah ruang angkasa memiliki material yang cukup solid sehingga tidak habis terbakar menguap di atmosfer dan sukses mencium permukaan tanah Bumi, batuan itu dilabeli Meteorit."
      },
      {
        id: 5,
        question: "Ke arah manakah juntaian ekor megah gas ion komet selalu menunjuk saat menyusuri orbitnya?",
        options: [
          "Selalu searah tepat kemudi jalurnya",
          "Selalu mengarah menjauhi titik letak Matahari",
          "Selalu mengarah tegak lurus sejajar kutub ekliptika",
          "Selalu lurus memanjang ke arah pusat galaksi"
        ],
        answerIdx: 1,
        explanation: "Ekor komet didorong oleh tekanan radiasi cahaya matahari dan embusan konstan partikel Angin Surya (Solar Wind). Sehingga, ekor komet selalu menyembur menjauhi Matahari ke mana pun jalurnya."
      },
      {
        id: 6,
        question: "Asteroid terbesar di sabuk utama yang ditemukan tahun 1801 dan sekarang dikategorikan planet kerdil adalah...",
        options: ["Vesta", "Pallas", "Ceres", "Eros"],
        answerIdx: 2,
        explanation: "Ceres berdiameter 940 km, menyusun sepertiga dari seluruh massa total pengisi Sabuk Asteroid utama. Ceres ditingkat statuskan menjadi planet kerdil pada tahun 2006 bersama Pluto."
      },
      {
        id: 7,
        question: "Di manakah letak Sabuk Kuiper, wilayah padat batuan beku es tempat Pluto beredar?",
        options: [
          "Di antara planet Mars dan Jupiter",
          "Di bagian luar melingkar melewati garis orbit planet Neptunus",
          "Persis mengapit atmosfer terluar Merkurius",
          "Melintang di antara planet Saturnus dan Uranus"
        ],
        answerIdx: 1,
        explanation: "Sabuk Kuiper adalah wilayah berbentuk donat raksasa di luar orbit Neptunus (berkisar 30 AU hingga 50 AU dari Matahari) yang dihuni jutaan benda kecil es beku dan berbagai planet kerdil dingin."
      },
      {
        id: 8,
        question: "Komet periodik terkenal manakah yang hancur berkeping-keping menubruk Jupiter tahun 1994?",
        options: ["Komet Halley", "Shoemaker-Levy 9", "Komet Encke", "Hale-Bopp"],
        answerIdx: 1,
        explanation: "Komet Shoemaker-Levy 9 terkoyak menjadi 21 fragmen oleh gravitasi dahsyat Jupiter pada tahun 1992, sebelum serpihannya menghujam jatuh mencabik awan Jupiter pada Juli 1994 dengan ledakan dahsyat."
      },
      {
        id: 9,
        question: "Wahana Galileo pada tahun 1993 mengambil citra asteroid pertama yang memiliki bulan kecil bernama Dactyl, yaitu...",
        options: ["Gaspra", "Ida", "Eros", "Itokawa"],
        answerIdx: 1,
        explanation: "Asteroid 243 Ida adalah sasaran flyby instrumen Galileo. Galileo mengejutkan para ilmuwan dengan memotret bulan kecil pendamping setebal 1,6 km yang dinamai Dactyl mengorbit mesra di sisi Ida."
      },
      {
        id: 10,
        question: "Selubung gas/debu tebal pembungkus inti komet yang terbentuk dari efek sublimasi es mendekati matahari disebut...",
        options: ["Koma (Coma)", "Ekor Debu", "Ekor Gas Ion", "Korona Komet"],
        answerIdx: 0,
        explanation: "Saat komet meluncur mendekati Matahari, energi radiasi melelehkan material es penyusunnya menjadi gas mengembang masif. Selimut awan gas bundar yang menyelimuti inti beku komet dinamai Koma."
      }
    ]
  },
  {
    id: 7,
    title: "Eksplorasi Antariksa",
    difficulty: "Mudah",
    description: "Uji pengetahuan tentang satelit buatan pertama, misi berawak Apollo, helikopter Mars, dan teleskop luar angkasa.",
    questions: [
      {
        id: 1,
        question: "Wahana pionir buatan manusia pertama manakah yang sukses meluncur meninggalkan batas tata surya menuju ruang antarbintang?",
        options: ["Apollo 11", "Pioneer 10", "Voyager 1", "Voyager 2"],
        answerIdx: 2,
        explanation: "Diluncurkan tahun 1977, Voyager 1 meluncur melewati garis heliopause pada Agustus 2012, menjadikannya benda buatan manusia paling jauh (berkisar lebih dari 24 Miliar km) di ruang antarbintang."
      },
      {
        id: 2,
        question: "Siapakah manusia pertama yang mengukir sejarah menapakkan kaki di permukaan Bulan pada 20 Juli 1969?",
        options: ["Yuri Gagarin", "Buzz Aldrin", "Neil Armstrong", "Alan Shepard"],
        answerIdx: 2,
        explanation: "Neil Armstrong, komandan misi Apollo 11 AS, menapakkan kaki pertamanya di permukaan Bulan mendarat dengan modul Lunar Eagle sembari berseru: 'That's one small step for man, one giant leap for mankind.'"
      },
      {
        id: 3,
        question: "Wahana luar angkasa NASA yang sukses terbang melintasi Pluto memotret permukaan es tahun 2015 adalah...",
        options: ["Dawn", "Voyager 1", "New Horizons", "Cassini"],
        answerIdx: 2,
        explanation: "Sembilan tahun meluncur memotong Tata Surya, New Horizons meluncur mendekati Pluto pada Juli 2015, mengirimkan foto legendaris fitur permukaan es berbentuk lambang jantung 'Tombaugh Regio'."
      },
      {
        id: 4,
        question: "Negara manakah yang meluncurkan satelit pemancar sinyal pertama di dunia bernama Sputnik 1 pada 1957?",
        options: ["Amerika Serikat", "Uni Soviet (Rusia)", "Inggris Jerman", "Tiongkok Jepang"],
        answerIdx: 1,
        explanation: "Uni Soviet menembakkan Sputnik 1 ke orbit eliptik rendah Bumi pada 4 Oktober 1957. Peristiwa bersejarah ini menandai mulainya era penjelajahan ruang angkasa modern dan perang teknologi dingin."
      },
      {
        id: 5,
        question: "Apa nama helikopter mini bersejarah yang berhasil mengudara terbang di tipisnya atmosfer planet Mars?",
        options: ["Sojourner", "Spirit", "Ingenuity", "Opportunity"],
        answerIdx: 2,
        explanation: "Helikopter Ingenuity dikirim bersama rover Perseverance. Ingenuity membuktikan penerbangan berjarak dikontrol aerodinamis di atmosfer Mars yang tipis (hanya 1% kerapatan udara Bumi) dapat dilangsungkan."
      },
      {
        id: 6,
        question: "Teleskop luar angkasa inframerah termutakhir yang menggantikan kejayaan instrumen optik Hubble adalah...",
        options: ["James Webb Space Telescope (JWST)", "Kepler Telescope", "Chandra Observatory", "Spitzer Mission"],
        answerIdx: 0,
        explanation: "Teleskop James Webb (JWST) diluncurkan akhir 2021 di titik Lagrange L2. Dilengkapi cermin berlapis emas masif, JWST mampu membelah awan debu kosmik untuk meneliti galaksi bintang purba semesta."
      },
      {
        id: 7,
        question: "Misi pendaratan astronot wanita pertama buatan NASA ke Bulan di era dekade ini dilabeli program...",
        options: ["Apollo Reborn", "Artemis", "Athena", "Zeus Horizon"],
        answerIdx: 1,
        explanation: "Nama program Artemis diambil dari saudari kembar Apollo dalam mitologi Yunani. Program ini berfokus mendirikan stasiun pangkalan berawak jangka panjang di kutub selatan kawah Bulan."
      },
      {
        id: 8,
        question: "Robot rover terbesar bertenaga nuklir milik NASA yang sedang aktif menyisir kandungan Kawah Jezero Mars adalah...",
        options: ["Curiosity", "Sojourner", "Perseverance", "Viking 1"],
        answerIdx: 2,
        explanation: "Perseverance mendarat di Mars pada Februari 2021. Misi utamanya mengumpulkan contoh bebatuan silikat dan tanah Mars dalam tabung bersegel keras untuk dijemput misi masa depan demi meneliti biosignatures kuno."
      },
      {
        id: 9,
        question: "Berapakah kecepatan orbit konstan Stasiun Luar Angkasa Internasional (ISS) saat mengelilingi Bumi?",
        options: ["100 km/jam", "3.600 km/jam", "27.600 km/jam", "300.000 km/detik"],
        answerIdx: 2,
        explanation: "ISS meluncur dengan kecepatan sekitar 27.600 km per jam (7,6 km per detik) pada ketinggian orbit 400 km. Kecepatan ini membuat para astronot di ISS menyaksikan 16 kali matahari terbit dan terbenam setiap hari."
      },
      {
        id: 10,
        question: "Wahana kolaboratif Cassini-Huygens sukses diterbangkan sejauh miliaran kilometer khusus mengintai planet...",
        options: ["Jupiter", "Uranus", "Saturnus", "Pluto"],
        answerIdx: 2,
        explanation: "Misi Cassini mengitari orbit Saturnus dari tahun 2004 hingga 2017. Wahana ini juga membawa pendarat Huygens yang sukses mendarat di permukaan awan tebal bulan Saturnus, Titan, pada Januari 2005."
      }
    ]
  },
  {
    id: 8,
    title: "Hukum Orbit & Fenomena Kosmik",
    difficulty: "Sulit",
    description: "Uji pemahaman mendalam tentang mekanika benda langit Kepler, titik lagrange, gravitasi, dan magnetosfer planet.",
    questions: [
      {
        id: 1,
        question: "Hukum gerak planet Kepler keberapa yang menjelaskan bahwa orbit planet tidak bulat sempurna melainkan elips?",
        options: ["Hukum I Kepler", "Hukum II Kepler", "Hukum III Kepler", "Hukum Gravitasi universal"],
        answerIdx: 0,
        explanation: "Hukum I Kepler (Hukum Orbit) menyatakan secara revolusioner bahwa lintasan setiap planet dalam mengedari matahari berbentuk elips dengan Matahari berada di salah satu titik fokus fokusnya."
      },
      {
        id: 2,
        question: "Apa nama istilah koordinat posisi di kala sebuah planet mengorbit di jarak paling dekat dengan Matahari?",
        options: ["Aphelion", "Perihelion", "Perigee", "Apogee"],
        answerIdx: 1,
        explanation: "Perihelion berasal dari bahasa Yunani 'peri' (dekat) dan 'helios' (matahari). Pada titik ini, tarikan gravitasi Matahari paling kuat sehingga pergerakan kecepatan orbit planet mencapai titik tercepat ekstrimnya."
      },
      {
        id: 3,
        question: "Apa nama istilah koordinat posisi di kala sebuah planet mengorbit di jarak paling jauh dari posisi Matahari?",
        options: ["Aphelion", "Perihelion", "Apogee", "Perigee"],
        answerIdx: 0,
        explanation: "Aphelion adalah titik terjauh orbit planet dengan Matahari (dari 'apo' yang berarti jauh). Di titik ini, planet bergerak paling lambat menyusuri trayektori hukum luas Kepler."
      },
      {
        id: 4,
        question: "Gaya interaksi planet apakah yang menjadi penyebab utama pasang surut berkala air laut di Bumi?",
        options: [
          "Rotasi piringan atmosfer bawah",
          "Gaya Tarik Gravitasi Bulan dan Matahari",
          "Arus konveksi magma dasar samudra",
          "Radiasi geomagnetik inti luar planet"
        ],
        answerIdx: 1,
        explanation: "Sumbu gravitasi Bulan menarik lautan Bumi condong ke arahnya. Gravitasi Matahari juga ikut mempengaruhi. Sinergi tarik menarik ini menimbulkan tonjolan air laut pasang surut berkala seiring rotasi harian Bumi."
      },
      {
        id: 5,
        question: "Fenomena pasang naik pasang surut air laut tertinggi (pasang purnama) terjadi di Bumi ketika...",
        options: [
          "Bulan berada di titik aphelion terjauh",
          "Matahari, Bulan, dan Bumi berada sejajar segaris",
          "Bulan tepat membentuk sudut siku-siku dengan matahari",
          "Aurora menyala di kutub Bumi"
        ],
        answerIdx: 1,
        explanation: "Saat Bulan Baru atau Bulan Purnama, posisi Matahari, Bumi, dan Bulan sejajar lurus. Gaya gravitasi Bulan dan Matahari bersatu menguatkan daya tarik samudra menghasilkan pasang naik tertinggi bernama Pasang Purnama (Spring Tide)."
      },
      {
        id: 6,
        question: "Gaya fisis utama apakah yang menahan lapisan tebal gas atmosfer agar tidak melarikan diri menguap ke ruang hampa?",
        options: ["Tekanan Tektonik", "Gaya Tarik Gravitasi Planet", "Medan Elektromagnetik Ionik", "Gaya Sentrifugal Rotasi"],
        answerIdx: 1,
        explanation: "Gaya gravitasi planet menarik semua molekul gas atmosfer condong ke permukaan pusatnya. Jika massa planet terlalu ringan (akibat gravitasi sisa), gas atmosfer dengan mudah melejit lolos ke ruang hampa."
      },
      {
        id: 7,
        question: "Wilayah medan magnet melingkar pelindung planet Bumi dari gempuran mematikan partikel radiasi surya disebut...",
        options: ["Stratosfer", "Magnetosfer", "Heliosfer", "Ozonosfer"],
        answerIdx: 1,
        explanation: "Magnetosfer dibentuk oleh perputaran dinamo inti luar besi cair Bumi. Lapisan geofisika ini membelokkan partikel angin matahari ekstrem yang mematikan agar terpantul mengalir aman di sekitar orbit Bumi."
      },
      {
        id: 8,
        question: "Berapakah batas kecepatan lepas minimum (escape velocity) agar roket dapat sukses lepas bebas dari jerat gravitasi Bumi?",
        options: ["2,5 km/detik", "7,9 km/detik", "11,2 km/detik", "300.000 km/detik"],
        answerIdx: 2,
        explanation: "Kecepatan lepas Bumi adalah sekitar 11,2 km/detik (sekitar 40.320 km/jam). Jika kecepatan kinetik wahana roket berada di bawah batas ini, roket akan jatuh kembali terpuruk mencium Bumi."
      },
      {
        id: 9,
        question: "Titik koordinat seimbang di ruang angkasa di mana gaya gravitasi dua benda besar menihilkan gerak objek kecil disebut...",
        options: ["Titik Barisenter", "Titik Chandler", "Titik Lagrange", "Titik Kepler"],
        answerIdx: 2,
        explanation: "Dirumuskan Joseph-Louis Lagrange, terdapat lima titik keseimbangan gravitasi (L1 hingga L5) di antara dua benda bermassa besar. Titik ini sangat ideal untuk tempat stasiun pengintai satelit seperti JWST di L2."
      },
      {
        id: 10,
        question: "Mengapa revolusi tahunan planet luar (seperti Neptunus) berjalan sangat lama lamban dibanding planet lingkaran dalam?",
        options: [
          "Karena planet luar berputar terlalu cepat",
          "Karena tarikan gaya tolak debu sabuk asteroid",
          "Karena rute lintasan orbit lebih panjang sekaligus hukum gravitasi melemah seiring jarak",
          "Karena planet luar tidak mempunya inti padat"
        ],
        answerIdx: 2,
        explanation: "Merujuk Hukum III Kepler, kuadrat periode orbit planet sebanding dengan pangkat tiga jarak rata-ratanya dari Matahari. Dengan jarak jauh, tarikan gravitasi Matahari melemah drastis, menurunkan laju kelajuan fisiknya."
      }
    ]
  },
  {
    id: 9,
    title: "Pluto & Satelit Pembatas",
    difficulty: "Sedang",
    description: "Kaji ulang planet kerdil Sabuk Kuiper, Tombaugh Regio Pluto, serta misteri penurunan status legendarisnya.",
    questions: [
      {
        id: 1,
        question: "Pada tahun berapakah International Astronomical Union (IAU) menurunkan resmi kedudukan Pluto dari planet utama?",
        options: ["1999", "2004", "2006", "2010"],
        answerIdx: 2,
        explanation: "Pada Agustus 2006, dalam sidang umum di Praha, IAU merilis kriteria definitif baru sebuah planet utama. Pluto didiskualifikasi karena wilayah lintasannya belum sapu rapi dari objek es sabuk Kuiper."
      },
      {
        id: 2,
        question: "Planet kerdil di pinggiran neptunus yang berbentuk lonjong lonjong telur akibat putaran rotasi ekstremnya adalah...",
        options: ["Ceres", "Pluto", "Haumea", "Eris"],
        answerIdx: 2,
        explanation: "Haumea berotasi luar biasa kencang (satu kali putaran hanya memakan waktu 4 jam). Gaya sentrifugal kuat menarik bentuk fisiknya melar memanjang hingga menyerupai telur bola rugbi berselimut es murni."
      },
      {
        id: 3,
        question: "Apa nama satu-satunya objek planet kerdil Tata Surya yang letaknya tidak di luar neptunus melainkan di Sabuk Asteroid?",
        options: ["Makemake", "Ceres", "Eris", "Charon"],
        answerIdx: 1,
        explanation: "Ceres adalah planet kerdil terkecil yang berdiam di sabuk asteroid antara Mars dan Jupiter. Berdiameter 940 km, Ceres sempat dilabeli sebagai asteroid terbesar sebelum dinaikkan statusnya tahun 2006."
      },
      {
        id: 4,
        question: "Penemuan objek planet kerdil padat manakah yang memaksa para astronom merombak total definisi planet utama?",
        options: ["Vesta", "Eris", "Haumea", "Makemake"],
        answerIdx: 1,
        explanation: "Ditemukan tahun 2005 di luar Kuiper Belt, Eris memiliki massa 27% lebih besar dari Pluto. Penemuan inilah yang memicu perdebatan kencang apakah Eris layak diangkat jadi planet kesepuluh atau Pluto yang diturunkan."
      },
      {
        id: 5,
        question: "Fitur permukaan ikonik berlapis es nitrogen halus berbentuk lukisan jantung di Pluto dinamakan...",
        options: ["Sputnik Planitia / Tombaugh Regio", "Celia Planum", "Pluto Heart Crater", "Valles Charon"],
        answerIdx: 0,
        explanation: "Tombaugh Regio adalah daerah dataran es nitrogen berbentuk hati raksasa yang dinamai untuk menghormati Clyde Tombaugh, astronom penemu planet Pluto pada tahun 1930."
      },
      {
        id: 6,
        question: "Berapa lama waktu revolusi yang harus dilalui Pluto untuk mengitar matahari satu kali lingkaran penuh?",
        options: ["88 Tahun Bumi", "165 Tahun Bumi", "248 Tahun Bumi", "500 Tahun Bumi"],
        answerIdx: 2,
        explanation: "Dengan jarak rata-rata 5,9 Miliar km, Pluto membutuhkan waktu 248 Tahun Bumi untuk mengelilingi matahari sekali putaran. Sejak ditemukan tahun 1930, Pluto bahkan belum merayakan satu tahun revolusi penuhnya!"
      },
      {
        id: 7,
        question: "Planet kerdil es di sabuk Kuiper yang dinamai berdasarkan nama dewa pencipta kemakmuran dalam mitologi klasik Rapanui adalah...",
        options: ["Haumea", "Makemake", "Ceres", "Pluto"],
        answerIdx: 1,
        explanation: "Makemake ditemukan tahun 2005. Sesuai konvensi penamaan IAU untuk objek trans-neptunus beku, dipilihlah nama Makemake yaitu dewa pencipta manusia dan kesuburan penduduk Pulau Paskah (Rapa Nui)."
      },
      {
        id: 8,
        question: "Definisi mutlak kriteria planet utama IAU keberapa yang gagal dipenuhi Pluto sehingga turun takhta?",
        options: [
          "Wajib mengitari Bintang Matahari",
          "Wajib berbentuk bulat hidrostatik akibat gravitasinya sendiri",
          "Wajib menyapu orbitalnya bersih dari tetangga objek kecil lain (clearing the neighborhood)",
          "Wajib memiliki satelit alami minimal satu buah"
        ],
        answerIdx: 2,
        explanation: "Pluto kalah di kriteria ketiga. Karena gravitasinya belum cukup besar untuk menyapu bersih serpihan benda es batuan di jalur orbit elips miringnya yang bertumpukan dengan wilayah sabuk donat Kuiper."
      },
      {
        id: 9,
        question: "Apa nama satelit alami terbesar yang setia mengitari planet kerdil Eris?",
        options: ["Charon", "Dysnomia", "Nix", "Namaka"],
        answerIdx: 1,
        explanation: "Dysnomia adalah bulan tunggal pendamping Eris yang berdiameter sekitar 700 km. Dalam mitologi Yunani, Dysnomia dilambangkan sebagai anak dewi pertikaian Eris yang merepresentasikan kekacauan hukum."
      },
      {
        id: 10,
        question: "Wilayah orbital sabuk es tempat hampir seluruh planet kerdil tersembunyi berinduk di perbatasan beku tata surya adalah...",
        options: ["Awan Oort", "Sabuk Kuiper (Trans-Neptunian)", "Sektor Asteroid Ekuator", "Sabuk Van Allen"],
        answerIdx: 1,
        explanation: "Kecuali Ceres yang mendiami sabuk asteroid dalam, seluruh planet kerdil beku dingin (Pluto, Eris, Haumea, Makemake) berdiam manis di wilayah dinamis Sabuk Kuiper di luar garis orbit Neptunus."
      }
    ]
  },
  {
    id: 10,
    title: "Sejarah Astronomi & Jagat Raya",
    difficulty: "Sulit",
    description: "Uji sejarah revolusi ilmiah dari Claudius Ptolemaeus, Nicolaus Copernicus, Galileo Galilei, hingga Kepler.",
    questions: [
      {
        id: 1,
        question: "Astronom klasik Yunani kuno yang merumuskan model alam semesta Geosentris tebal berabad-abad bernama...",
        options: ["Aristoteles", "Claudius Ptolemaeus", "Eratosthenes", "Copernicus"],
        answerIdx: 1,
        explanation: "Ptolemaeus menulis risalah ilmiah 'Almagest' pada abad ke-2 Masehi, melahirkan detail model Geosentris yang menempatkan Bumi diam di pusat kosmik dengan planet-matahari berputar mengitarinya."
      },
      {
        id: 2,
        question: "Siapakah ilmuwan Polandia yang mendobrak sejarah merilis model Heliosentrisme lewat risalahnya tahun 1543?",
        options: ["Johannes Kepler", "Nicolaus Copernicus", "Tycho Brahe", "Isaac Newton"],
        answerIdx: 1,
        explanation: "Nicolaus Copernicus menerbitkan karya revolusioner 'De revolutionibus orbium coelestium' menjelang wafatnya tahun 1543, memicu transisi ilmiah membuktikan Matahari terletak sebagai pusat edaran planet."
      },
      {
        id: 3,
        question: "Astronom yang pertama kali mengarahkan lensa teleskop refraktor ciptaannya ke langit menemukan bulan Jupiter adalah...",
        options: ["Johannes Kepler", "Christiaan Huygens", "Galileo Galilei", "William Herschel"],
        answerIdx: 2,
        explanation: "Pada tahun 1610, Galileo Galilei mengamati empat bulan terbesar Jupiter (Io, Europa, Ganymede, Callisto). Penemuan ini membuktikan tidak semua benda langit berputar mengitari bumi, mengguncang fondasi geosentris."
      },
      {
        id: 4,
        question: "Siapa ilmuwan Inggris yang menjabarkan teori gravitasi matematika kalkulus modern pengayom gerak orbit?",
        options: ["Albert Einstein", "Isaac Newton", "Stephen Hawking", "Robert Hooke"],
        answerIdx: 1,
        explanation: "Sir Isaac Newton menerbitkan karya akbar 'Philosophiae Naturalis Principia Mathematica' tahun 1687, menyatukan hukum fisika gerak apel jatuh dengan dinamika meluncur elips orbit planet di langit."
      },
      {
        id: 5,
        question: "Teori ilmiah kosmis modern yang mengisahkan proses lahirnya Matahari dan planet dari keruntuhan awan gas debu awan besar adalah...",
        options: ["Teori Steady State", "Teori Ledakan Dahsyat (Big Bang)", "Hipotesis Nebula (Kondensasi Gas)", "Teori Keadaan Tunak Semesta"],
        answerIdx: 2,
        explanation: "Hipotesis Nebula dipopulerkan oleh Immanuel Kant dan Pierre-Simon Laplace. Menceritakan awan debu gas purba (nebula) yang berotasi lambat mengkerut runtuh akibat gravitasinya membentuk cakram piringan Tata Surya."
      },
      {
        id: 6,
        question: "Astronom Jerman yang merumuskan tiga hukum pergerakan orbit planet secara matematis berdasarkan data observasi Mars adalah...",
        options: ["Tycho Brahe", "Johannes Kepler", "Christian Doppler", "Heinrich Hertz"],
        answerIdx: 1,
        explanation: "Johannes Kepler menganalisis catatan data observasi mars super akurat milik mentornya Tycho Brahe, mengoreksi klaim orbit bundar epicycle Copernicus menjadi elips murni yang dituangkan dalam 3 Hukum Kepler."
      },
      {
        id: 7,
        question: "Alat navigasi kuno berbentuk susunan cincin logam yang menyerupai sirkulasi koordinat ekuator langit sebelum teleskop adalah...",
        options: ["Astrolabe", "Armillary Sphere (Bola Armiler)", "Sekstan Perunggu", "Kuadran Astronomis"],
        answerIdx: 1,
        explanation: "Bola Armiler (Armillary Sphere) adalah replika bola langit kuno yang tersusun dari cincin logam melambangkan lingkaran penting meridian khayal, lintasan tahunan ekliptika, dan khatulistiwa astronomis langit."
      },
      {
        id: 8,
        question: "Astronom yang membenarkan penemuan meluasnya ekspansi kosmik dan galaksi bergerak saling menjauh tahun 1929 adalah...",
        options: ["Albert Einstein", "Edwin Hubble", "Carl Sagan", "Arthur Eddington"],
        answerIdx: 1,
        explanation: "Edwin Hubble mengukur pergeseran merah cahaya galaksi jauh dan merumuskan Hukum Hubble, menyuguhkan fakta berharga bahwa alam semesta kita tidak statis melainkan aktif mengembang menjalar dinamis."
      },
      {
        id: 9,
        question: "Planet Neptunus diprediksi secara kalkulasi matematika sebelum lensa teleskop melihatnya akibat penyimpangan pada orbit...",
        options: ["Saturnus", "Jupiter", "Uranus", "Pluto"],
        answerIdx: 2,
        explanation: "Astronom mendeteksi ganjalan gravitasi aneh pada lintasan orbit Uranus yang baru ditemukan. Alexis Bouvard memprediksi ada raksasa gaib luar yang menariknya, menuntun penemuan Neptunus murni via analisis matematika."
      },
      {
        id: 10,
        question: "Misi satelit pemetaan astrometri tercanggih milik Badan Antariksa Eropa (ESA) untuk mengukur koordinat miliaran bintang adalah...",
        options: ["Hubble Core", "Planck Mission", "Gaia Space Observatory", "SOHO satellite"],
        answerIdx: 2,
        explanation: "Gaia diluncurkan ESA tahun 2013, ditugaskan mencatat paralaks bintang, gerak diri bintang, dan klasifikasi spektroskopi super presisi dari 1,8 miliar bintang bima sakti demi peta galaksi 3D termegah."
      }
    ]
  }
];

export const Quiz: React.FC<QuizProps> = ({ isOpen, onClose }) => {
  // State for pack selection
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null);

  // Active quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const handleSelectPack = (packId: number) => {
    SpaceAudio.playSelect();
    setSelectedPackId(packId);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const activePack = selectedPackId !== null ? QUIZ_PACKS.find(p => p.id === selectedPackId) : null;
  const currentQuestion = activePack ? activePack.questions[currentIdx] : null;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    SpaceAudio.playClick();
    setSelectedOpt(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOpt === null || isAnswered || !currentQuestion) return;

    setIsAnswered(true);
    if (selectedOpt === currentQuestion.answerIdx) {
      SpaceAudio.playQuizSuccess();
      setScore(s => s + 1);
    } else {
      SpaceAudio.playQuizFail();
    }
  };

  const handleNextQuestion = () => {
    if (!activePack) return;
    SpaceAudio.playClick();
    if (currentIdx < activePack.questions.length - 1) {
      setCurrentIdx(c => c + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const resetQuiz = () => {
    SpaceAudio.playWarp();
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleBackToPacks = () => {
    SpaceAudio.playSelect();
    setSelectedPackId(null);
    resetQuiz();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 overflow-y-auto flex items-start sm:items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto">
        
        {/* Header bar */}
        <div className="flex justify-between items-center bg-zinc-900 px-5 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            {selectedPackId !== null ? (
              <button 
                onClick={handleBackToPacks}
                className="p-1 px-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-1 text-xs transition-colors transition-transform duration-100 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>
            ) : (
              <Gamepad2 className="text-yellow-400 w-5 h-5 animate-bounce" />
            )}
            <span className="font-extrabold tracking-tight text-white text-sm sm:text-base">
              {selectedPackId !== null ? `Kuis: ${activePack?.title}` : "Pusat Kuis Tata Surya"}
            </span>
          </div>
          <button 
            onClick={() => { SpaceAudio.playClick(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Inner views */}
        {selectedPackId === null ? (
          /* Pack choosing view */
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide">
            <div className="text-center space-y-1.5 pb-2">
              <h2 className="text-zinc-100 font-extrabold text-base uppercase tracking-wide">Pilih Paket Trivia Edukasi</h2>
              <p className="text-zinc-400 text-xs text-justify sm:text-center leading-relaxed max-w-md mx-auto">
                Tersedia 10 paket eksplorasi pengetahuan astronomis dan sejarah antariksa yang bervariasi. Sempurnakan skor Anda!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              {QUIZ_PACKS.map(pack => (
                <button
                  key={pack.id}
                  onClick={() => handleSelectPack(pack.id)}
                  className="bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-yellow-500/35 p-3.5 rounded-xl text-left transition-all duration-200 group flex flex-col justify-between gap-2 shadow-sm hover:translate-y-[-1px]"
                >
                  <div className="w-full">
                    {/* Header badge row */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-yellow-400">PAKET {pack.id}</span>
                      <span className={`text-[9px] font-black rounded px-1.5 py-0.5 uppercase tracking-wide flex items-center gap-0.5 font-mono ${
                        pack.difficulty === 'Mudah' 
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400' 
                          : pack.difficulty === 'Sedang'
                          ? 'bg-orange-950/80 border border-orange-800 text-orange-400'
                          : 'bg-rose-950/80 border border-rose-800 text-rose-400'
                      }`}>
                        <Gauge className="w-2.5 h-2.5" /> {pack.difficulty}
                      </span>
                    </div>
                    {/* Title */}
                    <h3 className="text-white font-bold text-sm tracking-tight group-hover:text-yellow-400 transition-colors">{pack.title}</h3>
                    {/* Description */}
                    <p className="text-zinc-400 text-[11px] leading-relaxed mt-1 line-clamp-2">{pack.description}</p>
                  </div>
                  {/* Enter indicator footer */}
                  <span className="text-[10px] text-yellow-500/80 group-hover:text-yellow-400 font-extrabold uppercase mt-1 flex items-center gap-0.5 justify-end w-full">
                    Mulai Eksplorasi <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Playing View */
          <div className="p-5 flex-1 flex flex-col justify-between">
            {activePack && currentQuestion && !isFinished ? (
              <div className="space-y-4">
                {/* Progress bar info */}
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-zinc-800 text-yellow-400 px-2.5 py-1 rounded font-extrabold uppercase tracking-widest font-mono">
                    Soal {currentIdx + 1} / {activePack.questions.length}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold font-mono">Skor: {score}</span>
                </div>

                {/* Progress fluid gauge */}
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-yellow-400 h-full transition-all duration-300" 
                    style={{ width: `${((currentIdx + 1) / activePack.questions.length) * 100}%` }}
                  />
                </div>

                {/* Question block */}
                <div className="space-y-1 mt-1">
                  <div className="flex gap-2.5 items-start">
                    <HelpCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <h3 className="text-white font-extrabold text-sm sm:text-base leading-snug">{currentQuestion.question}</h3>
                  </div>
                </div>

                {/* Question choices */}
                <div className="space-y-2 pt-1">
                  {currentQuestion.options.map((opt, idx) => {
                    let optStyle = "border-white/5 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:border-white/25";
                    
                    if (selectedOpt === idx) {
                      optStyle = "border-yellow-400 bg-yellow-400/10 text-yellow-300";
                    }

                    if (isAnswered) {
                      if (idx === currentQuestion.answerIdx) {
                        optStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold";
                      } else if (selectedOpt === idx) {
                        optStyle = "border-rose-500 bg-rose-500/10 text-rose-400 line-through opacity-80";
                      } else {
                        optStyle = "opacity-30 border-white/5 bg-zinc-900 text-zinc-500";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all duration-150 flex items-center justify-between leading-snug ${optStyle}`}
                      >
                        <span className="pr-4">{opt}</span>
                        {isAnswered && idx === currentQuestion.answerIdx && (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        {isAnswered && selectedOpt === idx && idx !== currentQuestion.answerIdx && (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Educational description box */}
                {isAnswered && (
                  <div className="bg-zinc-900/65 border border-white/5 rounded-xl p-3.5 text-xs text-zinc-300 leading-relaxed space-y-1 animate-fade-in">
                    <span className="font-extrabold text-yellow-400 block tracking-wider uppercase font-mono text-[10px]">Edukasi Kosmik:</span>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}

                {/* Action buttons footer */}
                <div className="pt-2 border-t border-white/5">
                  {!isAnswered ? (
                    <button
                      onClick={handleConfirmAnswer}
                      disabled={selectedOpt === null}
                      className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg text-center uppercase tracking-wider ${
                        selectedOpt !== null 
                          ? 'bg-yellow-400 text-zinc-950 hover:bg-yellow-500 cursor-pointer active:scale-[0.98]' 
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      Konfirmasi Jawaban
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full bg-yellow-400 text-zinc-950 hover:bg-yellow-500 py-3 rounded-xl font-black text-xs sm:text-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      {currentIdx < activePack.questions.length - 1 ? "Soal Berikutnya" : "Lihat Hasil Akhir"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Completion board view */
              <div className="text-center space-y-5 py-4 flex flex-col items-center">
                <Award className="w-16 h-16 text-yellow-400 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Hasil Paket: {activePack?.title}</h3>
                  <p className="text-xs text-zinc-400">Paket edukasi diselesaikan dengan nilai kuis sebagai berikut.</p>
                </div>

                {/* Circular Score tracker */}
                <div className="w-28 h-28 rounded-full border-4 border-zinc-800 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black shadow-xl">
                  <div className="text-center select-none font-mono">
                    <span className="text-4xl font-black text-yellow-400">{score * 10}</span>
                    <span className="text-xs text-zinc-500 block font-sans tracking-wide">Poin Maks 100</span>
                    <span className="text-[10px] text-zinc-400">({score} / {activePack?.questions.length} Benar)</span>
                  </div>
                </div>

                {/* Narrative comments */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed px-4 max-w-sm">
                  {score === (activePack?.questions.length || 10)
                    ? "Sempurna! Kamu adalah Mahasiswa Kehormatan Ilmu Astronomi. Pengetahuan Anda sangat komprehensif!" 
                    : score >= 7 
                    ? "Hebat sekali! Anda sudah sangat mapan dalam memahami seluk-beluk alam semesta Kita." 
                    : "Wawasan bagus! Anda bisa menyisir infobox detail planet di atlas utama lalu mengulangi tes ini."}
                </p>

                {/* Complete control actions grids */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-1.5">
                  <button
                    onClick={resetQuiz}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-white border border-white/10 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" /> Ulangi Paket Ini
                  </button>
                  <button
                    onClick={handleBackToPacks}
                    className="w-full bg-yellow-400 text-zinc-950 hover:bg-yellow-500 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 uppercase"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" /> Pilih Paket Lain
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
