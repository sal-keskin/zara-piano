/* Step-by-step lessons. Step types:
   info     – read & look (keys in `show` glow)
   press    – press one of `keys` (`times` times)
   each     – press every key in `keys` at least once, any order
   sequence – play `notes` in order (the next key glows)
   echo     – the app plays `notes`, then the child copies them
   quiz     – pick an answer (`play` notes are played as the question)
   mic      – hear `count` notes from the real piano via the microphone */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  const WHITE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
  const BLACK = ['C#4', 'D#4', 'F#4', 'G#4', 'A#4', 'C#5', 'D#5'];

  const LESSONS = [
    { id: 'meet', emoji: '🎹', xp: 40,
      title: { en: 'Meet Your Piano', tr: 'Piyanonla Tanış' },
      steps: [
        { type: 'info', show: WHITE.concat(BLACK),
          text: { en: 'Hello, little pianist! 👋 Your piano has 18 keys: 11 white keys and 7 black keys. Every key has its own coloured dot on the brown board.',
                  tr: 'Merhaba küçük piyanist! 👋 Piyanonda 18 tuş var: 11 beyaz ve 7 siyah tuş. Her tuşun kahverengi panoda kendine ait renkli bir noktası var.' } },
        { type: 'info', show: ['C4', 'F5'],
          text: { en: 'Keys on the LEFT make LOW sounds, like a big bear 🐻. Keys on the RIGHT make HIGH sounds, like a tiny bird 🐦.',
                  tr: 'SOLDAKİ tuşlar KALIN ses çıkarır, kocaman bir ayı gibi 🐻. SAĞDAKİ tuşlar İNCE ses çıkarır, minik bir kuş gibi 🐦.' } },
        { type: 'press', keys: ['C4'],
          text: { en: 'Press the key on the far LEFT — the Cream dot. Low like a bear! 🐻', tr: 'En SOLDAKİ tuşa bas — Krem nokta. Ayı gibi kalın! 🐻' } },
        { type: 'press', keys: ['F5'],
          text: { en: 'Now press the key on the far RIGHT — the Mint dot. High like a bird! 🐦', tr: 'Şimdi en SAĞDAKİ tuşa bas — Nane nokta. Kuş gibi ince! 🐦' } },
        { type: 'quiz', play: 'G4:1 R:0.5 D5:1',
          text: { en: 'Listen! 👂 Which sound was HIGHER?', tr: 'Dinle! 👂 Hangi ses daha İNCEYDİ?' },
          options: [{ en: '1st sound', tr: '1. ses' }, { en: '2nd sound', tr: '2. ses' }], answer: 1 },
        { type: 'sequence', notes: WHITE.join(' '),
          text: { en: 'Play every white key from left to right. Hear the sound climb up like stairs! 🪜', tr: 'Bütün beyaz tuşları soldan sağa çal. Sesin merdiven gibi yükseldiğini duy! 🪜' } }
      ] },

    { id: 'families', emoji: '🐾', xp: 40,
      title: { en: 'Black Key Families', tr: 'Siyah Tuş Aileleri' },
      steps: [
        { type: 'info', show: BLACK,
          text: { en: 'Look at the black keys. They live in little families: a family of 2, a family of 3, and one more family of 2.',
                  tr: 'Siyah tuşlara bak. Küçük aileler halinde yaşıyorlar: 2\'li bir aile, 3\'lü bir aile ve bir 2\'li aile daha.' } },
        { type: 'each', keys: ['C#4', 'D#4'],
          text: { en: 'Press the 2 black keys of the first family: the Ocean and Sand dots.', tr: 'İlk ailenin 2 siyah tuşuna bas: Okyanus ve Kum noktaları.' } },
        { type: 'each', keys: ['F#4', 'G#4', 'A#4'],
          text: { en: 'Now press the family of 3: Berry, Violet and Slate.', tr: 'Şimdi 3\'lü aileye bas: Böğürtlen, Mor ve Kurşuni.' } },
        { type: 'quiz',
          text: { en: 'How many black keys are in the BIG family?', tr: 'BÜYÜK ailede kaç siyah tuş var?' },
          options: [{ en: '2', tr: '2' }, { en: '3', tr: '3' }, { en: '4', tr: '4' }], answer: 1 },
        { type: 'each', keys: ['C#5', 'D#5'],
          text: { en: 'Find the last family of 2 on the right: Olive and Navy.', tr: 'Sağdaki son 2\'li aileyi bul: Zeytin ve Lacivert.' } }
      ] },

    { id: 'home-c', emoji: '🏠', xp: 40,
      title: { en: 'Find C (Do) — the Home Key', tr: 'Do\'yu Bul — Ev Tuşu' },
      steps: [
        { type: 'info', show: ['C4', 'C5'],
          text: { en: 'Many songs live at home on C (Do). Easy to find: C is the white key just LEFT of the 2 black keys.',
                  tr: 'Birçok şarkının evi Do (C) tuşudur. Bulması kolay: Do, 2\'li siyah tuşların hemen SOLUNDAKİ beyaz tuştur.' } },
        { type: 'press', keys: ['C4'],
          text: { en: 'Press the first C — the Cream dot.', tr: 'İlk Do\'ya bas — Krem nokta.' } },
        { type: 'press', keys: ['C5'],
          text: { en: 'Your piano has another C! Press the Gold dot C. ✨', tr: 'Piyanonda bir Do daha var! Altın noktalı Do\'ya bas. ✨' } },
        { type: 'quiz', play: 'C4:1 R:0.5 C5:1',
          text: { en: 'Is the Gold C higher or lower than the Cream C?', tr: 'Altın Do, Krem Do\'dan daha ince mi, daha kalın mı?' },
          options: [{ en: 'Higher ⬆️', tr: 'Daha ince ⬆️' }, { en: 'Lower ⬇️', tr: 'Daha kalın ⬇️' }], answer: 0 },
        { type: 'sequence', notes: 'C4 C5 C4 C5',
          text: { en: 'Jump between the two Cs like a kangaroo! 🦘', tr: 'İki Do arasında kanguru gibi zıpla! 🦘' } }
      ] },

    { id: 'do-re-mi', emoji: '🎵', xp: 40,
      title: { en: 'Do, Re, Mi (C, D, E)', tr: 'Do, Re, Mi' },
      steps: [
        { type: 'info', show: ['C4', 'D4', 'E4'], hand: true,
          text: { en: 'Put your right THUMB (finger 1) on Cream C. Finger 2 goes on Sky D, finger 3 on Pink E.',
                  tr: 'Sağ elinin BAŞPARMAĞINI (1. parmak) Krem Do\'ya koy. 2. parmak Gökyüzü Re\'ye, 3. parmak Pembe Mi\'ye.' } },
        { type: 'sequence', notes: 'C4 D4 E4',
          text: { en: 'Play C, D, E — walking UP the stairs.', tr: 'Do, Re, Mi çal — merdivenden YUKARI çık.' } },
        { type: 'sequence', notes: 'E4 D4 C4',
          text: { en: 'Now walk DOWN: E, D, C.', tr: 'Şimdi AŞAĞI in: Mi, Re, Do.' } },
        { type: 'echo', notes: 'C4 D4 E4 D4 C4',
          text: { en: 'Copycat! 🐱 Listen, then play the same notes.', tr: 'Taklitçi kedi! 🐱 Dinle, sonra aynı notaları çal.' } },
        { type: 'sequence', notes: 'E4 D4 C4 E4 D4 C4',
          text: { en: 'Yay! This is the start of "Hot Cross Buns"! 🥯', tr: 'Yaşasın! Bu "Sıcak Çörekler" şarkısının başlangıcı! 🥯' } }
      ] },

    { id: 'five-fingers', emoji: '🖐️', xp: 40,
      title: { en: 'Five Finger Friends', tr: 'Beş Parmak Dostları' },
      steps: [
        { type: 'info', show: ['C4', 'D4', 'E4', 'F4', 'G4'], hand: true,
          text: { en: 'Every finger gets its own key! Thumb on C, then D, E, F (Sage) and G (Teal).',
                  tr: 'Her parmağın kendi tuşu var! Başparmak Do\'da, sonra Re, Mi, Fa (Adaçayı) ve Sol (Deniz).' } },
        { type: 'sequence', notes: 'C4 D4 E4 F4 G4',
          text: { en: 'Play up: C D E F G. One finger for each key.', tr: 'Yukarı çal: Do Re Mi Fa Sol. Her tuşa bir parmak.' } },
        { type: 'sequence', notes: 'G4 F4 E4 D4 C4',
          text: { en: 'And down again: G F E D C.', tr: 'Ve tekrar aşağı: Sol Fa Mi Re Do.' } },
        { type: 'echo', notes: 'C4 E4 G4',
          text: { en: 'A jumping pattern! Listen and copy.', tr: 'Zıplayan notalar! Dinle ve taklit et.' } },
        { type: 'sequence', notes: 'C4 C4 G4 G4 A4 A4 G4',
          text: { en: 'Twinkle, twinkle, little star… ⭐ (Ice A is right next to Teal G!)', tr: 'Twinkle twinkle little star… ⭐ (Buz La, Deniz Sol\'un hemen yanında!)' } }
      ] },

    { id: 'rainbow', emoji: '🌈', xp: 40,
      title: { en: 'The Whole Rainbow', tr: 'Bütün Gökkuşağı' },
      steps: [
        { type: 'info', show: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
          text: { en: 'Meet the rest of the white keys: A (Ice), B (Snow), and the high C (Gold), D (Aqua), E (Peach) and F (Mint).',
                  tr: 'Diğer beyaz tuşlarla tanış: La (Buz), Si (Kar) ve ince Do (Altın), Re (Su), Mi (Şeftali) ve Fa (Nane).' } },
        { type: 'sequence', notes: 'G4 A4 B4 C5',
          text: { en: 'Climb from Teal G up to Gold C.', tr: 'Deniz Sol\'dan Altın Do\'ya tırman.' } },
        { type: 'sequence', notes: 'C4 D4 E4 F4 G4 A4 B4 C5',
          text: { en: 'This is a SCALE — a musical ladder from C to C! 🪜', tr: 'Bu bir GAM — Do\'dan Do\'ya müzikli bir merdiven! 🪜' } },
        { type: 'quiz',
          text: { en: 'What colour is the dot of the HIGH C?', tr: 'İNCE Do\'nun noktası ne renk?' },
          options: [{ en: 'Gold ✨', tr: 'Altın ✨' }, { en: 'Cream', tr: 'Krem' }, { en: 'Mint', tr: 'Nane' }], answer: 0 },
        { type: 'echo', notes: 'C5 B4 A4 G4',
          text: { en: 'Copycat on the high keys!', tr: 'İnce tuşlarda taklitçi kedi!' } }
      ] },

    { id: 'rhythm', emoji: '⏱️', xp: 40,
      title: { en: 'Long and Short Notes', tr: 'Uzun ve Kısa Notalar' },
      steps: [
        { type: 'info', show: ['C4'],
          text: { en: 'Some notes are short like a bunny hop 🐇, some are long like a big yawn 🥱. In the songs, long notes have a long tail.',
                  tr: 'Bazı notalar tavşan zıplaması gibi kısadır 🐇, bazıları kocaman bir esneme gibi uzundur 🥱. Şarkılarda uzun notaların uzun kuyruğu var.' } },
        { type: 'echo', notes: 'C4:1 C4:1 C4:2',
          text: { en: 'Listen: short, short, looong. Copy it!', tr: 'Dinle: kısa, kısa, uzuuun. Taklit et!' } },
        { type: 'quiz', play: 'E4:0.5 E4:0.5 E4:2',
          text: { en: 'Listen. Which note was the LONGEST?', tr: 'Dinle. Hangi nota EN UZUNDU?' },
          options: [{ en: '1st', tr: '1.' }, { en: '2nd', tr: '2.' }, { en: '3rd', tr: '3.' }], answer: 2 },
        { type: 'sequence', notes: 'C4 C4 G4 G4 A4 A4 G4:2',
          text: { en: 'Play "Twinkle twinkle little star". Hold the last note a bit longer!', tr: '"Twinkle twinkle little star" çal. Son notayı biraz daha uzun tut!' } }
      ] },

    { id: 'sharps', emoji: '✨', xp: 50,
      title: { en: 'Black Key Magic (♯ and ♭)', tr: 'Siyah Tuş Sihri (♯ ve ♭)' },
      steps: [
        { type: 'info', show: ['F4', 'F#4'],
          text: { en: 'A black key just RIGHT of a white key is called SHARP (♯). The black key right of F is F♯ — the Berry dot.',
                  tr: 'Bir beyaz tuşun hemen SAĞINDAKİ siyah tuşa DİYEZ (♯) denir. Fa\'nın sağındaki siyah tuş Fa♯ — Böğürtlen nokta.' } },
        { type: 'press', keys: ['F#4'],
          text: { en: 'Press F♯ — the Berry dot.', tr: 'Fa♯\'e bas — Böğürtlen nokta.' } },
        { type: 'info', show: ['A#4'],
          text: { en: 'Black keys have TWO names! The Slate key is A♯, but it is also called B♭ (B flat) because it is just LEFT of B.',
                  tr: 'Siyah tuşların İKİ adı var! Kurşuni tuş La♯, ama Si\'nin hemen SOLUNDA olduğu için Si♭ (Si bemol) de denir.' } },
        { type: 'press', keys: ['A#4'],
          text: { en: 'Press B♭ (A♯) — the Slate dot.', tr: 'Si♭\'e (La♯) bas — Kurşuni nokta.' } },
        { type: 'sequence', notes: 'F4 G4 A4 A#4 C5',
          text: { en: 'Play F, G, A, B♭, C. You used a black key! 🎉', tr: 'Fa, Sol, La, Si♭, Do çal. Siyah tuş kullandın! 🎉' } },
        { type: 'sequence', notes: 'C4 C4 D4 C4 F4 E4',
          text: { en: 'Happy birthday to you… 🎂 You can already play this!', tr: 'İyi ki doğdun… 🎂 Bunu çalabiliyorsun bile!' } }
      ] },

    { id: 'ears', emoji: '👂', xp: 40,
      title: { en: 'Copycat Ears', tr: 'Taklitçi Kulaklar' },
      steps: [
        { type: 'echo', notes: 'C4 E4', text: { en: 'Listen carefully and copy: 2 notes.', tr: 'Dikkatle dinle ve taklit et: 2 nota.' } },
        { type: 'echo', notes: 'G4 E4 C4', text: { en: 'Now 3 notes, going down.', tr: 'Şimdi 3 nota, aşağı iniyor.' } },
        { type: 'echo', notes: 'C4 D4 E4 C4', text: { en: '4 notes! You\'re doing great.', tr: '4 nota! Harika gidiyorsun.' } },
        { type: 'quiz', play: 'E5:1 R:0.5 C4:1',
          text: { en: 'Did the music go UP or DOWN?', tr: 'Müzik YUKARI mı çıktı, AŞAĞI mı indi?' },
          options: [{ en: 'Up ⬆️', tr: 'Yukarı ⬆️' }, { en: 'Down ⬇️', tr: 'Aşağı ⬇️' }], answer: 1 },
        { type: 'echo', notes: 'E4 G4 A4 G4', text: { en: 'Last one — a little tune!', tr: 'Sonuncusu — küçük bir melodi!' } }
      ] },

    { id: 'song-book', emoji: '📖', xp: 40,
      title: { en: 'Reading the Song Book', tr: 'Şarkı Kitabını Okumak' },
      steps: [
        { type: 'info', show: ['C4', 'G4', 'A4'],
          text: { en: 'Your piano came with a song book. Under every note there is a coloured dot — the same colour as a dot on your piano. Find the dot, play the key!',
                  tr: 'Piyanonla bir şarkı kitabı geldi. Her notanın altında renkli bir nokta var — piyanondaki bir noktayla aynı renk. Noktayı bul, tuşa bas!' } },
        { type: 'info', show: ['C4', 'G4', 'A4'],
          text: { en: 'Twinkle in the book starts: Cream, Cream, Teal, Teal, Ice, Ice, Teal.', tr: 'Kitapta Twinkle şöyle başlar: Krem, Krem, Deniz, Deniz, Buz, Buz, Deniz.' } },
        { type: 'sequence', notes: 'C4 C4 G4 G4 A4 A4 G4',
          text: { en: 'Play the first line of Twinkle.', tr: 'Twinkle\'ın ilk satırını çal.' } },
        { type: 'sequence', notes: 'F4 F4 E4 E4 D4 D4 C4',
          text: { en: 'And the second line: Sage, Sage, Pink, Pink, Sky, Sky, Cream.', tr: 'Ve ikinci satır: Adaçayı, Adaçayı, Pembe, Pembe, Gökyüzü, Gökyüzü, Krem.' } },
        { type: 'info', show: ['D4', 'A4', 'D5'],
          text: { en: 'Tip: some dots look alike (there are 3 light blue ones!). Then look WHERE the key is: next to which black keys?',
                  tr: 'İpucu: bazı noktalar birbirine benziyor (3 tane açık mavi var!). O zaman tuşun NEREDE olduğuna bak: hangi siyah tuşların yanında?' } }
      ] },

    { id: 'listen', emoji: '🎤', xp: 50,
      title: { en: 'Let the App Listen!', tr: 'Uygulama Seni Dinlesin!' },
      steps: [
        { type: 'info',
          text: { en: 'This app can LISTEN to your real piano with the microphone 🎤. Ask a grown-up to tap "Allow" when the browser asks.',
                  tr: 'Bu uygulama gerçek piyanonu mikrofonla DİNLEYEBİLİR 🎤. Tarayıcı sorduğunda bir büyüğünden "İzin ver"e dokunmasını iste.' } },
        { type: 'mic', count: 3,
          text: { en: 'Play 3 keys on your REAL piano. When the app hears a key, it lights up here!', tr: 'GERÇEK piyanonda 3 tuşa bas. Uygulama bir tuş duyunca burada yanacak!' } },
        { type: 'info',
          text: { en: 'Super! Now the app can follow you while you play songs on your real piano. Turn on 🎤 in any song, or try the Real Piano Helper.',
                  tr: 'Süper! Artık sen gerçek piyanoda şarkı çalarken uygulama seni takip edebilir. Herhangi bir şarkıda 🎤\'u aç ya da Gerçek Piyano Yardımcısını dene.' } }
      ] }
  ];

  ZP.lessons = { LESSONS, WHITE, BLACK };
})(window.ZP);
