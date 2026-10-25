/* English & Turkish UI text. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  const STR = {
    en: {
      'brand.sub': 'learn & play your mini piano',
      footer: 'Unofficial, fan-made learning guide for the 18-key "the little pianist" toy piano. Not affiliated with Zara Home.',
      error: 'Oops, something went wrong',
      home: 'Home', back: 'Back', next: 'Next', start: 'Start', play: 'Play', stop: 'Stop', open: 'Open',
      again: 'Again', restart: 'Restart', hint: 'Hint', skip: 'Skip', cancel: 'Cancel', delete: 'Delete',
      print: 'Print', yay: 'Yay!', level: 'Level', tempo: 'Speed', showMe: 'Show me', listenAgain: 'Listen again',
      readAloud: 'Read aloud', confirmDelete: 'Delete this song?',
      praise: 'Great job!|Super!|Wonderful!|You did it!|Fantastic!|Bravo!|Yes, that\'s it!|Amazing!',

      'nav.home': 'Home', 'nav.learn': 'Learn', 'nav.songs': 'Songs', 'nav.helper': 'Real Piano', 'nav.games': 'Games',
      'nav.free': 'Free Play', 'nav.stickers': 'Stickers', 'nav.settings': 'Settings',
      'hud.stars': 'Stars', 'hud.streak': 'Day streak',

      'home.morning': 'Good morning, little pianist! ☀️', 'home.afternoon': 'Hello, little pianist! 🌼', 'home.evening': 'Good evening, little pianist! 🌙',
      'home.intro': 'You are a <b>{title}</b>. Let\'s make some music together!',
      'home.continue': 'Continue learning', 'home.allLessons': 'All lessons done!', 'home.keepPlaying': 'Keep playing songs',
      'home.daily': 'Song of the day', 'home.realPiano': 'Your real piano',
      'home.helperTitle': 'Real Piano Helper', 'home.helperText': 'Play your toy piano — the app listens and helps!',
      'home.tile.learn': 'Step by step', 'home.tile.songs': '23 songs', 'home.tile.games': 'Music games',
      'home.tile.free': 'Play & record', 'home.tile.stickers': 'Your rewards', 'home.tile.chart': 'All 18 dot colours',

      'guide.title': 'How to use this with your piano',
      'guide.s1': 'Put the tablet or phone on the music stand', 'guide.s1t': 'Right where the song book goes, so you can see the screen and the keys.',
      'guide.s2': 'Match the colours', 'guide.s2t': 'Each key has a coloured dot on the brown board. The app shows the same colours.',
      'guide.s3': 'Start slow', 'guide.s3t': 'Use 🐢 Learn mode: the app waits for you. Later try 🎮 Rhythm mode.',
      'guide.s4': 'Let the app listen', 'guide.s4t': 'Tap 🎤 and play your real piano — the app hears which key you pressed.',
      'guide.try': 'Try it: tap the keys, or use your computer keyboard (A S D F…).',

      'chart.title': 'Colour Key Chart', 'chart.text': 'Every key and its dot colour. Tap one to hear it. Print it and keep it next to the piano!',
      'chart.white': 'white key', 'chart.black': 'black key', 'chart.kbd': 'keyboard',

      'learn.intro': 'Follow the path step by step. Each lesson unlocks the next one! 🗺️',
      'learn.lesson': 'Lesson', 'learn.steps': 'steps', 'learn.next': 'Next lesson', 'learn.all': 'All lessons',
      'lesson.done': 'You finished “{title}”! 🎉',
      'hint.left': '⬅️ A little to the LEFT (lower)!', 'hint.right': '➡️ A little to the RIGHT (higher)!',
      'hint.find': 'Look for the {c} dot.',
      'echo.listen': 'Listen…', 'echo.your': 'Your turn!', 'echo.again': 'Listen again', 'echo.oops': 'Oops! Listen once more 👂',
      'quiz.again': 'Not quite — try again! 🤔',
      'hand.caption': 'Finger numbers: thumb = 1, pinky = 5',

      'songs.intro': 'You have <b>⭐ {n}</b> stars. Collect stars to open new worlds!',
      'songs.world': 'World', 'songs.need': '🔒 Collect {n} more ⭐ to open', 'songs.difficulty': 'Difficulty',
      'songs.blackKeys': 'black keys', 'songs.blackKey': 'black key', 'songs.inBook': 'in book',
      'songs.mine': 'My Songs', 'songs.mineText': 'Songs you made yourself (or a grown-up typed in).', 'songs.create': 'Make a song',

      'mode.listen': 'Listen', 'mode.learn': 'Learn', 'mode.play': 'Rhythm',
      'mode.listen.desc': '👂 Listen to the song first. Watch the keys and dots light up.',
      'mode.learn.desc': '🐢 Play at your own speed — the app waits for the right key. Tap a dot to start from there.',
      'mode.play.desc': '🎮 Notes fall down — play each one when it reaches the line. Lower the speed if it\'s too fast!',
      'listen.tip': 'Tip: lower the speed to listen slowly.',
      'rhythm.guide': 'Melody', 'rhythm.metro': 'Beat', 'rhythm.tip': 'Play when the note touches the line!',

      'res.amazing': 'AMAZING!', 'res.great': 'Great playing!', 'res.good': 'Well done!', 'res.try': 'Good try! Keep practising',
      'res.notes': '🎵 {n} notes', 'res.mistakes': '❌ {n} mistakes', 'res.partial': 'Start from the beginning to earn stars.',
      'res.accuracy': '🎯 Accuracy: {n}%', 'res.perfect': 'Perfect', 'res.goodHits': 'Good', 'res.goodHit': 'Good', 'res.miss': 'Miss', 'res.combo': 'Best combo',
      'print.footer': 'Find the dot colour on your piano and press that key.',

      'mic.realPiano': 'Real piano', 'mic.helpShort': 'Use the microphone to hear your real toy piano',
      'mic.onToast': 'Listening! Play your real piano.', 'mic.listening': 'Listening… play a key!',
      'mic.denied': 'Microphone not allowed. Please allow it in the browser.',
      'mic.unsupported': 'This browser cannot use the microphone (it needs https).',

      'helper.title': 'Real Piano Helper',
      'helper.intro': 'Put this device near your toy piano and tap <b>Start listening</b>. I\'ll show you which key you played and guess your song! 🔮',
      'helper.start': 'Start listening', 'helper.stop': 'Stop listening', 'helper.waiting': 'Play a key…',
      'helper.heard': 'I heard it on your piano! 🎤', 'helper.pressed': 'You pressed it on the screen',
      'helper.sensitivity': 'Sensitivity', 'helper.trail': 'Your notes', 'helper.guess': 'What song is it?',
      'helper.guessHint': 'Play 5+ notes of a song and I\'ll guess it.', 'helper.isIt': 'Is it…',
      'helper.tips': 'Tips: a quiet room works best. If keys are detected wrong, calibrate your piano below — toy pianos are often a bit out of tune.',

      'cal.title': 'Calibrate my piano', 'cal.quick': 'Quick (1 key)', 'cal.full': 'Full (18 keys)', 'cal.reset': 'Reset',
      'cal.statusNone': 'Not calibrated — using standard tuning.', 'cal.statusQuick': 'Quick calibration: shifted {n} semitones.',
      'cal.statusFull': 'Fully calibrated to your piano ✅',
      'cal.press': 'Press the {c} key ({n}) on your real piano and let it ring.',
      'cal.timeout': 'I couldn\'t hear it. Let\'s try that key again — press a bit harder.',
      'cal.done': 'Your piano is calibrated!',

      'games.intro': 'Games to train your ears, eyes and fingers! 🎯',
      'games.best': 'Best', 'games.newBest': 'New best score!', 'games.over': 'Game over', 'games.score': 'Score',
      'game.round': 'Round',
      'game.simon': 'Echo Memory', 'game.simon.desc': 'Listen and repeat a growing tune.',
      'game.simon.how': 'I play some notes, you play them back. Every round gets one note longer!',
      'game.detective': 'Note Detective', 'game.detective.desc': 'Hear a note, find the right key.',
      'game.detective.how': 'Listen to the mystery note, then find it among the glowing keys. 🕵️',
      'game.detective.find': 'Which of the {n} glowing keys was it?',
      'game.rush': 'Rainbow Rush', 'game.rush.desc': 'Press the key of the big dot — fast!',
      'game.rush.how': 'A big coloured dot appears. Press the key with the same colour as fast as you can! 45 seconds.',
      'game.highlow': 'High or Low?', 'game.highlow.desc': 'Is the second note higher or lower?',
      'game.highlow.how': 'Listen to two notes. Did the second one go UP or DOWN?',
      'game.highlow.q': 'Was the 2nd note higher or lower?',
      'hl.higher': 'Higher', 'hl.lower': 'Lower',
      'game.composer': 'Little Composer', 'game.composer.desc': 'Make your own song and practise it!',

      'free.sound': 'Sound', 'free.recorder': 'Recorder', 'free.record': 'Record', 'free.playback': 'Play back', 'free.save': 'Save as song',
      'free.kbdTip': 'Computer keyboard: white keys A S D F G H J K L ; \'  ·  black keys W E T Y U O P',
      'sound.toy': '🧸 Toy piano', 'sound.musicbox': '🎁 Music box', 'sound.piano': '🎹 Piano', 'sound.xylo': '🪵 Xylophone', 'sound.chip': '👾 8-bit',
      'maker.title': 'Song maker', 'maker.name': 'Song name', 'maker.namePh': 'My first song', 'maker.notes': 'Notes', 'maker.untitled': 'My song',
      'maker.help': 'Type notes with spaces: C D E F G A B, high notes C5 D5 E5 F5, black keys C# or Bb. Add :2 for a long note (G:2). New line or | for a new line.',
      'maker.error': '"{tok}" is not a key on this piano.',

      'stick.toNext': '{n} XP to the next level', 'stick.max': 'Top level reached! 👑', 'stick.notes': 'Notes played', 'stick.levels': 'Levels',
      'sticker.new': 'New sticker', 'levelup.title': 'Level {n}!',

      'set.general': 'General', 'set.lang': 'Language', 'set.labels': 'Note names', 'set.letters': 'letters', 'set.none': 'Colours only',
      'set.sound': 'Sound', 'set.volume': 'Volume', 'set.speak': 'Read instructions aloud', 'set.kbd': 'Show computer keys on piano',
      'set.mic': 'Microphone', 'set.micText': 'The app can listen to your real toy piano. Everything stays on this device — no sound is recorded or uploaded.',
      'set.latency': 'Rhythm mode mic delay (ms)',
      'set.parents': 'Parents corner',
      'set.tips': 'Short and often beats long: 5–10 minutes a day is perfect.|Sit next to your child for the first lessons and celebrate every small win.|Start with Learn mode (it waits), then Rhythm mode at 50–70% speed.|Toy pianos are not perfectly in tune — use “Calibrate my piano” if the microphone mixes up keys.|“Read instructions aloud” helps children who can\'t read yet.',
      'set.unlock': 'Unlock all lessons & songs', 'set.export': 'Export progress', 'set.import': 'Import progress',
      'set.imported': 'Progress imported', 'set.importErr': 'That file could not be read',
      'set.reset': 'Reset progress', 'set.resetConfirm': 'Really delete all stars, XP and stickers?',
      'set.about': 'About',
      'set.aboutText': 'Little Pianist Academy is a free, open-source companion for the 18-key mini piano (C to high F). It works offline, has no ads and stores progress only on this device.'
    },

    tr: {
      'brand.sub': 'mini piyanonu öğren ve çal',
      footer: '18 tuşlu "the little pianist" oyuncak piyano için resmi olmayan, hayran yapımı öğrenme rehberi. Zara Home ile bağlantılı değildir.',
      error: 'Hay aksi, bir şeyler ters gitti',
      home: 'Ana sayfa', back: 'Geri', next: 'İleri', start: 'Başla', play: 'Çal', stop: 'Dur', open: 'Aç',
      again: 'Tekrar', restart: 'Baştan', hint: 'İpucu', skip: 'Geç', cancel: 'Vazgeç', delete: 'Sil',
      print: 'Yazdır', yay: 'Yaşasın!', level: 'Seviye', tempo: 'Hız', showMe: 'Göster', listenAgain: 'Tekrar dinle',
      readAloud: 'Sesli oku', confirmDelete: 'Bu şarkı silinsin mi?',
      praise: 'Harika!|Süper!|Muhteşem!|Başardın!|Bravo!|Evet, işte bu!|Çok güzel!|Aferin sana!',

      'nav.home': 'Ana Sayfa', 'nav.learn': 'Öğren', 'nav.songs': 'Şarkılar', 'nav.helper': 'Gerçek Piyano', 'nav.games': 'Oyunlar',
      'nav.free': 'Serbest Çal', 'nav.stickers': 'Çıkartmalar', 'nav.settings': 'Ayarlar',
      'hud.stars': 'Yıldız', 'hud.streak': 'Gün serisi',

      'home.morning': 'Günaydın küçük piyanist! ☀️', 'home.afternoon': 'Merhaba küçük piyanist! 🌼', 'home.evening': 'İyi akşamlar küçük piyanist! 🌙',
      'home.intro': 'Sen bir <b>{title}</b> oldun. Hadi birlikte müzik yapalım!',
      'home.continue': 'Öğrenmeye devam', 'home.allLessons': 'Bütün dersler bitti!', 'home.keepPlaying': 'Şarkı çalmaya devam',
      'home.daily': 'Günün şarkısı', 'home.realPiano': 'Gerçek piyanon',
      'home.helperTitle': 'Gerçek Piyano Yardımcısı', 'home.helperText': 'Oyuncak piyanonu çal — uygulama dinler ve yardım eder!',
      'home.tile.learn': 'Adım adım', 'home.tile.songs': '23 şarkı', 'home.tile.games': 'Müzik oyunları',
      'home.tile.free': 'Çal ve kaydet', 'home.tile.stickers': 'Ödüllerin', 'home.tile.chart': '18 nokta rengi',

      'guide.title': 'Piyanonla birlikte nasıl kullanılır',
      'guide.s1': 'Tableti veya telefonu nota sehpasına koy', 'guide.s1t': 'Şarkı kitabının durduğu yere; böylece hem ekranı hem tuşları görürsün.',
      'guide.s2': 'Renkleri eşleştir', 'guide.s2t': 'Her tuşun kahverengi panoda renkli bir noktası var. Uygulama aynı renkleri gösterir.',
      'guide.s3': 'Yavaş başla', 'guide.s3t': '🐢 Öğren modunu kullan: uygulama seni bekler. Sonra 🎮 Ritim modunu dene.',
      'guide.s4': 'Uygulama seni dinlesin', 'guide.s4t': '🎤\'a dokun ve gerçek piyanonu çal — uygulama hangi tuşa bastığını duyar.',
      'guide.try': 'Dene: tuşlara dokun ya da bilgisayar klavyesini kullan (A S D F…).',

      'chart.title': 'Renk Tuş Tablosu', 'chart.text': 'Her tuş ve nokta rengi. Duymak için dokun. Yazdır ve piyanonun yanında tut!',
      'chart.white': 'beyaz tuş', 'chart.black': 'siyah tuş', 'chart.kbd': 'klavye',

      'learn.intro': 'Yolu adım adım takip et. Her ders bir sonrakini açar! 🗺️',
      'learn.lesson': 'Ders', 'learn.steps': 'adım', 'learn.next': 'Sonraki ders', 'learn.all': 'Bütün dersler',
      'lesson.done': '“{title}” dersini bitirdin! 🎉',
      'hint.left': '⬅️ Biraz SOLA (daha kalın)!', 'hint.right': '➡️ Biraz SAĞA (daha ince)!',
      'hint.find': '{c} noktayı ara.',
      'echo.listen': 'Dinle…', 'echo.your': 'Sıra sende!', 'echo.again': 'Tekrar dinle', 'echo.oops': 'Hay aksi! Bir kez daha dinle 👂',
      'quiz.again': 'Tam değil — tekrar dene! 🤔',
      'hand.caption': 'Parmak numaraları: başparmak = 1, serçe parmak = 5',

      'songs.intro': '<b>⭐ {n}</b> yıldızın var. Yeni dünyaları açmak için yıldız topla!',
      'songs.world': 'Dünya', 'songs.need': '🔒 Açmak için {n} ⭐ daha topla', 'songs.difficulty': 'Zorluk',
      'songs.blackKeys': 'siyah tuşlu', 'songs.blackKey': 'siyah tuş', 'songs.inBook': 'kitapta',
      'songs.mine': 'Şarkılarım', 'songs.mineText': 'Kendi yaptığın (ya da bir büyüğünün yazdığı) şarkılar.', 'songs.create': 'Şarkı yap',

      'mode.listen': 'Dinle', 'mode.learn': 'Öğren', 'mode.play': 'Ritim',
      'mode.listen.desc': '👂 Önce şarkıyı dinle. Tuşların ve noktaların yanışını izle.',
      'mode.learn.desc': '🐢 Kendi hızında çal — uygulama doğru tuşu bekler. Oradan başlamak için bir noktaya dokun.',
      'mode.play.desc': '🎮 Notalar aşağı düşer — her biri çizgiye gelince çal. Çok hızlıysa hızı düşür!',
      'listen.tip': 'İpucu: yavaş dinlemek için hızı düşür.',
      'rhythm.guide': 'Melodi', 'rhythm.metro': 'Tempo', 'rhythm.tip': 'Nota çizgiye değince çal!',

      'res.amazing': 'MUHTEŞEM!', 'res.great': 'Harika çaldın!', 'res.good': 'Aferin!', 'res.try': 'Güzel deneme! Çalışmaya devam',
      'res.notes': '🎵 {n} nota', 'res.mistakes': '❌ {n} hata', 'res.partial': 'Yıldız kazanmak için baştan başla.',
      'res.accuracy': '🎯 Doğruluk: %{n}', 'res.perfect': 'Kusursuz', 'res.goodHits': 'İyi', 'res.goodHit': 'İyi', 'res.miss': 'Kaçtı', 'res.combo': 'En iyi seri',
      'print.footer': 'Nokta rengini piyanonda bul ve o tuşa bas.',

      'mic.realPiano': 'Gerçek piyano', 'mic.helpShort': 'Gerçek oyuncak piyanonu duymak için mikrofonu kullan',
      'mic.onToast': 'Dinliyorum! Gerçek piyanonu çal.', 'mic.listening': 'Dinliyorum… bir tuşa bas!',
      'mic.denied': 'Mikrofon izni yok. Lütfen tarayıcıda izin ver.',
      'mic.unsupported': 'Bu tarayıcı mikrofonu kullanamıyor (https gerekir).',

      'helper.title': 'Gerçek Piyano Yardımcısı',
      'helper.intro': 'Bu cihazı oyuncak piyanonun yanına koy ve <b>Dinlemeye başla</b>\'ya dokun. Hangi tuşa bastığını gösteririm ve şarkını tahmin ederim! 🔮',
      'helper.start': 'Dinlemeye başla', 'helper.stop': 'Dinlemeyi durdur', 'helper.waiting': 'Bir tuşa bas…',
      'helper.heard': 'Piyanonda duydum! 🎤', 'helper.pressed': 'Ekranda bastın',
      'helper.sensitivity': 'Hassasiyet', 'helper.trail': 'Notaların', 'helper.guess': 'Bu hangi şarkı?',
      'helper.guessHint': 'Bir şarkının 5+ notasını çal, tahmin edeyim.', 'helper.isIt': 'Bu şarkı mı…',
      'helper.tips': 'İpuçları: sessiz bir oda en iyisi. Tuşlar yanlış algılanıyorsa aşağıdan piyanonu ayarla — oyuncak piyanolar genelde biraz akortsuzdur.',

      'cal.title': 'Piyanomu ayarla', 'cal.quick': 'Hızlı (1 tuş)', 'cal.full': 'Tam (18 tuş)', 'cal.reset': 'Sıfırla',
      'cal.statusNone': 'Ayarlanmadı — standart akort kullanılıyor.', 'cal.statusQuick': 'Hızlı ayar: {n} yarım ses kaydırıldı.',
      'cal.statusFull': 'Piyanona tam ayarlandı ✅',
      'cal.press': 'Gerçek piyanonda {c} tuşa ({n}) bas ve çınlamasına izin ver.',
      'cal.timeout': 'Duyamadım. Aynı tuşu tekrar deneyelim — biraz daha güçlü bas.',
      'cal.done': 'Piyanon ayarlandı!',

      'games.intro': 'Kulaklarını, gözlerini ve parmaklarını çalıştıran oyunlar! 🎯',
      'games.best': 'En iyi', 'games.newBest': 'Yeni rekor!', 'games.over': 'Oyun bitti', 'games.score': 'Puan',
      'game.round': 'Tur',
      'game.simon': 'Yankı Hafıza', 'game.simon.desc': 'Dinle ve uzayan melodiyi tekrarla.',
      'game.simon.how': 'Ben birkaç nota çalarım, sen aynısını çalarsın. Her tur bir nota uzar!',
      'game.detective': 'Nota Dedektifi', 'game.detective.desc': 'Bir nota duy, doğru tuşu bul.',
      'game.detective.how': 'Gizemli notayı dinle, sonra parlayan tuşlar arasında bul. 🕵️',
      'game.detective.find': 'Parlayan {n} tuştan hangisiydi?',
      'game.rush': 'Gökkuşağı Koşusu', 'game.rush.desc': 'Büyük noktanın tuşuna bas — hızlı!',
      'game.rush.how': 'Büyük renkli bir nokta çıkar. Aynı renkteki tuşa olabildiğince hızlı bas! 45 saniye.',
      'game.highlow': 'İnce mi Kalın mı?', 'game.highlow.desc': 'İkinci nota daha ince mi, daha kalın mı?',
      'game.highlow.how': 'İki nota dinle. İkincisi YUKARI mı çıktı, AŞAĞI mı indi?',
      'game.highlow.q': '2. nota daha ince mi, daha kalın mı?',
      'hl.higher': 'Daha ince', 'hl.lower': 'Daha kalın',
      'game.composer': 'Küçük Besteci', 'game.composer.desc': 'Kendi şarkını yap ve çalış!',

      'free.sound': 'Ses', 'free.recorder': 'Kayıt', 'free.record': 'Kaydet', 'free.playback': 'Dinle', 'free.save': 'Şarkı olarak kaydet',
      'free.kbdTip': 'Bilgisayar klavyesi: beyaz tuşlar A S D F G H J K L ; \'  ·  siyah tuşlar W E T Y U O P',
      'sound.toy': '🧸 Oyuncak piyano', 'sound.musicbox': '🎁 Müzik kutusu', 'sound.piano': '🎹 Piyano', 'sound.xylo': '🪵 Ksilofon', 'sound.chip': '👾 8-bit',
      'maker.title': 'Şarkı yapıcı', 'maker.name': 'Şarkının adı', 'maker.namePh': 'İlk şarkım', 'maker.notes': 'Notalar', 'maker.untitled': 'Şarkım',
      'maker.help': 'Notaları boşlukla yaz: C D E F G A B (Do Re Mi Fa Sol La Si), ince notalar C5 D5 E5 F5, siyah tuşlar C# veya Bb. Uzun nota için :2 ekle (G:2). Yeni satır için alt satıra geç ya da | kullan.',
      'maker.error': '"{tok}" bu piyanoda bir tuş değil.',

      'stick.toNext': 'Sonraki seviyeye {n} XP', 'stick.max': 'En üst seviyedesin! 👑', 'stick.notes': 'Çalınan nota', 'stick.levels': 'Seviyeler',
      'sticker.new': 'Yeni çıkartma', 'levelup.title': 'Seviye {n}!',

      'set.general': 'Genel', 'set.lang': 'Dil', 'set.labels': 'Nota adları', 'set.letters': 'harfler', 'set.none': 'Sadece renkler',
      'set.sound': 'Ses', 'set.volume': 'Ses düzeyi', 'set.speak': 'Yönergeleri sesli oku', 'set.kbd': 'Piyanoda bilgisayar tuşlarını göster',
      'set.mic': 'Mikrofon', 'set.micText': 'Uygulama gerçek oyuncak piyanonu dinleyebilir. Her şey bu cihazda kalır — hiçbir ses kaydedilmez veya yüklenmez.',
      'set.latency': 'Ritim modu mikrofon gecikmesi (ms)',
      'set.parents': 'Ebeveyn köşesi',
      'set.tips': 'Kısa ve sık, uzun ve seyrekten iyidir: günde 5–10 dakika harika.|İlk derslerde çocuğunuzun yanında oturun ve her küçük başarıyı kutlayın.|Önce Öğren modu (bekler), sonra %50–70 hızda Ritim modu.|Oyuncak piyanolar tam akortlu değildir — mikrofon tuşları karıştırırsa “Piyanomu ayarla”yı kullanın.|“Yönergeleri sesli oku”, henüz okuma bilmeyen çocuklara yardımcı olur.',
      'set.unlock': 'Bütün dersleri ve şarkıları aç', 'set.export': 'İlerlemeyi dışa aktar', 'set.import': 'İlerlemeyi içe aktar',
      'set.imported': 'İlerleme içe aktarıldı', 'set.importErr': 'Bu dosya okunamadı',
      'set.reset': 'İlerlemeyi sıfırla', 'set.resetConfirm': 'Bütün yıldızlar, XP ve çıkartmalar gerçekten silinsin mi?',
      'set.about': 'Hakkında',
      'set.aboutText': 'Little Pianist Academy, 18 tuşlu mini piyano (Do\'dan ince Fa\'ya) için ücretsiz ve açık kaynaklı bir yardımcıdır. Çevrimdışı çalışır, reklam içermez ve ilerlemeyi sadece bu cihazda saklar.'
    }
  };

  function lang() { return (ZP.store && ZP.store.setting('lang')) || 'en'; }

  function t(key, vars) {
    const l = lang();
    let s = (STR[l] && STR[l][key]) !== undefined ? STR[l][key] : STR.en[key] !== undefined ? STR.en[key] : key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  function tx(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang()] || obj.en || '';
  }

  ZP.i18n = { STR, t, tx };
})(window.ZP);
