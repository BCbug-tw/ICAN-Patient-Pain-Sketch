import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Modal } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';

export default function Summary({ sessionData, setSessionData }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Protect route
  useEffect(() => {
    if (!sessionData?.chartImages || Object.keys(sessionData.chartImages).length === 0) {
      navigate('/');
    }
  }, [sessionData, navigate]);

  if (!sessionData?.chartImages || Object.keys(sessionData.chartImages).length === 0) return null;

  const chartEntries = Object.entries(sessionData.chartImages);

  const handleDownload = () => {
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [595, 842]
    });

    // Proportional coordinates for 595x842 scale
    const coords = {
      firstName: [122, 100],
      lastName: [295, 100],
      mrn: [122, 118],
      dob: [295, 118],
      date: [122, 136], // Estimated below MRN line if needed, or stick to lines
      checkboxes: {
        'PPS_BKA': [378, 37],
        'PPS_AKA': [378, 51],
        'PPS_Transradial': [378, 81],
        'PPS_Transhumeral': [378, 96],
        'PPS_Forequarter': [378, 111],
      }
    };

    chartEntries.forEach(([chartId, dataUrl], index) => {
      if (index > 0) pdf.addPage();
      
      // 1. Draw the merged image (Background + Marks)
      pdf.addImage(dataUrl, 'JPEG', 0, 0, 595, 842);

      // 2. Overlay Patient Info
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      if (sessionData.firstName) pdf.text(sessionData.firstName, coords.firstName[0], coords.firstName[1]);
      if (sessionData.lastName) pdf.text(sessionData.lastName, coords.lastName[0], coords.lastName[1]);
      if (sessionData.patientId) pdf.text(sessionData.patientId, coords.mrn[0], coords.mrn[1]);
      if (sessionData.dob) pdf.text(sessionData.dob, coords.dob[0], coords.dob[1]);
      
      // Optional: Draw filling date if it's on a known line. For now, let's put it at a safe spot or skip if not in template.
      // pdf.text(sessionData.date, 122, 136);

      // 3. Auto-calculate and check boxes
      const checkCoords = coords.checkboxes[chartId];
      if (checkCoords) {
        pdf.setFontSize(14);
        pdf.text('V', checkCoords[0], checkCoords[1]);
      }
    });
    
    const pidPrefix = sessionData.patientId ? `${sessionData.patientId}_` : '';
    pdf.save(`${pidPrefix}Patient_Pain_Sketch.pdf`);
    setHasDownloaded(true);
  };

  const handleRestart = () => {
    if (!hasDownloaded) {
      setShowModal(true);
    } else {
      performRestart();
    }
  };

  const performRestart = () => {
    setSessionData({
      patientId: '',
      firstName: '',
      lastName: '',
      dob: '',
      date: new Date().toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' }),
      selectedCharts: [],
      chartImages: {}
    });
    navigate('/');
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-5 fw-bold text-primary">{t('summary_title')}</h2>
      
      <div className="row mb-5 justify-content-center g-4">
        {chartEntries.map(([chartId, dataUrl], index) => (
          <div className="col-lg-6" key={chartId}>
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-success text-white fw-bold d-flex justify-content-between">
                <span>{t('summary_stage2')} ({index + 1}/{chartEntries.length})</span>
                <span>{t(`term_${chartId.replace(' ', '_')}`)}</span>
              </div>
              <div className="card-body text-center bg-light p-2">
                 <img 
                   src={dataUrl} 
                   alt={chartId} 
                   className="img-fluid rounded border" 
                   style={{ maxHeight: '500px', objectFit: 'contain' }}
                 />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center gap-4">
        <Button variant="outline-secondary" size="lg" onClick={() => navigate('/detail')}>
          {t('continue_editing')}
        </Button>
        <Button variant="outline-primary" size="lg" onClick={handleRestart}>{t('start_over')}</Button>
        <Button variant="primary" size="lg" onClick={handleDownload}>
          {t('download_pdf')}
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('restart_warning_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('restart_warning_msg')}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={performRestart}>
            {t('restart_confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
