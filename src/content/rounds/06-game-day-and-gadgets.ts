import { defineRound } from '../types';

export default defineRound({
  id: "r6",
  name: "Round 6: Game Day & Gadgets",
  tagline: "Consoles, toys, NFL, NASCAR, boats, and cocktails",
  categories: {
    "Classic Video Game Consoles": [
      { q: "Nintendo handheld from 1989 that lived in every backpack. Name it.", a: "The Game Boy" },
      { q: "Sony's first console, 1994. Started the whole PlayStation empire.", a: "The PlayStation (PS1)" },
      { q: "1977 Atari box that popularized swapping cartridges at home.", a: "The Atari 2600" },
      { q: "Nintendo's 2006 console with a motion remote that sent controllers flying through TV screens.", a: "The Wii" },
      { q: "Microsoft crashed the console party in 2001 with what machine?", a: "The Xbox" },
    ],
    "80s/90s Toys": [
      { q: "Danish interlocking bricks that destroy bare feet in the dark. What toy?", a: "LEGO" },
      { q: "Robots that turn into cars, then became a Michael Bay movie. Toy line?", a: "Transformers" },
      { q: "Mattel's plastic fashion doll since 1959. Still everywhere.", a: "Barbie" },
      { q: "String toy that 'sleeps' and does tricks — mid-'90s comeback kid.", a: "The yo-yo" },
      { q: "1996's must-have Christmas toy — a giggling red Sesame Street doll that started stampedes in stores. Full name?", a: "Tickle Me Elmo" },
    ],
    "Award Shows & Pop Culture Moments": [
      { q: "Super Bowl XXXVIII halftime, 2004. Justin Timberlake. 'Wardrobe malfunction.' Who was he performing with?", a: "Janet Jackson" },
      { q: "Will Smith won this award the same night he slapped Chris Rock.", a: "An Oscar" },
      { q: "Britney kissed Madonna here. Kanye stole Taylor's mic here. Which award show?", a: "The VMAs" },
      { q: "Music award shaped like a tiny gramophone.", a: "A Grammy" },
      { q: "TV award that comes in primetime and daytime flavors.", a: "An Emmy" },
    ],
    "NFL": [
      { q: "Touchdown is worth how many points — before the extra point?", a: "6" },
      { q: "How many points is a field goal worth?", a: "Three" },
      { q: "NFL championship every February. What's it called?", a: "The Super Bowl" },
      { q: "Florida NFL team that plays at Raymond James Stadium in Tampa.", a: "The Tampa Bay Buccaneers" },
      { q: "Quarterback with the most Super Bowl rings — seven of them.", a: "Tom Brady" },
    ],
    "NASCAR & Racing": [
      { q: "NASCAR's Super Bowl — every February in Florida. Name the race.", a: "The Daytona 500" },
      { q: "Memorial Day weekend in Indiana. 'Greatest Spectacle in Racing.' What race?", a: "The Indianapolis 500" },
      { q: "Checkered flag ends the race. Which flag tells drivers there's one lap to go?", a: "The white flag" },
      { q: "No. 3 car. Died at Daytona in 2001. Which NASCAR legend?", a: "Dale Earnhardt" },
      { q: "European open-wheel series that thinks it's the pinnacle of motorsport. Name it.", a: "Formula 1" },
    ],
    "Beach & Boating Life": [
      { q: "Double-red flag on a Florida beach means what, exactly?", a: "Water closed — no swimming" },
      { q: "You throw this off the boat so you stop drifting into the next county.", a: "An anchor" },
      { q: "Legally required for every person on a boat in most states. What gear?", a: "A life jacket (PFD)" },
      { q: "Purple-blue float on the sand with nasty tentacles. Looks like a jellyfish, technically isn't. Name it.", a: "A Portuguese man o' war" },
      { q: "Giant February boat show in Miami — one of the biggest on Earth.", a: "The Miami International Boat Show" },
    ],
    "Craft Cocktails & Spirits": [
      { q: "Mojito base spirit — with mint, lime, and soda. What is it?", a: "Rum" },
      { q: "Tequila, lime, triple sec, salt on the rim. Name the cocktail.", a: "A margarita" },
      { q: "Spirit distilled from blue agave, mostly in Mexico.", a: "Tequila" },
      { q: "Bourbon, sugar, bitters — the drink Don Draper was always holding.", a: "An Old Fashioned" },
      { q: "Gin, Campari, sweet vermouth, equal parts, orange peel. Name the cocktail.", a: "A Negroni" },
    ],
    "Tech & Gadgets": [
      { q: "Korean company behind the Galaxy phones.", a: "Samsung" },
      { q: "Company that shipped the first iPhone in 2007.", a: "Apple" },
      { q: "Wrist thing that counts your steps and judges your heart rate — Fitbit, Apple Watch, etc.", a: "A fitness tracker / smartwatch" },
      { q: "Amazon cylinder that wakes up when you say 'Alexa.'", a: "The Amazon Echo" },
      { q: "Company formerly known as Facebook that owns Instagram and WhatsApp.", a: "Meta" },
    ],
  },
});
