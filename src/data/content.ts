/* ==========================================================================
   VERLYSE MEDIA — CONTENT LAYER
   Sources of truth:
   1. 12 post datasets from 2026-08-02 (the full feed, June–August 2026)
   2. The original "3:13" dataset (2026-08-01)
   3. Profile screenshots (bio, stats, ambassador form)
   4. Founder article (havexmedia.site — Alina Javed)
   Every fact below is supported by these sources. Nothing is invented.
   All article bodies are the text as it appears on the post slides,
   extracted word-for-word; every closing block quotes the final slide
   of its feature (About Us card, writer's note, or unique ending).
   ========================================================================== */

export interface Author {
  id: string
  name: string
  handle: string
  role: string
  bio: string
  /** true = the platform itself credited them in a caption */
  confirmed?: boolean
  /** a photograph of the writer, taken from their own post (when the post carries one) */
  portrait?: string
  /** an override for the small author/profile photo in the articles flow —
      keeps the master photograph for every other surface untouched */
  profilePhoto?: string
  /** true = keep the photograph off the article pages (the monogram stands in) */
  hideArticlePhoto?: boolean
  /** how the writer writes — grounded in their own words and works */
  philosophy?: string
  /** their own words, lifted from a note, a caption or the work itself */
  favoriteQuote?: string
}

export interface Closing {
  /** how the final slide of the post is rendered as a designed block */
  kind: 'voices' | 'mission' | 'note' | 'artwork' | 'about-work' | 'final-verse' | 'passage' | 'story-end'
  /** the mono label above the block, named after the slide itself */
  kicker: string
  title?: string
  paragraphs?: string[]
  lines?: string[]
  quote?: string
  meta?: string[]
  signoff?: string
}

export type Vibe =
  | 'horror' | 'vintage' | 'solemn' | 'academic' | 'dreamy' | 'gallery'
  | 'serene' | 'mechanical' | 'letter' | 'playful' | 'airy' | 'urgent'
  | 'warm' | 'newsprint'

export interface WorkFigure {
  /** the inner picture, cropped out of the post's own slides */
  src: string
  label: string
  caption: string
}

export interface Article {
  id: string
  title: string
  authorId: string
  category: string
  excerpt: string
  readingTime: string
  date: string
  cover: string
  /** an optional alternative image for the Articles listing card only —
      the article page hero and all other surfaces keep using `cover` */
  thumbnail?: string
  slides: string[]
  tags: string[]
  /** the creator's own note — quoted from the caption or the note slide */
  note?: string
  /** the platform's descriptive text from the caption */
  description?: string
  body: string[]
  likes: number
  comments: number
  shortCode: string
  voices: Voice[]
  /** the closing of the post — the final slide, designed and in motion */
  closing?: Closing
  /** the feature's own temperament — motion and finish follow it */
  vibe?: Vibe
  /** the issue's recurring symbol — its own editorial motif */
  motif?: string
  /** the visual world of the publication — its texture, lighting, atmosphere */
  world?: 'paper' | 'newsprint' | 'night' | 'letter' | 'linen' | 'gallery' | 'document'
  /** how the hero frames the publication */
  heroMode?: 'cinematic' | 'documentary' | 'gallery' | 'quiet'
  /** true = the artwork is presented as an interactive gallery */
  gallery?: boolean
  /** pictures embedded inside the post's slides, presented on their own */
  figures?: WorkFigure[]
  /** a line of reflection before the ending — the story pausing to think */
  reflection?: string
  /** the finale — a living interaction that closes the publication */
  finale?: string
  /** a second creator credited by the caption (e.g. a poem written beside a painting) */
  credit?: string
}

export interface Category {
  slug: string
  name: string
  blurb: string
  count: number
}

export interface Voice {
  handle: string
  text: string
  post: string
}

/* ------------------------------------------------------------------ */
/* AUTHORS — every creator credited in the feed                         */
/* ------------------------------------------------------------------ */
export const AUTHORS: Author[] = [
  {
    id: 'alina-javed',
    name: 'Alina Javed',
    handle: '@lina_.jved',
    role: 'Founder · prose poet',
    bio: 'Alina Javed founded Verlyse Media at sixteen — after feeling her efforts and creativity were not truly appreciated at another company, she built a platform where creators feel valued. She also writes: her prose poem inspired by The Great Gatsby was published on 2 July 2026, and her call for Afghan women’s rights, “Their Voices Matter,” on 26 June 2026.',
    confirmed: true,    philosophy: 'She believes words have the power to inspire, influence, and leave a lasting impact — a belief that became the foundation of the platform she built at sixteen.',
    portrait: '/img/authors/alina-javed-about.jpg',
    profilePhoto: '/img/authors/alina-javed-about.jpg',
    favoriteQuote: 'Tell me — when did I begin to worship the shape of you I built from hope?',

  },
  {
    id: 'anshujit-singh',
    name: 'Anshujit Singh',
    handle: '@anshujit.singh',
    role: 'Writer · horror fiction',
    bio: 'Writer of “3:13,” the psychological horror presented on 16 July 2026 — about a girl who receives calls from her own WhatsApp number at 3:13 in the morning.',
    confirmed: true,    philosophy: 'He writes what unsettles — stories that stay in the room long after the phone stops ringing, and horrors that are quieter than they first appear.',
    favoriteQuote: 'The real horror isn’t what’s in the closet. It’s that eventually, it will be your turn to wait.',

  },
  {
    id: 'haieqa-wahab',
    name: 'Haieqa Wahab',
    handle: '@miss_haieqa',
    role: 'Writer · stories',
    bio: 'Wrote “The Empty Waltz” — a story about an old man, a ballroom, and a waltz he never stopped dancing (presented 29 July 2026).',
    confirmed: true,    philosophy: 'She writes the grief that goes unseen — the quiet, ordinary loneliness that lives in empty chairs, untouched coffee cups, and habits the heart refuses to unlearn.',
    favoriteQuote: 'The quietest emotions often speak the loudest.',

  },
  {
    id: 'shaza-fatima',
    name: 'Shaza Fatima',
    handle: '@r3ptillia',
    role: 'Essayist',
    bio: 'Wrote an essay on why the humanities and the arts deserve the same respect as every other field — and why creativity is never a lesser path (presented 30 June 2026).',
    confirmed: true,    philosophy: 'She argues with the world on paper — for the arts, the humanities, and every path that the brain itself testifies to.',
    favoriteQuote: 'Art, literature, music, poetry are not only employment opportunities, but they are also reasons to live.',

  },
  {
    id: 'adeena-irfan',
    name: 'Adeena Irfan',
    handle: '@deena.pmo',
    role: 'Painter',
    bio: 'Featured artist — her painting carries the message that you can recreate a beautiful piece of work without AI and use your creativity to make it more beautiful (presented 1 July 2026).',
    confirmed: true,    philosophy: 'She paints to show who she truly is — proof that a beautiful piece of work can be made without AI, with a creative mind and years of practice.',
    portrait: '/img/authors/adeena-irfan.jpg',
    hideArticlePhoto: true,
    favoriteQuote: 'As a student who is not good at studies, I am more creative — and it should be seen too.',

  },
  {
    id: 'craft-with-bro',
    name: 'Craft with Bro',
    handle: '@craft_with_bro',
    role: 'Calligrapher',
    bio: 'Submitted a collection of three Arabic calligraphy pieces created to inspire the remembrance of Tasbih-e-Fatima after every obligatory prayer (presented 3 July 2026).',
    confirmed: true,    philosophy: 'The work is made for prayer spaces — a reminder that art can do more than adorn a wall; it can nurture the soul.',
    favoriteQuote: 'When art remembers God, every wall becomes a place of worship.',

  },
  {
    id: 'munkashay-javed',
    name: 'Munkashay Javed',
    handle: '@nothingjustaninchident91',
    role: 'Essayist',
    bio: 'Wrote “Intellect Lost to Code” — a thoughtful and honest reflection on how artificial intelligence is reshaping the way we work, think, create, and imagine (presented 6 July 2026).',
    confirmed: true,    philosophy: 'A second-year pre-med student who writes against the machine — for the planet, for original thought, and for the voices that cannot speak up.',
    portrait: '/img/authors/munkashay-javed.jpg',
    hideArticlePhoto: true,
    favoriteQuote: 'One piece of creativity and imagination a day keeps the AI away.',

  },
  {
    id: 'abheesha-ghosh',
    name: 'Abheesha Ghosh',
    handle: '@abheesha_21',
    role: 'Poet',
    bio: 'Wrote “Forgive Me, Mother” — from the perspective of a child always blamed for every little thing, growing up in an emotionally neglectful home (presented 4 July 2026).',
    confirmed: true,    philosophy: 'She writes the feelings we are taught to keep — poems that ask forgiveness, that long to return to the earth, and that refuse to be quiet about what shaped them.',
    favoriteQuote: 'Let me be a blooming bud. Let me be a raining cloud. Let me be a bird’s feather. Let me fly away.',

  },
  {
    id: 'kenza-imene',
    name: 'Kenza Imene',
    handle: '@its.kenzou',
    role: 'Artist',
    bio: 'Created “Water Cat” — a captivating artwork, now featured on Verlyse Media (presented 9 July 2026).',
    confirmed: true,    philosophy: 'She draws the unspoken — cats that carry people’s hidden personalities, especially the black cats that culture mistakes.',
    favoriteQuote: 'The cats always reflect people’s unspoken personalities — especially black cats, that are mistakenly judged and affected by culture.',

  },
  {
    id: 'hadia-raza',
    name: 'Hadia Raza',
    handle: '@h._.d1aa',
    role: 'Poet',
    bio: 'Wrote “If Hope Were a Feather” — a gentle reflection on the quiet resilience of hope, shared alongside the inspiration behind her writing (presented 7 July 2026).',
    confirmed: true,    philosophy: 'She writes about hope the way it really is — delicate, carried by the wind, hidden in first light, yet always present.',
    favoriteQuote: 'No matter how dark life may seem, hope continues to exist, patiently waiting to guide us toward a new beginning.',

  },
  {
    id: 'zuha-farhan',
    name: 'Zuha Farhan',
    handle: '@zvhxx__',
    role: 'Writer · Associate Creative Director',
    bio: 'Featured for “The Horrors of Child Sexual Abuse,” made entirely by her own hand, and serves as the platform’s associate creative director — she designed the Kashmir cover page (presented 12 July & 1 August 2026).',
    confirmed: true,    philosophy: 'Associate creative director and writer — she makes the covers, and writes what the covers cannot hide: the subjects society would rather not name.',
    favoriteQuote: 'Spreading awareness is the one thing I can do.',

  },
  {
    id: 'haiqa-nafees',
    name: 'Haiqa Nafees',
    handle: '@maddu__0',
    role: 'Writer · Associate Editor',
    bio: 'Associate editor of Verlyse Media. She shared her go-to Khageena recipe — simple ingredients, 10 minutes, zero stress — made specially for students (presented 24 July 2026).',
    confirmed: true,    philosophy: 'Associate editor and poet — she writes the small, true things: recipes for tired students, and the word “jaldi” that stands between parents and children.',
    favoriteQuote: 'A break from continuous working helps the mind work better.',

  },
  {
    id: 'syeda-tasbeeha-noman',
    name: 'Syeda Tasbeeha Noman',
    handle: '@syeda._tasbeeha',
    role: 'Poet',
    bio: 'Wrote “The Garden Beyond My Tower” — a prose poem about loving someone from far away, from your own broken place, and choosing to pray for their happiness instead of trying to have them (presented 30 July 2026). She has a keen interest in writing as well as in psychology.',
    confirmed: true,    philosophy: 'She writes from psychology — the complexity of the human mind, expressed in very simple words, through metaphors like a tower and a garden.',
    portrait: '/img/authors/syeda-tasbeeha-noman.jpg',
    hideArticlePhoto: true,
    favoriteQuote: 'The heart does not listen, for it is rebellious. It feels. It loves.',

  },
  {
    id: 'kazi-fatimataz-zahra',
    name: 'Kazi Fatimataz Zahra',
    handle: '@jk1.23army',
    role: 'Poet',
    bio: 'Wrote “Failure” — a poem reminding us that failure isn’t something to fear; it’s a stepping stone that shapes resilience, wisdom, and growth (presented 21 July 2026). The caption credits “Kazi Fatimataz Zehra”; the author herself noted in the comments that the correct spelling is “Zahra.”',
    confirmed: true,    philosophy: 'She writes about what school never teaches — that failure is not a crime but a call, and that falling is how the steps get climbed.',
    favoriteQuote: 'Failure is like a call. If you acknowledge it, you will stand tall.',

  },
  {
    id: 'mochjixx',
    name: 'Mochi',
    handle: '@mochjixx',
    role: 'Poet',
    bio: 'Wrote the poem accompanying Adeena Irfan’s featured painting (presented 1 July 2026).',
    confirmed: true,    philosophy: 'A poet whose words accompany the work of others — the verse beneath the painting, in the voice of a student at prayer.',
    favoriteQuote: 'And when in despair, tears crawl down in shame of forgetting You — I am truly reminded of You.',

  },
  {
    id: 'verlyse-media',
    name: 'Verlyse Media',
    handle: '@verlyse.media',
    role: 'The platform',
    bio: 'The masthead behind the magazine — posts the platform’s own dispatches, including “Mir Raza Ali,” a memorial and a demand for justice (presented 27 August 2026).',
    confirmed: true,
  },
]

