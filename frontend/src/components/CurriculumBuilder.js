import React, { useState } from 'react';
import { FaGripVertical, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import '../styles/curriculum.builder.css';

export default function CurriculumBuilder({ curriculum, setCurriculum }) {
  const [lectureTitle, setLectureTitle] = useState('');

  function handleAddLecture() {
    if (!lectureTitle.trim()) return;
    setCurriculum([
      ...curriculum,
      { 
        id: Date.now(), 
        title: lectureTitle, 
        isPreview: false, 
        videoUrl: '', 
        videoPublicId: '',
        videoName: '',
        duration: 0 
      }
    ]);
    setLectureTitle('');
  }

  function handleDeleteLecture(id) {
    setCurriculum(curriculum.filter(l => l.id !== id));
  }

  function handleTogglePreview(id) {
    setCurriculum(curriculum.map(l => l.id === id ? { ...l, isPreview: !l.isPreview } : l));
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const items = Array.from(curriculum);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setCurriculum(items);
  }

  return (
    <div className="curriculum-builder">
      <h4 className="curriculum-title">Curriculum</h4>
      <div className="add-lecture-row">
        <input
          type="text"
          placeholder="Add lecture title..."
          value={lectureTitle}
          onChange={e => setLectureTitle(e.target.value)}
          className="add-lecture-input"
        />
        <button 
          type="button" 
          className="add-lecture-btn" 
          onClick={handleAddLecture}
          aria-label="Add lecture"
        >
          <FaPlus />
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="curriculum">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="curriculum-list-dnd">
              {curriculum.map((lec, idx) => (
                <Draggable key={lec.id} draggableId={lec.id.toString()} index={idx}>
                  {provided => (
                    <div
                      className={`curriculum-item-dnd${lec.isPreview ? ' preview' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <FaGripVertical className="drag-icon" />
                      <span>{lec.title}</span>
                      <button 
                        type="button"
                        className="preview-toggle-btn" 
                        onClick={() => handleTogglePreview(lec.id)} 
                        title="Toggle Free Preview"
                        aria-label="Toggle preview status"
                      >
                        <FaEye className={lec.isPreview ? 'preview-on' : 'preview-off'} />
                      </button>
                      <button 
                        type="button"
                        className="delete-lecture-btn" 
                        onClick={() => handleDeleteLecture(lec.id)} 
                        title="Delete"
                        aria-label="Delete lecture"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
