import { defineRound } from '../types';

export default defineRound({
  id: "r5",
  name: "Round 5: Screen Time & Southern Life",
  tagline: "Cartoons, sitcoms, Marvel, hunting, and comfort food",
  categories: {
    "90s/2000s Cartoons": [
      { q: "Yellow family at 742 Evergreen Terrace, Springfield. Who are they?", a: "The Simpsons" },
      { q: "Sponge. Square pants. Works at the Krusty Krab. Name the show.", a: "SpongeBob SquarePants" },
      { q: "Sugar, spice, everything nice, and an accidental dose of Chemical X. Who are they?", a: "The Powerpuff Girls" },
      { q: "Tommy, Chuckie, and a gang of talking babies in diapers. What cartoon?", a: "Rugrats" },
      { q: "Boy genius, secret lab, sister Dee Dee always barging in. Cartoon Network classic.", a: "Dexter's Laboratory" },
    ],
    "Classic Sitcoms": [
      { q: "Ross, Rachel, Joey, Central Perk. Name the show.", a: "Friends" },
      { q: "Boston bar. Theme song promises everybody knows your name. What sitcom?", a: "Cheers" },
      { q: "Show 'about nothing.' Jerry, George, Elaine, Kramer. Name it.", a: "Seinfeld" },
      { q: "Danny Tanner raises three daughters in San Francisco with help from Uncle Jesse and Joey. What sitcom?", a: "Full House" },
      { q: "Paper company in Scranton called Dunder Mifflin. What show?", a: "The Office" },
    ],
    "Marvel & Superhero Movies": [
      { q: "Spider-Man's real name?", a: "Peter Parker" },
      { q: "Tony Stark's polite British AI butler in the Iron Man movies. Name him.", a: "JARVIS" },
      { q: "2019 Marvel movie that briefly owned the all-time box office and closed the Infinity Saga.", a: "Avengers: Endgame" },
      { q: "Who plays Thor in the MCU?", a: "Chris Hemsworth" },
      { q: "Nearly-indestructible metal from Wakanda that Cap's shield is made of.", a: "Vibranium" },
    ],
    "Southern Cooking & Comfort Food": [
      { q: "Louisiana one-pot classic that starts with a dark roux — sausage, chicken, or seafood. What is it?", a: "Gumbo" },
      { q: "Leafy green slow-cooked with ham hocks. Southern staple. Name it.", a: "Collard greens" },
      { q: "Cornmeal porridge of the South — often paired with shrimp. What is it?", a: "Grits" },
      { q: "Peaches, biscuit topping, baked until it bubbles. Name that dessert.", a: "Peach cobbler" },
      { q: "Cajun cooking's 'holy trinity.' Name all three vegetables.", a: "Onion, celery, and bell pepper" },
    ],
    "Hunting & The Outdoors": [
      { q: "Before you legally hunt deer in Florida, the state wants what piece of paper?", a: "A hunting license" },
      { q: "Bright color hunters wear so nobody mistakes them for a deer.", a: "Blaze orange (hunter orange)" },
      { q: "Platform up a tree that hunters sit in for hours questioning their life choices.", a: "A tree stand" },
      { q: "Loud, weird noise turkey hunters make to call in gobblers. What's the tool called?", a: "A turkey call" },
      { q: "Wind blows from you to the deer and they vanish. What did you just gift them?", a: "Your scent" },
    ],
    "Concerts & Live Music": [
      { q: "Band that plays before the headliner. What are they called?", a: "The opener (opening act)" },
      { q: "Nickname for the cheap seats at the absolute back of an arena.", a: "The nosebleeds" },
      { q: "Circle of shoving and chaos right in front of the stage at a rock show. What's it called?", a: "A mosh pit" },
      { q: "Free 1969 festival in upstate New York that became the whole counterculture's yearbook photo.", a: "Woodstock" },
      { q: "During a slow song, what do people traditionally hold up and wave — back when it was actually on fire?", a: "A lighter" },
    ],
    "Action Movies": [
      { q: "Who played John McClane in Die Hard?", a: "Bruce Willis" },
      { q: "1986 Tom Cruise Navy pilot movie that got a 2022 sequel called Maverick.", a: "Top Gun" },
      { q: "Vin Diesel. Family. Illegal street racing. Name the franchise.", a: "Fast & Furious" },
      { q: "Keanu Reeves. Retired hitman. Somebody kills his dog, and that's a mistake. What franchise?", a: "John Wick" },
      { q: "Actor forever stuck saying 'I'll be back' as the Terminator.", a: "Arnold Schwarzenegger" },
    ],
    "Reality TV": [
      { q: "E! show that made a whole family famous starting in 2007. Kris, Kim, Khloé, Kourtney.", a: "Keeping Up with the Kardashians" },
      { q: "'Outwit, Outplay, Outlast.' Remote island. Alliances and betrayal. What show?", a: "Survivor" },
      { q: "One lead, a dozen contestants, roses at the ceremony. Bachelor or Bachelorette both count.", a: "The Bachelor / The Bachelorette" },
      { q: "Gordon Ramsay yelling at home cooks. Competitive cooking show. Name it.", a: "MasterChef" },
      { q: "Entrepreneurs pitch rich people for money. Tank full of investors. What show?", a: "Shark Tank" },
    ],
  },
});
