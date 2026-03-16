# Patient Pain Sketch (PPS) Web System

This is a professional medical pain marking system designed to provide a convenient **digital completion method** for clinical pain assessments. The anatomical charts and marking protocols used in this system are based on the research and methodology published in:

> **Reference:** *"Creation of the Patient Pain Sketch (PPS): A patient-reported outcome measure to describe phantom limb pain and residual limb pain"* (PMC11178259). [View Article](https://pmc.ncbi.nlm.nih.gov/articles/PMC11178259/)

The PPS system aims to streamline the clinical workflow by transitioning from paper-based sketches to a standardized digital format, enabling faster data collection and precise reporting.

## Key Features

- **Multi-Chart Workflow**: Supports selecting multiple anatomical charts (Upper Limb, Lower Limb, Amputation sites, etc.) and marking them in sequence.
- **Intuitive Drawing Tools**:
  - **Point Marker (X)**: Mark specific pain points.
  - **Arrow Marker**: Mark radiating pain or paths with a drag-to-draw interaction and automatic path optimization.
  - **Eraser**: Precision collision detection to easily remove any drawn segments.
  - **Clear All**: Quickly clear the current canvas.
- **Multi-Language Support**: Fully supports Traditional Chinese (`zh-TW`) and English (`en`) with real-time switching.
- **Professional Reporting**: Automatically merges multiple marked charts into a single multi-page PDF document, named based on the Patient ID.
- **Safety Mechanisms**:
  - Download state detection: Alerts users with a confirmation modal if they attempt to restart without saving the PDF.
  - Progress tracking: Ensures all selected charts are presented for marking.

## User Workflow

1. **Patient Login**: Enter the Patient ID (MRN) to proceed.
2. **Chart Selection**: Select one or more charts from the gallery (Upper limb charts are color-coded blue, Lower limb green).
3. **Detailed Marking**:
   - Use the bottom floating toolbar to switch tools.
   - Click "Save & Next Chart" or "Finish Marking" when done with each chart.
4. **Review & Export**:
   - Preview all marked charts on the Summary page.
   - Click "Download PDF Report" to save the file locally.
   - Click "Start Over" to clear the session for the next patient.

## Technical Architecture

- **Frontend**: React + Vite
- **Styling**: Bootstrap 5 (React-Bootstrap)
- **Icons**: Lucide React
- **Localization**: react-i18next
- **PDF Engine**:
  - `pdf.js`: Renders high-precision medical PDF templates onto the HTML5 canvas.
  - `jspdf`: Captures canvas data and generates professional multi-page reports.

## Development & Setup

### Install Dependencies
```bash
npm install
```

### Run in Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```


## Important Notes

- **Data Persistence**: This system uses temporary state management. Refreshing the browser or clicking "Start Over" will clear all unsaved markings.
- **Browser Compatibility**: Recommended for use on the latest versions of Chrome, Edge, or Safari for the best drawing experience.
- **PDF Rendering**: Scaling is handled automatically based on screen size; generated PDFs are exported at the standard A4 aspect ratio (595x842px).
