import { defineRound } from '../types';

export default defineRound({
  id: "r13",
  name: "Round 13: Wild Kingdom",
  tagline: "Animals, weather, dinosaurs and the machine you're currently sitting in",
  categories: {
    "Animals & Wildlife": [
      { q: "What's the largest land animal on Earth?", a: "The African elephant" },
      { q: "What's the only marsupial native to North America?", a: "The opossum" },
      { q: "Fastest land animal on Earth.", a: "The cheetah" },
      { q: "What's the only mammal that lays eggs, besides the echidna?", a: "The platypus" },
      { q: "What's a group of lions called?", a: "A pride" },
    ],
    "Dogs & Pets": [
      { q: "What's the most popular dog breed in the United States, by registrations?", a: "The Labrador Retriever" },
      { q: "Cartoon Great Dane who solves mysteries for Scooby Snacks.", a: "Scooby-Doo" },
      { q: "How many teeth does an adult dog normally have?", a: "42" },
      { q: "Cats always land on their feet. What's that called?", a: "The righting reflex" },
      { q: "What breed is the smallest dog breed in the world?", a: "The Chihuahua" },
    ],
    "Sharks & The Ocean": [
      { q: "What's the largest fish in the ocean?", a: "The whale shark" },
      { q: "How many arms does an octopus have?", a: "Eight" },
      { q: "What percentage of Earth's surface is covered by ocean, roughly?", a: "About 71 percent" },
      { q: "Baby shark. Not the song. What's the actual word for a young shark?", a: "A pup" },
      { q: "What's the deepest known point in any ocean?", a: "Challenger Deep, in the Mariana Trench" },
    ],
    "Dinosaurs": [
      { q: "Plant-eating dinosaur with three horns on its face and a big frill.", a: "Triceratops" },
      { q: "What does 'Tyrannosaurus Rex' roughly translate to?", a: "Tyrant lizard king" },
      { q: "What dinosaur had a distinctive double row of plates along its back and spikes on its tail?", a: "Stegosaurus" },
      { q: "Jurassic is the middle one. What do you call the whole age of dinosaurs?", a: "The Mesozoic" },
      { q: "What's the leading scientific explanation for the dinosaurs' extinction about 66 million years ago?", a: "An asteroid impact (the Chicxulub impactor)" },
    ],
    "The Human Body": [
      { q: "What's the largest organ in the human body?", a: "The skin" },
      { q: "How many chambers does the human heart have?", a: "Four" },
      { q: "What's the smallest bone in the human body, found in the ear?", a: "The stapes (stirrup)" },
      { q: "What organ produces insulin?", a: "The pancreas" },
      { q: "Which blood type is the universal donor for red blood cells?", a: "O negative" },
    ],
    "Weather & Disasters": [
      { q: "What scale is used to rate hurricane strength from 1 to 5?", a: "The Saffir-Simpson scale" },
      { q: "What scale rates tornado intensity in the United States today?", a: "The Enhanced Fujita (EF) scale" },
      { q: "A hurricane in the western Pacific has a different name. What is it?", a: "A typhoon" },
      { q: "Category 5 hurricane: sustained winds start at what speed, in miles per hour?", a: "157 mph", hint: "Closest guess wins." },
      { q: "What instrument measures atmospheric pressure and helps predict storms?", a: "A barometer" },
    ],
    "Bugs & Creepy Crawlies": [
      { q: "How many legs on a bug that actually counts as an insect?", a: "Six" },
      { q: "Starts life as a caterpillar, spends some time in a chrysalis, comes out with wings. What is it?", a: "A butterfly" },
      { q: "What's the only bee in a hive that lays eggs?", a: "The queen" },
      { q: "How many eyes do most spiders have?", a: "Eight" },
      { q: "What insect is responsible for more human deaths per year than any other animal?", a: "The mosquito" },
    ],
    "Trees & Plants": [
      { q: "Plants eat sunlight. What's that process called?", a: "Photosynthesis" },
      { q: "What's the tallest tree species in the world?", a: "The coast redwood" },
      { q: "How can you estimate a tree's age from its trunk?", a: "Count the growth rings" },
      { q: "Florida swamp tree with woody 'knees' poking up out of the water around it.", a: "Cypress (bald or pond cypress)" },
      { q: "What's the state tree of Florida, and the source of a well-known heart of palm?", a: "The sabal palm (cabbage palm)" },
    ],
  },
});
