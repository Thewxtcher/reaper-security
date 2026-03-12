import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield, Upload, FileText, CheckCircle2, Clock, X, Plus,
  Briefcase, Award, Calendar, LogIn, ChevronRight, AlertTriangle,
  Phone, Linkedin, Globe, Loader2
} from 'lucide-react';

const SPECIALIZATIONS = [
  'Web App Pentesting', 'Network Security', 'Cloud Security', 'Red Teaming',
  'Malware Analysis', 'Reverse Engineering', 'Social Engineering', 'Forensics',
  'Threat Intelligence', 'Security Auditing', 'Bug Bounty', 'Mobile Security',
];

const STEPS = ['Personal Info', 'Expertise', 'Documents', 'Interview'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-2 ${i <= current ? 'text-white' : 'text-gray-600'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < current ? 'bg-green-500 border-green-500' :
              i === current ? 'bg-red-600 border-red-500' :
              'bg-transparent border-gray-700'
            }`}>
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-xs hidden sm:block">{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px max-w-8 ${i < current ? 'bg-green-500' : 'bg-gray-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ServiceProviderApply() {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [newSpec, setNewSpec] = useState('');

  const [form, setForm] = useState({
    applicant_name: '',
    phone: '',
    linkedin_url: '',
    portfolio_url: '',
    bio: '',
    specializations: [],
    years_experience: '',
    certification_names: [],
    certifications: [],
    resume_url: '',
    resume_name: '',
    preferred_interview_dates: ['', '', ''],
  });

  useEffect(() => {
    const init = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuth(auth);
      if (auth) {
        const u = await base44.auth.me();
        setUser(u);
        setForm(f => ({ ...f, applicant_name: u.full_name || '' }));
        const apps = await base44.entities.ServiceProviderApplication.filter({ applicant_email: u.email });
        if (apps.length > 0) setExistingApp(apps[0]);
      }
      setLoading(false);
    };
    init();
  }, []);

  const toggleSpec = (s) => {
    setForm(f => ({
      ...f,
      specializations: f.specializations.includes(s)
        ? f.specializations.filter(x => x !== s)
        : [...f.specializations, s]
    }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResume(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, resume_url: file_url, resume_name: file.name }));
    setUploadingResume(false);
  };

  const handleCertUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCert(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({
      ...f,
      certifications: [...f.certifications, file_url],
      certification_names: [...f.certification_names, file.name],
    }));
    setUploadingCert(false);
  };

  const removeCert = (idx) => {
    setForm(f => ({
      ...f,
      certifications: f.certifications.filter((_, i) => i !== idx),
      certification_names: f.certification_names.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.ServiceProviderApplication.create({
      ...form,
      applicant_email: user.email,
      years_experience: parseFloat(form.years_experience) || 0,
      preferred_interview_dates: form.preferred_interview_dates.filter(Boolean),
      status: 'pending',
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md px-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-white font-serif mb-4">Service Provider Portal</h1>
          <p className="text-gray-400 mb-8">Login to apply as a certified security professional on our platform.</p>
          <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-gradient-to-r from-red-600 to-red-700">
            <LogIn className="w-4 h-4 mr-2" />Login to Apply
          </Button>
        </motion.div>
      </div>
    );
  }

  if (submitted || existingApp) {
    const app = existingApp;
    const statusConfig = {
      pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: Clock, label: 'Under Review' },
      reviewing: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: FileText, label: 'Being Reviewed' },
      interview_scheduled: { color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: Calendar, label: 'Interview Scheduled' },
      approved: { color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: CheckCircle2, label: 'Approved!' },
      rejected: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: X, label: 'Not Approved' },
    };
    const cfg = statusConfig[app?.status || 'pending'];
    const StatusIcon = cfg?.icon || Clock;

    return (
      <div className="min-h-screen bg-[#0a0a0a] py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`rounded-2xl border p-8 text-center ${cfg?.bg}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${cfg?.bg}`}>
                <StatusIcon className={`w-8 h-8 ${cfg?.color}`} />
              </div>
              <h2 className="text-2xl font-bold text-white font-serif mb-2">Application {submitted ? 'Submitted!' : 'Status'}</h2>
              <p className={`text-lg font-semibold mb-4 ${cfg?.color}`}>{cfg?.label}</p>

              {app?.status === 'pending' && (
                <p className="text-gray-400 text-sm">Our team will review your application within 2-3 business days. We'll reach out via email.</p>
              )}
              {app?.status === 'interview_scheduled' && app?.interview_date && (
                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <p className="text-purple-300 font-semibold">Interview Scheduled</p>
                  <p className="text-white mt-1">{new Date(app.interview_date).toLocaleString()}</p>
                  <p className="text-gray-400 text-sm mt-2">Check your email for meeting link details.</p>
                </div>
              )}
              {app?.status === 'approved' && (
                <div className="mt-2">
                  <p className="text-gray-400 text-sm mb-4">Congratulations! You're now a verified service provider on Reaper Security.</p>
                  <Link to={createPageUrl('ProviderSetup')}>
                    <button className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg font-medium transition-colors">
                      Set Up Your Provider Page →
                    </button>
                  </Link>
                </div>
              )}
              {app?.admin_notes && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl text-left">
                  <p className="text-gray-400 text-xs mb-1">Notes from team:</p>
                  <p className="text-gray-300 text-sm">{app.admin_notes}</p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                {app?.specializations?.map(s => (
                  <div key={s} className="flex items-center gap-2 text-gray-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">Professional Application</span>
          </div>
          <h1 className="text-4xl font-bold text-white font-serif mb-3">Become a Service Provider</h1>
          <p className="text-gray-400">Join our verified network of cybersecurity professionals.</p>
        </motion.div>

        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {/* STEP 0: Personal Info */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="bg-[#111] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-red-400" />Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-xs">Full Name *</Label>
                      <Input value={form.applicant_name} onChange={e => setForm(f => ({ ...f, applicant_name: e.target.value }))}
                        className="bg-[#0a0a0a] border-white/10 text-white mt-1" placeholder="John Doe" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">Phone</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className="bg-[#0a0a0a] border-white/10 text-white pl-9" placeholder="+1 555 0000" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">LinkedIn Profile</Label>
                    <div className="relative mt-1">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input value={form.linkedin_url} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                        className="bg-[#0a0a0a] border-white/10 text-white pl-9" placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Portfolio / Website</Label>
                    <div className="relative mt-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input value={form.portfolio_url} onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))}
                        className="bg-[#0a0a0a] border-white/10 text-white pl-9" placeholder="https://yoursite.com" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Professional Bio *</Label>
                    <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4}
                      placeholder="Tell us about your background, experience, and what you specialize in..."
                      className="w-full mt-1 bg-[#0a0a0a] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 1: Expertise */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="bg-[#111] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-red-400" />Areas of Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <Label className="text-gray-400 text-xs">Years of Experience *</Label>
                    <Input type="number" value={form.years_experience} onChange={e => setForm(f => ({ ...f, years_experience: e.target.value }))}
                      className="bg-[#0a0a0a] border-white/10 text-white mt-1 max-w-xs" placeholder="e.g. 5" min="0" max="50" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs mb-2 block">Specializations * (select all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATIONS.map(s => (
                        <button key={s} onClick={() => toggleSpec(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                            form.specializations.includes(s)
                              ? 'bg-red-600/20 border-red-500/60 text-red-300'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    {form.specializations.length > 0 && (
                      <p className="text-green-400 text-xs mt-2">{form.specializations.length} selected</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Documents */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="bg-[#111] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-400" />Documents & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resume */}
                  <div>
                    <Label className="text-gray-400 text-xs mb-2 block">Resume / CV *</Label>
                    {form.resume_url ? (
                      <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-green-300 text-sm font-medium">{form.resume_name}</span>
                        <button onClick={() => setForm(f => ({ ...f, resume_url: '', resume_name: '' }))} className="ml-auto text-gray-500 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/25 transition-colors">
                        {uploadingResume ? (
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-500" />
                        )}
                        <div className="text-center">
                          <p className="text-gray-300 text-sm font-medium">{uploadingResume ? 'Uploading...' : 'Click to upload your resume'}</p>
                          <p className="text-gray-600 text-xs mt-1">PDF, DOC, DOCX accepted</p>
                        </div>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
                      </label>
                    )}
                  </div>

                  {/* Certifications */}
                  <div>
                    <Label className="text-gray-400 text-xs mb-2 block">Certifications (OSCP, CEH, CISSP, etc.)</Label>
                    <div className="space-y-2 mb-3">
                      {form.certification_names.map((name, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <Award className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-blue-300 text-sm flex-1">{name}</span>
                          <button onClick={() => removeCert(i)} className="text-gray-500 hover:text-red-400">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center gap-3 p-4 border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/25 transition-colors">
                      {uploadingCert ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-500" />
                      )}
                      <span className="text-gray-400 text-sm">{uploadingCert ? 'Uploading...' : 'Add certification document'}</span>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertUpload} className="hidden" disabled={uploadingCert} />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: Interview */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card className="bg-[#111] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-400" />Interview Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-sm">
                      After reviewing your application, we'll schedule a 30-minute technical interview.
                      Please provide 3 preferred time slots (we'll confirm one).
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-400 text-xs">Preferred Interview Times (provide 3 options)</Label>
                    {form.preferred_interview_dates.map((date, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm w-6">{i + 1}.</span>
                        <Input
                          type="datetime-local"
                          value={date}
                          onChange={e => {
                            const dates = [...form.preferred_interview_dates];
                            dates[i] = e.target.value;
                            setForm(f => ({ ...f, preferred_interview_dates: dates }));
                          }}
                          className="bg-[#0a0a0a] border-white/10 text-white flex-1"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-white/5 rounded-xl space-y-2 mt-4">
                    <p className="text-white font-semibold text-sm mb-3">Application Summary</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Name</span>
                      <span className="text-white">{form.applicant_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Experience</span>
                      <span className="text-white">{form.years_experience} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Specializations</span>
                      <span className="text-white">{form.specializations.length} selected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Resume</span>
                      <span className={form.resume_url ? 'text-green-400' : 'text-red-400'}>
                        {form.resume_url ? '✓ Uploaded' : '✗ Missing'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Certifications</span>
                      <span className="text-white">{form.certifications.length} uploaded</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="border-gray-700 text-gray-300 disabled:opacity-30">
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 0 && (!form.applicant_name || !form.bio)) ||
                (step === 1 && (form.specializations.length === 0 || !form.years_experience)) ||
                (step === 2 && !form.resume_url)
              }
              className="bg-red-600 hover:bg-red-500">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}
              className="bg-gradient-to-r from-red-600 to-green-700 hover:from-red-500 hover:to-green-600">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : <>Submit Application</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}