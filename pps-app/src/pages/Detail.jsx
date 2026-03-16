import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { MousePointer2, MoveUpRight, Trash2, Eraser, ChevronLeft, ChevronRight } from 'lucide-react';
import CanvasSketch from '../components/CanvasSketch';

export default function Detail({ sessionData, setSessionData }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('point');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Protect route if no session target is set
  useEffect(() => {
    if (!sessionData?.selectedCharts || sessionData.selectedCharts.length === 0) {
      navigate('/');
    }
  }, [sessionData, navigate]);

  if (!sessionData?.selectedCharts || sessionData.selectedCharts.length === 0) return null;

  const currentChartId = sessionData.selectedCharts[currentIndex];
  // Determine prefix based on chart id type
  const chartsDef = [
    { id: 'PPS_Upper limb', type: 'upper' },
    { id: 'PPS_Forequarter', type: 'upper' },
    { id: 'PPS_Transhumeral', type: 'upper' },
    { id: 'PPS_Transradial', type: 'upper' },
    { id: 'PPS_Lower limb', type: 'lower' },
    { id: 'PPS_Hindquarter', type: 'lower' },
    { id: 'PPS_AKA', type: 'lower' },
    { id: 'PPS_BKA', type: 'lower' }
  ];
  const chartDef = chartsDef.find(c => c.id === currentChartId);
  const prefix = chartDef?.type === 'upper' ? '/PPS/Upper' : '/PPS/Lower';
  const pdfUrl = `${prefix}/${currentChartId}.pdf`;

  const isLastChart = currentIndex === sessionData.selectedCharts.length - 1;

  const handleNextOrFinish = () => {
    const detailImage = canvasRef.current.getMergedImage();
    
    // Save current chart image to session
    setSessionData(prev => ({
      ...prev,
      chartImages: {
        ...prev.chartImages,
        [currentChartId]: detailImage
      }
    }));

    if (isLastChart) {
      navigate('/summary');
    } else {
      // Clear canvas locally for the next chart
      canvasRef.current.clearMarks();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleClear = () => {
    canvasRef.current.clearMarks();
  };

  return (
    <>
      <div className="floating-toolbox">
        <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_x')}</Tooltip>}>
          <Button 
            variant={mode === 'point' ? "primary" : "outline-secondary"} 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => setMode('point')}
            style={{ width: '46px', height: '46px' }}
          >
            <MousePointer2 size={20} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_arrow')}</Tooltip>}>
          <Button 
            variant={mode === 'arrow' ? "primary" : "outline-secondary"} 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => setMode('arrow')}
            style={{ width: '46px', height: '46px' }}
          >
            <MoveUpRight size={20} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_eraser')}</Tooltip>}>
          <Button 
            variant={mode === 'eraser' ? "primary" : "outline-secondary"} 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => setMode('eraser')}
            style={{ width: '46px', height: '46px' }}
          >
            <Eraser size={20} />
          </Button>
        </OverlayTrigger>

        <div className="vr mx-1" style={{ height: '30px' }}></div>

        <OverlayTrigger placement="top" overlay={<Tooltip>{t('clear_all')}</Tooltip>}>
          <Button 
            variant="outline-danger" 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={handleClear}
            style={{ width: '46px', height: '46px' }}
          >
            <Trash2 size={20} />
          </Button>
        </OverlayTrigger>
      </div>

      <Container className="py-4 pb-5">
        <div className="d-flex flex-column align-items-center mb-4 text-center">
          <h2 className="mb-1">{t('stage2_title')} ({currentIndex + 1}/{sessionData.selectedCharts.length})</h2>
          <h5 className="text-primary mb-3">{t(`term_${currentChartId.replace(' ', '_')}`)}</h5>
          <div>
            <Button variant="outline-secondary" className="me-2" onClick={() => {
              if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
              else navigate(-1);
            }}>{t('back')}</Button>
            <Button variant="success" onClick={handleNextOrFinish}>
              {isLastChart ? t('finish') : t('next_chart')}
            </Button>
          </div>
        </div>

        <div className="d-flex justify-content-center mb-5 ps-md-5">
          <CanvasSketch 
            ref={canvasRef}
            pdfUrl={pdfUrl}
            mode={mode}
          />
        </div>
      </Container>
    </>
  );
}
