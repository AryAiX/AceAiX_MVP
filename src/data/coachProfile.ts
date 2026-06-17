export interface CoachingSpell {
  club: string;
  clubInitials: string;
  clubColor: string;
  role: string;
  from: string;
  to: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  trophies: string[];
  description: string;
}

export interface CoachLicense {
  title: string;
  issuer: string;
  date: string;
  verified: boolean;
}

export interface CoachAttribute {
  label: string;
  value: number;
  endorsements: number;
  topEndorser: string;
  topEndorserVerified: boolean;
}

export interface CoachHonor {
  title: string;
  org: string;
  year: string;
  type: 'individual' | 'team' | 'recognition';
}

export interface CoachActivityPost {
  id: string;
  text: string;
  time: string;
  reactions: number;
  image?: string;
}

export interface CoachRecommendation {
  id: string;
  authorName: string;
  authorRole: string;
  authorVerified: boolean;
  relationship: string;
  body: string;
  date: string;
}

export interface CoachProfileData {
  id: string;
  name: string;
  role: string;
  specialty: string;
  currentClub: string;
  currentClubInitials: string;
  currentClubColor: string;
  country: string;
  nationality: string;
  age: number;
  yearsExperience: number;
  score: number;
  winRate: number;
  totalTrophies: number;
  totalMatches: number;
  isVerified: boolean;
  isOpenToOpportunities: boolean;
  image: string;
  coverImage: string;
  followersCount: number;
  connectionsCount: number;
  philosophy: string;
  coachingSpells: CoachingSpell[];
  licenses: CoachLicense[];
  attributes: CoachAttribute[];
  honors: CoachHonor[];
  languages: Array<{ name: string; level: string }>;
  activity: CoachActivityPost[];
  recommendations: CoachRecommendation[];
}

