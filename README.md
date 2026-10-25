# 🎹 Little Pianist Academy

A fun, gamified web app for learning and playing the **18-key mini toy piano** ("the little pianist", sold by Zara Home): white-cream lid, sage-green frame, and a brown fallboard with a coloured dot for every key.

> Unofficial, fan-made learning guide. Not affiliated with Zara Home.

## The piano

| | |
|---|---|
| Keys | 18: 11 white + 7 black (groups of 2 · 3 · 2) |
| Range | **C4 → F5** (C C♯ D D♯ E · F F♯ G G♯ A A♯ B · C C♯ D D♯ E · F) |
| Dots | 18 coloured dots on the fallboard, grouped 5 · 7 · 5 · 1, one per key, in the same colours as the included song book |

The app recreates this layout on screen (same dot colours, glitter dots included), so a child can match screen → dot → key.

## Features

- **🎓 11 step-by-step lessons**: meet the piano → black-key families → finding C → Do-Re-Mi → five-finger position → all white keys → long and short notes → sharps & flats → ear training → reading the song book → letting the app listen. Each step is interactive: press, find, play a sequence, copycat (echo) or quiz.
- **🎶 23 songs in 5 worlds** that get harder, unlocked with stars:
  1. *First Steps*: Hot Cross Buns, Rain Rain Go Away, Mary Had a Little Lamb, Au Clair de la Lune
  2. *Five Finger Friends*: Twinkle Twinkle, Ode to Joy, Jingle Bells, London Bridge, When the Saints, Lightly Row / Daha Dün Annemizin
  3. *Big Jumps*: Row Your Boat, Old MacDonald / Ali Baba'nın Çiftliği, We Wish You a Merry Christmas, Brahms' Lullaby, Silent Night
  4. *Black Key Adventures*: Happy Birthday, Frère Jacques, Itsy Bitsy Spider, Yankee Doodle, Amazing Grace
  5. *Little Maestro*: Minuet in G, Für Elise, Greensleeves, Ode to Joy (full)
- **Three play modes per song**
  - 👂 **Listen**: the app plays the song while the keys and dots light up, karaoke style
  - 🐢 **Learn**: waits for the right key, with direction hints, nudges and a 💡 hint button
  - 🎮 **Rhythm**: falling notes (Synthesia style) with perfect/good/miss scoring, combos, a metronome and an optional guide melody
  - Speed slider (40–130 %), colour-dot sheet like the book, printable sheets
- **🎤 Real Piano Helper (real-time)**: listens to the *real* toy piano through the microphone, shows which key was played (colour and name), has a tuner needle, **guesses which song you are playing**, and can **follow you through any song** (turn on 🎤 in the player). Toy pianos are often out of tune or an octave high, so it includes a 1-key quick calibration and an 18-key full calibration.
- **🎲 Games**: Echo Memory (Simon), Note Detective (ear training), Rainbow Rush (speed colour matching), High or Low?
- **✍️ Little Composer**: record in Free Play, or type notes (`C D E:2 | Bb C5`) to make your own songs, then practise them in all modes
- **🏅 Gamification**: XP and 11 levels (Tiny Tapper → Grand Maestro), 3-star ratings, 26 stickers, daily streak 🔥, Song of the Day bonus
- **More**: English / Türkçe, note names as letters (C D E), solfège (Do Re Mi) or colours only, read-aloud instructions for pre-readers, 5 sounds (toy piano, music box, piano, xylophone, 8-bit), computer keyboard (`A S D F G H J K L ; '` and `W E T Y U O P`) and MIDI keyboard input, a printable colour chart, offline PWA, progress export/import, and a parents corner

Everything runs in the browser. There is no backend and no tracking, progress is saved in `localStorage`, and microphone audio is analysed live and never recorded.

## Run it

No build step; it's plain HTML/CSS/JS.

```bash
npm start            # or: python3 -m http.server 8080
# open http://localhost:8080
```

The microphone needs a secure context (**https** or `localhost`). Opening `index.html` directly works for everything except the mic.

## Deploy (GitHub Pages)

`.github/workflows/pages.yml` runs the tests and publishes the site on every push to `main`. Turn it on once under **Settings → Pages → Source: GitHub Actions**.

## Tests

```bash
npm test
```

Checks in plain Node: every song note fits the 18 keys, lyrics line up with notes, difficulty rises by world, lessons are valid, every UI string exists in both languages, pitch detection recognises all 18 keys (including a detuned and an octave-high piano), and the song guesser works.

## Project layout

```
index.html            app shell
css/style.css         all styles (palette taken from the toy)
js/data/notes.js      the 18 keys and their dot colours
js/data/songs.js      song library + note parser
js/data/lessons.js    step-by-step lessons
js/i18n.js            English / Turkish text
js/core/              store (progress/XP), audio synth, pitch detection, input
js/ui/                on-screen piano, colour-dot sheet, effects
js/views/             pages: home, learn, songs/player, helper, games, free play, settings
```

### Adding a song

Add an entry to `js/data/songs.js`, one line per musical phrase: `note[:beats]` (default 1 beat), lyrics one syllable per note (`~` holds a syllable):

```js
{ id: 'my-song', world: 2, emoji: '🐝', bpm: 100, meter: 4,
  title: { en: 'My Song', tr: 'Şarkım' },
  lines: [['C4 D4 E4:2', 'Buzz buzz bee']] }
```

Then run `npm test`.
