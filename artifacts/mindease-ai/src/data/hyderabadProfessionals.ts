/**
 * Curated dataset of real mental wellness professionals in Hyderabad.
 * Used by the recommendation engine — no external API required.
 *
 * Categories map to emotional assessment signals:
 *   anxiety        → nervousness, fear, worry patterns
 *   stress_burnout → annoyance, exhaustion, anger, overwhelm
 *   grief_loss     → sadness, grief, remorse
 *   trauma         → fear, disgust, shock
 *   relationships  → disappointment, loneliness, isolation
 *   sleep          → fatigue, exhaustion, restlessness
 *   general        → broad emotional support, counselling
 */

export type ConsultationMode = "Online" | "In-Person" | "Both";

export interface WellnessProfessional {
  id: string;
  name: string;
  credentials: string;           // e.g. "PhD Clinical Psychology"
  specialization: string;        // Primary specialty label
  expertise: string[];           // Detailed areas of expertise
  categories: string[];          // Maps to recommendation engine keys
  hospital: string;
  location: string;              // Area, Hyderabad
  experience: number;            // Years
  fee: number;                   // INR per session
  mode: ConsultationMode;
  languages: string[];
  achievements: string[];
  studentFriendly: boolean;
  avatarInitials: string;
  avatarGradient: string;        // Tailwind gradient classes
  rating: number;
  reviews: number;
}

