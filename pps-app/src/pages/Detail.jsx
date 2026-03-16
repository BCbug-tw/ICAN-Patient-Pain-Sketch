import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, OverlayTrigger, Tooltip, ProgressBar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { X, MoveUpRight, Trash2, Eraser, ChevronLeft, ChevronRight } from 'lucide-react';
import CanvasSketch from '../components/CanvasSketch';

export default function Detail({ sessionData, setSessionData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('point');
  
  // If we came from Summary to edit a specific chart, use that index. Otherwise, start from 0 or last saved session index.
  const [currentIndex, setCurrentIndex] = useState(location.state?.editChartIndex ?? 0);
  const isDirectEdit = location.state?.directEdit ?? false;

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
  const prefix = chartDef?.type === 'upper' ? 'PPS/Upper' : 'PPS/Lower';
  const pdfUrl = `${prefix}/${currentChartId}.pdf`;

  const isLastChart = currentIndex === sessionData.selectedCharts.length - 1;

  const handleNextOrFinish = () => {
    const detailImage = canvasRef.current.getMergedImage();
    const rawMarks = canvasRef.current.getMarks();
    
    // Save current chart image and raw marks to session
    setSessionData(prev => ({
      ...prev,
      chartImages: {
        ...prev.chartImages,
        [currentChartId]: detailImage
      },
      marksData: {
        ...prev.marksData,
        [currentChartId]: rawMarks
      }
    }));

    if (isDirectEdit || isLastChart) {
      navigate('/summary');
    } else {
      // Clear canvas locally for the next chart - CanvasSketch handles initialMarks internally
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleClear = () => {
    canvasRef.current.clearMarks();
  };

  return (
    <>
      {/* Floating Toolbar - Only visible on Mobile (Portrait) */}
      <div className="toolbar-container bg-white shadow-sm border rounded-pill px-3 py-2 d-md-none d-flex align-items-center gap-2" style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1040 }}>
        <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_x')}</Tooltip>}>
          <Button 
            variant={mode === 'point' ? "primary" : "outline-secondary"} 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => setMode('point')}
            style={{ width: '40px', height: '40px' }}
          >
            <X size={18} strokeWidth={2.5} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_arrow')}</Tooltip>}>
          <Button 
            variant={mode === 'arrow' ? "primary" : "outline-secondary"} 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => setMode('arrow')}
            style={{ width: '40px', height: '40px' }}
          >
            <MoveUpRight size={18} />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_eraser')}</Tooltip>}>
          <Button 
            variant={mode === 'eraser' ? "primary" : "outline-secondary"} 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={() => setMode('eraser')}
            style={{ width: '40px', height: '40px' }}
          >
            <Eraser size={18} />
          </Button>
        </OverlayTrigger>

        <div className="vr mx-1" style={{ height: '20px' }}></div>

        <OverlayTrigger placement="top" overlay={<Tooltip>{t('clear_all')}</Tooltip>}>
          <Button 
            variant="outline-danger" 
            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
            onClick={handleClear}
            style={{ width: '40px', height: '40px' }}
          >
            <Trash2 size={18} />
          </Button>
        </OverlayTrigger>
      </div>

      <Container className="py-2 pb-5 mb-5">
        <div className="text-center mb-3">
          <h2 className="mb-0 fw-bold text-dark display-6">{t(`term_${currentChartId.replace(' ', '_')}`)}</h2>
        </div>

        <div className="mx-auto mb-4 p-2 text-center text-secondary" style={{ maxWidth: '600px', fontSize: '14px' }}>
          <i className="bi bi-info-circle me-2"></i>
          {t('detail_instr')}
        </div>

        <div className="d-flex justify-content-center">
          <CanvasSketch 
            ref={canvasRef}
            pdfUrl={pdfUrl}
            mode={mode}
            initialMarks={sessionData.marksData?.[currentChartId]}
          />
        </div>
      </Container>

      {/* Fixed bottom action bar */}
      <div className="fixed-bottom bg-white border-top py-3 shadow-lg" style={{ zIndex: 1030 }}>
        <Container className="d-flex align-items-center justify-content-between">
          <div style={{ flex: 1 }} className="d-flex justify-content-start">
            <Button variant="outline-secondary" size="lg" className="px-3 px-md-4" style={{ minWidth: '120px' }} onClick={() => {
              if (isDirectEdit) navigate('/summary');
              else if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
              else navigate(-1);
            }}>
              {isDirectEdit ? t('back') : (currentIndex === 0 ? t('back_to_selection') : t('prev_chart'))}
            </Button>
          </div>

          {/* Integrated Toolbar - Hidden on mobile if screen is too narrow */}
          <div style={{ flex: 1 }} className="d-none d-md-flex justify-content-center align-items-center gap-2">
            <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_x')}</Tooltip>}>
              <Button 
                variant={mode === 'point' ? "primary" : "outline-secondary"} 
                className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                onClick={() => setMode('point')}
                style={{ width: '40px', height: '40px' }}
              >
                <X size={18} strokeWidth={2.5} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_arrow')}</Tooltip>}>
              <Button 
                variant={mode === 'arrow' ? "primary" : "outline-secondary"} 
                className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                onClick={() => setMode('arrow')}
                style={{ width: '40px', height: '40px' }}
              >
                <MoveUpRight size={18} />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger placement="top" overlay={<Tooltip>{t('stage2_marker_eraser')}</Tooltip>}>
              <Button 
                variant={mode === 'eraser' ? "primary" : "outline-secondary"} 
                className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                onClick={() => setMode('eraser')}
                style={{ width: '40px', height: '40px' }}
              >
                <Eraser size={18} />
              </Button>
            </OverlayTrigger>

            <div className="vr mx-2" style={{ height: '24px' }}></div>

            <OverlayTrigger placement="top" overlay={<Tooltip>{t('clear_all')}</Tooltip>}>
              <Button 
                variant="outline-danger" 
                className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                onClick={handleClear}
                style={{ width: '40px', height: '40px' }}
              >
                <Trash2 size={18} />
              </Button>
            </OverlayTrigger>
          </div>

          <div style={{ flex: 1 }} className="d-flex justify-content-end">
            <Button variant="success" size="lg" className="px-3 px-md-4" style={{ minWidth: '120px' }} onClick={handleNextOrFinish}>
              {isDirectEdit ? t('save') : (isLastChart ? t('finish') : t('next_chart_simple'))}
            </Button>
          </div>
        </Container>
      </div>
    </>
  );
}
