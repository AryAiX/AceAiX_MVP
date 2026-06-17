export interface CareerSpell {
  club: string;
  clubInitials: string;
  clubColor: string;
  role: string;
  from: string;
  to: string;
  appearances: number;
  goals: number;
  assists: number;
  honors: string[];
  description: string;
}

export interface AcademyEntry {
  name: string;
  location: string;
  years: string;
  scholarship: boolean;
  description: string;
}

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  verified: boolean;
  expiry?: string;
}

export interface Honor {
  title: string;
  org: string;
  year: string;
  type: 'team' | 'individual' | 'national';
}

export interface Language {
  name: string;
  level: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Elementary';
}

export interface FollowingItem {
  name: string;
  type: 'Club' | 'Federation' | 'Platform' | 'Athlete';
  followers: string;
  color: string;
  initials: string;
}

export interface MatchEntry {
  date: string;
  opponent: string;
  competition: string;
  result: string;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
}

export interface TrajectoryPoint {
  season: string;
  goals: number;
  forecast?: number;
}

export interface AttributeData {
  label: string;
  value: number;
  endorsements: number;
  topEndorser: string;
  topEndorserVerified: boolean;
}

export interface HighlightClip {
  id: string;
  thumbnail: string;
  title: string;
  duration: string;
  tags: string[];
  views: string;
}

export interface ActivityPost {
  id: string;
  type: 'achievement' | 'match' | 'milestone' | 'media';
  text: string;
  time: string;
  reactions: number;
  image?: string;
}

export interface SimilarAthlete {
  id: string;
  name: string;
  position: string;
  club: string;
  score: number;
  image: string;
  isVerified: boolean;
}

export interface AthleteProfileData {
  id: string;
  name: string;
  position: string;
  positionSecondary: string;
  sport: string;
  club: string;
  clubInitials: string;
  clubColor: string;
  country: string;
  nationality: string;
  age: number;
  height: string;
  weight: string;
  preferredFoot: string;
  score: number;
  visibilityScore: number;
  performanceScore: number;
  fitnessScore: number;
  isVerified: boolean;
  isOpenToTrials: boolean;
  image: string;
  coverImage: string;
  followersCount: number;
  connectionsCount: number;
  bio: string;
  attributes: AttributeData[];
  career: CareerSpell[];
  academy: AcademyEntry[];
  certifications: Certification[];
  honors: Honor[];
  languages: Language[];
  following: FollowingItem[];
  recentMatches: MatchEntry[];
  trajectory: TrajectoryPoint[];
  highlights: HighlightClip[];
  activity: ActivityPost[];
}

