import React, { useState, useEffect } from 'react';
import StudentHeader from '../components/StudentHeader';
import StudentFooter from '../components/StudentFooter';
import { motion } from 'framer-motion';
import { FaBell, FaDownload, FaEye, FaLock, FaUserEdit, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import EditProfileModal from '../components/EditProfileModal';
import '../components/EditProfileModal.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import MFAToggle from '../components/MFAToggle';
import useAuth from '../hooks/useAuth';
import { getToken as getAuthToken } from '../utils/auth';

export default function StudentProfile() {
  const { user, loading } = useAuth('student');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({ grades: true, assignments: true, announcements: true });
  const [privacy, setPrivacy] = useState({ publicProfile: false, leaderboard: true });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
    location: '',
    phone: '',
    bio: '',
    university: '',
    major: '',
    graduationYear: '',
    degree: '',
    skills: [],
    socialMedia: {
      website: '',
      linkedin: '',
      github: '',
      twitter: ''
    }
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [progressSummary, setProgressSummary] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableProfileData, setEditableProfileData] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (!loading) {
      // Fetch profile data on mount
      (async () => {
        try {
          const token = getAuthToken();
          if (!token) return;
          
          const res = await axios.get('/api/student/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data) {
            setProfileData(res.data);
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
          
          // In development, generate some mock data if API fails
          if (process.env.NODE_ENV === 'development') {
            const mockData = {
              name: user?.name || 'Student Name',
              email: user?.email || 'student@example.com',
              avatar: 'https://source.unsplash.com/random/200x200/?portrait',
              location: 'Lahore, Pakistan',
              phone: '+92 300 1234567',
              bio: 'Learning enthusiast interested in web development and data science.',
              university: 'Virtual University',
              major: 'Computer Science',
              graduationYear: '2024',
              degree: 'BS',
              skills: ['JavaScript', 'React', 'Node.js', 'Python'],
              socialMedia: {
                website: 'https://example.com',
                linkedin: 'https://linkedin.com/in/username',
                github: 'https://github.com/username',
                twitter: 'https://twitter.com/username'
              }
            };
            setProfileData(mockData);
          }
        }
      })();
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading) {
      (async () => {
        try {
          const token = getAuthToken();
          if (!token) return;
          
          const res = await axios.get('/api/student/progress', { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          setProgressSummary(res.data);
          setCompletedCourses(res.data.filter(c => c.percent === 100));
          setEnrolledCourses(res.data.filter(c => c.percent < 100));
        } catch (err) {
          console.error('Error fetching progress data:', err);
          
          // In development, use mock data
          if (process.env.NODE_ENV === 'development') {
            const mockProgress = [
              { id: 1, title: 'React Fundamentals', percent: 100, badge: 'React Developer' },
              { id: 2, title: 'Node.js API Development', percent: 75 },
              { id: 3, title: 'CSS Animations', percent: 30 }
            ];
            setProgressSummary(mockProgress);
            setCompletedCourses(mockProgress.filter(c => c.percent === 100));
            setEnrolledCourses(mockProgress.filter(c => c.percent < 100));
          } else {
            setProgressSummary([]);
            setCompletedCourses([]);
            setEnrolledCourses([]);
          }
        }
      })();
    }
  }, [loading]);

  // Dummy handlers
  const handleNotificationChange = (e) => {
    setNotificationPrefs({ ...notificationPrefs, [e.target.name]: e.target.checked });
  };
  const handlePrivacyChange = (e) => {
    setPrivacy({ ...privacy, [e.target.name]: e.target.checked });
  };
  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    
  };
  const handleDownload = () => {
    // Generate a PDF academic report
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Academic Transcript', 14, 18);
    doc.setFontSize(13);
    if (profileData) {
      doc.text(`Name: ${profileData.name}`, 14, 30);
      doc.text(`Email: ${profileData.email}`, 14, 38);
      doc.text(`Enrollment #: ${profileData.enrollmentNumber}`, 14, 46);
      doc.text(`Program: ${profileData.program}`, 14, 54);
    }
    doc.setFontSize(15);
    doc.text('Completed Courses', 14, 70);
    autoTable(doc, {
      startY: 75,
      head: [['Course Title', 'Badge/Certificate']],
      body: completedCourses.map(c => [c.title, c.badge || '']),
    });
    doc.setFontSize(15);
    doc.text('Enrolled Courses', 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 100);
    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 105,
      head: [['Course Title', 'Progress']],
      body: enrolledCourses.map(c => [c.title, `${c.percent}%`]),
    });
    doc.save('Academic_Transcript.pdf');
  };

  const handleEdit = () => {
    setEditableProfileData({
      ...profileData
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      const token = getAuthToken();
      if (!token) {
        setSaveStatus('failed');
        return;
      }
      
      await axios.put('/api/student/profile', editableProfileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(editableProfileData);
      setEditMode(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving profile data:', error);
      setSaveStatus('failed');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditableProfileData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditableProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditableProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setEditableProfileData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skillInput.trim()]
    }));
    setSkillInput('');
  };

  const removeSkill = (index) => {
    setEditableProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="profile-container">
        <StudentHeader minimal={false} showPrevious={true} />
        <div className="profile-loading">Loading profile...</div>
        <StudentFooter />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <StudentHeader minimal={false} showPrevious={true} />
      <main className="profile-content">
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #23252622', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <img src={profileData.avatar} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #43cea2', background: '#e3e6f3' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#185a9d' }}>{profileData && profileData.name}</div>
              <div style={{ color: '#888', fontSize: 15 }}>{profileData && profileData.email}</div>
              <div style={{ color: '#43cea2', fontSize: 14, marginTop: 6 }}>Enrollment #: {profileData && profileData.enrollmentNumber}</div>
              <div style={{ color: '#888', fontSize: 14 }}>{profileData && profileData.program}</div>
            </div>
            <button style={{ background: 'linear-gradient(90deg, #43cea2 0%, #00bfff 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
              onClick={handleEdit}
            >
              <FaUserEdit /> Edit Profile
            </button>
          </div>
        </motion.section>
        {/* Course Overview */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #23252622', padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#185a9d', marginBottom: 14 }}>Course Overview</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            {enrolledCourses.map((course) => (
              <div key={course.id} style={{ background: '#f6f7fb', borderRadius: 10, padding: 16, minWidth: 220, flex: 1, boxShadow: '0 1px 4px #23252611', display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span style={{ fontWeight: 600, color: '#185a9d', fontSize: 16 }}>{course.title}</span>
                <div style={{ color: '#43cea2', fontSize: 14 }}>Progress: {course.percent}%</div>
                <button style={{ background: 'linear-gradient(90deg, #43cea2 0%, #00bfff 100%)', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 0', fontWeight: 600, fontSize: 14, marginTop: 6, cursor: 'pointer' }}>Go to Course</button>
              </div>
            ))}
          </div>
        </motion.section>
        {/* Progress Summary */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #23252622', padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#185a9d', marginBottom: 14 }}>Progress Summary</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            <div style={{ background: '#f6f7fb', borderRadius: 10, padding: 16, minWidth: 220, flex: 1, boxShadow: '0 1px 4px #23252611', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontWeight: 600, color: '#185a9d', fontSize: 16 }}>Completed Courses</span>
              <div style={{ color: '#43cea2', fontSize: 14 }}>{completedCourses.length}</div>
              {completedCourses.map(c => (
                <div key={c.id} style={{ color: '#888', fontSize: 14, marginTop: 4 }}> {c.title}</div>
              ))}
            </div>
            <div style={{ background: '#f6f7fb', borderRadius: 10, padding: 16, minWidth: 220, flex: 1, boxShadow: '0 1px 4px #23252611', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontWeight: 600, color: '#185a9d', fontSize: 16 }}>Certificates/Badges</span>
              <div style={{ color: '#43cea2', fontSize: 14 }}>{completedCourses.map(c => c.badge).join(', ') || 'None yet'}</div>
            </div>
          </div>
        </motion.section>
        {/* Notification Preferences */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #23252622', padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#185a9d', marginBottom: 14 }}>Notification Preferences</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><FaBell /> Grades <input type="checkbox" name="grades" checked={notificationPrefs.grades} onChange={handleNotificationChange} /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><FaBell /> Assignments <input type="checkbox" name="assignments" checked={notificationPrefs.assignments} onChange={handleNotificationChange} /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><FaBell /> Announcements <input type="checkbox" name="announcements" checked={notificationPrefs.announcements} onChange={handleNotificationChange} /></label>
          </div>
        </motion.section>
        {/* Privacy Settings */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #23252622', padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#185a9d', marginBottom: 14 }}>Privacy Settings</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><FaEye /> Public Profile <input type="checkbox" name="publicProfile" checked={privacy.publicProfile} onChange={handlePrivacyChange} /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><FaLock /> Show on Leaderboard <input type="checkbox" name="leaderboard" checked={privacy.leaderboard} onChange={handlePrivacyChange} /></label>
          </div>
          <MFAToggle mfaEnabled={mfaEnabled} onChange={setMfaEnabled} />
        </motion.section>
        {/* Download/Export Data & Account Deletion */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #23252622', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={handleDownload} style={{ background: 'linear-gradient(90deg, #43cea2 0%, #00bfff 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, maxWidth: 260 }}><FaDownload /> Download Academic Transcript</button>
          <button onClick={() => setShowDeleteConfirm(true)} style={{ background: 'linear-gradient(90deg, #ff7675 0%, #ff5252 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, maxWidth: 260 }}><FaTrashAlt /> Delete/Deactivate Account</button>
          {showDeleteConfirm && (
            <div style={{ background: '#fff0f0', border: '1px solid #ff5252', borderRadius: 8, padding: 18, marginTop: 10, color: '#ff5252', fontWeight: 600 }}>
              Are you sure you want to delete/deactivate your account? This action cannot be undone.<br />
              <button onClick={handleDelete} style={{ background: 'linear-gradient(90deg, #ff7675 0%, #ff5252 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginRight: 12 }}>Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ background: '#e3e6f3', color: '#185a9d', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
            </div>
          )}
        </motion.section>
      </main>
      <StudentFooter />
      {showEditModal && (
        <EditProfileModal
          profile={profileData}
          onSave={handleSave}
          onClose={handleCancel}
        />
      )}
    </div>
  );
}
