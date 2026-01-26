# 積み上げノート

noteのフォロワー数推移を記録・グラフ表示するPWA（Progressive Web App）です。

## 機能

- フォロワー数の推移を記録・グラフ表示
- 前日比、週間、月間の増減を表示
- オフラインでも閲覧可能（PWA対応）
- ホーム画面に追加してアプリのように使用可能
- データのエクスポート/インポート

## 使い方

### 1. アクセス

以下のURLにアクセスしてください：

```
https://[username].github.io/note-follower-pwa/
```

### 2. クリエイターIDを入力

noteのプロフィールURL `https://note.com/xxx` の `xxx` 部分（クリエイターID）を入力します。

### 3. 記録開始

プロフィールを確認し、「この人で始める」ボタンを押すと記録が開始されます。

### 4. 定期的に更新

「今すぐ更新」ボタンを押すか、再度アクセスすることで最新のフォロワー数を記録できます。

### 5. ホーム画面に追加（推奨）

スマートフォンのブラウザメニューから「ホーム画面に追加」を選択すると、アプリのように使用できます。

## データについて

- すべてのデータはブラウザの**localStorage**に保存されます
- サーバーには送信されません
- ブラウザのデータを削除すると記録も消えます
- 設定画面からJSON形式でエクスポート/インポートが可能です

## プロキシについて

note APIは直接ブラウザからアクセスできないため、Cloudflare Workersを使用したプロキシ経由でデータを取得しています。プロキシはフォロワー数の取得のみに使用され、個人情報は収集しません。

## 技術スタック

- HTML/CSS/JavaScript（フレームワーク不使用）
- [Chart.js](https://www.chartjs.org/) - グラフ描画
- localStorage - データ永続化
- Service Worker - オフライン対応
- GitHub Pages - ホスティング

## ローカルで実行

```bash
# リポジトリをクローン
git clone https://github.com/[username]/note-follower-pwa.git
cd note-follower-pwa

# ローカルサーバーを起動（例：Python）
python3 -m http.server 8000

# ブラウザでアクセス
# http://localhost:8000
```

## ライセンス

MIT License
