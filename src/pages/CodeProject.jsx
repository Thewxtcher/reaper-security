import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, ChevronUp, Download, Copy, User, Clock, Tag, 
  Check, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categoryColors = {
  tools: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  scripts: 'bg-green-500/10 text-green-400 border-green-500/20',
  exploits: 'bg-red-500/10 text-red-400 border-red-500/20',
  frameworks: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  utilities: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  educational: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

export default function CodeProject() {
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
    };
    checkAuth();
  }, []);

  const { data: project, isLoading } = useQuery({
    queryKey: ['codeProject', projectId],
    queryFn: async () => {
      const projects = await base44.entities.CodeProject.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const voteMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.CodeProject.update(projectId, { 
        votes: (project?.votes || 0) + 1 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codeProject', projectId] });
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.CodeProject.update(projectId, { 
        downloads: (project?.downloads || 0) + 1 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codeProject', projectId] });
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(project?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadMutation.mutate();
    const blob = new Blob([project?.code || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'code'}.${project?.language || 'py'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <Link to={createPageUrl('CodeHub')}>
            <Button variant="outline" className="border-gray-700 text-gray-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Code Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={createPageUrl('CodeHub')} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Code Hub
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Project Header */}
          <Card className="bg-[#111] border border-white/10 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${categoryColors[project.category] || categoryColors.tools} border`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {project.category || 'tools'}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-gray-400">
                      v{project.version || '1.0.0'}
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                  <p className="text-gray-400 mb-4">{project.description}</p>
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-white/10 text-gray-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {project.author_name || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(project.created_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <button
                        onClick={() => isAuthenticated && voteMutation.mutate()}
                        disabled={!isAuthenticated}
                        className="text-gray-500 hover:text-green-500 transition-colors disabled:opacity-50"
                      >
                        <ChevronUp className="w-6 h-6 mx-auto" />
                      </button>
                      <span className="text-white font-semibold">{project.votes || 0}</span>
                      <p className="text-gray-500 text-xs">votes</p>
                    </div>
                    <div className="text-center">
                      <Download className="w-6 h-6 mx-auto text-gray-500" />
                      <span className="text-white font-semibold">{project.downloads || 0}</span>
                      <p className="text-gray-500 text-xs">downloads</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="border-gray-700 text-gray-300"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Block */}
          <Card className="bg-[#111] border border-white/10">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-mono text-sm">
                  {project.name}.{project.language || 'py'}
                </CardTitle>
                <Badge variant="outline" className="border-white/10 text-gray-400 font-mono">
                  {project.language || 'python'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-6 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">
                <code>{project.code}</code>
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}