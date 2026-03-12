import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Scale, Lock, Eye, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: `By accessing, browsing, registering, or otherwise using Reaper Security ("the Platform," "the Site," "we," "us," or "our"), you ("the User," "you," or "your") acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service, Legal Disclaimer, and all applicable laws and regulations. If you do not agree to any of these terms, you are expressly prohibited from using this site and must discontinue access immediately.

These terms constitute a legally binding agreement between you and Reaper Security. Your continued use of the Platform following the posting of any changes constitutes acceptance of those changes. We reserve the right to modify these terms at any time without prior notice, and it is your responsibility to review these terms periodically.

Users must be at least 18 years of age to access restricted content, premium tools, or participate in advanced training modules. By using this Platform, you represent and warrant that you are of legal age to form a binding contract and are not prohibited from receiving services under the laws of your applicable jurisdiction.`
  },
  {
    id: 'educational',
    icon: Shield,
    title: '2. Educational Purpose & Ethical Use Policy',
    content: `Reaper Security is an educational cybersecurity platform designed exclusively for legal, ethical, and authorized security research, learning, and professional development. All tools, code, scripts, exploits, techniques, and educational materials provided on this Platform are intended solely for:

(a) Authorized penetration testing on systems you own or have explicit written permission to test;
(b) Capture The Flag (CTF) competitions and similar sanctioned cybersecurity competitions;
(c) Academic research conducted within institutional review board guidelines;
(d) Professional security assessments performed under formal engagement agreements;
(e) Personal skill development on isolated, controlled laboratory environments;
(f) Defensive security research to understand and mitigate vulnerabilities.

The Platform operates under the core principle that knowledge of offensive techniques is essential for building robust defensive systems. Understanding how attacks work is a fundamental requirement for security professionals to adequately protect networks, systems, and data. This educational philosophy is consistent with industry-standard certifications such as CEH, OSCP, GPEN, and programs offered by SANS Institute, EC-Council, and Offensive Security.

By accessing any tool, tutorial, lab, or community content on Reaper Security, you affirm that your intent aligns with these ethical use guidelines and that you will not use any information or resources obtained through this Platform to engage in unauthorized, illegal, or malicious activities.`
  },
  {
    id: 'prohibited',
    icon: AlertTriangle,
    title: '3. Prohibited Activities & Zero-Tolerance Policy',
    content: `The following activities are strictly prohibited and constitute a material breach of these Terms of Service. Violation may result in immediate account termination, reporting to law enforcement, and civil or criminal legal action:

3.1 UNAUTHORIZED SYSTEM ACCESS
Using any tools, scripts, techniques, or knowledge obtained from this Platform to access, probe, scan, or exploit computer systems, networks, databases, or devices without explicit written authorization from the rightful owner. This includes, but is not limited to: unauthorized port scanning, vulnerability exploitation, credential stuffing, brute-force attacks, man-in-the-middle attacks, SQL injection, cross-site scripting, remote code execution, and privilege escalation on systems you do not own or have explicit permission to test.

3.2 MALICIOUS SOFTWARE DISTRIBUTION
Creating, distributing, deploying, or facilitating the spread of ransomware, malware, viruses, worms, trojans, spyware, adware, keyloggers, rootkits, or any other malicious code designed to damage, disrupt, or gain unauthorized access to computer systems.

3.3 DATA THEFT & PRIVACY VIOLATIONS
Using Platform resources to steal, harvest, exfiltrate, sell, or expose personally identifiable information (PII), financial data, medical records, credentials, intellectual property, trade secrets, or any other private or confidential data belonging to individuals or organizations without consent.

3.4 CRITICAL INFRASTRUCTURE ATTACKS
Targeting power grids, water systems, financial systems, healthcare networks, transportation systems, emergency services, or any other critical infrastructure classified under applicable national security frameworks including but not limited to the U.S. Department of Homeland Security Critical Infrastructure sectors.

3.5 FRAUD & FINANCIAL CRIME
Using Platform knowledge to commit wire fraud, bank fraud, credit card fraud, identity theft, cryptocurrency theft, phishing campaigns, social engineering for financial gain, or any other financially motivated cybercrime.

3.6 HARASSMENT & TARGETED ATTACKS
Using Platform resources to stalk, harass, threaten, doxx, or harm specific individuals. This includes launching DDoS attacks, spear-phishing campaigns, or any targeted attack against a specific person or organization without authorization.

3.7 GOVERNMENT & LAW ENFORCEMENT SYSTEMS
Attempting to access, probe, or exploit systems belonging to government agencies, law enforcement, military, intelligence services, or judicial systems of any nation.`
  },
  {
    id: 'legal',
    icon: Scale,
    title: '4. Legal Compliance & Applicable Laws',
    content: `Users of Reaper Security are solely responsible for ensuring their activities comply with all applicable local, state, national, and international laws. The following legal frameworks are particularly relevant to cybersecurity activities:

4.1 UNITED STATES
The Computer Fraud and Abuse Act (CFAA), 18 U.S.C. § 1030, prohibits unauthorized access to protected computers. Violations can result in federal criminal charges carrying penalties of up to 10–20 years imprisonment per count. The Electronic Communications Privacy Act (ECPA) governs interception of electronic communications. The Digital Millennium Copyright Act (DMCA) restricts circumvention of access controls. Additionally, state-level computer crime laws in all 50 states impose additional penalties.

4.2 EUROPEAN UNION
The Network and Information Security (NIS2) Directive establishes cybersecurity requirements. The General Data Protection Regulation (GDPR) imposes strict rules on personal data processing with penalties up to €20 million or 4% of global annual turnover. The Computer Misuse Act equivalent laws in EU member states criminalize unauthorized computer access.

4.3 UNITED KINGDOM
The Computer Misuse Act 1990 (as amended) criminalizes unauthorized computer access with penalties up to 10 years imprisonment. The Investigatory Powers Act 2016 governs lawful interception. The UK GDPR and Data Protection Act 2018 govern data protection obligations.

4.4 INTERNATIONAL
Canada's Criminal Code (Section 342.1), Australia's Criminal Code Act 1995, Germany's §202a-c StGB, and equivalent legislation in virtually every jurisdiction globally criminalize unauthorized computer access and cybercrime. The Budapest Convention on Cybercrime (Treaty ETS No. 185), ratified by over 65 countries, establishes international cooperation frameworks for prosecuting cybercrime.

Ignorance of the law is not a valid defense. Users conducting security research that may intersect with legal gray areas are strongly advised to consult with a qualified cybersecurity attorney before proceeding. Reaper Security does not provide legal advice and nothing on this Platform constitutes legal counsel.`
  },
  {
    id: 'liability',
    icon: Shield,
    title: '5. Limitation of Liability & Disclaimer of Warranties',
    content: `TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, REAPER SECURITY, ITS OWNERS, OPERATORS, EMPLOYEES, CONTRIBUTORS, AFFILIATES, AND AGENTS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF, OR INABILITY TO USE, THIS PLATFORM OR ANY OF ITS CONTENT, TOOLS, OR SERVICES.

5.1 NO WARRANTY
This Platform is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, accuracy, security, or non-infringement. Reaper Security does not warrant that the Platform will be uninterrupted, error-free, secure, or free of viruses or other harmful components.

5.2 USER RESPONSIBILITY
You expressly understand and agree that you assume sole responsibility for any and all consequences arising from your use of tools, code, techniques, or knowledge obtained through this Platform. Any harm caused to third-party systems, networks, data, or individuals as a result of actions you take using knowledge or resources from Reaper Security is your sole legal and financial responsibility.

5.3 INDEMNIFICATION
You agree to indemnify, defend, and hold harmless Reaper Security and its owners, operators, employees, contributors, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from: (a) your use or misuse of the Platform; (b) your violation of these Terms; (c) your violation of any third party's rights; or (d) any harm caused to any person or entity as a result of your actions.

5.4 AGGREGATE LIABILITY CAP
In the event any court of competent jurisdiction finds Reaper Security liable despite the above limitations, our total aggregate liability to you shall not exceed the greater of (a) the total fees paid by you to Reaper Security in the twelve months preceding the claim, or (b) one hundred U.S. dollars ($100.00).`
  },
  {
    id: 'premium',
    icon: Lock,
    title: '6. Premium & Extreme Tools — Special Terms',
    content: `Certain areas of Reaper Security, specifically the "Extreme Tools" and "Black Arsenal" sections, contain advanced offensive security tools, zero-day research, advanced exploitation frameworks, and techniques reserved exclusively for verified security professionals.

6.1 VERIFIED PROFESSIONAL REQUIREMENT
Access to premium offensive tools requires users to complete identity verification and professional attestation. By accessing these sections, you represent, warrant, and affirm that you are a licensed or professionally employed cybersecurity practitioner, penetration tester, red team operator, security researcher, law enforcement officer, or military/intelligence professional acting within the scope of your authorized duties.

6.2 ENHANCED LIABILITY ACKNOWLEDGMENT
Users accessing the Extreme Tools section accept an elevated duty of care and acknowledge that the tools in this section are of a particularly sensitive nature. Misuse of these tools carries significantly higher legal risk, including potential federal and international criminal charges. You accept full and complete legal responsibility for any and all uses of tools obtained from this section.

6.3 NO EXPORT TO PROHIBITED PARTIES
Advanced offensive security tools may be subject to U.S. Export Administration Regulations (EAR) and International Traffic in Arms Regulations (ITAR), as well as equivalent export control laws in other jurisdictions. You represent that you are not located in, under the control of, or a national of any country subject to U.S. trade sanctions or embargoes, and that you will not re-export or transfer any tools to prohibited persons or destinations.

6.4 SUBSCRIPTION TERMS
Premium access is provided on a subscription basis. Subscription fees are non-refundable except as required by applicable law. Reaper Security reserves the right to revoke premium access at any time for violation of these terms without refund.`
  },
  {
    id: 'privacy',
    icon: Eye,
    title: '7. Privacy Policy & Data Collection',
    content: `Reaper Security collects and processes certain personal data in connection with your use of the Platform. This section summarizes our data practices; our full Privacy Policy is incorporated by reference.

7.1 DATA WE COLLECT
We collect: account registration information (name, email address, password hash); usage data (pages visited, features used, time spent, IP addresses); community content (posts, messages, code submissions, forum replies); authentication tokens; device and browser information; and payment information processed through third-party payment processors (we do not store raw payment card data).

7.2 HOW WE USE YOUR DATA
Collected data is used to: operate and improve the Platform; authenticate users and prevent fraud; communicate important notices, updates, and security alerts; provide customer support; analyze usage patterns to improve user experience; comply with legal obligations; and enforce these Terms of Service.

7.3 DATA SHARING
We do not sell your personal data to third parties. We may share data with: service providers acting under our direction (hosting, analytics, payment processing); law enforcement or government authorities when required by law or to protect the safety of users; and successor entities in the event of a merger, acquisition, or asset sale.

7.4 DATA RETENTION & DELETION
We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us. Certain data may be retained for legal compliance, fraud prevention, or legitimate business purposes even after account deletion.

7.5 SECURITY
We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits. However, no system is completely secure, and we cannot guarantee absolute security of your data.`
  },
  {
    id: 'community',
    icon: Shield,
    title: '8. Community Standards & Content Policy',
    content: `8.1 USER-GENERATED CONTENT
Users may post code, articles, forum posts, messages, and other content to the Platform. By posting content, you grant Reaper Security a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content in connection with operating the Platform.

8.2 PROHIBITED CONTENT
The following content is strictly prohibited and will be removed, and may result in account termination and legal referral: actual malware targeting real systems or individuals; tutorials specifically designed to facilitate attacks on named or identifiable targets; content that doxes, harasses, or threatens specific individuals; child sexual abuse material or any content exploiting minors; content promoting terrorism, genocide, or mass violence; content that infringes intellectual property rights; and fraudulent, deceptive, or misleading content.

8.3 RESPONSIBLE DISCLOSURE
Reaper Security supports and encourages responsible vulnerability disclosure. If you discover a genuine security vulnerability in a real-world system through activities on this Platform, you are strongly encouraged to follow responsible disclosure practices: privately notify the affected organization, allow reasonable time for remediation, and only disclose publicly after the vulnerability has been patched or the organization has declined to respond. Do not exploit vulnerabilities beyond proof-of-concept, do not access more data than necessary to demonstrate the vulnerability, and do not disclose sensitive data belonging to third parties.

8.4 CONTENT MODERATION
Reaper Security reserves the right to remove any content that violates these standards at our sole discretion. We are not obligated to monitor all user content, but we reserve the right to do so. Reports of policy-violating content can be submitted through the Platform's reporting mechanisms.`
  },
  {
    id: 'governing',
    icon: Scale,
    title: '9. Governing Law, Disputes & Jurisdiction',
    content: `9.1 GOVERNING LAW
These Terms of Service shall be governed by and construed in accordance with applicable law. Any disputes arising from your use of the Platform shall be subject to the exclusive jurisdiction of the competent courts.

9.2 DISPUTE RESOLUTION
Before initiating formal legal proceedings, both parties agree to make a good-faith effort to resolve disputes informally. You agree to contact Reaper Security and provide written notice describing the nature of the dispute and the resolution sought. Reaper Security will make reasonable efforts to resolve the dispute within 30 days.

9.3 ARBITRATION
For disputes that cannot be resolved informally, both parties agree to binding arbitration conducted by a recognized arbitration institution under its commercial arbitration rules. Arbitration shall be conducted on an individual basis, and you waive any right to participate in class action litigation or class-wide arbitration.

9.4 SEVERABILITY
If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it enforceable.

9.5 ENTIRE AGREEMENT
These Terms, together with our Privacy Policy and any additional terms specific to particular services, constitute the entire agreement between you and Reaper Security regarding your use of the Platform and supersede all prior agreements, understandings, negotiations, and discussions, whether oral or written.`
  },
  {
    id: 'contact',
    icon: FileText,
    title: '10. Contact, Reporting & Legal Notices',
    content: `10.1 LEGAL NOTICES
All legal notices to Reaper Security should be directed through the Platform's official contact channels. Notices are deemed received when acknowledged in writing by a Reaper Security representative.

10.2 REPORTING ABUSE
If you observe any user violating these Terms, engaging in illegal activity, or misusing Platform resources, please report it immediately through our reporting system. Reaper Security takes all abuse reports seriously and will investigate and take appropriate action.

10.3 LAW ENFORCEMENT COOPERATION
Reaper Security fully cooperates with law enforcement agencies and will respond to lawfully issued subpoenas, warrants, court orders, and other legal process. We will provide user data and activity logs to law enforcement when required by law or to protect the safety of users and the public. Users engaged in illegal activity should be aware that their actions may be logged and reported.

10.4 VULNERABILITY REPORTS
If you discover a security vulnerability in the Reaper Security Platform itself, please practice responsible disclosure by reporting it privately to us before any public disclosure. We appreciate the security research community's help in keeping our Platform secure.

10.5 LAST UPDATED
These Terms of Service were last updated on March 2026. Continued use of the Platform after updates constitutes acceptance of the revised terms. We recommend checking this page periodically for changes.

ACKNOWLEDGMENT: BY USING REAPER SECURITY, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE IN THEIR ENTIRETY, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE, YOU MUST IMMEDIATELY DISCONTINUE USE OF THE PLATFORM.`
  }
];

