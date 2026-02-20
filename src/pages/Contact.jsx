import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { 
  Mail, Send, CheckCircle2, User, Building2, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const serviceTypes = [
  { value: 'web_application', label: 'Web Application Security' },
  { value: 'network', label: 'Network Security' },
  { value: 'security_audit', label: 'Security Audit' },
  { value: 'social_engineering', label: 'Social Engineering' },
  { value: 'consulting', label: 'Security Consulting' },
  { value: 'education', label: 'Security Education' },
  { value: 'other', label: 'Other' }
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service_type: '',
    message: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.ContactRequest.create(data);
    },
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      submitMutation.mutate(formData);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Request Submitted</h1>
          <p className="text-gray-400 mb-8">
            Thank you for your interest. We'll review your request and get back to you within 24-48 hours.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', company: '', service_type: '', message: '' });
            }}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            Submit Another Request
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold font-serif text-white mb-4">Request Assessment</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Tell us about your security needs and we'll provide a customized assessment proposal.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-[#111] border border-white/10">
              <CardHeader>
                <CardTitle className="text-white font-serif">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-300">Company</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="company"
                          placeholder="Company Name"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="pl-10 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service" className="text-gray-300">Service Type</Label>
                      <Select
                        value={formData.service_type}
                        onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                      >
                        <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                          {serviceTypes.map((service) => (
                            <SelectItem key={service.value} value={service.value} className="text-gray-300 focus:text-white">
                              {service.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-300">Message *</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <Textarea
                        id="message"
                        placeholder="Describe your security needs, scope, and any specific requirements..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="pl-10 bg-[#0a0a0a] border-white/10 text-white placeholder:text-gray-500 min-h-[150px]"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 py-6"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="bg-[#111] border border-green-500/20">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-3">What to Expect</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Initial response within 24-48 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Scoping call to discuss requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Detailed proposal with pricing
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Authorization documentation
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border border-yellow-500/20">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-3">Important Notice</h3>
                <p className="text-gray-400 text-sm">
                  All security testing engagements require signed authorization before any testing begins. 
                  We operate strictly within legal and ethical boundaries.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}