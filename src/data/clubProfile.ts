export interface SquadPlayer {
  id: string;
  name: string;
  position: string;
  number: number;
  nationality: string;
  age: number;
  image: string;
  isVerified: boolean;
  score: number;
}

export interface TrialOpening {
  id: string;
  position: string;
  ageRange: string;
  type: 'trial' | 'transfer' | 'loan';
  deadline: string;
  description: string;
  requirements: string[];
  applicants: number;
}

export interface ClubTrophy {
  title: string;
  year: string;
  type: 'league' | 'cup' | 'supercup' | 'continental' | 'other';
  count?: number;
}

export interface SeasonStat {
  label: string;
  value: string | number;
  rank?: string;
}

export interface ClubActivityPost {
  id: string;
  text: string;
  time: string;
  reactions: number;
  image?: string;
  type: 'match' | 'signing' | 'news' | 'community';
}

export interface CoachingStaff {
  name: string;
  role: string;
  image: string;
  isVerified: boolean;
}

export interface ClubProfileData {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  league: string;
  country: string;
  city: string;
  founded: number;
  stadium: string;
  stadiumCapacity: number;
  primaryColor: string;
  secondaryColor: string;
  coverImage: string;
  logoColor: string;
  isVerified: boolean;
  followersCount: number;
  playerCount: number;
  staffCount: number;
  description: string;
  values: string[];
  website: string;
  trophies: ClubTrophy[];
  currentSeason: SeasonStat[];
  squad: SquadPlayer[];
  openTrials: TrialOpening[];
  activity: ClubActivityPost[];
  coachingStaff: CoachingStaff[];
}

