// 文の穴埋め(空欄補充)問題。1 行 = 1 テーマ。
// 各項目の `hangul` は完成した文、`answer` はその文に一度だけ現れる空欄語。
// クイズは answer を「____」に置き換えて出題し、選択肢には各文の answer 語が並ぶ
// (同じ行が distractor になるので、似た語彙で迷いながら練習できる)。
import type { Hangul } from './hangul'

export const CLOZE_ROWS: Hangul[][] = [
  // 場所
  [
    { hangul: '주말에 도서관에서 책을 읽어요.', romaji: 'jumare doseogwaneseo chaegeul ilgeoyo.', meaning: '週末に図書館で本を読みます', answer: '도서관' },
    { hangul: '아침에 회사에 가서 일해요.', romaji: 'achime hoesae gaseo ilhaeyo.', meaning: '朝、会社に行って働きます', answer: '회사' },
    { hangul: '아파서 병원에 갔어요.', romaji: 'apaseo byeongwone gasseoyo.', meaning: '具合が悪くて病院に行きました', answer: '병원' },
    { hangul: '돈을 찾으러 은행에 가요.', romaji: 'doneul chajeureo eunhaenge gayo.', meaning: 'お金をおろしに銀行へ行きます', answer: '은행' },
    { hangul: '시장에서 과일을 샀어요.', romaji: 'sijangeseo gwaireul sasseoyo.', meaning: '市場で果物を買いました', answer: '시장' },
    { hangul: '영화를 보러 극장에 갔어요.', romaji: 'yeonghwareul boreo geukjange gasseoyo.', meaning: '映画を見に劇場へ行きました', answer: '극장' },
    { hangul: '친구를 공원에서 만났어요.', romaji: 'chingureul gongwoneseo mannasseoyo.', meaning: '公園で友達に会いました', answer: '공원' },
    { hangul: '역에서 기차를 타요.', romaji: 'yeogeseo gichareul tayo.', meaning: '駅で汽車に乗ります', answer: '역' },
  ],
  // 食べ物・飲み物
  [
    { hangul: '아침에 커피를 마셨어요.', romaji: 'achime keopireul masyeosseoyo.', meaning: '朝コーヒーを飲みました', answer: '커피' },
    { hangul: '점심에 김밥을 먹었어요.', romaji: 'jeomsime gimbabeul meogeosseoyo.', meaning: '昼にキンパを食べました', answer: '김밥' },
    { hangul: '저는 매운 김치를 좋아해요.', romaji: 'jeoneun maeun gimchireul joahaeyo.', meaning: '私は辛いキムチが好きです', answer: '김치' },
    { hangul: '후식으로 과일을 먹어요.', romaji: 'husigeuro gwaireul meogeoyo.', meaning: 'デザートに果物を食べます', answer: '과일' },
    { hangul: '생일에 케이크를 먹어요.', romaji: 'saengire keikeureul meogeoyo.', meaning: '誕生日にケーキを食べます', answer: '케이크' },
    { hangul: '더워서 아이스크림을 먹었어요.', romaji: 'deowoseo aiseukeurimeul meogeosseoyo.', meaning: '暑くてアイスクリームを食べました', answer: '아이스크림' },
    { hangul: '아침마다 빵을 구워 먹어요.', romaji: 'achimmada ppangeul guwo meogeoyo.', meaning: '毎朝パンを焼いて食べます', answer: '빵' },
    { hangul: '비 오는 날엔 따뜻한 국물이 좋아요.', romaji: 'bi oneun naren ttatteutan gungmuri joayo.', meaning: '雨の日は温かいスープがいいです', answer: '국물' },
  ],
  // 時間・날짜
  [
    { hangul: '우리는 내일 만나기로 했어요.', romaji: 'urineun naeil mannagiro haesseoyo.', meaning: '私たちは明日会うことにしました', answer: '내일' },
    { hangul: '주말에는 보통 집에서 쉬어요.', romaji: 'jumareneun botong jibeseo swieoyo.', meaning: '週末は普通家で休みます', answer: '주말' },
    { hangul: '수업은 오전 아홉 시에 시작해요.', romaji: 'sueobeun ojeon ahop sie sijakaeyo.', meaning: '授業は午前9時に始まります', answer: '오전' },
    { hangul: '어제 영화를 봤어요.', romaji: 'eoje yeonghwareul bwasseoyo.', meaning: '昨日映画を見ました', answer: '어제' },
    { hangul: '요즘 일이 많아요.', romaji: 'yojeum iri manayo.', meaning: '最近仕事が多いです', answer: '요즘' },
    { hangul: '약속이 오후 두 시예요.', romaji: 'yaksogi ohu du siyeyo.', meaning: '約束は午後2時です', answer: '오후' },
    { hangul: '금요일까지 숙제를 내세요.', romaji: 'geumyoilkkaji sukjereul naeseyo.', meaning: '金曜日までに宿題を出してください', answer: '금요일' },
    { hangul: '다음 달에 한국에 갈 거예요.', romaji: 'daeum dare hanguge gal geoyeyo.', meaning: '来月韓国に行くつもりです', answer: '다음 달' },
  ],
  // 人・家族
  [
    { hangul: '아버지는 회사에서 일하세요.', romaji: 'abeojineun hoesaeseo ilhaseyo.', meaning: '父は会社で働いています', answer: '아버지' },
    { hangul: '어머니가 맛있는 밥을 해 주셨어요.', romaji: 'eomeoniga masinneun babeul hae jusyeosseoyo.', meaning: '母がおいしいご飯を作ってくれました', answer: '어머니' },
    { hangul: '저는 동생이 한 명 있어요.', romaji: 'jeoneun dongsaengi han myeong isseoyo.', meaning: '私は弟(妹)が一人います', answer: '동생' },
    { hangul: '친구와 같이 영화를 봤어요.', romaji: 'chinguwa gachi yeonghwareul bwasseoyo.', meaning: '友達と一緒に映画を見ました', answer: '친구' },
    { hangul: '선생님께서 한국어를 가르쳐 주세요.', romaji: 'seonsaengnimkkeseo hangugeoreul gareucheo juseyo.', meaning: '先生が韓国語を教えてくださいます', answer: '선생님' },
    { hangul: '옆집 아저씨가 아주 친절해요.', romaji: 'yeopjip ajeossiga aju chinjeolhaeyo.', meaning: '隣のおじさんがとても親切です', answer: '아저씨' },
    { hangul: '할머니께 선물을 드렸어요.', romaji: 'halmeonikke seonmureul deuryeosseoyo.', meaning: 'おばあさんにプレゼントを差し上げました', answer: '할머니' },
    { hangul: '우리 오빠는 의사예요.', romaji: 'uri oppaneun uisayeyo.', meaning: 'うちの兄は医者です', answer: '오빠' },
  ],
  // 形容詞・状態
  [
    { hangul: '오늘은 날씨가 정말 좋아요.', romaji: 'oneureun nalssiga jeongmal joayo.', meaning: '今日は天気が本当にいいです', answer: '좋아요' },
    { hangul: '이 가방은 너무 비싸요.', romaji: 'i gabangeun neomu bissayo.', meaning: 'このかばんは高すぎます', answer: '비싸요' },
    { hangul: '한국어 공부는 조금 어려워요.', romaji: 'hangugeo gongbuneun jogeum eoryeowoyo.', meaning: '韓国語の勉強は少し難しいです', answer: '어려워요' },
    { hangul: '그 영화는 아주 재미있어요.', romaji: 'geu yeonghwaneun aju jaemiisseoyo.', meaning: 'その映画はとても面白いです', answer: '재미있어요' },
    { hangul: '제 방은 항상 깨끗해요.', romaji: 'je bangeun hangsang kkaekkeutaeyo.', meaning: '私の部屋はいつもきれいです', answer: '깨끗해요' },
    { hangul: '날씨가 어제보다 따뜻해요.', romaji: 'nalssiga eojeboda ttatteutaeyo.', meaning: '天気が昨日より暖かいです', answer: '따뜻해요' },
    { hangul: '이 음식은 좀 매워요.', romaji: 'i eumsigeun jom maewoyo.', meaning: 'この料理は少し辛いです', answer: '매워요' },
    { hangul: '시험이 생각보다 쉬웠어요.', romaji: 'siheomi saenggakboda swiwosseoyo.', meaning: '試験が思ったより簡単でした', answer: '쉬웠어요' },
  ],
  // 動詞
  [
    { hangul: '매일 아침 운동을 해요.', romaji: 'maeil achim undongeul haeyo.', meaning: '毎朝運動をします', answer: '해요' },
    { hangul: '도서관에서 책을 읽어요.', romaji: 'doseogwaneseo chaegeul ilgeoyo.', meaning: '図書館で本を読みます', answer: '읽어요' },
    { hangul: '친구에게 편지를 썼어요.', romaji: 'chinguege pyeonjireul sseosseoyo.', meaning: '友達に手紙を書きました', answer: '썼어요' },
    { hangul: '주말에 영화를 봐요.', romaji: 'jumare yeonghwareul bwayo.', meaning: '週末に映画を見ます', answer: '봐요' },
    { hangul: '아침에 빵을 먹어요.', romaji: 'achime ppangeul meogeoyo.', meaning: '朝パンを食べます', answer: '먹어요' },
    { hangul: '버스를 타고 학교에 가요.', romaji: 'beoseureul tago hakgyoe gayo.', meaning: 'バスに乗って学校へ行きます', answer: '가요' },
    { hangul: '밤에 음악을 들어요.', romaji: 'bame eumageul deureoyo.', meaning: '夜に音楽を聞きます', answer: '들어요' },
    { hangul: '한국어를 열심히 배워요.', romaji: 'hangugeoreul yeolsimhi baewoyo.', meaning: '韓国語を一生懸命学びます', answer: '배워요' },
  ],
]

export const CLOZE_CATS = ['場所', '食べ物・飲み物', '時間', '人・家族', '形容詞・状態', '動詞']

export const CLOZE: Hangul[] = CLOZE_ROWS.flat()
