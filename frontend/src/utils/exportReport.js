import { utils, writeFile } from 'xlsx';

export function exportReportToCSV(report) {
  const ws = utils.json_to_sheet([
    { Courses: report.courses, Students: report.students, Earnings: report.earnings }
  ]);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Report');
  writeFile(wb, 'instructor_report.csv');
}

export function exportReportToPDF(report, chartRefs = []) {
  import('jspdf').then(jsPDFModule => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDFModule.jsPDF();
      doc.setFontSize(18);
      doc.text('Instructor Report', 14, 18);
      doc.setFontSize(12);
      doc.text(`Courses: ${report.courses}`, 14, 32);
      doc.text(`Students: ${report.students}`, 14, 40);
      doc.text(`Earnings: $${report.earnings}`, 14, 48);
      if (report.recent && report.recent.length > 0) {
        doc.text('Recent Activity:', 14, 60);
        report.recent.forEach((item, idx) => {
          doc.text(`- ${item}`, 18, 68 + idx * 8);
        });
      }
      // Optionally add charts as images
      chartRefs.forEach((ref, idx) => {
        if (ref && ref.current) {
          const imgData = ref.current.toBase64Image();
          doc.addImage(imgData, 'PNG', 14, 90 + idx * 60, 160, 40);
        }
      });
      doc.save('instructor_report.pdf');
    });
  });
}
