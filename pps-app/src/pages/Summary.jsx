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
      date: [122, 136],
    };

    // Smart Name Parsing
    let firstName = '';
    let lastName = '';
    const name = sessionData.fullName || '';
    const hasChinese = /[\u4e00-\u9fa5]/.test(name);

    if (hasChinese) {
      firstName = name;
    } else if (name.includes(' ')) {
      const parts = name.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    } else {
      firstName = name;
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return dateStr.replace(/-/g, '/');
    };

    // Draw CJK text to a canvas first, then overlay image on PDF
    const drawOverlayImage = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 595 * 2;
      canvas.height = 842 * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      ctx.clearRect(0, 0, 595, 842);

      ctx.fillStyle = 'black';
      ctx.font = '10px "Microsoft JhengHei", "PingFang TC", sans-serif';

      if (firstName) ctx.fillText(firstName, coords.firstName[0], coords.firstName[1] - 2);
      if (lastName) ctx.fillText(lastName, coords.lastName[0], coords.lastName[1] - 2);
      if (sessionData.patientId) ctx.fillText(sessionData.patientId, coords.mrn[0], coords.mrn[1] - 2);
      if (sessionData.dob) ctx.fillText(formatDate(sessionData.dob), coords.dob[0], coords.dob[1] - 2);

      return canvas.toDataURL('image/png');
    };

    const overlayImg = drawOverlayImage();

    chartEntries.forEach(([chartId, dataUrl], index) => {
      if (index > 0) pdf.addPage();

      // 1. Draw the merged image (Background + Marks)
      pdf.addImage(dataUrl, 'JPEG', 0, 0, 595, 842);

      // 2. Overlay Metadata Image (to support CJK fonts)
      pdf.addImage(overlayImg, 'PNG', 0, 0, 595, 842);
    });

    const pidPrefix = sessionData.patientId ? `${sessionData.patientId}_` : '';
    const filename = `${pidPrefix}Patient_Pain_Sketch.pdf`;

    // Support for iOS: use Blob instead of pdf.save()
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

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
      fullName: '',
      dob: '',
      date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }),
      selectedCharts: [],
      chartImages: {},
      marksData: {}
    });
    navigate('/');
  };

  const handleEditChart = (chartId, index) => {
    navigate('/detail', { state: { editChartIndex: index, directEdit: true } });
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary mb-2">{t('summary_title')}</h2>
        
        <div className="mx-auto mb-4 p-2 text-center text-secondary" style={{ maxWidth: '700px', fontSize: '14px' }}>
          <i className="bi bi-info-circle me-2"></i>
          {t('summary_instr')}
        </div>
      </div>

      <div className="row mb-5 justify-content-center g-4">
        {chartEntries.map(([chartId, dataUrl], index) => (
          <div className="col-lg-6" key={chartId}>
            <div className="card h-100 shadow-sm border-0 position-relative">
              <div className="card-header bg-success text-white fw-bold d-flex justify-content-between align-items-center">
                <span>{t(`term_${chartId.replace(' ', '_')}`)}</span>
                <Button
                  variant="light"
                  size="sm"
                  className="ms-2 px-3 fw-bold"
                  onClick={() => handleEditChart(chartId, index)}
                >
                  {t('edit')}
                </Button>
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
