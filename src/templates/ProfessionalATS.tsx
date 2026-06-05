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
    lineHeight: 1.4,
    color: '#333333',
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a365d', // Deep Navy
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    fontSize: 9,
    color: '#718096',
    gap: 8,
  },
  contactLink: {
    color: '#1a365d',
    textDecoration: 'none',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a365d',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#1a365d',
    paddingBottom: 2,
    marginBottom: 8,
    marginTop: 12,
  },
  summary: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  jobTitle: {
    fontWeight: 'bold',
    color: '#2d3748',
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#718096',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 10,
  },
  bulletSign: {
    width: 8,
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  skillBadge: {
    backgroundColor: '#f7fafc',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 9,
  },
  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
  },
  eduMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#718096',
    marginBottom: 5,
  },
});

// ==========================================
// 2. React-PDF Document Component
// ==========================================
export const ProfessionalPDF: React.FC<TemplateProps> = ({ data }) => {
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
          <View key="summary" style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.sectionTitle}>Professional Summary</Text>
            <Text style={pdfStyles.summary}>{professionalSummary}</Text>
          </View>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <View key="skills" style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.sectionTitle}>Skills</Text>
            <View style={pdfStyles.skillsGrid}>
              {skills.map((skill, index) => (
                <View key={index} style={pdfStyles.skillBadge}>
                  <Text>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null;

      case 'experience':
        return experience && experience.length > 0 ? (
          <View key="experience" style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 8 }}>
                <View style={pdfStyles.jobRow}>
                  <Text style={pdfStyles.jobTitle}>{exp.position}</Text>
                  <Text style={pdfStyles.jobTitle}>{exp.company}</Text>
                </View>
                <View style={pdfStyles.jobMeta}>
                  <Text>{exp.location}</Text>
                  <Text>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </Text>
                </View>
                {exp.description.map((bullet, idx) => (
                  <View key={idx} style={pdfStyles.bulletPoint}>
                    <Text style={pdfStyles.bulletSign}>•</Text>
                    <Text style={pdfStyles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null;

      case 'education':
        return education && education.length > 0 ? (
          <View key="education" style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={pdfStyles.eduRow}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {edu.degree} in {edu.fieldOfStudy}
                  </Text>
                  <Text>{edu.institution}</Text>
                </View>
                <View style={pdfStyles.eduMeta}>
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
          <View key="projects" style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 6 }}>
                <View style={pdfStyles.jobRow}>
                  <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>{proj.name}</Text>
                  <Text style={{ fontSize: 9, color: '#718096' }}>
                    {proj.startDate} - {proj.endDate}
                  </Text>
                </View>
                <Text style={{ fontSize: 9, color: '#4a5568', fontStyle: 'italic', marginBottom: 2 }}>
                  Role: {proj.role} {proj.url ? `| Link: ${proj.url}` : ''}
                </Text>
                {proj.description.map((bullet, idx) => (
                  <View key={idx} style={pdfStyles.bulletPoint}>
                    <Text style={pdfStyles.bulletSign}>•</Text>
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
          <View key="certifications" style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.sectionTitle}>Certifications</Text>
            {filteredCerts.map((cert) => (
              <View key={cert.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {cert.name} - <Text style={{ fontStyle: 'italic', fontWeight: 'normal' }}>{cert.issuer}</Text>
                </Text>
                <Text style={{ fontSize: 9, color: '#718096' }}>{cert.issueDate}</Text>
              </View>
            ))}
          </View>
        ) : null;

      case 'achievements':
        return achievements && achievements.length > 0 ? (
          <View key="achievements" style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.sectionTitle}>Achievements</Text>
            {achievements.map((ach, idx) => (
              <View key={idx} style={pdfStyles.bulletPoint}>
                <Text style={pdfStyles.bulletSign}>•</Text>
                <Text style={pdfStyles.bulletText}>{ach}</Text>
              </View>
            ))}
          </View>
        ) : null;

      case 'languages':
        return languages && languages.length > 0 ? (
          <View key="languages" style={{ marginBottom: 8 }}>
            <Text style={pdfStyles.sectionTitle}>Languages</Text>
            <View style={{ flexDirection: 'row', gap: 15, flexWrap: 'wrap' }}>
              {languages.map((lang, idx) => (
                <Text key={idx} style={{ fontSize: 9 }}>
                  <Text style={{ fontWeight: 'bold' }}>{lang.language}:</Text> {lang.proficiency}
                </Text>
              ))}
            </View>
          </View>
        ) : null;

      case 'interests':
        return interests && interests.length > 0 ? (
          <View key="interests" style={{ marginBottom: 8 }}>
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
            {personalInfo.phone && <Text>| {personalInfo.phone}</Text>}
            {personalInfo.location && <Text>| {personalInfo.location}</Text>}
            {personalInfo.linkedIn && <Text>| {personalInfo.linkedIn}</Text>}
            {personalInfo.gitHub && <Text>| {personalInfo.gitHub}</Text>}
            {personalInfo.portfolio && <Text>| {personalInfo.portfolio}</Text>}
          </View>
        </View>
        
        <View style={pdfStyles.divider} />

        {sectionOrder.map((key) => renderSection(key))}
      </Page>
    </Document>
  );
};

// ==========================================
// 3. React HTML Preview Component
// ==========================================
export const ProfessionalPreview: React.FC<TemplateProps> = ({ data }) => {
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
          <div key="summary" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
              Professional Summary
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed text-justify">{professionalSummary}</p>
          </div>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <div key="skills" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-slate-50 border border-slate-200 text-[10px] px-2 py-0.5 rounded text-slate-700 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case 'experience':
        return experience && experience.length > 0 ? (
          <div key="experience" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
              Professional Experience
            </h3>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline font-medium text-xs text-slate-800">
                  <span className="font-bold text-slate-900">{exp.position}</span>
                  <span className="font-bold text-slate-700">{exp.company}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10px] text-slate-500 italic mb-2">
                  <span>{exp.location}</span>
                  <span>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {exp.description.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-600 text-justify">
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
          <div key="education" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
              Education
            </h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-baseline text-xs font-semibold text-slate-800">
                  <span>
                    {edu.degree} in {edu.fieldOfStudy}
                  </span>
                  <span>{edu.institution}</span>
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
          <div key="projects" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
              Projects
            </h3>
            {projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-baseline text-xs font-semibold text-slate-800">
                  <span className="text-slate-900 font-bold">{proj.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {proj.startDate} - {proj.endDate}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 italic mb-1">
                  Role: {proj.role} {proj.url ? `| Link: ${proj.url}` : ''}
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {proj.description.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-600 text-justify">
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
          <div key="certifications" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
              Certifications
            </h3>
            <ul className="space-y-1 pl-1">
              {filteredCerts.map((cert) => (
                <li key={cert.id} className="flex justify-between text-xs text-slate-700">
                  <span>
                    <strong className="font-bold text-slate-800">{cert.name}</strong> – <span className="italic text-slate-600">{cert.issuer}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{cert.issueDate}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'achievements':
        return achievements && achievements.length > 0 ? (
          <div key="achievements" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
              Achievements
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              {achievements.map((ach, idx) => (
                <li key={idx} className="text-xs text-slate-600 text-justify">
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'languages':
        return languages && languages.length > 0 ? (
          <div key="languages" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
              Languages
            </h3>
            <div className="flex gap-4 flex-wrap">
              {languages.map((lang, idx) => (
                <span key={idx} className="text-xs text-slate-700">
                  <strong className="font-semibold text-slate-900">{lang.language}:</strong> {lang.proficiency}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case 'interests':
        return interests && interests.length > 0 ? (
          <div key="interests" className="mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-1 mb-2">
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
    <div className="bg-white text-slate-800 p-8 shadow-md rounded-lg max-w-[21cm] min-h-[29.7cm] mx-auto text-left border border-slate-200">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900 mb-1">
          {personalInfo.fullName}
        </h2>
        {personalInfo.professionalTitle && (
          <p className="text-sm text-slate-600 italic mb-2">{personalInfo.professionalTitle}</p>
        )}
        <div className="flex justify-center flex-wrap gap-2 text-[10px] text-slate-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
          {personalInfo.linkedIn && <span>| {personalInfo.linkedIn}</span>}
          {personalInfo.gitHub && <span>| {personalInfo.gitHub}</span>}
          {personalInfo.portfolio && <span>| {personalInfo.portfolio}</span>}
        </div>
      </div>

      <div className="border-b border-slate-300 my-4" />

      {sectionOrder.map((key) => renderSection(key))}
    </div>
  );
};
