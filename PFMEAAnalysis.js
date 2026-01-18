import React, { useState } from 'react';
import axios from 'axios';
import './PFMEAAnalysis.css';
import expleoLogo from './expleo-logo3.png';
import sideBg from './side-bg.png';
import backgroundImage from './backgroundp.png';

const PFMEAAnalysis = () => {
  const [pfmeaType, setPfmeaType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    country: '',
    site: '',
    model: '',
    variant: '',
    productionLine: '',
    pfmeaNumber: '',
    revision: '',
    processResponsibility: '',
    coreTeam: '',
    preparedBy: '',
    approvedBy: '',
    mbomFile: null,
    flowDiagramFile: null
  });

  // Data options
  const countryOptions = ["France", "Germany", "India", "Italy", "Morocco", "Poland", "Portugal", "Slovakia", "Spain", "United Kingdom", "United States"];
  const siteOptions = ["Poissy", "Sochaux", "Mulhouse", "Tiruvallur", "Hosur", "Pune", "Eisenach", "Russelsheim", "Tychy", "Gilwice", "Melfi", "Cassino", "Vigo", "Zaragozza"];
  const modelOptions = ["C3 Air Cross", "Basalt", "C3", "C5 Aircross", "eC3 Air Cross", "eC3", "P5008", "P3008", "P308", "P508"];
  const variantOptions = ["C3_MHEV", "C3_PHEV", "C3_ICE", "Basalt_MHEV", "C3-AC_PHEV", "eC3", "C3-AC_MHEV", "eC3-AC", "C3-AC_ICE", "Basalt_ICE", "Basalt_PHEV", "eBasalt"];
  const productionLineOptions = ["Trim Line -2", "Trim Line -3", "Trim Line -1", "Door Sub Assembly", "Final Line-1", "Chassis Line-1", "Chassis Line-3", "Final Line-2", "Chassis Line-2", "Final Line-3", "IP Sub Assembly", "Wheel Sub Assembly", "Rear Axle Sub Assy", "Engine G/B Sub Assy", "Power Train Assy", "Front Axle Sub Assy"];
  const typeOptions = ["Pre-Launch PFMEA", "Production PFMEA"];

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
  };

  const validateForm = () => {
    const requiredFields = [
      'country', 'site', 'model', 'variant',
      'productionLine', 'pfmeaNumber', 'revision',
      'processResponsibility', 'coreTeam', 'preparedBy',
      'approvedBy', 'mbomFile'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = field === 'mbomFile' ? formData[field] : formData[field]?.trim();
      return !value;
    });
    
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    if (!pfmeaType) {
      setError('Please select PFMEA Type');
      return false;
    }
    
    if (pfmeaType === 'Production PFMEA' && !formData.flowDiagramFile) {
      setError('Process Flow Diagram is required for Production PFMEA');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;

    try {
      setIsProcessing(true);
      setResults(null);
      setProcessingStep('Preparing data...');

      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.mbomFile);
      
      if (formData.flowDiagramFile) {
        formDataToSend.append('flow_diagram', formData.flowDiagramFile);
      }

      // Prepare input parameters - only required fields for filtering
      const inputParams = {
        lcdv16: formData.variant,
        plant: formData.site,
        model: formData.model,
        family_code: formData.variant,
        workcenter: formData.productionLine,
        // Additional fields for database storage
        country: formData.country, 
        pfmea_type: pfmeaType,
        pfmea_number: formData.pfmeaNumber,
        revision: formData.revision,
        process_responsibility: formData.processResponsibility,
        core_team: formData.coreTeam,
        prepared_by: formData.preparedBy,
        approved_by: formData.approvedBy
      };

      formDataToSend.append('input_params', JSON.stringify(inputParams));

      // Step 1: Upload and process MBOM
      setProcessingStep('Uploading and processing MBOM...');
      const uploadResponse = await axios.post(
        `${API_BASE_URL}/upload_MBOM`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000 // 5 minutes timeout
        }
      );

      // Validate upload response
      if (!uploadResponse.data?.data?.final_data) {
        throw new Error('Invalid response format from server');
      }

      // Step 2: Process with AI
      setProcessingStep('Analyzing with AI...');
      const processResponse = await axios.post(
        `${API_BASE_URL}/Process_PFMEA`,
        {
          missing_severity_df: uploadResponse.data.data.missing_severity || [],
          missing_control_prevention_df: uploadResponse.data.data.missing_control_prevention || [],
          missing_recommended_action_df: uploadResponse.data.data.missing_recommended_action || [],
          final_df_df: uploadResponse.data.data.final_data || [],
          severity_check_criteria: []
        },
        { timeout: 300000 }
      );

      // Validate process response
      if (!processResponse.data?.final_data) {
        throw new Error('Invalid analysis response from server');
      }

      // Step 3: Generate HTML
      setProcessingStep('Generating HTML report...');
      const htmlResponse = await axios.post(
        `${API_BASE_URL}/Create_HTML`,
        { final_df: processResponse.data.final_data },
        { timeout: 300000 }
      );

      // Validate HTML response
      if (!htmlResponse.data?.html) {
        throw new Error('Invalid HTML response from server');
      }

      // Step 4: Generate Excel
      setProcessingStep('Preparing Excel download...');
      const excelResponse = await axios.post(
        `${API_BASE_URL}/download_excel`,
        processResponse.data.final_data,
        { 
          responseType: 'blob',
          timeout: 300000 
        }
      );

      const excelUrl = window.URL.createObjectURL(
        new Blob([excelResponse.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
      );

      setResults({
        html: htmlResponse.data.html, // Access the html property from response
        excelUrl,
        showHtml: false,
        metadata: uploadResponse.data.data.metadata // Store all metadata
      });

    } catch (err) {
      let errorMessage = 'An error occurred during processing';
      
      if (err.response) {
        // Handle backend errors
        if (typeof err.response.data === 'object' && err.response.data !== null) {
          if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else {
            errorMessage = JSON.stringify(err.response.data);
          }
        } else if (err.response.status === 413) {
          errorMessage = 'File too large. Please upload a smaller file.';
        } else if (err.response.status === 404) {
          errorMessage = 'Data not found. Please check your input.';
        } else if (err.response.status === 422) {
          errorMessage = 'Invalid input data. Please check your form.';
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const toggleHtmlResults = () => {
    setResults(prev => ({
      ...prev,
      showHtml: !prev.showHtml
    }));
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="container">
      <div className="sidebar" style={{ backgroundImage: `url(${sideBg})` }}>
        <div className="logo-container">
          <img src={expleoLogo} alt="Expleo Logo" className="logo" />
        </div>
        <div className="pfmea-box">
          POTENTIAL FAILURE MODE<br />
          AND EFFECTS ANALYSIS<br />
          <br />
          <span style={{ fontSize: '28px' }}>[PFMEA]</span>
        </div>
        <div className="sidebar-footer">
          <p className="version">Version: 01/2025</p>
          <p className="developer">Developed by Expleo INDIA</p>
        </div>
      </div>

      <div className="main-content">
        <div className="main-bg-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
        
        {isProcessing && (
          <div className="processing-modal">
            <div className="processing-content">
              <h3>Processing PFMEA Analysis</h3>
              <p>{processingStep}</p>
              <div className="spinner"></div>
            </div>
          </div>
        )}

        <form className="form-scroll-container" onSubmit={handleSubmit}>
          {/* Product/Family Information Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>Product/ Family Information</h2>
            </div>
            <div className="section-content">
              <div className="form-grid">
                {[
                  { name: "country", label: "Country", options: countryOptions },
                  { name: "site", label: "Site", options: siteOptions },
                  { name: "model", label: "Vehicle Model", options: modelOptions },
                  { name: "variant", label: "Applicable Family", options: variantOptions },
                  { name: "productionLine", label: "Production Line", options: productionLineOptions }
                ].map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="mandatory">{field.label}</label>
                    <select
                      className="form-input"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Core Team/Responsibility Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>Core Team/ Responsibility Information</h2>
            </div>
            <div className="section-content">
              <div className="form-grid">
                <div className="form-group">
                  <label className="mandatory">PFMEA Type</label>
                  <select
                    className="form-input"
                    value={pfmeaType}
                    onChange={(e) => setPfmeaType(e.target.value)}
                    required
                  >
                    <option value="">Select Type</option>
                    {typeOptions.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {[
                  { name: "pfmeaNumber", label: "PFMEA Number", placeholder: "Enter PFMEA Number" },
                  { name: "revision", label: "Revision No./ Date", placeholder: "Enter Revision No./ Date" },
                  { name: "processResponsibility", label: "Process Responsibility", placeholder: "Enter Process Responsibility" },
                  { name: "coreTeam", label: "Core Team", placeholder: "Enter Core Team" },
                  { name: "preparedBy", label: "Prepared by", placeholder: "Enter Prepared by" },
                  { name: "approvedBy", label: "Approved by", placeholder: "Enter Approved by" }
                ].map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="mandatory">{field.label}</label>
                    <input
                      type="text"
                      className="form-input"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>DOCUMENT UPLOADS</h2>
            </div>
            <div className="section-content">
              <div className="upload-container">
                <div className="upload-section">
                  <label className="mandatory">Upload MBOM</label>
                  <div className="file-upload-row">
                    <label className="file-upload-button">
                      
                      <input
                        type="file"
                        className="file-input-hidden"
                        name="mbomFile"
                        onChange={handleFileChange}
                        accept=".csv,.xlsx"
                        required
                      />
                    </label>
                    <span className="file-name">
                      {formData.mbomFile ? formData.mbomFile.name : ""}
                    </span>
                  </div>
                  {!formData.mbomFile && (
                    <span className="error-message">MBOM file is required</span>
                  )}
                </div>

                <div className="upload-section">
                  <label className={pfmeaType === "Production PFMEA" ? "mandatory" : ""}>
                    Process Flow Diagram
                  </label>
                  <div className="file-upload-row">
                    <label className="file-upload-button">
                      
                      <input
                        type="file"
                        className="file-input-hidden"
                        name="flowDiagramFile"
                        onChange={handleFileChange}
                        accept=".csv,.xlsx"
                        required={pfmeaType === "Production PFMEA"}
                      />
                    </label>
                    <span className="file-name">
                      {formData.flowDiagramFile ? formData.flowDiagramFile.name : ""}
                    </span>
                  </div>
                  {pfmeaType === "Production PFMEA" && !formData.flowDiagramFile && (
                    <span className="error-message">Process Flow Diagram is required for Production PFMEA</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="button-container">
            <button 
              type="submit" 
              className="proceed-button"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-small"></span>
                  Processing...
                </>
              ) : "Proceed"}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-display">
            <div className="error-header">
              <h3>Error</h3>
              <button onClick={dismissError} className="close-button">×</button>
            </div>
            <div className="error-content">
              {error}
            </div>
          </div>
        )}

        {results && (
          <div className="results-container">
            <h2>Analysis Complete!</h2>
            
            <div className="result-actions">
              <button 
                onClick={toggleHtmlResults}
                className="action-button"
              >
                {results.showHtml ? "Hide Preview" : "View HTML Preview"}
              </button>
              
              <a 
                href={results.excelUrl} 
                download="PFMEA_Analysis_Report.xlsx"
                className="action-button download-button"
              >
                Download Excel Report
              </a>
            </div>

            {results.showHtml && results.html && (
            <div className="html-preview">
              <div 
                dangerouslySetInnerHTML={{ __html: results.html }}
              />
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PFMEAAnalysis;