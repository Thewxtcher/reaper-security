import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Palette, Plus, Check, Trash2, Edit2, Save, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const defaultColors = {
  primary_color: '#ef4444',
  secondary_color: '#22c55e',
  background_color: '#0a0a0a',
  card_color: '#111111',
  text_color: '#ffffff'
};

export default function Themes() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [newTheme, setNewTheme] = useState({
    name: '',
    ...defaultColors
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    };
    checkAuth();
  }, []);

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Theme.filter({ owner_email: user.email });
    },
    enabled: !!user?.email,
    refetchOnWindowFocus: true,
  });

  const createThemeMutation = useMutation({
    mutationFn: async (themeData) => {
      return base44.entities.Theme.create({
        ...themeData,
        owner_email: user.email,
        is_active: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      setCreateDialogOpen(false);
      setNewTheme({ name: '', ...defaultColors });
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return base44.entities.Theme.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['activeTheme'] });
      setEditingTheme(null);
    }
  });

  const deleteThemeMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Theme.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['activeTheme'] });
    }
  });

  const activateThemeMutation = useMutation({
    mutationFn: async (themeId) => {
      // Deactivate ALL user themes first
      const userThemes = await base44.entities.Theme.filter({ owner_email: user.email });
      for (const t of userThemes) {
        await base44.entities.Theme.update(t.id, { is_active: false });
      }
      // Then activate the selected one
      if (themeId) {
        await base44.entities.Theme.update(themeId, { is_active: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['activeTheme'] });
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    }
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
            <Palette className="w-10 h-10 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Theme Manager</h1>
          <p className="text-gray-400 mb-8">Login to create and manage your custom themes.</p>
          <Button
            onClick={handleLogin}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
          >
            Login to Continue
          </Button>
        </motion.div>
      </div>
    );
  }

  const ColorInput = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <Label className="text-gray-300 text-sm">{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 rounded cursor-pointer bg-transparent border border-white/10"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#0a0a0a] border-white/10 text-white font-mono text-sm"
        />
      </div>
    </div>
  );

  const ThemePreview = ({ theme }) => (
    <div 
      className="rounded-lg p-4 border"
      style={{ 
        backgroundColor: theme.background_color,
        borderColor: `${theme.primary_color}40`
      }}
    >
      <div 
        className="rounded p-3 mb-2"
        style={{ backgroundColor: theme.card_color }}
      >
        <div 
          className="text-sm font-medium mb-1"
          style={{ color: theme.text_color }}
        >
          Sample Card
        </div>
        <div 
          className="text-xs"
          style={{ color: `${theme.text_color}80` }}
        >
          Preview text
        </div>
      </div>
      <div className="flex gap-2">
        <div 
          className="px-3 py-1 rounded text-xs text-white"
          style={{ backgroundColor: theme.primary_color }}
        >
          Primary
        </div>
        <div 
          className="px-3 py-1 rounded text-xs text-white"
          style={{ backgroundColor: theme.secondary_color }}
        >
          Secondary
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold font-serif text-white mb-4">Theme Manager</h1>
          <p className="text-gray-400 text-lg">Create and customize your personal themes.</p>
        </motion.div>

        {/* Create Theme Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-white">Your Themes</h2>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Theme
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white font-serif">Create New Theme</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Theme Name</Label>
                  <Input
                    placeholder="My Custom Theme"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <ColorInput 
                    label="Primary Color" 
                    value={newTheme.primary_color}
                    onChange={(v) => setNewTheme({ ...newTheme, primary_color: v })}
                  />
                  <ColorInput 
                    label="Secondary Color" 
                    value={newTheme.secondary_color}
                    onChange={(v) => setNewTheme({ ...newTheme, secondary_color: v })}
                  />
                  <ColorInput 
                    label="Background" 
                    value={newTheme.background_color}
                    onChange={(v) => setNewTheme({ ...newTheme, background_color: v })}
                  />
                  <ColorInput 
                    label="Card Color" 
                    value={newTheme.card_color}
                    onChange={(v) => setNewTheme({ ...newTheme, card_color: v })}
                  />
                  <ColorInput 
                    label="Text Color" 
                    value={newTheme.text_color}
                    onChange={(v) => setNewTheme({ ...newTheme, text_color: v })}
                  />
                </div>

                <div className="pt-4">
                  <Label className="text-gray-300 mb-2 block">Preview</Label>
                  <ThemePreview theme={newTheme} />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => createThemeMutation.mutate(newTheme)}
                    disabled={!newTheme.name.trim() || createThemeMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700"
                  >
                    {createThemeMutation.isPending ? 'Creating...' : 'Create Theme'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-gray-700 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reset to Default */}
        <div className="mb-8">
          <Button
            onClick={() => activateThemeMutation.mutate(null)}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            Reset to Default Theme
          </Button>
        </div>

        {/* Themes List */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="bg-[#111] border-white/5 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
                  <div className="h-32 bg-white/5 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : themes.length === 0 ? (
          <Card className="bg-[#111] border-white/10">
            <CardContent className="p-12 text-center">
              <Palette className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No themes yet. Create your first custom theme!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {themes.map((theme) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`bg-[#111] border ${theme.is_active ? 'border-green-500/50' : 'border-white/10'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white font-serif flex items-center gap-2">
                        {theme.name}
                        {theme.is_active && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingTheme(theme)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteThemeMutation.mutate(theme.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ThemePreview theme={theme} />
                    <Button
                      onClick={() => activateThemeMutation.mutate(theme.id)}
                      disabled={theme.is_active || activateThemeMutation.isPending}
                      className={`w-full mt-4 ${
                        theme.is_active 
                          ? 'bg-green-500/20 text-green-400 cursor-default' 
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600'
                      }`}
                    >
                      {theme.is_active ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Currently Active
                        </>
                      ) : (
                        'Apply Theme'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Theme Dialog */}
        <Dialog open={!!editingTheme} onOpenChange={() => setEditingTheme(null)}>
          <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white font-serif">Edit Theme</DialogTitle>
            </DialogHeader>
            {editingTheme && (
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Theme Name</Label>
                  <Input
                    value={editingTheme.name}
                    onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <ColorInput 
                    label="Primary Color" 
                    value={editingTheme.primary_color}
                    onChange={(v) => setEditingTheme({ ...editingTheme, primary_color: v })}
                  />
                  <ColorInput 
                    label="Secondary Color" 
                    value={editingTheme.secondary_color}
                    onChange={(v) => setEditingTheme({ ...editingTheme, secondary_color: v })}
                  />
                  <ColorInput 
                    label="Background" 
                    value={editingTheme.background_color}
                    onChange={(v) => setEditingTheme({ ...editingTheme, background_color: v })}
                  />
                  <ColorInput 
                    label="Card Color" 
                    value={editingTheme.card_color}
                    onChange={(v) => setEditingTheme({ ...editingTheme, card_color: v })}
                  />
                  <ColorInput 
                    label="Text Color" 
                    value={editingTheme.text_color}
                    onChange={(v) => setEditingTheme({ ...editingTheme, text_color: v })}
                  />
                </div>

                <div className="pt-4">
                  <Label className="text-gray-300 mb-2 block">Preview</Label>
                  <ThemePreview theme={editingTheme} />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => updateThemeMutation.mutate({ 
                      id: editingTheme.id, 
                      data: {
                        name: editingTheme.name,
                        primary_color: editingTheme.primary_color,
                        secondary_color: editingTheme.secondary_color,
                        background_color: editingTheme.background_color,
                        card_color: editingTheme.card_color,
                        text_color: editingTheme.text_color
                      }
                    })}
                    disabled={updateThemeMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateThemeMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingTheme(null)}
                    className="border-gray-700 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}