export const COACH_PROFILES: Record<string, CoachProfileData> = {
  c1: {
    id: 'c1',
    name: 'Ricardo Mendes',
    role: 'Head Coach',
    specialty: 'High-Press Tactical Football',
    currentClub: 'Al Wasl SC',
    currentClubInitials: 'AW',
    currentClubColor: '#F5A623',
    country: 'UAE',
    nationality: 'Portuguese',
    age: 47,
    yearsExperience: 18,
    score: 89,
    winRate: 61,
    totalTrophies: 7,
    totalMatches: 412,
    isVerified: true,
    isOpenToOpportunities: false,
    image: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1400',
    followersCount: 8420,
    connectionsCount: 312,
    philosophy: "Football is an emotional sport built on collective intelligence. My coaching philosophy centres on high-pressing, positional play that demands physical excellence and tactical adaptability from every player. I believe in creating autonomous decision-makers on the pitch — players who understand the 'why' behind every movement.\n\nOff the pitch, my focus is on culture first. A winning dressing room is built through trust, clear communication, and shared accountability. I use sports science and video analysis as daily tools, not afterthoughts.\n\nI am particularly passionate about developing young talent into complete professionals — technically, tactically, physically, and mentally.",
    coachingSpells: [
      {
        club: 'Al Wasl SC',
        clubInitials: 'AW',
        clubColor: '#F5A623',
        role: 'Head Coach',
        from: '2022',
        to: 'Present',
        matches: 89,
        wins: 57,
        draws: 18,
        losses: 14,
        trophies: ['UAE Pro League 2024', 'UAE Super Cup 2024'],
        description: 'Rebuilt the club\'s playing identity around a high-press system. Developed two U-21 internationals from the academy into regular starters. UAE Pro League title in second full season.',
      },
      {
        club: 'Sporting Braga B',
        clubInitials: 'SB',
        clubColor: '#8B0000',
        role: 'Head Coach',
        from: '2019',
        to: '2022',
        matches: 112,
        wins: 64,
        draws: 22,
        losses: 26,
        trophies: ['Liga 3 Champion 2021'],
        description: 'Promoted club from Liga 3 in first season. Developed 8 players who subsequently moved to Sporting Braga\'s first team or were sold internationally.',
      },
      {
        club: 'SC Farense',
        clubInitials: 'SF',
        clubColor: '#FF6B35',
        role: 'Head Coach',
        from: '2016',
        to: '2019',
        matches: 128,
        wins: 74,
        draws: 28,
        losses: 26,
        trophies: ['Liga Portugal 2 Promotion 2018'],
        description: 'Two promotions in three seasons. Built a compact defensive structure that became one of the best in the league, conceding only 31 goals in the promotion season.',
      },
      {
        club: 'FC Arouca (Assistant)',
        clubInitials: 'FA',
        clubColor: '#2F80ED',
        role: 'Assistant Coach',
        from: '2013',
        to: '2016',
        matches: 83,
        wins: 38,
        draws: 21,
        losses: 24,
        trophies: [],
        description: 'Responsible for opposition analysis and set-piece design. Team reached Primeira Liga and maintained top-half finishes.',
      },
    ],
    licenses: [
      { title: 'UEFA Pro License', issuer: 'UEFA / FPF', date: '2019', verified: true },
      { title: 'AFC Professional Coaching License', issuer: 'AFC', date: '2022', verified: true },
      { title: 'UAEFA Head Coach Registration', issuer: 'UAE Football Association', date: '2022', verified: true },
      { title: 'Sports Science Diploma', issuer: 'ISMAI Portugal', date: '2008', verified: false },
    ],
    attributes: [
      { label: 'Tactical Analysis', value: 92, endorsements: 34, topEndorser: 'Luís Ferreira (Technical Dir.)', topEndorserVerified: true },
      { label: 'Man Management', value: 88, endorsements: 41, topEndorser: 'Karim Al-Hassan (Player)', topEndorserVerified: true },
      { label: 'Set Pieces', value: 85, endorsements: 22, topEndorser: 'Omar Khalid (Asst. Coach)', topEndorserVerified: false },
      { label: 'Player Development', value: 90, endorsements: 38, topEndorser: 'Dr. Yousuf Rahimi', topEndorserVerified: true },
      { label: 'Fitness & Conditioning', value: 80, endorsements: 19, topEndorser: 'Fabrizio Moretti', topEndorserVerified: false },
      { label: 'Video Analysis', value: 87, endorsements: 26, topEndorser: 'James Crawford (Scout)', topEndorserVerified: true },
    ],
    honors: [
      { title: 'UAE Pro League Coach of the Year', org: 'UAEFA', year: '2024', type: 'individual' },
      { title: 'UAE Pro League Champion', org: 'Al Wasl SC', year: '2024', type: 'team' },
      { title: 'UAE Super Cup', org: 'Al Wasl SC', year: '2024', type: 'team' },
      { title: 'Liga Portugal 2 Promotion', org: 'SC Farense', year: '2018', type: 'team' },
      { title: 'Liga 3 Champion', org: 'Sporting Braga B', year: '2021', type: 'team' },
      { title: 'AFC Best Young Coach Nomination', org: 'AFC', year: '2023', type: 'recognition' },
    ],
    languages: [
      { name: 'Portuguese', level: 'Native' },
      { name: 'English', level: 'Fluent' },
      { name: 'Spanish', level: 'Professional' },
      { name: 'Arabic', level: 'Elementary' },
    ],
    activity: [
      {
        id: 'p1',
        text: "Another UAE Pro League title. To this squad — every sacrifice, every sprint, every extra session was worth it. This team never stopped believing. Championship football is built in the invisible moments. Proud of every single one of you.",
        time: '2 weeks ago',
        reactions: 4821,
        image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        id: 'p2',
        text: "Great session today working on our high press triggers and defensive shape off the ball. The detail work the boys put in during the week is what shows up on match day. Process over outcome — always.",
        time: '3 weeks ago',
        reactions: 1240,
      },
      {
        id: 'p3',
        text: "Honored to speak at the AFC Coaching Conference in Kuala Lumpur this week. Sharing our player development model and how we're integrating sports science into daily training. Football is evolving — coaches must evolve with it.",
        time: '1 month ago',
        reactions: 2103,
      },
    ],
    recommendations: [
      {
        id: 'r1',
        authorName: 'Karim Al-Hassan',
        authorRole: 'Striker · Al Wasl SC',
        authorVerified: true,
        relationship: 'Player',
        body: "Coach Mendes transformed my game. His attention to individual development within the team system is exceptional. He understood my strengths and built specific scenarios to help me improve my off-ball movement and finishing under pressure. He made me believe I could play at the top level.",
        date: 'Mar 2025',
      },
      {
        id: 'r2',
        authorName: 'Luís Ferreira',
        authorRole: 'Technical Director · Al Wasl SC',
        authorVerified: true,
        relationship: 'Club Director',
        body: "Ricardo is one of the most prepared coaches I have worked with in 20 years of football. His session plans, pre-match analysis quality, and ability to read a game in real time are exceptional. He has a rare gift for communicating complex tactical ideas simply. A future top-level manager.",
        date: 'Jan 2025',
      },
    ],
  },
};

export const SIMILAR_COACHES = [
  { id: 'sc1', name: 'Paulo Sousa Jr.', role: 'Head Coach', club: 'Al Jazira FC', score: 85, image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
  { id: 'sc2', name: 'Ahmed Al-Rashidi', role: 'Head Coach', club: 'Al Ain FC', score: 82, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: false },
  { id: 'sc3', name: 'Marco Fabiani', role: 'Asst. Coach', club: 'Sharjah FC', score: 79, image: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
];
