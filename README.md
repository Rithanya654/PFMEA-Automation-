# PFMEA Automation Platform using AI

## Overview

This project automates the **Process Failure Mode and Effects Analysis (PFMEA)** workflow using **AI driven analysis** and **structured data processing**.  
The system converts **MBOM inputs** into **fully populated PFMEA sheets**, reducing manual effort, improving consistency, and accelerating manufacturing risk assessments.

The platform was developed as part of an **industry focused internship project** aimed at modernizing traditional spreadsheet based PFMEA workflows.

---

## Problem Statement

Traditional PFMEA preparation is:

- Manual and time consuming  
- Highly dependent on domain experts  
- Inconsistent across teams and projects  
- Difficult to scale for large manufacturing programs  

This project addresses these challenges by introducing **AI assisted PFMEA generation** while maintaining **traceability and human oversight**.

---

## Key Features

- Automated PFMEA generation from MBOM inputs  
- AI based inference of:
  - Severity  
  - Occurrence  
  - Detection  
  - Failure causes  
  - Current controls  
  - Recommended actions  
- Automatic **Risk Priority Number (RPN)** calculation  
- Structured **Excel report generation** aligned with PFMEA standards  
- Consistent formatting suitable for audits and reviews  

---

## System Architecture (Text Overview)

The PFMEA Automation Platform follows a layered architecture:

- **Input Layer:** MBOM file upload and process context parameters  
- **AI Analysis Layer:** Retrieval of historical PFMEA references and AI based risk inference  
- **Processing Layer:** Validation, normalization, and RPN calculation  
- **Output Layer:** Structured Excel PFMEA report generation  

This separation ensures scalability, maintainability, and traceability of AI generated outputs.

---

## Technology Stack

### Backend
- Python  
- FastAPI  
- Pydantic  

### AI and Data Processing
- Large Language Models (LLMs)  
- Prompt engineering for structured outputs  
- Rule based post processing  

### File and Report Generation
- OpenPyXL  
- Excel automation  

### Frontend (Optional)
- React.js  

---

## Workflow

1. Upload MBOM file  
2. Provide process context and parameters  
3. AI generates PFMEA fields using historical patterns and process logic  
4. System calculates RPN values automatically  
5. Final PFMEA Excel report is generated and downloaded  

---

## Sample Output

The generated PFMEA report includes:

- Process step mapping  
- Failure modes and effects  
- Severity, Occurrence, and Detection scores  
- Calculated RPN values  
- Highlighted high risk entries  
- Recommended mitigation actions  

---

## Impact

- Significantly reduced PFMEA preparation time  
- Improved consistency across PFMEA reports  
- Faster risk assessment cycles  
- Reduced dependency on manual spreadsheet workflows  

---

## Limitations

- AI generated outputs require domain expert validation  
- Effectiveness depends on the quality of historical PFMEA data  
- Not intended to replace engineering judgment  

---

## Future Enhancements

- Integration with PLM and MES systems  
- Feedback loop to improve AI outputs over time  
- Support for DFMEA and Control Plans  
- Dashboard for risk trend analysis  

---

## Disclaimer

This project serves as a **decision support system**.  
Final PFMEA approval should always be performed by **qualified manufacturing and quality engineers**.

---

## Author

**Rithanya Manoharaun**  
B.Tech Artificial Intelligence and Data Science  
GitHub: https://github.com/Rithanya654
