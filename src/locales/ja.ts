export const ja = {
  // Common
  common: {
    chronostr: "chronostr",
    tagline: "日程調整ツール on Nostr",
    submit: "送信",
    save: "保存",
    create: "作成",
    cancel: "キャンセル",
    gotIt: "了解",
    noThanks: "いいえ",
    connect: "接続",
    disconnect: "切断",
    edit: "編集",
    copied: "コピーしました！",
    success: "成功！",
    error: "エラー",
  },

  // Index page
  index: {
    createNewEvent: "新しいイベントを作成",
  },

  // MyPage
  mypage: {
    title: "マイページ",
    joinedEvents: "参加中のイベント",
    pleaseConnect: "まずNIP-07クライアントに接続してください。",
  },

  // Event page
  event: {
    rsvpFetchError: "出欠情報の取得エラー",
    accountError: "アカウントエラー",
    failedToSubmit: "送信に失敗しました。",
  },

  // Header
  header: {
    login: "ログイン (NIP-07)",
  },

  // Event Editor
  eventEditor: {
    eventTitle: "イベントタイトル",
    eventTitlePlaceholder: "ダチョウ刺身パーティー",
    description: "説明",
    descriptionPlaceholder: "みんなで美味しいダチョウを食べに行こう！",
    candidateDates: "候補日",
    currentCandidateDates: "現在の候補日",
    newCandidateDates: "新しい候補日",
    candidateDatesPlaceholder: `イベントの候補日時を入力してください。
候補は改行で区切ります。

例:
2023-12-13
2023-12-13T16:00

カレンダーから日付を入力することもできます。
`,
    invalidDate: "無効な日付が見つかりました。",
    invalidDateDescription: (date: string) =>
      `"${date}" はISO8601形式ではありません。`,
    editEvent: "イベントを編集",
    note1: "1. イベントの作成にはNIP-07での署名が必要です。",
    note2:
      "2. イベントへの参加にNIP-07拡張機能は必要ありませんが、NIP-07拡張機能を接続しない場合は同じPC/スマートフォンのブラウザからのみ内容を編集できます。",
  },

  // Join the event
  joinEvent: {
    connectToNostr: "Nostrアカウントに接続しますか？",
    connectDescription:
      "Nostrアカウントに接続すると、プロフィールが自動的に入力され、他のブラウザからもスケジュールの変更やメンバーへの連絡ができるようになります。",
    name: "名前",
    candidateDates: "候補日",
    reSchedule: "日程を変更する",
    join: "参加",
  },

  // Contact
  contact: {
    title: "参加者に連絡する",
    noParticipants: "参加者がいません",
    noParticipantsDescription: "このイベントにはまだ参加者がいないようです。",
    replyingTo: (name: string) => `${name}に返信`,
    replyingToMultiple: (names: string[], lastName: string) =>
      `${names.join("、")}、${lastName}に返信`,
  },

  // NIP-07 connection
  nip07: {
    accountConnected: "アカウントに接続しました！",
    failedToConnect: "接続に失敗しました",
  },
} as const;
