import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaVideo, FaFile, FaCheckCircle, FaTimesCircle, FaFolderOpen, FaPlus, FaInfo, FaLaptop, FaMobile, FaTabletAlt } from 'react-icons/fa';
import InstructorHeader from '../components/InstructorHeader';
import InstructorFooter from '../components/InstructorFooter';
import '../styles/instructor.modern.css';
import '../styles/instructorUpload.css';

export default function InstructorUpload() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [section, setSection] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // upload, batch, settings
  
  // Settings state
  const [settings, setSettings] = useState({
    visibility: 'public',
    quality: 'auto',
    priority: 'standard',
    captions: false,
    watermark: true
  });
  
  // Handle settings changes
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Save settings
  const handleSaveSettings = () => {
    // In a real app, you would save to backend
    alert('Settings saved successfully!');
    
    // Save to localStorage for persistence
    localStorage.setItem('instructorUploadSettings', JSON.stringify(settings));
  };
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('instructorUploadSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }, []);

  // Fetch instructor courses
  useEffect(() => {
    // Mock data for demonstration
    const mockCourses = [
      { id: '1', title: 'React Fundamentals' },
      { id: '2', title: 'Advanced JavaScript' },
      { id: '3', title: 'UI/UX Design Principles' },
      { id: '4', title: 'Full Stack Development' },
      { id: '5', title: 'Mobile App Development' },
      { id: '6', title: 'Data Structures and Algorithms' }
    ];
    
    // Set mock courses immediately so UI shows options
    setCourses(mockCourses);
    
    // Still try the API call in case it works in the future
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const token = user ? user.token : null;
    
    if (!token) return;

    fetch('http://localhost:5000/api/instructor/courses', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch courses'))
      .then(data => {
        if (data && data.length > 0) {
          setCourses(data);
        }
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
        // We already set mock data above, so no need to set it again
      });
  }, []);

  const onDrop = useCallback(acceptedFiles => {
    setDragActive(false);
    const newFiles = acceptedFiles.map(file => {
      // Generate a preview URL for the file
      const preview = URL.createObjectURL(file);
      
      // Create a video thumbnail for video files
      let videoThumbnail = null;
      if (file.type && file.type.includes('video')) {
        const video = document.createElement('video');
        video.src = preview;
        video.addEventListener('loadeddata', () => {
          // When video is loaded, create a canvas to capture frame
          video.currentTime = 1; // Set to 1 second to avoid black frame at start
          
          video.addEventListener('seeked', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            videoThumbnail = canvas.toDataURL();
            
            // Update the file object with the thumbnail
            setFiles(prevFiles => 
              prevFiles.map(f => 
                f.id === `${file.name}-${Date.now()}` 
                  ? { ...f, videoThumbnail } 
                  : f
              )
            );
          });
        });
      }
      
      return Object.assign(file, {
        preview,
        videoThumbnail,
        status: 'ready', // ready, uploading, success, error
        id: `${file.name}-${Date.now()}`
      });
    });
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    }
  });

  // Batch upload dropzone config
  const { 
    getRootProps: getBatchRootProps, 
    getInputProps: getBatchInputProps, 
    isDragActive: isBatchDragActive 
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        // Get the selected course
        const selectedBatchCourse = localStorage.getItem('batchUploadCourse');
        const courseName = selectedBatchCourse ? 
          courses.find(c => c.id === selectedBatchCourse)?.title || "the selected course" : 
          "your course";
        
        if (!selectedBatchCourse) {
          alert("Please select a course first before uploading a ZIP file.");
          return;
        }
        
        // Instead of just showing an alert, let's simulate actual processing
        setUploading(true);
        
        // Show processing message with the file name
        alert(`Processing ZIP file: "${file.name}" for ${courseName}\n\nThis is a demo environment. In production, this file would be uploaded and processed automatically.`);
        
        // Simulate processing time
        setTimeout(() => {
          // Add a success message
          alert(`Success! Your ZIP file "${file.name}" has been processed for ${courseName}. In a production environment, your lectures would now be available in your course.`);
          setUploading(false);
        }, 2000);
      }
    },
    maxFiles: 1,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    }
  });

  const removeFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }
    
    if (!section) {
      setError('Please enter a section name');
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    setError('');
    setUploading(true);
    setUploadComplete(false);

    // Simulate uploading process for each file
    for (const file of files) {
      // Update status to uploading
      setFiles(prevFiles => prevFiles.map(f => 
        f.id === file.id ? { ...f, status: 'uploading' } : f
      ));

      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 5) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(prev => ({ ...prev, [file.id]: progress }));
      }

      // Simulate upload completion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Randomly succeed or fail for demonstration
      const success = Math.random() > 0.2; // 80% success rate

      // Update file status based on success/failure
      setFiles(prevFiles => prevFiles.map(f => 
        f.id === file.id ? { ...f, status: success ? 'success' : 'error' } : f
      ));
    }

    // Complete the upload process
    setUploading(false);
    setUploadComplete(true);
  };

  const resetForm = () => {
    setFiles([]);
    setSelectedCourse('');
    setSection('');
    setTitle('');
    setDescription('');
    setUploadProgress({});
    setUploadComplete(false);
    setError('');
  };

  return (
    <div className="instructor-upload-page">
      <InstructorHeader />
      
      <main className="upload-main">
        <motion.div 
          className="upload-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Upload Lectures</h1>
          <div className="tab-navigation">
            <button 
              className={activeTab === 'upload' ? 'active' : ''} 
              onClick={() => setActiveTab('upload')}
            >
              <FaCloudUploadAlt /> Upload Files
            </button>
            <button 
              className={activeTab === 'batch' ? 'active' : ''} 
              onClick={() => setActiveTab('batch')}
            >
              <FaFolderOpen /> Batch Upload
            </button>
            <button 
              className={activeTab === 'settings' ? 'active' : ''} 
              onClick={() => setActiveTab('settings')}
            >
              <FaInfo /> Settings
            </button>
          </div>
        </motion.div>

        {activeTab === 'upload' && (
          <div className="upload-content">
            <AnimatePresence>
              {showTips && (
                <motion.div 
                  className="upload-tips"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="tips-header">
                    <h3>Upload Tips</h3>
                    <button onClick={() => setShowTips(false)}>×</button>
                  </div>
                  <div className="tips-content">
                    <div className="tip-item">
                      <FaLaptop />
                      <span>Video lectures should be in MP4 format for best compatibility</span>
                    </div>
                    <div className="tip-item">
                      <FaTabletAlt />
                      <span>Keep file sizes under 500MB for faster uploads</span>
                    </div>
                    <div className="tip-item">
                      <FaMobile />
                      <span>Consider 720p resolution for mobile-friendly content</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="upload-form-wrapper">
              <motion.form 
                className="upload-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label htmlFor="course">Select Course</label>
                  <select 
                    id="course" 
                    value={selectedCourse} 
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                  >
                    <option value="">-- Select a course --</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="section">Section Name</label>
                  <input 
                    type="text" 
                    id="section" 
                    value={section} 
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. Introduction, Advanced Topics"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="title">Lecture Title (Optional)</label>
                  <input 
                    type="text" 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Lecture title (optional for batch uploads)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (Optional)</label>
                  <textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the content of this lecture"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Upload Files</label>
                  <div 
                    {...getRootProps()} 
                    className={`dropzone ${dragActive || isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <FaCloudUploadAlt className="upload-icon" />
                    <p>Drag & drop files here, or click to select files</p>
                    <span className="dropzone-info">
                      Supported formats: MP4, MOV, AVI, MKV, PDF, PPT, PPTX
                    </span>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <div className="form-actions">
                  <motion.button 
                    type="button" 
                    className="reset-btn"
                    onClick={resetForm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={uploading}
                  >
                    Reset
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    className="upload-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={uploading || files.length === 0}
                  >
                    {uploading ? 'Uploading...' : 'Start Upload'}
                  </motion.button>
                </div>
              </motion.form>

              <motion.div 
                className="upload-preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="preview-header">
                  <h3>Files ({files.length})</h3>
                  {files.length > 0 && (
                    <button 
                      className="clear-all" 
                      onClick={() => setFiles([])}
                      disabled={uploading}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {files.length === 0 ? (
                    <motion.div 
                      className="no-files"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <FaVideo className="no-files-icon" />
                      <p>No files selected</p>
                    </motion.div>
                  ) : (
                    <motion.ul className="files-list">
                      {files.map(file => (
                        <motion.li 
                          key={file.id}
                          className={`file-item ${file.status}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          layout
                        >
                          <div className="file-icon">
                            {file.type && file.type.includes('video') ? (
                              file.videoThumbnail ? (
                                <img 
                                  src={file.videoThumbnail} 
                                  alt="Video thumbnail" 
                                  className="video-thumbnail"
                                />
                              ) : (
                                <FaVideo />
                              )
                            ) : (
                              <FaFile />
                            )}
                          </div>
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                          <div className="file-status">
                            {file.status === 'ready' && (
                              <span className="status-badge ready">Ready</span>
                            )}
                            {file.status === 'uploading' && (
                              <>
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill" 
                                    style={{ width: `${uploadProgress[file.id] || 0}%` }}
                                  ></div>
                                </div>
                                <span className="progress-text">{uploadProgress[file.id] || 0}%</span>
                              </>
                            )}
                            {file.status === 'success' && (
                              <span className="status-badge success">
                                <FaCheckCircle /> Uploaded
                              </span>
                            )}
                            {file.status === 'error' && (
                              <span className="status-badge error">
                                <FaTimesCircle /> Failed
                              </span>
                            )}
                          </div>
                          {file.status !== 'uploading' && !uploading && (
                            <button 
                              className="remove-file" 
                              onClick={() => removeFile(file.id)}
                              aria-label="Remove file"
                            >
                              ×
                            </button>
                          )}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {uploadComplete && (
                    <motion.div 
                      className="upload-complete"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <FaCheckCircle className="complete-icon" />
                      <h3>Upload Complete!</h3>
                      <p>Your files have been uploaded successfully.</p>
                      <motion.button 
                        className="new-upload-btn"
                        onClick={resetForm}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaPlus /> New Upload
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <motion.div 
            className="batch-upload-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="batch-info">
              <h2>Batch Upload</h2>
              <p>Upload multiple videos at once and organize them into sections automatically.</p>
              
              <div className="batch-instructions">
                <h3>Instructions</h3>
                <ol>
                  <li>Create a ZIP file with your lecture videos</li>
                  <li>Organize videos in folders (each folder will become a section)</li>
                  <li>Name your videos in the order they should appear</li>
                  <li>Upload the ZIP file below</li>
                </ol>
              </div>
              
              <div 
                {...getBatchRootProps({
                  disabled: uploading
                })} 
                className={`batch-dropzone ${isBatchDragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
              >
                <input {...getBatchInputProps()} />
                <FaFolderOpen className="batch-icon" />
                <p>{uploading ? 'Upload in progress...' : 'Drop your ZIP file here or click to browse'}</p>
                <button 
                  type="button" 
                  className="batch-btn" 
                  onClick={(e) => e.stopPropagation()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Select ZIP File'}
                </button>
              </div>
              
              <div className="batch-course-selector">
                <div className="form-group">
                  <label htmlFor="batch-course">Select Course</label>
                  <select 
                    id="batch-course"
                    onChange={(e) => {
                      // Store the selected course in localStorage for demo persistence
                      if (e.target.value) {
                        localStorage.setItem('batchUploadCourse', e.target.value);
                        
                        // Find the course name for the confirmation message
                        const courseName = courses.find(c => c.id === e.target.value)?.title || "Selected course";
                        if (!uploading) {
                          // Show confirmation only if we're not in the middle of an upload
                          alert(`Course selected: ${courseName}\n\nNow you can upload a ZIP file to batch process lectures for this course.`);
                        }
                      }
                    }}
                    defaultValue={localStorage.getItem('batchUploadCourse') || ""}
                  >
                    <option value="">-- Select a course --</option>
                    {courses.map(course => (
                      <option key={`batch-${course.id}`} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            className="upload-settings-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="settings-info">
              <h2>Upload Settings</h2>
              <p>Configure default settings for your uploaded videos.</p>
              
              <div className="settings-form">
                <div className="form-group">
                  <label>Default Visibility</label>
                  <select 
                    value={settings.visibility}
                    onChange={(e) => handleSettingChange('visibility', e.target.value)}
                  >
                    <option value="public">Public (available to enrolled students)</option>
                    <option value="private">Private (only visible to you)</option>
                    <option value="scheduled">Scheduled (release on specific date)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Default Quality</label>
                  <select
                    value={settings.quality}
                    onChange={(e) => handleSettingChange('quality', e.target.value)}
                  >
                    <option value="auto">Auto (Optimize based on content)</option>
                    <option value="720">720p (Recommended)</option>
                    <option value="1080">1080p (HD)</option>
                    <option value="480">480p (SD)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Processing Priority</label>
                  <select
                    value={settings.priority}
                    onChange={(e) => handleSettingChange('priority', e.target.value)}
                  >
                    <option value="standard">Standard (1-2 hours)</option>
                    <option value="high">High (30-60 minutes)</option>
                  </select>
                </div>
                
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="captions" 
                    checked={settings.captions}
                    onChange={(e) => handleSettingChange('captions', e.target.checked)}
                  />
                  <label htmlFor="captions">Auto-generate captions</label>
                </div>
                
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="watermark" 
                    checked={settings.watermark}
                    onChange={(e) => handleSettingChange('watermark', e.target.checked)}
                  />
                  <label htmlFor="watermark">Add course watermark</label>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="save-settings-btn"
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <InstructorFooter />
    </div>
  );
} 