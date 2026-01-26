# note-follower-pwa 実装指示書

## 概要

noteのフォロワー数推移を記録・表示するPWA（Progressive Web App）を作成する。
ユーザーがnoteのクリエイターIDを入力すると、フォロワー数を取得してブラウザのlocalStorageに保存し、推移をグラフ表示する。

GitHub Pagesでホストし、誰でもforkなしで使えるツールにする。

## 技術スタック

- 静的HTML/CSS/JavaScript（フレームワーク不使用）
- Chart.js（グラフ描画）
- localStorage（データ永続化）
- PWA（Service Worker、manifest.json）
- GitHub Pages でホスト

## API プロキシ

note APIは直接ブラウザから叩くとCORS/CSPでブロックされるため、Cloudflare Workersのプロキシを経由する。

**プロキシURL:** `https://falling-mouse-736b.hasyamo.workers.dev/?id={creatorId}`

**レスポンス例:**
```json
{
  "data": {
    "id": 3598618,
    "nickname": "はしゃも",
    "urlname": "hasyamo",
    "followerCount": 136,
    "profileImageUrl": "https://assets.st-note.com/production/uploads/images/237516392/profile_xxx.jpg?..."
  }
}
```

## 機能要件

### 1. 初期設定画面
- クリエイターIDの入力フォーム
- 「https://note.com/xxx」のxxxの部分を入力
- 入力後、APIを叩いてプロフィール情報を取得・表示して確認
- 「この人で始める」ボタンで保存してダッシュボードへ

### 2. ダッシュボード画面
- プロフィール表示（アイコン画像、ニックネーム、noteへのリンク）
- 現在のフォロワー数（大きく表示）
- 前日比、週間増減、月間増減、記録開始からの増加
- フォロワー推移グラフ（Chart.js、折れ線）
- 日次増減グラフ（Chart.js、棒グラフ）
- 直近の記録テーブル（日付、フォロワー数、前日比）
- 「今すぐ更新」ボタン（手動でAPIを叩いて最新データ取得）

### 3. データ管理
- localStorageに保存するデータ構造:
```json
{
  "creatorId": "hasyamo",
  "profile": {
    "nickname": "はしゃも",
    "profileImageUrl": "https://...",
    "urlname": "hasyamo"
  },
  "records": [
    {
      "date": "2026-01-26",
      "followers": 136,
      "change": 2,
      "timestamp": "2026-01-26T07:00:00+09:00"
    }
  ],
  "lastUpdated": "2026-01-26T07:00:00+09:00"
}
```

- 同日に複数回取得した場合は上書き（日付単位で1レコード）
- データはlocalStorageの `note-follower-data` キーに保存

### 4. 設定画面
- クリエイターIDの変更
- データのエクスポート（JSONダウンロード）
- データのインポート（JSONアップロード）
- データのリセット（確認ダイアログ付き）

### 5. PWA機能
- manifest.json（アプリ名、アイコン、テーマカラー）
- Service Worker（オフライン時にキャッシュから表示）
- 「ホーム画面に追加」可能に

## デザイン要件

- ダークテーマ（背景: #0f172a系）
- モバイルファースト、レスポンシブ対応
- シンプルで見やすいUI
- noteのブランドカラー（緑: #00b86b）をアクセントに使用

## ファイル構成

```
note-follower-pwa/
├── index.html          # メインHTML（SPA的に画面切り替え）
├── css/
│   └── style.css       # スタイル
├── js/
│   ├── app.js          # メインロジック
│   ├── api.js          # API通信
│   ├── storage.js      # localStorage操作
│   └── chart.js        # グラフ描画
├── manifest.json       # PWAマニフェスト
├── sw.js               # Service Worker
├── icons/
│   ├── icon-192.png    # PWAアイコン
│   └── icon-512.png    # PWAアイコン
└── README.md           # 使い方説明
```

## 実装の注意点

1. **日付の扱い**: 日本時間（JST）基準で日付を判定すること
2. **エラーハンドリング**: API取得失敗時はユーザーに分かりやすくエラー表示
3. **初回アクセス判定**: localStorageにデータがなければ初期設定画面を表示
4. **プロフィール画像**: note側のURLをそのまま使用（プロキシ不要）
5. **前日比計算**: recordsの最後のレコードと比較して計算

## PWAアイコン

シンプルなアイコンを作成する。noteの緑色（#00b86b）を背景に、グラフ📊の絵文字的なデザイン。
または、仮アイコンとして単色の四角でも可（後で差し替え可能）。

## README内容

以下を含める:
- ツールの説明（noteフォロワー推移を記録するPWA）
- 使い方（URL、クリエイターID入力、ホーム画面追加）
- データはブラウザに保存される旨
- プロキシについての説明
- ライセンス（MIT）

## GitHub Pages設定

- リポジトリのSettings → Pages → main ブランチからデプロイ
- 公開URL: `https://{username}.github.io/note-follower-pwa/`

## 補足

このツールはnoteユーザー向けに公開予定。GitHubを使ったことがない人でもURLにアクセスするだけで使える。
AIイラスト界隈のnoteユーザーがターゲット。
