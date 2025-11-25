import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
// SÜRE HESAPLAMA (Shorts Ayıklayıcı)
function parseDuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return (hours * 3600) + (minutes * 60) + seconds;
}

// ZAMAN HESAPLAYICI
function timeAgo(dateString) {
  const now = new Date();
  const published = new Date(dateString);
  const diffSeconds = Math.floor((now - published) / 1000);
  if (diffSeconds < 60) return 'Az önce';
  const intervals = [
    { label: 'yıl', seconds: 31536000 },
    { label: 'ay', seconds: 2592000 },
    { label: 'gün', seconds: 86400 },
    { label: 'saat', seconds: 3600 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(diffSeconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label} önce`;
  }
  return 'Az önce';
}

export async function GET(request) {
  try {
    // 🦁 HARDCODED API KEY (Direkt Elle Yazıldı)
    const API_KEY = "AIzaSyCyP-XVfCXH47HKy42aaRwHyr9hRacbL0c";

    // Terminale hangi anahtarı kullandığını yazsın (Kontrol için)
    console.log(`\n🦁 --------------------------------------------------`);
    console.log(`🦁 Motor Başlatıldı! Anahtar Sonu: ...${API_KEY.slice(-5)}`);

    const { searchParams } = new URL(request.url);
    const months = searchParams.get('months') || "120";
    const minViews = parseInt(searchParams.get('minViews')) || 0;
    const category = searchParams.get('category') || "teknoloji";

    // KATEGORİLER (Sadece İngilizce Global İçerik)
    const categoryQueries = {
      yapay_zeka: "artificial intelligence documentary",
      teknoloji: "future technology documentary",
      siber_guvenlik: "cyber security documentary",
      kripto_finans: "bitcoin history documentary",
      girisimcilik: "business success stories documentary",
      savas: "war history documentary",
      imparatorluk: "ancient empires documentary",
      soguk_savas: "cold war documentary",
      uzay: "space universe documentary",
      bilim: "science discovery documentary",
      cografya: "geopolitics documentary",
      psikoloji: "psychology documentary",
      felsefe: "philosophy documentary"
    };

    const queryText = categoryQueries[category] || "documentary";
    // Sadece "-shorts" dedik, sorguyu hafiflettik ki çok sonuç gelsin
    const searchQuery = `${queryText} -shorts`;

    let publishedAfter = "";
    if (parseInt(months) < 100) {
      const date = new Date();
      date.setMonth(date.getMonth() - parseInt(months));
      publishedAfter = `&publishedAfter=${date.toISOString()}`;
      console.log(`📅 Tarih Filtresi: Son ${months} ay`);
    } else {
      console.log(`📅 Tarih Filtresi: TÜM ZAMANLAR`);
    }

    console.log(`🔍 Aranan Kelime: "${searchQuery}"`);

    // --- DÖNGÜ (LOOP) ---
    let allVideos = [];
    let nextPageToken = "";
    let pageCount = 0;
    const MAX_PAGES = 6; // 6 Sayfa Tara (300 Video eder, baya yeterli)

    while (allVideos.length < 50 && pageCount < MAX_PAGES) {
      const tokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";

      // "relevance" kullanarak kesin sonuç almayı garantiliyoruz
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video${publishedAfter}&order=relevance&relevanceLanguage=en&maxResults=50${tokenParam}&key=${API_KEY}`;

      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData.error) {
        console.error(`❌ API HATASI:`, searchData.error.message);
        // Eğer kota doldu hatasıysa döngüyü kırma
        break;
      }

      if (!searchData.items || searchData.items.length === 0) {
        console.log(`⚠️ Sayfa ${pageCount + 1}: YouTube boş döndü.`);
        break;
      }

      const videoIds = searchData.items.map(item => item.id.videoId).join(',');

      // DETAYLARI ÇEK
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`;
      const statsRes = await fetch(statsUrl);
      const statsData = await statsRes.json();

      if (!statsData.items) break;

      // İŞLEME
      let batchVideos = statsData.items.map((v) => {
        const durationSec = parseDuration(v.contentDetails?.duration);
        return {
          title: v.snippet.title,
          channel: v.snippet.channelTitle,
          views: parseInt(v.statistics?.viewCount || "0"),
          thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.high?.url,
          uploadedAt: timeAgo(v.snippet.publishedAt),
          fullDate: new Date(v.snippet.publishedAt),
          durationSec: durationSec,
          url: `https://www.youtube.com/watch?v=${v.id}`
        };
      });

      const totalInBatch = batchVideos.length;

      // 1. SHORTS FİLTRESİ (60 sn altı çöp)
      batchVideos = batchVideos.filter(v => v.durationSec > 60);
      const afterDuration = batchVideos.length;

      // 2. İZLENME FİLTRESİ
      batchVideos = batchVideos.filter(v => v.views >= minViews);
      const afterViews = batchVideos.length;

      // TERMİNALE RAPOR VER
      console.log(`📄 Sayfa ${pageCount + 1} Raporu:`);
      console.log(`   - Gelen: ${totalInBatch}`);
      console.log(`   - Kalan (Shorts Temizliği): ${afterDuration}`);
      console.log(`   - Kalan (İzlenme Filtresi): ${afterViews}`);

      allVideos = [...allVideos, ...batchVideos];

      nextPageToken = searchData.nextPageToken;
      if (!nextPageToken) break;
      pageCount++;
    }

    // SIRALAMA (Yeniden Eskiye)
    allVideos.sort((a, b) => b.fullDate - a.fullDate);

    console.log(`🚀 FİNAL LİSTE: ${allVideos.length} Video Hazır.`);
    console.log(`🦁 --------------------------------------------------\n`);

    return NextResponse.json({ videos: allVideos });

  } catch (err) {
    console.error("CRITICAL SERVER ERROR:", err);
    return NextResponse.json({ error: "Sunucu Hatası" }, { status: 500 });
  }
}