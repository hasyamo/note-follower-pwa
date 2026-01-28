// メインアプリケーションロジック
const App = {
  // DOM要素
  elements: {},

  // 一時保存用のプロフィールデータ
  tempProfile: null,

  // 初期化
  init() {
    this.cacheElements();
    this.bindEvents();
    this.registerServiceWorker();
    ChartManager.init();
    this.checkInitialState();
  },

  // DOM要素をキャッシュ
  cacheElements() {
    // 画面
    this.elements.setupScreen = document.getElementById('setup-screen');
    this.elements.dashboardScreen = document.getElementById('dashboard-screen');
    this.elements.settingsScreen = document.getElementById('settings-screen');

    // セットアップ画面
    this.elements.creatorIdInput = document.getElementById('creator-id-input');
    this.elements.checkProfileBtn = document.getElementById('check-profile-btn');
    this.elements.profilePreview = document.getElementById('profile-preview');
    this.elements.previewAvatar = document.getElementById('preview-avatar');
    this.elements.previewNickname = document.getElementById('preview-nickname');
    this.elements.previewUrlname = document.getElementById('preview-urlname');
    this.elements.previewFollowers = document.getElementById('preview-followers');
    this.elements.startTrackingBtn = document.getElementById('start-tracking-btn');
    this.elements.setupError = document.getElementById('setup-error');

    // ダッシュボード画面
    this.elements.settingsBtn = document.getElementById('settings-btn');
    this.elements.dashboardAvatar = document.getElementById('dashboard-avatar');
    this.elements.dashboardNickname = document.getElementById('dashboard-nickname');
    this.elements.dashboardLink = document.getElementById('dashboard-link');
    this.elements.currentCount = document.getElementById('current-count');
    this.elements.refreshBtn = document.getElementById('refresh-btn');
    this.elements.statDaily = document.getElementById('stat-daily');
    this.elements.statWeekly = document.getElementById('stat-weekly');
    this.elements.statMonthly = document.getElementById('stat-monthly');
    this.elements.statTotal = document.getElementById('stat-total');
    this.elements.recordsTbody = document.getElementById('records-tbody');
    this.elements.lastUpdated = document.getElementById('last-updated');

    // 設定画面
    this.elements.backBtn = document.getElementById('back-btn');
    this.elements.changeCreatorIdInput = document.getElementById('change-creator-id-input');
    this.elements.changeCreatorBtn = document.getElementById('change-creator-btn');
    this.elements.exportBtn = document.getElementById('export-btn');
    this.elements.importFile = document.getElementById('import-file');
    this.elements.importBtn = document.getElementById('import-btn');
    this.elements.resetBtn = document.getElementById('reset-btn');

    // 共通
    this.elements.loading = document.getElementById('loading');
    this.elements.confirmDialog = document.getElementById('confirm-dialog');
    this.elements.confirmMessage = document.getElementById('confirm-message');
    this.elements.confirmCancel = document.getElementById('confirm-cancel');
    this.elements.confirmOk = document.getElementById('confirm-ok');
  },

  // イベントをバインド
  bindEvents() {
    // セットアップ画面
    this.elements.checkProfileBtn.addEventListener('click', () => this.checkProfile());
    this.elements.startTrackingBtn.addEventListener('click', () => this.startTracking());
    this.elements.creatorIdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.checkProfile();
    });

    // ダッシュボード画面
    this.elements.settingsBtn.addEventListener('click', () => this.showScreen('settings'));
    this.elements.refreshBtn.addEventListener('click', () => this.refreshData());

    // 設定画面
    this.elements.backBtn.addEventListener('click', () => this.showScreen('dashboard'));
    this.elements.changeCreatorBtn.addEventListener('click', () => this.changeCreator());
    this.elements.exportBtn.addEventListener('click', () => this.exportData());
    this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
    this.elements.importFile.addEventListener('change', (e) => this.importData(e));
    this.elements.resetBtn.addEventListener('click', () => this.resetData());

    // 確認ダイアログ
    this.elements.confirmCancel.addEventListener('click', () => this.hideConfirmDialog());
  },

  // Service Workerを登録
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js?v=3')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
    }
  },

  // 初期状態をチェック
  checkInitialState() {
    const data = Storage.getData();
    if (data && data.creatorId) {
      this.showScreen('dashboard');
      this.updateDashboard();
    } else {
      this.showScreen('setup');
    }
  },

  // 画面を切り替え
  showScreen(screen) {
    this.elements.setupScreen.classList.add('hidden');
    this.elements.dashboardScreen.classList.add('hidden');
    this.elements.settingsScreen.classList.add('hidden');

    switch (screen) {
      case 'setup':
        this.elements.setupScreen.classList.remove('hidden');
        break;
      case 'dashboard':
        this.elements.dashboardScreen.classList.remove('hidden');
        break;
      case 'settings':
        this.elements.settingsScreen.classList.remove('hidden');
        break;
    }
  },

  // ローディング表示
  showLoading() {
    this.elements.loading.classList.remove('hidden');
  },

  // ローディング非表示
  hideLoading() {
    this.elements.loading.classList.add('hidden');
  },

  // エラーを表示
  showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
  },

  // エラーを非表示
  hideError(element) {
    element.classList.add('hidden');
  },

  // 確認ダイアログを表示
  showConfirmDialog(message, onConfirm) {
    this.elements.confirmMessage.textContent = message;
    this.elements.confirmDialog.classList.remove('hidden');

    const handleConfirm = () => {
      this.hideConfirmDialog();
      this.elements.confirmOk.removeEventListener('click', handleConfirm);
      onConfirm();
    };

    this.elements.confirmOk.addEventListener('click', handleConfirm);
  },

  // 確認ダイアログを非表示
  hideConfirmDialog() {
    this.elements.confirmDialog.classList.add('hidden');
  },

  // プロフィールを確認
  async checkProfile() {
    const creatorId = this.elements.creatorIdInput.value.trim();
    if (!creatorId) {
      this.showError(this.elements.setupError, 'クリエイターIDを入力してください');
      return;
    }

    this.hideError(this.elements.setupError);
    this.elements.profilePreview.classList.add('hidden');
    this.showLoading();

    try {
      const profile = await API.fetchCreator(creatorId);
      this.tempProfile = profile;

      this.elements.previewAvatar.src = profile.profileImageUrl || '';
      this.elements.previewNickname.textContent = profile.nickname;
      this.elements.previewUrlname.textContent = `@${profile.urlname}`;
      this.elements.previewFollowers.textContent = `${profile.followerCount.toLocaleString()} フォロワー`;
      this.elements.profilePreview.classList.remove('hidden');
    } catch (error) {
      this.showError(this.elements.setupError, error.message || 'プロフィールの取得に失敗しました');
    } finally {
      this.hideLoading();
    }
  },

  // 追跡を開始
  startTracking() {
    if (!this.tempProfile) return;

    const data = Storage.createInitialData(
      this.tempProfile.urlname,
      this.tempProfile,
      this.tempProfile.followerCount
    );

    if (Storage.saveData(data)) {
      this.showScreen('dashboard');
      this.updateDashboard();
    } else {
      this.showError(this.elements.setupError, 'データの保存に失敗しました');
    }
  },

  // ダッシュボードを更新
  updateDashboard() {
    const data = Storage.getData();
    if (!data) return;

    // プロフィール
    this.elements.dashboardAvatar.src = data.profile.profileImageUrl || '';
    this.elements.dashboardNickname.textContent = data.profile.nickname;
    this.elements.dashboardLink.href = `https://note.com/${data.profile.urlname}`;

    // 統計
    const stats = Storage.getStats();
    this.elements.currentCount.textContent = stats.current.toLocaleString();
    this.updateStatValue(this.elements.statDaily, stats.daily);
    this.updateStatValue(this.elements.statWeekly, stats.weekly);
    this.updateStatValue(this.elements.statMonthly, stats.monthly);
    this.updateStatValue(this.elements.statTotal, stats.total);

    // グラフ
    ChartManager.updateCharts(data.records);

    // 記録テーブル
    this.updateRecordsTable(data.records);

    // 最終更新日時
    if (data.lastUpdated) {
      const date = new Date(data.lastUpdated);
      this.elements.lastUpdated.textContent = `最終更新: ${date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`;
    }
  },

  // 統計値を更新
  updateStatValue(element, value) {
    const prefix = value > 0 ? '+' : '';
    element.textContent = `${prefix}${value.toLocaleString()}`;
    element.className = 'stat-value';
    if (value > 0) {
      element.classList.add('positive');
    } else if (value < 0) {
      element.classList.add('negative');
    }
  },

  // 記録テーブルを更新
  updateRecordsTable(records) {
    // 最新10件を表示（逆順）
    const displayRecords = records.slice(-10).reverse();

    this.elements.recordsTbody.innerHTML = displayRecords.map(record => {
      const changeClass = record.change > 0 ? 'positive' : record.change < 0 ? 'negative' : '';
      const changePrefix = record.change > 0 ? '+' : '';

      return `
        <tr>
          <td>${record.date}</td>
          <td>${record.followers.toLocaleString()}</td>
          <td class="${changeClass}">${changePrefix}${record.change}</td>
        </tr>
      `;
    }).join('');
  },

  // データを更新
  async refreshData() {
    const data = Storage.getData();
    if (!data) return;

    this.showLoading();
    this.elements.refreshBtn.disabled = true;

    try {
      const profile = await API.fetchCreator(data.creatorId);

      // プロフィールを更新
      Storage.updateProfile(profile);

      // レコードを追加
      Storage.addRecord(profile.followerCount);

      // ダッシュボードを更新
      this.updateDashboard();
    } catch (error) {
      alert('データの取得に失敗しました: ' + (error.message || '不明なエラー'));
    } finally {
      this.hideLoading();
      this.elements.refreshBtn.disabled = false;
    }
  },

  // クリエイターを変更
  changeCreator() {
    const newId = this.elements.changeCreatorIdInput.value.trim();
    if (!newId) {
      alert('新しいクリエイターIDを入力してください');
      return;
    }

    this.showConfirmDialog(
      'クリエイターを変更すると、これまでのデータは削除されます。よろしいですか？',
      async () => {
        this.showLoading();
        try {
          const profile = await API.fetchCreator(newId);
          const data = Storage.createInitialData(newId, profile, profile.followerCount);

          if (Storage.saveData(data)) {
            this.elements.changeCreatorIdInput.value = '';
            this.showScreen('dashboard');
            this.updateDashboard();
          } else {
            alert('データの保存に失敗しました');
          }
        } catch (error) {
          alert('クリエイターの取得に失敗しました: ' + (error.message || '不明なエラー'));
        } finally {
          this.hideLoading();
        }
      }
    );
  },

  // データをエクスポート
  exportData() {
    if (Storage.exportData()) {
      // 成功
    } else {
      alert('エクスポートに失敗しました');
    }
  },

  // データをインポート
  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.showConfirmDialog(
      'インポートすると現在のデータは上書きされます。よろしいですか？',
      () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (Storage.importData(e.target.result)) {
            this.showScreen('dashboard');
            this.updateDashboard();
            alert('インポートが完了しました');
          } else {
            alert('インポートに失敗しました。ファイル形式を確認してください。');
          }
        };
        reader.readAsText(file);
      }
    );

    // inputをリセット
    event.target.value = '';
  },

  // データをリセット
  resetData() {
    this.showConfirmDialog(
      'すべてのデータを削除します。この操作は取り消せません。よろしいですか？',
      () => {
        if (Storage.resetData()) {
          this.elements.profilePreview.classList.add('hidden');
          this.elements.creatorIdInput.value = '';
          this.tempProfile = null;
          this.showScreen('setup');
        } else {
          alert('リセットに失敗しました');
        }
      }
    );
  }
};

// DOMContentLoadedで初期化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
