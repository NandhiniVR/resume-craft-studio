import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { TemplateProps } from './types';

// ==========================================
// 1. React-PDF Stylesheet
// ==========================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Times-Roman', // Elegant Georgia/Times-Roman fallback
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 15,
    textAlign: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50', // Charcoal/Navy
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    fontSize: 8.5,
    color: '#666',
    gap: 8,
  },
  dividerDouble: {
    borderTopWidth: 1.5,
    borderTopColor: '#2c3e50',
    borderBottomWidth: 0.5,
    borderBottomColor: '#2c3e50',
    height: 3,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'uppercase',
    letterSpacing: 0.75,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
    paddingBottom: 2,
    marginBottom: 6,
    marginTop: 12,
  },
  summary: {
    marginBottom: 8,
    textAlign: 'justify',
    fontStyle: 'italic',
  },
  jobBlock: {
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
  },
  jobTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    color: '#555555',
    marginBottom: 3,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 10,
  },
  bulletSign: {
    width: 8,
    color: '#2c3e50',
  },
  bulletText: {
    flex: 1,
    textAlign: 'justify',
  },
  skillsList: {
    fontSize: 9,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 1.4,
  },
});

// ==========================================
// 2. React-PDF Document Component
// ==========================================
export const ExecutivePDF: React.FC<TemplateProps> = ({ data }) => {
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
            <Text style={pdfStyles.sectionTitle}>Executive Summary</Text>
            <Text style={pdfStyles.summary}>{professionalSummary}</Text>
          </View>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <View key="skills" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Areas of Expertise</Text>
            <Text style={pdfStyles.skillsList}>{skills.join('  |  ')}</Text>
          </View>
        ) : null;

      case 'experience':
        return experience && experience.length > 0 ? (
          <View key="experience" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={pdfStyles.jobBlock}>
                <View style={pdfStyles.jobHeader}>
                  <Text style={pdfStyles.jobTitle}>{exp.position}</Text>
                  <Text style={{ fontWeight: 'bold' }}>{exp.company}</Text>
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
          <View key="education" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }}>
                <View style={pdfStyles.jobHeader}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {edu.degree} in {edu.fieldOfStudy}
                  </Text>
                  <Text>{edu.institution}</Text>
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
            <Text style={pdfStyles.sectionTitle}>Key Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={pdfStyles.jobBlock}>
                <View style={pdfStyles.jobHeader}>
                  <Text style={pdfStyles.jobTitle}>{proj.name}</Text>
                  <Text style={{ fontSize: 8.5, color: '#555' }}>
                    {proj.startDate} - {proj.endDate}
                  </Text>
                </View>
                <Text style={{ fontSize: 8.5, color: '#555', fontStyle: 'italic', marginBottom: 2 }}>
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
          <View key="certifications" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Certifications</Text>
            {filteredCerts.map((cert) => (
              <View key={cert.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {cert.name} <Text style={{ fontStyle: 'italic', fontWeight: 'normal', color: '#555' }}>({cert.issuer})</Text>
                </Text>
                <Text style={{ fontSize: 8.5, color: '#555' }}>{cert.issueDate}</Text>
              </View>
            ))}
          </View>
        ) : null;

      case 'achievements':
        return achievements && achievements.length > 0 ? (
          <View key="achievements" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Honors & Achievements</Text>
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
          <View key="languages" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Languages</Text>
            <View style={{ flexDirection: 'row', gap: 15, justifyContent: 'center' }}>
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
          <View key="interests" style={{ marginBottom: 6 }}>
            <Text style={pdfStyles.sectionTitle}>Interests</Text>
            <Text style={{ fontSize: 9, color: '#555', textAlign: 'center' }}>{interests.join(', ')}</Text>
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

        <View style={pdfStyles.dividerDouble} />

        {sectionOrder.map((key) => renderSection(key))}
      </Page>
    </Document>
  );
};

