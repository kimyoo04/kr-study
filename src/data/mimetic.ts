// 擬声語・擬態語 (의성어/의태어)。日本語のオノマトペと対応させて覚える。
import type { Hangul } from './hangul'

export const MIMETIC_ROWS: Hangul[][] = [
  // 感情
  [
    { hangul: '두근두근', romaji: 'dugeundugeun', meaning: 'ドキドキ' },
    { hangul: '콩닥콩닥', romaji: 'kongdakkongdak', meaning: 'ドキドキ (小刻みに)' },
    { hangul: '조마조마', romaji: 'jomajoma', meaning: 'ハラハラ' },
    { hangul: '안절부절', romaji: 'anjeolbujeol', meaning: 'そわそわ' },
    { hangul: '오싹', romaji: 'ossak', meaning: 'ぞくっ' },
    { hangul: '울컥', romaji: 'ulkeok', meaning: 'ぐっと (こみ上げる)' },
    { hangul: '깜짝', romaji: 'kkamjjak', meaning: 'びっくり (はっと)' },
    { hangul: '부글부글', romaji: 'bugeulbugeul', meaning: 'ふつふつ (怒り・沸騰)' },
  ],
  // 体の状態
  [
    { hangul: '욱신욱신', romaji: 'uksinuksin', meaning: 'ずきずき' },
    { hangul: '따끔따끔', romaji: 'ttakkeumttakkeum', meaning: 'ちくちく・ひりひり' },
    { hangul: '어질어질', romaji: 'eojireojil', meaning: 'くらくら' },
    { hangul: '부들부들', romaji: 'budeulbudeul', meaning: 'ぶるぶる (震え)' },
    { hangul: '오들오들', romaji: 'odeurodeul', meaning: 'がたがた (寒さで震える)' },
    { hangul: '꾸벅꾸벅', romaji: 'kkubeokkkubeok', meaning: 'こっくりこっくり (居眠り)' },
    { hangul: '쿨쿨', romaji: 'kulkul', meaning: 'ぐうぐう (寝息)' },
    { hangul: '꼬르륵', romaji: 'kkoreureuk', meaning: 'ぐうっ (お腹が鳴る)' },
  ],
  // 天気/空気
  [
    { hangul: '펑펑', romaji: 'peongpeong', meaning: 'こんこん (雪)・どばどば' },
    { hangul: '주룩주룩', romaji: 'jurukjuruk', meaning: 'ざあざあ (雨)' },
    { hangul: '보슬보슬', romaji: 'boseulboseul', meaning: 'しとしと (小雨)' },
    { hangul: '쨍쨍', romaji: 'jjaengjjaeng', meaning: 'かんかん (日差し)' },
    { hangul: '솔솔', romaji: 'solsol', meaning: 'そよそよ (風)' },
    { hangul: '쌩쌩', romaji: 'ssaengssaeng', meaning: 'びゅうびゅう (強風)' },
    { hangul: '우르릉', romaji: 'ureureung', meaning: 'ごろごろ (雷)' },
    { hangul: '번쩍', romaji: 'beonjjeok', meaning: 'ぴかっ (稲妻)' },
  ],
  // 食感
  [
    { hangul: '바삭바삭', romaji: 'basakbasak', meaning: 'サクサク' },
    { hangul: '아삭아삭', romaji: 'asagasak', meaning: 'シャキシャキ' },
    { hangul: '쫄깃쫄깃', romaji: 'jjolgitjjolgit', meaning: 'もちもち' },
    { hangul: '말랑말랑', romaji: 'mallangmallang', meaning: 'ぷにぷに (柔らかい)' },
    { hangul: '촉촉', romaji: 'chokchok', meaning: 'しっとり' },
    { hangul: '꿀꺽', romaji: 'kkulkkeok', meaning: 'ごくり' },
    { hangul: '후루룩', romaji: 'hururuk', meaning: 'ずるずる (すする)' },
    { hangul: '냠냠', romaji: 'nyamnyam', meaning: 'もぐもぐ・ぱくぱく' },
  ],
  // 話し方/表情
  [
    { hangul: '싱글벙글', romaji: 'singgeulbeonggeul', meaning: 'にこにこ' },
    { hangul: '방긋', romaji: 'banggeut', meaning: 'にっこり' },
    { hangul: '깔깔', romaji: 'kkalkkal', meaning: 'けらけら (大笑い)' },
    { hangul: '키득키득', romaji: 'kideukkideuk', meaning: 'くすくす' },
    { hangul: '엉엉', romaji: 'eongeong', meaning: 'わんわん (大泣き)' },
    { hangul: '훌쩍훌쩍', romaji: 'huljjeokhuljjeok', meaning: 'しくしく・ぐすぐす' },
    { hangul: '소곤소곤', romaji: 'sogonsogon', meaning: 'ひそひそ' },
    { hangul: '중얼중얼', romaji: 'jungeoljungeol', meaning: 'ぶつぶつ (独り言)' },
  ],
  // 動作/態度
  [
    { hangul: '살금살금', romaji: 'salgeumsalgeum', meaning: 'こっそり (忍び足)' },
    { hangul: '슬쩍', romaji: 'seuljjeok', meaning: 'さっと (こっそり)' },
    { hangul: '허둥지둥', romaji: 'heodungjidung', meaning: 'あたふた' },
    { hangul: '꾸물꾸물', romaji: 'kkumulkkumul', meaning: 'ぐずぐず' },
    { hangul: '척척', romaji: 'cheokcheok', meaning: 'てきぱき' },
    { hangul: '두리번두리번', romaji: 'duribeonduribeon', meaning: 'きょろきょろ' },
    { hangul: '끄덕끄덕', romaji: 'kkeudeokkkeudeok', meaning: 'こくこく (うなずく)' },
    { hangul: '쭈뼛쭈뼛', romaji: 'jjuppyeotjjuppyeot', meaning: 'もじもじ' },
  ],
  // 状態/様子
  [
    { hangul: '반짝반짝', romaji: 'banjjakbanjjak', meaning: 'キラキラ' },
    { hangul: '빙글빙글', romaji: 'binggeulbinggeul', meaning: 'ぐるぐる' },
    { hangul: '흔들흔들', romaji: 'heundeulheundeul', meaning: 'ゆらゆら' },
    { hangul: '둥둥', romaji: 'dungdung', meaning: 'ぷかぷか (浮く)' },
    { hangul: '텅텅', romaji: 'teongteong', meaning: 'がらがら (空っぽ)' },
    { hangul: '빽빽', romaji: 'ppaekppaek', meaning: 'ぎっしり' },
    { hangul: '끈적끈적', romaji: 'kkeunjeokkkeunjeok', meaning: 'べたべた' },
    { hangul: '미끌미끌', romaji: 'mikkeulmikkeul', meaning: 'つるつる (滑る)' },
  ],
  // 動き/日常
  [
    { hangul: '똑똑', romaji: 'ttokttok', meaning: 'とんとん (ノック)' },
    { hangul: '쾅', romaji: 'kwang', meaning: 'ばたん・どん' },
    { hangul: '덜컹덜컹', romaji: 'deolkeongdeolkeong', meaning: 'がたごと (揺れ)' },
    { hangul: '똑딱똑딱', romaji: 'ttokttakttokttak', meaning: 'ちくたく (時計)' },
    { hangul: '부릉부릉', romaji: 'bureungbureung', meaning: 'ぶるんぶるん (エンジン)' },
    { hangul: '첨벙', romaji: 'cheombeong', meaning: 'ばしゃん (水)' },
    { hangul: '데굴데굴', romaji: 'degeuldegeul', meaning: 'ころころ (転がる)' },
    { hangul: '폴짝폴짝', romaji: 'poljjakpoljjak', meaning: 'ぴょんぴょん' },
  ],
]

// 行ごとのカテゴリ名 (MIMETIC_ROWS と 1:1)
export const MIMETIC_CATS: string[] = [
  '感情',
  '体の状態',
  '天気/空気',
  '食感',
  '話し方/表情',
  '動作/態度',
  '状態/様子',
  '動き/日常',
]

export const MIMETICS: Hangul[] = MIMETIC_ROWS.flat()
