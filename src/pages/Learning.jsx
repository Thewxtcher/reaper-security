import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Code, BookOpen, Wrench, Award, Youtube, Monitor, FolderOpen,
  ExternalLink, Search, BookMarked, Upload, CheckCircle, Loader2, X, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';

const driveBase = 'https://drive.google.com/drive/folders/1PV_jxVP0BeUe1nzGa5FfePnU7p7lYvTE?usp=drive_link';

const topics = [
  { icon: BookOpen, title: '00 - Learning Path',        description: 'Structured roadmap to guide your journey',       color: 'text-blue-400',   bgColor: 'bg-blue-500/10',   url: driveBase },
  { icon: Monitor,  title: '01 - Labs & Practice',       description: 'Hands-on labs and practice environments',        color: 'text-cyan-400',   bgColor: 'bg-cyan-500/10',   url: driveBase },
  { icon: Award,    title: '02 - Certifications',        description: 'Cert prep: CEH, OSCP, CompTIA & more',           color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', url: driveBase },
  { icon: FolderOpen, title: '03 - Cyber Library',       description: 'Books, whitepapers & reference materials',       color: 'text-pink-400',   bgColor: 'bg-pink-500/10',   url: driveBase },
  { icon: Globe,    title: '04 - Resource Index',        description: 'Curated index of learning resources',            color: 'text-green-400',  bgColor: 'bg-green-500/10',  url: driveBase },
  { icon: Globe,    title: 'Level 0 - Networking',       description: 'Start here! Networking fundamentals',            color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', url: driveBase },
  { icon: Wrench,   title: 'Real World Pentest',         description: 'Practical penetration testing techniques',       color: 'text-red-400',    bgColor: 'bg-red-500/10',    url: driveBase },
  { icon: Wrench,   title: 'Tools',                      description: 'Security tools, exploits & utilities',           color: 'text-orange-400', bgColor: 'bg-orange-500/10', url: driveBase },
  { icon: Code,     title: 'Vault 7 CIA Leak',           description: 'Declassified CIA hacking tools & techniques',    color: 'text-purple-400', bgColor: 'bg-purple-500/10', url: driveBase },
  { icon: Youtube,  title: 'YouTube Channels',           description: 'Best cybersecurity video courses & tutorials',   color: 'text-red-400',    bgColor: 'bg-red-500/10',    url: driveBase },
  { icon: Globe,    title: 'Websites for Learning',      description: 'Top platforms: HTB, TryHackMe, SANS & more',     color: 'text-teal-400',   bgColor: 'bg-teal-500/10',   url: driveBase },
  { icon: Monitor,  title: 'Virtualization Software',    description: 'VMware, VirtualBox & lab setup guides',          color: 'text-sky-400',    bgColor: 'bg-sky-500/10',    url: driveBase },
  { icon: FolderOpen, title: "SKY's Educational Folder", description: 'Community curated hacking resources',            color: 'text-emerald-400',bgColor: 'bg-emerald-500/10',url: driveBase },
  { icon: Award,    title: 'Free Certification Info',    description: 'Free cert resources and study guides',           color: 'text-lime-400',   bgColor: 'bg-lime-500/10',   url: driveBase },
  { icon: Wrench,   title: 'Buy Hardware',               description: 'Recommended hardware for your home lab',         color: 'text-amber-400',  bgColor: 'bg-amber-500/10',  url: driveBase },
];

const categories = ['All', 'Pentesting', 'Network', 'Web Security', 'OSINT', 'Certifications', 'CTF'];

function UploadSection() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef();

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files));
  };

  const handleSubmit = async () => {
    if (!files.length || !title) return;
    setUploading(true);
    const results = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      results.push({ name: file.name, url: file_url });
    }
    setUploaded(results);
    setFiles([]);
    setTitle('');
    setDescription('');
    setUploading(false);
  };

  return (
    <Card className="bg-[#111] border border-white/10">
      <CardContent className="p-6 space-y-4">
        {uploaded.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
              <CheckCircle className="w-4 h-4" /> Upload successful!
            </div>
            {uploaded.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                <FileText className="w-3 h-3" /> {f.name}
              </a>
            ))}
            <button onClick={() => setUploaded([])} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 mt-1">
              <X className="w-3 h-3" /> Dismiss
            </button>
          </div>
        )}

        <Input
          placeholder="Resource title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500"
        />
        <Input
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500"
        />

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-white/10 hover:border-white/30 rounded-lg p-8 text-center cursor-pointer transition-colors"
        >
          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          {files.length > 0 ? (
            <p className="text-sm text-white">{files.map(f => f.name).join(', ')}</p>
          ) : (
            <>
              <p className="text-gray-400 text-sm">Drag & drop files here or click to browse</p>
              <p className="text-gray-600 text-xs mt-1">PDFs, ZIPs, docs, scripts — any format</p>
            </>
          )}
          <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!files.length || !title || uploading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 w-full"
        >
          {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload Content</>}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Learning() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const driveUrl = 'https://drive.google.com/drive/folders/1PV_jxVP0BeUe1nzGa5FfePnU7p7lYvTE?usp=drive_link';

  return (
    <div className="min-h-screen py-20">
      {/* Header */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold font-serif text-white mb-6">Learning Center</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Free resources to start your cybersecurity journey. 40GB+ of curated content.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Drive */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-[#111] to-[#1a1a1a] border border-blue-500/20">
              <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-serif text-xl">Mr. J's Security Learning Drive</h3>
                    <p className="text-gray-400 text-sm">
                      Access 40GB+ of cybersecurity content — learning paths, labs, cert prep, CIA Vault 7, tools, books & more.
                    </p>
                  </div>
                </div>
                <a href={driveUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Drive
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Browse by Topic */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold font-serif text-white mb-8">Browse by Topic</h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topics.map((topic, index) => (
              <motion.a
                key={topic.title}
                href={topic.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card className="bg-[#111] border border-white/5 hover:border-white/20 transition-all h-full">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${topic.bgColor} flex items-center justify-center mb-3`}>
                      <topic.icon className={`w-5 h-5 ${topic.color}`} />
                    </div>
                    <h3 className="text-white font-medium text-sm mb-1 group-hover:text-gray-300 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-gray-500 text-xs">{topic.description}</p>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Resources */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold font-serif text-white mb-8">Curated Resources</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111] border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
            <TabsList className="bg-[#111] border border-white/10">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Card className="bg-[#111] border border-white/10">
            <CardContent className="p-12 text-center">
              <BookMarked className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No resources found. Check out the Google Drive above!</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upload Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold font-serif text-white mb-2">Share Learning Content</h2>
          <p className="text-gray-400 text-sm mb-8">Upload resources, tools, or materials to contribute to the community.</p>
          <UploadSection />
        </div>
      </section>

      {/* Bootcamp CTA */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-[#111] to-[#1a1a1a] border border-purple-500/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold font-serif text-white mb-2">
                Cyber Bootcamp (43.74 GB)
              </h3>
              <p className="text-gray-400 mb-6">
                Complete cybersecurity bootcamp with comprehensive learning materials. Available in the drive.
              </p>
              <a href={driveUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600">
                  Access Bootcamp
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}