/* ------------------------------------------------------------------ */
/* ARTICLES — the full feed, 14 works                                   */
/* ------------------------------------------------------------------ */
export const ARTICLES: Article[] = [
  {
    id: 'their-voices-matter',
    title: 'Their Voices Matter',
    authorId: 'alina-javed',
    category: 'Social Issues',
    excerpt: 'Just across the border are women no different from me — women with dreams, ambitions, and voices that deserve to be heard. The only difference is where they were born.',
    readingTime: '4 min read',
    date: '2026-06-26',
    cover: '/img/works/DaDY7WRkw0y-1.webp',
    thumbnail: '/img/works/DaDY7WRkw0y-1.webp',
    slides: ['/img/works/DaDY7WRkw0y-1.webp', '/img/works/DaDY7WRkw0y-2.webp', '/img/works/DaDY7WRkw0y-3.webp', '/img/works/DaDY7WRkw0y-4.webp'],
    tags: ['Social Issues', 'Women\u2019s Rights', 'Afghanistan', 'Education'],
    description: 'Written by the founder herself — a call to recognize our shared humanity and refuse to let injustice become normal.',
    body: [
      'Just across the border are women no different from me — women with dreams, ambitions, and voices that deserve to be heard. The only difference is where they were born.',
      'While I hold books freely, many Afghan girls have been denied the right to continue their education. While I can imagine my future, countless women are forced to fight for the most basic freedoms.',
      'This isn’t about comparing lives to seek sympathy. It’s about recognizing our shared humanity and refusing to let injustice become normal.',
      'Afghanistan is a country where, for countless women and girls, freedom has become a distant dream. Many are trapped by domestic violence, forced into child marriages, and denied the simple yet powerful right to an education. Their classrooms have been replaced with closed doors, and their ambitions with silence.',
      'To raise a voice, to dream, to learn, or simply to exist as an equal can come at an unimaginable cost. While the world moves forward, millions of women are still fighting for rights that should never have been taken away. A country where, in many ways, an animal is afforded more protection than a woman.',
      'In Afghanistan, many women live under a system where violence within the home often goes unpunished, and men are granted broad authority over their wives. For countless women, abuse is not only endured — it is normalized, hidden behind closed doors and buried beneath fear.',
      'Millions of stories remain untold. Millions of cries go unheard. Behind every statistic is a woman forced to choose between silence and survival. No one should have to live in constant fear within the walls of their own home.',
      'NEWS UPDATE — “Beating your wife is legal as long as no bones are broken.”',
    ],
    likes: 133,
    comments: 18,
    shortCode: 'DaDY7WRkw0y',
    motif: 'voices',
    world: 'newsprint',
    heroMode: 'documentary',
    vibe: 'solemn',
    figures: [
      { src: '/img/inner/afghanistan-photo.webp', label: 'The photograph', caption: 'From the post’s second plate — the image that travels with the essay.' },
    ],
    reflection: 'No one should have to live in constant fear within the walls of their own home.',
    finale: 'raise-your-voice',
    closing: {
      kind: 'voices',
      kicker: 'Their voices matter',
      lines: ['Their stories matter.', 'Their voices matter.', 'Their future matters.'],
      paragraphs: ['Because every woman deserves dignity, education, freedom, and the right to choose her own path.'],
      signoff: 'Written by the founder herself — @lina_.jved',
    },
    voices: [
      { handle: "omg_em4an4567", text: "That’s really sad so proud of u 👍 🙌❤️", post: "DaDY7WRkw0y" },
      { handle: "zohaa._.rao", text: "Alina apne best kaam krdiya", post: "DaDY7WRkw0y" },
      { handle: "sanatheexplorer_", text: "#feminism", post: "DaDY7WRkw0y" },
      { handle: "notsooptimistic_", text: "🥀🥀", post: "DaDY7WRkw0y" },
    ],
  },
  {
    id: '3-13',
    title: '3:13',
    authorId: 'anshujit-singh',
    category: 'Horror',
    excerpt: 'A psychological horror about a girl who begins receiving calls from her own WhatsApp number at 3:13 in the morning — and about the version of her that steps out of the closet, smiling.',
    readingTime: '6 min read',
    date: '2026-07-16',
    cover: '/img/poster-3-13-1.webp',
    slides: ['/img/poster-3-13-1.webp', '/img/poster-3-13-2.webp', '/img/poster-3-13-3.webp'],
    tags: ['Horror', 'Psychological', 'WhatsApp', 'Short Story'],
    note: '“3:13 is a psychological horror about a girl who starts getting calls from her own WhatsApp number at exactly 3:13 AM. The voice on the other end is hers too — crying, terrified, warning her about something inside her closet. But when the closet door opens, another version of her steps out, smiling. As the calls repeat and photos of her arrive from her own number, she realizes she’s trapped in a loop where one version of her has to take the other’s place. The real horror isn’t what’s in the closet. It’s that eventually, it will be your turn to wait.”',
    body: [
      'I need to tell you something that happened to me, and even now I don’t know if anyone will believe it. Three months ago, I woke up suddenly at exactly 3:13 AM. My room was completely dark except for the light from my phone screen.',
      'It was ringing. I grabbed it, still half asleep, and felt my stomach drop when I saw the caller. It was my own WhatsApp number. Every digit matched perfectly. I stared at it for a few seconds, thinking it had to be some kind of bug.',
      'The phone kept ringing, so finally I answered. At first there was only silence. Then I heard breathing. Slow. Shaky. Like someone had been crying for a long time. A few seconds later, a voice whispered, “Help me.” My heart nearly stopped because the voice was mine. Not similar to mine. Not close to mine. It was exactly my voice.',
      'I sat up in bed and asked who it was. The voice started crying and said, “It’s me. You.” I told whoever it was to stop joking, but the crying only got worse. Then I asked where they were. The answer came instantly. “Inside the closet.” I slowly looked across my room at the old wooden closet standing near the wall. The door was closed. Nothing moved. Nothing seemed strange.',
      'Then I heard a scratching sound. Scratch. Scratch. Scratch. This time it wasn’t coming through the phone. It was coming from inside the closet. My entire body went cold. The voice on the phone whispered, “Don’t open it.” Before I could ask why, three slow knocks echoed from inside. Knock. Knock. Knock. Every sound felt louder than the last.',
      'The crying voice suddenly sounded terrified. “She heard us,” it whispered. I asked who “she” was, but before I got an answer, another voice spoke from inside the closet. It was also my voice. Calm. Quiet. Almost happy. “Open the door,” it said. The voice on the phone screamed, “NO! Don’t listen to her!” My hands were shaking so badly I nearly dropped my phone. Then the closet handle slowly turned by itself.',
      'I couldn’t move. I couldn’t breathe. The door opened a few inches and darkness filled the gap. I switched on my phone flashlight and pointed it at the closet. For a split second, I saw a face staring back at me. My face. Then it vanished. The closet looked empty again. Clothes. Shoes. Nothing else. The call suddenly ended, leaving me alone in complete silence.',
      'For the next three days, I tried to convince myself it had all been a nightmare. I told nobody. I went to school, talked to friends, and acted normal, but at night I kept staring at the closet. Then, exactly three days later, it happened again. At 3:13 AM, my phone rang. My number was calling me once more.',
      'The moment I answered, I heard the same crying voice. This time it sounded desperate. “Listen carefully,” it said. “You don’t have much time.” I asked what was happening. The voice took a shaky breath and replied, “She’s coming to take your place.” Before I could ask what that meant, a huge bang exploded from inside the closet. Then another. Then another. The entire door shook as if something was trying to break out. The crying voice screamed, “Run!” At that exact moment, the closet door burst open.',
      'A girl stepped out. She looked exactly like me. Same face. Same clothes. Same eyes. Same everything. She smiled and started walking toward my bed.',
      'I ran out of my room and down the stairs while still holding the phone. The crying voice kept telling me not to look into her eyes. I reached the front door and ran outside into the rain. My heart was pounding so hard that I thought I would collapse. Then my phone vibrated. A photo had arrived from my own number. It showed me standing in the rain. The picture had been taken from behind me.',
      'Seconds later another photo arrived. Then another. Each one was closer than the last. Finally, a message appeared on the screen. It said only four words: “Don’t turn around.”',
      'I turned around anyway. The street was empty. Nobody was there. For a moment, I felt relieved. Then something touched my shoulder. I screamed and everything went black. When I opened my eyes, I was trapped inside a small dark space. Clothes brushed against my face. Wood pressed against my back. I realized where I was and started crying. I was inside the closet.',
      'My hands shook as I pulled out my phone. It was 3:13 AM. Then the phone rang. My own number was calling. I answered and heard a sleepy voice say, “Hello?” It was me. The version of me from three days earlier.',
    ],
    likes: 45,
    comments: 23,
    shortCode: 'Da2RHY5ChOT',
    motif: 'clock',
    world: 'night',
    vibe: 'horror',
    reflection: 'The real horror isn’t what’s in the closet. It’s that eventually, it will be your turn to wait.',
    finale: 'answer-the-call',
    closing: {
      kind: 'story-end',
      kicker: 'The ending',
      lines: [
        'Through a tiny crack in the closet door, I could see another girl standing beside my bed.',
        'She looked exactly like me. She was smiling while listening to the call.',
        'Then she slowly looked toward the closet and whispered —',
        '“Your turn to wait.”',
      ],
      meta: [
        'The real horror isn’t what’s in the closet.',
        'It’s that eventually, it will be your turn to wait.',
      ],
    },
    voices: [{ handle: "imnotseerat", text: "Why yall using ai tho:(", post: "Da2RHY5ChOT" }, { handle: "mhdx4x", text: "oh my oh my", post: "Da2RHY5ChOT" }, { handle: "lina_.jved", text: "@anshujit.singh THIS IS SO GOOD", post: "Da2RHY5ChOT" }, { handle: "verlyse.media", text: "microsoft designer is used to create this post.", post: "Da2RHY5ChOT" }],
  },
  {
    id: 'the-empty-waltz',
    title: 'The Empty Waltz',
    authorId: 'haieqa-wahab',
    category: 'Stories',
    excerpt: 'A story about an old man, a ballroom, and a waltz he never stopped dancing.',
    readingTime: '6 min read',
    date: '2026-07-29',
    cover: '/img/works/DbYa5WSE5wf-1.webp',
    slides: ['/img/works/DbYa5WSE5wf-1.webp', '/img/works/DbYa5WSE5wf-2.webp', '/img/works/DbYa5WSE5wf-3.webp', '/img/works/DbYa5WSE5wf-4.webp', '/img/works/DbYa5WSE5wf-5.webp', '/img/works/DbYa5WSE5wf-6.webp', '/img/works/DbYa5WSE5wf-7.webp', '/img/works/DbYa5WSE5wf-8.webp', '/img/works/DbYa5WSE5wf-9.webp', '/img/works/DbYa5WSE5wf-10.webp'],
    tags: ['Stories', 'Vintage', 'Dance'],
    description: 'A story about an old man, a ballroom and a waltz he never stopped dancing.',
    note: '“The Empty Waltz was written during a writing competition where I wanted to explore a kind of grief that often goes unseen — the quiet, ordinary loneliness that lingers long after everyone else believes life has moved on. Loss rarely arrives with dramatic speeches. More often, it lives in empty chairs, untouched coffee cups, familiar songs, and habits the heart refuses to unlearn. This story is not only about remembering someone you love, but about the difficult moment when memory and reality finally meet. The ballroom, the music, and the mirror each became symbols of that journey. While the waltz represents love that refuses to fade, the mirror offers something less comforting but more compassionate: truth. Sometimes healing does not begin when we stop loving those we’ve lost; it begins when we find the courage to see life as it is, while carrying their memory with us. Writing this story during the competition reminded me that the quietest emotions often speak the loudest. If, while reading, you find yourself thinking of someone you miss, then perhaps they danced through these pages too.”',
    body: [
      'The chandeliers spread warm light across the ballroom, turning the marble floor into a mirror of gold. A waltz drifted through the air, slow enough to soften every edge in the room. Silk whispered. Laughter rose and dissolved back into the music.',
      'He danced with her in the middle of it all — two old bodies moving with the careful economy age teaches you, no wasted motion, nothing left to prove. His back had a permanent slight stoop. Her hands, resting on his shoulder, were papery, ringed with the same gold band she’d worn for forty-one years.',
      'Her dress was blue, the deep kind that turned almost black when the light shifted. It moved around ankles that had grown thin. His hand sat at her waist like it had never learned to be anywhere else, though the waist it remembered was softer than the one it once held young.',
      'One, two, three.',
      'He didn’t have to think about the steps. His knees complained, his hip complained, but his feet had kept this rhythm for fifty years and weren’t about to stop for something as small as pain.',
      '“You always loved this song,” he said, close to her ear, his voice gone thin and gravelly the way old voices do.',
      'She tilted her head — that small motion she’d made for half a century right before deciding something was funny. He could almost hear the laugh, the one that always came a beat late, like she wanted to be sure it deserved the sound.',
      '“You’re stepping too fast again, old man.”',
      '“Because you keep slowing down,” he murmured, answering a voice only he could hear.',
      'Around them the other couples turned and drifted, blurred at the edges, unimportant. All he had was the smell of the lavender talcum she used, the sway of white hair against his knuckles, her fingers — fingers he’d watched go from smooth to knotted with arthritis over the decades — curling slightly into his shoulder.',
      'For a few seconds, it was real again. He was not eighty-three. He was not alone.',
      'They drifted near the old mirror by the wall, its gilt frame worn soft with age, the silver behind the glass gone thin in patches where a hundred years of hands had touched it in passing. That mirror had hung in this room since before either of them was born. It had watched debutantes become grandmothers. It had watched soldiers leave in uniform and never come back to claim their coats. It did not soften what it was given. It never had. It simply held what stood in front of it and gave it back, plainly, the way only something very old and very patient can afford to.',
      'He caught his reflection in it without meaning to. And stopped.',
      'An old man in a dark suit turned slowly across the glass. Alone. His arms were curved in front of him, holding a shape that wasn’t there.',
      'No blue dress. No spotted, familiar hand at his shoulder. No face, lined with the same eighty-one years his own face carried, tipped up toward his.',
      'Just him, swaying to nothing, his empty arms describing the exact height she used to be. The mirror did not blink. It did not offer him a kinder angle. It had never once, in all its years on that wall, dressed up a lie for anyone who stood before it — and it was not going to start now, not even for an old man dancing with the dead.',
      '“I missed this,” he whispered, and his voice cracked in a way eighty-one years hadn’t prepared him for.',
      'That was when he noticed the young woman nearby — the one who’d paused mid-step, frowning slightly at the space beside him. Her partner touched her elbow and steered her on, not unkindly, the way you’d guide someone gently around an old man talking to himself.',
      'No one made room for her.',
      'Because there was no her to make room for. There hadn’t been for three years, and some nights he still set out two cups.',
      'The music seemed to thin out, or maybe it was just his hearing — going, like everything else now — narrowing down to one memory.',
      'The hospital room. The soft, patient beeping. Her hand, so light by then, still finding his. Then no beeping at all. The kind of quiet that doesn’t end when you finally make yourself leave the room.',
      'Three years he’d been leaving that room and never quite getting out of it.',
      'His feet slowed without his permission. They turned once more past the mirror, and this time he made himself look. The glass gave him nothing to argue with, same as always.',
      'He came back to this ballroom every year because it was the last place he’d heard her laugh without either of them trying to be brave about what was coming.',
      'He’d never told his daughter how loud his kitchen got at 6 a.m. now, with only one cup coming down from the shelf, and no one to ask him to hurry up, the coffee’s getting cold.',
      'His hands, spotted and unsteady, started to shake. He lowered them slowly, the way you set down something that might still break, even after all this time.',
      'The air where she’d been felt colder than the rest of the room, colder than air had any right to be.',
      '“I remember,” he said — not to her this time. To himself. To the mirror, which had heard that sentence in a hundred different voices across a hundred different years and had never once needed to answer it. To whoever needed to hear him finally say it out loud.',
      'The orchestra didn’t stop.',
      'The other couples kept turning under the chandeliers, laughing about things that weren’t sad yet.',
      'The mirror only showed what was actually standing in front of it. It always had. That was its one unbending mercy — not comfort, but truth, offered plainly to whoever was brave enough to look.',
      'One old man, alone, in the middle of a ballroom.',
      'His arms twitched, halfway back up, fifty years of habit reaching for fifty years of warmth. He let them fall instead.',
      'For the first time since she’d gone, he stopped trying to dance her back into the room — and let the silence be exactly as loud, and as true, as the mirror had always known it was.',
    ],
    likes: 47,
    comments: 29,
    shortCode: 'DbYa5WSE5wf',
    motif: 'waltz',
    world: 'linen',
    vibe: 'vintage',
    reflection: 'He let the silence be exactly as loud, and as true, as the mirror had always known it was.',
    finale: 'hold-the-dance',
    closing: {
      kind: 'mission',
      kicker: 'About us',
    },
    voices: [{ handle: "_exotic_faisal", text: "Such a nice thing to read👏", post: "DbYa5WSE5wf" }, { handle: "zvhxx__", text: "The writing is so perfect omg", post: "DbYa5WSE5wf" }, { handle: "jojokibachi", text: "This is soooo beautifull broo💖💖", post: "DbYa5WSE5wf" }, { handle: "anab3rry", text: "SO BEAUTIFUL", post: "DbYa5WSE5wf" }],
  },
  {
    id: 'the-arts-deserve-respect',
    title: 'The Arts Deserve Respect',
    authorId: 'shaza-fatima',
    category: 'Essays',
    excerpt: 'An essay exploring why the humanities and the arts deserve the same respect as every other field — and why creativity is never a lesser path.',
    readingTime: '8 min read',
    date: '2026-06-30',
    cover: '/img/works/DaMui9Ekrmy-1.webp',
    slides: ['/img/works/DaMui9Ekrmy-1.webp', '/img/works/DaMui9Ekrmy-2.webp', '/img/works/DaMui9Ekrmy-3.webp', '/img/works/DaMui9Ekrmy-4.webp', '/img/works/DaMui9Ekrmy-5.webp'],
    tags: ['Essays', 'Arts', 'Humanities'],
    description: 'This incredible piece explores why humanities and the arts deserve the same respect as every other field and why creativity is never a lesser path.',
    body: [
      'René Descartes, a French philosopher and mathematician, first presented the theory of “Cogito, ergo sum” — “I think, therefore I am” — also known by the Latin translation; the theory states that while all senses can be deceptive, the doubting of one’s own existence is impossible; since, for doubt, there needs to be a thinking entity at work.',
      'The new concept-theory that I wish to present is derived from Descartes’s statement — that while all human activities are vital for the survival, maintenance, and welfare of mankind, the creative nature of the human mind is one of the main factors that make us human in the first place.',
      'Medicine, engineering, law, business — all are noble occupations which play a fundamental role in the revitalization and prosperity of civilizations. However, art, literature, music, poetry are not only employment opportunities, but they are also reasons to live.',
      'Humanities are the subjects humans live for and are forever remembered by. William Shakespeare, Franz Kafka, Osamu Dazai, or even Leonardo Da Vinci, Vincent Van Gogh, Pablo Picasso — all are world-renowned and forever imbued in humanity’s minds because of their memorable contributions to the arts.',
      'The human brain itself provides solid evidence for the argument: the frontopolar cortex, commonly associated with creative thinking; the ventromedial prefrontal cortex (VMPFC), associated with emotional regulation and self-reflection, inspiring creativity; and the left prefrontal cortex, associated with idea generation — all parts of the frontal lobe, which, according to current understanding, is the most important part of the human brain. The frontal lobe, of course, has numerous other functions, including problem-solving and controlling emotions; however, the point still stands that the parts of the brain that are related to creativity, or help us to comprehend pieces that trigger creativity, are placed alongside life-saving functions like movement and emotions.',
      'Unfortunately, even in the modern times, humanities, arts and all degrees relating to those fields are still frowned upon in conservative-minded countries such as Pakistan, where the go-to employment opportunities are provided through degrees like Bachelors in Business Administration (BBA), Bachelors in Medicine and Surgery (MBBS), and Computer Science (CS).',
      'Even considering the density of these fields and how the demand for doctors, business owners, software engineers, etc. has extensively decreased, many students, even today, turn to these degrees in confusion, or in the hopes that it will secure their future for them. Therefore, words are left unsaid, canvases left blank, stages left empty and voices unheard.',
      'Franz Kafka, world-renowned Jewish Austrian-Czech author, trained as a lawyer and after completing his education, was employed full-time in various legal and insurance jobs. Being employed full-time forced Kafka to relegate writing to his spare time. Only a few of his works were published during his lifetime and they received little attention. However, upon the publication of his works, he became popular, with the younger generations especially — mostly because of how his work was relatable and realistic.',
      'He said: “Don’t bend; don’t water it down; don’t try to make it logical; don’t edit your own soul according to the fashion. Rather, follow your most intense obsessions mercilessly.”',
      'Vincent Van Gogh, Dutch post-impressionist painter, said: “I feel that there is nothing truly more artistic than to love people.” These figures and their sayings prove to us that art is interconnected with love — and love causes one to be remembered, not forever, but maybe close to it.',
    ],
    likes: 100,
    comments: 60,
    shortCode: 'DaMui9Ekrmy',
    motif: 'quote',
    world: 'paper',
    heroMode: 'quiet',
    vibe: 'academic',
    reflection: 'The parts of the brain that create are placed alongside the parts that keep us alive. Creativity is not a lesser path; it is a human one.',
    finale: 'close-the-quote',
    closing: {
      kind: 'passage',
      kicker: 'The conclusion',
      paragraphs: [
        'The only thing left to state is to follow your heart; don’t run away from it. Running away from the intense fire of your passions is something becoming increasingly normalized amongst students, typically of high-school age, to avoid judgement, pressure, and bear the expectations placed upon them by family, teachers, friends, and society.',
        'There is a certain stigma around activities like sculpting, fashion design or film-making, as they are seen as “incompetent” or “feminine” degrees and not fruitful enough to get a real job or build a career out of them. But if even our brain testifies to the importance of creativity, who are we to object?',
      ],
    },
    voices: [{ handle: "sabahat_2009", text: "Beautifully articulated!", post: "DaMui9Ekrmy" }, { handle: "a.a1raahh", text: "Felt something heal inside reading this", post: "DaMui9Ekrmy" }, { handle: "omg_em4an4567", text: "I am ur biggest fann ❤️", post: "DaMui9Ekrmy" }, { handle: "zznbkkh", text: "i love this post", post: "DaMui9Ekrmy" }],
  },
  {
    id: 'hope-becomes-mythology',
    title: 'Hope Becomes Mythology',
    authorId: 'alina-javed',
    category: 'Poetry',
    excerpt: 'A prose poem by the founder, inspired by The Great Gatsby — exploring the fragile line between love and idealization.',
    readingTime: '3 min read',
    date: '2026-07-02',
    cover: '/img/works/DaSLuZek5Uj-1.webp',
    thumbnail: '/img/works/DaSLuZek5Uj-1.webp',
    slides: ['/img/works/DaSLuZek5Uj-1.webp', '/img/works/DaSLuZek5Uj-2.webp', '/img/works/DaSLuZek5Uj-3.webp'],
    tags: ['Poetry', 'Prose Poem', 'Grief', 'Gatsby'],
    description: 'Inspired by The Great Gatsby, this piece explores the fragile line between love and idealization where hope becomes mythology, and grief lingers for someone who never truly existed.',
    body: [
      'No one warns you that grief can exist for someone who never existed.',
      'I loved the man before me, yet I mourned the one who only existed in my hope — the myth I carved from your borrowed kindness, your fleeting tenderness, your almosts.',
      'I spent so long believing that if I loved you enough, one day you would grow into the man I had already met inside my heart.',
      'Oh, how much I feared sin, yet I made an idol of you. You became my only devotion, my salvation, my revelation. I feared every sin except the one I committed most — I made an idol of you.',
      'Every betrayal became a verse I forced myself to forgive. Every absence, another prayer. I kept mistaking your leaving for a test of my faith, never realizing I was the only one kneeling.',
      'Tell me — how does one extinguish a flame that was never burning in another’s heart, yet consumed their own until nothing remained but ash?',
    ],
    likes: 90,
    comments: 65,
    shortCode: 'DaSLuZek5Uj',
    motif: 'flame',
    world: 'paper',
    heroMode: 'quiet',
    vibe: 'dreamy',
    reflection: 'Tell me — when did I begin to worship the shape of you I built from hope?',
    finale: 'light-the-flame',
    closing: {
      kind: 'note',
      kicker: 'Writer’s note',
      title: 'The Myth I Made of You',
      paragraphs: [
        'The Myth I Made of You was born from a question that lingered with me long after I finished reading The Great Gatsby: do we truly fall in love with people, or with the stories we write about them?',
        'The novel taught me that love can sometimes become an act of idealization — that we cling not to who someone is, but to who we hope they will become. Through this piece, I wanted to explore the quiet grief of mourning a future that never existed, and the painful realization that some heartbreaks are not caused by losing a person, but by letting go of the myth we created in their place.',
        'Writing has always been the language I return to when emotions become too heavy to carry in silence. Poetry, especially, has been a refuge — a place where feelings that refuse to be spoken can finally find a voice. If this piece found even a small part of your heart, then perhaps it has already fulfilled the purpose for which it was written.',
      ],
      signoff: '— Alina Javed',
    },
    voices: [{ handle: "yura_archives", text: "WE LOVE U ALINA KEEP GOIN", post: "DaSLuZek5Uj" }, { handle: "shanzayy__k", text: "Wowww", post: "DaSLuZek5Uj" }, { handle: "verlyse.media", text: "@jojokibachi head of brand ambassador approved this🤏🏻", post: "DaSLuZek5Uj" }, { handle: "omg_em4an4567", text: "Loved it❤️", post: "DaSLuZek5Uj" }],
  },
  {
    id: 'a-students-worth',
    title: "A Student's Worth",
    authorId: 'adeena-irfan',
    category: 'Art',
    excerpt: 'A featured painting with the message that a student’s worth isn’t written only in grades — accompanied by a poem.',
    readingTime: '2 min read',
    date: '2026-07-01',
    cover: '/img/works/DaPbjVRE3nA-1.webp',
    slides: ['/img/works/DaPbjVRE3nA-1.webp', '/img/works/DaPbjVRE3nA-2.webp', '/img/works/DaPbjVRE3nA-3.webp', '/img/works/DaPbjVRE3nA-4.webp'],
    tags: ['Art', 'Painting', 'Students'],
    description: 'A student’s worth isn’t written only in grades. A featured painting by Adeena Irfan, with a poem by @mochjixx.',
    credit: 'Poem written by @mochjixx — the painting by Adeena Irfan, presented together',
    body: [
      'And when the starry sky hints behind, the glimmering stars and gloomy clouds sway harmoniously —',
      'and when my arching feet meet the gelid floor, the comfort of warmth deserting me —',
      'and when the mesmerizing whispers of prayer ease the trembles of His amanah, the world dissolving into oblivion —',
      'and when my frail orbs gaze upon the alluring mihrab, my eyes softening in awe —',
      'and when in despair, tears crawl down in shame of forgetting You —',
      'I am truly reminded of You.',
    ],
    likes: 100,
    comments: 45,
    shortCode: 'DaPbjVRE3nA',
    motif: 'arch',
    world: 'gallery',
    heroMode: 'gallery',
    gallery: true,
    vibe: 'gallery',
    figures: [
      { src: '/img/inner/students-painting.webp', label: 'The painting', caption: 'As it appears on the cover plate — a student at prayer, recreated without AI.' },
    ],
    reflection: 'As a student who is not good at studies, I am more creative — and it should be seen too.',
    finale: 'light-the-painting',
    closing: {
      kind: 'artwork',
      kicker: 'Artist’s note',
      title: 'The painting, and the hand that made it',
      paragraphs: [
        'A few reasons why I love painting is because it shows who I truly am, and what I love. It makes me proud to see the talent I have and the creative mindset without the use of AI. I had started painting when I was in fourth grade, during the COVID era. While I was stuck at home, I wanted to find out who I truly am, thus I started to find what I love. I started painting and continued to do so for six years. I spent years of hard work and dedication to improve my art skills.',
        'I’ve participated in other arts and crafts competitions and have won sixth position across the country in the Awakener craft category in 2024. What I truly want to show here is that other than just grades, people should also be praised for other talents they have as well. As a student who is not good at studies, I am more creative — and it should be seen too.',
      ],
      signoff: '— Adeena Irfan',
    },
    voices: [{ handle: "r3ptillia", text: "this is what lifes all abtttt", post: "DaPbjVRE3nA" }, { handle: "jojokibachi", text: "Insane art 👏💙", post: "DaPbjVRE3nA" }, { handle: "sposhiewoshie", text: "OMG ADEENA IM SO PROUD OF YOU", post: "DaPbjVRE3nA" }, { handle: "eishal.usmani", text: "WOWOWWWW", post: "DaPbjVRE3nA" }],
  },
  {
    id: 'tasbih-e-fatima',
    title: 'Tasbih-e-Fatima',
    authorId: 'craft-with-bro',
    category: 'Art',
    excerpt: 'A collection of three Arabic calligraphy pieces created to inspire the remembrance of Tasbih-e-Fatima after every obligatory prayer.',
    readingTime: '2 min read',
    date: '2026-07-03',
    cover: '/img/works/DaU7EU2E46N-1.webp',
    slides: ['/img/works/DaU7EU2E46N-1.webp', '/img/works/DaU7EU2E46N-2.webp'],
    tags: ['Art', 'Calligraphy', 'Islam'],
    description: 'A reminder that art can do more than adorn a space — it can nurture the soul.',
    body: [
      'A set of three calligraphies designed for the prayer rooms, to remember the Tasbih-e-Fatima after every obligatory prayer.',
      'Art that nurtures the soul.',
    ],
    likes: 68,
    comments: 9,
    shortCode: 'DaU7EU2E46N',
    motif: 'beads',
    world: 'gallery',
    heroMode: 'gallery',
    gallery: true,
    vibe: 'serene',
    figures: [
      { src: '/img/inner/tasbih-calligraphy.webp', label: 'The calligraphies', caption: 'The three pieces as they appear on the presentation plate.' },
    ],
    reflection: 'When art remembers God, every wall becomes a place of worship.',
    finale: 'count-the-beads',
    closing: {
      kind: 'artwork',
      kicker: 'About the work',
      title: 'The three pieces',
      paragraphs: [
        'A set of three Arabic calligraphy pieces created for prayer spaces, designed to serve as a gentle reminder to recite Tasbih-e-Fatima after every obligatory prayer.',
        'Rather than decorating a wall, the work transforms a space into one of remembrance, where faith is quietly woven into everyday life. When art remembers God, every wall becomes a place of worship.',
      ],
      signoff: '— Craft with Bro',
    },
    voices: [{ handle: "zohaa._.rao", text: "Precious 💞", post: "DaU7EU2E46N" }, { handle: "zohaa._.rao", text: "Mashallah", post: "DaU7EU2E46N" }, { handle: "lycheyee", text: "Mashallah", post: "DaU7EU2E46N" }, { handle: "crisp._.x26", text: "❤️❤️", post: "DaU7EU2E46N" }],
  },
  {
    id: 'intellect-lost-to-code',
    title: 'Intellect Lost to Code',
    authorId: 'munkashay-javed',
    category: 'Essays',
    excerpt: 'How AI has turned us into unimaginative and dull individuals — a thoughtful reflection on how artificial intelligence is reshaping the way we work, think, create, and imagine.',
    readingTime: '10 min read',
    date: '2026-07-06',
    cover: '/img/works/DacRGIOE9Sg-1.webp',
    slides: ['/img/works/DacRGIOE9Sg-1.webp', '/img/works/DacRGIOE9Sg-2.webp', '/img/works/DacRGIOE9Sg-3.webp', '/img/works/DacRGIOE9Sg-4.webp'],
    tags: ['Essays', 'AI', 'Creativity', 'Think Beyond'],
    description: '“Intellect Lost to Code: How AI Has Turned Us into Unimaginative and Dull Individuals” explores the quiet cost of overreliance on technology and reminds us that creativity, curiosity, and original thought are what make us human.',
    body: [
      'Man is the only species on Earth who was given the ability to think and reason — and he has used that ability to make various things. Some of them benefited him, some were impossible or beyond his reach to create, and some were nothing but detrimental and useless to him — yet he chose to support those the most.',
      'And that brings us to one of the things in that list — AI. Artificial intelligence, to be more specific. This has been man’s most awaited development over time, and now it is in front of us. Every person you see today has an app installed in their smartphone associated to this technology.',
      'Surely it helps you in many tasks — but have you ever realized that now you can’t even write a single sentence without its help? Have you ever realized that writing an essay by yourself now takes you days, just because every other time you used AI for it? Have you ever realized how you’ve lost your creativity, imagination and brilliant understanding to a machine who codes it out for you in seconds?',
      'Just to get an answer in milliseconds, man has lost his most unique characteristic to a machine that literally just rephrases your question into an excruciatingly long and pointless answer. It has become hard to distinguish between reality now, just because of how fast AI is evolving.',
      'Seeing a wonderful picture or a video awes us for a moment, but then puts us into a deep thought of whether this is real or just a set of codes made to function to manipulate and fool us.',
      'Moreover, it has weakened our ability to think originally and resourcefully.',
      'Recent scientific studies have shown that most AI users tend to think more simply — and we can say more robotically — due to their constant dependence on AI for solving even the simplest of tasks. It has significantly reduced the power of critical thinking and problem-solving in individuals, making them cognitively and mentally weaker than those who use their own mind and self to solve and think.',
      'Furthermore, AI has also weakened people socially. More studies show that people who tend to be lonely and depressed often talk to AI chats for hours just to feel better — but as stated before, the machine just rephrases their emotions into a useless answer. This has affected the younger generation more, who then face social anxiety and communication issues when met with the public or even their family.',
      'Not only this, AI has taken over the artistic side too. Many artists complain how AI slop and trashy images have made them feel degraded and hopeless — due to lesser attention of online users to their art, and more attention to fake and visibly horrifying images.',
      'And of course it gets worse. From impacting single individuals, AI now harms the planet too. With only 3% of freshwater being present on Earth, AI data centres of apps like ChatGPT or Gemini use at least 2 million litres of freshwater in one day just to cool down their servers.',
      'A single prompt uses water equal to 2 standard sized water bottles. This has directly and indirectly led to a significant decrease in freshwater reserves, and according to recent studies has also started to contribute heavily to global warming, which is harming ecosystems and species all over our planet.',
      'So your free therapist is actually a villain in disguise. Let that sink in. Your free essay writer, email writer, art generator — is a devil and a parasite that is sucking your uniqueness out.',
      'AI is nothing but a futile machine full of crap made by man to demolish his own empire and kingdom.',
      'It is nothing but a senseless piece of junk designed to make you depend on it.',
      'Let this be a reminder to stop using AI and start using your intellect and intelligence to generate better things that benefit humanity and Earth.',
      'And don’t forget to say #cancelAI everyday.',
      '“One piece of creativity and imagination a day keeps the AI away.”',
    ],
    likes: 106,
    comments: 53,
    shortCode: 'DacRGIOE9Sg',
    motif: 'code',
    world: 'document',
    vibe: 'mechanical',
    reflection: 'One piece of creativity and imagination a day keeps the AI away.',
    finale: 'let-the-machine-reply',
    closing: {
      kind: 'note',
      kicker: 'Writer’s note',
      paragraphs: [
        'My name is Munkashay Javed, a second year pre-med student. One of the reasons I have written a work on the rise of AI and how it’s ruining everything is because of the recent news of how it’s impacting global warming — which is also an issue I care about a lot. I hope you guys like this article and learn something from it, and I really hope this encourages you to stop using AI.',
        'Also, I’m very passionate about researches on climate and environment related topics, and I try to prove my point and arguments through writings like these. I also have keen interest in many other issues which I also write about and wish to bring attention to them at an international level. I hope to be the voice of those who can’t speak up due to oppression, and wish to defend all communities that include animals too.',
      ],
      signoff: '— Munkashay Javed',
    },
    voices: [{ handle: "arhama.nadir", text: "Very well written 👏", post: "DacRGIOE9Sg" }, { handle: "aleeha_faraz", text: "So proud of you lesss gooo champ 💗", post: "DacRGIOE9Sg" }, { handle: "miffy.wrld", text: "ate so hard", post: "DacRGIOE9Sg" }, { handle: "sarahimrann_", text: "@nothingjustaninchident91 such a beautiful piece of writing 😍", post: "DacRGIOE9Sg" }],
  },
  {
    id: 'forgive-me-mother',
    title: 'Forgive Me, Mother',
    authorId: 'abheesha-ghosh',
    category: 'Poetry',
    excerpt: 'An original poem from the perspective of a child who was always blamed for every little thing, growing up in an emotionally neglectful home.',
    readingTime: '2 min read',
    date: '2026-07-04',
    cover: '/img/works/DaXQtNiEzeH-1.webp',
    slides: ['/img/works/DaXQtNiEzeH-1.webp', '/img/works/DaXQtNiEzeH-2.webp'],
    tags: ['Poetry', 'Family', 'Healing'],
    note: '“This poem is through a perspective of a child who was always blamed for every little thing. Growing up in an emotionally neglectful home. The child is now asking the mother for forgiveness as she believes that she is truly to blame for her mistakes. This could also be interpreted as a new beginning and leaving her past behind by confronting her mother through a letter by repeating her words to her.” — Abheesha',
    description: '“Forgive Me, Mother.” — an original poem by Abheesha Ghosh.',
    body: [
      'Forgive me, mother, for I have sinned. For I have committed grave mistakes.',
      'Forgive me, mother, for I have polluted your womb with my presence. For I am a wretched soul.',
      'Forgive me, mother, for I have taken away your joy. For I have thought of dying.',
      'Forgive me, mother, for I was a coward. For I didn’t deserve your love.',
    ],
    likes: 74,
    comments: 44,
    shortCode: 'DaXQtNiEzeH',
    motif: 'letter',
    world: 'letter',
    heroMode: 'quiet',
    vibe: 'letter',
    reflection: 'Forgive me, mother — let me fly away now.',
    finale: 'seal-the-letter',
    closing: {
      kind: 'final-verse',
      kicker: 'The final stanza',
      lines: [
        'Forgive me, mother,',
        'let me fly away now.',
        'Let me feel loved at my dying breath.',
        'Let me be your daughter once.',
        'Let this wretched soul rest.',
      ],
    },
    voices: [{ handle: "r3ptillia", text: "so beautifulllll", post: "DaXQtNiEzeH" }, { handle: "anshujit.singh", text: "@abheesha_21 THE POEM WRITER GOAT ❤️🙌", post: "DaXQtNiEzeH" }, { handle: "omg_em4an4567", text: "Can’t took eyes out of from it ❤️", post: "DaXQtNiEzeH" }],
  },
  {
    id: 'water-cat',
    title: 'Water Cat',
    authorId: 'kenza-imene',
    category: 'Art',
    excerpt: 'A captivating artwork by Kenza Imene — now featured on Verlyse Media.',
    readingTime: '1 min read',
    date: '2026-07-09',
    cover: '/img/works/DakDJF9Ez1l-1.webp',
    slides: ['/img/works/DakDJF9Ez1l-1.webp', '/img/works/DakDJF9Ez1l-2.webp', '/img/works/DakDJF9Ez1l-3.webp'],
    tags: ['Art', 'Cats', 'Illustration'],
    description: 'Presenting “Water Cat,” a captivating artwork by Kenza Imene, now featured on Verlyse Media.',
    body: [
      'The cats always reflect people’s unspoken personalities — especially black cats, that are mistakenly judged and affected by culture.',
    ],
    likes: 56,
    comments: 35,
    shortCode: 'DakDJF9Ez1l',
    motif: 'ripple',
    world: 'gallery',
    heroMode: 'gallery',
    gallery: true,
    vibe: 'playful',
    figures: [
      { src: '/img/inner/water-cat-art.webp', label: 'The work', caption: '“Water Cat” — the artwork as presented, in full.' },
    ],
    reflection: 'The cats always reflect people’s unspoken personalities — especially black cats, mistakenly judged and affected by culture.',
    finale: 'touch-the-water',
    closing: {
      kind: 'artwork',
      kicker: 'The artist',
      title: 'The cat, and the artist’s hand',
      paragraphs: [
        '“The cats always reflect people’s unspoken personalities — especially black cats, that are mistakenly judged and affected by culture.”',
      ],
      signoff: '— Kenza Imene',
    },
    voices: [{ handle: "maggotsforbrains1", text: "I ALWAYS LOVED BLACK CATS SO MUCH I HATE HOW THEYRE ACCUSED OF RANDOM THINGS AND BAD LUCK THEYRE SOOOL CUTEEEEEEE", post: "DakDJF9Ez1l" }, { handle: "lycheyee", text: "THIS IS GENUINELY SO CUTE", post: "DakDJF9Ez1l" }, { handle: "ana.maynaa", text: "the cat and the art 😍😍", post: "DakDJF9Ez1l" }, { handle: "r3ptillia", text: "the detailinggg", post: "DakDJF9Ez1l" }],
  },
  {
    id: 'if-hope-were-a-feather',
    title: 'If Hope Were a Feather',
    authorId: 'hadia-raza',
    category: 'Poetry',
    excerpt: 'A gentle reflection on the quiet resilience of hope — shared alongside the inspiration behind the writing.',
    readingTime: '2 min read',
    date: '2026-07-07',
    cover: '/img/works/Dae6nNME5bg-1.webp',
    slides: ['/img/works/Dae6nNME5bg-1.webp', '/img/works/Dae6nNME5bg-2.webp', '/img/works/Dae6nNME5bg-3.webp', '/img/works/Dae6nNME5bg-4.webp'],
    tags: ['Poetry', 'Hope'],
    description: '“If Hope Were a Feather” is a gentle reflection on the quiet resilience of hope. Alongside her poem, Hadia shares the inspiration behind her writing, offering readers a deeper look into the emotions and meaning woven into every verse.',
    body: [
      'If hope were a feather, dropped by a dove — fragment of a new day, sent from above.',
      'If hope were a feather, soft as morning’s dew — silent glints on cornfields, a light that guides me through.',
      'If hope were the gentle breeze, rushing through my hair — a breath so sweet and warmly, unfrozen in the air.',
      'If hope were a whisper, in a war full of screams — a voice that sounds so peaceful, a second so serene.',
      'Known for its brightness, made from dirty clay — the slowly rising sun, dawn of a better day.',
      'If hope were a feather, dropped by a dove — fragment of something brighter, waiting on a roof.',
    ],
    likes: 73,
    comments: 34,
    shortCode: 'Dae6nNME5bg',
    motif: 'feather',
    world: 'paper',
    heroMode: 'quiet',
    vibe: 'airy',
    reflection: 'No matter how dark life may seem, hope continues to exist, patiently waiting to guide us toward a new beginning.',
    finale: 'catch-the-feather',
    closing: {
      kind: 'note',
      kicker: 'A note from the poet',
      paragraphs: [
        'This is a poem inspired by the resonating hope in everyone’s heart. Though sometimes it can be as dim as a candle in a dark room, it will eventually find its light and turn into warm natural hues of beautiful colours. It represents how hope is never described as something loud or invincible. It is delicate. It can be carried by the wind, left waiting on rooftops, or hidden in the first light of dawn. Yet despite its softness, it continues to exist. That contrast is the heart of the poem.',
        'Through this poem, I wanted to express that no matter how dark life may seem, hope continues to exist, patiently waiting to guide us toward a new beginning.',
      ],
      signoff: '— Hadia Raza',
    },
    voices: [{ handle: "fariha_sharf005", text: "Beautiful ❤️❤️", post: "Dae6nNME5bg" }, { handle: "lina_.jved", text: "Next time before making ai accusations do ur research properly 🤍🤍🤍🤍", post: "Dae6nNME5bg" }, { handle: "salee23rd", text: "Alright buddy 😭", post: "Dae6nNME5bg" }],
  },
  {
    id: 'the-horrors-of-child-sexual-abuse',
    title: 'The Horrors of Child Sexual Abuse',
    authorId: 'zuha-farhan',
    category: 'Social Issues',
    excerpt: 'A featured submission on one of the most important topics — the horrors of child sexual abuse. The post was made entirely by Zuha Farhan.',
    readingTime: '5 min read',
    date: '2026-07-12',
    cover: '/img/works/Dar3wIXk02U-1.webp',
    slides: ['/img/works/Dar3wIXk02U-1.webp', '/img/works/Dar3wIXk02U-2.webp', '/img/works/Dar3wIXk02U-3.webp', '/img/works/Dar3wIXk02U-4.webp', '/img/works/Dar3wIXk02U-5.webp'],
    tags: ['Social Issues', 'Child Protection', 'Speak Up'],
    description: 'A featured submission by Zuha Farhan on one of the most important topics — the horrors of child sexual abuse. The post is entirely made by Zuha Farhan.',
    body: [
      'Child sexual abuse is a form of child abuse, defined by when the child is exposed to any sexual activity that they are not mentally or developmentally prepared for and cannot comprehend the concept. This includes grooming, exhibitionism, and using tactics of manipulation — or exposing a child to child sexual abuse and exploitation material.',
      'One of the main forms of child abuse is child marriages, and this presents as exploitation of girls. Another cause is incest — sexual abuse by a family member — which can result in a more long-term psychological trauma, especially in the case of parental incest.',
      'The effects of child abuse are so permanent and petrifying that it can lead to numerous problems which include anxiety, depression, and mental brain disorders — which disrupt even further when children experience puberty, resulting in hypersexuality as well. Not only this, but children can develop eating disorders as well as poor self-esteem and sleep disturbances due to post-trauma.',
      'Cases of child sexual abuse in Pakistan: a devastating discovery that Pakistan ranks in 3rd place for cases of child sexual abuse, with ongoing reports of hundreds of cases each day.',
      'A recent tragic case of a 7-year-old girl named Muntaha Zahra, who was assaulted and then murdered — the main suspect confesses during investigation. A child is sexually abused every two hours in Pakistan this year. An Islamabad-based NGO records 2,227 cases of child sexual abuse in the country between January and June.',
      'How to get help? Always talk to someone you can trust — a guardian, a parent, a teacher, a trusted friend. Never make yourself feel alone if you are going through something traumatic; a trusted adult will be able to help you.',
      'Then comes professional help — therapy, group therapy, family therapy and counselling — which will help process the traumatic event, and legal help by going to child protective services. There are many helplines in Pakistan, which include Bedari helpline, Rozan Counselling helpline and Child helpline, Child Protection and Welfare Bureau.',
      'One thing to keep in mind: it’s never the child’s fault — as many victims either start self-blaming, which intensifies the trauma and pain.',
    ],
    likes: 77,
    comments: 30,
    shortCode: 'Dar3wIXk02U',
    motif: 'hand',
    world: 'newsprint',
    heroMode: 'documentary',
    vibe: 'urgent',
    reflection: 'It’s never the child’s fault.',
    finale: 'hold-to-protect',
    closing: {
      kind: 'note',
      kicker: 'The writer’s note',
      paragraphs: [
        'I deeply resonate with this subject and I believe it should be known among everyone — because no matter what, this unforgettable feeling still lingers inside you and shapes your thoughts and actions. You may never know what the other person is dealing with, so it should be in everyone’s nature to make the person feel comfortable in talking about it.',
        'The effects of CSA have not been given such importance in society — especially hypersexuality — but people never understand how deeply it can affect you, to a point it can change your life. So spreading awareness is the one thing I can do.',
      ],
      signoff: '— Zuha Farhan',
    },
    voices: [{ handle: "maggotsforbrains1", text: "THIS SHUD BE SPOKEN ABOUT MORE", post: "Dar3wIXk02U" }, { handle: "marziaontop", text: "yet the society doesn’t change, thank you for speaking up about this!", post: "Dar3wIXk02U" }, { handle: "zohaa._.rao", text: "This world needs discipline", post: "Dar3wIXk02U" }, { handle: "verlyse.media", text: "@nothingjustaninchident91 📢", post: "Dar3wIXk02U" }],
  },
  {
    id: 'khageena',
    title: 'Khageena',
    authorId: 'haiqa-nafees',
    category: 'Lifestyle',
    excerpt: 'A go-to Khageena recipe — simple ingredients, 10 minutes, zero stress. Made specially for students juggling classes, work, and everything in between.',
    readingTime: '3 min read',
    date: '2026-07-24',
    cover: '/img/works/DbKynTxk_6F-1.webp',
    slides: ['/img/works/DbKynTxk_6F-1.webp', '/img/works/DbKynTxk_6F-2.webp', '/img/works/DbKynTxk_6F-3.webp', '/img/works/DbKynTxk_6F-4.webp', '/img/works/DbKynTxk_6F-5.webp'],
    tags: ['Lifestyle', 'Cooking', 'Students'],
    description: 'Simple ingredients. 10 minutes. Zero stress. Made specially for students juggling classes, work, and everything in between.',
    note: '“I chose to share this recipe because I wanted to create something simple and affordable for students. During busy weeks packed with classes, assignments and exams, a small break is very much needed. It can be a refreshing change of peace. Often times, people turn to cooking when exhausted, therefore I hope this recipe encourages all the fellow students to try it out. A break from continuous working helps the mind work better.” — Haiqa Nafees',
    body: [
      'Simple ingredients. 10 minutes. Zero stress. Made specially for students juggling classes, work, and everything in between.',
      'Ingredients: eggs, oil, onions, tomatoes, ginger-garlic paste, green chillies, salt and spices to taste.',
      'Instructions: heat the oil in a pan. Sauté the chopped onions and tomatoes together. Then cook the vegetables with ginger garlic paste. Wait till the tomatoes soften. Add salt and chillies. Beat the eggs and pour them into the pan. Let the eggs cook, and set the pan aside for 5–10 minutes till they’re not raw anymore. Dish it out and serve hot with roti or paratha.',
      'Quick and easy to prepare. Budget-friendly. High in protein. Made with very simple ingredients.',
    ],
    likes: 36,
    comments: 14,
    shortCode: 'DbKynTxk_6F',
    motif: 'steam',
    world: 'linen',
    vibe: 'warm',
    figures: [
      { src: '/img/inner/khageena-dish.webp', label: 'The dish', caption: 'The Khageena as it appears on the presentation plate.' },
    ],
    reflection: 'A break from continuous working helps the mind work better.',
    finale: 'stir-the-pan',
    closing: {
      kind: 'mission',
      kicker: 'About us',
    },
    voices: [{ handle: "ana._dumps", text: "my next meal😛😛😛", post: "DbKynTxk_6F" }, { handle: "fatima_jannattt", text: "My inner chef is so happy", post: "DbKynTxk_6F" }, { handle: "maddu__0", text: "@fatima_jannattt YESSS GORDON RAMSEY", post: "DbKynTxk_6F" }],
  },
  {
    id: 'behind-every-headline',
    title: 'Behind Every Headline',
    authorId: 'zuha-farhan',
    category: 'Social Issues',
    excerpt: 'High tensions continue to affect communities on both sides of the border — behind every headline are real people asking for basic rights and dignity.',
    readingTime: '4 min read',
    date: '2026-08-01',
    cover: '/img/works/Dbf7jnBk3ho-1.webp',
    slides: ['/img/works/Dbf7jnBk3ho-1.webp', '/img/works/Dbf7jnBk3ho-2.webp', '/img/works/Dbf7jnBk3ho-3.webp', '/img/works/Dbf7jnBk3ho-4.webp', '/img/works/Dbf7jnBk3ho-5.webp'],
    tags: ['Social Issues', 'Kashmir', 'Human Rights'],
    description: 'Reports of protests, curfews, and loss of life remind us that behind every headline are real people asking for basic rights and dignity. Cover page designed by Zuha Farhan, associate creative director.',
    body: [
      'Srinagar / Islamabad (AsiaNews) — High tensions and growing instability continue to affect Kashmir on both sides of the Indo-Pakistani border. Protests and clashes have marked the election campaign in the Pakistan-controlled Azad Kashmir, while authorities in Indian-occupied Kashmir have strengthened security measures following the reported death of a police officer, resulting in dozens of deaths.',
      'With the unfortunate death of at least 40 people amid growing unrest in Azad Kashmir, reports declare victims to include 34 protesters alongside 6 members of security forces. Kashmir remains an internationally disputed territory whose future should be decided according to UN resolutions.',
      'Indian authorities continue counterterrorism operations in Jammu & Kashmir, including attaching properties allegedly linked to Pakistan-based militant handlers.',
      'The protests have turned violent over the course of the last four days, as protesters and police came face to face. The Joint Awami Action Committee has led protests over governance, electoral reforms, and economic grievances. Authorities imposed internet restrictions, banned the committee, and arrested several leaders. Human rights organizations and the UN Human Rights Office have called for independent investigations into the violence.',
      'This week, committee leaders accused the government of reneging on promises, declaring 12 of their supporters met unfortunate death by the barbaric actions. These claims, however, remain denied by the regional government.',
      'Behind every headline are real people asking for basic rights and dignity.',
      'Pakistan’s military reports 2,084 “terrorists” and nearly 500 security personnel killed this year so far in militant violence, stressing that militancy in Balochistan was increasing as Pakistan has become more proactive in engaging militants.',
      'Amid these crises, a district and sessions judge was killed in Balochistan’s Mastung district after his vehicle was ambushed by gunmen, while Pakistan police reported that six laborers were abducted and shot dead in Balochistan this week. Earlier, unidentified armed men intercepted the vehicle of a senior police official in the province and abducted him and his gunman — both were shot dead later. Pakistan’s military further reported in early July that 38 security personnel and four civilians were killed in three major attacks in the restive province bordering Afghanistan and Iran.',
    ],
    likes: 55,
    comments: 13,
    shortCode: 'Dbf7jnBk3ho',
    motif: 'rule',
    world: 'newsprint',
    heroMode: 'documentary',
    vibe: 'newsprint',
    figures: [
      { src: '/img/inner/kashmir-photo.webp', label: 'Kashmir', caption: 'From the dispatch — protests on both sides of the border.' },
      { src: '/img/inner/balochistan-photo.webp', label: 'Balochistan', caption: 'From the dispatch — the security situation in the restive province.' },
    ],
    reflection: 'Behind every headline are real people asking for basic rights and dignity.',
    finale: 'print-the-dispatch',
    closing: {
      kind: 'mission',
      kicker: 'About us',
    },
    voices: [{ handle: "marziaontop", text: "having to protest for your own basic rights is just so sad.", post: "Dbf7jnBk3ho" }, { handle: "notsooptimistic_", text: "literally was waiting for this", post: "Dbf7jnBk3ho" }, { handle: "lycheyee", text: "This was needed", post: "Dbf7jnBk3ho" }, { handle: "libssyy", text: "Sad reality", post: "Dbf7jnBk3ho" }],
  },
  {
    id: 'jaldi',
    title: 'Jaldi',
    authorId: 'haiqa-nafees',
    category: 'Poetry',
    excerpt: 'A poem about the word every child hears — “jaldi” — and the distance that grows between parents and children when love is shown in actions but never said in words.',
    readingTime: '2 min read',
    date: '2026-07-14',
    cover: '/img/works/Daw-mnAE_qe-1.webp',
    slides: ['/img/works/Daw-mnAE_qe-1.webp', '/img/works/Daw-mnAE_qe-2.webp', '/img/works/Daw-mnAE_qe-3.webp', '/img/works/Daw-mnAE_qe-4.webp', '/img/works/Daw-mnAE_qe-5.webp'],
    tags: ['Poetry', 'Family', 'South Asian'],
    description: 'A heartfelt submission by Haiqa Nafees on a poem, “Jaldi” — the post is solely created by the writer herself.',
    body: [
      'I’ve heard jaldi more times',
      'than I love you, beta,',
      'more rush in your voice',
      'than words that felt sweeter.',
      'Jaldi wake up.',
      'Jaldi.. we’re late.',
      'Jaldi.. come quickly,',
      'the whole world won’t wait.',
      'So I learnt to hurry.',
      'I followed your pace.',
      'I cut half of my stories',
      'when time left no space,',
      'I’d run with good news,',
      'with a smile on my face,',
      'hoping for pride',
      'or your warm embrace.',
      'But you’d find the one mark,',
      'the one flaw to choose.',
      'So I tried even harder.',
      'Did all I could do,',
      'thinking maybe one day',
      'I’d be enough for you.',
      'And yes. I know, Ammi.',
      'Your love can be quiet,',
      'but some days I wish',
      'you wouldn’t always hide it.',
      'I see it in dinners.',
      'In “have you eaten today?”',
      'But sometimes I need love',
      'in the words that you say.',
      'Because silence gets heavy',
      'when carried for years.',
      'And words left unspoken',
      'can disappear into fears.',
      'Now you ask why I’m distant,',
      'why my stories are few,',
      'why I sit in my room',
      'instead of with you.',
      'I wish I could tell you',
      'when the distance first grew,',
      'but I was too busy',
      'saying I’m fine to you.',
      'I’m tired of guessing',
      'what your silence might mean,',
      'of searching for love',
      'in the spaces between.',
      'So, Ammi, no jaldi —',
      'just listen today.',
      'I don’t need an hour.',
      'I’ve four words to say.',
      '“I’m proud of you, beta,” —',
      'that’s all I wish you’d do.',
      'Maybe then I’d remember',
      'how to talk to you.',
    ],
    likes: 63,
    comments: 28,
    shortCode: 'Daw-mnAE_qe',
    motif: 'jaldi',
    world: 'letter',
    heroMode: 'quiet',
    vibe: 'warm',
    reflection: 'Sometimes love is shown in actions, not words — but some days, words are the only thing that reaches.',
    finale: 'type-the-word',
    closing: {
      kind: 'note',
      kicker: 'Writer’s note',
      paragraphs: [
        'The idea of jaldi came from the generational gap often seen between South Asian parents and their children. Many parents in South Asian households tend to show their love through acts of affection rather than expressing it through their words. This behavior is usually inherited from their own childhoods, as they’ve grown up in similar environments where love and affection is usually not expressed openly.',
        'Through this poem, I wanted to show how sometimes the lack of communication can create distances, even when love is still present. The word jaldi represents the constant rush in everyday life and how sometimes that rush can result into memories being lost and important words left unsaid.',
      ],
      signoff: '— Haiqa Nafees',
    },
    voices: [
      { handle: "zvhxx__", text: "@maddu__0 who said Shakespeare died🤯🤯🤯🤯", post: "Daw-mnAE_qe" },
      { handle: "zvhxx__", text: "@maddu__0 YESSSSSSSS🔥🔥🔥🔥", post: "Daw-mnAE_qe" },
      { handle: "zznbkkh", text: "this is so good☹️☹️", post: "Daw-mnAE_qe" },
      { handle: "zohaa._.rao", text: "So beautiful 🥀🎀", post: "Daw-mnAE_qe" },
    ],
  },
  {
    id: 'failure',
    title: 'Failure',
    authorId: 'kazi-fatimataz-zahra',
    category: 'Poetry',
    excerpt: 'A featured poem reminding us that failure isn’t something to fear; it’s a stepping stone that shapes resilience, wisdom, and growth.',
    readingTime: '1 min read',
    date: '2026-07-21',
    cover: '/img/works/DbCuHgrEypR-1.webp',
    slides: ['/img/works/DbCuHgrEypR-1.webp', '/img/works/DbCuHgrEypR-2.webp', '/img/works/DbCuHgrEypR-3.webp'],
    tags: ['Poetry', 'Resilience', 'Academics'],
    description: 'Today’s featured poem, “Failure” by Kazi Fatimataz Zehra, reminds us that failure isn’t something to fear; it’s a stepping stone that shapes resilience, wisdom, and growth.',
    body: [
      'Why are we taught failure is a crime? When it is what helps us shine. Not taking lessons from it would be a crime, because it will make us go blind.',
      'Failure is like a call. If you acknowledge it, you will stand tall. If you dare to cut it, it will make you fall.',
      'Life without failure is the same as world without nature.',
      'If you never failed in life, you are living in a shell — and it will quickly turn into hell.',
      'If they hear about failure, they frown, as if it never helped them grow.',
    ],
    likes: 55,
    comments: 12,
    shortCode: 'DbCuHgrEypR',
    motif: 'steps',
    world: 'paper',
    heroMode: 'quiet',
    vibe: 'academic',
    reflection: 'Failure is like a call. If you acknowledge it, you will stand tall.',
    finale: 'climb-the-steps',
    closing: {
      kind: 'mission',
      kicker: 'About us',
    },
    voices: [
      { handle: "shanzayy__k", text: "Goated", post: "DbCuHgrEypR" },
      { handle: "notsooptimistic_", text: "Beautifully written", post: "DbCuHgrEypR" },
      { handle: "jk1.23army", text: "Thats my poem iam glad it got published🥰 there is a small spelling mistake my name is \"Kazi Fatimataz Zahra\"", post: "DbCuHgrEypR" },
      { handle: "jojokibachi", text: "This is so true omg", post: "DbCuHgrEypR" },
    ],
  },
  {
    id: 'my-last-breath',
    title: 'My Last Breath',
    authorId: 'abheesha-ghosh',
    category: 'Poetry',
    excerpt: 'A poem about the deep desire to go back into the earth after completing the course of life — and the longing to leave this world’s desires behind.',
    readingTime: '1 min read',
    date: '2026-07-26',
    cover: '/img/works/DbQMFVEitsU-1.webp',
    slides: ['/img/works/DbQMFVEitsU-1.webp', '/img/works/DbQMFVEitsU-2.webp', '/img/works/DbQMFVEitsU-3.webp'],
    tags: ['Poetry', 'Nature', 'Mortality'],
    note: '“This piece captures a deep desire to go back into earth after completing the course of life. It can also be portrayed as a longing to leave all this worldly desires, fed up with this world.” — the writer’s message, in the caption. The post was made by Wajiha Ahmed.',
    body: [
      'When I shall take my last breath, bury me in no coffin. Burn me on no wood.',
      'Leave me beneath open sky. Let the vultures feast on me. Let the maggots eat my flesh.',
      'And when they shall leave — flowers shall bloom from my eyes. My ribs would brittle and break. And I shall go back in soil again.',
      'Then they shall find me — in the bloom of flowers, in the drizzle of rain, in the wings of birds, and in the heat of the sun.',
      'I shall find my home again.',
      'Let me be a blooming bud. Let me be a raining cloud. Let me be a bird’s feather.',
      'Let me fly away.',
      'Let me find my home again.',
    ],
    likes: 41,
    comments: 23,
    shortCode: 'DbQMFVEitsU',
    motif: 'cycle',
    world: 'night',
    vibe: 'solemn',
    reflection: 'Let me be a blooming bud. Let me be a raining cloud. Let me be a bird’s feather. Let me fly away.',
    finale: 'complete-the-cycle',
    closing: {
      kind: 'mission',
      kicker: 'About us',
    },
    voices: [
      { handle: "shanzayy__k", text: "❤️🙌", post: "DbQMFVEitsU" },
      { handle: "anshujit.singh", text: "@abheesha_21 THE GOAT 🙌", post: "DbQMFVEitsU" },
      { handle: "abheesha_21", text: "Thank you so so so much guys. Love you all 🫶 thanks @verlyse.media for considering my poem 💗", post: "DbQMFVEitsU" },
      { handle: "zvhxx__", text: "YESS SO GOODDD", post: "DbQMFVEitsU" },
    ],
  },
  {
    id: 'the-garden-beyond-my-tower',
    title: 'The Garden Beyond My Tower',
    authorId: 'syeda-tasbeeha-noman',
    category: 'Poetry',
    excerpt: 'The poem is about loving someone from far away, from your own broken place, and choosing to pray for their happiness instead of trying to have them.',
    readingTime: '3 min read',
    date: '2026-07-30',
    cover: '/img/works/DbaNAZTk5X9-1.webp',
    slides: ['/img/works/DbaNAZTk5X9-1.webp', '/img/works/DbaNAZTk5X9-2.webp', '/img/works/DbaNAZTk5X9-3.webp', '/img/works/DbaNAZTk5X9-4.webp', '/img/works/DbaNAZTk5X9-5.webp'],
    tags: ['Poetry', 'Prose Poem', 'Yearning'],
    description: 'A thoughtful submission by Syeda Tasbeeha Noman — the poem is about loving someone from far away, from your own broken place, and choosing to pray for their happiness instead of trying to have them.',
    note: '“Hi, my name is Syeda Tasbeeha Noman. I have a keen interest in writing as well as in psychology — understanding complex human emotions and why people act the way they do. I find myself drawn to the complexity of the human mind. Writing helps me to express such complex things in very simple words. I mostly write for fun, but ‘The Garden Beyond My Tower’ is one of the first pieces which I want to share with the world. It focuses on how regret and yearning can coexist as emotions — how we as humans feel certain things even if we wish we didn’t. I have expressed these ideas through the metaphor of a tower and a garden.” — Syeda Tasbeeha Noman',
    body: [
      'Miracles happen. And the miracle I pray for is that one day I’ll be brave enough to describe her beauty, to express my love and gratitude to her in the most exquisite words. But realistically speaking, I’ll always have to admire her charm, kindness and compassion from afar.',
      'She is like a beautiful garden full of roses, tulips and dandelions. Bathed in pure sunlight, the garden’s beauty lingers in the minds of every traveller who has seen it even once. I can view the garden from afar, gazing from the balcony of my tower — the tower of misery, regret and gloom in which I am imprisoned for my mistakes until God knows when.',
      'It’s not that I like it here, not at all. A pungent smell of rotting garbage follows me around everywhere I go, reminding me of the heartless human I once was. Sometimes I hear screams of terror, sounding like the uneasy souls of all the people I’ve broken, stripping them bare of their ability to ever love and trust again. The walls of the tower are cracked, there is no light, so only darkness prevails. It is also completely empty except for a single broken mirror. The tower is haunting, but I must stay, for I consider it my punishment.',
      'Despite all this, I walk to the balcony, and I watch her bloom and feel her warmth from afar — but I’ll never ever have the courage, even if I have the opportunity, to actually climb down from my tower and go into her garden.',
      'Regardless of that, I’ll pray for her. I’ll pray and pray and pray that the garden stays lush, the flowers bloom beautifully, the creatures that reside in the garden live a peaceful life, and the smell of the garden keeps on enchanting all those who dare to come near.',
      'For although my past doesn’t allow me to tell her how I feel, I still have a beating heart in my chest. Even if I want to control it, I can’t. The heart does not listen, for it is rebellious.',
      'It feels.',
      'It loves.',
    ],
    likes: 62,
    comments: 41,
    shortCode: 'DbaNAZTk5X9',
    motif: 'garden',
    world: 'paper',
    heroMode: 'quiet',
    vibe: 'dreamy',
    figures: [
      { src: '/img/works/DbaNAZTk5X9-1.webp', label: 'The tower and the garden', caption: 'The cover plate — the garden beyond the tower, and the balcony she watches from.' },
    ],
    reflection: 'The heart does not listen, for it is rebellious. It feels. It loves.',
    finale: 'water-the-garden',
    closing: {
      kind: 'artwork',
      kicker: 'The ending',
      title: 'The garden, kept lush',
      paragraphs: [
        'I’ll pray for her. I’ll pray and pray and pray that the garden stays lush, the flowers bloom beautifully, the creatures that reside in the garden live a peaceful life — and the smell of the garden keeps on enchanting all those who dare to come near.',
        'For although my past doesn’t allow me to tell her how I feel, I still have a beating heart in my chest. The heart does not listen, for it is rebellious. It feels. It loves.',
      ],
      signoff: '— Syeda Tasbeeha Noman',
    },
    voices: [
      { handle: "un_named_one_55", text: "Deserves a salute🔥🔥🔥", post: "DbaNAZTk5X9" },
      { handle: "mxra_afterglow", text: "So proud of u dude💗💗", post: "DbaNAZTk5X9" },
      { handle: "sadomushtaq", text: "Beautifully written 👏", post: "DbaNAZTk5X9" },
      { handle: "maimahshaikhh", text: "SO PROUDDD @tasbeeha._.noman", post: "DbaNAZTk5X9" },
    ],
  },
  {
    id: 'mir-raza-ali',
    title: 'Mir Raza Ali',
    authorId: 'verlyse-media',
    category: 'Social Issues',
    excerpt: 'He had a future. Someone took that away. Mir Raza Ali was only 25.',
    readingTime: '2 min read',
    date: '2026-08-27',
    cover: '/img/works/DciqQXTCilh-1.webp',
    slides: ['/img/works/DciqQXTCilh-1.webp', '/img/works/DciqQXTCilh-2.webp', '/img/works/DciqQXTCilh-3.webp'],
    tags: ['Social Issues', 'Justice', 'Pakistan'],
    description: 'A dispatch from the platform for Mir Raza Ali — 25, IBA graduate, founder of Wafflix: “His story cannot become another headline we forget in a week.”',
    body: [
      'He had a future. Someone took that away. Mir Raza Ali was only 25. An IBA graduate, entrepreneur, and the founder of Wafflix, he was building the kind of life so many young Pakistanis dream of — creating, growing and choosing to build his future here, in Pakistan. But behind the headlines about his death was a young man who believed in starting small, working hard and creating something of his own. His own words reflected that spirit: “Start small. Start messy. Start without all the answers. But just start.” He had dreams. He had ambition. He had a business he built from the ground up. He had a life ahead of him. And now, instead of celebrating his future, we are asking why it was taken from him and whether justice will truly be served. We cannot bring Mir Raza back. But we can refuse to let his story disappear.',
      'WAFFLIX WAS MORE THAN A BUSINESS. IT WAS A DREAM. There was no fancy outlet. No huge team. No perfect business plan. There was simply Mir Raza, a small cart, and an idea. He started Wafflix by pushing his cart himself, experimenting with recipes, serving customers and slowly turning an idea into a brand. People doubted the idea of selling waffles from a cart. But people started lining up. Over the years, that little cart grew into a recognised Karachi dessert brand eventually reaching multiple outlets, including fine-dining spaces. His journey wasn’t about waiting until everything was perfect. It was about starting anyway. He didn’t just build Wafflix. He built proof that a young Pakistani could start with almost nothing and create something meaningful.',
      'A LIFE WAS LOST. A FAMILY WAS LEFT WITH QUESTIONS. AND A COUNTRY IS WATCHING. Mir Raza’s story should not become another trending topic that disappears in a week. His family has continued demanding a transparent investigation, while questions surrounding the handling of the case have led to further legal scrutiny. We don’t need to know every answer to demand the most basic one: WHO IS RESPONSIBLE AND WILL JUSTICE BE served? If we call ourselves a nation that values its young people, then their lives cannot become statistics. If we celebrate Pakistani entrepreneurs, then we must also demand a Pakistan where they can live, build and dream safely. Don’t let Mir Raza’s name fade. Speak. Share. Ask questions. Demand a fair investigation. #JusticeForMirRazaAli',
    ],
    likes: 0, /* the source reported this post’s likes as unavailable (scraper value −1); not asserted elsewhere */
    comments: 9,
    shortCode: 'DciqQXTCilh',
    world: 'newsprint',
    heroMode: 'documentary',
    vibe: 'urgent',
    figures: [
      { src: '/img/inner/mir-raza-wafflix-cart.webp', label: 'Wafflix', caption: 'From the post’s second plate — the cart that grew into a recognised Karachi dessert brand.' },
      { src: '/img/inner/mir-raza-justice-rally.webp', label: 'The demand', caption: 'From the post’s third plate — the rally that asks who is responsible.' },
    ],
    reflection: 'We cannot bring Mir Raza back. But we can refuse to let his story disappear.',
    closing: {
      kind: 'voices',
      kicker: 'Demand a fair investigation',
      lines: ['A life was lost.', 'A family was left with questions.', 'A country is watching.'],
      paragraphs: ['Don’t let Mir Raza’s name fade. Speak. Share. Ask questions. Demand a fair investigation.'],
      signoff: 'For Mir Raza Ali — #JusticeForMirRazaAli',
    },
    voices: [
      { handle: "sasghar89", text: "#justiceformirraza", post: "DciqQXTCilh" },
      { handle: "baddie.w.braces", text: "This is so heartbreaking", post: "DciqQXTCilh" },
      { handle: "sagacious._.me", text: "He had a future and sm1 took that away .........", post: "DciqQXTCilh" },
      { handle: "maddu__0", text: "He had so much more to see💔", post: "DciqQXTCilh" },
      { handle: "lilpicklejuiceee", text: "There is no justice in Pakistan", post: "DciqQXTCilh" },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* CATEGORIES — from the captions and hashtags                          */
/* ------------------------------------------------------------------ */
export const CATEGORIES: Category[] = [
  { slug: 'stories', name: 'Stories', blurb: 'Stories told in the writer’s own voice — from ballrooms to 3:13 in the morning.', count: 1 },
  { slug: 'poetry', name: 'Poetry', blurb: 'Poems and prose poems — hope, grief, forgiveness, jaldi, and the fragile line between love and idealization.', count: 7 },
  { slug: 'essays', name: 'Essays', blurb: 'First arguments with the world — the arts, the humanities, and the quiet cost of technology.', count: 2 },
  { slug: 'art', name: 'Art', blurb: 'Paintings, calligraphy and illustration — creativity that needs no AI to be beautiful.', count: 3 },
  { slug: 'social-issues', name: 'Social Issues', blurb: 'Thought-provoking pieces on the topics that matter — child protection, women’s rights, human rights, and dignity.', count: 4 },
  { slug: 'lifestyle', name: 'Lifestyle', blurb: 'The everyday, made shareable — a student’s 10-minute Khageena.', count: 1 },
  { slug: 'horror', name: 'Horror', blurb: 'Psychological, modern, and told from inside a ringing phone.', count: 1 },
]

/* ------------------------------------------------------------------ */
/* COMMUNITY — the real numbers and voices                              */
/* ------------------------------------------------------------------ */
export const COMMUNITY_STATS: { value: string; label: string; note: string }[] = [
  { value: '19', label: 'Features presented', note: 'Every post on the feed — from the founder’s call for women’s rights to the Mir Raza Ali memorial.' },
  { value: '1281', label: 'Appreciations', note: 'Total likes across the feed — each of them an answer to a writer.' },
  { value: '585', label: 'Conversations', note: 'Comments beneath the features, all of them read.' },
  { value: '15', label: 'Creators credited', note: 'Every feature names its writer, by name and handle.' },
]

export const COMMUNITY_VOICES: Voice[] = [
  { handle: '@r3ptillia', text: 'this is what lifes all abtttt', post: 'A Student’s Worth' },
  { handle: '@anshujit.singh', text: 'THE POEM WRITER GOAT ❤️🙌', post: 'Forgive Me, Mother' },
  { handle: '@marziaontop', text: 'yet the society doesn’t change, thank you for speaking up about this!', post: 'The Horrors of Child Sexual Abuse' },
  { handle: '@a.a1raahh', text: 'Felt something heal inside reading this', post: 'The Arts Deserve Respect' },
  { handle: '@yura_archives', text: 'WE LOVE U ALINA KEEP GOIN', post: 'Hope Becomes Mythology' },
  { handle: '@maggotsforbrains1', text: 'THIS SHUD BE SPOKEN ABOUT MORE', post: 'The Horrors of Child Sexual Abuse' },
  { handle: '@lycheyee', text: 'This was needed', post: 'Behind Every Headline' },
]

/* ------------------------------------------------------------------ */
/* BRAND — bio, mission, programs, contact                              */
/* ------------------------------------------------------------------ */
export const BRAND = {
  name: 'Verlyse Media',
  handle: '@verlyse.media',
  instagram: 'https://instagram.com/verlyse.media',
  email: 'Verlysemedia.09@gmail.com',
  tagline: 'Where Vision Becomes A Voice',
  bio: 'Student-led media platform sharing youth perspectives on culture, global issues and creativity.',
  mission:
    'Verlyse Media is a creative platform dedicated to giving artists, writers, and storytellers a space where their voices can be seen and celebrated. From poetry, essays, and creative writing to paintings, photography, and thought-provoking pieces on social issues, we believe every meaningful creation deserves an audience. We carefully curate each submission — either transforming it into a visually engaging post that reflects our signature aesthetic, or featuring already-designed work that aligns with our creative standards. At Verlyse Media, every post is more than content; it’s a story, an emotion, and a voice worth sharing.',
  submitCta: 'Want to submit your work too? We’d love to feature it. Submit your work through the link in our bio.',
  ambassadorForm: 'https://docs.google.com/forms/d/e/1FAIpQLSfwggEIWE-dPLoU2uL1bKkBA3mwFvEPGO05DrxyyKoHIBpAwA/viewform',
  ambassadorNote: 'Brand Ambassador & submission application now open — the form lives in the bio.',
  presentationLine: 'Verlyse Media presents',
  disclosure:
    'When a post is created with design tools, the caption says so — as the platform replied to a commenter: “microsoft designer is used to create this post.” The writing remains the writer’s.',
  team: [
    { role: 'Director of Operations', name: 'Ana Fatima', description: 'Oversees operations and helps keep Verlyse Media’s growing team and initiatives moving smoothly.' },
    { role: 'Strategy Director', name: 'Hooria Maqsood', description: 'Guides strategic decisions and helps shape the long-term direction of Verlyse Media.' },
    { role: 'PR Head', name: 'Haidar Ali', description: 'Leads public relations and helps strengthen Verlyse Media’s communication and external presence.' },
    { role: 'Communication Director', name: 'Liba Adeel', description: 'Shapes Verlyse Media’s communication and helps keep its voice clear, consistent, and connected.' },
    { role: 'Editorial Director', name: 'Zainab Faisal Rao', description: 'Leads the editorial vision and helps develop the standards and direction of Verlyse Media’s written work.' },
    { role: 'Creative Director', name: 'Amna Rao', description: 'Shapes Verlyse Media’s creative vision and helps define the visual and artistic direction of its work.' },
    { role: 'Associate Editor', name: 'Haiqa Nafees', handle: '@maddu__0', description: 'Supports the editorial team in refining, developing, and strengthening Verlyse Media’s written work.' },
    { role: 'Associate Creative Director', name: 'Zuha Farhan', handle: '@zvhxx__', description: 'Helps shape Verlyse Media’s creative direction and contributes to its visual storytelling.' },
    { role: 'Head of Brand Ambassador', name: 'Javeria Karim', description: 'Leads the Brand Ambassador program, guiding ambassadors and building meaningful engagement around Verlyse Media.' },
    { role: 'Graphic Designer', name: 'Manha', description: 'Develops visual assets that support Verlyse Media’s identity, storytelling, and editorial presentation.' },
    { role: 'Technology & Digital Experience Lead', name: 'Ahsan Ashfaq', description: 'Leads the digital development of Verlyse Media, building and maintaining its website and shaping its online experience.' },
    { role: 'Head of Research Department', name: 'Zainab Khan', description: 'Leads the research department at Verlyse Media.' },
  ],
}

export const NAV_LINKS = [
  { to: '/articles', label: 'Articles' },
  { to: '/categories', label: 'Categories' },
  { to: '/creators', label: 'Featured Creators' },
  { to: '/community', label: 'Community' },
  { to: '/ambassadors', label: 'Brand Ambassador' },
  { to: '/about', label: 'About' },
]

export const MENU_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/articles', label: 'Articles' },
  { to: '/categories', label: 'Categories' },
  { to: '/community', label: 'Community' },
  { to: '/creators', label: 'Featured Creators' },
  { to: '/about', label: 'About' },
  { to: '/ambassadors', label: 'Brand Ambassador' },
  { to: '/submit', label: 'Send your work' },
  { to: '/contact', label: 'Contact' },
]

export const DOCK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/articles', label: 'Articles' },
  { to: '/categories', label: 'Categories' },
  { to: '/ambassadors', label: 'Ambassadors', hideTiny: true },
  { to: '/submit', label: 'Submit' },
]

export function getArticle(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id)
}
/** The single canonical portrait for an author — the complete original
    photograph, cropped from the slide exactly as a human would (rectangular
    marquee, straighten only), exported as a normal JPG. One photograph,
    one crop, used everywhere. No segmentation, no transparency. */
export function authorPhoto(id: string): string {
  return `/img/authors/${id}.jpg`
}

export function getAuthor(id: string): Author | undefined {
  return AUTHORS.find((a) => a.id === id)
}
export function relatedArticles(article: Article): Article[] {
  return ARTICLES.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3)
    .concat(ARTICLES.filter((a) => a.id !== article.id && a.category !== article.category).slice(0, 3 - ARTICLES.filter((x) => x.id !== article.id && x.category === article.category).slice(0, 3).length))
}
