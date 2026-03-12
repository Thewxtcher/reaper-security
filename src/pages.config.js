/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAssistant from './pages/AIAssistant';
import AdminDashboard from './pages/AdminDashboard';
import CodeHub from './pages/CodeHub';
import CodeProject from './pages/CodeProject';
import Community from './pages/Community';
import CommunityHub from './pages/CommunityHub';
import Contact from './pages/Contact';
import CreateCodeProject from './pages/CreateCodeProject';
import CreateForumPost from './pages/CreateForumPost';
import CyberLabs from './pages/CyberLabs';
import Forum from './pages/Forum';
import ForumRules from './pages/ForumRules';
import ForumThread from './pages/ForumThread';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Research from './pages/Research';
import ResearchPost from './pages/ResearchPost';
import SSHTerminal from './pages/SSHTerminal';
import ServiceProviderApply from './pages/ServiceProviderApply';
import Services from './pages/Services';
import Themes from './pages/Themes';
import ThreatIntel from './pages/ThreatIntel';
import Upgrades from './pages/Upgrades';
import UserProfile from './pages/UserProfile';
import Legal from './pages/Legal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistant": AIAssistant,
    "AdminDashboard": AdminDashboard,
    "CodeHub": CodeHub,
    "CodeProject": CodeProject,
    "Community": Community,
    "CommunityHub": CommunityHub,
    "Contact": Contact,
    "CreateCodeProject": CreateCodeProject,
    "CreateForumPost": CreateForumPost,
    "CyberLabs": CyberLabs,
    "Forum": Forum,
    "ForumRules": ForumRules,
    "ForumThread": ForumThread,
    "Home": Home,
    "Learning": Learning,
    "Marketplace": Marketplace,
    "Profile": Profile,
    "Research": Research,
    "ResearchPost": ResearchPost,
    "SSHTerminal": SSHTerminal,
    "ServiceProviderApply": ServiceProviderApply,
    "Services": Services,
    "Themes": Themes,
    "ThreatIntel": ThreatIntel,
    "Upgrades": Upgrades,
    "UserProfile": UserProfile,
    "Legal": Legal,
}

export const pagesConfig = {
    mainPage: "AIAssistant",
    Pages: PAGES,
    Layout: __Layout,
};