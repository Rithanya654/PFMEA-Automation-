import React from 'react';
import './ResultsPage.css';
import backgroundVideo from './bvideof.mp4';
import expleoLogo from './expleo-logo3.png';
import { motion } from 'framer-motion';

const ResultsPage = ({ results, onNewAnalysis }) => {
  return (
    <div className="results-container">
      
      {/* Background video */}
      <div class="background-static-frame"></div>

      {/* Content wrapper with dark overlay */}
      <div className="content-wrapper">
        {/* Expleo logo */}
        <motion.img
          src={expleoLogo}
          alt="Expleo Logo"
          className="intro-logo"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />

        {/* Main content box */}
        <motion.div 
          className="content-box"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="intro-title"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Analysis Complete!
            </motion.h1>

            <div className="result-metadata">
              <h3>Document Information:</h3>
              <p><strong>PFMEA Number:</strong> {results.metadata.pfmea_number}</p>
              <p><strong>Variant:</strong> {results.metadata.family_code}</p>
              <p><strong>Production Line:</strong> {results.metadata.workcenter}</p>
            </div>

            <div className="result-actions">
              <motion.a 
                href={results.excelUrl} 
                download="PFMEA_Analysis_Report.xlsx"
                className="action-button download-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download Excel Report
              </motion.a>

              <motion.button 
                onClick={onNewAnalysis}
                className="action-button new-analysis-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start New Analysis
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="intro-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <p><em>Developed by Expleo INDIA | Version 01/2025</em></p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;