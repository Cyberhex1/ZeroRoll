import type { StoryDeck } from '../types';

// Real Life must stay grounded: no ghosts, no curses, no time travel. Everything strange
// has a real-world explanation. That is why "Rome Sweet Rome" from the old list is left out.
export const real_life = {
  signature: 'NO supernatural: everything strange has a real-world explanation. Grounded, contemporary and specific: rent, group chats, shift work, family, neighbors; the stakes are human-sized and the humor comes from truth.',
  engines: ['contest', 'courtship', 'mystery', 'heist', 'bargain', 'delivery', 'homecoming', 'inheritance', 'trial', 'rescue'],
  families: [
    { id: 'workplace', name: 'Workplace comedy-drama', hero: 'someone good at a job nobody notices: a night-shift pharmacist, a wedding DJ, a school bus driver, a hotel concierge, a help-desk tech', start: 'a normal shift that gets one strange request', turn: 'the request snowballs into something that could cost the job or a friendship', payoff: 'a believable win, with a little dignity and a good story to tell', palette: 'break-room microwave, a walkie-talkie, a lanyard, a group chat buzzing, a laminated policy nobody follows', sources: ['superstore', 'office', 'office_space', 'it_crowd', 'clerks', 'waiting'] },
    { id: 'neighbors', name: 'Neighbors and community', hero: 'someone settled in a place with its own small politics: a renter in a duplex, a new homeowner, a building super, a retiree with a dog', start: 'a dispute, a lost dog, a block party, a new neighbor', turn: 'the small thing reveals a bigger one (a scam, a secret, a loss)', payoff: 'the neighborhood changes because the hero showed up', palette: 'HOA newsletters, porch lights, a shared driveway, a community board, a doorbell camera clip', sources: ['reddit_hoa', 'today_you', 'high_maintenance'] },
    { id: 'family', name: 'Family weekend', hero: 'someone coming home for an event: a wedding, a funeral, a holiday, a parent\'s retirement party', start: 'arriving, the old roles snapping back into place', turn: 'a secret drops at the worst moment', payoff: 'the family survives the truth, a little better than before', palette: 'a cooler of drinks, old bedrooms, a casserole, a cousin with a podcast, a group photo nobody wants to take', sources: ['uncut_gems', 'today_you', 'ulysses'] },
    { id: 'hustle', name: 'The big chance', hero: 'someone one step from a break: an app founder in a garage, a line cook auditioning for a famous kitchen, a temp at a strange company, a delivery driver with a side business', start: 'the day of the interview, the pitch, the tryout or the first shift', turn: 'the opportunity turns out to have a catch, a rival or a lie in it', payoff: 'getting the break on their own terms, or walking away from it with something better', palette: 'whiteboards, a cold pitch deck, a borrowed blazer, a kitchen ticket printer, a badge that opens only some doors', sources: ['silicon_valley', 'severance', 'uncut_gems', 'office_space'] }
  ],
  dna: [
    { id: 'office_space', title: 'Office Space', medium: 'Film', dna: 'A worker numb from cubicle life stops caring, and the company promotes him for it; consultants, a broken printer, a small scheme that gets too big.' },
    { id: 'silicon_valley', title: 'Silicon Valley', medium: 'TV Show', dna: 'A shy coder with one brilliant idea and a houseful of misfits fights investors, rivals and their own egos; each win creates a bigger problem.' },
    { id: 'office', title: 'The Office', medium: 'TV Show', dna: 'Mockumentary awkwardness, a boss who wants to be loved, pranks, and a slow-burn friendship that matters more than the job.' },
    { id: 'severance', title: 'Severance', medium: 'TV Show', dna: 'A strange company with rules nobody explains, cheerful rituals and a department that should not exist; coworkers piece together the truth one memo at a time (played here without any sci-fi).' },
    { id: 'clerks', title: 'Clerks', medium: 'Film', dna: 'One long day behind a counter on a day off that never happens; customers as a parade of strangeness; two friends arguing about everything except what matters.' },
    { id: 'waiting', title: 'Waiting...', medium: 'Film', dna: 'A chain restaurant\'s staff as a family with feuds and games; one employee deciding whether this is the life they want.' },
    { id: 'superstore', title: 'Superstore', medium: 'TV Show', dna: 'A big-box store as a whole society: a mismatched crew, corporate memos from above, small rebellions, and real tenderness hidden in the jokes.' },
    { id: 'it_crowd', title: 'The IT Crowd', medium: 'TV Show', dna: 'Two tech workers and a manager who knows nothing in a basement office; small lies snowball into public disasters; "Have you tried turning it off and on again?"' },
    { id: 'high_maintenance', title: 'High Maintenance', medium: 'TV Show', dna: 'A courier moves through a city of strangers, each delivery a short story about loneliness, kindness and odd lives seen from the doorway.' },
    { id: 'uncut_gems', title: 'Uncut Gems', medium: 'Film', dna: 'One anxious person juggling too many bets at once; every scene adds a phone call, a debt or a deadline until the pressure is unbearable.' },
    { id: 'reddit_hoa', title: 'HOA dispute threads', medium: 'Reddit', dna: 'A petty rule escalates into a feud with rules-lawyering, recordings and neighborhood alliances; the satisfaction comes from beating the system on its own terms.' },
    { id: 'today_you', title: '"Today You, Tomorrow Me"', medium: 'r/AskReddit', dna: 'A stranger\'s unexpected kindness in a bad moment, and the hero paying it forward until it comes back around.' },
    { id: 'ulysses', title: '"The Ulysses Bucket List"', medium: 'r/AskReddit', dna: 'A list of tasks left behind by someone who died, completed by a stranger; each item changes the person doing it.' },
    { id: 'kevin', title: '"Kevin"', medium: 'r/AskReddit', dna: 'A coworker or classmate whose confident mistakes are legendary; the hero has to stop the next one before it hurts someone.' }
  ],
  hooks: [
    'a regular at the hero\'s 2 AM pharmacy counter leaves a sealed envelope and asks them to hold it "until Thursday, no matter what"',
    'the hero accidentally gets added to the HOA board\'s private group chat',
    'a wedding DJ is handed a USB stick by the bride\'s father with a song to play "right after the toasts"',
    'the hero finds a sublet listing for their own apartment, with photos taken from inside it',
    'the new manager asks the hero to train their own replacement, who turns out to be the manager\'s nephew',
    'a stranger at the laundromat leaves behind a bag with a wedding dress and a plane ticket for tomorrow',
    'the hero\'s little brother calls from a police station two states away and says "don\'t tell Mom"',
    'the interviewer at the hero\'s dream job is the person they rear-ended in the parking lot ten minutes ago',
    'the hotel front desk gets a call from room 712 asking for "the usual", on the hero\'s first night shift',
    'a celebrity chef walks into the hero\'s diner during the lunch rush and orders the one dish the kitchen always burns',
    'the neighbors\' new fence goes up two feet onto the hero\'s lawn, and the surveyor is their cousin',
    'the elderly neighbor asks the hero to witness her will, and the hero\'s name is in it',
    'Mom announces at the rehearsal dinner that she is selling the family house, and the buyer is at the table',
    'the hero\'s brother brings his new girlfriend home for the holidays, and she is the hero\'s ex',
    'an investor will fund the hero\'s food truck if they beat his son in a cook-off on Saturday',
    'on the hero\'s first day at the new job, the desk is still covered in the last person\'s sticky notes, all of them warnings',
    'the new neighbor borrows a ladder at midnight, and the hero sees which window they climb into',
    'a package for next door lands on the hero\'s step, and it is a cake that says "SORRY"'
  ],
  places: [
    'a 24-hour pharmacy next to a closed-down mall',
    'a cul-de-sac where every house is the same model',
    'a lake cabin the family has shared for thirty years',
    'a hotel that hosts three weddings on the same Saturday',
    'a food court where every vendor knows each other\'s secrets',
    'a call center on the top floor of a parking garage',
    'a minor-league ballpark whose mascot knows everyone\'s business',
    'a family-owned bowling alley about to be sold',
    'a church basement where the community theater rehearses',
    'a startup office in a former bank, with the vault used as a nap room',
    'the grandparents\' house, with a garage full of forty years of labeled boxes',
    'an apartment building where everyone shares one washing machine and one group chat'
  ],
  complications: [
    'the person causing trouble is trying to help someone',
    'the hero is partly at fault',
    'the solution would embarrass someone the hero loves',
    'the rival is going through the same thing at home',
    'the rule everyone is fighting about was written by the hero\'s late grandmother',
    'the hero\'s plan works too well, and someone innocent takes the blame',
    'the person the hero is competing with needs the win more',
    'everyone already knows the secret and has been waiting for the hero to say it',
    'the person who could fix everything is too proud to be asked'
  ],
  setPieces: [
    'The family Thanksgiving erupts when a long-held secret is dropped during the main course.',
    'A server failure hits on the busiest day of the year, and the lead engineer is nowhere to be found.',
    'You share an elevator with the CEO after an accidental message to the whole company.',
    'A dispute over dishes between roommates escalates into a full cold war with treaties.',
    'The kitchen is in the weeds, tickets are printing non-stop, and the chef wants your garnish now.',
    'The HOA president cites your mailbox for being the wrong beige, at the monthly meeting, in front of everyone.',
    'Your car dies in a downpour and a family in a minivan stops to help you, and will not take money.',
    'The old friend\'s "great investment opportunity" pitch at the coffee shop has a slide about "downlines".',
    'The power goes out during your wedding toast, and you have to finish it in the dark, from memory.',
    'Your neighbor\'s garage sale is selling the things you lent them.',
    'The pitch meeting starts, and the investor is reading your old one-star review of their company.',
    'The health inspector arrives early on the one day the walk-in freezer breaks.',
    'The family road trip strands everyone at a motel with one available room.',
    'The block party talent show turns into a public settling of every feud on the street.',
    'You cover a coworker\'s closing shift and find out why they never let anyone else close.',
    'Your parents\' anniversary slideshow has one photo nobody can explain.'
  ]
} satisfies StoryDeck;
