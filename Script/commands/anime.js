const axios = require('axios');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchanimeVideos(query) {
  try {
    const response = await axios.get(
      https://anime-search-neon.vercel.app/kshitiz?keyword=${encodeURIComponent(query)}
    );
    return response.data;
  } catch (error) {
    console.error("❌ API Fetch Error:", error.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "anime",
    aliases: ["animeedit", "animevdo", "anime"],
    author: "Alim",
    version: "1.3",
    role: 0,
    shortDescription: {
      en: "Get anime edit videos (fallback supported)",
    },
    longDescription: {
      en: "Fetches short anime edit videos. If no match found, sends a random anime edit video under 1 minute.",
    },
    category: "media",
    guide: {
      en: "{pn} [optional keyword]",
    },
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ") || "anime edit";
    api.setMessageReaction("🎧", event.messageID, () => {}, true);

    const videos = await fetchanimeVideos(query);

    if (!videos || videos.length === 0) {
      return api.sendMessage(❌ Couldn't fetch videos. Try again later., event.threadID, event.messageID);
    }

    // Filter anime edit under 60s
    const isValidEdit = v => {
      const title = v.title?.toLowerCase() || "";
      const desc = v.description?.toLowerCase() || "";
      const match = /anime\s*edit|anime\s*edit|edit|aesthetic/i;
      return match.test(title) || match.test(desc);
    };

    const short = v => v.duration && Number(v.duration) < 60;

    const filtered = videos.filter(v => isValidEdit(v) && short(v));

    // If filtered empty, fallback to random video under 60s
    const finalList = filtered.length > 0 ? filtered : videos.filter(short);

    if (finalList.length === 0) {
      return api.sendMessage(❌ No suitable video found., event.threadID, event.messageID);
    }

    const selected = finalList[Math.floor(Math.random() * finalList.length)];
    const videoUrl = selected.videoUrl;

    if (!videoUrl) {
      return api.sendMessage("⚠️ Video URL missing.", event.threadID, event.messageID);
    }

    try {
      const stream = await getStreamFromURL(videoUrl);
      await api.sendMessage({
        body: ``,
        attachment: stream,
      }, event.threadID, event.messageID);
    } catch (err) {
      console.error("❌ Stream Error:", err.message);
      api.sendMessage("⚠️ Failed to send video.", event.threadID, event.messageID);
    }
  },
};