// ==========================================
// 3. React HTML Preview Component
// ==========================================
export const ExecutivePreview: React.FC<TemplateProps> = ({ data }) => {
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 font-serif">
              Executive Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify italic font-serif">
              {professionalSummary}
            </p>
          </div>
        ) : null;

      case 'skills':
        return skills && skills.length > 0 ? (
          <div key="skills" className="mb-4 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 text-left font-serif">
              Areas of Expertise
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-serif">
              {skills.join('   |   ')}
            </p>
          </div>
        ) : null;

      case 'experience':
        return experience && experience.length > 0 ? (
          <div key="experience" className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 font-serif">
              Professional Experience
            </h3>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline font-medium text-xs font-serif">
                  <span className="font-bold text-slate-900">{exp.position}</span>
                  <span className="font-bold text-slate-800">{exp.company}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10px] text-slate-500 mb-1.5 font-serif italic">
                  <span>{exp.location}</span>
                  <span>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {exp.description.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-700 text-justify font-serif">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 font-serif">
              Education
            </h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between items-baseline text-xs font-semibold font-serif">
                  <span>
                    {edu.degree} in {edu.fieldOfStudy}
                  </span>
                  <span>{edu.institution}</span>
                </div>
                <div className="flex justify-between items-baseline text-[10px] text-slate-500 font-serif">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 font-serif">
              Key Projects
            </h3>
            {projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex justify-between items-baseline text-xs font-semibold font-serif">
                  <span className="text-slate-900 font-bold">{proj.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {proj.startDate} - {proj.endDate}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 italic mb-1 font-serif">
                  Role: {proj.role} {proj.url ? `| Link: ${proj.url}` : ''}
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {proj.description.map((bullet, idx) => (
                    <li key={idx} className="text-xs text-slate-700 text-justify font-serif">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 font-serif">
              Certifications
            </h3>
            <ul className="space-y-1 pl-1 font-serif">
              {filteredCerts.map((cert) => (
                <li key={cert.id} className="flex justify-between text-xs text-slate-700">
                  <span>
                    <strong className="font-bold text-slate-800">{cert.name}</strong> – <span className="italic text-slate-500">{cert.issuer}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{cert.issueDate}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'achievements':
        return achievements && achievements.length > 0 ? (
          <div key="achievements" className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 font-serif">
              Honors & Achievements
            </h3>
            <ul className="list-disc pl-4 space-y-0.5">
              {achievements.map((ach, idx) => (
                <li key={idx} className="text-xs text-slate-700 text-justify font-serif">
                  {ach}
                </li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'languages':
        return languages && languages.length > 0 ? (
          <div key="languages" className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 font-serif">
              Languages
            </h3>
            <div className="flex gap-4 justify-center">
              {languages.map((lang, idx) => (
                <span key={idx} className="text-xs text-slate-700 font-serif">
                  <strong className="font-semibold text-slate-900">{lang.language}:</strong> {lang.proficiency}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case 'interests':
        return interests && interests.length > 0 ? (
          <div key="interests" className="mb-4 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-700 pb-0.5 mb-2 text-left font-serif">
              Interests
            </h3>
            <p className="text-xs text-slate-700 font-serif">{interests.join(', ')}</p>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white text-slate-850 p-8 shadow-md rounded-lg max-w-[21cm] min-h-[29.7cm] mx-auto text-left border border-slate-200 font-serif">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-wide mb-1 font-serif">
          {personalInfo.fullName}
        </h2>
        {personalInfo.professionalTitle && (
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-serif">
            {personalInfo.professionalTitle}
          </p>
        )}
        <div className="flex justify-center flex-wrap gap-2 text-[10px] text-slate-500 font-serif">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
          {personalInfo.linkedIn && <span>| {personalInfo.linkedIn}</span>}
          {personalInfo.gitHub && <span>| {personalInfo.gitHub}</span>}
          {personalInfo.portfolio && <span>| {personalInfo.portfolio}</span>}
        </div>
      </div>

      {/* Double Divider Line style */}
      <div className="border-t-2 border-slate-700 border-b-[0.5px] border-slate-700 h-[3px] my-3" />

      {sectionOrder.map((key) => renderSection(key))}
    </div>
  );
};
