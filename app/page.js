"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [category, setCategory] = useState("sinema_sanat");
  const [selectedMonth, setSelectedMonth] = useState("12m"); // Varsayılan: Son 1 Yıl
  const [selectedView, setSelectedView] = useState("10000"); 

  async function fetchData() {
    setLoading(true);
    setHasSearched(true);
    setVideos([]); 
    try {
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

  return (
    <div className="main-container">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { margin: 0; padding: 0; background-color: #050505; color: #ffffff; font-family: 'Inter', sans-serif; }
        .main-container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
        .title { font-size: 64px; font-weight: 900; margin: 0; background: linear-gradient(to right, #FDB912, #A90432); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -3px; font-style: italic; }
        .subtitle { color: #666; font-size: 16px; margin-top: 10px; letter-spacing: 1px; }
        .control-panel { background: #111; border: 1px solid #222; padding: 30px; border-radius: 20px; display: flex; flex-wrap: wrap; gap: 20px; width: 100%; max-width: 1200px; margin-bottom: 50px; box-shadow: 0 20px 60px rgba(169, 4, 50, 0.15); }
        .filter-group { flex: 1 1 200px; display: flex; flex-direction: column; gap: 10px; }
        label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #FDB912; font-weight: 700; }
        select { background-color: #1a1a1a; color: #fff; padding: 16px; border-radius: 10px; border: 1px solid #333; font-size: 15px; outline: none; cursor: pointer; }
        select:focus { border-color: #FDB912; }
        .search-btn { background: linear-gradient(135deg, #A90432, #6d0220); color: white; border: none; border-radius: 10px; font-weight: 800; font-size: 16px; cursor: pointer; flex: 1 1 150px; height: 54px; align-self: flex-end; transition: transform 0.2s; }
        .search-btn:hover { transform: scale(1.02); }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; width: 100%; max-width: 1200px; }
        .video-card { background-color: #111; border: 1px solid #222; border-radius: 16px; overflow: hidden; transition: transform 0.3s; display: flex; flex-direction: column; }
        .video-card:hover { transform: translateY(-8px); border-color: #FDB912; }
        .thumbnail-container { position: relative; width: 100%; padding-top: 56.25%; }
        .thumbnail { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
        .card-content { padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .video-title { font-size: 16px; font-weight: 700; line-height: 1.4; margin-bottom: 10px; color: #fff; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .channel-name { color: #888; font-size: 13px; margin-bottom: 15px; }
        .card-footer { margin-top: auto; padding-top: 15px; border-top: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .stats { font-size: 12px; color: #FDB912; font-weight: 700; }
        .watch-btn { background-color: #eee; color: #000; padding: 8px 20px; border-radius: 8px; font-size: 12px; font-weight: 900; text-decoration: none; }
        .loading-text { color: #FDB912; font-size: 20px; font-weight: bold; text-align: center; }
      `}</style>

      <header className="header">
        <h1 className="title">BURAKTUBE 🦁</h1>
        <p className="subtitle">Global İçerik Madencisi</p>
      </header>

      <div className="control-panel">
        <div className="filter-group">
          <label>KATEGORİ</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <optgroup label="🔥 Gündem ve Ekonomi">
              <option value="kripto_finans">💰 Kripto & Bitcoin</option>
              <option value="ekonomi">📈 Ekonomi & Finans</option>
              <option value="gundem">🌍 Global Gündem</option>
            </optgroup>
            <optgroup label="🚀 Teknoloji & Gelecek">
              <option value="yapay_zeka">🤖 Yapay Zeka (AI)</option>
              <option value="teknoloji">📡 Gelecek Teknolojileri</option>
              <option value="siber_guvenlik">🔐 Siber Güvenlik</option>
              <option value="otomobil">🏎️ Otomobil & Mühendislik</option>
              <option value="girisimcilik">💼 Girişimcilik</option>
            </optgroup>
            <optgroup label="📜 Tarih & Toplum">
              <option value="savas">⚔️ Savaş Tarihi</option>
              <option value="imparatorluk">👑 İmparatorluklar</option>
              <option value="soguk_savas">☢️ Soğuk Savaş</option>
              <option value="suç_kriminoloji">🕵️ Suç & Kriminoloji</option>
            </optgroup>
            <optgroup label="🧠 Bilim & Keşif">
              <option value="uzay">🌌 Uzay & Evren</option>
              <option value="bilim">🧬 Bilim & Fizik</option>
              <option value="saglik">⚕️ Sağlık & Tıp</option>
              <option value="cografya">🗺️ Coğrafya & Jeopolitik</option>
            </optgroup>
            <optgroup label="🎨 Kültür & Sanat">
              <option value="psikoloji">🧠 Psikoloji</option>
              <option value="felsefe">🏛️ Felsefe</option>
              <option value="sinema_sanat">🎬 Sinema & Sanat</option>
              <option value="spor_tarihi">🏅 Spor Tarihi</option>
            </optgroup>
          </select>
        </div>

        {/* SADELEŞTİRİLMİŞ ZAMAN MENÜSÜ */}
        <div className="filter-group">
          <label>NE ZAMAN?</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="3d">⚡ Son 3 Gün</option>
            <option value="7d">📅 Son 1 Hafta</option>
            <option value="15d">📅 Son 15 Gün</option>
            <option value="1m">📅 Son 1 Ay</option>
            <option value="3m">📅 Son 3 Ay</option>
            <option value="6m">📅 Son 6 Ay</option>
            <option value="12m">📅 Son 1 Yıl</option>
            <option value="24m">📅 Son 2 Yıl</option>
          </select>
        </div>

        <div className="filter-group">
          <label>POPÜLERLİK</label>
          <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
            <option value="0">Filtresiz (Hepsini Getir)</option>
            <option value="10000">10,000+</option>
            <option value="50000">50,000+</option>
            <option value="100000">100,000+</option>
            <option value="250000">250,000+</option>
            <option value="500000">500,000+</option>
            <option value="1000000">1 Milyon+</option>
          </select>
        </div>

        <button className="search-btn" onClick={fetchData}>
          GETİR
        </button>
      </div>

      {loading && <div className="loading-text">Arşiv taranıyor...</div>}
      
      {!loading && hasSearched && videos.length === 0 && (
        <div style={{textAlign: 'center', color: '#FDB912', marginTop: '20px', fontSize: '18px'}}>
          ⚠️ Kriterlere uygun video bulunamadı. <br/>
          <span style={{fontSize: '14px', color: '#888'}}>Kriterleri düşürerek tekrar dene.</span>
        </div>
      )}

      <div className="video-grid">
        {videos.map((video, i) => (
          <div key={i} className="video-card">
            <div className="thumbnail-container">
              <img src={video.thumbnail} alt={video.title} className="thumbnail" />
            </div>
            <div className="card-content">
              <div>
                <h3 className="video-title">{video.title}</h3>
                <p className="channel-name">{video.channel}</p>
              </div>
              <div className="card-footer">
                <div className="stats">
                  <div>👁️ {new Intl.NumberFormat('tr-TR', { notation: "compact" }).format(video.views)}</div>
                  <div style={{marginTop: '2px', color: '#aaa'}}>{video.uploadedAt}</div>
                </div>
                <a href={video.url} target="_blank" className="watch-btn">İZLE</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}