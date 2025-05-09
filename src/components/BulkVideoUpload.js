import React, { useRef, useState } from 'react';
import { FaUpload, FaTimes, FaVideo, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import '../styles/bulk.video.upload.css';

export default function BulkVideoUpload({ videos, setVideos }) {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Support for drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  function validateVideoFile(file) {
    // Check if it's a valid video file format
    const validVideoTypes = [
      'video/mp4', 
      'video/webm', 
      'video/quicktime',  // .mov
      'video/x-msvideo',  // .avi
      'video/x-matroska'  // .mkv
    ];
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    
    if (!validVideoTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      return `${file.name} is not a valid video file. Supported formats: MP4, WebM, MOV, AVI, MKV`;
    }
    
    // Check file size (limit to 500MB)
    if (file.size > 500 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `${file.name} (${sizeMB} MB) exceeds the 500MB size limit`;
    }
    
    // Check if file already exists in the list
    if (videos.some(v => v.file && v.file.name === file.name)) {
      return `${file.name} has already been added`;
    }
    
    return null; // No error
  }

  function handleFilesSelected(e) {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : Array.from(e.target.files);
    if (files.length === 0) return;
    
    const errors = {};
    const validFiles = [];
    
    // Validate each file
    files.forEach(file => {
      const error = validateVideoFile(file);
      if (error) {
        errors[file.name] = error;
      } else {
        validFiles.push(file);
      }
    });
    
    // Set validation errors
    setValidationErrors(errors);
    
    // Only process valid files
    if (validFiles.length > 0) {
      try {
        const newVideos = validFiles.map(file => {
          const fileExtension = file.name.split('.').pop() || '';
          return {
            id: Date.now() + Math.random(),
            file,
            url: URL.createObjectURL(file),
            title: file.name.replace(/\.[^/.]+$/, ""),
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB", // Size in MB
            format: fileExtension.toUpperCase(),
            status: 'ready'
          };
        });
        setVideos(vs => [...vs, ...newVideos]);
      } catch (error) {
        console.error("Error processing video files:", error);
        setValidationErrors(prev => ({
          ...prev,
          general: "Failed to process video files. Please try again."
        }));
      }
    }
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemoveVideo(id) {
    setVideos(vs => vs.filter(v => v.id !== id));
  }

  function handleEditTitle(id, newTitle) {
    setVideos(vs => vs.map(v => 
      v.id === id ? { ...v, title: newTitle } : v
    ));
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'uploading':
        return <FaSpinner className="status-icon spinning" />;
      case 'success':
        return <FaCheck className="status-icon success" />;
      case 'error':
        return <FaExclamationCircle className="status-icon error" />;
      default:
        return null;
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'uploading':
        return <span className="status-text uploading">Uploading...</span>;
      case 'success':
        return <span className="status-text success">Uploaded</span>;
      case 'error':
        return <span className="status-text error">Failed</span>;
      default:
        return <span className="status-text">Ready</span>;
    }
  }

  return (
    <div className="bulk-video-upload">
      <h4 className="upload-section-title">Course Videos</h4>
      
      <div 
        className={`dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleFilesSelected}
        onClick={() => fileInputRef.current?.click()}
      >
        <FaUpload className="upload-icon" />
        <p className="upload-text">Drag & drop video files here or click to browse</p>
        <p className="upload-hint">Supported formats: MP4, WebM, MOV (max 500MB)</p>
        <input
          type="file"
          accept="video/*"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFilesSelected}
        />
      </div>
      
      {/* Validation errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="validation-errors">
          <FaExclamationTriangle className="error-icon" />
          <div className="error-list">
            {Object.values(validationErrors).map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* Video list */}
      {videos.length > 0 && (
        <div className="video-count">
          <FaCheckCircle className="count-icon" />
          <span>{videos.length} {videos.length === 1 ? 'video' : 'videos'} added</span>
        </div>
      )}
      
      <div className="video-list">
        {videos.map((video, index) => (
          <div className={`video-item ${video.status || ''}`} key={video.id}>
            <div className="video-item-header">
              <FaVideo className="video-icon" />
              <input
                type="text"
                className="video-title-input"
                value={video.title}
                onChange={(e) => handleEditTitle(video.id, e.target.value)}
                placeholder="Video title"
              />
              <div className="video-status">
                {getStatusIcon(video.status)}
                {getStatusLabel(video.status)}
              </div>
              <button 
                type="button"
                className="remove-video-btn" 
                onClick={() => handleRemoveVideo(video.id)}
                aria-label="Remove video"
                disabled={video.status === 'uploading'}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="video-details">
              <span className="video-size">{video.size}</span>
              <span className="video-format">{video.file?.type.split('/')[1].toUpperCase()}</span>
            </div>
            
            <video src={video.url} controls className="video-preview" />
            
            <div className="video-position">
              <span className="position-label">Position:</span>
              <span className="position-number">{index + 1}</span>
              <div className="position-hint">
                (This video will be linked to lecture #{index + 1})
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {videos.length > 0 && (
        <div className="upload-tips">
          <p>
            <strong>Tip:</strong> Videos will be linked to lectures in the order they appear above. 
            The 1st video will be linked to the 1st lecture, and so on.
          </p>
          <p>
            <strong>Note:</strong> Large videos may take several minutes to upload. Please be patient.
          </p>
        </div>
      )}
    </div>
  );
} 