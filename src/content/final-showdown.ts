import type { FinalQuestion } from './types';

// One of these closes out a cleared board: category shown, blind wagers, one question.
export const FINAL_SHOWDOWN: FinalQuestion[] = [
  { cat: "American Geography", q: "Four U.S. state capitals are named after U.S. presidents. Name three of them.", a: "Jackson MS, Jefferson City MO, Lincoln NE, Madison WI" },
  { cat: "Movies", q: "Only three films have won all five major Academy Awards — Picture, Director, Actor, Actress, and Screenplay. Name any two.", a: "It Happened One Night (1934), One Flew Over the Cuckoo's Nest (1975), The Silence of the Lambs (1991)" },
  { cat: "Sports", q: "Only one team in the four major North American leagues is publicly owned by its fans. Name the team.", a: "The Green Bay Packers" },
  { cat: "Food & Drink", q: "Bourbon has a legal definition in the United States. Name any two of its requirements.", a: "At least 51% corn; aged in new charred oak containers; distilled to no more than 160 proof; barreled at no more than 125 proof; made in the USA" },
  { cat: "History", q: "Three U.S. presidents have died on the Fourth of July. Name two of them.", a: "John Adams and Thomas Jefferson (both 1826), James Monroe (1831)" },
  { cat: "Science", q: "Name the four fundamental forces of physics.", a: "Gravity, electromagnetism, the strong nuclear force, the weak nuclear force" },
  { cat: "Music", q: "Only one artist has had a number one single in each of the last four decades in the United States. Who?", a: "Mariah Carey" },
  { cat: "The Great Outdoors", q: "What is the most-visited national park in the United States, by a wide margin?", a: "Great Smoky Mountains National Park" },
  { cat: "Florida", q: "Florida has two land borders. Name both states, and name the body of water on its western coast.", a: "Georgia and Alabama; the Gulf of Mexico" },
  { cat: "Labor Day", q: "Labor Day became a federal holiday in the United States in what decade, and it is observed on which specific day?", a: "The 1890s (1894) — the first Monday in September" },
  { cat: "Television", q: "Name the four main characters in Seinfeld's core cast.", a: "Jerry, George, Elaine, and Kramer" },
  { cat: "The Military", q: "Name all six branches of the United States Armed Forces.", a: "Army, Marine Corps, Navy, Air Force, Space Force, Coast Guard" }
];
