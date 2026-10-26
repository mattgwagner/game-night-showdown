import { defineRound } from '../types';

export default defineRound({
  id: "r1",
  name: "Round 1: The Classics",
  tagline: "Beer, guns, Disney, and dad jokes",
  categories: {
    "Beer": [
      { q: "Foam crown on a freshly poured pint — what's that called?", a: "The head" },
      { q: "Bud, Miller, and this third C-word lager used to own every American fridge. Name it.", a: "Coors" },
      { q: "Golden lager named after the Czech city where it was first brewed in 1842.", a: "Pilsner (from Plzeň)" },
      { q: "IPAs got hopped into oblivion so the beer wouldn't spoil on a months-long boat trip to where?", a: "India" },
      { q: "Chimay, Westmalle, Orval — Belgian beers brewed by what religious order of monks?", a: "Trappist monks" },
    ],
    "Firearms": [
      { q: "The 'AR' in AR-15. People swear it means assault rifle. What does it actually stand for?", a: "ArmaLite — the company that designed it" },
      { q: "Bullet comes out this tube. What's it called?", a: "The barrel" },
      { q: "A revolver feeds from a cylinder. A semi-auto pistol feeds from what — and no, 'clip' is wrong?", a: "A magazine" },
      { q: "The military calls it 5.56 NATO. What's its nearly identical civilian cartridge, named in inches?", a: ".223 Remington" },
      { q: "Israeli designer. Submachine gun. Named the whole thing after himself. Who?", a: "Uziel 'Uzi' Gal" },
    ],
    "Disney": [
      { q: "Mickey Mouse's dog. Starts with a P. Go.", a: "Pluto" },
      { q: "Timon's warthog best friend in The Lion King. Hakuna Matata. Name him.", a: "Pumbaa" },
      { q: "Elsa and Anna's kingdom in Frozen — what's it called?", a: "Arendelle" },
      { q: "Who sings 'Poor Unfortunate Souls' while casually ruining Ariel's life?", a: "Ursula" },
      { q: "Walt Disney World opened in Orlando in what year?", a: "1971" },
    ],
    "Artificial Intelligence": [
      { q: "ChatGPT. The 'GPT' stands for what three words?", a: "Generative Pre-trained Transformer" },
      { q: "Which AI company makes the chatbot Claude?", a: "Anthropic" },
      { q: "1997. IBM computer beats chess champ Garry Kasparov on live TV. Name the machine.", a: "Deep Blue" },
      { q: "When an AI invents a fact and says it with total confidence, what's that called?", a: "A hallucination" },
      { q: "1950. British mathematician proposes an 'imitation game' to test whether a machine can think. Who?", a: "Alan Turing (the Turing test)" },
    ],
    "Sports": [
      { q: "Bowling. Three strikes in a row. What's that called?", a: "A turkey" },
      { q: "American football. How many players from one team are on the field at once?", a: "11" },
      { q: "Golf. One stroke under par on a hole. What's that called?", a: "A birdie" },
      { q: "Only Grand Slam tennis tournament played on clay. Which one?", a: "The French Open (Roland Garros)" },
      { q: "Which country has won the most FIFA World Cups?", a: "Brazil (5)" },
    ],
    "College Football": [
      { q: "Bronze statue of a stiff-arming runner — college football's biggest individual award. Name the trophy.", a: "The Heisman Trophy" },
      { q: "Which rivalry game is nicknamed 'The World's Largest Outdoor Cocktail Party'?", a: "Florida vs. Georgia" },
      { q: "Alabama coaching legend in the houndstooth hat. Name him.", a: "Paul 'Bear' Bryant" },
      { q: "The conference that will not stop telling you it's 'just different.' What does SEC stand for?", a: "Southeastern Conference" },
      { q: "Only player ever to win the Heisman twice. Who?", a: "Archie Griffin (Ohio State, 1974 & 1975)" },
    ],
    "90s/2000s Nostalgia": [
      { q: "'Bye Bye Bye.' Which boy band?", a: "NSYNC" },
      { q: "Tiny digital pet. You fed it, put it to bed, cleaned up after it — or it died on you. What was it?", a: "A Tamagotchi" },
      { q: "Before Facebook, this site made you rank your Top 8 friends like a sociopath. Name it.", a: "MySpace" },
      { q: "1998 furry robot toy that 'learned' English, blinked at you, and would not shut up. Name it.", a: "A Furby" },
      { q: "1999 movie that invented 'bullet time' and sold a million pair of tiny black sunglasses.", a: "The Matrix" },
    ],
    "Dad Jokes & Pop Culture": [
      { q: "Finish the dad joke: Why don't skeletons fight each other?", a: "They don't have the guts" },
      { q: "Finish it: I'm reading a book about anti-gravity...", a: "It's impossible to put down" },
      { q: "Finish it: What do you call a fish with no eyes?", a: "A fsh" },
      { q: "Finish it: What did the ocean say to the beach?", a: "Nothing — it just waved" },
      { q: "Finish it: Why did the scarecrow win an award?", a: "He was outstanding in his field" },
    ],
  },
});
