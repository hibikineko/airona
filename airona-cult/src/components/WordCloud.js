'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const WordCloud = ({ data, words }) => {
  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Use either data or words prop for backwards compatibility
  const wordData = data || words;

  // Fun and vibrant color palette
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#EE5A24', '#009432', '#0652DD', '#9980FA', '#FFC312',
    '#C44569', '#F8B500', '#E17055', '#6C5CE7', '#A29BFE',
    '#FD79A8', '#FDCB6E', '#E84393', '#00B894', '#0984E3',
    '#74B9FF', '#E17055', '#81ECEC', '#FAB1A0', '#FF7675'
  ];

  // Common stop words to filter out (reduced list to keep more words)
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
    'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
  ]);

  // Process data to extract individual words
  const processDataToWords = useCallback((rawData) => {
    const wordCounts = {};

    rawData.forEach(item => {
      // Get the text content (handle different data formats)
      const text = item.text || item.name || String(item);
      
      // Split the text into words
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/) // Split by whitespace
        .filter(word => 
          word.length > 1 && // Keep words with 2+ characters (less restrictive)
          !stopWords.has(word) // Remove stop words
        );

      words.forEach(word => {
        // Multiply by the count from the original data (if available)
        const multiplier = item.frequency || item.count || 1;
        wordCounts[word] = (wordCounts[word] || 0) + multiplier;
      });
    });

    // Convert to array and sort by frequency
    return Object.entries(wordCounts)
      .map(([word, count]) => ({ 
        text: word, 
        frequency: count 
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }, [stopWords]);

  const createWordCloud = useCallback((container, words, containerWidth, containerHeight) => {
    // Clear container
    container.innerHTML = '';

    if (!words || words.length === 0) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No data available</div>';
      return;
    }

    // Process the data to extract individual words
    const individualWords = processDataToWords(words);
    
    if (individualWords.length === 0) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No meaningful words found</div>';
      return;
    }

    // Calculate frequency-based font sizes with better distribution
    const frequencies = individualWords.map(w => w.frequency);
    const maxFreq = Math.max(...frequencies);
    const minFreq = Math.min(...frequencies);
    
    const maxFontSize = 42;
    const minFontSize = 10;

    // Create processed words with calculated sizes - take more words for density
    const processedWords = individualWords.slice(0, 120).map((word, index) => {
      let normalizedFreq = maxFreq === minFreq ? 1 : (word.frequency - minFreq) / (maxFreq - minFreq);
      
      // Apply logarithmic scaling for better size distribution
      normalizedFreq = Math.pow(normalizedFreq, 0.7);
      
      const fontSize = minFontSize + (normalizedFreq * (maxFontSize - minFontSize));
      
      return {
        text: word.text,
        frequency: word.frequency,
        fontSize: Math.round(fontSize),
        color: colors[Math.floor(Math.random() * colors.length)],
        placed: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    });

    // Sort by frequency (highest first for better placement)
    processedWords.sort((a, b) => b.frequency - a.frequency);

    // Create canvas with better dimensions
    const canvas = document.createElement('canvas');
    const scale = window.devicePixelRatio || 1;
    canvas.width = containerWidth * scale;
    canvas.height = containerHeight * scale;
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.backgroundColor = '#ffffff';
    canvas.style.cursor = isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default');
    canvas.style.transform = `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`;
    canvas.style.transformOrigin = 'center center';
    canvas.style.transition = isDragging ? 'none' : 'transform 0.3s ease';
    
    // Add mouse event listeners for panning
    canvas.onmousedown = handleMouseDown;
    canvas.onmousemove = handleMouseMove;
    canvas.onmouseup = handleMouseUp;
    canvas.onmouseleave = handleMouseUp;
    
    // Add wheel zoom support
    canvas.onwheel = handleWheel;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Measure text and calculate dimensions with better font rendering
    processedWords.forEach(word => {
      ctx.font = `${word.fontSize}px Arial, Helvetica, sans-serif`;
      const metrics = ctx.measureText(word.text);
      word.width = metrics.width;
      word.height = word.fontSize * 0.8; // Better height calculation
    });

    // Advanced word placement algorithm
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const placedWords = [];

    // Place words with multiple strategies
    processedWords.forEach((word, index) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 2000;

      if (index === 0) {
        // Center the largest word
        word.x = centerX - word.width / 2;
        word.y = centerY + word.height / 2;
        placed = true;
      } else {
        // Try multiple placement strategies
        const strategies = [
          // Strategy 1: Tight spiral
          () => {
            let radius = word.fontSize * 0.5;
            let angle = Math.random() * Math.PI * 2;
            const angleStep = 0.1;
            const radiusStep = 1;

            for (let i = 0; i < 800 && !placed; i++) {
              const x = centerX + radius * Math.cos(angle) - word.width / 2;
              const y = centerY + radius * Math.sin(angle) + word.height / 2;

              if (x >= 2 && x + word.width <= containerWidth - 2 && 
                  y >= word.height && y <= containerHeight - 2) {
                
                if (!hasCollision(x, y, word, placedWords)) {
                  word.x = x;
                  word.y = y;
                  placed = true;
                  return;
                }
              }

              angle += angleStep;
              if (angle > Math.PI * 2) {
                angle = 0;
                radius += radiusStep;
              }
            }
          },
          
          // Strategy 2: Random placement near existing words
          () => {
            for (let i = 0; i < 300 && !placed; i++) {
              if (placedWords.length > 0) {
                const nearWord = placedWords[Math.floor(Math.random() * placedWords.length)];
                const offsetX = (Math.random() - 0.5) * 100;
                const offsetY = (Math.random() - 0.5) * 100;
                const x = nearWord.x + offsetX;
                const y = nearWord.y + offsetY;

                if (x >= 2 && x + word.width <= containerWidth - 2 && 
                    y >= word.height && y <= containerHeight - 2) {
                  
                  if (!hasCollision(x, y, word, placedWords)) {
                    word.x = x;
                    word.y = y;
                    placed = true;
                    return;
                  }
                }
              }
            }
          },

          // Strategy 3: Grid placement
          () => {
            const gridSize = Math.max(15, word.fontSize * 0.6);
            for (let row = 0; row < containerHeight / gridSize && !placed; row++) {
              for (let col = 0; col < containerWidth / gridSize && !placed; col++) {
                const x = col * gridSize + Math.random() * 10;
                const y = row * gridSize + word.height + Math.random() * 10;

                if (x >= 2 && x + word.width <= containerWidth - 2 && 
                    y >= word.height && y <= containerHeight - 2) {
                  
                  if (!hasCollision(x, y, word, placedWords)) {
                    word.x = x;
                    word.y = y;
                    placed = true;
                    return;
                  }
                }
              }
            }
          }
        ];

        // Try each strategy
        for (const strategy of strategies) {
          if (!placed) {
            strategy();
          }
        }
      }

      if (placed) {
        placedWords.push({
          x: word.x,
          y: word.y - word.height,
          width: word.width,
          height: word.height
        });
        
        // Draw the word with better styling
        ctx.fillStyle = word.color;
        ctx.font = `bold ${word.fontSize}px Arial, Helvetica, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        
        // Add subtle shadow for depth
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(word.text, word.x, word.y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    });

    // Helper function for collision detection
    function hasCollision(x, y, word, placedWords) {
      const padding = 2;
      const wordRect = {
        x: x - padding,
        y: y - word.height - padding,
        width: word.width + padding * 2,
        height: word.height + padding * 2
      };

      return placedWords.some(placed => {
        return !(wordRect.x + wordRect.width < placed.x ||
                placed.x + placed.width < wordRect.x ||
                wordRect.y + wordRect.height < placed.y ||
                placed.y + placed.height < wordRect.y);
      });
    }

    container.appendChild(canvas);
    
    console.log(`Dense word cloud: ${placedWords.length}/${processedWords.length} words placed`);
  }, [colors, processDataToWords, zoomLevel, pan, isDragging]);

  // Effect for main word cloud
  useEffect(() => {
    if (containerRef.current && wordData) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth || 800;
      const containerHeight = Math.min(600, containerWidth * 0.75);
      
      createWordCloud(container, wordData, containerWidth, containerHeight);
    }
  }, [wordData, createWordCloud, zoomLevel, pan]);

  // Mouse event handlers for panning
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      
      // Limit panning to reasonable bounds
      const maxPan = 200 * zoomLevel;
      newPan.x = Math.max(-maxPan, Math.min(maxPan, newPan.x));
      newPan.y = Math.max(-maxPan, Math.min(maxPan, newPan.y));
      
      setPan(newPan);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.4, Math.min(2, prev + delta)));
  };

  // Zoom control functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.4));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 }); // Reset pan when resetting zoom
  };

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
    <Box sx={{ position: 'relative' }}>
      {/* Zoom Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          display: 'flex',
          gap: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 2,
          padding: 0.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton 
            size="small" 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2}
            sx={{ 
              color: zoomLevel >= 2 ? '#ccc' : '#666',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
            }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Reset Zoom">
          <IconButton 
            size="small" 
            onClick={handleResetZoom}
            sx={{ 
              color: '#666',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
            }}
          >
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Zoom Out">
          <IconButton 
            size="small" 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.4}
            sx={{ 
              color: zoomLevel <= 0.4 ? '#ccc' : '#666',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
            }}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Word Cloud Container */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          minHeight: '500px',
          border: '1px solid #e0e0e0',
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          userSelect: 'none', // Prevent text selection during drag
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }
        }}
      />

      {/* Instructions */}
      {zoomLevel > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 2,
            fontSize: '12px',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          Click and drag to pan • Scroll to zoom
        </Box>
      )}
    </Box>
  );
};

export default WordCloud;