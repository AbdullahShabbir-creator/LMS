import React from 'react';
import styles from '../pages/StudentSmartQuiz.module.css';

export default function QuizReviewModal({ questions, onEdit, onRemove, onReorder, onApprove, onCancel }) {
  const [localQuestions, setLocalQuestions] = React.useState(questions);

  function handleEdit(idx, field, value) {
    const updated = localQuestions.map((q, i) => i === idx ? { ...q, [field]: value } : q);
    setLocalQuestions(updated);
    if (onEdit) onEdit(updated);
  }

  function handleRemove(idx) {
    const updated = localQuestions.filter((_, i) => i !== idx);
    setLocalQuestions(updated);
    if (onRemove) onRemove(updated);
  }

  function move(idx, dir) {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === localQuestions.length - 1)) return;
    const updated = localQuestions.slice();
    const temp = updated[idx];
    updated[idx] = updated[idx + dir];
    updated[idx + dir] = temp;
    setLocalQuestions(updated);
    if (onReorder) onReorder(updated);
  }

  return (
    <div className={styles['quiz-review-section']} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(30,40,60,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={styles['quiz-card']} style={{ maxWidth: 700, width: '98vw', maxHeight: '88vh', overflowY: 'auto', position: 'relative', padding: 30 }}>
        <h2 className={styles['quiz-title']} style={{ marginBottom: 20 }}>Review & Edit Quiz Questions</h2>
        {localQuestions.map((q, idx) => (
          <div key={idx} style={{ marginBottom: 22, borderBottom: '1px solid #e3e6f3', paddingBottom: 12, position: 'relative' }}>
            <div style={{ fontWeight: 700, color: '#185a9d', marginBottom: 6 }}>
              Q{idx + 1} ({q.type})
              <button style={{ float: 'right', color: '#ff5b5b', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 16 }} onClick={() => handleRemove(idx)}>Remove</button>
              <button style={{ float: 'right', marginRight: 10, color: '#43cea2', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 16 }} onClick={() => move(idx, -1)} disabled={idx === 0}>↑</button>
              <button style={{ float: 'right', marginRight: 2, color: '#43cea2', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 16 }} onClick={() => move(idx, 1)} disabled={idx === localQuestions.length - 1}>↓</button>
            </div>
            <input
              className={styles['quiz-option']}
              style={{ marginBottom: 7, width: '100%' }}
              value={q.question}
              onChange={e => handleEdit(idx, 'question', e.target.value)}
            />
            {q.type === 'mcq' && (
              <div style={{ marginBottom: 7 }}>
                {q.options.map((opt, oidx) => (
                  <input
                    key={oidx}
                    className={styles['quiz-option']}
                    style={{ marginBottom: 4, width: '95%' }}
                    value={opt}
                    onChange={e => {
                      const newOpts = q.options.slice(); newOpts[oidx] = e.target.value;
                      handleEdit(idx, 'options', newOpts);
                    }}
                  />
                ))}
                <div style={{ marginTop: 4, fontSize: 13, color: '#888' }}>
                  Answer Index: <input type="number" min={0} max={q.options.length - 1} value={q.answer} onChange={e => handleEdit(idx, 'answer', Number(e.target.value))} style={{ width: 40 }} />
                </div>
              </div>
            )}
            {q.type === 'tf' && (
              <div style={{ marginBottom: 7 }}>
                <span style={{ fontWeight: 500 }}>Answer: </span>
                <select value={q.answer ? 'true' : 'false'} onChange={e => handleEdit(idx, 'answer', e.target.value === 'true')} className={styles['quiz-option']} style={{ width: 80 }}>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            )}
            {q.type === 'fill' && (
              <div style={{ marginBottom: 7 }}>
                <span style={{ fontWeight: 500 }}>Answer: </span>
                <input className={styles['quiz-option']} value={q.answer} onChange={e => handleEdit(idx, 'answer', e.target.value)} />
              </div>
            )}
            {q.type === 'short' && (
              <div style={{ marginBottom: 7 }}>
                <span style={{ fontWeight: 500 }}>Answer: </span>
                <input className={styles['quiz-option']} value={q.answer} onChange={e => handleEdit(idx, 'answer', e.target.value)} />
              </div>
            )}
            <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
              <span>Difficulty: </span>
              <select value={q.difficulty} onChange={e => handleEdit(idx, 'difficulty', e.target.value)} className={styles['quiz-option']} style={{ width: 110 }}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <textarea
              className={styles['quiz-option']}
              style={{ marginBottom: 7, width: '100%' }}
              value={q.explanation}
              onChange={e => handleEdit(idx, 'explanation', e.target.value)}
              placeholder="Explanation (shown after answering)"
              rows={2}
            />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
          <button className={styles['quiz-retry-btn']} style={{ background: '#e3e6f3', color: '#185a9d' }} onClick={onCancel}>Cancel</button>
          <button className={styles['quiz-retry-btn']} onClick={() => onApprove(localQuestions)}>Approve & Start Quiz</button>
        </div>
      </div>
    </div>
  );
}
