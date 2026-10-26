import { defineRound } from '../types';

export default defineRound({
  id: "r2",
  name: "Round 2: Modern Mix",
  tagline: "Movies, music, gaming, and grilling",
  categories: {
    "Movies & TV": [
      { q: "Breaking Bad. Chemistry teacher turned meth kingpin. Character's name?", a: "Walter White (Heisenberg)" },
      { q: "Tarantino, 1994, glowing briefcase nobody ever explains. What movie?", a: "Pulp Fiction" },
      { q: "HBO. Baltimore. Drug corners and broken institutions. Often called the best show ever. Name it.", a: "The Wire" },
      { q: "Who played the Joker in The Dark Knight — and won an Oscar for it after he was gone?", a: "Heath Ledger" },
      { q: "First movie ever to clear a billion dollars worldwide. Hint: big ship, cold water.", a: "Titanic" },
    ],
    "Music": [
      { q: "A 'shredder' is usually destroying which instrument?", a: "The electric guitar" },
      { q: "Taylor Swift's 2023–24 stadium tour that grossed over two billion dollars. Name it.", a: "The Eras Tour" },
      { q: "Seattle. Flannel. Kurt Cobain. Name the band.", a: "Nirvana" },
      { q: "Best-selling album of all time. Michael Jackson. 1982. Title?", a: "Thriller" },
      { q: "Every spring, rich people and influencers bake in the California desert at what festival?", a: "Coachella" },
    ],
    "Video Games": [
      { q: "Nintendo's mustachioed plumber mascot. Who is he?", a: "Mario" },
      { q: "2017 battle royale that blew up right alongside Fortnite. Abbreviation is fine.", a: "PUBG (PlayerUnknown's Battlegrounds)" },
      { q: "You play as Link the whole time, but whose name is in the title of the series?", a: "Zelda (The Legend of Zelda)" },
      { q: "Blocks, creepers, and building a dirt house at 2am. What game?", a: "Minecraft" },
      { q: "Sega's last home console before they quit the hardware business. Released in 1998.", a: "The Dreamcast" },
    ],
    "Fast Food & Junk Food": [
      { q: "Purple blob mascot named Grimace. Which chain?", a: "McDonald's" },
      { q: "Animal Style fries. Secret menu. California. Which burger chain?", a: "In-N-Out Burger" },
      { q: "Chicken sandwich empire that locks the doors every Sunday. Name it.", a: "Chick-fil-A" },
      { q: "Founder of Wendy's, who named the chain after his daughter and starred in its commercials for years.", a: "Dave Thomas" },
      { q: "Frito-Lay triangle chip. Nacho Cheese, Cool Ranch, the works. What are they?", a: "Doritos" },
    ],
    "Grilling & BBQ": [
      { q: "Meat in a smoker for hours, not flashing over open flame. What's that method called?", a: "Smoking" },
      { q: "Kansas City, Texas, Carolinas — each claims the 'real' version of what food?", a: "Barbecue" },
      { q: "Medium-rare steak. Roughly what internal temp are you hunting?", a: "About 130–135°F" },
      { q: "Texas brisket. Classic wood of choice?", a: "Post oak (oak is fine)" },
      { q: "Chemical reaction between amino acids and sugars that gives a seared steak its brown crust.", a: "The Maillard reaction" },
    ],
    "U.S. Military": [
      { q: "Which branch's motto is 'Semper Fidelis'?", a: "The Marine Corps" },
      { q: "U.S. Army birthday — same month and day as Flag Day. What date?", a: "June 14" },
      { q: "In the ranks, what does NCO stand for?", a: "Non-Commissioned Officer" },
      { q: "Brand-new second lieutenant. Gold bar. What's the unofficial nickname?", a: "Butter bar" },
      { q: "Army officers' academy on the Hudson River in New York. Formal name or nickname both work.", a: "West Point (United States Military Academy)" },
    ],
    "Space & Science": [
      { q: "Closest planet to the sun?", a: "Mercury" },
      { q: "Biggest planet in our solar system?", a: "Jupiter" },
      { q: "NASA rover that landed on Mars in 2021 looking for ancient life. Name it.", a: "Perseverance" },
      { q: "How many humans have walked on the moon?", a: "Twelve", hint: "Closest guess wins." },
      { q: "Elon Musk's rocket company — first to stick a reusable orbital-class booster landing.", a: "SpaceX" },
    ],
    "Geography & Travel": [
      { q: "Smallest country on Earth by land area?", a: "Vatican City" },
      { q: "Canal finished in 1914 that cuts between the Atlantic and Pacific through Central America.", a: "The Panama Canal" },
      { q: "Longest mountain range on any continent, running down the whole western side of South America.", a: "The Andes" },
      { q: "Victoria Falls sits on the border of Zambia and what other country?", a: "Zimbabwe" },
      { q: "Only U.S. state that borders exactly one other state.", a: "Maine (only New Hampshire)" },
    ],
  },
});
