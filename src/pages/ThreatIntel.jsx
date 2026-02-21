import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Zap, Shield, AlertTriangle, TrendingUp, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SEVERITY = {
  critical: 'bg-red-600/20 text-red-400 border-red-600/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function ThreatIntel() {
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState(null);

  const fetchIntel = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a cybersecurity threat intelligence analyst. Generate a realistic but fictional threat intelligence report for today (${new Date().toDateString()}). Include:
      1. 5 recent CVEs with ID, severity (critical/high/medium/low), affected product, description, and mitigation
      2. 3 trending security news headlines with summary
      3. 2 breach alerts (fictional companies) with details
      4. 3 trending exploit techniques (educational only, no working exploits) with defensive notes
      Make it realistic, educational, and professional. All data is fictional for training purposes.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          cves: { type: 'array', items: { type: 'object', properties: {
            id: { type: 'string' }, severity: { type: 'string' },
            product: { type: 'string' }, description: { type: 'string' }, mitigation: { type: 'string' }
          }}},
          news: { type: 'array', items: { type: 'object', properties: {
            headline: { type: 'string' }, summary: { type: 'string' }, date: { type: 'string' }
          }}},
          breaches: { type: 'array', items: { type: 'object', properties: {
            company: { type: 'string' }, details: { type: 'string' }, records: { type: 'string' }
          }}},
          exploits: { type: 'array', items: { type: 'object', properties: {
            technique: { type: 'string' }, description: { type: 'string' }, defense: { type: 'string' }
          }}}
        }
      }
    });
    setFeed(result);
    setLoading(false);
  };

  useEffect(() => { fetchIntel(); }, []);

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live Threat Feed
              </div>
              <h1 className="text-4xl font-bold font-serif text-white mb-2">Threat Intelligence</h1>
              <p className="text-gray-400">AI-powered security intelligence feed. For educational purposes only.</p>
            </div>
            <Button onClick={fetchIntel} disabled={loading} variant="outline" className="border-gray-700 text-gray-300">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh Feed
            </Button>
          </div>
        </motion.div>

        {loading && !feed && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-red-500 mx-auto mb-4" />
              <p className="text-gray-400">Fetching threat intelligence...</p>
            </div>
          </div>
        )}

        {feed && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* CVEs */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Recent CVEs
              </h2>
              {feed.cves?.map((cve, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="bg-[#111] border-white/5 hover:border-white/10 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm font-bold">{cve.id}</span>
                          <span className="text-gray-400 text-sm">{cve.product}</span>
                        </div>
                        <Badge className={`${SEVERITY[cve.severity?.toLowerCase()] || SEVERITY.medium} border text-xs shrink-0`}>
                          {cve.severity}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{cve.description}</p>
                      <div className="bg-green-500/5 border border-green-500/20 rounded px-3 py-2 text-xs text-green-400">
                        🛡 Mitigation: {cve.mitigation}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Breach Alerts */}
              <h2 className="text-white font-semibold flex items-center gap-2 mt-6">
                <Shield className="w-5 h-5 text-orange-400" /> Breach Alerts
              </h2>
              {feed.breaches?.map((b, i) => (
                <Card key={i} className="bg-[#111] border border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-white font-medium">{b.company}</span>
                      <span className="text-xs text-gray-500 ml-auto">{b.records}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{b.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* News */}
              <h2 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" /> Security News
              </h2>
              {feed.news?.map((n, i) => (
                <Card key={i} className="bg-[#111] border-white/5">
                  <CardContent className="p-4">
                    <h4 className="text-white text-sm font-medium mb-1">{n.headline}</h4>
                    <p className="text-gray-500 text-xs mb-2">{n.summary}</p>
                    <span className="text-xs text-gray-600">{n.date}</span>
                  </CardContent>
                </Card>
              ))}

              {/* Exploit Techniques */}
              <h2 className="text-white font-semibold flex items-center gap-2 mt-4">
                <Zap className="w-5 h-5 text-yellow-400" /> Trending Techniques
              </h2>
              {feed.exploits?.map((e, i) => (
                <Card key={i} className="bg-[#111] border-yellow-500/10">
                  <CardContent className="p-4">
                    <h4 className="text-yellow-400 text-sm font-medium mb-1">{e.technique}</h4>
                    <p className="text-gray-500 text-xs mb-2">{e.description}</p>
                    <div className="text-xs text-green-400">🛡 {e.defense}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}