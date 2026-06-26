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
  // 天気・季節
  [
    { hangul: '봄에는 꽃이 많이 펴요.', romaji: 'bomeneun kkochi mani pyeoyo.', meaning: '春には花がたくさん咲きます', answer: '봄' },
    { hangul: '여름에는 날씨가 더워요.', romaji: 'yeoreumeneun nalssiga deowoyo.', meaning: '夏は天気が暑いです', answer: '여름' },
    { hangul: '가을에는 단풍이 예뻐요.', romaji: 'gaeureneun danpungi yeppeoyo.', meaning: '秋は紅葉がきれいです', answer: '가을' },
    { hangul: '겨울에는 눈이 와요.', romaji: 'gyeoureneun nuni wayo.', meaning: '冬は雪が降ります', answer: '겨울' },
    { hangul: '오늘은 비가 와서 우산을 챙겼어요.', romaji: 'oneureun biga waseo usaneul chaenggyeosseoyo.', meaning: '今日は雨が降って傘を持ちました', answer: '비' },
    { hangul: '바람이 세게 불어요.', romaji: 'barami sege bureoyo.', meaning: '風が強く吹きます', answer: '바람' },
    { hangul: '하늘에 구름이 많아요.', romaji: 'haneure gureumi manayo.', meaning: '空に雲が多いです', answer: '구름' },
    { hangul: '안개가 껴서 앞이 안 보여요.', romaji: 'angaega kkyeoseo api an boyeoyo.', meaning: '霧が出て前が見えません', answer: '안개' },
  ],
  // 交通・移動
  [
    { hangul: '학교까지 버스를 타고 가요.', romaji: 'hakgyokkaji beoseureul tago gayo.', meaning: '学校までバスに乗って行きます', answer: '버스' },
    { hangul: '시간이 없어서 택시를 탔어요.', romaji: 'sigani eopseoseo taeksireul tasseoyo.', meaning: '時間がなくてタクシーに乗りました', answer: '택시' },
    { hangul: '서울에서 부산까지 기차로 가요.', romaji: 'seoureseo busankkaji gicharo gayo.', meaning: 'ソウルから釜山まで汽車で行きます', answer: '기차' },
    { hangul: '출근할 때 지하철을 이용해요.', romaji: 'chulgeunhal ttae jihacheoreul iyonghaeyo.', meaning: '出勤するとき地下鉄を利用します', answer: '지하철' },
    { hangul: '주말에 자전거를 타요.', romaji: 'jumare jajeongeoreul tayo.', meaning: '週末に自転車に乗ります', answer: '자전거' },
    { hangul: '제주도에 갈 때 비행기를 타요.', romaji: 'jejudoe gal ttae bihaenggireul tayo.', meaning: '済州島に行くとき飛行機に乗ります', answer: '비행기' },
    { hangul: '강을 건너려고 배를 탔어요.', romaji: 'gangeul geonneoryeogo baereul tasseoyo.', meaning: '川を渡ろうと船に乗りました', answer: '배' },
    { hangul: '아버지는 새 자동차를 샀어요.', romaji: 'abeojineun sae jadongchareul sasseoyo.', meaning: '父は新しい車を買いました', answer: '자동차' },
  ],
  // 趣味・余暇
  [
    { hangul: '저는 주말마다 등산을 해요.', romaji: 'jeoneun jumalmada deungsaneul haeyo.', meaning: '私は毎週末登山をします', answer: '등산' },
    { hangul: '친구와 같이 영화를 자주 봐요.', romaji: 'chinguwa gachi yeonghwareul jaju bwayo.', meaning: '友達と一緒によく映画を見ます', answer: '영화' },
    { hangul: '시간이 날 때 독서를 즐겨요.', romaji: 'sigani nal ttae dokseoreul jeulgyeoyo.', meaning: '時間があるとき読書を楽しみます', answer: '독서' },
    { hangul: '저는 사진 찍는 것을 좋아해요.', romaji: 'jeoneun sajin jjingneun geoseul joahaeyo.', meaning: '私は写真を撮るのが好きです', answer: '사진' },
    { hangul: '매주 수영을 배우러 가요.', romaji: 'maeju suyeongeul baeureo gayo.', meaning: '毎週水泳を習いに行きます', answer: '수영' },
    { hangul: '저녁에 음악을 들으며 쉬어요.', romaji: 'jeonyeoge eumageul deureumyeo swieoyo.', meaning: '夜、音楽を聴きながら休みます', answer: '음악' },
    { hangul: '친구들과 게임을 하면 재미있어요.', romaji: 'chingudeulgwa geimeul hamyeon jaemiisseoyo.', meaning: '友達とゲームをすると楽しいです', answer: '게임' },
    { hangul: '주말에 그림을 그려요.', romaji: 'jumare geurimeul geuryeoyo.', meaning: '週末に絵を描きます', answer: '그림' },
  ],
  // 身体・健康
  [
    { hangul: '어제부터 머리가 아파요.', romaji: 'eojebuteo meoriga apayo.', meaning: '昨日から頭が痛いです', answer: '머리' },
    { hangul: '많이 걸어서 다리가 아파요.', romaji: 'mani georeoseo dariga apayo.', meaning: 'たくさん歩いて足が痛いです', answer: '다리' },
    { hangul: '글씨를 많이 봐서 눈이 피곤해요.', romaji: 'geulssireul mani bwaseo nuni pigonhaeyo.', meaning: '字をたくさん見て目が疲れています', answer: '눈' },
    { hangul: '감기에 걸려서 목이 아파요.', romaji: 'gamgie geollyeoseo mogi apayo.', meaning: '風邪をひいて喉が痛いです', answer: '목' },
    { hangul: '추워서 손이 차가워요.', romaji: 'chuwoseo soni chagawoyo.', meaning: '寒くて手が冷たいです', answer: '손' },
    { hangul: '매운 음식을 먹어서 배가 아파요.', romaji: 'maeun eumsigeul meogeoseo baega apayo.', meaning: '辛いものを食べてお腹が痛いです', answer: '배' },
    { hangul: '향수 냄새를 코로 맡았어요.', romaji: 'hyangsu naemsaereul koro matasseoyo.', meaning: '香水の匂いを鼻で嗅ぎました', answer: '코' },
    { hangul: '가방이 무거워서 어깨가 아파요.', romaji: 'gabangi mugeowoseo eokkaega apayo.', meaning: 'かばんが重くて肩が痛いです', answer: '어깨' },
  ],
  // 衣服・買い物
  [
    { hangul: '날씨가 추워서 외투를 입었어요.', romaji: 'nalssiga chuwoseo oetureul ibeosseoyo.', meaning: '寒くてコートを着ました', answer: '외투' },
    { hangul: '새 신발을 신고 나갔어요.', romaji: 'sae sinbareul singo nagasseoyo.', meaning: '新しい靴を履いて出かけました', answer: '신발' },
    { hangul: '비가 와서 우산을 가져왔어요.', romaji: 'biga waseo usaneul gajyeowasseoyo.', meaning: '雨が降って傘を持ってきました', answer: '우산' },
    { hangul: '추울 때 모자를 써요.', romaji: 'chuul ttae mojareul sseoyo.', meaning: '寒いとき帽子をかぶります', answer: '모자' },
    { hangul: '손이 시려서 장갑을 꼈어요.', romaji: 'soni siryeoseo janggabeul kkyeosseoyo.', meaning: '手が冷たくて手袋をはめました', answer: '장갑' },
    { hangul: '회사에 갈 때 양복을 입어요.', romaji: 'hoesae gal ttae yangbogeul ibeoyo.', meaning: '会社に行くとき背広を着ます', answer: '양복' },
    { hangul: '여름에는 반바지를 자주 입어요.', romaji: 'yeoreumeneun banbajireul jaju ibeoyo.', meaning: '夏は半ズボンをよく履きます', answer: '반바지' },
    { hangul: '친구에게 선물로 목도리를 샀어요.', romaji: 'chinguege seonmullo mokdorireul sasseoyo.', meaning: '友達にプレゼントでマフラーを買いました', answer: '목도리' },
  ],
  // 学校・勉強
  [
    { hangul: '내일 한국어 시험이 있어요.', romaji: 'naeil hangugeo siheomi isseoyo.', meaning: '明日韓国語の試験があります', answer: '시험' },
    { hangul: '선생님이 숙제를 많이 내셨어요.', romaji: 'seonsaengnimi sukjereul mani naesyeosseoyo.', meaning: '先生が宿題をたくさん出しました', answer: '숙제' },
    { hangul: '도서관에서 책을 빌렸어요.', romaji: 'doseogwaneseo chaegeul billyeosseoyo.', meaning: '図書館で本を借りました', answer: '책' },
    { hangul: '수업 시간에 질문을 했어요.', romaji: 'sueop sigane jilmuneul haesseoyo.', meaning: '授業中に質問をしました', answer: '질문' },
    { hangul: '시험 점수가 잘 나왔어요.', romaji: 'siheom jeomsuga jal nawasseoyo.', meaning: '試験の点数がよく出ました', answer: '점수' },
    { hangul: '매일 한국어 단어를 외워요.', romaji: 'maeil hangugeo daneoreul oewoyo.', meaning: '毎日韓国語の単語を覚えます', answer: '단어' },
    { hangul: '공책에 필기를 했어요.', romaji: 'gongchaege pilgireul haesseoyo.', meaning: 'ノートに筆記をしました', answer: '공책' },
    { hangul: '연필로 답을 썼어요.', romaji: 'yeonpillo dabeul sseosseoyo.', meaning: '鉛筆で答えを書きました', answer: '연필' },
  ],
  // 仕事・職業
  [
    { hangul: '우리 형은 의사예요.', romaji: 'uri hyeongeun uisayeyo.', meaning: 'うちの兄は医者です', answer: '의사' },
    { hangul: '그분은 학생들을 가르치는 선생님이에요.', romaji: 'geubuneun haksaengdeureul gareuchineun seonsaengnimieyo.', meaning: 'その方は学生を教える先生です', answer: '선생님' },
    { hangul: '음식을 만드는 요리사가 되고 싶어요.', romaji: 'eumsigeul mandeuneun yorisaga doego sipeoyo.', meaning: '料理を作る料理人になりたいです', answer: '요리사' },
    { hangul: '불을 끄는 소방관은 용감해요.', romaji: 'bureul kkeuneun sobanggwaneun yonggamhaeyo.', meaning: '火を消す消防士は勇敢です', answer: '소방관' },
    { hangul: '편지를 배달하는 집배원을 봤어요.', romaji: 'pyeonjireul baedalhaneun jipbaewoneul bwasseoyo.', meaning: '手紙を配達する郵便配達員を見ました', answer: '집배원' },
    { hangul: '비행기를 모는 조종사는 멋있어요.', romaji: 'bihaenggireul moneun jojongsaneun meosisseoyo.', meaning: '飛行機を操縦するパイロットはかっこいいです', answer: '조종사' },
    { hangul: '노래하는 가수를 좋아해요.', romaji: 'noraehaneun gasureul joahaeyo.', meaning: '歌う歌手が好きです', answer: '가수' },
    { hangul: '농사를 짓는 농부는 부지런해요.', romaji: 'nongsareul jinneun nongbuneun bujireonhaeyo.', meaning: '農業をする農夫は勤勉です', answer: '농부' },
  ],
  // 感情・気持ち
  [
    { hangul: '시험에 합격해서 기뻐요.', romaji: 'siheome hapgyeokaeseo gippeoyo.', meaning: '試験に合格してうれしいです', answer: '기뻐요' },
    { hangul: '친구가 약속을 어겨서 화가 나요.', romaji: 'chinguga yaksogeul eogyeoseo hwaga nayo.', meaning: '友達が約束を破って腹が立ちます', answer: '화가 나요' },
    { hangul: '강아지가 죽어서 슬퍼요.', romaji: 'gangajiga jugeoseo seulpeoyo.', meaning: '子犬が死んで悲しいです', answer: '슬퍼요' },
    { hangul: '혼자 있으면 외로워요.', romaji: 'honja isseumyeon oerowoyo.', meaning: '一人でいると寂しいです', answer: '외로워요' },
    { hangul: '무서운 영화를 봐서 무서워요.', romaji: 'museoun yeonghwareul bwaseo museowoyo.', meaning: '怖い映画を見て怖いです', answer: '무서워요' },
    { hangul: '시험 결과가 걱정돼요.', romaji: 'siheom gyeolgwaga geokjeongdwaeyo.', meaning: '試験の結果が心配です', answer: '걱정돼요' },
    { hangul: '오랜만에 친구를 만나서 반가워요.', romaji: 'oraenmane chingureul mannaseo bangawoyo.', meaning: '久しぶりに友達に会えてうれしいです', answer: '반가워요' },
    { hangul: '일이 많아서 너무 피곤해요.', romaji: 'iri manaseo neomu pigonhaeyo.', meaning: '仕事が多くてとても疲れています', answer: '피곤해요' },
  ],
  // 自然・動物
  [
    { hangul: '마당에서 강아지를 키워요.', romaji: 'madangeseo gangajireul kiwoyo.', meaning: '庭で子犬を飼います', answer: '강아지' },
    { hangul: '집에서 고양이를 키워요.', romaji: 'jibeseo goyangireul kiwoyo.', meaning: '家で猫を飼います', answer: '고양이' },
    { hangul: '하늘을 나는 새를 봤어요.', romaji: 'haneureul naneun saereul bwasseoyo.', meaning: '空を飛ぶ鳥を見ました', answer: '새' },
    { hangul: '동물원에서 호랑이를 봤어요.', romaji: 'dongmurwoneseo horangireul bwasseoyo.', meaning: '動物園で虎を見ました', answer: '호랑이' },
    { hangul: '코가 긴 코끼리가 신기해요.', romaji: 'koga gin kokkiriga singihaeyo.', meaning: '鼻が長い象が珍しいです', answer: '코끼리' },
    { hangul: '바다에서 물고기를 잡았어요.', romaji: 'badaeseo mulgogireul jabasseoyo.', meaning: '海で魚を捕まえました', answer: '물고기' },
    { hangul: '풀밭에서 토끼가 뛰어요.', romaji: 'pulbateseo tokkiga ttwieoyo.', meaning: '草原でうさぎが跳ねます', answer: '토끼' },
    { hangul: '농장에서 돼지를 길러요.', romaji: 'nongjangeseo dwaejireul gireoyo.', meaning: '農場で豚を飼います', answer: '돼지' },
  ],
  // 家・家具
  [
    { hangul: '거실에 큰 소파를 놓았어요.', romaji: 'geosire keun sopareul noasseoyo.', meaning: 'リビングに大きいソファを置きました', answer: '소파' },
    { hangul: '밤에는 침대에서 자요.', romaji: 'bameneun chimdaeeseo jayo.', meaning: '夜はベッドで寝ます', answer: '침대' },
    { hangul: '책을 책상 위에 두었어요.', romaji: 'chaegeul chaeksang wie dueosseoyo.', meaning: '本を机の上に置きました', answer: '책상' },
    { hangul: '옷을 옷장에 걸었어요.', romaji: 'oseul otjange georeosseoyo.', meaning: '服をクローゼットに掛けました', answer: '옷장' },
    { hangul: '음식을 냉장고에 넣었어요.', romaji: 'eumsigeul naengjanggoe neoeosseoyo.', meaning: '食べ物を冷蔵庫に入れました', answer: '냉장고' },
    { hangul: '더워서 선풍기를 켰어요.', romaji: 'deowoseo seonpunggireul kyeosseoyo.', meaning: '暑くて扇風機をつけました', answer: '선풍기' },
    { hangul: '방이 어두워서 전등을 켰어요.', romaji: 'bangi eoduwoseo jeondeungeul kyeosseoyo.', meaning: '部屋が暗くて電灯をつけました', answer: '전등' },
    { hangul: '거울을 보며 머리를 빗어요.', romaji: 'geoureul bomyeo meorireul biseoyo.', meaning: '鏡を見ながら髪をとかします', answer: '거울' },
  ],
  // 色
  [
    { hangul: '사과는 빨간색이에요.', romaji: 'sagwaneun ppalgansaegieyo.', meaning: 'りんごは赤色です', answer: '빨간색' },
    { hangul: '맑은 하늘은 파란색이에요.', romaji: 'malgeun haneureun paransaegieyo.', meaning: '晴れた空は青色です', answer: '파란색' },
    { hangul: '바나나는 노란색이에요.', romaji: 'bananeun noransaegieyo.', meaning: 'バナナは黄色です', answer: '노란색' },
    { hangul: '나뭇잎은 초록색이에요.', romaji: 'namunnipeun choroksaegieyo.', meaning: '木の葉は緑色です', answer: '초록색' },
    { hangul: '겨울에 내리는 눈은 하얀색이에요.', romaji: 'gyeoure naerineun nuneun hayansaegieyo.', meaning: '冬に降る雪は白色です', answer: '하얀색' },
    { hangul: '밤하늘은 까만색이에요.', romaji: 'bamhaneureun kkamansaegieyo.', meaning: '夜空は黒色です', answer: '까만색' },
    { hangul: '가지는 보라색이에요.', romaji: 'gajineun borasaegieyo.', meaning: 'なすは紫色です', answer: '보라색' },
    { hangul: '저녁노을은 분홍색이에요.', romaji: 'jeonyeongnoeureun bunhongsaegieyo.', meaning: '夕焼けはピンク色です', answer: '분홍색' },
  ],
  // 電子・通信
  [
    { hangul: '친구에게 문자를 보냈어요.', romaji: 'chinguege munjareul bonaesseoyo.', meaning: '友達にメッセージを送りました', answer: '문자' },
    { hangul: '모르는 것을 인터넷에서 찾아요.', romaji: 'moreuneun geoseul inteoneseseo chajayo.', meaning: 'わからないことをインターネットで調べます', answer: '인터넷' },
    { hangul: '매일 컴퓨터로 일을 해요.', romaji: 'maeil keompyuteoro ireul haeyo.', meaning: '毎日コンピューターで仕事をします', answer: '컴퓨터' },
    { hangul: '새 휴대폰을 샀어요.', romaji: 'sae hyudaeponeul sasseoyo.', meaning: '新しい携帯電話を買いました', answer: '휴대폰' },
    { hangul: '사진을 이메일로 보냈어요.', romaji: 'sajineul imeillo bonaesseoyo.', meaning: '写真をメールで送りました', answer: '이메일' },
    { hangul: '친구에게 전화를 걸었어요.', romaji: 'chinguege jeonhwareul georeosseoyo.', meaning: '友達に電話をかけました', answer: '전화' },
    { hangul: '영상을 보려고 텔레비전을 켰어요.', romaji: 'yeongsangeul boryeogo tellebijeoneul kyeosseoyo.', meaning: '映像を見ようとテレビをつけました', answer: '텔레비전' },
    { hangul: '음악을 들으려고 이어폰을 꼈어요.', romaji: 'eumageul deureuryeogo ieoponeul kkyeosseoyo.', meaning: '音楽を聴こうとイヤホンをつけました', answer: '이어폰' },
  ],
]

export const CLOZE_CATS = [
  '場所',
  '食べ物・飲み物',
  '時間',
  '人・家族',
  '形容詞・状態',
  '動詞',
  '天気・季節',
  '交通・移動',
  '趣味・余暇',
  '身体・健康',
  '衣服・買い物',
  '学校・勉強',
  '仕事・職業',
  '感情・気持ち',
  '自然・動物',
  '家・家具',
  '色',
  '電子・通信',
]

export const CLOZE: Hangul[] = CLOZE_ROWS.flat()