export const ATHLETE_PROFILES: Record<string, AthleteProfileData> = {
  a1: {
    id: 'a1',
    name: 'Karim Al-Hassan',
    position: 'Striker',
    positionSecondary: 'Second Striker',
    sport: 'Football',
    club: 'Al Wasl SC',
    clubInitials: 'AW',
    clubColor: '#F5A623',
    country: 'UAE',
    nationality: 'Emirati',
    age: 21,
    height: '181 cm',
    weight: '76 kg',
    preferredFoot: 'Right',
    score: 92,
    visibilityScore: 91,
    performanceScore: 94,
    fitnessScore: 97,
    isVerified: true,
    isOpenToTrials: true,
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1400',
    followersCount: 12847,
    connectionsCount: 483,
    bio: "Professional striker with six seasons in the UAE Pro League and three senior international caps. Known for clinical finishing, aerial ability, and relentless pressing from the front. Product of the Shabab Al Ahli Academy, I bring a high-intensity, data-driven approach to every match — combining elite physical benchmarks with tactical intelligence developed under top-level coaching staff.\n\nCurrently seeking opportunities to test myself in a European or Asian top-flight environment. My vision: to become the first Emirati player to compete in the UEFA Champions League.",
    attributes: [
      { label: 'Pace', value: 94, endorsements: 28, topEndorser: 'Sergio Mendes', topEndorserVerified: true },
      { label: 'Shooting', value: 91, endorsements: 35, topEndorser: 'Coach Al-Rashidi', topEndorserVerified: true },
      { label: 'Passing', value: 83, endorsements: 19, topEndorser: 'Omar Khalid', topEndorserVerified: false },
      { label: 'Dribbling', value: 88, endorsements: 24, topEndorser: 'James Crawford', topEndorserVerified: true },
      { label: 'Defending', value: 55, endorsements: 6, topEndorser: 'Team Analyst', topEndorserVerified: false },
      { label: 'Physical', value: 82, endorsements: 21, topEndorser: 'Dr. Yousuf Rahimi', topEndorserVerified: true },
    ],
    career: [
      {
        club: 'Al Wasl SC',
        clubInitials: 'AW',
        clubColor: '#F5A623',
        role: 'Striker',
        from: '2023',
        to: 'Present',
        appearances: 47,
        goals: 24,
        assists: 11,
        honors: ['UAE Pro League Champion 2024', 'UAE Super Cup 2024'],
        description: 'First-choice striker in back-to-back UAE Pro League seasons. Top scorer in team and second highest in league in 2023–24. Built a strong partnership with international forwards and contributed regularly in AFC Champions League qualification rounds.',
      },
      {
        club: 'Al Ain FC',
        clubInitials: 'AA',
        clubColor: '#8B5CF6',
        role: 'Striker / Second Striker',
        from: '2021',
        to: '2023',
        appearances: 62,
        goals: 38,
        assists: 19,
        honors: ['UAE League Cup 2022'],
        description: 'Breakthrough professional seasons — established as a top-tier UAE Pro League forward before age 20. Developed strong pressing mechanics and aerial threat under tactical coach Ibrahim Al-Farsi.',
      },
      {
        club: 'Shabab Al Ahli',
        clubInitials: 'SA',
        clubColor: '#EF5350',
        role: 'Youth Forward',
        from: '2019',
        to: '2021',
        appearances: 18,
        goals: 8,
        assists: 3,
        honors: ['Academy Player of the Year 2021'],
        description: 'Final youth academy years, top scorer in U-21 competition. Promoted to senior squad at 19.',
      },
    ],
    academy: [
      {
        name: 'Shabab Al Ahli Academy',
        location: 'Dubai, UAE',
        years: '2015 – 2021',
        scholarship: true,
        description: 'Full sports scholarship. Won U-17 and U-19 UAE national academy leagues. Selected for 2 UAE youth national squads.',
      },
      {
        name: 'Aspire Academy Exchange',
        location: 'Doha, Qatar',
        years: '2020 (3-month exchange)',
        scholarship: false,
        description: 'High-performance training exchange program. Worked under former Champions League-winning coaching staff.',
      },
    ],
    certifications: [
      { title: 'FIFA Anti-Doping Education Certificate', issuer: 'FIFA / WADA', date: 'Jan 2024', verified: true, expiry: 'Jan 2026' },
      { title: 'AFC Pre-Season Medical Fitness Clearance', issuer: 'Al Wasl Medical Department', date: 'Jan 2025', verified: true, expiry: 'Dec 2025' },
      { title: 'UAE Pro League Player License', issuer: 'UAE Football Association', date: 'Aug 2023', verified: true },
      { title: 'Sports Nutrition Certificate', issuer: 'NSCA', date: 'Mar 2023', verified: false },
    ],
    honors: [
      { title: 'UAE Pro League Champion', org: 'Al Wasl SC', year: '2024', type: 'team' },
      { title: 'UAE Super Cup Winner', org: 'Al Wasl SC', year: '2024', type: 'team' },
      { title: 'UAE League Cup Winner', org: 'Al Ain FC', year: '2022', type: 'team' },
      { title: 'UAE U-21 Top Scorer', org: 'UAE Football Association', year: '2024', type: 'individual' },
      { title: '13 UAE National Team Caps', org: 'UAE National Team', year: '2023–2025', type: 'national' },
      { title: 'Academy Player of the Year', org: 'Shabab Al Ahli', year: '2021', type: 'individual' },
    ],
    languages: [
      { name: 'Arabic', level: 'Native' },
      { name: 'English', level: 'Professional' },
      { name: 'Spanish', level: 'Elementary' },
    ],
    following: [
      { name: 'Al Wasl SC', type: 'Club', followers: '124K', color: '#F5A623', initials: 'AW' },
      { name: 'UAE Football Association', type: 'Federation', followers: '89K', color: '#2F80ED', initials: 'UAE' },
      { name: 'AceAiX Scout Network', type: 'Platform', followers: '34K', color: '#B8F135', initials: 'AI' },
      { name: 'AFC Champions League', type: 'Federation', followers: '2.1M', color: '#1FB57A', initials: 'AFC' },
    ],
    recentMatches: [
      { date: '02 Jun 2025', opponent: 'Sharjah FC', competition: 'UAE Pro League', result: '3-1 W', minutes: 90, goals: 2, assists: 0, rating: 9.1 },
      { date: '25 May 2025', opponent: 'Al Jazira', competition: 'UAE Pro League', result: '1-1 D', minutes: 82, goals: 1, assists: 0, rating: 7.4 },
      { date: '18 May 2025', opponent: 'Al Nasr', competition: 'UAE Super Cup QF', result: '2-0 W', minutes: 90, goals: 0, assists: 2, rating: 7.9 },
      { date: '10 May 2025', opponent: 'Shabab Al Ahli', competition: 'UAE Pro League', result: '0-2 L', minutes: 75, goals: 0, assists: 0, rating: 6.2 },
      { date: '03 May 2025', opponent: 'UAE National Team', competition: 'International Friendly', result: '2-1 W', minutes: 90, goals: 1, assists: 1, rating: 8.5 },
    ],
    trajectory: [
      { season: '20/21', goals: 8 },
      { season: '21/22', goals: 18 },
      { season: '22/23', goals: 20 },
      { season: '23/24', goals: 24 },
      { season: '24/25', goals: 24, forecast: 24 },
      { season: '25/26', forecast: 29 },
      { season: '26/27', forecast: 34 },
    ],
    highlights: [
      {
        id: 'h1',
        thumbnail: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=600',
        title: 'Hat-trick vs Sharjah FC — League Week 22',
        duration: '4:12',
        tags: ['Hat-trick', 'Free Kick', 'Header'],
        views: '18.4K',
      },
      {
        id: 'h2',
        thumbnail: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=600',
        title: 'Season 2023–24 Highlights Reel',
        duration: '7:35',
        tags: ['Goals', 'Assists', 'Pressing'],
        views: '41.2K',
      },
      {
        id: 'h3',
        thumbnail: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=600',
        title: 'UAE National Team Debut Goal',
        duration: '2:18',
        tags: ['International', 'Long Shot'],
        views: '93.1K',
      },
      {
        id: 'h4',
        thumbnail: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=600',
        title: 'Top 10 Dribbles 2024–25',
        duration: '3:54',
        tags: ['Dribbling', 'Speed'],
        views: '22.7K',
      },
    ],
    activity: [
      { id: 'a1', type: 'achievement', text: 'Reached 24 league goals for the second consecutive season. Proud to help bring the UAE Pro League title back to Al Wasl. This is just the beginning. 🏆', time: '3 days ago', reactions: 2841, image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=600' },
      { id: 'a2', type: 'match', text: 'Brace against Sharjah FC (3-1). Two different goal types — one tap-in, one from outside the box. Happy with the clinical finishing this week.', time: '1 week ago', reactions: 1203 },
      { id: 'a3', type: 'milestone', text: 'Honoured to represent the UAE National Team for my 13th international cap. A childhood dream, still feels unreal every time.', time: '3 weeks ago', reactions: 4720 },
    ],
  },
};

export const SIMILAR_ATHLETES: SimilarAthlete[] = [
  { id: 's1', name: 'Yousef Al-Amri', position: 'Striker', club: 'Al Jazira FC', score: 88, image: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
  { id: 's2', name: 'Ahmed Khalfan', position: 'Centre Forward', club: 'Shabab Al Ahli', score: 85, image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: false },
  { id: 's3', name: 'Omar Abdulrahman Jr.', position: 'Second Striker', club: 'Al Ain FC', score: 90, image: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: true },
  { id: 's4', name: 'Rashid Al-Mansoori', position: 'Striker', club: 'Sharjah FC', score: 82, image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200', isVerified: false },
];
