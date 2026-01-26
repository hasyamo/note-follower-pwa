// API通信モジュール
const API = {
  PROXY_URL: 'https://falling-mouse-736b.hasyamo.workers.dev/',

  // クリエイター情報を取得
  async fetchCreator(creatorId) {
    try {
      const url = `${this.PROXY_URL}?id=${encodeURIComponent(creatorId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('クリエイターが見つかりませんでした');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();

      if (!json.data) {
        throw new Error('クリエイターが見つかりませんでした');
      }

      return {
        id: json.data.id,
        nickname: json.data.nickname,
        urlname: json.data.urlname,
        followerCount: json.data.followerCount,
        profileImageUrl: json.data.profileImageUrl
      };
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }
};
