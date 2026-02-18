'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import './profile.css';

export default function ProfileClient() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`profile-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Dark Mode Toggle */}
      <button 
        className="theme-toggle" 
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      
      {/* Animated background */}
      <div className="profile-background">
        <div className="sparkle sparkle-1">✨</div>
        <div className="sparkle sparkle-2">⭐</div>
        <div className="sparkle sparkle-3">💫</div>
        <div className="sparkle sparkle-4">🌟</div>
        <div className="sparkle sparkle-5">✨</div>
        <div className="sparkle sparkle-6">⭐</div>
        <div className="sparkle sparkle-7">💫</div>
        <div className="floating-heart heart-1">💖</div>
        <div className="floating-heart heart-2">💗</div>
        <div className="floating-heart heart-3">💝</div>
        <div className="floating-heart heart-4">💕</div>
        <div className="floating-heart heart-5">💓</div>
        <div className="floating-heart heart-6">💗</div>
        <div className="floating-heart heart-7">💖</div>
        <div className="floating-heart heart-8">💕</div>
        <div className="floating-heart heart-9">💝</div>
      </div>

      <div className={`profile-content ${mounted ? 'fade-in' : ''}`}>
        {/* Main Grid Layout */}
        <div className="profile-grid">
          {/* Left Column */}
          <div className="profile-column left-column">
            {/* About Me Card with Profile */}
            <div className="profile-card about-card">
              <div className="profile-avatar-wrapper">
                <div className="avatar-glow"></div>
                <Image
                  src="/profile/elaina-pfp.png"
                  alt="Hibiki"
                  width={90}
                  height={90}
                  className="profile-avatar"
                  priority
                />
              </div>
              <div className="profile-title">
                <h1 className="profile-name">
                  Hibiki 
                </h1>
                <p className="profile-subtitle">✨ Lemons Supplier ✨</p>
              </div>
              
              <h2 className="card-title">
                <span className="title-icon">💗</span> About Me <span className="title-icon">💗</span>
              </h2>
              <div className="about-content">
                <p className="about-bio">Wandering Hibiki</p>
                <div className="about-item">
                  <span className="about-emoji">💮</span>
                  <span className="about-label">Name:</span>
                  <span className="about-value">Hibiki</span>
                </div>
                <div className="about-item">
                  <span className="about-emoji">💖</span>
                  <span className="about-label">Loves:</span>
                  <span className="about-value">Cute Fictional Girls (specially royal ones)</span>
                </div>
                <div className="about-item">
                  <span className="about-emoji">📘</span>
                  <span className="about-label">Current Status:</span>
                  <span className="about-value">Enjoying BPSR</span>
                </div>
                <div className="about-item">
                  <span className="about-emoji">🐱</span>
                  <span className="about-label">Cat or Dogs</span>
                  <span className="about-value">Meow</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-links">
                <a 
                  href="https://discordapp.com/users/275152997498224641"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link discord"
                  title="@hibikineko"
                >
                  <img 
                    src="/profile/discord-icon.png" 
                    alt="Discord" 
                    className="social-icon-img"
                  />
                  Discord - @hibikineko
                </a>
                <a 
                  href="https://myanimelist.net/animelist/HibikiNeko?status=7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link mal"
                >
                  <img 
                    src="/profile/mal-icon.png" 
                    alt="MyAnimeList" 
                    className="social-icon-img"
                  />
                  MyAnimeList Profile
                </a>
              </div>
            </div>

            {/* Currently Watching Card */}
            <div className="profile-card watching-card">
              <h2 className="card-title">
                <span className="title-icon">📺</span> Currently Watching <span className="title-icon">💗</span>
              </h2>
              <div className="watching-content">
                <div className="watching-item">
                  <span className="tv-icon">📺</span>
                  <div>
                    <span className="watching-title">Alot of Anime</span>
                  </div>
                </div>
              </div>
            </div>


            {/* Games/Hobbies Card */}
            <div className="profile-card hobbies-card">
              <h2 className="card-title">
                <span className="title-icon">🎮</span> Hobbies <span className="title-icon">✨</span>
              </h2>
              <div className="hobbies-grid">
                <div className="hobby-tag">
                  <span className="hobby-icon">🖼️</span> Anime
                </div>
                <div className="hobby-tag">
                  <span className="hobby-icon">☑️</span> Gaming
                </div>
                
                <div className="hobby-tag">
                  <span className="hobby-icon">📖</span> Reading
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="profile-column right-column">
            {/* Top 3 Favorite Characters */}
            <div className="profile-card characters-card">
              <h2 className="card-title">
                <span className="title-icon">💗</span> Top 3 Favorite Characters <span className="title-icon">💗</span>
              </h2>
              <div className="characters-grid">
                <a 
                  href="https://myanimelist.net/character/151335/Elaina?q=elaina&cat=character"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="character-card"
                >
                  <div className="character-image-wrapper">
                    <Image
                      src="/profile/elaina.png"
                      alt="Elaina"
                      width={200}
                      height={250}
                      className="character-image"
                    />
                  </div>
                  <div className="character-info">
                    <h3 className="character-name">Elaina</h3>
                    <p className="character-title">Majo no Tabitabi</p>
                    <p className="character-traits">Witch • Cheeky </p>
                  </div>
                </a>

                <a 
                  href="https://myanimelist.net/character/223977/Elysia?q=elysia&cat=character"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="character-card"
                >
                  <div className="character-image-wrapper">
                    <Image
                      src="/profile/elysia.png"
                      alt="Elysia"
                      width={200}
                      height={250}
                      className="character-image"
                    />
                  </div>
                  <div className="character-info">
                    <h3 className="character-name">Elysia</h3>
                    <p className="character-title">Honkai Impact 3rd</p>
                    <p className="character-traits">Beautiful • Charming</p>
                  </div>
                </a>

                <a 
                  href="https://myanimelist.net/character/193569/Mahiru_Shiina?q=mahiru%20shiina&cat=character"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="character-card"
                >
                  <div className="character-image-wrapper">
                    <Image
                      src="/profile/mahiru-shiina.jpg"
                      alt="Mahiru Shiina"
                      width={200}
                      height={250}
                      className="character-image"
                    />
                  </div>
                  <div className="character-info">
                    <h3 className="character-name">Mahiru Shiina</h3>
                    <p className="character-title">Angel Next Door</p>
                    <p className="character-traits">Precious • Cute</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Top 3 Favorite Anime */}
            <div className="profile-card anime-card">
              <h2 className="card-title">
                <span className="title-icon">💗</span> Top 3 Favorite Anime <span className="title-icon">💗</span>
              </h2>
              <div className="anime-grid">
                <a 
                  href="https://myanimelist.net/anime/14813/Yahari_Ore_no_Seishun_Love_Comedy_wa_Machigatteiru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anime-card-item"
                >
                  <div className="anime-image-wrapper">
                    <div className="anime-icon">🎬</div>
                    <Image
                      src="/profile/oregairu.jpg"
                      alt="Oregairu"
                      width={180}
                      height={240}
                      className="anime-image"
                    />
                  </div>
                  <div className="anime-info">
                    <h3 className="anime-name">Oregairu</h3>
                    <p className="anime-genre">Romance • School</p>
                  </div>
                </a>

                <a 
                  href="https://myanimelist.net/anime/27775/Plastic_Memories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anime-card-item"
                >
                  <div className="anime-image-wrapper">
                    <div className="anime-icon">🎬</div>
                    <Image
                      src="/profile/plastic-memories.jpg"
                      alt="Plastic Memories"
                      width={180}
                      height={240}
                      className="anime-image"
                    />
                  </div>
                  <div className="anime-info">
                    <h3 className="anime-name">Plastic Memories</h3>
                    <p className="anime-genre">Romance • Depressing</p>
                  </div>
                </a>

                <a 
                  href="https://myanimelist.net/anime/5680/K-On"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="anime-card-item"
                >
                  <div className="anime-image-wrapper">
                    <div className="anime-icon">🍿</div>
                    <Image
                      src="/profile/k-on.jpg"
                      alt="K-On"
                      width={180}
                      height={240}
                      className="anime-image"
                    />
                  </div>
                  <div className="anime-info">
                    <h3 className="anime-name">K-on</h3>
                    <p className="anime-genre">Music • School</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
