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
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#444444',
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  title: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 8,
    color: '#888888',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111111',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    paddingBottom: 2,
    marginBottom: 6,
    marginTop: 10,
  },
  summary: {
    marginBottom: 6,
    textAlign: 'justify',
    fontSize: 9,
  },
  jobBlock: {
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  jobTitle: {
    fontWeight: 'bold',
    color: '#111111',
  },
  jobCompany: {
    fontWeight: 'bold',
    color: '#555555',
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#888888',
    marginBottom: 2,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 1,
    paddingLeft: 6,
  },
  bulletSign: {
    width: 6,
    color: '#888888',
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
    fontSize: 8.5,
  },
  skillsList: {
    fontSize: 8.5,
    marginBottom: 6,
    lineHeight: 1.5,
  },
  eduBlock: {
    marginBottom: 6,
  },
  eduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
  },
});

// ==========================================
// 2. React-PDF Document Component
// ==========================================
export const MinimalPDF: React.FC<TemplateProps> = ({ data }) => {
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
          <View key="summary" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Summary</Text>
            <Text style={pdfStyles.summary}>{professionalSummary}</Text>
          </View>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <View key="skills" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Expertise</Text>
            <Text style={pdfStyles.skillsList}>{skills.join('  •  ')}</Text>
          </View>
        ) : null;

      case 'experience':
        return experience && experience.length > 0 ? (
          <View key="experience" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Experience</Text>
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
                    <Text style={pdfStyles.bulletSign}>-</Text>
                    <Text style={pdfStyles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null;

      case 'education':
        return education && education.length > 0 ? (
          <View key="education" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={pdfStyles.eduBlock}>
                <View style={pdfStyles.eduHeader}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {edu.degree} in {edu.fieldOfStudy}
                  </Text>
                  <Text style={{ color: '#333' }}>{edu.institution}</Text>
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
          <View key="projects" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={pdfStyles.jobBlock}>
                <View style={pdfStyles.jobHeader}>
                  <Text style={pdfStyles.jobTitle}>{proj.name}</Text>
                  <Text style={{ fontSize: 8, color: '#888888' }}>
                    {proj.startDate} - {proj.endDate}
                  </Text>
                </View>
                <Text style={{ fontSize: 8, color: '#666', marginBottom: 2 }}>
                  Role: {proj.role} {proj.url ? `| Link: ${proj.url}` : ''}
                </Text>
                {proj.description.map((bullet, idx) => (
                  <View key={idx} style={pdfStyles.bulletPoint}>
                    <Text style={pdfStyles.bulletSign}>-</Text>
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
          <View key="certifications" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Certifications</Text>
            {filteredCerts.map((cert) => (
              <View key={cert.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {cert.name} <Text style={{ fontStyle: 'italic', fontWeight: 'normal', color: '#888' }}>({cert.issuer})</Text>
                </Text>
                <Text style={{ fontSize: 8, color: '#888' }}>{cert.issueDate}</Text>
              </View>
            ))}
          </View>
        ) : null;

      case 'achievements':
        return achievements && achievements.length > 0 ? (
          <View key="achievements" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Achievements</Text>
            {achievements.map((ach, idx) => (
              <View key={idx} style={pdfStyles.bulletPoint}>
                <Text style={pdfStyles.bulletSign}>-</Text>
                <Text style={pdfStyles.bulletText}>{ach}</Text>
              </View>
            ))}
          </View>
        ) : null;

      case 'languages':
        return languages && languages.length > 0 ? (
          <View key="languages" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Languages</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {languages.map((lang, idx) => (
                <Text key={idx} style={{ fontSize: 8.5 }}>
                  <Text style={{ fontWeight: 'bold' }}>{lang.language}:</Text> {lang.proficiency}
                </Text>
              ))}
            </View>
          </View>
        ) : null;

      case 'interests':
        return interests && interests.length > 0 ? (
          <View key="interests" style={{ marginBottom: 4 }}>
            <Text style={pdfStyles.sectionTitle}>Interests</Text>
            <Text style={{ fontSize: 8.5, color: '#666' }}>{interests.join(', ')}</Text>
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
            {personalInfo.phone && <Text>· {personalInfo.phone}</Text>}
            {personalInfo.location && <Text>· {personalInfo.location}</Text>}
            {personalInfo.linkedIn && <Text>· {personalInfo.linkedIn}</Text>}
            {personalInfo.gitHub && <Text>· {personalInfo.gitHub}</Text>}
            {personalInfo.portfolio && <Text>· {personalInfo.portfolio}</Text>}
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
export const MinimalPreview: React.FC<TemplateProps> = ({ data }) => {
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
          <div key="summary" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Summary
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed text-justify">{professionalSummary}</p>
          </div>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <div key="skills" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Expertise
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {skills.join('   •   ')}
            </p>
          </div>
        ) : null;

      case 'experience':
        return experience && experience.length > 0 ? (
          <div key="experience" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Experience
            </h3>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline font-medium text-xs">
                  <span className="font-bold text-slate-900">{exp.position}</span>
                  <span className="font-bold text-slate-700">{exp.company}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10px] text-slate-400 mb-1">
                  <span>{exp.location}</span>
                  <span>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <ul className="space-y-0.5 pl-2">
                  {exp.description.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-600 text-justify relative pl-3">
                      <span className="absolute left-0 top-0.5 text-slate-400 font-bold">-</span>
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
          <div key="education" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Education
            </h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span>
                    {edu.degree} in {edu.fieldOfStudy}
                  </span>
                  <span>{edu.institution}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10px] text-slate-400">
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
          <div key="projects" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Projects
            </h3>
            {projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-slate-900 font-bold">{proj.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {proj.startDate} - {proj.endDate}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mb-1">
                  Role: {proj.role} {proj.url ? `| Link: ${proj.url}` : ''}
                </div>
                <ul className="space-y-0.5 pl-2">
                  {proj.description.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-600 text-justify relative pl-3">
                      <span className="absolute left-0 top-0.5 text-slate-400 -ml-1">-</span>
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
          <div key="certifications" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Certifications
            </h3>
            <ul className="space-y-1 pl-1">
              {filteredCerts.map((cert) => (
                <li key={cert.id} className="flex justify-between text-xs text-slate-700">
                  <span>
                    <strong className="font-bold text-slate-800">{cert.name}</strong> – <span className="italic text-slate-500">({cert.issuer})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{cert.issueDate}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'achievements':
        return achievements && achievements.length > 0 ? (
          <div key="achievements" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Achievements
            </h3>
            <ul className="space-y-0.5 pl-2">
              {achievements.map((ach, idx) => (
                <li key={idx} className="text-xs text-slate-600 text-justify relative pl-3">
                  <span className="absolute left-0 top-0.5 text-slate-400 -ml-1">-</span>
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'languages':
        return languages && languages.length > 0 ? (
          <div key="languages" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Languages
            </h3>
            <div className="flex gap-4">
              {languages.map((lang, idx) => (
                <span key={idx} className="text-xs text-slate-600">
                  <strong className="font-semibold text-slate-800">{lang.language}:</strong> {lang.proficiency}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case 'interests':
        return interests && interests.length > 0 ? (
          <div key="interests" className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
              Interests
            </h3>
            <p className="text-xs text-slate-600">{interests.join(', ')}</p>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white text-slate-700 p-8 shadow-md rounded-lg max-w-[21cm] min-h-[29.7cm] mx-auto text-left border border-slate-100">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-0.5">
          {personalInfo.fullName}
        </h2>
        {personalInfo.professionalTitle && (
          <p className="text-xs text-slate-500 mb-2">{personalInfo.professionalTitle}</p>
        )}
        <div className="flex flex-wrap gap-2 text-[9px] text-slate-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>· {personalInfo.phone}</span>}
          {personalInfo.location && <span>· {personalInfo.location}</span>}
          {personalInfo.linkedIn && <span>· {personalInfo.linkedIn}</span>}
          {personalInfo.gitHub && <span>· {personalInfo.gitHub}</span>}
          {personalInfo.portfolio && <span>· {personalInfo.portfolio}</span>}
        </div>
      </div>

      <div className="border-b border-slate-100 my-3" />

      {sectionOrder.map((key) => renderSection(key))}
    </div>
  );
};
