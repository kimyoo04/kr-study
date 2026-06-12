// 助数詞 (単位名詞)。韓国語は固有数詞 + 助数詞 / 漢数詞 + 助数詞 の組み合わせ。
import type { Hangul } from './hangul'

export const COUNTER_ROWS: Hangul[][] = [
  // 個数 〜개 (固有数詞)
  [
    { hangul: '한 개', romaji: 'han gae', meaning: '1個' },
    { hangul: '두 개', romaji: 'du gae', meaning: '2個' },
    { hangul: '세 개', romaji: 'se gae', meaning: '3個' },
    { hangul: '네 개', romaji: 'ne gae', meaning: '4個' },
    { hangul: '다섯 개', romaji: 'daseot gae', meaning: '5個' },
    { hangul: '여섯 개', romaji: 'yeoseot gae', meaning: '6個' },
    { hangul: '일곱 개', romaji: 'ilgop gae', meaning: '7個' },
    { hangul: '여덟 개', romaji: 'yeodeol gae', meaning: '8個' },
    { hangul: '아홉 개', romaji: 'ahop gae', meaning: '9個' },
    { hangul: '열 개', romaji: 'yeol gae', meaning: '10個' },
  ],
  // 人 〜명 (固有数詞)
  [
    { hangul: '한 명', romaji: 'han myeong', meaning: '1人' },
    { hangul: '두 명', romaji: 'du myeong', meaning: '2人' },
    { hangul: '세 명', romaji: 'se myeong', meaning: '3人' },
    { hangul: '네 명', romaji: 'ne myeong', meaning: '4人' },
  ],
  // 様 (人の尊敬) 〜분 (固有数詞)
  [
    { hangul: '한 분', romaji: 'han bun', meaning: '1名様' },
    { hangul: '두 분', romaji: 'du bun', meaning: '2名様' },
    { hangul: '세 분', romaji: 'se bun', meaning: '3名様' },
    { hangul: '네 분', romaji: 'ne bun', meaning: '4名様' },
  ],
  // 匹・頭 〜마리 (固有数詞)
  [
    { hangul: '한 마리', romaji: 'han mari', meaning: '1匹' },
    { hangul: '두 마리', romaji: 'du mari', meaning: '2匹' },
    { hangul: '세 마리', romaji: 'se mari', meaning: '3匹' },
    { hangul: '네 마리', romaji: 'ne mari', meaning: '4匹' },
  ],
  // 歳 〜살 (固有数詞)
  [
    { hangul: '한 살', romaji: 'han sal', meaning: '1歳' },
    { hangul: '두 살', romaji: 'du sal', meaning: '2歳' },
    { hangul: '세 살', romaji: 'se sal', meaning: '3歳' },
    { hangul: '네 살', romaji: 'ne sal', meaning: '4歳' },
    { hangul: '다섯 살', romaji: 'daseot sal', meaning: '5歳' },
    { hangul: '스무 살', romaji: 'seumu sal', meaning: '20歳' },
  ],
  // 本(瓶) 〜병 (固有数詞)
  [
    { hangul: '한 병', romaji: 'han byeong', meaning: '1本(瓶)' },
    { hangul: '두 병', romaji: 'du byeong', meaning: '2本(瓶)' },
    { hangul: '세 병', romaji: 'se byeong', meaning: '3本(瓶)' },
  ],
  // 杯 〜잔 (固有数詞)
  [
    { hangul: '한 잔', romaji: 'han jan', meaning: '1杯' },
    { hangul: '두 잔', romaji: 'du jan', meaning: '2杯' },
    { hangul: '세 잔', romaji: 'se jan', meaning: '3杯' },
  ],
  // 枚 〜장 (固有数詞)
  [
    { hangul: '한 장', romaji: 'han jang', meaning: '1枚' },
    { hangul: '두 장', romaji: 'du jang', meaning: '2枚' },
    { hangul: '세 장', romaji: 'se jang', meaning: '3枚' },
  ],
  // 冊 〜권 (固有数詞)
  [
    { hangul: '한 권', romaji: 'han gwon', meaning: '1冊' },
    { hangul: '두 권', romaji: 'du gwon', meaning: '2冊' },
    { hangul: '세 권', romaji: 'se gwon', meaning: '3冊' },
  ],
  // 台 〜대 (固有数詞)
  [
    { hangul: '한 대', romaji: 'han dae', meaning: '1台' },
    { hangul: '두 대', romaji: 'du dae', meaning: '2台' },
    { hangul: '세 대', romaji: 'se dae', meaning: '3台' },
  ],
  // 着 〜벌 (固有数詞)
  [
    { hangul: '한 벌', romaji: 'han beol', meaning: '1着' },
    { hangul: '두 벌', romaji: 'du beol', meaning: '2着' },
  ],
  // 足 〜켤레 (固有数詞)
  [
    { hangul: '한 켤레', romaji: 'han kyeolle', meaning: '1足' },
    { hangul: '두 켤레', romaji: 'du kyeolle', meaning: '2足' },
  ],
  // 回 〜번 (固有数詞)
  [
    { hangul: '한 번', romaji: 'han beon', meaning: '1回' },
    { hangul: '두 번', romaji: 'du beon', meaning: '2回' },
    { hangul: '세 번', romaji: 'se beon', meaning: '3回' },
    { hangul: '네 번', romaji: 'ne beon', meaning: '4回' },
  ],
  // 時 〜시 (固有数詞)
  [
    { hangul: '한 시', romaji: 'han si', meaning: '1時' },
    { hangul: '두 시', romaji: 'du si', meaning: '2時' },
    { hangul: '세 시', romaji: 'se si', meaning: '3時' },
    { hangul: '네 시', romaji: 'ne si', meaning: '4時' },
    { hangul: '다섯 시', romaji: 'daseot si', meaning: '5時' },
    { hangul: '여섯 시', romaji: 'yeoseot si', meaning: '6時' },
    { hangul: '일곱 시', romaji: 'ilgop si', meaning: '7時' },
    { hangul: '여덟 시', romaji: 'yeodeol si', meaning: '8時' },
    { hangul: '아홉 시', romaji: 'ahop si', meaning: '9時' },
    { hangul: '열 시', romaji: 'yeol si', meaning: '10時' },
    { hangul: '열한 시', romaji: 'yeolhan si', meaning: '11時' },
    { hangul: '열두 시', romaji: 'yeoldu si', meaning: '12時' },
  ],
  // 分 〜분 (漢数詞)
  [
    { hangul: '일 분', romaji: 'il bun', meaning: '1分' },
    { hangul: '이 분', romaji: 'i bun', meaning: '2分' },
    { hangul: '삼 분', romaji: 'sam bun', meaning: '3分' },
    { hangul: '오 분', romaji: 'o bun', meaning: '5分' },
    { hangul: '십 분', romaji: 'sip bun', meaning: '10分' },
    { hangul: '십오 분', romaji: 'sibo bun', meaning: '15分' },
    { hangul: '삼십 분', romaji: 'samsip bun', meaning: '30分' },
  ],
  // 日付 〜일 (漢数詞)
  [
    { hangul: '일일', romaji: 'iril', meaning: '1日' },
    { hangul: '이일', romaji: 'iil', meaning: '2日' },
    { hangul: '삼일', romaji: 'samil', meaning: '3日' },
    { hangul: '사일', romaji: 'sail', meaning: '4日' },
    { hangul: '오일', romaji: 'oil', meaning: '5日' },
    { hangul: '육일', romaji: 'yugil', meaning: '6日' },
    { hangul: '칠일', romaji: 'chiril', meaning: '7日' },
    { hangul: '팔일', romaji: 'paril', meaning: '8日' },
    { hangul: '구일', romaji: 'guil', meaning: '9日' },
    { hangul: '십일', romaji: 'sibil', meaning: '10日' },
    { hangul: '십오일', romaji: 'siboil', meaning: '15日' },
    { hangul: '이십일', romaji: 'isibil', meaning: '20日' },
    { hangul: '삼십일', romaji: 'samsibil', meaning: '30日' },
  ],
  // 月 〜월 (漢数詞、6月・10月は変則)
  [
    { hangul: '일월', romaji: 'irwol', meaning: '1月' },
    { hangul: '이월', romaji: 'iwol', meaning: '2月' },
    { hangul: '삼월', romaji: 'samwol', meaning: '3月' },
    { hangul: '사월', romaji: 'sawol', meaning: '4月' },
    { hangul: '오월', romaji: 'owol', meaning: '5月' },
    { hangul: '유월', romaji: 'yuwol', meaning: '6月' },
    { hangul: '칠월', romaji: 'chirwol', meaning: '7月' },
    { hangul: '팔월', romaji: 'parwol', meaning: '8月' },
    { hangul: '구월', romaji: 'guwol', meaning: '9月' },
    { hangul: '시월', romaji: 'siwol', meaning: '10月' },
    { hangul: '십일월', romaji: 'sibirwol', meaning: '11月' },
    { hangul: '십이월', romaji: 'sibiwol', meaning: '12月' },
  ],
  // 年 〜년 (漢数詞)
  [
    { hangul: '일 년', romaji: 'il nyeon', meaning: '1年' },
    { hangul: '이 년', romaji: 'i nyeon', meaning: '2年' },
    { hangul: '삼 년', romaji: 'sam nyeon', meaning: '3年' },
    { hangul: '사 년', romaji: 'sa nyeon', meaning: '4年' },
    { hangul: '십 년', romaji: 'sip nyeon', meaning: '10年' },
  ],
  // ウォン 〜원 (漢数詞)
  [
    { hangul: '백 원', romaji: 'baek won', meaning: '100ウォン' },
    { hangul: '오백 원', romaji: 'obaek won', meaning: '500ウォン' },
    { hangul: '천 원', romaji: 'cheon won', meaning: '1000ウォン' },
    { hangul: '오천 원', romaji: 'ocheon won', meaning: '5000ウォン' },
    { hangul: '만 원', romaji: 'man won', meaning: '1万ウォン' },
    { hangul: '오만 원', romaji: 'oman won', meaning: '5万ウォン' },
    { hangul: '십만 원', romaji: 'simman won', meaning: '10万ウォン' },
  ],
  // 階 〜층 (漢数詞)
  [
    { hangul: '일 층', romaji: 'il cheung', meaning: '1階' },
    { hangul: '이 층', romaji: 'i cheung', meaning: '2階' },
    { hangul: '삼 층', romaji: 'sam cheung', meaning: '3階' },
    { hangul: '사 층', romaji: 'sa cheung', meaning: '4階' },
  ],
  // 番 〜번 (漢数詞、番号)
  [
    { hangul: '일 번', romaji: 'il beon', meaning: '1番' },
    { hangul: '이 번', romaji: 'i beon', meaning: '2番' },
    { hangul: '삼 번', romaji: 'sam beon', meaning: '3番' },
    { hangul: '사 번', romaji: 'sa beon', meaning: '4番' },
  ],
]

// 行ごとのカテゴリ名 (COUNTER_ROWS と 1:1)
export const COUNTER_CATS: string[] = [
  '個数 〜개',
  '人 〜명',
  '様 〜분',
  '匹・頭 〜마리',
  '歳 〜살',
  '本(瓶) 〜병',
  '杯 〜잔',
  '枚 〜장',
  '冊 〜권',
  '台 〜대',
  '着 〜벌',
  '足 〜켤레',
  '回 〜번',
  '時 〜시',
  '分 〜분',
  '日付 〜일',
  '月 〜월',
  '年 〜년',
  'ウォン 〜원',
  '階 〜층',
  '番 〜번',
]

export const COUNTERS: Hangul[] = COUNTER_ROWS.flat()