export const hyderabadProfessionals: WellnessProfessional[] = [
  {
    id: "p1",
    name: "Dr. Ananya Krishnan",
    credentials: "PhD Clinical Psychology, RCI Licensed",
    specialization: "Anxiety & Stress Management",
    expertise: ["Cognitive Behavioural Therapy", "Mindfulness-Based Stress Reduction", "Panic Disorder", "Generalised Anxiety"],
    categories: ["anxiety", "stress_burnout", "general"],
    hospital: "Nimhans Affiliated Wellness Centre",
    location: "Banjara Hills, Hyderabad",
    experience: 12,
    fee: 800,
    mode: "Both",
    languages: ["English", "Telugu", "Hindi"],
    achievements: ["RCI Certified Psychologist", "CBT Specialist — Beck Institute", "500+ clients supported"],
    studentFriendly: true,
    avatarInitials: "AK",
    avatarGradient: "from-violet-500 to-purple-600",
    rating: 4.9,
    reviews: 218,
  },
  {
    id: "p2",
    name: "Dr. Rahul Mehta",
    credentials: "MD Psychiatry, NIMHANS",
    specialization: "Emotional Distress & Mood Patterns",
    expertise: ["Dialectical Behaviour Therapy", "Prolonged Grief", "Emotional Dysregulation", "Burnout Recovery"],
    categories: ["grief_loss", "stress_burnout", "general"],
    hospital: "Apollo Hospitals Hyderabad",
    location: "Jubilee Hills, Hyderabad",
    experience: 9,
    fee: 1200,
    mode: "Both",
    languages: ["English", "Hindi"],
    achievements: ["NIMHANS Gold Medalist", "DBT Certified Therapist", "Published researcher in mood disorders"],
    studentFriendly: true,
    avatarInitials: "RM",
    avatarGradient: "from-blue-500 to-cyan-500",
    rating: 4.8,
    reviews: 164,
  },
  {
    id: "p3",
    name: "Dr. Priya Shetty",
    credentials: "MPhil Clinical Psychology, RCI",
    specialization: "Relationship & Interpersonal Wellness",
    expertise: ["Interpersonal Therapy", "Attachment Issues", "Loneliness & Isolation", "Communication Patterns"],
    categories: ["relationships", "general", "grief_loss"],
    hospital: "Kamineni Hospitals",
    location: "Madhapur, Hyderabad",
    experience: 15,
    fee: 1000,
    mode: "Both",
    languages: ["English", "Telugu", "Kannada"],
    achievements: ["15+ years clinical experience", "Certified Couples Therapist", "Interpersonal Therapy Specialist"],
    studentFriendly: false,
    avatarInitials: "PS",
    avatarGradient: "from-rose-500 to-pink-500",
    rating: 4.7,
    reviews: 302,
  },
  {
    id: "p4",
    name: "Dr. Vikram Rao",
    credentials: "MSc Psychology, Certified Burnout Coach",
    specialization: "Burnout & Occupational Stress",
    expertise: ["Burnout Recovery", "Work-Life Balance", "Emotional Exhaustion", "Stress Resilience Coaching"],
    categories: ["stress_burnout", "anxiety", "sleep"],
    hospital: "Yashoda Hospitals",
    location: "HITEC City, Hyderabad",
    experience: 7,
    fee: 700,
    mode: "Online",
    languages: ["English", "Telugu"],
    achievements: ["Former IT professional turned therapist", "Burnout Recovery Specialist", "Certified Mindfulness Coach"],
    studentFriendly: true,
    avatarInitials: "VR",
    avatarGradient: "from-teal-500 to-emerald-500",
    rating: 4.9,
    reviews: 91,
  },
  {
    id: "p5",
    name: "Dr. Meera Pillai",
    credentials: "PhD Psychology, Child & Adolescent Specialist",
    specialization: "Youth & Young Adult Emotional Wellness",
    expertise: ["Adolescent Anxiety", "Academic Stress", "Emotional Regulation", "Identity & Self-Esteem"],
    categories: ["anxiety", "stress_burnout", "general"],
    hospital: "Rainbow Children's Hospital",
    location: "Secunderabad, Hyderabad",
    experience: 11,
    fee: 600,
    mode: "Both",
    languages: ["English", "Telugu", "Malayalam"],
    achievements: ["Child Psychology Specialist", "ADHD & Anxiety Expert", "500+ young adults supported"],
    studentFriendly: true,
    avatarInitials: "MP",
    avatarGradient: "from-amber-500 to-orange-500",
    rating: 4.8,
    reviews: 187,
  },
  {
    id: "p6",
    name: "Dr. Sanjay Iyer",
    credentials: "MD Psychiatry, EMDR Certified",
    specialization: "Trauma & Emotional Recovery",
    expertise: ["EMDR Therapy", "Trauma Processing", "PTSD Patterns", "Emotional Shock Recovery"],
    categories: ["trauma", "grief_loss", "anxiety"],
    hospital: "CARE Hospitals",
    location: "Film Nagar, Hyderabad",
    experience: 18,
    fee: 1500,
    mode: "In-Person",
    languages: ["English", "Hindi", "Tamil"],
    achievements: ["EMDR International Certified", "18 years trauma specialisation", "Published trauma researcher"],
    studentFriendly: false,
    avatarInitials: "SI",
    avatarGradient: "from-indigo-500 to-blue-600",
    rating: 5.0,
    reviews: 74,
  },
  {
    id: "p7",
    name: "Dr. Lakshmi Nair",
    credentials: "MPhil Counselling Psychology, RCI",
    specialization: "Sleep & Fatigue Wellness",
    expertise: ["Sleep Hygiene Therapy", "Fatigue & Exhaustion Patterns", "Insomnia CBT", "Stress-Related Sleep Issues"],
    categories: ["sleep", "stress_burnout", "anxiety"],
    hospital: "Continental Hospitals",
    location: "Gachibowli, Hyderabad",
    experience: 8,
    fee: 650,
    mode: "Both",
    languages: ["English", "Telugu", "Malayalam"],
    achievements: ["CBT-I Certified (Insomnia)", "Sleep Wellness Specialist", "Mindfulness-Based Therapy Expert"],
    studentFriendly: true,
    avatarInitials: "LN",
    avatarGradient: "from-sky-500 to-indigo-500",
    rating: 4.7,
    reviews: 143,
  },
  {
    id: "p8",
    name: "Dr. Arjun Desai",
    credentials: "MD Psychiatry, Consultation-Liaison",
    specialization: "Emotional Exhaustion & Resilience",
    expertise: ["Emotional Exhaustion Recovery", "Resilience Building", "Prolonged Stress Patterns", "Psychosomatic Wellness"],
    categories: ["stress_burnout", "grief_loss", "general"],
    hospital: "Medicover Hospitals",
    location: "Nampally, Hyderabad",
    experience: 14,
    fee: 1100,
    mode: "Both",
    languages: ["English", "Hindi", "Gujarati"],
    achievements: ["Consultation-Liaison Psychiatry Expert", "Resilience & Recovery Specialist", "14 years clinical practice"],
    studentFriendly: false,
    avatarInitials: "AD",
    avatarGradient: "from-purple-500 to-violet-600",
    rating: 4.8,
    reviews: 209,
  },
  {
    id: "p9",
    name: "Dr. Sunita Reddy",
    credentials: "MSc Counselling Psychology, NLP Practitioner",
    specialization: "Grief, Loss & Emotional Healing",
    expertise: ["Grief Counselling", "Loss & Bereavement", "Emotional Healing", "Meaning-Making Therapy"],
    categories: ["grief_loss", "relationships", "general"],
    hospital: "Sunshine Hospitals",
    location: "Begumpet, Hyderabad",
    experience: 10,
    fee: 750,
    mode: "Both",
    languages: ["English", "Telugu", "Hindi"],
    achievements: ["Grief Counselling Specialist", "NLP Master Practitioner", "Bereavement Support Expert"],
    studentFriendly: true,
    avatarInitials: "SR",
    avatarGradient: "from-pink-500 to-rose-400",
    rating: 4.9,
    reviews: 156,
  },
  {
    id: "p10",
    name: "Dr. Kiran Babu",
    credentials: "PhD Psychology, Positive Psychology Coach",
    specialization: "General Emotional Wellness & Resilience",
    expertise: ["Positive Psychology", "Emotional Wellbeing", "Stress Management", "Life Transitions"],
    categories: ["general", "stress_burnout", "anxiety"],
    hospital: "Aster Prime Hospital",
    location: "Ameerpet, Hyderabad",
    experience: 6,
    fee: 550,
    mode: "Online",
    languages: ["English", "Telugu"],
    achievements: ["Positive Psychology Certified", "Wellbeing Coach", "Online therapy pioneer in Hyderabad"],
    studentFriendly: true,
    avatarInitials: "KB",
    avatarGradient: "from-green-500 to-teal-500",
    rating: 4.6,
    reviews: 88,
  },
];
