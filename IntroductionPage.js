import React, { useEffect, useState } from 'react';
import './IntroductionPage.css';
import expleoLogo from './expleo-logo3.png';
import backgroundVideo from './bvideoww.mp4';
import { motion } from 'framer-motion';

const IntroductionPage = ({ onStart }) => {
  const [boxVisible, setBoxVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullSubtitle = "Smart failure mode analysis for smarter manufacturing.";

  useEffect(() => {
    setTimeout(() => {
      setBoxVisible(true);
      setTimeout(() => {
        setContentVisible(true);

        let i = 0;
        const typingInterval = setInterval(() => {
          if (i < fullSubtitle.length) {
            setSubtitle(fullSubtitle.substring(0, i + 1));
            i++;
          } else {
            clearInterval(typingInterval);
            setTimeout(() => setShowCursor(false), 500);
          }
        }, 30);

        return () => clearInterval(typingInterval);
      }, 500);
    }, 300);
  }, []);

  return (
    <div className="intro-container">
      <div class="background-static-frame"></div>

      <div className="content-wrapper">
        {/* Logo animation */}
        <motion.img
          src={expleoLogo}
          alt="Expleo Logo"
          className="intro-logo"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Content box animation */}
        {boxVisible && (
          <motion.div
            className="content-box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: contentVisible ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="intro-title"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                AI-Powered PFMEA Generator
              </motion.h1>

              <p className="intro-subtitle">
                {subtitle}
                {showCursor && <span className="typing-cursor">|</span>}
              </p>

              <motion.button
                onClick={onStart}
                className="intro-button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: contentVisible ? 1 : 0, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          className="intro-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <p><em>Developed by Expleo INDIA | Version 01/2025</em></p>
        </motion.div>
      </div>
    </div>
  );
};

export default IntroductionPage;