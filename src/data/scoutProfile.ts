export interface ScoutingSpell {
  org: string;
  orgInitials: string;
  orgColor: string;
  role: string;
  from: string;
  to: string;
  region: string;
  athletesRecommended: number;
  athletesSigned: number;
  description: string;
  notableSignings: string[];
}

export interface DiscoveredAthlete {
  id: string;
  name: string;
  position: string;
  sport: string;
  currentClub: string;
  discoveredYear: string;
  status: 'professional' | 'trial' | 'academy';
  aiScore: number;
  transferValue: string;
  image: string;
}

export interface ScoutAttribute {
  label: string;
  value: number;
  endorsements: number;
  topEndorser: string;
  topEndorserVerified: boolean;
}

export interface ScoutHonor {
  title: string;
  org: string;
  year: string;
  type: 'award' | 'recognition' | 'certification';
}

export interface ScoutRecommendation {
  id: string;
  authorName: string;
  authorRole: string;
  authorVerified: boolean;
  relationship: string;
  body: string;
  date: string;
}

export interface ScoutActivityPost {
  id: string;
  text: string;
  time: string;
  reactions: number;
  image?: string;
}

export interface ScoutProfileData {
  id: string;
  name: string;
  image: string;
  coverImage: string;
  role: string;
  organization: string;
  organizationColor: string;
  organizationInitials: string;
  score: number;
  country: string;
  region: string;
  nationality: string;
  yearsExperience: number;
  followersCount: number;
  connectionsCount: number;
  isVerified: boolean;
  isOpenToOpportunities: boolean;
  philosophy: string;
  sportSpecializations: string[];
  positionSpecializations: string[];
  regionSpecializations: string[];
  totalAthletesSigned: number;
  totalClubsWorked: number;
  totalTransferValue: string;
  scoutingHistory: ScoutingSpell[];
  discoveredAthletes: DiscoveredAthlete[];
  attributes: ScoutAttribute[];
  honors: ScoutHonor[];
  recommendations: ScoutRecommendation[];
  languages: Array<{ name: string; level: string }>;
  activity: ScoutActivityPost[];
}

