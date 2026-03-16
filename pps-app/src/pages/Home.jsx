import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function Home({ sessionData, setSessionData }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    patientId: sessionData?.patientId || '',
    fullName: sessionData?.fullName || '',
    dob: sessionData?.dob || '',
    date: sessionData?.date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' })
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!formData.patientId.trim()) {
      setError(t('patient_id_placeholder'));
      return;
    }
    
    setSessionData(prev => ({ 
      ...prev, 
      ...formData,
      selectedCharts: [],
      chartImages: {}
    }));

    navigate(`/select`);
  };

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">{t('app_title')}</h1>
      <p className="text-center text-muted mb-5">
        {t('home_subtitle')}
      </p>

      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0 bg-white">
            <Card.Body className="p-4">
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-6 mb-2 text-primary">{t('full_name')}</Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-6 mb-2 text-primary">{t('patient_id')} <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder={t('patient_id_placeholder')} 
                  value={formData.patientId}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, patientId: e.target.value }));
                    if (e.target.value.trim()) setError('');
                  }}
                  isInvalid={!!error && !formData.patientId.trim()}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold fs-6 mb-2 text-primary">{t('dob')}</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold fs-6 mb-2 text-primary">{t('date')}</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {error && <div className="text-danger mb-3">{error}</div>}

              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 mt-2"
                onClick={handleNext}
              >
                {t('next')}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
