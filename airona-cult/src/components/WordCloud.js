'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';

const WordCloud = ({ data, words }) => {
  const containerRef = useRef(null);
  
  // Use either data or words prop for backwards compatibility
  const wordData = data || words;

  // Professional color palette
  const colors = [
    '#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#7b1fa2',
    '#455a64', '#5d4037', '#303f9f', '#c2185b', '#0288d1',
    '#00695c', '#bf360c', '#4527a0', '#558b2f', '#ef6c00',
    '#6a1b9a', '#1565c0', '#2e7d32', '#ad1457', '#0277bd'
  ];

  const createWordCloud = useCallback((container, words, containerWidth, containerHeight) => {
    // Clear container
    container.innerHTML = '';

    if (!words || words.length === 0) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No data available</div>';
      return;
    }

    // Normalize data format
    const normalizedWords = words.map(word => ({
      text: word.text || word.name || word,
      frequency: word.frequency || word.count || 1
    }));

    // Calculate frequency-based font sizes
    const frequencies = normalizedWords.map(w => w.frequency);
    const maxFreq = Math.max(...frequencies);
    const minFreq = Math.min(...frequencies);
    
    const maxFontSize = 36;
    const minFontSize = 12;

    // Create processed words with calculated sizes
    const processedWords = normalizedWords.map((word, index) => {
      const normalizedFreq = maxFreq === minFreq ? 1 : (word.frequency - minFreq) / (maxFreq - minFreq);
      const fontSize = minFontSize + (normalizedFreq * (maxFontSize - minFontSize));
      
      return {
        text: word.text,
        frequency: word.frequency,
        fontSize: Math.round(fontSize),
        color: colors[index % colors.length],
        placed: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    });

    // Sort by frequency (highest first for better placement)
    processedWords.sort((a, b) => b.frequency - a.frequency);

    // Create canvas
    const canvas = document.createElement('canvas');
    const scale = window.devicePixelRatio || 1;
    canvas.width = containerWidth * scale;
    canvas.height = containerHeight * scale;
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Measure text and calculate dimensions
    processedWords.forEach(word => {
      ctx.font = `bold ${word.fontSize}px Arial, sans-serif`;
      const metrics = ctx.measureText(word.text);
      word.width = metrics.width;
      word.height = word.fontSize;
    });

    // Word placement algorithm with spiral pattern
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const placedWords = [];

    processedWords.forEach((word, index) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 500;

      // Try center position first for the largest word
      if (index === 0) {
        word.x = centerX - word.width / 2;
        word.y = centerY;
        placed = true;
      } else {
        // Spiral placement for other words
        let radius = 20;
        let angle = 0;
        const angleStep = 0.3;
        const radiusStep = 2;

        while (!placed && attempts < maxAttempts) {
          const x = centerX + radius * Math.cos(angle) - word.width / 2;
          const y = centerY + radius * Math.sin(angle);

          // Check bounds
          if (x >= 10 && x + word.width <= containerWidth - 10 && 
              y >= 10 && y + word.height <= containerHeight - 10) {
            
            // Check collision with placed words
            let collision = false;
            for (const placedWord of placedWords) {
              if (isColliding(x, y, word, placedWord)) {
                collision = true;
                break;
              }
            }

            if (!collision) {
              word.x = x;
              word.y = y;
              placed = true;
            }
          }

          // Update spiral position
          angle += angleStep;
          if (angle > Math.PI * 2) {
            angle = 0;
            radius += radiusStep;
          }
          attempts++;
        }

        // Fallback: place in grid if spiral fails
        if (!placed) {
          const gridSize = 50;
          let gridX = 20;
          let gridY = 20;
          let gridPlaced = false;

          while (!gridPlaced && gridY < containerHeight - word.height) {
            let collision = false;
            for (const placedWord of placedWords) {
              if (isColliding(gridX, gridY, word, placedWord)) {
                collision = true;
                break;
              }
            }

            if (!collision && gridX + word.width < containerWidth - 20) {
              word.x = gridX;
              word.y = gridY;
              placed = true;
              gridPlaced = true;
            }

            gridX += gridSize;
            if (gridX + word.width >= containerWidth - 20) {
              gridX = 20;
              gridY += gridSize;
            }
          }
        }
      }

      if (placed) {
        placedWords.push(word);
        
        // Draw the word
        ctx.fillStyle = word.color;
        ctx.font = `bold ${word.fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(word.text, word.x, word.y - word.height + 4);
      }
    });

    container.appendChild(canvas);
    
    console.log(`Word cloud generated: ${placedWords.length}/${processedWords.length} words placed`);
  }, [colors]);

  // Collision detection function
  const isColliding = (x, y, word, placedWord) => {
    const padding = 8;
    return !(x + word.width + padding < placedWord.x ||
             x > placedWord.x + placedWord.width + padding ||
             y < placedWord.y - placedWord.height - padding ||
             y - word.height > placedWord.y + padding);
  };

  // Effect for main word cloud
  useEffect(() => {
    if (containerRef.current && wordData) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth || 600;
      const containerHeight = Math.min(400, containerWidth * 0.6);
      
      createWordCloud(container, wordData, containerWidth, containerHeight);
    }
  }, [wordData, createWordCloud]);

  // Show fallback if no data
  if (!wordData || wordData.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '300px',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No favorite activities data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: '300px',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }
      }}
    />
  );
};

export default WordCloud;