export const SCOUT_PROFILES: Record<string, ScoutProfileData> = {
  s1: {
    id: 's1',
    name: 'James Crawford',
    image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1400',
    role: 'Head of International Scouting',
    organization: 'Al Wasl SC',
    organizationColor: '#F5A623',
    organizationInitials: 'AW',
    score: 9.2,
    country: 'UAE',
    region: 'GCC / MENA',
    nationality: 'British',
    yearsExperience: 14,
    followersCount: 3840,
    connectionsCount: 218,
    isVerified: true,
    isOpenToOpportunities: true,
    philosophy: "Scouting is not about watching matches — it's about understanding human potential. The best talents I've found were never the most obvious. They were the ones reading the game a second faster than everyone else, making decisions under pressure that most professionals couldn't make with a week to think about it.\n\nMy methodology combines data-driven shortlisting with in-person assessment. An AI score opens a door — it never closes one. I use AceAiX performance metrics to identify candidates, then spend real time understanding the person behind the numbers: work ethic, coachability, mentality.\n\nI specialise in MENA and African markets where undervalued talent is abundant. Finding a 19-year-old Moroccan winger who becomes a €15m player in three years — that is what this job is about.",
    sportSpecializations: ['Football', 'Futsal'],
    positionSpecializations: ['Striker', 'Winger', 'Midfielder', 'Fullback'],
    regionSpecializations: ['MENA', 'North Africa', 'GCC', 'Sub-Saharan Africa'],
    totalAthletesSigned: 47,
    totalClubsWorked: 6,
    totalTransferValue: '€38M+',
    scoutingHistory: [
      {
        org: 'Al Wasl SC',
        orgInitials: 'AW',
        orgColor: '#F5A623',
        role: 'Head of International Scouting',
        from: '2021',
        to: 'Present',
        region: 'MENA / Global',
        athletesRecommended: 84,
        athletesSigned: 18,
        description: 'Led the club\'s transition to a data-driven scouting model. Introduced AceAiX performance verification across all recruitment pipelines. Identified and signed key players who contributed to the 2024 UAE Pro League title.',
        notableSignings: ['Fabrizio Moretti (Italy)', 'Khalid Al-Rashidi (UAE)', 'Rayan Benali (Morocco)'],
      },
      {
        org: 'Al Ain FC',
        orgInitials: 'AA',
        orgColor: '#2F80ED',
        role: 'Senior Scout · African Markets',
        from: '2018',
        to: '2021',
        region: 'North Africa / Sub-Saharan Africa',
        athletesRecommended: 61,
        athletesSigned: 14,
        description: 'Specialised in identifying African talent for the GCC market. Established a network of sub-agents across Morocco, Egypt, Nigeria, and Senegal. Introduced live tracking of players across 12 leagues simultaneously.',
        notableSignings: ['Youssef Ben Ali (Tunisia)', 'Emmanuel Asante (Ghana)', 'Ismail Diallo (Senegal)'],
      },
      {
        org: 'Sharjah FC',
        orgInitials: 'SH',
        orgColor: '#EF5350',
        role: 'Regional Scout',
        from: '2015',
        to: '2018',
        region: 'GCC / Levant',
        athletesRecommended: 42,
        athletesSigned: 10,
        description: 'Covered GCC domestic leagues and Levant region. Built the club\'s first digital scouting database. Created position-specific recruitment templates that cut time-to-sign by 40%.',
        notableSignings: ['Ahmed Al-Rashidi (UAE)', 'Omar Halabi (Jordan)'],
      },
      {
        org: 'Watford FC (Loan)',
        orgInitials: 'WF',
        orgColor: '#FBEE23',
        role: 'Scout · Middle East & Africa',
        from: '2013',
        to: '2015',
        region: 'Middle East / Africa',
        athletesRecommended: 28,
        athletesSigned: 5,
        description: 'Seconded to Watford to build their MENA and African scouting pipeline. Contributed to identifying two players who subsequently signed professional contracts in Europe.',
        notableSignings: ['Tarek Al-Mannai (Qatar)', 'Samuel Okafor (Nigeria)'],
      },
    ],
    discoveredAthletes: [
      {
        id: 'a1',
        name: 'Khalid Al-Rashidi',
        position: 'Striker',
        sport: 'Football',
        currentClub: 'Al Wasl SC',
        discoveredYear: '2022',
        status: 'professional',
        aiScore: 9.2,
        transferValue: '€4.5M',
        image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
      {
        id: 'a2',
        name: 'Rayan Benali',
        position: 'Goalkeeper',
        sport: 'Football',
        currentClub: 'Al Wasl SC',
        discoveredYear: '2023',
        status: 'professional',
        aiScore: 8.7,
        transferValue: '€2.1M',
        image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
      {
        id: 'a3',
        name: 'Emmanuel Asante',
        position: 'Winger',
        sport: 'Football',
        currentClub: 'Al Ain FC',
        discoveredYear: '2019',
        status: 'professional',
        aiScore: 8.4,
        transferValue: '€3.2M',
        image: 'https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
      {
        id: 'a4',
        name: 'Tariq Hassan',
        position: 'Midfielder',
        sport: 'Football',
        currentClub: 'Al Hilal',
        discoveredYear: '2020',
        status: 'professional',
        aiScore: 8.8,
        transferValue: '€5.8M',
        image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
      {
        id: 'a5',
        name: 'Ismail Diallo',
        position: 'Left Back',
        sport: 'Football',
        currentClub: 'Sharjah FC',
        discoveredYear: '2019',
        status: 'professional',
        aiScore: 8.1,
        transferValue: '€1.8M',
        image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
      {
        id: 'a6',
        name: 'Yusuf Al-Kaabi',
        position: 'Winger',
        sport: 'Football',
        currentClub: 'Shabab FC',
        discoveredYear: '2023',
        status: 'trial',
        aiScore: 8.5,
        transferValue: '€1.2M',
        image: 'https://images.pexels.com/photos/3764537/pexels-photo-3764537.jpeg?auto=compress&cs=tinysrgb&w=200',
      },
    ],
    attributes: [
      { label: 'Talent Identification', value: 94, endorsements: 28, topEndorser: 'Ricardo Mendes (Head Coach)', topEndorserVerified: true },
      { label: 'Data & Analytics', value: 91, endorsements: 22, topEndorser: 'Luís Ferreira (Technical Dir.)', topEndorserVerified: true },
      { label: 'Network Depth', value: 88, endorsements: 19, topEndorser: 'Omar Khalid (Asst. Coach)', topEndorserVerified: false },
      { label: 'Player Profiling', value: 89, endorsements: 31, topEndorser: 'Dr. Yousuf Rahimi', topEndorserVerified: true },
      { label: 'Contract Negotiation', value: 82, endorsements: 14, topEndorser: 'Fabrizio Moretti (Player)', topEndorserVerified: false },
      { label: 'Youth Development Eye', value: 90, endorsements: 24, topEndorser: 'Luís Ferreira (Technical Dir.)', topEndorserVerified: true },
    ],
    honors: [
      { title: 'UAE Pro League Champion — Scouting Contribution', org: 'Al Wasl SC', year: '2024', type: 'award' },
      { title: 'AFC Scouting Excellence Award', org: 'Asian Football Confederation', year: '2023', type: 'recognition' },
      { title: 'Best International Scout — Gulf Football Awards', org: 'GFA', year: '2022', type: 'award' },
      { title: 'AceAiX Verified Master Scout', org: 'AceAiX Platform', year: '2023', type: 'certification' },
      { title: '€10M+ Transfer Value Generated', org: 'Al Ain FC', year: '2021', type: 'recognition' },
    ],
    recommendations: [
      {
        id: 'r1',
        authorName: 'Ricardo Mendes',
        authorRole: 'Head Coach · Al Wasl SC',
        authorVerified: true,
        relationship: 'Head Coach',
        body: "James has transformed how we think about recruitment. His ability to combine data from AceAiX with real scouting intelligence means we sign the right player for our system, not just the best available name. The Khalid Al-Rashidi signing was entirely his identification — that player went on to become our top scorer. James is irreplaceable.",
        date: 'Apr 2025',
      },
      {
        id: 'r2',
        authorName: 'Luís Ferreira',
        authorRole: 'Technical Director · Al Wasl SC',
        authorVerified: true,
        relationship: 'Technical Director',
        body: "In 20 years of football I have worked with dozens of scouts. James is in the top three. His MENA network is unmatched, his use of performance analytics is sophisticated, and his player reports are the most detailed I have ever read. He does not just tell you what a player can do — he tells you what they will become.",
        date: 'Feb 2025',
      },
      {
        id: 'r3',
        authorName: 'Khalid Al-Rashidi',
        authorRole: 'Striker · Al Wasl SC',
        authorVerified: true,
        relationship: 'Discovered Athlete',
        body: "James found me playing in the UAE second division when no big club was watching. He saw something that others missed. He was honest with me about what I needed to improve and helped me understand what professional football required. I owe my career at this level to his belief in me.",
        date: 'Mar 2025',
      },
    ],
    languages: [
      { name: 'English', level: 'Native' },
      { name: 'Arabic', level: 'Conversational' },
      { name: 'French', level: 'Professional' },
      { name: 'Portuguese', level: 'Elementary' },
    ],
    activity: [
      {
        id: 'p1',
        text: "Champions. The signing of Khalid three years ago was a bet on potential over pedigree. Every report I wrote, every board presentation I made — this moment justifies it. But the real work starts tomorrow. There is always another talent waiting to be found.",
        time: '2 weeks ago',
        reactions: 2140,
        image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        id: 'p2',
        text: "Back from three weeks across Morocco, Tunisia, and Egypt. The depth of talent in North Africa right now is remarkable — technically gifted, physically developed, mentally hungry. The ones who will make it at the top level know exactly what it requires. More on specific players soon.",
        time: '5 weeks ago',
        reactions: 1380,
      },
      {
        id: 'p3',
        text: "Spoke at the AceAiX Scouting Summit this week on using performance AI to reduce bias in talent identification. AI scores should challenge our assumptions, not confirm them. The best scouts use data to ask better questions — not to replace judgment.",
        time: '2 months ago',
        reactions: 3210,
        image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ],
  },
};

export const SIMILAR_SCOUTS = [
  { id: 'ss1', name: 'Marco Fabiani', role: 'Senior Scout', org: 'Al Jazira FC', score: 8.7, image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
  { id: 'ss2', name: 'Aisha Al-Mansoori', role: 'Talent Analyst', org: 'UAE Football Federation', score: 8.4, image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
  { id: 'ss3', name: 'Kamal Benghazi', role: 'Regional Scout', org: 'Al Hilal', score: 8.1, image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: false },
];
