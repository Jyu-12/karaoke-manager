# Karaoke Manager PWA - v12 Cloud Sync

## v12: Supabaseクラウド同期

Supabaseへのログインと端末間同期を追加しました。

### 接続先
- Project URL: `https://zrihlqlqgpbmtlhigceb.supabase.co`
- Publishable key: アプリ内に設定済み
- Secret / service_role key は使用していません

### ログイン
画面上部の「☁ クラウド」から、Supabase Authenticationに作成した
メールアドレス＋パスワードでログインします。

### 初回同期
- クラウドが空で端末に曲がある → 端末の曲をクラウドへアップロード
- 端末が空でクラウドに曲がある → クラウドから端末へダウンロード
- 両方に曲がある → IDと更新日時を見ながらマージ

### 通常同期
- 曲追加 / 編集 / お気に入り / タグ変更 / 点数追加などをクラウドへ反映
- 削除もクラウドへ反映
- オフライン時の変更は端末に残り、次回同期時に送信
- アプリ起動時（ログイン状態）とオンライン復帰時に自動同期
- 「今すぐ同期」ボタンでも同期可能

### ローカル保存も継続
IndexedDBは端末内キャッシュとして引き続き使用します。
クラウドに問題がある場合でも、端末内データとJSON/CSVバックアップを利用できます。

### セキュリティ
- ブラウザに入っているのは公開前提のPublishable keyだけです
- Supabase RLSでログイン中ユーザー自身のsongsだけ読み書きできます
- Database password / secret key / service_role key はアプリに含めません

## 既存機能
v11までの曲管理・DAM/JOYSOUND点数履歴・自動セッション・統計・タグ・定番曲・練習中・CSV/JSON・PWAなどはそのまま利用できます。
