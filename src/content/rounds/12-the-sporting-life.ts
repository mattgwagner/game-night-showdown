import { defineRound } from '../types';

export default defineRound({
  id: "r12",
  name: "Round 12: The Sporting Life",
  tagline: "Hoops, links, pitches, ice and the Olympics — everything the other boards skipped",
  categories: {
    "NBA & Basketball": [
      { q: "How many points is a shot from behind the arc worth?", a: "Three" },
      { q: "NBA star everybody calls 'King James.'", a: "LeBron James" },
      { q: "What player, wearing 23 for Chicago, won six championships in the 1990s?", a: "Michael Jordan" },
      { q: "How many players from one team are on the court at a time?", a: "Five" },
      { q: "Who holds the NBA record for most points in a single game, with 100?", a: "Wilt Chamberlain" },
    ],
    "Golf": [
      { q: "Two under par on one hole. What's that?", a: "An eagle" },
      { q: "What green jacket-awarding tournament is played at Augusta National every April?", a: "The Masters" },
      { q: "How many holes are played in a standard round of golf?", a: "Eighteen" },
      { q: "'The Golden Bear,' with a record 18 major championships. Who?", a: "Jack Nicklaus" },
      { q: "You hole it from the tee on a par three. What's that called?", a: "A hole-in-one (also an ace)" },
    ],
    "Soccer & The World Cup": [
      { q: "What's it called when a tied soccer game is decided by kicks from 12 yards?", a: "A penalty shootout" },
      { q: "How often is the FIFA World Cup held?", a: "Every four years" },
      { q: "Only player on a soccer field allowed to use their hands. Which position?", a: "The goalkeeper" },
      { q: "What Argentine player, wearing number 10, won the 2022 World Cup?", a: "Lionel Messi" },
      { q: "Three goals in one game. What's that called?", a: "A hat trick" },
    ],
    "The Olympics": [
      { q: "Gold, silver, and what?", a: "Bronze" },
      { q: "How many rings are on the Olympic flag?", a: "Five" },
      { q: "What swimmer holds the record for most Olympic gold medals of all time?", a: "Michael Phelps" },
      { q: "In what country did the ancient Olympic Games originate?", a: "Greece" },
      { q: "What city hosted the first modern Olympic Games in 1896?", a: "Athens" },
    ],
    "Hockey": [
      { q: "The black rubber disk they slap around the ice. What's it called?", a: "The puck" },
      { q: "What trophy is awarded to the NHL champion each year?", a: "The Stanley Cup" },
      { q: "How many players per team are on the ice during even-strength play?", a: "Six, including the goalie" },
      { q: "What Canadian player is nicknamed 'The Great One'?", a: "Wayne Gretzky" },
      { q: "What's the penalty box commonly called?", a: "The sin bin" },
    ],
    "Tennis": [
      { q: "What does a score of zero get called in tennis?", a: "Love" },
      { q: "What surface is Wimbledon played on?", a: "Grass" },
      { q: "A serve nobody even touches. What's that called?", a: "An ace" },
      { q: "Swiss legend with 20 Grand Slam singles titles and a famously smooth one-handed backhand.", a: "Roger Federer" },
      { q: "How many Grand Slam tournaments are there in a year?", a: "Four" },
    ],
    "Sports Nicknames": [
      { q: "What Boston basketball arena is nicknamed 'The Garden'?", a: "TD Garden (Boston Garden)" },
      { q: "Which baseball legend was 'The Say Hey Kid'?", a: "Willie Mays" },
      { q: "What Broncos quarterback was nicknamed Captain Comeback?", a: "John Elway" },
      { q: "What NFL team is nicknamed 'America's Team'?", a: "The Dallas Cowboys" },
      { q: "What college football stadium is known as 'The Swamp'?", a: "Ben Hill Griffin Stadium, University of Florida" },
    ],
    "Records & Streaks": [
      { q: "How many games did the 1972 Miami Dolphins lose on their way to the title?", a: "None — they went undefeated" },
      { q: "What's the maximum score in a single game of ten-pin bowling?", a: "300" },
      { q: "In darts, what's the highest score possible with three darts?", a: "180" },
      { q: "What's the fastest a human has ever run 100 meters, to the nearest half second?", a: "9.58 seconds — Usain Bolt, 2009" },
      { q: "Cal Ripken Jr.'s consecutive-games streak. How many games?", a: "2,632", hint: "Closest guess wins." },
    ],
  },
});