export default function Legal() {
  const [openSections, setOpenSections] = useState({ acceptance: true });

  useEffect(() => {
    localStorage.setItem('reaper_legal_seen', '1');
  }, []);

  const toggle = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    sections.forEach(s => { all[s.id] = true; });
    setOpenSections(all);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono px-4 py-2 rounded-full mb-4">
            <Scale className="w-3.5 h-3.5" />
            LEGAL DOCUMENTATION — BINDING AGREEMENT
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Terms of Service & Legal Disclaimer</h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
            This document constitutes a legally binding agreement governing your use of the Reaper Security platform. 
            Read all sections carefully before using any tools, content, or services.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
            <span>Last updated: March 2026</span>
            <span className="w-1 h-1 rounded-full bg-gray-700 inline-block" />
            <span>~2,800 words</span>
          </div>
        </motion.div>

        {/* Warning banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-red-500/5 border border-red-500/30 rounded-xl p-5 mb-8 flex gap-4"
        >
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-400 font-bold text-sm mb-1">IMPORTANT LEGAL NOTICE</div>
            <p className="text-gray-400 text-sm leading-relaxed">
              All tools, techniques, and educational content on Reaper Security are provided strictly for <strong className="text-white">authorized, legal, and ethical security research</strong> only. 
              Unauthorized use of cybersecurity tools against systems you do not own or lack explicit written permission to test is a <strong className="text-white">federal crime</strong> under the 
              Computer Fraud and Abuse Act (18 U.S.C. § 1030) and equivalent laws worldwide, punishable by significant prison sentences and civil liability. 
              By using this platform, you accept full personal legal responsibility for all your actions.
            </p>
          </div>
        </motion.div>

        {/* Expand all */}
        <div className="flex justify-end mb-4">
          <button onClick={expandAll} className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2">
            Expand all sections
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#111]/80 border border-white/5 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/3 transition-colors"
              >
                <section.icon className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-white font-semibold text-sm flex-1">{section.title}</span>
                {openSections[section.id]
                  ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                }
              </button>
              {openSections[section.id] && (
                <div className="px-5 pb-5 border-t border-white/5">
                  <div className="pt-4 text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer acceptance */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-10 bg-[#111]/80 border border-green-500/20 rounded-xl p-6 text-center"
        >
          <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <div className="text-white font-bold mb-2">By Using Reaper Security, You Agree to These Terms</div>
          <p className="text-gray-500 text-xs leading-relaxed max-w-lg mx-auto">
            Your continued use of this platform constitutes acceptance of all terms and conditions described above. 
            These terms are enforceable under applicable law. Use this platform responsibly, ethically, and legally.
          </p>
        </motion.div>

      </div>
    </div>
  );
}