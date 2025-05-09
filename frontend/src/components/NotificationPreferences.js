import React, { useState } from 'react';
import '../styles/instructor.settings.css';

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState({
    enrollments: true,
    assignments: true,
    platform: false,
  });

  function handleChange(e) {
    setPrefs({ ...prefs, [e.target.name]: e.target.checked });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Replace with API call
    alert('Notification preferences saved!');
  }

  return (
    <section className="settings-section">
      <h3>Notification Preferences</h3>
      <form className="settings-form" onSubmit={handleSubmit}>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            name="enrollments"
            checked={prefs.enrollments}
            onChange={handleChange}
          />
          Email me for new enrollments
        </label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            name="assignments"
            checked={prefs.assignments}
            onChange={handleChange}
          />
          Email me for assignment submissions
        </label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            name="platform"
            checked={prefs.platform}
            onChange={handleChange}
          />
          Email me about platform updates
        </label>
        <button type="submit" className="settings-btn">Save Preferences</button>
      </form>
    </section>
  );
}
