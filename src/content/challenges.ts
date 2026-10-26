import type { Challenge } from './types';

/* ============================================================
   LIVE-ACTION DECKS
   Everything below is a "spice"-taggable pool. Items with
   spice:"party" only appear when the host flips the game into
   After Dark mode on the setup screen.
   who: "one"  -> one person from the picking team
        "team" -> the whole picking team
        "room" -> everybody plays, best performance scores
============================================================ */

export const CHALLENGES: Challenge[] = [
  /* ---------- physical — quirky, not gym class ---------- */
  { t: "Plank Standoff", d: "One person from your team holds a plank. The room counts out loud. Make it to the buzzer and the points are yours.", timer: 45, who: "one", type: "physical" },
  { t: "Wall Sit", d: "Back flat on a wall, thighs parallel to the floor. Hold it. No hands on knees, no sliding down.", timer: 45, who: "one", type: "physical" },
  { t: "Flamingo", d: "Stand on one foot with your eyes closed and your arms crossed. Put a foot down and it's over.", timer: 30, who: "one", type: "physical" },
  { t: "The Blind Crossing", d: "One player closes their eyes. A teammate talks them across the room and back using words only. No touching.", timer: 60, who: "team", type: "physical" },
  { t: "Beast of Burden", d: "Piggyback a teammate one full lap around the room. Both feet down early and you're done.", timer: 45, who: "team", type: "physical" },

  /* ---------- performance ---------- */
  { t: "Do The Voice", d: "Do an impression of somebody in this room. Say nothing about who it is. If three or more people correctly name them, you score.", timer: 45, who: "one", type: "performance" },
  { t: "Nature Documentary", d: "Narrate this room like David Attenborough narrating a struggling species. Thirty seconds. Commit to the accent.", timer: 30, who: "one", type: "performance" },
  { t: "Infomercial", d: "The team to your left hands you any object in the house. Sell it to the room like it's 2am on cable television.", timer: 40, who: "one", type: "performance" },
  { t: "Play-By-Play", d: "Call the last five minutes of this game like a broadcaster on the biggest stage of the season. Names, stakes, everything.", timer: 40, who: "one", type: "performance" },
  { t: "The Bard", d: "Make up a four-line rhyming poem about whoever is currently in the lead. It has to actually rhyme.", timer: 60, who: "one", type: "performance" },
  { t: "Villain Reading", d: "Recite a nursery rhyme as a Shakespearean villain. Full menace. No laughing — if you break, you lose it.", timer: 40, who: "one", type: "performance" },
  { t: "Silent Movie", d: "Act out a famous movie scene with zero words. The room gets one minute to guess it.", timer: 60, who: "one", type: "performance" },
  { t: "Name That Hum", d: "Hum a song. The room has forty-five seconds to name it. No words, no rhythm tapping.", timer: 45, who: "one", type: "performance" },
  { t: "Dance Break", d: "The host plays twenty seconds of anything. You dance for all twenty. Stopping early is a forfeit.", timer: 25, who: "one", type: "performance" },
  { t: "Accent Reading", d: "Read your most recent text message out loud in a British accent. It has to survive the whole message.", timer: 30, who: "one", type: "performance" },
  { t: "One-Man Band", d: "Perform the chorus of a song the room picks. Every word correct or no points.", timer: 45, who: "one", type: "performance" },
  { t: "Interpretive", d: "The room names an everyday chore. Perform it as interpretive dance until they guess it.", timer: 60, who: "one", type: "performance" },

  /* ---------- speed / mental ---------- */
  { t: "Ten Franchises", d: "Name ten NFL teams before the buzzer. No repeats, no hesitating.", timer: 20, who: "one", type: "speed" },
  { t: "Capital Run", d: "Twelve U.S. state capitals before the buzzer. Go.", timer: 30, who: "one", type: "speed" },
  { t: "Backwards Alphabet", d: "Say the alphabet backwards. All twenty-six. Start over if you break it.", timer: 30, who: "one", type: "speed" },
  { t: "Sevens", d: "Count down from one hundred by sevens. Five correct steps before the buzzer.", timer: 20, who: "one", type: "speed" },
  { t: "One Word Titles", d: "Ten movies with one-word titles. No repeats.", timer: 30, who: "one", type: "speed" },
  { t: "Beach Bag", d: "Fifteen things you'd pack for a day at the beach. Keep talking, don't stop.", timer: 30, who: "one", type: "speed" },
  { t: "Cereal Aisle", d: "Ten breakfast cereals before the buzzer.", timer: 20, who: "one", type: "speed" },
  { t: "Tap The Keg", d: "Name a different beer brand for five different letters of the alphabet.", timer: 30, who: "one", type: "speed" },
  { t: "Commander In Chief", d: "Ten U.S. presidents before the buzzer. Any order.", timer: 20, who: "one", type: "speed" },
  { t: "Twister", d: "Say \"she sells seashells by the seashore\" three times fast, cleanly. The room is the judge and the room is petty.", timer: 25, who: "one", type: "speed" },
  { t: "Roll Call", d: "Name every person in this room in reverse alphabetical order by first name.", timer: 45, who: "one", type: "speed" },
  { t: "Toppings", d: "Eight pizza toppings before the buzzer. Anything already said tonight doesn't count.", timer: 15, who: "one", type: "speed" },
  { t: "The Fifty", d: "Name twelve U.S. states before the buzzer. No repeats.", timer: 20, who: "one", type: "speed" },

  /* ---------- social ---------- */
  { t: "Say Something Nice", d: "Give a genuine, specific compliment to every single person in this room. Generic doesn't count and the room will call it.", timer: 90, who: "one", type: "social" },
  { t: "Interrogation", d: "Speak only in questions until your team's next turn. Slip once and the points come back off.", timer: 0, who: "one", type: "social" },
  { t: "On Your Feet", d: "You are standing for the rest of this round. Sit down and it's a forfeit.", timer: 0, who: "one", type: "social" },
  { t: "Camera Roll", d: "Show the room the most recent photo in your camera roll. No scrolling, no choosing.", timer: 20, who: "one", spice: "party", type: "social" },
  { t: "Read It Aloud", d: "Read your most recent sent text message out loud. Whole thing.", timer: 20, who: "one", spice: "party", type: "social" },
  { t: "I've Made A Huge Mistake", d: "Text the fifth person in your recent messages exactly: \"I've made a huge mistake.\" Nothing else. Show the room the send.", timer: 45, who: "one", spice: "party", type: "social" },
  { t: "New Wallpaper", d: "The room picks your phone wallpaper. It stays until this game ends.", timer: 45, who: "one", spice: "party", type: "social" },
  { t: "Wardrobe Swap", d: "Swap one visible article of clothing with someone else in the room. It stays swapped for the rest of the round.", timer: 45, who: "one", spice: "party", type: "social" },
  { t: "Confiscated", d: "Hand your phone to the host. You get it back after your team's next turn.", timer: 0, who: "one", spice: "party", type: "social" },

  /* ---------- whole room ---------- */
  { t: "Last One Standing", d: "EVERYBODY. Wall sit, all at once. Last person holding wins it for their team.", timer: 0, who: "room", type: "room" },
  { t: "Room-Wide Rochambeau", d: "EVERYBODY. Rock-paper-scissors, single elimination bracket, right now. Winner takes the points for their team.", timer: 0, who: "room", type: "room" },
  { t: "The Long Stare", d: "EVERYBODY. Staring contest, elimination style. Blink and you're out. Last eyes open score.", timer: 0, who: "room", type: "room" },
  { t: "Telephone", d: "EVERYBODY. The host whispers a sentence to one person. It goes around the room. If it survives intact, every team scores.", timer: 0, who: "room", type: "room" },
  { t: "Closest Guess", d: "EVERYBODY. The host writes down a number between 1 and 100. Everyone writes their guess on their phone, face down. Reveal all at once — closest wins. Nobody says a number out loud before the reveal.", timer: 45, who: "room", type: "room" },
  { t: "Human Knot", d: "EVERYBODY. Grab two hands that aren't next to you. Untangle without letting go. Beat the clock and every team scores.", timer: 120, who: "room", type: "room" },
  { t: "Freeze", d: "EVERYBODY. Freeze in place. Nobody moves, nobody laughs. First to break is out, last one frozen scores.", timer: 0, who: "room", type: "room" },
  /* ---------- more quirky physical ---------- */
  { t: "Dizzy Line", d: "Spin in place ten times, then walk a straight line across the room. Nobody has ever looked good doing this.", timer: 45, who: "one", type: "physical" },
  { t: "One Foot Hop", d: "Hop across the room and back on one foot. Second foot touches down, you're done.", timer: 45, who: "one", type: "physical" },
  { t: "Wheelbarrow Lap", d: "One teammate on their hands, the other holding their ankles. One lap. Nobody eats carpet.", timer: 45, who: "team", type: "physical" },
  { t: "Crab Walk", d: "Crab walk a lap of the room. Belly up the whole way. This is the only animal walk we kept, because it looks ridiculous.", timer: 45, who: "one", type: "physical" },

  /* ---------- burn — bodyweight only, nothing to fetch ---------- */
  { t: "Push-Up Count", d: "Fifteen clean push-ups before the buzzer. Chest near the floor or it doesn't count. The room counts out loud.", timer: 40, who: "one", type: "burn" },
  { t: "Burpees", d: "Ten burpees before the buzzer. Chest to the floor, jump at the top.", timer: 45, who: "one", type: "burn" },
  { t: "Air Squats", d: "Twenty-five air squats before the buzzer. Hips below the knees or the room won't count it.", timer: 45, who: "one", type: "burn" },
  { t: "Side Plank", d: "Side plank on either side until the buzzer. Hips stay up the whole time.", timer: 40, who: "one", type: "burn" },
  { t: "Superman", d: "Face down, arms and legs off the floor. Hold it until the buzzer.", timer: 40, who: "one", type: "burn" },
  { t: "Hollow Hold", d: "On your back, shoulders and heels off the floor, arms overhead. Hold it until the buzzer.", timer: 30, who: "one", type: "burn" },
  { t: "Jumping Jack Alphabet", d: "One jumping jack per letter, saying the alphabet out loud. Lose your place and you start over at A.", timer: 45, who: "one", type: "burn" },
  { t: "Mountain Climbers", d: "Forty mountain climbers before the buzzer. The room counts.", timer: 40, who: "one", type: "burn" },
  { t: "Lunge Lap", d: "Walking lunges, one full lap of the room. Back knee nearly touches the floor every step.", timer: 60, who: "one", type: "burn" },
  { t: "Team Push-Ups", d: "Whole team drops. Thirty push-ups combined before the buzzer. The room counts.", timer: 40, who: "team", type: "burn" },
  { t: "Push-Up Standoff", d: "EVERYBODY drops into the top of a push-up, arms straight. Last one still up wins it for their team.", timer: 0, who: "room", type: "room" },

  /* ---------- physical, with an audience problem ---------- */
  { t: "Plank and Publish", d: "Hold a plank while the person on your left reads your three most recent text messages out loud. Break the plank early and you forfeit.", timer: 45, who: "one", type: "physical", spice: "party" },
  { t: "Wall Sit Interrogation", d: "Wall sit while the room fires questions at you. Every question gets an honest answer. Stand up and it's over.", timer: 45, who: "one", type: "physical", spice: "party" },

  /* ---------- spicier dares ---------- */
  { t: "Screen Time", d: "Open your weekly screen time report and hold the phone up. No commentary, no excuses.", timer: 30, who: "one", type: "social", spice: "party" },
  { t: "Recently Played", d: "Show the room the last five songs you actually listened to. The whole list.", timer: 30, who: "one", type: "social", spice: "party" },
  { t: "Notes App", d: "Open your notes app and read the most recent note out loud, whatever it turns out to be.", timer: 40, who: "one", type: "social", spice: "party" },
  { t: "Order History", d: "Show the room the last thing you bought online.", timer: 30, who: "one", type: "social", spice: "party" },
  { t: "Top Emoji", d: "Open your keyboard and show the room your most-used emoji. Then explain yourself.", timer: 30, who: "one", type: "social", spice: "party" },
  { t: "The Reply Guy", d: "Read out loud the last message you sent to the person you text most.", timer: 30, who: "one", type: "social", spice: "party" },
  { t: "Ten Seconds", d: "Hand your phone to the person across from you. They get ten seconds in your camera roll and full narration rights.", timer: 20, who: "one", type: "social", spice: "party" },
  { t: "Cryptic", d: "Send a single unexplained emoji to your largest group chat. Do not answer any follow-up questions for the rest of the round.", timer: 40, who: "one", type: "social", spice: "party" },
  { t: "Old Voicemail", d: "Find the oldest saved voicemail on your phone and play it for the room.", timer: 60, who: "one", type: "social", spice: "party" },
  { t: "Worst Purchase", d: "Tell the room about the dumbest thing you have ever spent real money on. Amount included.", timer: 60, who: "one", type: "social", spice: "party" },
  { t: "Unsent", d: "Describe — no names — the pettiest message you have ever typed out and then deleted without sending.", timer: 60, who: "one", type: "social", spice: "party" },

  /* ---------- drinking games ----------
     Every one of these is a sip. None of them is a race, a shot, or a
     finish-your-drink, on purpose. `drinks: true` keeps the whole set behind
     its own toggle so a room with somebody sober, pregnant or driving can
     still play everything else. */
  { t: "Never Have I Ever", d: "Everybody holds up three fingers. Go around the room with a 'never have I ever' — drop a finger and take a sip if you've done it. First person out of fingers loses the square for their team.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Categories", d: "Picker names a category. Go around the circle naming things in it. Repeat, stall, or blank out and you take a sip.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Rule Master", d: "The picking team invents one rule that binds the entire room until their next turn. Break the rule, take a sip. Choose something petty.", timer: 0, who: "team", type: "drink", drinks: true },
  { t: "Thumb Master", d: "At any point before your next turn, put your thumb on the table without saying a word. Last person to notice and copy you takes a sip.", timer: 0, who: "one", type: "drink", drinks: true },
  { t: "Buzz", d: "Count up from one around the room, but every multiple of seven — and every number containing a seven — becomes 'buzz.' Miss it, take a sip.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Fingers", d: "Everybody puts one finger on a cup. Picker calls a number, everyone pulls off or leaves on at the same time. Guess the total right and you're out — last one still touching the cup sips.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Paranoia", d: "Whisper a question about the room to the person on your left. They answer out loud, but nobody else hears the question. Flip a coin — heads, they reveal it. Tails, everybody sips and wonders.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Medusa", d: "Everybody heads down. On three, heads up and stare directly at one person. If you make eye contact with the person staring back, you both sip.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Two Truths and a Lie", d: "Picker tells the room three things about themselves. Host counts down from three and everybody points at the lie at the same time. Wrong guessers sip. If nobody gets it, the picker's team takes the points.", timer: 60, who: "one", type: "drink", drinks: true },
  { t: "I'm Going on a Picnic", d: "Build the list around the room, each person repeating everything before adding one. First to drop an item takes a sip.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Straight Face", d: "The room does everything short of touching you to make you laugh. Hold out until the buzzer or take a sip.", timer: 45, who: "one", type: "drink", drinks: true },
  { t: "Quarters", d: "Bounce a coin off the table into a cup. Sink it and you assign a sip to anybody you like. Three attempts.", timer: 0, who: "one", type: "drink", drinks: true },
  { t: "Cup Flip", d: "Empty cup on the table edge, flip it upright with one finger. Land it and hand out a sip. Three attempts, then it passes left.", timer: 0, who: "one", type: "drink", drinks: true },
  { t: "Question Master", d: "Until your team's next turn, anybody who answers a direct question from you takes a sip. The trick is getting them to forget.", timer: 0, who: "one", type: "drink", drinks: true },
  { t: "Word Association", d: "Picker says a word. Go around the room, each person saying the first word it makes them think of. Hesitate or repeat, take a sip.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Give Two", d: "Hand out two sips to anybody in the room. You do not have to explain yourself, and you should not.", timer: 0, who: "one", type: "drink", drinks: true },
  { t: "The Toast", d: "Stand up and give a completely sincere toast to somebody in this room. Anybody who laughs during it takes a sip. If nobody laughs, the whole room drinks to you.", timer: 60, who: "one", type: "drink", drinks: true },
  { t: "Drink Roulette", d: "On the count of three, everybody points at the person they think is going to win this whole game. Anybody who gets pointed at more than once takes a sip.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "The Interview", d: "Thirty seconds of rapid-fire questions from the room. Every one gets an answer. Hesitate, dodge, or laugh and you take a sip.", timer: 30, who: "one", type: "drink", drinks: true },
  { t: "Red or Black", d: "Call red or black, then flip over the top card of a deck. Miss it and take a sip. Hit it and hand out two.", timer: 0, who: "one", type: "drink", drinks: true },
  { t: "Waterfall of Words", d: "Picker starts a story with one sentence. It goes around the room, one sentence each. Anybody who breaks the story or goes silent takes a sip.", timer: 0, who: "room", type: "drink", drinks: true },
  { t: "Everybody Freeze Frame", d: "EVERYBODY. The host names a scene — a bank robbery, a family photo, the moment the boat sinks. The whole room has ten seconds to freeze into it. Best pose scores for their team.", timer: 15, who: "room", type: "room" },
  { t: "One Word Story", d: "EVERYBODY. Build a story around the room, one word per person, no pausing. It has to still be a sentence when it comes back around.", timer: 0, who: "room", type: "room" },
  { t: "Simon Says", d: "EVERYBODY. One round of Simon Says, host leading, no mercy. Last person standing scores for their team.", timer: 0, who: "room", type: "room" },
  { t: "The Compliment Circle", d: "EVERYBODY. Go around the room — each person gives the person on their left one genuine compliment. Ten seconds each. Anybody who phones it in gets sent around again.", timer: 0, who: "room", type: "room" },
  { t: "Copycat", d: "EVERYBODY. The picking team starts a motion. Each person around the circle repeats every motion before it and adds one. First to break the chain ends it.", timer: 0, who: "room", type: "room" },
  { t: "Air Band", d: "EVERYBODY. Host plays fifteen seconds of anything. Every person picks an instrument and commits. No two people on the same instrument.", timer: 20, who: "room", type: "room" },
  { t: "Desert Island", d: "EVERYBODY. Go around the room naming one thing you'd take to a desert island. No repeats, no hesitating. First person to stall is out.", timer: 0, who: "room", type: "room" },
  { t: "Stand Up, Sit Down", d: "EVERYBODY on your feet. The host calls out things — 'sit down if you've never been on a cruise.' Last person standing scores.", timer: 0, who: "room", type: "room" },
  { t: "The Wave", d: "EVERYBODY. Get a clean stadium wave all the way around the room three times without a single gap. Sounds easy. It is not.", timer: 45, who: "room", type: "room" },
  { t: "Guess Who Wrote It", d: "EVERYBODY writes one word describing this group on their phone and hands it to the host. Host reads them out. The room guesses who wrote which.", timer: 60, who: "room", type: "room" },
  { t: "Group Tongue Twister", d: "EVERYBODY, in unison, three times fast: 'red leather, yellow leather.' If the room falls apart, the room falls apart together.", timer: 25, who: "room", type: "room" },
  { t: "Pass the Face", d: "EVERYBODY. Picker makes a face at the person on their left, who copies it exactly and passes their own new one on. All the way around.", timer: 0, who: "room", type: "room" },
  { t: "Count to Ten", d: "EVERYBODY. As a room, count to ten out loud — but nobody can plan who says which number, and if two people speak at once you start over.", timer: 60, who: "room", type: "room" },
  { t: "Category Chain", d: "EVERYBODY. Picker names a category. Go around the room, one item each, no repeats. First to stall sits down. Keep going until one is left.", timer: 0, who: "room", type: "room" },
  { t: "Two Line Standoff", d: "EVERYBODY. Split into two lines facing each other. Staring contest with the person opposite. Winners step forward and pair up again until one is left.", timer: 0, who: "room", type: "room" },
  { t: "Group Portrait", d: "EVERYBODY. The host names a theme — 'a band album cover,' 'a family in 1987.' The room has twenty seconds to arrange itself and hold it for a photo.", timer: 25, who: "room", type: "room" }
];
