import type { TheoryData } from './types';

export const theoryData: TheoryData = {
  parts: [
    {
      title: "Part 1: Fundamental Concepts",
      chapters: [
        {
          id: "chapter-1",
          title: "Chapter 1: Beyond Beginning Poker",
          overview: "At its core, poker appears to be a simple game of luck and chance. Anyone can learn the basic rules in minutes, which creates a deceptive veneer of simplicity. However, professional poker is entirely about skill, specifically the skill of minimizing losses on bad hands and maximizing profits on good hands. It is a game where you are constantly at war with luck. The true object of poker is not to win individual pots, but to make money by consistently making decisions with positive mathematical expectation over the long run.",
          keyIdeas: [
            "**Poker is a Game of Skill:** Expert players do not rely on luck. They use skill to mitigate bad luck and capitalize on good luck.",
            "**The Object is Making Money:** Your goal is not to win the most pots, but to maximize profits and minimize losses.",
            "**Variations of Poker:** Whether you are playing Limit, Pot-Limit, or No-Limit, the underlying mathematical logic remains the same.",
            "**Poker Logic vs. Tricks:** True poker logic is based on sound precepts and math, not cheap psychological tricks, gestures, or 'tells'.",
            "**The Long Run:** Every individual hand is just a small part of a lifelong game. Evaluate success based on overall win rate."
          ],
          detailedExplanation: "Many novice players believe they are good because they occasionally win big pots, often attributing their losses to 'bad beats' or bad luck. But as world champion Bobby Baldwin implies, complaining about bad beats is a mirage. If you are an excellent player, you will experience more bad beats simply because you will have the best hand against your opponents far more often than they have it against you.\n\nThe structure of the game (Limit vs. No-Limit) significantly changes how these concepts are applied, but the core theories (like semi-bluffing, slowplaying, and pot odds) are universal. In Limit games, bets are structured and predictable. In No-Limit and Pot-Limit, the ability to bet your entire stack introduces immense pressure and shifts the math toward implied odds.\n\nAbove all, you must divorce your ego from winning individual pots. Chasing a pot just because you already have money in it is a surefire way to go broke. You must develop the discipline to release hands you judge to be second-best, saving bets that directly add to your overall win rate.",
          caseStudies: [
            {
              title: "Case Study 1: The Trap of 'Pot Commitment'",
              situation: "You are playing a $5-$10 Limit Hold'em game. You are in the Big Blind with K♣ J♣. The flop comes A♠ 10♦ 4♥. A tight player in early position bets, and a calling station calls. You have nothing but a gutshot straight draw.",
              decision: "Fold.",
              explanation: "Even though you already posted the big blind and the pot looks tempting, your hand is extremely weak against a bet and a call. Professional players know that the blind no longer belongs to them. Calling here is a negative expectation play."
            },
            {
              title: "Case Study 2: Knowing When to Quit",
              situation: "You are playing $2-$5 No-Limit Hold'em. You've had a terrible run of variance and are down $800. You are tired, frustrated, and notice that the game has tightened up; the 'fish' have left, replaced by three solid regulars.",
              decision: "Quit the game immediately.",
              explanation: "The object of poker is to make money. You should only sit at a table when you are a favorite. Because you are stuck, emotional, and the table dynamics have shifted to favor the opponents, you are now an underdog."
            }
          ],
          commonMistakes: [
            "**Chasing Money:** Calling bets because you feel 'committed' to a pot you have already invested in.",
            "**Playing for Ego:** Trying to win every hand or outplay specific opponents to prove a point.",
            "**Results-Oriented Thinking:** Judging a play based on whether you won or lost the hand, rather than whether the decision was +EV.",
            "**Staying in Bad Games:** Refusing to leave a table when you are playing poorly or when the table is full of better players."
          ],
          proTips: [
            "**The Money is Gone:** Once your chips cross the betting line, they belong to the pot. Make decisions based only on the current pot size and future bets.",
            "**Be a Robot with Bankroll:** Treat your buy-in as an investment. Do not play with money you are afraid to lose.",
            "**Table Selection is a Skill:** The easiest way to increase your hourly rate is to play against players worse than you."
          ],
          connections: [
            "**Hourly Rate & Expectation (Chapter 2):** To achieve the goal of making money, you must strictly adhere to positive expectation (+EV) plays.",
            "**The Fundamental Theorem (Chapter 3):** Playing correctly means playing as if you could see your opponents' cards."
          ]
        },
        {
          id: "chapter-2",
          title: "Chapter 2: Expectation and Hourly Rate",
          overview: "Mathematical expectation is the foundation of all gambling, including poker. It defines the amount a bet will average winning or losing over time. In poker, every decision, whether to fold, call, or raise, should be evaluated based on its mathematical expectation. The sum of all your expectations forms your hourly rate. Professional players focus exclusively on making plays with a positive expectation (+EV) and avoiding those with a negative expectation (-EV).",
          keyIdeas: [
            "**Mathematical Expectation (+EV / -EV):** The average amount you stand to win or lose per bet.",
            "**Hourly Rate:** The amount of money you expect to win per hour, calculated by summing the expectations of your plays.",
            "**Results are Irrelevant in the Short Term:** Whether a specific +EV play wins or loses a given pot does not change its mathematical correctness.",
            "**Relative Expectation:** The 'best' play is the one that maximizes your positive expectation or minimizes your negative expectation.",
            "**Saving Money is Making Money:** Folding a hand that has negative expectation directly adds to your hourly rate."
          ],
          detailedExplanation: "Expectation is calculated by weighing the probability of winning against the pot odds. If someone offers you 2-to-1 odds on a coin flip, you have a positive expectation. Even if you lose the first ten flips, over 1,000 flips, the math guarantees a profit.\n\nIn poker, this concept dictates your play. When the pot is offering you odds that are better than your mathematical chances of hitting your hand, making the call is +EV. If your chances of hitting are worse than the pot odds, calling is -EV.\n\nFurthermore, analyzing expectation applies to more complex decisions, like whether to call or raise. If you have a very strong hand on the river and a raise would force out opponents who would otherwise call a simple bet, the call might yield a higher positive expectation.",
          caseStudies: [
            {
              title: "Case Study 1: The Pot Odds Call",
              situation: "Limit Hold'em. Pot is $100. Opponent bets $20. You have a flush draw (roughly a 4-to-1 underdog).",
              decision: "Call.",
              explanation: "You are getting $120 to $20, which is 6-to-1 pot odds. Since your odds of hitting are 4-to-1, you have a positive expectation (+EV)."
            },
            {
              title: "Case Study 2: The Multi-way Trap",
              situation: "Seven-Card Stud, you hit a hidden full house. Player to your right bets $10. Two loose players behind you will call a single bet but fold to a raise.",
              decision: "Call.",
              explanation: "Calling wins $10 from three different players ($30 total). Raising might only win $20 total from the original bettor. Calling has a higher positive expectation."
            }
          ],
          commonMistakes: [
            "**Being Results-Oriented:** Getting angry at 'bad beats' rather than being happy an opponent made a -EV call.",
            "**Ignoring the Rake:** Failing to factor in the casino rake when calculating hourly rate.",
            "**Raising Automatically:** Raising with a strong hand without considering if a flat call would yield a higher expected value."
          ],
          proTips: [
            "**The Stoicism of Math:** Understanding expectation gives you equanimity. This mindset cures 'tilt'.",
            "**Observe Opponent Leaks:** Your hourly rate is directly tied to identifying the players making the most -EV plays."
          ],
          connections: [
            "**Pot Odds (Chapter 5):** Pot odds are the practical application of calculating your expectation on a drawing hand.",
            "**The Fundamental Theorem (Chapter 3):** Opponent mistakes are transferred directly into your positive expectation."
          ]
        },
        {
          id: "chapter-3",
          title: "Chapter 3: The Fundamental Theorem of Poker",
          overview: "The Fundamental Theorem of Poker is the central mathematical and logical principle upon which all profitable poker strategy is built. Because poker is a game of incomplete information, perfect play is impossible. However, the theorem states that every time you play your hand the way you would if you could see your opponents' hidden cards, you gain; and every time your opponents play their hands differently than they would if they could see yours, you also gain.",
          keyIdeas: [
            "**The Core Theorem:** 'Every time you play a hand differently from the way you would have played it if you could see all your opponents' cards, they gain; and every time you play your hand the same way you would have played it if you could see all their cards, they lose.'",
            "**Defining a 'Mistake':** A mistake is simply playing differently than you would if you had perfect information.",
            "**The Goal of Deception:** You use deception (bluffing, slowplaying) to induce opponents into making Fundamental Theorem mistakes.",
            "**Multi-Way Pot Exception:** Sometimes you want one opponent to play correctly if it helps drive out a third opponent whose draw threatens you."
          ],
          detailedExplanation: "If poker were played with all cards exposed, it would be a purely mathematical exercise. The art of poker lies in dealing with the unknown. According to the theorem, you profit when opponents act incorrectly based on what you hold.\n\nImagine you bet with a strong hand and your opponent calls with a draw. If the pot is huge, their call might be mathematically justified. In this case, because they are playing correctly, you do not gain anything long-term; you only gain when they fold incorrectly. You are constantly trying to create situations where opponents either call when they don't have the odds, or fold when they do have the odds.",
          caseStudies: [
            {
              title: "Case Study 1: Profiting from an Incorrect Call",
              situation: "You hold A♠ K♠ on a board of K♥ 7♦ 2♣ 9♠. Pot is $40. You bet $10. Opponent holds 8♥ 9♥ (middle pair) and calls.",
              decision: "Bet, and want them to call.",
              explanation: "If they could see your cards, they would fold. Because they can't, they make the mistake of calling. You gain money in the long run as the theorem dictates."
            },
            {
              title: "Case Study 2: Hoping for an Incorrect Fold",
              situation: "You have a set of Jacks on a board of J♥ 8♦ 4♠. Pot is $200. You bet $50. Opponent has a flush draw (getting 5-to-1).",
              decision: "Bet, but theoretically, you want them to fold.",
              explanation: "Since their call is mathematically justified (correct), you actually gain the most value when you bet and they get scared and fold (incorrectly)."
            }
          ],
          commonMistakes: [
            "**Being Upset When Draws Miss:** You should be thrilled when opponents make bad calls; they made a theorem mistake.",
            "**Thinking Every Call is Good:** If they are getting correct odds, their call is correct and you lose theoretical value.",
            "**Over-Bluffing:** Gives opponents 'perfect information' that your bets don't mean strength, allowing them to call correctly more often."
          ],
          proTips: [
            "**The Two Paths to Victory:** Read hands better (gaining info) and play deceptively (hiding info).",
            "**Celebrate Mistakes, Not Results:** Measure sessions by how many times you forced opponents to make theorem mistakes."
          ],
          connections: [
            "**Pot Odds (Chapter 5):** The tool used to determine if a call was a 'mistake' under the Fundamental Theorem.",
            "**The Value of Deception (Chapter 8):** Deception is the primary weapon used to force opponents to act incorrectly."
          ]
        },
        {
          id: "chapter-4",
          title: "Chapter 4: The Ante Structure",
          overview: "Every hand of poker begins as a struggle for the initial money in the pot: the antes or the blinds. Without this forced money, there would be no reason to play anything but absolute premium hands. The size of the ante relative to the future betting limits is the single most important factor in determining your baseline strategy. It dictates how loose or tight you should play.",
          keyIdeas: [
            "**The Struggle for Antes:** All future action stems from the initial battle for the dead money.",
            "**The Golden Rule of Antes:** The lower the ante in comparison to future bets, the tighter you play. The higher the ante, the looser you play.",
            "**Pot Odds Dictate Starting Hands:** Large antes offer better immediate odds, justifying calls with slightly weaker holdings.",
            "**Stealing:** As the ante increases, stealing becomes a more profitable and necessary strategy.",
            "**Slowplaying:** Large antes discourage slowplaying; small antes encourage it."
          ],
          detailedExplanation: "To evaluate the ante structure, view it through the lens of pot odds. If you play $10-$20 with a $1 ante, there is $8 in the pot. If the ante is $3, there is $24. The expectation changes drastically.\n\n**Large Ante Games:** You must lower starting requirements. If you wait for Aces, antes will bleed you dry. You should aggressively steal and raise immediately with premium hands to deny cheap drawing odds.\n\n**Small Ante Games:** The game becomes tight. Pot odds don't justify gambling with marginal hands. Stick to premium hands and rarely steal. This is the perfect environment to slowplay a monster hand to build a pot later.",
          caseStudies: [
            {
              title: "Case Study 1: The High Ante Steal",
              situation: "Seven-Card Stud ($5 ante, $20-$40 limits). You have a marginal pair of 7s but are the highest card showing and act last.",
              decision: "Raise.",
              explanation: "The ante is large enough that stealing is highly profitable. Risking $20 to win $40 dead money is a sound mathematical play."
            },
            {
              title: "Case Study 2: The Small Ante Trap",
              situation: "Tight $2-$4 Limit Hold'em with a tiny micro-ante. You have K♥ K♦ under the gun.",
              decision: "Limp to slowplay.",
              explanation: "No dead money worth stealing. Raising might fold everyone. Limping encourages weaker hands to enter cheaply so you can extract larger bets later."
            }
          ],
          commonMistakes: [
            "**Playing Too Loose in Small-Ante Games:** Entering pots with weak hands when there isn't enough dead money to justify the risk.",
            "**Waiting Too Long in High-Ante Games:** Letting large antes erode your stack while waiting for premium pairs.",
            "**Slowplaying in High-Ante Games:** Large pots mean opponents have correct odds to draw; you must raise to protect your hand."
          ],
          proTips: [
            "**Evaluate Immediately:** Calculate total antes as a percentage of the lower limit to determine if the game is tight or loose.",
            "**Steal from the Tight:** In high-ante games, target players who haven't adjusted their requirements to the math."
          ],
          connections: [
            "**Pot Odds (Chapter 5):** Ante size directly creates the initial pot odds, dictating starting strategy.",
            "**Loose and Tight Play (Chapter 16):** The ante structure is the primary driver of game texture."
          ]
        },
        {
          id: "chapter-5",
          title: "Chapter 5: Pot Odds",
          overview: "Pot odds are the fundamental mathematical tool used to evaluate whether a bet is worth calling. They represent the ratio between the size of the pot and the size of the bet you are facing. To play profitable poker, you must constantly compare the odds the pot is giving you against the actual probability of your hand winning.",
          keyIdeas: [
            "**Defining Pot Odds:** If there is $50 in the pot and it costs $10 to call, you are getting 5-to-1 pot odds.",
            "**The Core Rule:** Call if your chances of winning are better than the pot odds (e.g., 4-to-1 underdog calling 5-to-1 odds).",
            "**Calling with No Cards to Come:** On the river, pot odds help decide if it's worth calling a potential bluff.",
            "**Exposed Cards Matter:** In Stud, you must factor in folded cards which change the true odds of hitting your draw.",
            "**Drawing Dead:** Severely discount odds if the hand you are drawing to might still be second-best."
          ],
          detailedExplanation: "Count your 'outs' (unseen cards that make your hand). If you have 9 outs out of 47 cards, the odds against hitting are roughly 4.2-to-1. If the pot offers 5-to-1, you call.\n\n**Position** is crucial. In early position, you must consider that a player behind you might raise, destroying the pot odds you thought you had. Furthermore, beware of **tainted outs**. If hitting your straight completes a flush for an opponent, your outs are useless. Discount your chances heavily in such scenarios.",
          caseStudies: [
            {
              title: "Case Study 1: The Simple Flush Draw",
              situation: "Limit Hold'em. Pot is $70. It costs you $10 to call. You have a four-flush (9 outs, 4.1-to-1 against).",
              decision: "Call.",
              explanation: "Getting 7-to-1 odds on a 4.1-to-1 shot is highly profitable."
            },
            {
              title: "Case Study 2: The Tainted Draw",
              situation: "No-Limit Hold'em. Board is J♠ J♥ 8♣ 2♦. Pot is $100. Opponent bets $50. You have an open-ended straight draw (4.7-to-1 against).",
              decision: "Fold.",
              explanation: "Getting 3-to-1 on a 4.7-to-1 shot is bad. Worse, the board is paired; you might be drawing dead to a full house."
            }
          ],
          commonMistakes: [
            "**Ignoring Exposed Cards:** Calculating odds in Stud without looking at what's already been folded.",
            "**Forgetting Players Behind:** Calling in early position only to get raised, destroying your price.",
            "**Chasing Tainted Outs:** Drawing to a non-nut hand on a scary board."
          ],
          proTips: [
            "**Memorize Common Odds:** Flush draws are ~4-to-1, open-ended straights are ~5-to-1, inside straights are ~11-to-1.",
            "**Count Hidden Outs:** If pairing an overcard might also win, add those to your total out count."
          ],
          connections: [
            "**Expectation (Chapter 2):** Pot odds determine if a play has positive or negative expectation.",
            "**Effective Odds (Chapter 6):** Pot odds look at the current bet; effective odds factor in future bets."
          ]
        },
        {
          id: "chapter-6",
          title: "Chapter 6: Effective Odds",
          overview: "While 'pot odds' are useful when there is only one card to come, they can be dangerously misleading when there are multiple betting rounds left. Effective odds represent the true odds you are getting when you plan to draw to a hand over multiple streets, factoring in the cost of all future bets you will have to call.",
          keyIdeas: [
            "**The Illusion of Pot Odds:** Immediate odds might look good, but future required bets can make the whole play -EV.",
            "**Calculating Effective Odds:** `(Current Pot + Expected Future Wins) / (Current Call + Expected Future Calls)`.",
            "**When Not to Use Them:** Effective odds don't apply in all-in situations or when you expect a 'free card'.",
            "**Future Bets Devalue Draws:** Generally, future betting rounds reduce the appeal of drawing hands."
          ],
          detailedExplanation: "If you flop a flush draw ($20 pot, $10 to call), immediate odds are 3-to-1. But if the turn bet doubles to $20, you risk $30 total. If you hit, you might win $50. Your effective odds are 1.6-to-1. Since hitting a flush is ~1.86-to-1, the future bet has turned a profitable-looking flop call into a losing play.\n\nCalling on the flop with the intention of calling down becomes incorrect unless you can rely on massive **implied odds** (winning a huge pot if you hit) or a **free card**.",
          caseStudies: [
            {
              title: "Case Study 1: The All-In Exception",
              situation: "No-Limit Tournament. Opponent pushes all-in on the flop. You have a flush draw and are getting 6-to-1.",
              decision: "Call.",
              explanation: "No future bets to worry about. Immediate and effective odds are the same. A 6-to-1 price on a 2-to-1 shot is an easy call."
            },
            {
              title: "Case Study 2: Anticipating the Free Card",
              situation: "Passive opponent bets the flop but always checks the turn if they don't have top pair. You have a gutshot draw.",
              decision: "Call.",
              explanation: "If you get a free card on the turn, you see two cards for the price of one. Effective odds don't hurt you if future cost is zero."
            }
          ],
          commonMistakes: [
            "**Applying Pot Odds to Multi-Street Draws:** Ignoring turn bets when calculating flop prices.",
            "**Assuming You Will Always Call Down:** Planning to call the flop without a strategy for the turn."
          ],
          proTips: [
            "**The Rule of 4 and 2:** Multiply outs by 4 on the flop for your river percentage, but only if you're sure you'll see both cards.",
            "**Reverse the Math:** As a bettor, bet enough to ruin the effective odds for your drawing opponents."
          ],
          connections: [
            "**Pot Odds (Chapter 5):** Effective odds are a necessary modification when multiple rounds remain.",
            "**Implied Odds (Chapter 7):** While effective odds reduce value due to costs, implied odds increase it due to winnings."
          ]
        },
        {
          id: "chapter-7",
          title: "Chapter 7: Implied Odds and Reverse Implied Odds",
          overview: "While effective odds focus on how future bets cost you money, implied odds focus on how future bets increase the value of your draw. Conversely, reverse implied odds warn you of situations where a call might trap you into losing even more money when you likely have the second-best hand.",
          keyIdeas: [
            "**Implied Odds:** Playing a hand for a massive future payoff even if immediate odds are bad.",
            "**Calculating Implied Odds:** `(Total Expected Win) / (Present Cost of Calling)`.",
            "**Reverse Implied Odds:** Risks where you lose the maximum if behind but win the minimum if ahead (e.g., middle pair).",
            "**Hidden Strength:** Implied odds are higher when your hand is disguised."
          ],
          detailedExplanation: "Implied odds are powerful in No-Limit. Calling a raise with a small pocket pair to 'set mine' is the classic example. You are an 8-to-1 underdog to hit a set, but if you do, you might win 40 times your bet. That 40-to-1 potential payoff makes the 8-to-1 risk worth it.\n\n**Reverse Implied Odds** describe being 'strung along'. If you have Top Pair, Weak Kicker, and call a bet, an opponent with a better kicker will keep betting while an opponent who is bluffing will give up. You risk multiple bets to win very little.",
          caseStudies: [
            {
              title: "Case Study 1: The Classic Set Mine",
              situation: "No-Limit Hold'em. Deep stacks. You have 3♠ 3♥. Opponent raises to $30. You are 8-to-1 to hit a set.",
              decision: "Call.",
              explanation: "If you hit, you stand to win their $1000 stack. Implied odds of 40-to-1 justify the 8-to-1 risk."
            },
            {
              title: "Case Study 2: The Obvious Draw",
              situation: "Limit Hold'em. You hit a flush when an obvious heart falls on the turn.",
              decision: "Implied odds are lower.",
              explanation: "Since the scare card is obvious, opponents will fold unless they have a monster. You won't get 'paid off' as often."
            }
          ],
          commonMistakes: [
            "**Overestimating Implied Odds:** Calling with small pairs when stacks are too shallow to pay off the hit.",
            "**Ignoring Reverse Implied Odds:** Stubbornly calling down with marginal hands like middle pair.",
            "**Assuming You Will Get Paid:** Thinking good opponents will pay off an obvious completed straight."
          ],
          proTips: [
            "**Rule of 5 to 10:** In No-Limit, only set mine if stacks are at least 10-20x the bet.",
            "**Fold to Reverse Implied Odds:** If a hand feels like a trap where you can only lose big, fold early."
          ],
          connections: [
            "**Effective Odds (Chapter 6):** These two concepts balance each other out in future-street calculations.",
            "**The Ante Structure (Chapter 4):** Small ante games often encourage playing for implied odds."
          ]
        }
      ]
    },
    {
      title: "Part 2: Deception and Advanced Plays",
      chapters: [
        {
          id: "chapter-8",
          title: "Chapter 8: The Value of Deception",
          overview: "If you always play your hand straightforwardly, your strategy becomes transparent. Deception, whether by bluffing, semi-bluffing, or slowplaying, is the deliberate act of disguising your strength to force opponents into making Fundamental Theorem mistakes. You must weigh the cost of being outdrawn or caught against the benefit of a massive future payoff.",
          keyIdeas: [
            "**Cost of Predictability:** Straightforward play allows observant opponents to play perfectly against you.",
            "**Opponent Skill:** Deception is for 'super readers', not 'calling stations' who don't notice what you do.",
            "**Pot Size:** As the pot grows, deception becomes less important. Secured value is better than tricky plays.",
            "**Bet Size:** Deception is most valuable when current bets are small relative to future bets."
          ],
          detailedExplanation: "Slowplaying Aces hiding strength encourages opponents with weaker pairs to commit money. However, deception has a cost: if you let an opponent draw for free and they hit, your trickiness cost you the pot.\n\nEmploy deception primarily against players capable of folding, in pots small enough that players aren't 'committed', and in situations where you isolate one or two opponents. Against beginners who never fold, simply play your cards for their face value.",
          caseStudies: [
            {
              title: "Case Study 1: Wasted Deception",
              situation: "Low-stakes game with loose players. You limp with K♠ K♥ hoping to trap.",
              decision: "Mistake.",
              explanation: "Weak players love to call. You should raise for value pre-flop to build a pot and thin the field."
            },
            {
              title: "Case Study 2: Deception Against a Reader",
              situation: "Tough regular calls your pre-flop raise. Flop is A♠ K♦ 2♥. You have nothing.",
              decision: "Bet out (Bluff).",
              explanation: "Because you raised pre-flop, they respect your range. Deception (bluffing) works here because they are capable of folding."
            }
          ],
          commonMistakes: [
            "**Fancy Play Syndrome:** Trying elaborate bluffs against low-skill opponents.",
            "**Slowplaying Vulnerable Hands:** Trapping with Two Pair on a board full of draws.",
            "**Bluffing into a Crowd:** One of three or four opponents is bound to have a piece of the board."
          ],
          proTips: [
            "**Level of Thinking:** Only bluff players who are asking 'What does he have?'.",
            "**Deception as Advertising:** Getting caught bluffing can help you get paid off later when you have the nuts."
          ],
          connections: [
            "**The Fundamental Theorem (Chapter 3):** Deception is the tool used to blind opponents so they cannot play perfectly.",
            "**Semi-Bluffing (Chapter 11):** The most common and profitable form of deception."
          ]
        },
        {
          id: "chapter-9",
          title: "Chapter 9: Win the Big Pots Right Away",
          overview: "While deception extracts extra bets, there is a critical exception: when the pot is large, your primary goal is to win it immediately. You should abandon trickery and play aggressively to drive opponents out. The sheer size of the pot makes securing it the highest priority, outweighing any potential gain from trapping.",
          keyIdeas: [
            "**Shift in Priority:** In small pots, play for value/traps. In large pots, play for the dead money in the center.",
            "**Denying Infinite Odds:** Checking a strong hand in a big pot gives opponents a 'free card', which is catastrophic.",
            "**Betting into Correct Odds:** Even if an opponent has the odds to call your bet, you must bet to make them pay for the draw.",
            "**Driving Out Second-Best:** Aggressive play can thin the field, increasing your chances of winning a massive pot."
          ],
          detailedExplanation: "In a large pot, giving a free card is a disaster. If the pot is $300 and you check your overpair, letting a random hand hit a miracle card to beat you is an inexcusable error. You do not risk $300 to try and win an extra $20.\n\nIn Limit games, you must use raises to face opponents with a 'double bet' that might finally ruin their odds. In No-Limit, a pot-sized bet usually does the trick. The goal is to lock down the money already in the pot, not to get tricky.",
          caseStudies: [
            {
              title: "Case Study 1: The Danger of the Free Card",
              situation: "Limit Hold'em. Pot is $300. You have Q♠ Q♥. Flop is J-8-4. Everyone checks to you.",
              decision: "Bet emphatically.",
              explanation: "Do not risk a $300 pot to induce a bluff. Protect your overpair from overcards like Aces."
            },
            {
              title: "Case Study 2: Raising to Isolate",
              situation: "Seven-Card Stud. Huge pot. Opponent bets Kings. You have three 8s.",
              decision: "Raise.",
              explanation: "Thin the field. Driving out drawing hands behind you increases the chance your trips hold up to win the huge pot."
            }
          ],
          commonMistakes: [
            "**Greedy Slowplaying:** Checking a straight in an inflated pot to 'let them catch up'.",
            "**Fear of Raising the Leader:** Just calling a better hand and letting draws tag along cheaply behind you.",
            "**Misjudging Pot Size:** Failing to switch from 'value mode' to 'protection mode' when the pot gets big."
          ],
          proTips: [
            "**The Lock It Down Heuristic:** If losing the hand would be devastating due to pot size, do not use deception.",
            "**Use Position to Raise:** A raise from late position in a big pot is the best way to trap the field."
          ],
          connections: [
            "**The Value of Deception (Chapter 8):** Deception is for small/medium pots; aggression is for large pots.",
            "**Pot Odds (Chapter 5):** Large pots offer great odds; you must bet/raise to combat them."
          ]
        },
        {
          id: "chapter-10",
          title: "Chapter 10: The Free Card",
          overview: "A 'free card' is a card received without calling a bet. The rule is simple: when you have the best hand, you never want to give a free card (infinite odds for opponents). When you are on a draw, securing a free card is incredibly valuable. Position is the ultimate tool for controlling the flow of free cards.",
          keyIdeas: [
            "**Giving a Free Card:** Checking the best hand, offering opponents infinite pot odds to outdraw you.",
            "**Catastrophe of the Free Card:** One of the biggest mistakes in large pots is letting opponents see cards for free.",
            "**Getting a Free Card:** Checking behind on a draw to see the next street for zero dollars.",
            "**Position is Power:** Last to act decides whether to take a free card or deny one."
          ],
          detailedExplanation: "Betting with the best hand forces opponents to either fold or pay to draw. Checking surrenders this edge, letting an opponent with a weak draw see the turn for free. If they hit, your check cost you the pot.\n\nThe fear of giving a free card should drive you to bet even marginal hands if you suspect a draw is present. It's better to bet and occasionally be beat than to let a random hand pair up for free.",
          caseStudies: [
            {
              title: "Case Study 1: The Catastrophic Free Card",
              situation: "Limit Hold'em. Pot is $150. You have Kings. Flop is J-8-4.",
              decision: "Bet. Do not check.",
              explanation: "If you check and an Ace falls on the turn, anyone with A-3 suddenly beats you. You risked $150 to squeeze a tiny bet."
            },
            {
              title: "Case Study 2: Securing the Free Card",
              situation: "Nut flush draw on the Button. Opponents check to you.",
              decision: "Check behind.",
              explanation: "You guarantee seeing the turn for free. This 'infinite-odds' draw is highly profitable."
            }
          ],
          commonMistakes: [
            "**Checking Top Pair to be Tricky:** Inviting disaster by letting draws see cards for free.",
            "**Fearing the Check-Raise:** Checking behind because you're scared of a trap, when you should be denying a free card.",
            "**Checking in First Position:** You can't control the players behind you; bet to protect vulnerable hands."
          ],
          proTips: [
            "**The Scare Card Rule:** If many cards on the next street would make you fold, bet *now* so they don't see them for free.",
            "**Small Pot Exception:** If the pot is tiny and board is dry, giving a free card is less risky and can induce bluffs."
          ],
          connections: [
            "**Win the Big Pots Right Away (Chapter 9):** Giving a free card is the cardinal sin in a large pot.",
            "**Position (Chapter 17):** Late position provides the ability to take free cards."
          ]
        }
      ]
    },
    {
      title: "Part 3: Advanced Strategic Play",
      chapters: [
        {
          id: "chapter-11",
          title: "Chapter 11: The Semi-Bluff",
          overview: "The semi-bluff is a bet or raise with a hand that is likely not the best at the moment, but has a mathematically reasonable chance of outdrawing the current best hand. By combining the probability of winning immediately (fold equity) with the probability of winning at showdown (pot equity), it transforms marginally losing situations into highly profitable ones.",
          keyIdeas: [
            "**Enforcing Fundamental Theorem Mistakes:** Forcing opponents to fold the best hand.",
            "**Accidental Protection:** Protecting your hidden equity by betting a draw that might currently be the best hand.",
            "**Advanced Disguise & Deception:** Disguising your hand so you get paid off if the draw hits.",
            "**Buying the Free Card:** Using early aggression to force checks on later, more expensive streets.",
            "**Advertising:** Letting opponents see a busted draw so they call your value bets later."
          ],
          detailedExplanation: "The semi-bluff represents a synthesis of two conflicting concepts: betting for value and pure bluffing. Unlike a pure bluff, which has no chance of winning at showdown, a semi-bluff has a mathematically reasonable chance of outdrawing the current best hand. This 'safety net' makes it mandatory in professional play. However, you should avoid semi-bluffing in massive pots where fold equity is zero, against 'calling stations' who never fold, or when you are at high risk of being check-raised.",
          caseStudies: [
            {
              title: "Case Study 1: The 'Double-Barrel' Disguise",
              situation: "You raise pre-flop with A♣ Q♣. Flop is J♣ 8♦ 3♣. A solid opponent calls. Turn is 2♠.",
              decision: "Bet the turn (Second-Barrel Semi-Bluff).",
              explanation: "Applies pressure to middle pairs and weak Jacks. If the flush hits on the river, it looks like a scare card rather than your draw, leading to a bigger payoff."
            },
            {
              title: "Case Study 2: The Semi-Bluff Raise for the Free Card",
              situation: "Limit Stud. 4th street, opponent with Ace-high bets. You have a four-flush.",
              decision: "Raise.",
              explanation: "By raising on the 'cheap' street, you represent a monster. The opponent will likely check to you on 5th street (the 'expensive' street), allowing you to take a free card."
            }
          ],
          commonMistakes: [
            "Semi-bluffing when the pot is massive and fold equity is near zero.",
            "Trying to semi-bluff 'calling stations' who never fold.",
            "Semi-bluffing in late position against tricky players likely to check-raise."
          ],
          proTips: [
            "**Combine Equities:** A draw plus overcards has much higher hidden equity than a lone draw.",
            "**The Aggressor's Premium:** By betting, you force the opponent to have a hand to continue; if you check, they can win with nothing."
          ],
          connections: [
            "**The Fundamental Theorem (Chapter 3):** Semi-bluffing is a primary tool for forcing theorem mistakes.",
            "**The Value of Deception (Chapter 8):** Semi-bluffing is the most common form of deception."
          ]
        },
        {
          id: "chapter-12",
          title: "Chapter 12: Defense Against the Semi-Bluff",
          overview: "Defending against the semi-bluff is difficult because you face a 'double threat': folding the best hand or calling and being outdrawn. The optimal defense often involves raising or folding rather than just calling.",
          keyIdeas: [
            "**The 'Two Ways to Lose' Trap:** Calling is often mathematically incorrect due to the opponent's hidden equity.",
            "**The Semi-Bluff Raise:** Reversing the pressure to ruin the opponent's pot odds.",
            "**Information Gathering:** Using a raise to force the opponent to reveal their true strength.",
            "**Punishing Aggression:** Training opponents that they cannot casually bet draws against you."
          ],
          detailedExplanation: "The most common mistake when facing a suspected semi-bluff is to simply call. If your opponent has a legitimate hand, you are crushed; if they are semi-bluffing, they still have significant equity (30-45%) to outdraw you. Averaging these scenarios usually makes calling a losing play unless the pot is enormous. Professional defense prioritizes raising to ruin their odds or folding to avoid the trap. You can also 'smooth call' to lead out on a blank turn to deny them a free card.",
          caseStudies: [
            {
              title: "Case Study 1: The Semi-Bluff Raise",
              situation: "You have middle pair. Opponent bets on a 'wet' board. You suspect a semi-bluff.",
              decision: "Raise.",
              explanation: "Ruins their pot odds and forces them to fold their equity. If they reraise, you can comfortably fold knowing you are beat."
            },
            {
              title: "Case Study 2: The Delayed Semi-Bluff Raise",
              situation: "Opponent bets the flop. You have a decent hand but just call. Turn is a blank. Opponent bets again.",
              decision: "Raise now.",
              explanation: "Represents a much scarier hand like a slowplayed set. This delayed aggression is extremely difficult for a semi-bluffer to withstand."
            }
          ],
          commonMistakes: [
            "**The 'Spite Call':** Calling down out of stubbornness when the board runout is terrible for your hand.",
            "**Raising the 'Scare Card':** Raising when the turn completes the obvious draw; at that point, they are value betting, not semi-bluffing."
          ],
          proTips: [
            "**Analyze the Texture:** Semi-bluffs are much more likely on 'wet' coordinated boards than 'dry' ones.",
            "**Every Street is New:** Don't call the turn just because you called the flop; re-evaluate the math on every card."
          ],
          connections: [
            "**The Semi-Bluff (Chapter 11):** Understanding the offense is key to the defense.",
            "**Pot Odds (Chapter 5):** The mathematical tool used to judge if a call is justified in large pots."
          ]
        },
        {
          id: "chapter-13",
          title: "Chapter 13: Raising",
          overview: "Raising is the engine of professional poker. It seizes the initiative, alters pot odds, and forces opponents into high-pressure decisions that lead to Fundamental Theorem mistakes.",
          keyIdeas: [
            "**To Get More Money in the Pot:** Building the pot with a winning hand.",
            "**To Drive Out Opponents:** Protecting a vulnerable hand from drawing equity.",
            "**To Bluff or Semi-Bluff:** Winning immediately via fold equity.",
            "**To Get a Free Card:** Raising 'cheaply' now to check later.",
            "**To Gain Information:** Using a 'trial balloon' to gauge opponent strength."
          ],
          detailedExplanation: "A professional never raises 'just because'; every raise serves a specific mathematical objective. One of the most critical is 'wrecking the odds' for drawing hands. By raising, you slash the pot odds offered to opponents, forcing them to either fold or make a negative-expectation call. However, you must avoid raising when a flat call would yield a higher 'overcall' expectation, or when a raise would only result in you being beat by a reraise.",
          caseStudies: [
            {
              title: "Case Study 1: The Trial Balloon",
              situation: "Limit Hold'em. You have 9-9 on Q-7-4. You bet flop, tight player calls. Turn is 2. They suddenly bet into you.",
              decision: "Raise.",
              explanation: "If they reraise, you fold (saving guesswork). If they just call, they likely have a draw and you can check the river behind them."
            },
            {
              title: "Case Study 2: Raising a Suspected Draw",
              situation: "NLHE. You have A-J on J-8-5 (two hearts). Pot is $80. Aggressive player bets $40. There are two players behind you.",
              decision: "Raise to $140.",
              explanation: "Protects your top pair from the 'wet' board and charges the bettor a premium to see their draw."
            }
          ],
          commonMistakes: [
            "**Raising for Information with No Fold Equity:** Terrible against calling stations who won't fold better hands.",
            "**The Minimum Raise:** Fails to protect hands in No-Limit as it offers drawing hands excellent implied odds.",
            "**Raising the River without the Nuts:** Usually results in getting called by better or folding worse."
          ],
          proTips: [
            "**Raise or Fold:** Many pros avoid calling post-flop; if a hand isn't worth a raise or semi-bluff, it's often worth a fold.",
            "**Respect the Reraise:** At lower stakes, a reraise on the turn or river is almost never extreme strength."
          ],
          connections: [
            "**The Fundamental Theorem (Chapter 3):** Raising is the primary tool to force opponents to act incorrectly.",
            "**Pot Odds (Chapter 5):** Raising is the tool used to manipulate the odds given to others."
          ]
        },
        {
          id: "chapter-14",
          title: "Chapter 14: Check-Raising",
          overview: "Check-raising is a powerful deceptive maneuver used to extract maximum value from strong hands or thin the field to protect vulnerable ones. It is a foundational tool for forcing opponents into misreading your hand strength.",
          keyIdeas: [
            "**Extracting Value:** Inducing a bluff or a bet from a marginal hand to build the pot.",
            "**Protection and Field Reduction:** Using the 'sandwich effect' to force drawing hands to call two bets at once.",
            "**The Ethics of Deception:** Recognizing that check-raising is a mandatory tool in a game of incomplete information.",
            "**Second-Best Hand Isolation:** Raising to eliminate draws even when you believe you are currently behind the leader."
          ],
          detailedExplanation: "A check-raise is a high-risk, high-reward play. For it to be +EV, you typically need a strong hand and a high confidence (70%+) that someone will bet. If everyone checks behind, you commit a 'double-edged mistake': you lose a round of value and give everyone infinite odds to outdraw you. It is most effective when the bettor is to your immediate right, as your raise forces the rest of the table to call two bets cold.",
          caseStudies: [
            {
              title: "Case Study 1: Value Extraction",
              situation: "NLHE. You have a set of 4s on J-8-4. Loose-aggressive player on Button.",
              decision: "Check-Raise.",
              explanation: "Induces a bluff or continuation bet. Once they invest, they are more likely to call a raise due to 'sunk cost' and improved odds."
            },
            {
              title: "Case Study 2: Field Protection",
              situation: "Limit Stud. You have split Kings. A player to your right (last to act) is showing an Ace and betting every street.",
              decision: "Check-Raise.",
              explanation: "Forces the middle players to call two bets cold, folding their draws and isolating you against the Ace-high hand you currently beat."
            }
          ],
          commonMistakes: [
            "**Attempting it Against Passive Players:** If they check behind, you lose value and give free cards.",
            "**Check-Raising the 'Nuts':** If you have an invincible hand, you should slowplay rather than drive people out.",
            "**Ignoring Position:** It is much weaker when the bettor is to your left."
          ],
          proTips: [
            "**The 'Monster' Rule:** If you don't care if they draw (e.g., Full House), don't check-raise; keep them in.",
            "**Heuristic:** Against opponents who check behind too often, stop being tricky and just lead out."
          ],
          connections: [
            "**The Fundamental Theorem (Chapter 3):** The check-raise is the ultimate trap for forcing misreads.",
            "**Slowplaying (Chapter 15):** Slowplaying keeps the field in; check-raising thins it out."
          ]
        },
        {
          id: "chapter-15",
          title: "Chapter 15: Slowplaying",
          overview: "Slowplaying is the practice of playing a very strong hand weakly to keep as many players in the pot as possible. Unlike check-raising, which thins the field, slowplaying aims to maximize value by enticing opponents to bet later when stakes are higher.",
          keyIdeas: [
            "**Invincible Hands:** Only slowplay when your hand is a 'lock' or near-nut holding.",
            "**Safe Free Cards:** The next card should not reasonably be able to give an opponent a better hand.",
            "**Second-Best Potential:** The next card should have a high chance of giving an opponent a strong second-best hand.",
            "**Pot Size Limitation:** Never slowplay if the pot is already large; the risk of a free card outweighs future profit.",
            "**Field Size:** Slowplaying is primarily a heads-up or 3-way weapon."
          ],
          detailedExplanation: "Slowplaying is a calculated risk. You sacrifice the immediate value of a bet to try and gain much larger bets on later streets. The cardinal sin is giving a free card to a hand that hits a miracle and beats you. In No-Limit, it is more dangerous but more rewarding as it can lead to stacking an opponent. You should only slowplay if you expect your immediate bet would drive everyone out and you are certain the free card won't beat you.",
          caseStudies: [
            {
              title: "Case Study 1: Flopped Nut Flush",
              situation: "NLHE. BTN with A-K of hearts. Flop J-8-2 all hearts. Small pot.",
              decision: "Check (Slowplay).",
              explanation: "Hand is invincible. Checking lets opponents catch a piece of the turn to pay you off later."
            },
            {
              title: "Case Study 2: The 'Danger' Board",
              situation: "Limit Stud. Flopped trip 7s. Opponent shows Q-J. Large pot, coordinated board.",
              decision: "Bet immediately.",
              explanation: "Coordinated board makes free cards too risky, and the pot is already big enough that you just want to win it now."
            }
          ],
          commonMistakes: [
            "**Slowplaying Against a Crowd:** The more players, the higher the chance of a miracle outdraw.",
            "**The 'Check-Back' Disaster:** Checking the river with the nuts and having the opponent check behind.",
            "**Ignoring Scare Cards:** Continuing to slowplay even after the board becomes dangerous."
          ],
          proTips: [
            "**The 'Drawing Dead' Rule:** If the opponent has zero outs, you should almost always slowplay.",
            "**Vary Your Play:** Occasionally bet monsters and slowplay mediocre hands to remain balanced and unpredictable."
          ],
          connections: [
            "**The Free Card (Chapter 10):** Slowplaying is the intentional gift of a free card for strategic profit.",
            "**The Fundamental Theorem (Chapter 3):** Forcing opponents to stay in when they 'should' fold is a theorem mistake."
          ]
        }
      ]
    },
    {
      title: "Part 4: Psychological and Meta Game",
      chapters: [
        {
          id: "chapter-16",
          title: "Chapter 16: Loose and Tight Play",
          overview: "Expert play requires adjusting your baseline strategy to the 'texture' of the game. You must understand how to shift your requirements for bluffs, value bets, and draws depending on whether your opponents are playing too many hands (Loose) or too few (Tight).",
          keyIdeas: [
            "**The Ante Factor:** The size of forced bets dictates how loose you *must* be as a baseline.",
            "**Loose Game Adjustments:** Tighten bluffs, loosen value bets, and play more drawing hands for pot odds.",
            "**Tight Game Adjustments:** Loosen bluffs, tighten value bets, and avoid drawing hands.",
            "**Identify the Profit Source:** In loose games it's Value; in tight games it's Fold Equity."
          ],
          detailedExplanation: "In a loose game, 'Fold Equity' vanishes, so you must stop semi-bluffing and focus on value. Conversely, since opponents play 'trash,' your marginal hands (like middle pair) increase in value. In tight games, 'Fold Equity' is maximized, allowing you to steal pots with any two cards, but your marginal made hands lose value because tight players only bet when they have the goods. Always calculate the 'Ante Structure' first to set your baseline.",
          caseStudies: [
            {
              title: "Case Study 1: The Flush Draw in a Maniac Game",
              situation: "Loose $5-$10 game. You have 4-5 of spades. Flop K-9-2 (two spades). Massive multi-way pot.",
              decision: "Call (Don't Semi-Bluff).",
              explanation: "Loose players won't fold, so semi-bluffing is just value-betting as an underdog. Call for the massive pot odds and implied odds if you hit."
            },
            {
              title: "Case Study 2: The 'Rock' Raise",
              situation: "Limit Stud. Very tight game. A 'Rock' in early position raises. You have Pocket Jacks.",
              decision: "Fold.",
              explanation: "In a tight game, a raise from a rock often means AA, KK, or QQ. Your 'pretty' Jacks are likely crushed."
            }
          ],
          commonMistakes: [
            "**The 'Standard' Trap:** Playing the same strategy regardless of table dynamics.",
            "**Semi-Bluffing a Calling Station:** Refusing to accept you have zero fold equity.",
            "**Chasing Draws in Tight Pots:** Calling without the necessary pot odds or implied payoff."
          ],
          proTips: [
            "**Table Selection:** The easiest game is loose-passive (call too much, don't bet).",
            "**The 'Rock' Respect Rule:** When a player who hasn't played in two hours raises, believe them and fold."
          ],
          connections: [
            "**The Ante Structure (Chapter 4):** The starting point for all loose/tight adjustments.",
            "**The Semi-Bluff (Chapter 11):** The key concept affected by fold equity changes in loose vs tight games."
          ]
        },
        {
          id: "chapter-17",
          title: "Chapter 17: Position",
          overview: "Position is the asymmetry of information. Acting last allows you to see what every other player has done before you commit, providing massive mathematical and strategic advantages in controlling pot size and calculating odds.",
          keyIdeas: [
            "**Informational Advantage:** Knowing exactly how much strength has been shown before you act.",
            "**The Power of Closing Action:** Accurately calculating pot odds with no unknown raises behind you.",
            "**Control over Pot Size:** Deciding whether to check behind to keep the pot small or bet to grow it.",
            "**Relative Position:** Your seat relative to the 'maniacs' or 'rocks' at the table.",
            "**Positional Asymmetry:** Money in poker naturally flows from out-of-position players to in-position players."
          ],
          detailedExplanation: "The primary benefit of position is the ability to save bets. In early position, you fly blind; in last position, you see the field's cards (effectively) through their actions. Position allows you to take 'Free Cards,' execute 'Smooth Calls' to trap, and steal blinds more effectively. While being first has advantages for check-raising or value-trapping with the 'nuts,' the informational edge of being last is the most consistent source of profit in poker.",
          caseStudies: [
            {
              title: "Case Study 1: The Marginal Hand UTG",
              situation: "NLHE. You have 8-8 Under the Gun. You raise, get 3 callers. Flop K-7-2.",
              decision: "Check-Fold.",
              explanation: "Out of position against three players, this hand is unplayable. You cannot bet safely and cannot call if someone else bets."
            },
            {
              title: "Case Study 2: The 'Sandwich' Trap",
              situation: "NLHE. You are in the SB with Q-Q. UTG raises, Button reraises.",
              decision: "Fold or 4-Bet (Never Call).",
              explanation: "Calling 'sandwiches' you between two aggressive ranges out of position for the whole hand. Take control or get out."
            }
          ],
          commonMistakes: [
            "**Overvaluing 'Trap' Hands UTG:** Playing A-J or K-Q from early position where you'll likely be dominated and out of position.",
            "**Checking the River in Position:** Checking behind with a winner because you fear a check-raise, missing massive long-term value.",
            "**Ignoring the Button:** Failing to aggressively steal when you have the ultimate positional advantage."
          ],
          proTips: [
            "**Position Compensates for Skill:** You can negate a better player's edge by ensuring you have position on them.",
            "**Left is Strength:** Ideally, you want tight players on your left and aggressive players on your right."
          ],
          connections: [
            "**The Free Card (Chapter 10):** Position is the prerequisite for controlling free cards.",
            "**The Fundamental Theorem (Chapter 3):** Position provides the information needed to play 'as if you saw their cards'."
          ]
        },
        {
          id: "chapter-18",
          title: "Chapter 18: Bluffing",
          overview: "Bluffing is a mathematical necessity required by the Fundamental Theorem. By bluffing with the correct frequency, you force opponents into uncertainty, ensuring your legitimate value bets get paid off.",
          keyIdeas: [
            "**The Mathematical Equation:** A bluff's profitability is based on the ratio of the bet size to the pot size.",
            "**Optimal Bluffing Frequency:** Tying your bluffs to the pot odds you are offering your opponent.",
            "**Bluffing as Advertising:** Using failed bluffs to encourage future calls on your monster hands.",
            "**Pure vs. Semi-Bluffs:** Pure bluffs are for the river; early-round bluffs should almost always be semi-bluffs.",
            "**The Goal of Uncertainty:** Forcing opponents to make mistakes by being unable to read your strength."
          ],
          detailedExplanation: "A pure bluff on the river is a simple EV calculation: if your bet is $50 into $100, you need the opponent to fold more than 33% of the time to break even. Mathematically, you should bluff often enough to make your opponent 'indifferent' to calling. Most profit comes from value betting, but the *threat* of a bluff is what makes those value bets possible. You should avoid bluffing 'calling stations' or bluffing into large crowds where the chance of someone having a hand is too high.",
          caseStudies: [
            {
              title: "Case Study 1: The River 'Brick'",
              situation: "NLHE. You missed a flush draw on a J-9-3-2-2 board. Pot is $400. You have $250 left.",
              decision: "Bet $200 (Pure Bluff).",
              explanation: "You have zero showdown value, but your line represents a strong Jack. The bet only needs to work 33% of the time to be +EV."
            },
            {
              title: "Case Study 2: The 'Advertising' Bluff",
              situation: "You are in a session with observant pros. You haven't played a hand in an hour.",
              decision: "Bluff and potentially show.",
              explanation: "Breaks your 'rock' image. The cost is an investment to ensure your next big value bet gets called by players thinking you are 'at it' again."
            }
          ],
          commonMistakes: [
            "**Bluffing a Calling Station:** 'You can't bluff someone who won't fold.'",
            "**Inconsistent Storytelling:** Making a bluff that doesn't 'make sense' based on your previous betting line.",
            "**Bluffing into a Crowd:** Multiple opponents dramatically increase the odds someone has a piece of the board."
          ],
          proTips: [
            "**The Scare Card Heuristic:** Bluff when a card falls that completes a draw *you* could have but they likely don't.",
            "**Check-Raise Bluffing:** The most expensive but most effective bluff in the game."
          ],
          connections: [
            "**The Fundamental Theorem (Chapter 3):** Bluffing is the primary tool to stop opponents from playing perfectly.",
            "**Game Theory (Chapter 19):** Provides the mathematical foundation for unexploitable bluff frequencies."
          ]
        },
        {
          id: "chapter-19",
          title: "Chapter 19: The Theory of Game Theory",
          overview: "Game Theory provides a mathematical, unexploitable strategy for situations where you cannot 'read' your opponent. It focuses on making your opponent's decisions irrelevant by balancing your bluffs and value bets perfectly.",
          keyIdeas: [
            "**Unexploitability:** A strategy that cannot be beaten even if the opponent knows what it is.",
            "**Indifference Principle:** Making the opponent's EV for calling or folding exactly the same.",
            "**Optimal Bluffing Frequency:** The correct ratio of bluffs to value bets based on pot odds.",
            "**Minimum Defense Frequency (MDF):** The percentage of your range you must call to stop 'any-two-card' bluffs.",
            "**GTO vs. Exploitative Play:** GTO is for defense against tough players; Exploitative is for maximizing profit against bad ones."
          ],
          detailedExplanation: "Game Theory Optimal (GTO) play is your 'default' defensive posture. It ensures that even if you are playing a world-class 'reader,' they cannot gain an edge on you. On the river, you should bluff in proportion to the odds you give your opponent (e.g., bluffing 33% of the time when betting the pot). While GTO is safe, Sklansky notes that you should deviate into 'Exploitative' play against weak opponents to capitalize on their specific leaks, such as calling too much or folding too often.",
          caseStudies: [
            {
              title: "Case Study 1: The Pot-Sized River Bluff",
              situation: "BTN. Pot is $400. You missed your draw on an A-K-Q-7-2 board.",
              decision: "Bet $400.",
              explanation: "Gives opponent 2-to-1 odds. To be unexploitable, you should have 2 value hands for every 1 bluff in this spot."
            },
            {
              title: "Case Study 2: Defending with MDF",
              situation: "Aggressive regular bets $75 into a $100 pot on the river. You have a 'bluff catcher'.",
              decision: "Calculate MDF.",
              explanation: "MDF = 100/175 = 57%. If your hand is in the top 57% of your possible holdings, you must call to prevent being exploited by bluffs."
            }
          ],
          commonMistakes: [
            "**Applying GTO to 'Fish':** Don't be unexploitable against bad players; exploit them by bluffing zero percent if they never fold.",
            "**Ignoring Bet Sizing:** Your bluffing frequency *must* change if your bet size changes.",
            "**Over-Defending:** Calling too much against tight players who don't bluff enough to justify MDF."
          ],
          proTips: [
            "**The 'Watch' Trick:** Use the second hand of your watch to randomize your decisions (e.g., bluff if it's 0-15s).",
            "**GTO as a Safety Net:** Start with GTO and only deviate when you are sure the opponent is playing incorrectly."
          ],
          connections: [
            "**The Fundamental Theorem (Chapter 3):** GTO is what you do when you *can't* fulfill the theorem because information is missing.",
            "**Pot Odds (Chapter 5):** GTO is the reverse application of pot odds logic."
          ]
        },
        {
          id: "chapter-20",
          title: "Chapter 20: Inducing and Stopping Bluffs",
          overview: "Strategic poker involves controlling your opponent's actions. You can 'induce' bluffs from aggressive players when you have the winner, or 'stop' bluffs with mediocre hands using blocking bets to set a cheap price for showdown.",
          keyIdeas: [
            "**Inducing a Bluff:** Acting weak to entice aggressive players to bet into your strong hand.",
            "**Stopping a Bluff:** Using a 'blocking bet' to represent strength and prevent a massive bluff that would force you off.",
            "**The Check-Call Trap:** The primary tool for inducing bluffs against 'maniacs'.",
            "**The Blocking Bet:** A small-to-medium lead bet designed to 'set the price' for a showdown.",
            "**Image Dependency:** Your success depends on whether you are seen as a calling station or weak-tight."
          ],
          detailedExplanation: "Inducing bluffs is best against aggressive players who like to 'buy' pots; checking to them on a dry board invites them to bluff with 'air.' Stopping bluffs is for when you have a mediocre hand (like middle pair) on a scary board; by betting a small amount yourself, you 'claim' the scare card and discourage them from making a pot-sized bluff that you couldn't afford to call. Avoid inducing against passive 'nits' who won't bet without the nuts.",
          caseStudies: [
            {
              title: "Case Study 1: The Dry Board Trap",
              situation: "You have A-K on K-7-2-5-9. Dry board. Opponent is a LAG (Loose-Aggressive).",
              decision: "Check-Call.",
              explanation: "If you bet, they fold junk. If you check, their nature forces them to try and steal. You win a bet you wouldn't have gotten by betting."
            },
            {
              title: "Case Study 2: The Blocking Bet",
              situation: "You have 8-8 on K-J-8-9-Q. Board is very 'wet' for straights. You are first to act.",
              decision: "Bet 25% of the pot.",
              explanation: "Sets a cheap price for showdown. If you check, they might bet the full pot representing the straight, forcing you to fold your set."
            }
          ],
          commonMistakes: [
            "**Checking to a 'Check-Behind' Specialist:** Aggressive players who 'choke' on the river; you lose value by not betting.",
            "**Betting Too Small to Stop:** A tiny bet (e.g., 2% pot) invites a raise rather than stopping a bluff.",
            "**Inducing with the Nuts:** Sometimes it's better to just bet huge; don't be 'too tricky' and let them check behind."
          ],
          proTips: [
            "**The Scare Card Lead:** If a scare card falls, lead out to 'claim' it yourself before they can use it to bluff you.",
            "**The Price of Information:** A blocking bet is often worth it just to see the opponent's cards and learn their patterns."
          ],
          connections: [
            "**Chapter 14: Check-Raising:** Inducing is the 'passive' version of the check-raise trap.",
            "**The Fundamental Theorem (Chapter 3):** Stopping a bluff prevents you from being forced into a theorem mistake."
          ]
        }
      ]
    }
  ]
};
