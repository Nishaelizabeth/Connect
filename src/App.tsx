import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ShuffleHero } from './components/ui/shuffle-grid';
import HeroSection from './components/ui/hero-section-9';
import InteractiveBentoGallery from './components/ui/interactive-bento-gallery';
import { Navbar } from './components/ui/navbar';
import AuthPage from './pages/AuthPage';
import { Users, Globe, Award } from 'lucide-react';

const heroStats = [
  { value: '50k+', label: 'Travelers', icon: <Users className="h-5 w-5" /> },
  { value: '100+', label: 'Countries', icon: <Globe className="h-5 w-5" /> },
  { value: '4.9', label: 'Rating', icon: <Award className="h-5 w-5" /> },
];



const heroImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2649&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2684&auto=format&fit=crop"
];

const bentoItems = [
  {
    id: 1,
    type: "image",
    title: "Anurag Mishra",
    desc: "Driven, innovative, visionary",
    url: "https://kxptt4m9j4.ufs.sh/f/9YHhEDeslzkcbP3rYTiXwH7Y106CepJOsoAgQjyFi3MUfDkh",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2",
  },
  {
    id: 2,
    type: "video",
    title: "Dog Puppy",
    desc: "Adorable loyal companion.",
    url: "https://cdn.pixabay.com/video/2024/07/24/222837_large.mp4",
    span: "md:col-span-2 md:row-span-2 col-span-1 sm:col-span-2 sm:row-span-2",
  },
  {
    id: 3,
    type: "image",
    title: "Forest Path",
    desc: "Mystical forest trail",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    span: "md:col-span-1 md:row-span-3 sm:col-span-2 sm:row-span-2 ",
  },
  {
    id: 4,
    type: "image",
    title: "Falling Leaves",
    desc: "Autumn scenery",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 5,
    type: "video",
    title: "Bird Parrot",
    desc: "Vibrant feathered charm",
    url: "https://cdn.pixabay.com/video/2020/07/30/46026-447087782_large.mp4",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 6,
    type: "image",
    title: "Beach Paradise",
    desc: "Sunny tropical beach",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    span: "md:col-span-2 md:row-span-2 sm:col-span-1 sm:row-span-2 ",
  },
  {
    id: 7,
    type: "video",
    title: "Shiva Temple",
    desc: "Peaceful Shiva sanctuary.",
    url: "https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4",
    span: "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 ",
  },
];

import { getUser } from '@/utils/storage';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const heroActions = [
    { text: 'Start Journey', onClick: () => navigate('/auth'), variant: 'default' as const },
    { text: 'Watch Demo', onClick: () => console.log('Demo'), variant: 'outline' as const },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <ShuffleHero user={user} />
        <div id="destinations-section">
          <HeroSection
            title={<span>Connect & Explore <span className="text-blue-600">Together</span></span>}
            subtitle="Join a community of travelers ensuring no one explores alone."
            actions={heroActions}
            stats={heroStats}
            images={heroImages}
          />
        </div>
        <div className="bg-gray-50/50 pb-20">
          <InteractiveBentoGallery
            mediaItems={bentoItems}
            title="Gallery Shots Collection"
            description="Drag and explore our curated collection of shots"
          />
        </div>
      </div>
    </div>
  );
};

import ProfilePage from './profiles/ProfilePage';
import Dashboard from './pages/Dashboard';
import CreateTrip from './trips/CreateTrip';
import Invitations from './trips/Invitations';

// ... existing imports

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trips/create" element={<CreateTrip />} />
        <Route path="/invitations" element={<Invitations />} />
      </Routes>
    </Router>
  );
}

export default App;
