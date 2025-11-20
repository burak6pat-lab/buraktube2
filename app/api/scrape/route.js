import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
// SÜRE HESAPLAMA
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
    { label: 'saat', seconds: 3600 },
    { label: 'dakika', seconds: 60 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(diffSeconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label} önce`;
  }
  return 'Az önce';
}

export async function GET(request) {
  try {
    // 🔑 ANAHTARLAR (Senin 6 Anahtarın)
    const API_KEYS = [
      "AIzaSyDt9_odVAUffTb3WWSRdYEpWKX5GqZ56fQ", 
      "AIzaSyDrxuNNyQvsmmF2hl1638cpsincmhABDBM", 
      "AIzaSyDBeLXRJ2pbmHBfw6it2U6XOVp2PY75qws", 
      "AIzaSyCYSxqW4Uz02bDuWC61wZC6bKhabypcFZs", 
      "AIzaSyBu_6sC6RiP15MzTBWdfhPh4LACwA8C0-A", 
      "AIzaSyAlO8jF4ca4wT17Didq5wq4yHZPOBec1EA"
    ];

    const API_KEY = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
    
    const { searchParams } = new URL(request.url);
    const timeParam = searchParams.get('months') || "12"; // Varsayılan 1 Yıl
    const minViews = parseInt(searchParams.get('minViews')) || 0;
    const category = searchParams.get('category') || "teknoloji";

    // KATEGORİLER
    const queryMap = {
      yapay_zeka: "artificial intelligence openai",
      teknoloji: "future technology engineering",
      siber_guvenlik: "cyber security hacker",
      kripto_finans: "bitcoin crypto finance",
      girisimcilik: "startup business success",
      savas: "war history military",
      imparatorluk: "empire history ancient",
      soguk_savas: "cold war spy history",
      uzay: "space universe nasa",
      bilim: "science physics biology",
      cografya: "geopolitics geography borders",
      psikoloji: "psychology human behavior",
      felsefe: "philosophy history ideas",
      sinema_sanat: "cinema art history",
      spor_tarihi: "sports history legendary",
      otomobil: "automotive cars engineering",
      ekonomi: "global economy money",
      gundem: "world news documentary",
      suç_kriminoloji: "true crime documentary",
      saglik: "medical health science"
    };

    const rawQuery = queryMap[category] || "documentary";
    const searchQuery = `${rawQuery} -shorts`;

    // TARİH AYARI
    let publishedAfter = "";
    
    // Eğer "all" seçilirse bile çok eskiye gitmesin (Son 5 yıl gibi sınır koyabiliriz)
    // Ama sen "1 yıl geri gitsin en fazla" dedin. O yüzden page.js'den max 12 ay yollayacağız.
    // Burada gelen isteği işliyoruz.
    if (timeParam !== "all") {
        const date = new Date();
        if (timeParam.includes("d")) {
            date.setDate(date.getDate() - parseInt(timeParam.replace("d", "")));
        } else if (timeParam.includes("m")) {
            date.setMonth(date.getMonth() - parseInt(timeParam.replace("m", "")));
        } else {
            // Sadece sayı geldiyse ay olarak al
            date.setMonth(date.getMonth() - parseInt(timeParam));
        }
        publishedAfter = `&publishedAfter=${date.toISOString()}`;
    }

    // --- ARAMA FONKSİYONU ---
    async function searchYouTube(q, orderType) {
        let videos = [];
        let nextPageToken = "";
        let pageCount = 0;
        
        // DAHA FAZLA VİDEO İÇİN SAYFA SINIRINI ARTIRDIM
        const MAX_PAGES = 10; // 10 Sayfa x 50 video = 500 video tarayacak

        while (videos.length < 60 && pageCount < MAX_PAGES) {
            const tokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
            
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video${publishedAfter}&order=${orderType}&maxResults=50${tokenParam}&key=${API_KEY}`;
            
            const res = await fetch(url);
            const data = await res.json();

            if (!data.items || data.items.length === 0) break;

            const videoIds = data.items.map(item => item.id.videoId).join(',');
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${API_KEY}`;
            const statsRes = await fetch(statsUrl);
            const statsData = await statsRes.json();

            if (!statsData.items) break;

            const batch = statsData.items.map((v) => {
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

            // FİLTRELER
            // 1. SHORTS ENGELLEME: Sınırı 120 saniyeye (2 dk) çıkardım.
            // 2 dakikanın altındaki hiçbir şey gelmeyecek. Garanti çözüm.
            const cleanBatch = batch.filter(v => v.durationSec > 120);
            
            // 2. İZLENME FİLTRESİ
            const viewedBatch = cleanBatch.filter(v => v.views >= minViews);

            videos = [...videos, ...viewedBatch];

            nextPageToken = data.nextPageToken;
            if (!nextPageToken) break;
            pageCount++;
        }
        return videos;
    }

    // --- STRATEJİ ---
    // 1. Öncelik: İzlenme Sayısına Göre Ara
    let allVideos = await searchYouTube(searchQuery, "viewCount");

    // 2. Eğer az video geldiyse -> Alaka Düzeyine Göre Ara (Yedek)
    if (allVideos.length < 15) {
        const moreVideos = await searchYouTube(searchQuery, "relevance");
        allVideos = [...allVideos, ...moreVideos];
    }

    // Eşsizleştirme
    const uniqueVideos = Array.from(new Map(allVideos.map(item => [item.url, item])).values());

    // SIRALAMA: YENİDEN ESKİYE
    uniqueVideos.sort((a, b) => b.fullDate - a.fullDate);

    return NextResponse.json({ videos: uniqueVideos });

  } catch (err) {
    console.error("SUNUCU HATASI:", err);
    return NextResponse.json({ error: "Sunucu Hatası" }, { status: 500 });
  }
}