import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_title": "Patient Pain Sketch System",
      "home_title": "Patient Basic Information",
      "home_subtitle": "Please enter Patient ID and select charts.",
      "patient_id": "Patient ID",
      "patient_id_placeholder": "Please enter Patient ID",
      "full_name": "Full Name",
      "dob": "Date of Birth",
      "date": "Filling Date",
      "upper_limb": "Upper Limb",
      "lower_limb": "Lower Limb",
      "select": "Select Chart",
      "select_charts_title": "Select Charts for Marking",
      "select_charts_subtitle": "Multi-selection allowed. Charts will appear in sequence.",
      "start_sketch": "Start Marking",
      "download_pdf": "Download PDF Report",

      "back": "Back",
      "back_to_selection": "Back to Selection",
      "prev_chart": "Previous",
      "next_chart_simple": "Next",
      "next": "Next",
      "finish": "Finish Marking",
      "save": "Save",
      "edit": "Edit",
      "continue_editing": "Continue Editing",
      "start_over": "Start Over",
      "next_chart": "Save & Next Chart",
      "cancel": "Cancel",
      "clear_all": "Clear All",

      "stage2_title": "Step 2: Detailed Marking",
      "stage2_tool": "Tool:",
      "stage2_marker_x": "Point Marker (X)",
      "stage2_marker_arrow": "Arrow Marker",
      "stage2_marker_eraser": "Eraser",

      "summary_title": "Pain Chart Marking Results",
      "summary_stage2": "Pain Chart",
      "summary_instr": "Instructions: Review your marking results below. Click the 'Edit' button on any chart to modify its marks. Once complete, click 'Download PDF' to save the report.",
      "progress_label": "Marking Progress",

      "detail_instr": "Instructions: Select a tool from the toolbar below: Click to mark a point (X), or drag to draw an arrow. Use the eraser to click or drag over marks to remove them. Click 'Save' or 'Next' when finished.",

      "restart_warning_title": "Warning: Data not saved",
      "restart_warning_msg": "You haven't downloaded the PDF report yet. Starting over will clear all current drawings. Are you sure?",
      "restart_confirm": "Confirm Start Over",

      "term_PPS_Forequarter": "Forequarter",
      "term_PPS_Transhumeral": "Transhumeral",
      "term_PPS_Transradial": "Transradial",
      "term_PPS_Upper_limb": "Upper Limb Overall",
      "term_PPS_Hindquarter": "Hindquarter",
      "term_PPS_AKA": "Above-Knee Amputation (AKA)",
      "term_PPS_BKA": "Below-Knee Amputation (BKA)",
      "term_PPS_Lower_limb": "Lower Limb Overall"
    }
  },
  'zh-TW': {
    translation: {
      "app_title": "病患疼痛部位標記系統",
      "home_title": "病患基本資料",
      "home_subtitle": "請輸入病歷號並填寫圖表。",
      "patient_id": "病歷",
      "patient_id_placeholder": "請輸入病歷號",
      "full_name": "姓名",
      "dob": "出生日期",
      "date": "填寫日期",
      "upper_limb": "上肢",
      "lower_limb": "下肢",
      "select": "選擇圖表",
      "select_charts_title": "選擇需要標記的圖表",
      "select_charts_subtitle": "您選擇的圖表將會依序出現供您標記(可多選)。",
      "start_sketch": "開始標記",
      "download_pdf": "下載 PDF",

      "back": "返回",
      "back_to_selection": "返回選擇",
      "prev_chart": "上一張",
      "next_chart_simple": "下一張",
      "next": "下一步",
      "finish": "完成標記",
      "save": "儲存",
      "edit": "編輯",
      "continue_editing": "返回編輯",
      "start_over": "重新開始",
      "next_chart": "下一張",
      "cancel": "取消",
      "clear_all": "清除全部",

      "stage2_title": "詳細疼痛部位標記",
      "stage2_tool": "標記工具:",
      "stage2_marker_x": "單點標記 (X)",
      "stage2_marker_arrow": "箭頭標記",
      "stage2_marker_eraser": "橡皮擦",

      "summary_title": "疼痛圖表標記結果",
      "summary_stage2": "疼痛圖表",
      "summary_instr": "使用說明：您可以在此檢視各圖表標記結果。若需修改，點擊圖表右下的「編輯」即可重回標記頁面。確認無誤後點擊「下載 PDF」儲存檔案。",
      "progress_label": "填答進度",

      "detail_instr": "使用說明：您可以從下方工具列選擇工具。單點(X)：點擊圖表可標記。箭頭：按住拖曳可繪製。橡皮擦：點擊或拖曳標記即可清除。",

      "restart_warning_title": "警告：尚未存檔",
      "restart_warning_msg": "您尚未下載 PDF 報告。按下重新開始將會清除目前的標記並回到首頁。您確定要繼續嗎？",
      "restart_confirm": "確定重新開始",

      "term_PPS_Forequarter": "肩胛胸廓截肢 (Forequarter)",
      "term_PPS_Transhumeral": "肘上截肢 (Transhumeral)",
      "term_PPS_Transradial": "肘下截肢 (Transradial)",
      "term_PPS_Upper_limb": "上肢 (Upper Limb)",
      "term_PPS_Hindquarter": "骨盆半截肢 (Hindquarter)",
      "term_PPS_AKA": "膝上截肢 (AKA)",
      "term_PPS_BKA": "膝下截肢 (BKA)",
      "term_PPS_Lower_limb": "下肢 (Lower Limb)"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
