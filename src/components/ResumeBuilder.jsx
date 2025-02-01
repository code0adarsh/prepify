import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { generateContent } from '../utils/gemini';
import './ResumeBuilder.css';

export default function ResumeBuilder() {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      linkedin: ''
    },
    education: '',
    skills: '',
    workExperience: '',
    projects: '',
    certificates: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState('');
  const [generated, setGenerated] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  // Update live preview locally without waiting on AI if you wanna see your info instantly
  const generateLocalPreview = () => {
    return `
      ${resumeData.personalInfo.name || 'Your Name'}
Email: ${resumeData.personalInfo.email || 'you@example.com'}   Phone: ${resumeData.personalInfo.phone || '123-456-7890'}
LinkedIn: ${resumeData.personalInfo.linkedin || 'linkedin.com/in/yourprofile'}

EDUCATION ---------------------------
${resumeData.education || 'Your education details here.'}

SKILLS ---------------------------
${resumeData.skills || 'Your skills here, separated by commas.'}

WORK EXPERIENCE ---------------------------
${resumeData.workExperience || 'Your work experience details here.'}

PROJECTS ---------------------------
${resumeData.projects || 'Your projects details here.'}

CERTIFICATES ---------------------------
${resumeData.certificates || 'Your certificates details here.'}
    `;
  };

  // Handle input changes for top-level fields and nested personal info
  const handleInputChange = (section, field, value) => {
    if (section === 'personalInfo') {
      setResumeData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value }
      }));
    } else {
      setResumeData(prev => ({
        ...prev,
        [section]: value
      }));
    }
  };

  // Generate AI-tailored preview (final resume content)
  const generateAiPreview = async () => {
    setLoading(true);
    try {
      const prompt = `
Create a professional, ATS-friendly resume using the following details. 
Format it in plain text with clear section headers and bullet points where needed.

PERSONAL INFORMATION:
Name: ${resumeData.personalInfo.name}
Email: ${resumeData.personalInfo.email}
Phone: ${resumeData.personalInfo.phone}
LinkedIn: ${resumeData.personalInfo.linkedin}

EDUCATION:
${resumeData.education}

SKILLS:
${resumeData.skills}

WORK EXPERIENCE:
${resumeData.workExperience}

PROJECTS:
${resumeData.projects}

CERTIFICATES:
${resumeData.certificates}

Use a modern, clean layout similar to top resume builders.
`;
      const aiContent = await generateContent(prompt);
      setAiPreview(aiContent);
      setGenerated(true);
    } catch (error) {
      console.error("Error generating AI preview:", error);
    }
    setLoading(false);
  };

  // Download DOCX using the final AI preview content (fallback to local preview if AI preview isn't generated)
  const downloadResume = async () => {
    const content = aiPreview || generateLocalPreview();
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: content.split('\n').map(line => new Paragraph({
            children: [new TextRun(line)]
          }))
        }]
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "Prepify_Resume.docx");
    } catch (error) {
      console.error("Error generating DOCX:", error);
    }
  };

  // Optionally, you could allow template selection (for future expansion)
  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
  };

  // Use effect to update live preview instantly if no AI preview is generated
  const localPreview = generateLocalPreview();

  return (
    <div className="resume-builder-container">
      <h1>Resume Builder</h1>
      <div className="resume-builder-content">
        <div className="form-container">
          <div className="form-section">
            <h2>Personal Information</h2>
            <input
              type="text"
              placeholder="Name"
              value={resumeData.personalInfo.name}
              onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={resumeData.personalInfo.email}
              onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone"
              value={resumeData.personalInfo.phone}
              onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            />
            <input
              type="text"
              placeholder="LinkedIn URL"
              value={resumeData.personalInfo.linkedin}
              onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
            />
          </div>
          <div className="form-section">
            <h2>Education</h2>
            <textarea
              placeholder="Enter your education details..."
              value={resumeData.education}
              onChange={(e) => handleInputChange('education', null, e.target.value)}
            />
          </div>
          <div className="form-section">
            <h2>Skills</h2>
            <textarea
              placeholder="Enter your skills (comma separated)..."
              value={resumeData.skills}
              onChange={(e) => handleInputChange('skills', null, e.target.value)}
            />
          </div>
          <div className="form-section">
            <h2>Work Experience</h2>
            <textarea
              placeholder="Enter your work experience details..."
              value={resumeData.workExperience}
              onChange={(e) => handleInputChange('workExperience', null, e.target.value)}
            />
          </div>
          <div className="form-section">
            <h2>Projects</h2>
            <textarea
              placeholder="Enter your projects details..."
              value={resumeData.projects}
              onChange={(e) => handleInputChange('projects', null, e.target.value)}
            />
          </div>
          <div className="form-section">
            <h2>Certificates</h2>
            <textarea
              placeholder="Enter your certificates details..."
              value={resumeData.certificates}
              onChange={(e) => handleInputChange('certificates', null, e.target.value)}
            />
          </div>
          <div className="template-selection">
            <label>Select Template:</label>
            <select value={selectedTemplate} onChange={handleTemplateChange}>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
            </select>
          </div>
          <div className="button-group">
            <button onClick={generateAiPreview} disabled={loading}>
              {loading ? "Generating AI Preview..." : "Generate Final Preview"}
            </button>
            <button onClick={downloadResume}>Download DOCX</button>
          </div>
        </div>
        <div className="preview-container">
          <h2>Resume Preview</h2>
          <div className="preview-content">
            {generated ? (
              aiPreview.split('\n').map((line, index) => <p key={index}>{line}</p>)
            ) : (
              localPreview.split('\n').map((line, index) => <p key={index}>{line}</p>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
