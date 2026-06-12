// 敬語 (높임말)。パターン別の例文。1 行 = 1 パターン。
import type { Hangul } from './hangul'

export const KEIGO_ROWS: Hangul[][] = [
  // 〜(으)세요 (尊敬の現在)
  [
    { hangul: '어디에 가세요?', romaji: 'eodie gaseyo?', meaning: 'どちらに行かれますか?', note: '〜(으)세요 (尊敬の現在)' },
    { hangul: '어디에 사세요?', romaji: 'eodie saseyo?', meaning: 'どちらにお住まいですか?', note: '〜(으)세요 (尊敬の現在)' },
    { hangul: '무슨 일을 하세요?', romaji: 'museun ireul haseyo?', meaning: 'どんなお仕事をされていますか?', note: '〜(으)세요 (尊敬の現在)' },
    { hangul: '한국어를 가르치세요?', romaji: 'hangugeoreul gareuchiseyo?', meaning: '韓国語を教えていらっしゃいますか?', note: '〜(으)세요 (尊敬の現在)' },
    { hangul: '요즘 잘 지내세요?', romaji: 'yojeum jal jinaeseyo?', meaning: '最近お元気でお過ごしですか?', note: '〜(으)세요 (尊敬の現在)' },
    { hangul: '주말마다 등산을 하세요?', romaji: 'jumalmada deungsaneul haseyo?', meaning: '毎週末、登山をなさるのですか?', note: '〜(으)세요 (尊敬の現在)' },
  ],
  // 〜(으)셨어요 (尊敬の過去)
  [
    { hangul: '주말에 뭐 하셨어요?', romaji: 'jumare mwo hasyeosseoyo?', meaning: '週末は何をなさいましたか?', note: '〜(으)셨어요 (尊敬の過去)' },
    { hangul: '언제 한국에 오셨어요?', romaji: 'eonje hanguge osyeosseoyo?', meaning: 'いつ韓国にいらっしゃいましたか?', note: '〜(으)셨어요 (尊敬の過去)' },
    { hangul: '그 영화 보셨어요?', romaji: 'geu yeonghwa bosyeosseoyo?', meaning: 'その映画をご覧になりましたか?', note: '〜(으)셨어요 (尊敬の過去)' },
    { hangul: '어제 잘 쉬셨어요?', romaji: 'eoje jal swisyeosseoyo?', meaning: '昨日はゆっくり休まれましたか?', note: '〜(으)셨어요 (尊敬の過去)' },
    { hangul: '벌써 도착하셨어요?', romaji: 'beolsseo dochakasyeosseoyo?', meaning: 'もう到着されましたか?', note: '〜(으)셨어요 (尊敬の過去)' },
    { hangul: '이 책을 쓰셨어요?', romaji: 'i chaegeul sseusyeosseoyo?', meaning: 'この本をお書きになったのですか?', note: '〜(으)셨어요 (尊敬の過去)' },
  ],
  // 〜(으)십니다 (尊敬の합니다体)
  [
    { hangul: '사장님은 지금 회의 중이십니다.', romaji: 'sajangnimeun jigeum hoeui jungisimnida.', meaning: '社長はただいま会議中でいらっしゃいます。', note: '〜(으)십니다 (尊敬の합니다体)' },
    { hangul: '할아버지는 신문을 읽으십니다.', romaji: 'harabeojineun sinmuneul ilgeusimnida.', meaning: 'おじいさんは新聞をお読みになります。', note: '〜(으)십니다 (尊敬の합니다体)' },
    { hangul: '어떻게 생각하십니까?', romaji: 'eotteoke saenggakasimnikka?', meaning: 'どのようにお考えですか?', note: '〜(으)십니다 (尊敬の합니다体)' },
    { hangul: '부장님은 매일 운동을 하십니다.', romaji: 'bujangnimeun maeil undongeul hasimnida.', meaning: '部長は毎日運動をなさいます。', note: '〜(으)십니다 (尊敬の합니다体)' },
    { hangul: '부장님은 매일 아침 운동을 하십니다.', romaji: 'bujangnimeun maeil achim undongeul hasimnida.', meaning: '部長は毎朝運動をなさいます。', note: '〜(으)십니다 (尊敬の합니다体)' },
    { hangul: '교수님은 내일 출장을 가십니다.', romaji: 'gyosunimeun naeil chuljangeul gasimnida.', meaning: '教授は明日出張に行かれます。', note: '〜(으)십니다 (尊敬の합니다体)' },
  ],
  // 계시다/드시다/주무시다 (特殊な尊敬動詞)
  [
    { hangul: '아버지는 지금 집에 계세요.', romaji: 'abeojineun jigeum jibe gyeseyo.', meaning: 'お父さんは今、家にいらっしゃいます。', note: '계시다/드시다/주무시다 (特殊な尊敬動詞)' },
    { hangul: '천천히 드세요.', romaji: 'cheoncheonhi deuseyo.', meaning: 'ごゆっくり召し上がってください。', note: '계시다/드시다/주무시다 (特殊な尊敬動詞)' },
    { hangul: '안녕히 주무세요.', romaji: 'annyeonghi jumuseyo.', meaning: 'おやすみなさいませ。', note: '계시다/드시다/주무시다 (特殊な尊敬動詞)' },
    { hangul: '커피 드시겠어요?', romaji: 'keopi deusigesseoyo?', meaning: 'コーヒーを召し上がりますか?', note: '계시다/드시다/주무시다 (特殊な尊敬動詞)' },
    { hangul: '할머니는 일찍 주무셨어요.', romaji: 'halmeonineun iljjik jumusyeosseoyo.', meaning: 'おばあさんは早くお休みになりました。', note: '계시다/드시다/주무시다 (特殊な尊敬動詞)' },
    { hangul: '사장님은 사무실에 안 계십니다.', romaji: 'sajangnimeun samusire an gyesimnida.', meaning: '社長はオフィスにいらっしゃいません。', note: '계시다/드시다/주무시다 (特殊な尊敬動詞)' },
  ],
  // 〜께서 / 〜께 (尊敬の助詞)
  [
    { hangul: '할머니께서 전화를 하셨어요.', romaji: 'halmeonikkeseo jeonhwareul hasyeosseoyo.', meaning: 'おばあさんがお電話をなさいました。', note: '〜께서 / 〜께 (尊敬の助詞)' },
    { hangul: '선생님께서 말씀하셨어요.', romaji: 'seonsaengnimkkeseo malsseumhasyeosseoyo.', meaning: '先生がおっしゃいました。', note: '〜께서 / 〜께 (尊敬の助詞)' },
    { hangul: '부모님께 선물을 보냈어요.', romaji: 'bumonimkke seonmureul bonaesseoyo.', meaning: 'ご両親に贈り物をお送りしました。', note: '〜께서 / 〜께 (尊敬の助詞)' },
    { hangul: '사장님께서는 오늘 안 나오세요.', romaji: 'sajangnimkkeseoneun oneul an naoseyo.', meaning: '社長は今日はお見えになりません。', note: '〜께서 / 〜께 (尊敬の助詞)' },
    { hangul: '선생님께 질문이 있어요.', romaji: 'seonsaengnimkke jilmuni isseoyo.', meaning: '先生に質問があります。', note: '〜께서 / 〜께 (尊敬の助詞)' },
    { hangul: '할아버지께서 주신 시계예요.', romaji: 'harabeojikkeseo jusin sigyeyeyo.', meaning: 'おじいさんがくださった時計です。', note: '〜께서 / 〜께 (尊敬の助詞)' },
  ],
  // 드리다/말씀 (謙譲)
  [
    { hangul: '제가 도와드릴게요.', romaji: 'jega dowadeurilgeyo.', meaning: '私がお手伝いいたします。', note: '드리다/말씀 (謙譲)' },
    { hangul: '말씀 좀 여쭤봐도 될까요?', romaji: 'malsseum jom yeojjwobwado doelkkayo?', meaning: 'ちょっとお伺いしてもよろしいでしょうか?', note: '드리다/말씀 (謙譲)' },
    { hangul: '나중에 연락드리겠습니다.', romaji: 'najunge yeollakdeurigesseumnida.', meaning: '後ほどご連絡いたします。', note: '드리다/말씀 (謙譲)' },
    { hangul: '선생님께 말씀드렸어요.', romaji: 'seonsaengnimkke malsseumdeuryeosseoyo.', meaning: '先生に申し上げました。', note: '드리다/말씀 (謙譲)' },
    { hangul: '사진을 보여 드릴까요?', romaji: 'sajineul boyeo deurilkkayo?', meaning: '写真をお見せいたしましょうか?', note: '드리다/말씀 (謙譲)' },
    { hangul: '자세한 내용은 메일로 알려 드리겠습니다.', romaji: 'jasehan naeyongeun meillo allyeo deurigesseumnida.', meaning: '詳しい内容はメールでお知らせいたします。', note: '드리다/말씀 (謙譲)' },
  ],
  // 〜아/어 주시겠어요? (依頼の丁寧形)
  [
    { hangul: '다시 한번 말해 주시겠어요?', romaji: 'dasi hanbeon malhae jusigesseoyo?', meaning: 'もう一度言っていただけますか?', note: '〜아/어 주시겠어요? (依頼の丁寧形)' },
    { hangul: '조금 천천히 말씀해 주시겠어요?', romaji: 'jogeum cheoncheonhi malsseumhae jusigesseoyo?', meaning: '少しゆっくりお話しいただけますか?', note: '〜아/어 주시겠어요? (依頼の丁寧形)' },
    { hangul: '창문을 닫아 주시겠어요?', romaji: 'changmuneul dada jusigesseoyo?', meaning: '窓を閉めていただけますか?', note: '〜아/어 주시겠어요? (依頼の丁寧形)' },
    { hangul: '여기에 서명해 주시겠어요?', romaji: 'yeogie seomyeonghae jusigesseoyo?', meaning: 'こちらにご署名いただけますか?', note: '〜아/어 주시겠어요? (依頼の丁寧形)' },
    { hangul: '사진 좀 찍어 주시겠어요?', romaji: 'sajin jom jjigeo jusigesseoyo?', meaning: '写真を撮っていただけますか?', note: '〜아/어 주시겠어요? (依頼の丁寧形)' },
    { hangul: '잠깐 기다려 주시겠어요?', romaji: 'jamkkan gidaryeo jusigesseoyo?', meaning: '少しお待ちいただけますか?', note: '〜아/어 주시겠어요? (依頼の丁寧形)' },
  ],
  // 님/씨 (呼称)
  [
    { hangul: '김 선생님, 안녕하세요?', romaji: 'gim seonsaengnim, annyeonghaseyo?', meaning: 'キム先生、こんにちは。', note: '님/씨 (呼称)' },
    { hangul: '유나 씨, 시간 있으세요?', romaji: 'yuna ssi, sigan isseuseyo?', meaning: 'ユナさん、お時間ありますか?', note: '님/씨 (呼称)' },
    { hangul: '고객님, 무엇을 도와드릴까요?', romaji: 'gogaengnim, mueoseul dowadeurilkkayo?', meaning: 'お客様、何かお手伝いいたしましょうか?', note: '님/씨 (呼称)' },
    { hangul: '부장님, 회의 자료입니다.', romaji: 'bujangnim, hoeui jaryoimnida.', meaning: '部長、会議の資料でございます。', note: '님/씨 (呼称)' },
    { hangul: '민수 씨는 회사원이에요?', romaji: 'minsu ssineun hoesawonieyo?', meaning: 'ミンスさんは会社員ですか?', note: '님/씨 (呼称)' },
    { hangul: '손님, 이쪽으로 오세요.', romaji: 'sonnim, ijjogeuro oseyo.', meaning: 'お客様、こちらへどうぞ。', note: '님/씨 (呼称)' },
  ],
]

export const KEIGO: Hangul[] = KEIGO_ROWS.flat()
