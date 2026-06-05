import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from './types';

// ==========================================
// 1. React-PDF Stylesheet
// ==========================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.45,
    color: '#2d3748', // Charcoal
  },
  header: {
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5', // Indigo Accent
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'medium',
    color: '#4a5568',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 8.5,
    color: '#718096',
    gap: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 3,
    marginBottom: 8,
    marginTop: 14,
  },
  summary: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  jobBlock: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  jobTitle: {
    fontWeight: 'bold',
    color: '#1a202c',
    fontSize: 10.5,
  },
  jobCompany: {
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    color: '#718096',
    marginBottom: 4,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletSign: {
    width: 6,
    color: '#4f46e5',
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  skillItem: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8.5,
  },
  eduBlock: {
    marginBottom: 8,
  },
  eduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: 10,
  },
});

// ==========================================
// 2. React-PDF Document Component
// ==========================================
export const ModernPDF: React.FC<TemplateProps> = ({ data }) => {
  const {
    personalInfo,
    professionalSummary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    languages,
    interests,
    sectionOrder,
  } = data;

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        return professionalSummary ? (
          <View key="summary" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Summary</Text>
            <Text style={pdfStyles.summary}>{professionalSummary}</Text>
          </View>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <View key="skills" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Key Expertise</Text>
            <View style={pdfStyles.skillsContainer}>
              {skills.map((skill, idx) => (
                <View key={idx} style={pdfStyles.skillItem}>
                  <Text>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null;

      case 'experience':
        return experience && experience.length > 0 ? (
          <View key="experience" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Work History</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={pdfStyles.jobBlock}>
                <View style={pdfStyles.jobHeader}>
                  <Text style={pdfStyles.jobTitle}>{exp.position}</Text>
                  <Text style={pdfStyles.jobCompany}>{exp.company}</Text>
                </View>
                <View style={pdfStyles.jobMeta}>
                  <Text>{exp.location}</Text>
                  <Text>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </Text>
                </View>
                {exp.description.map((bullet, idx) => (
                  <View key={idx} style={pdfStyles.bulletPoint}>
                    <Text style={pdfStyles.bulletSign}>›</Text>
                    <Text style={pdfStyles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null;

      case 'education':
        return education && education.length > 0 ? (
          <View key="education" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={pdfStyles.eduBlock}>
                <View style={pdfStyles.eduHeader}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {edu.degree} in {edu.fieldOfStudy}
                  </Text>
                  <Text style={{ color: '#4f46e5' }}>{edu.institution}</Text>
                </View>
                <View style={pdfStyles.jobMeta}>
                  <Text>{edu.location} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</Text>
                  <Text>
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null;

      case 'projects':
        return projects && projects.length > 0 ? (
          <View key="projects" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Featured Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={pdfStyles.jobBlock}>
                <View style={pdfStyles.jobHeader}>
                  <Text style={pdfStyles.jobTitle}>{proj.name}</Text>
                  <Text style={{ fontSize: 9, color: '#718096' }}>
                    {proj.startDate} - {proj.endDate}
                  </Text>
                </View>
                <Text style={{ fontSize: 8.5, color: '#718096', marginBottom: 2 }}>
                  Role: {proj.role} {proj.url ? `| Link: ${proj.url}` : ''}
                </Text>
                {proj.description.map((bullet, idx) => (
                  <View key={idx} style={pdfStyles.bulletPoint}>
                    <Text style={pdfStyles.bulletSign}>›</Text>
                    <Text style={pdfStyles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null;

      case 'certifications':
        const filteredCerts = certifications?.filter((c) => c.showInResume) || [];
        return filteredCerts.length > 0 ? (
          <View key="certifications" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Certificates</Text>
            {filteredCerts.map((cert) => (
              <View key={cert.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {cert.name} <Text style={{ fontStyle: 'italic', fontWeight: 'normal', color: '#718096' }}>({cert.issuer})</Text>
                </Text>
                <Text style={{ fontSize: 8.5, color: '#718096' }}>{cert.issueDate}</Text>
              </View>
            ))}
          </View>
        ) : null;

      case 'achievements':
        return achievements && achievements.length > 0 ? (
          <View key="achievements" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Key Milestones</Text>
            {achievements.map((ach, idx) => (
              <View key={idx} style={pdfStyles.bulletPoint}>
                <Text style={pdfStyles.bulletSign}>›</Text>
                <Text style={pdfStyles.bulletText}>{ach}</Text>
              </View>
            ))}
          </View>
        ) : null;

      case 'languages':
        return languages && languages.length > 0 ? (
          <View key="languages" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Languages</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {languages.map((lang, idx) => (
                <Text key={idx} style={{ fontSize: 9 }}>
                  <Text style={{ fontWeight: 'bold', color: '#4f46e5' }}>{lang.language}:</Text> {lang.proficiency}
                </Text>
              ))}
            </View>
          </View>
        ) : null;

      case 'interests':
        return interests && interests.length > 0 ? (
          <View key="interests" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Interests</Text>
            <Text style={{ fontSize: 9, color: '#4a5568' }}>{interests.join(', ')}</Text>
          </View>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.name}>{personalInfo.fullName}</Text>
          {personalInfo.professionalTitle ? (
            <Text style={pdfStyles.title}>{personalInfo.professionalTitle}</Text>
          ) : null}
          <View style={pdfStyles.contactRow}>
            {personalInfo.email && <Text>{personalInfo.email}</Text>}
            {personalInfo.phone && <Text>• {personalInfo.phone}</Text>}
            {personalInfo.location && <Text>• {personalInfo.location}</Text>}
            {personalInfo.linkedIn && <Text>• {personalInfo.linkedIn}</Text>}
            {personalInfo.gitHub && <Text>• {personalInfo.gitHub}</Text>}
            {personalInfo.portfolio && <Text>• {personalInfo.portfolio}</Text>}
          </View>
        </View>

        {sectionOrder.map((key) => renderSection(key))}
      </Page>
    </Document>
  );
};

// ==========================================
// 3. React HTML Preview Component
// ==========================================
export const ModernPreview: React.FC<TemplateProps> = ({ data }) => {
  const {
    personalInfo,
    professionalSummary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    languages,
    interests,
    sectionOrder,
  } = data;

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        return professionalSummary ? (
          <div key="summary" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">{professionalSummary}</p>
          </div>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <div key="skills" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Key Expertise
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50/70 text-blue-800 text-[10px] px-2.5 py-0.5 rounded font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case 'experience':
        return experience && experience.length > 0 ? (
          <div key="experience" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Work History
            </h3>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline font-medium text-xs">
                  <span className="font-bold text-slate-900">{exp.position}</span>
                  <span className="font-bold text-indigo-600">{exp.company}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10px] text-slate-500 mb-1.5">
                  <span>{exp.location}</span>
                  <span>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <ul className="space-y-1 pl-2">
                  {exp.description.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-700 text-justify relative pl-3">
                      <span className="absolute left-0 top-1 text-indigo-500 font-bold text-[9px]">›</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null;

      case 'education':
        return education && education.length > 0 ? (
          <div key="education" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Education
            </h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span>
                    {edu.degree} in {edu.fieldOfStudy}
                  </span>
                  <span className="text-indigo-600">{edu.institution}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10px] text-slate-500">
                  <span>{edu.location} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</span>
                  <span>
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null;

      case 'projects':
        return projects && projects.length > 0 ? (
          <div key="projects" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Featured Projects
            </h3>
            {projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-slate-900 font-bold">{proj.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {proj.startDate} - {proj.endDate}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 italic mb-1">
                  Role: {proj.role} {proj.url ? `| Link: ${proj.url}` : ''}
                </div>
                <ul className="space-y-1 pl-2">
                  {proj.description.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-700 text-justify relative pl-3">
                      <span className="absolute left-0 top-1 text-indigo-500 font-bold text-[9px]">›</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null;

      case 'certifications':
        const filteredCerts = certifications?.filter((c) => c.showInResume) || [];
        return filteredCerts.length > 0 ? (
          <div key="certifications" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Certificates
            </h3>
            <ul className="space-y-1 pl-1">
              {filteredCerts.map((cert) => (
                <li key={cert.id} className="flex justify-between text-xs text-slate-700">
                  <span>
                    <strong className="font-bold text-slate-800">{cert.name}</strong> – <span className="italic text-slate-500">({cert.issuer})</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{cert.issueDate}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'achievements':
        return achievements && achievements.length > 0 ? (
          <div key="achievements" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Key Milestones
            </h3>
            <ul className="space-y-1 pl-2">
              {achievements.map((ach, idx) => (
                <li key={idx} className="text-xs text-slate-700 text-justify relative pl-3">
                  <span className="absolute left-0 top-1 text-indigo-500 font-bold text-[9px]">›</span>
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'languages':
        return languages && languages.length > 0 ? (
          <div key="languages" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Languages
            </h3>
            <div className="flex gap-4">
              {languages.map((lang, idx) => (
                <span key={idx} className="text-xs text-slate-700">
                  <strong className="font-semibold text-indigo-600">{lang.language}:</strong> {lang.proficiency}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case 'interests':
        return interests && interests.length > 0 ? (
          <div key="interests" className="mb-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-slate-100 pb-1 mb-2">
              Interests
            </h3>
            <p className="text-xs text-slate-700">{interests.join(', ')}</p>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white text-slate-800 p-8 shadow-md rounded-lg max-w-[21cm] min-h-[29.7cm] mx-auto text-left border border-slate-200">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-indigo-600 tracking-tight mb-1">
          {personalInfo.fullName}
        </h2>
        {personalInfo.professionalTitle && (
          <p className="text-sm font-medium text-slate-600 mb-2">{personalInfo.professionalTitle}</p>
        )}
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 mt-2">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.linkedIn && <span>• {personalInfo.linkedIn}</span>}
          {personalInfo.gitHub && <span>• {personalInfo.gitHub}</span>}
          {personalInfo.portfolio && <span>• {personalInfo.portfolio}</span>}
        </div>
      </div>

      <div className="border-b border-indigo-100 my-4" />

      {sectionOrder.map((key) => renderSection(key))}
    </div>
  );
};
