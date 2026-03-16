import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function SelectCharts({ sessionData, setSessionData }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selected, setSelected] = useState(sessionData?.selectedCharts || []);

  // Protect route
  useEffect(() => {
    if (!sessionData?.patientId) {
      navigate('/');
    }
  }, [sessionData, navigate]);

  const charts = [
    { id: 'PPS_Upper limb', type: 'upper' },
    { id: 'PPS_Forequarter', type: 'upper' },
    { id: 'PPS_Transhumeral', type: 'upper' },
    { id: 'PPS_Transradial', type: 'upper' },
    { id: 'PPS_Lower limb', type: 'lower' },
    { id: 'PPS_Hindquarter', type: 'lower' },
    { id: 'PPS_AKA', type: 'lower' },
    { id: 'PPS_BKA', type: 'lower' }
  ];

  const handleToggle = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(c => c !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleStart = () => {
    if (selected.length === 0) return;
    
    setSessionData(prev => ({
      ...prev,
      selectedCharts: selected,
      chartImages: {} // reset any previous drawings
    }));
    
    navigate('/detail');
  };

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="mb-2 fw-bold text-primary">{t('select_charts_title')}</h2>
        <p className="text-muted mb-4">{t('select_charts_subtitle')}</p>
        
        <div className="d-flex justify-content-center gap-3">
          <Button variant="outline-secondary" size="lg" className="px-5" onClick={() => navigate(-1)}>{t('back')}</Button>
          <Button variant="primary" size="lg" className="px-5" onClick={handleStart} disabled={selected.length === 0}>
            {t('start_sketch')} ({selected.length})
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <h4 className="text-primary mb-3 pb-2 border-bottom border-primary border-2">{t('upper_limb')}</h4>
        <Row className="g-4">
          {charts.filter(c => c.type === 'upper').map(chart => {
            const isSelected = selected.includes(chart.id);
            const themeClass = 'primary';
            
            return (
              <Col key={chart.id} xs={6} md={4} lg={3}>
                <Card 
                  className={`h-100 transition-all ${isSelected ? `border-${themeClass} shadow-sm` : `border-light shadow-sm hover-shadow`}`}
                  onClick={() => handleToggle(chart.id)}
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.2s', 
                    borderWidth: isSelected ? '2px' : '1px',
                    borderTopWidth: isSelected ? '2px' : '4px',
                    borderTopColor: isSelected ? undefined : `var(--bs-${themeClass})`
                  }}
                >
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4 position-relative">
                    <div 
                      className={`mb-3 rounded border p-2 d-flex align-items-center justify-content-center bg-white`}
                      style={{ height: '140px', width: '100%', overflow: 'hidden' }}
                    >
                      <img 
                        src={`illustration/${chart.id}.png`} 
                        alt={chart.id}
                        className="img-fluid"
                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none' }}>
                        <FileText size={48} className="text-muted" />
                      </div>
                    </div>
                    <h6 className={`mb-0 fw-bold ${isSelected ? `text-${themeClass}` : 'text-dark'}`}>
                      {t(`term_${chart.id.replace(' ', '_')}`)}
                    </h6>
                    {isSelected && (
                      <div className={`position-absolute top-0 end-0 p-2 text-${themeClass}`}>
                        <CheckCircle2 size={24} fill="white" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      <div>
        <h4 className="text-success mb-3 pb-2 border-bottom border-success border-2">{t('lower_limb')}</h4>
        <Row className="g-4">
          {charts.filter(c => c.type === 'lower').map(chart => {
            const isSelected = selected.includes(chart.id);
            const themeClass = 'success';
            
            return (
              <Col key={chart.id} xs={6} md={4} lg={3}>
                <Card 
                  className={`h-100 transition-all ${isSelected ? `border-${themeClass} shadow-sm` : `border-light shadow-sm hover-shadow`}`}
                  onClick={() => handleToggle(chart.id)}
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.2s', 
                    borderWidth: isSelected ? '2px' : '1px',
                    borderTopWidth: isSelected ? '2px' : '4px',
                    borderTopColor: isSelected ? undefined : `var(--bs-${themeClass})`
                  }}
                >
                  <Card.Body className="d-flex flex-column align-items-center text-center p-4 position-relative">
                    <div 
                      className={`mb-3 rounded border p-2 d-flex align-items-center justify-content-center bg-white`}
                      style={{ height: '140px', width: '100%', overflow: 'hidden' }}
                    >
                      <img 
                        src={`illustration/${chart.id}.png`} 
                        alt={chart.id}
                        className="img-fluid"
                        style={{ maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div style={{ display: 'none' }}>
                        <FileText size={48} className="text-muted" />
                      </div>
                    </div>
                    <h6 className={`mb-0 fw-bold ${isSelected ? `text-${themeClass}` : 'text-dark'}`}>
                      {t(`term_${chart.id.replace(' ', '_')}`)}
                    </h6>
                    {isSelected && (
                      <div className={`position-absolute top-0 end-0 p-2 text-${themeClass}`}>
                        <CheckCircle2 size={24} fill="white" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </Container>
  );
}
