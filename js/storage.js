// localStorage操作モジュール
const Storage = {
  STORAGE_KEY: 'note-follower-data',

  // データを取得
  getData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get data from localStorage:', e);
      return null;
    }
  },

  // データを保存
  saveData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save data to localStorage:', e);
      return false;
    }
  },

  // 初期データを作成
  createInitialData(creatorId, profile, followers) {
    const now = this.getJSTDateString();
    const timestamp = this.getJSTTimestamp();

    return {
      creatorId: creatorId,
      profile: {
        nickname: profile.nickname,
        profileImageUrl: profile.profileImageUrl,
        urlname: profile.urlname
      },
      records: [
        {
          date: now,
          followers: followers,
          change: 0,
          timestamp: timestamp
        }
      ],
      lastUpdated: timestamp
    };
  },

  // 新しいレコードを追加（同日なら上書き）
  addRecord(followers) {
    const data = this.getData();
    if (!data) return false;

    const today = this.getJSTDateString();
    const timestamp = this.getJSTTimestamp();
    const records = data.records;

    // 前回のフォロワー数を取得（change計算用）
    const lastRecord = records[records.length - 1];
    const previousFollowers = lastRecord ? lastRecord.followers : followers;

    // 同日のレコードがあるかチェック
    const todayIndex = records.findIndex(r => r.date === today);

    const newRecord = {
      date: today,
      followers: followers,
      change: followers - previousFollowers,
      timestamp: timestamp
    };

    if (todayIndex !== -1) {
      // 同日のレコードを上書き（changeは当日最初の記録からの差分を維持）
      const originalChange = records[todayIndex].change;
      // 前日のフォロワー数を取得
      const yesterdayRecord = todayIndex > 0 ? records[todayIndex - 1] : null;
      const yesterdayFollowers = yesterdayRecord ? yesterdayRecord.followers : followers;
      newRecord.change = followers - yesterdayFollowers;
      records[todayIndex] = newRecord;
    } else {
      // 新しいレコードを追加
      newRecord.change = followers - previousFollowers;
      records.push(newRecord);
    }

    data.lastUpdated = timestamp;
    return this.saveData(data);
  },

  // プロフィールを更新
  updateProfile(profile) {
    const data = this.getData();
    if (!data) return false;

    data.profile = {
      nickname: profile.nickname,
      profileImageUrl: profile.profileImageUrl,
      urlname: profile.urlname
    };
    data.lastUpdated = this.getJSTTimestamp();

    return this.saveData(data);
  },

  // データをリセット
  resetData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Failed to reset data:', e);
      return false;
    }
  },

  // データをエクスポート
  exportData() {
    const data = this.getData();
    if (!data) return null;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note-follower-${data.creatorId}-${this.getJSTDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  },

  // データをインポート
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // バリデーション
      if (!data.creatorId || !data.profile || !data.records) {
        throw new Error('Invalid data format');
      }

      return this.saveData(data);
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  },

  // 統計を計算
  getStats() {
    const data = this.getData();
    if (!data || data.records.length === 0) {
      return {
        current: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
        total: 0
      };
    }

    const records = data.records;
    const latest = records[records.length - 1];
    const current = latest.followers;

    // 前日比
    const daily = records.length >= 2 ? latest.change : 0;

    // 週間（7日前と比較）
    const weekAgo = this.getDateBefore(7);
    const weekRecord = this.findRecordNear(records, weekAgo);
    const weekly = weekRecord ? current - weekRecord.followers : daily;

    // 月間（30日前と比較）
    const monthAgo = this.getDateBefore(30);
    const monthRecord = this.findRecordNear(records, monthAgo);
    const monthly = monthRecord ? current - monthRecord.followers : weekly;

    // 累計（最初のレコードからの増加）
    const first = records[0];
    const total = current - first.followers;

    return { current, daily, weekly, monthly, total };
  },

  // 指定日数前の日付を取得
  getDateBefore(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDate(date);
  },

  // 指定日付に最も近いレコードを検索
  findRecordNear(records, targetDate) {
    // 完全一致を探す
    const exact = records.find(r => r.date === targetDate);
    if (exact) return exact;

    // それ以前で最も近いレコードを探す
    for (let i = records.length - 1; i >= 0; i--) {
      if (records[i].date <= targetDate) {
        return records[i];
      }
    }

    return records[0]; // 最も古いレコードを返す
  },

  // 日本時間の日付文字列を取得 (YYYY-MM-DD)
  getJSTDateString() {
    return this.formatDate(new Date());
  },

  // 日本時間のタイムスタンプを取得
  getJSTTimestamp() {
    const now = new Date();
    const jstString = now.toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' });
    // "2026-01-28 12:48:00" 形式で出力される
    return jstString.replace(' ', 'T') + '.000+09:00';
  },

  // 日付をフォーマット
  formatDate(date) {
    const jstString = date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    // "2026-01-28" 形式で出力される
    return jstString;
  }
};
