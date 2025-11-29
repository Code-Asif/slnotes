import { useState, useEffect } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { getCurrentLanguage, toggleTranslation } from '../utils/translate';

const GoogleTranslate = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Check current language on mount and when it changes
    const updateLanguage = () => {
      setCurrentLang(getCurrentLanguage());
    };

    updateLanguage();

    // Check periodically (in case cookie changes externally)
    const interval = setInterval(updateLanguage, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTranslate = () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    
    // Use the utility function
    toggleTranslation();
    
    // Reset after a short delay (in case translation doesn't happen)
    setTimeout(() => {
      setIsTranslating(false);
    }, 2000);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={currentLang === 'hi' ? 'Switch to English' : 'Switch to Hindi (हिंदी)'}>
        <span>
          <IconButton
            onClick={handleTranslate}
            color="inherit"
            disabled={isTranslating}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
              '&.Mui-disabled': {
                opacity: 0.6,
              },
            }}
          >
            <TranslateIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default GoogleTranslate;