export const CLUB_PROFILES: Record<string, ClubProfileData> = {
  alwasl: {
    id: 'alwasl',
    name: 'Al Wasl SC',
    shortName: 'Al Wasl',
    initials: 'AW',
    league: 'UAE Pro League',
    country: 'UAE',
    city: 'Dubai',
    founded: 1945,
    stadium: 'Zabeel Stadium',
    stadiumCapacity: 16800,
    primaryColor: '#F5A623',
    secondaryColor: '#1a1a1a',
    coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1400',
    logoColor: '#F5A623',
    isVerified: true,
    followersCount: 124300,
    playerCount: 28,
    staffCount: 42,
    description: "Al Wasl Sports Club is one of the most storied football clubs in the UAE, established in Dubai in 1945. Known as 'The Emperor's Club', Al Wasl has been a cornerstone of football development in the Gulf region for eight decades.\n\nUnder the current administration and coaching staff, the club has embraced a new era of data-driven recruitment, youth development, and high-performance culture. We believe in building from within — identifying talent early, nurturing it with world-class facilities, and competing at the highest levels of Asian football.\n\nOur partnership with AceAiX ensures full verification of player credentials, transparent performance data, and access to the best emerging talent across the MENA region.",
    values: ['Excellence', 'Integrity', 'Development', 'Community', 'Innovation'],
    website: 'alwasl.ae',
    trophies: [
      { title: 'UAE Pro League', year: '2024', type: 'league', count: 8 },
      { title: 'UAE President\'s Cup', year: '2023', type: 'cup', count: 6 },
      { title: 'UAE Super Cup', year: '2024', type: 'supercup', count: 3 },
      { title: 'Arab Club Championship', year: '2012', type: 'continental', count: 1 },
    ],
    currentSeason: [
      { label: 'League Position', value: '1st', rank: 'UAE Pro League' },
      { label: 'Matches Played', value: 26 },
      { label: 'Wins', value: 18 },
      { label: 'Draws', value: 5 },
      { label: 'Losses', value: 3 },
      { label: 'Goals Scored', value: 62 },
      { label: 'Goals Conceded', value: 24 },
      { label: 'Points', value: 59 },
      { label: 'Top Scorer', value: 'K. Al-Hassan (24)' },
      { label: 'Clean Sheets', value: 11 },
    ],
    squad: [
      { id: 'p1', name: 'Karim Al-Hassan', position: 'ST', number: 9, nationality: 'UAE', age: 21, image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true, score: 92 },
      { id: 'p2', name: 'Omar Al-Farsi', position: 'CAM', number: 10, nationality: 'UAE', age: 24, image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true, score: 87 },
      { id: 'p3', name: 'Sergio Mendes', position: 'LB', number: 3, nationality: 'Brazil', age: 28, image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: false, score: 84 },
      { id: 'p4', name: 'James Crawford', position: 'CB', number: 5, nationality: 'England', age: 30, image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true, score: 88 },
      { id: 'p5', name: 'Ali Hassan', position: 'GK', number: 1, nationality: 'UAE', age: 26, image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true, score: 85 },
      { id: 'p6', name: 'Fabrizio Moretti', position: 'CM', number: 8, nationality: 'Italy', age: 27, image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: false, score: 82 },
      { id: 'p7', name: 'Yousuf Al-Kindi', position: 'RW', number: 7, nationality: 'UAE', age: 22, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true, score: 79 },
      { id: 'p8', name: 'Rashid Salem', position: 'CDM', number: 6, nationality: 'UAE', age: 29, image: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: false, score: 81 },
    ],
    openTrials: [
      {
        id: 't1',
        position: 'Striker / Centre Forward',
        ageRange: '18–24',
        type: 'trial',
        deadline: '30 Jun 2025',
        description: 'Al Wasl SC is seeking a dynamic, high-energy centre forward to compete for a starting position in the UAE Pro League squad. We are looking for a player who fits our high-press system and has a strong goal-scoring record.',
        requirements: ['AceAiX Score ≥ 80', 'Verified medical clearance', 'UAE-eligible or non-quota slot', 'Minimum 20 appearances at professional level'],
        applicants: 47,
      },
      {
        id: 't2',
        position: 'Left Back (Loan)',
        ageRange: '20–28',
        type: 'loan',
        deadline: '15 Jul 2025',
        description: 'Seeking an attacking fullback on loan for the upcoming season. Must be comfortable in a possession-based system with high defensive line.',
        requirements: ['Professional contract at parent club', 'AceAiX Score ≥ 75', 'Passing accuracy > 82%'],
        applicants: 23,
      },
    ],
    activity: [
      {
        id: 'a1',
        type: 'match',
        text: "CHAMPIONS! 🏆 Al Wasl SC are UAE Pro League Champions for the 8th time. Three consecutive top-two finishes, now back on top. This is for every fan, every player, every member of staff who believed. #AlWasl #Champions",
        time: '2 weeks ago',
        reactions: 18420,
        image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        id: 'a2',
        type: 'signing',
        text: "We are delighted to announce the signing of midfielder Fabrizio Moretti on a two-year contract. Fabrizio brings Serie B experience and international pedigree to our midfield. Welcome to the family! 🧡",
        time: '1 month ago',
        reactions: 5240,
      },
      {
        id: 'a3',
        type: 'community',
        text: "Our academy opened its doors to 120 young players aged 8–14 for our annual 'Play with Champions' day. Seeing the next generation fall in love with football is what this club is all about.",
        time: '6 weeks ago',
        reactions: 8310,
        image: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ],
    coachingStaff: [
      { name: 'Ricardo Mendes', role: 'Head Coach', image: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
      { name: 'Omar Khalid', role: 'Assistant Coach', image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: false },
      { name: 'Dr. Yousuf Rahimi', role: 'Medical Director', image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
      { name: 'Ana Silveira', role: 'Sports Scientist', image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
    ],
  },
};

export const SIMILAR_CLUBS = [
  { id: 'aljazira', name: 'Al Jazira FC', league: 'UAE Pro League', city: 'Abu Dhabi', followers: '98K', color: '#8B5CF6', initials: 'AJ', isVerified: true },
  { id: 'alain', name: 'Al Ain FC', league: 'UAE Pro League', city: 'Al Ain', followers: '87K', color: '#2F80ED', initials: 'AA', isVerified: true },
  { id: 'sharjah', name: 'Sharjah FC', league: 'UAE Pro League', city: 'Sharjah', followers: '74K', color: '#EF5350', initials: 'SH', isVerified: false },
];
