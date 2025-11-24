"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [category, setCategory] = useState("sinema_sanat");
  const [selectedMonth, setSelectedMonth] = useState("12m");
  const [selectedView, setSelectedView] = useState("10000"); 

  async function fetchData() {
    setLoading(true);
    setHasSearched(true);
    setVideos([]); 
    try {
      // Not: API endpointinizin çalıştığını varsayıyorum.
      const res = await fetch(`/api/scrape?months=${selectedMonth}&minViews=${selectedView}&category=${category}`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Sayı formatlayıcı (Apple tarzı temiz görünüm için)
  const formatNumber = (num) => {
    return new Intl.NumberFormat('tr-TR', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  return (
    <div className="main-container">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
            --apple-bg: #000000;
            --apple-card-bg: #1c1c1e;
            --apple-hover-bg: #2c2c2e;
            --apple-text-primary: #f5f5f7;
            --apple-text-secondary: #86868b;
            --apple-blue: #007AFF;
            --apple-blue-hover: #0062cc;
            --apple-border: rgba(255, 255, 255, 0.1);
            --section-gap: 60px;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: var(--apple-bg);
            color: var(--apple-text-primary);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        .main-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 80px 24px;
            max-width: 1440px;
            margin: 0 auto;
        }

        /* --- Header --- */
        .header {
            text-align: center;
            margin-bottom: var(--section-gap);
            animation: fadeIn 0.8s ease-out;
        }

        .title {
            font-size: 56px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.02em;
            color: var(--apple-text-primary);
            /* İsteğe bağlı: Apple tarzı hafif degrade */
            background: linear-gradient(180deg, #ffffff 0%, #b0b0b0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .subtitle {
            color: var(--apple-text-secondary);
            font-size: 21px;
            font-weight: 400;
            margin-top: 12px;
            letter-spacing: 0.01em;
        }

        /* --- Control Panel (Frosted Glass) --- */
        .control-panel-wrapper {
            width: 100%;
            max-width: 1100px;
            margin-bottom: var(--section-gap);
            position: relative;
            z-index: 2;
        }

        .control-panel {
            background: rgba(28, 28, 30, 0.65);
            backdrop-filter: blur(25px) saturate(180%);
            -webkit-backdrop-filter: blur(25px) saturate(180%);
            border: 1px solid var(--apple-border);
            padding: 40px;
            border-radius: 32px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            align-items: end;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        label {
            font-size: 13px;
            font-weight: 600;
            color: var(--apple-text-secondary);
            letter-spacing: 0.03em;
            margin-left: 4px;
        }

        select {
            appearance: none;
            background-color: var(--apple-card-bg);
            color: var(--apple-text-primary);
            padding: 18px 24px;
            border-radius: 16px;
            border: 1px solid var(--apple-border);
            font-size: 16px;
            font-weight: 500;
            font-family: inherit;
            outline: none;
            cursor: pointer;
            transition: all 0.2s ease;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 16px center;
            background-size: 18px;
        }

        select:hover {
            border-color: var(--apple-blue);
            background-color: var(--apple-hover-bg);
        }
        
        select:focus {
             border-color: var(--apple-blue);
             box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
        }

        .search-btn-container {
            display: flex;
            justify-content: flex-end;
        }

        .search-btn {
            background-color: var(--apple-blue);
            color: white;
            border: none;
            border-radius: 16px;
            font-weight: 600;
            font-size: 17px;
            cursor: pointer;
            padding: 18px 48px;
            height: auto;
            transition: all 0.2s ease;
            width: 100%;
        }

        .search-btn:hover {
            background-color: var(--apple-blue-hover);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 122, 255, 0.25);
        }

        /* --- States --- */
        .loading-text, .no-results {
            font-size: 24px;
            font-weight: 500;
            color: var(--apple-text-secondary);
            text-align: center;
            margin: 40px 0;
            animation: fadeIn 0.5s;
        }
        .no-results span { font-size: 17px; margin-top: 8px; display: block; }

        /* --- Video Grid --- */
        .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 40px;
            width: 100%;
            max-width: 1200px;
            animation: slideUp 0.6s ease-out;
        }

        /* --- Video Card --- */
        .video-card {
            background-color: var(--apple-card-bg);
            border-radius: 24px;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            display: flex;
            flex-direction: column;
            border: 1px solid transparent;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .video-card:hover {
            transform: scale(1.02);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            border-color: var(--apple-border);
        }

        .thumbnail-container {
            position: relative;
            width: 100%;
            padding-top: 56.25%; /* 16:9 Aspect Ratio */
            background-color: #2c2c2e;
        }

        .thumbnail {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.3s;
        }

        .card-content {
            padding: 24px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .video-title {
            font-size: 18px;
            font-weight: 600;
            line-height: 1.3;
            margin: 0 0 8px 0;
            color: var(--apple-text-primary);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .channel-name {
            color: var(--apple-text-secondary);
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 20px;
        }

        .card-footer {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .stats-container {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .stat-views {
            font-size: 14px;
            font-weight: 600;
            color: var(--apple-text-primary);
        }
        
        .stat-date {
             font-size: 13px;
             color: var(--apple-text-secondary);
        }

        .watch-btn {
            background-color: rgba(0, 122, 255, 0.1);
            color: var(--apple-blue);
            padding: 10px 24px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }

        .watch-btn:hover {
            background-color: var(--apple-blue);
            color: white;
        }

        /* --- Animations --- */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

        /* --- Responsive --- */
        @media (max-width: 768px) {
            .title { font-size: 42px; }
            .control-panel { padding: 24px; gap: 24px; grid-template-columns: 1fr; }
            .search-btn { width: 100%; }
        }
      `}</style>

      <header className="header">
        <h1 className="title">BurakTube</h1>
        <p className="subtitle">Global içerik arşivini keşfedin.</p>
      </header>

      <div className="control-panel-wrapper">
        <div className="control-panel">
          <div className="filter-group">
            <label>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <optgroup label="Gündem ve Ekonomi">
                <option value="kripto_finans">Kripto & Bitcoin</option>
                <option value="ekonomi">Ekonomi & Finans</option>
                <option value="gundem">Global Gündem</option>
              </optgroup>
              <optgroup label="Teknoloji ve Gelecek">
                <option value="yapay_zeka">Yapay Zeka (AI)</option>
                <option value="teknoloji">Gelecek Teknolojileri</option>
                <option value="siber_guvenlik">Siber Güvenlik</option>
                <option value="otomobil">Otomobil & Mühendislik</option>
                <option value="girisimcilik">Girişimcilik</option>
              </optgroup>
              <optgroup label="Tarih ve Toplum">
                <option value="savas">Savaş Tarihi</option>
                <option value="imparatorluk">İmparatorluklar</option>
                <option value="soguk_savas">Soğuk Savaş</option>
                <option value="suç_kriminoloji">Suç & Kriminoloji</option>
              </optgroup>
              <optgroup label="Bilim ve Keşif">
                <option value="uzay">Uzay & Evren</option>
                <option value="bilim">Bilim & Fizik</option>
                <option value="saglik">Sağlık & Tıp</option>
                <option value="cografya">Coğrafya & Jeopolitik</option>
              </optgroup>
              <optgroup label="Kültür ve Sanat">
                <option value="psikoloji">Psikoloji</option>
                <option value="felsefe">Felsefe</option>
                <option value="sinema_sanat">Sinema & Sanat</option>
                <option value="spor_tarihi">Spor Tarihi</option>
              </optgroup>
            </select>
          </div>

          <div className="filter-group">
            <label>Zaman Aralığı</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              <option value="3d">Son 3 Gün</option>
              <option value="7d">Son 1 Hafta</option>
              <option value="15d">Son 15 Gün</option>
              <option value="1m">Son 1 Ay</option>
              <option value="3m">Son 3 Ay</option>
              <option value="6m">Son 6 Ay</option>
              <option value="12m">Son 1 Yıl</option>
              <option value="24m">Son 2 Yıl</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Minimum İzlenme</label>
            <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
              <option value="0">Tümü</option>
              <option value="10000">10 Bin+</option>
              <option value="50000">50 Bin+</option>
              <option value="100000">100 Bin+</option>
              <option value="250000">250 Bin+</option>
              <option value="500000">500 Bin+</option>
              <option value="1000000">1 Milyon+</option>
            </select>
          </div>

          <div className="search-btn-container">
            <button className="search-btn" onClick={fetchData}>
              {loading ? 'Aranıyor...' : 'Sonuçları Getir'}
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="loading-text">Arşiv taranıyor...</div>}
      
      {!loading && hasSearched && videos.length === 0 && (
        <div className="no-results">
          Kriterlere uygun video bulunamadı.
          <span>Arama filtrelerini değiştirerek tekrar deneyin.</span>
        </div>
      )}

      <div className="video-grid">
        {videos.map((video, i) => (
          <div key={i} className="video-card">
            <div className="thumbnail-container">
              {/* Not: Gerçek bir projede next/image kullanmanız önerilir */}
              <img src={video.thumbnail} alt={video.title} className="thumbnail" loading="lazy" />
            </div>
            <div className="card-content">
              <div>
                <h3 className="video-title">{video.title}</h3>
                <p className="channel-name">{video.channel}</p>
              </div>
              <div className="card-footer">
                <div className="stats-container">
                  <span className="stat-views">👁️ {formatNumber(video.views)}</span>
                  <span className="stat-date">{video.uploadedAt}</span>
                </div>
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="watch-btn">İzle</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}