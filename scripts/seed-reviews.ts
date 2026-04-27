import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RS = { t: { en: string; zh: string }; a: string; c: { en: string; zh: string }; r: number; d: number; v: boolean };
type CP = { g: RS[]; kw: Record<string, RS[]> };

function pick<T>(arr: T[], n: number): T[] {
  const s = [...arr].sort(() => Math.random() - 0.5);
  return s.slice(0, n);
}

function dateAgo(d: number): string {
  const dt = new Date(); dt.setDate(dt.getDate() - d);
  return dt.toISOString().split("T")[0];
}

function matchKw(name: string): string[] {
  const l = name.toLowerCase();
  const kws: string[] = [];
  const pats: [string, RegExp][] = [
    ["necklace", /necklace|choker/i], ["bracelet", /bracelet/i], ["ring", /ring/i],
    ["choker", /choker/i], ["sterling", /sterling|s925/i], ["moissanite", /moissanite/i],
    ["vintage", /vintage|复古/i], ["minimalist", /minimalist|简约/i],
    ["titanium", /titanium|钛钢/i], ["stainless", /stainless|不锈钢/i],
    ["crystal", /crystal|水晶/i], ["agate", /agate|玛瑙/i], ["beaded", /beaded|串珠/i],
    ["gold", /gold.?tone|gold tone|金色/i], ["rose", /rose.?gold|玫瑰金/i],
    ["heart", /heart|爱心/i], ["butterfly", /butterfly|蝴蝶/i], ["cross", /cross|十字/i],
    ["ethnic", /ethnic|民族/i], ["zircon", /zircon|锆石/i], ["collection", /collection|系列/i],
    ["keychain", /keychain|挂件/i], ["pillow", /pillow|抱枕/i], ["toy", /toy|玩偶/i],
    ["bear", /bear|小熊/i], ["bunny", /bunny|兔子/i], ["dog", /dog|小狗/i],
    ["otter", /otter|海獭/i], ["goose", /goose|白鹅/i], ["cat", /cat|猫咪/i],
    ["frog", /frog|青蛙/i], ["crab", /crab|螃蟹/i], ["sheep", /sheep|小羊/i],
    ["game", /game.?inspired|游戏/i],
    ["figurine", /figurine|摆件/i], ["resin", /resin|树脂/i],
    ["astronaut", /astronaut|宇航员/i], ["deer", /deer|鹿/i],
    ["lion", /lion.?dance|醒狮/i], ["princess", /princess|公主/i],
    ["zodiac", /zodiac|生肖/i], ["calendar", /calendar|日历/i],
    ["night-light", /night.?light|小夜灯/i], ["jewelry-box", /jewelry.?box|首饰盒/i],
    ["display-rack", /display.?rack|展示架/i], ["sculpture", /sculpture|雕塑/i],
    ["stress", /stress.?relief|解压/i], ["glass", /glass|玻璃/i],
    ["metal", /metal|金属|铁艺/i], ["wood", /wood|木质/i],
    ["lucky", /lucky.?god|财神/i],
  ];
  for (const [kw, re] of pats) { if (re.test(l)) kws.push(kw); }
  return kws;
}


// ─── Jewelry Pool ───────────────────────────────────────────────
const jewelryPool: CP = {
  g: [
    { t: { en: "Exquisite craftsmanship", zh: "工艺精湛" }, a: "Amelia R.", c: { en: "The attention to detail is incredible — every curve and setting feels intentional and refined. Truly a piece that speaks to the artisan's skill.", zh: "细节处理得非常到位，每一处弧线和镶嵌都显得精心而考究，确实能感受到工匠的用心。" }, r: 5, d: 45, v: true },
    { t: { en: "Perfect gift", zh: "送礼首选" }, a: "James L.", c: { en: "Bought this as a birthday present and the recipient was over the moon. The packaging alone makes it feel luxurious.", zh: "买来当生日礼物的，收礼的人开心得不得了，光是包装就很有质感。" }, r: 5, d: 22, v: true },
    { t: { en: "Great quality for the price", zh: "性价比很高" }, a: "Sophie T.", c: { en: "Wasn't sure what to expect at this price point, but the quality really surprised me. Feels solid and looks expensive.", zh: "这个价位本来没抱太大期望，但质量真的让我惊喜，看起来很有档次。" }, r: 4, d: 60, v: false },
    { t: { en: "Elegant and understated", zh: "优雅内敛" }, a: "Katherine W.", c: { en: "This has such an elegant presence without being flashy. I wear it almost every day and always get compliments.", zh: "有一种不张扬的优雅感，我几乎天天戴着，总能收到夸赞。" }, r: 5, d: 35, v: true },
    { t: { en: "My everyday go-to", zh: "日常百搭" }, a: "Mia C.", c: { en: "Lightweight and comfortable enough for daily wear. Goes with everything from casual to dressy outfits.", zh: "轻巧舒适，日常佩戴毫无负担，搭配休闲或正装都很合适。" }, r: 4, d: 50, v: true },
    { t: { en: "Holds up beautifully", zh: "持久耐用" }, a: "Rachel K.", c: { en: "I've worn this for months now — no tarnishing, no loose parts. Still looks as good as the day I got it.", zh: "戴了好几个月了，没有氧化也没有松动，还跟刚收到时一样漂亮。" }, r: 5, d: 90, v: true },
  ],
  kw: {
    necklace: [
      { t: { en: "Stunning necklace", zh: "项链太美了" }, a: "Lily M.", c: { en: "The pendant catches light beautifully and the chain length is just right. It sits perfectly on the collarbone.", zh: "吊坠折射光线特别好看，链子长度恰到好处，刚好落在锁骨位置。" }, r: 5, d: 30, v: true },
      { t: { en: "Delicate and charming", zh: "精致迷人" }, a: "Olivia P.", c: { en: "The design is so delicate — not oversized, not too tiny. Exactly the kind of necklace I've been searching for.", zh: "设计非常精致，不大不小刚刚好，正是我一直想找的那种项链。" }, r: 5, d: 15, v: true },
    ],
    bracelet: [
      { t: { en: "Beautiful bracelet", zh: "手链很漂亮" }, a: "Nora H.", c: { en: "The clasp is secure and the bracelet drapes nicely on the wrist. The detail work is impressive for this price.", zh: "扣环很牢固，手链戴在手腕上弧度很自然，这个价位能做到这种做工令人印象深刻。" }, r: 4, d: 40, v: true },
      { t: { en: "Wrist candy", zh: "手腕上的点缀" }, a: "Emma S.", c: { en: "Love stacking this with my other bracelets. It's thin enough to layer but stands out on its own too.", zh: "喜欢和其他手链叠戴，薄而不存在感弱，单戴也很出彩。" }, r: 5, d: 18, v: false },
    ],
    ring: [
      { t: { en: "Dainty and elegant ring", zh: "精致优雅的戒指" }, a: "Hannah B.", c: { en: "The band is comfortable and the stone catches just enough sparkle. Perfect for someone who prefers subtle jewelry.", zh: "戒圈戴着很舒服，宝石的闪光恰到好处，适合喜欢低调首饰的人。" }, r: 5, d: 25, v: true },
    ],
    choker: [
      { t: { en: "Chic choker", zh: "时髦的颈链" }, a: "Zoe D.", c: { en: "Fits snugly without choking and the adjustable clasp makes it versatile. Looks great with off-shoulder tops.", zh: "贴合颈部但不紧勒，可调节扣环很实用，搭配露肩上衣特别好看。" }, r: 4, d: 20, v: true },
    ],
    sterling: [
      { t: { en: "Solid sterling quality", zh: "真材实料的银饰" }, a: "Victoria N.", c: { en: "You can feel the weight of real sterling silver. No skin irritation at all even after long wear.", zh: "能感受到纯银的分量感，长时间佩戴也没有任何皮肤过敏反应。" }, r: 5, d: 55, v: true },
    ],
    moissanite: [
      { t: { en: "Sparkles like a dream", zh: "闪耀如梦" }, a: "Aria J.", c: { en: "The moissanite is brilliant — honestly rivals diamonds at a fraction of the cost. Fire and brilliance are outstanding.", zh: "莫桑石太闪了，火彩和亮度堪比钻石，价格却亲民得多。" }, r: 5, d: 12, v: true },
    ],
    vintage: [
      { t: { en: "Vintage charm at its best", zh: "复古韵味十足" }, a: "Clara F.", c: { en: "Has that old-world charm without looking dated. The patina-like details give it authentic character.", zh: "有种旧世界的迷人韵味却不会显老气，仿旧处理赋予了真实的质感。" }, r: 5, d: 38, v: true },
    ],
    minimalist: [
      { t: { en: "Less is more", zh: "简约即美" }, a: "Isla R.", c: { en: "Clean lines, no unnecessary fuss. This is the kind of minimalist piece that elevates any outfit quietly.", zh: "线条干净利落，没有任何多余的装饰，这种极简风格悄悄提升整体穿搭品味。" }, r: 4, d: 28, v: true },
    ],
    titanium: [
      { t: { en: "Light yet sturdy", zh: "轻巧又结实" }, a: "Lucas G.", c: { en: "Titanium steel makes this almost weightless but incredibly durable. Great for active people who still want style.", zh: "钛钢材质几乎感觉不到重量但非常耐用，适合既想要时尚又好动的人。" }, r: 5, d: 33, v: true },
    ],
    stainless: [
      { t: { en: "Tough and tarnish-free", zh: "坚固不氧化" }, a: "Dylan K.", c: { en: "Stainless steel means zero maintenance. I shower and sleep with it on — still looks brand new.", zh: "不锈钢材质完全不用保养，洗澡睡觉都戴着，还跟新的一样。" }, r: 4, d: 70, v: true },
    ],
    crystal: [
      { t: { en: "Crystal clear beauty", zh: "晶莹剔透" }, a: "Serena L.", c: { en: "The crystal has amazing clarity and the faceting creates rainbow reflections. It's mesmerizing in sunlight.", zh: "水晶通透度很高，切割面在阳光下会折射出彩虹光芒，让人看入迷。" }, r: 5, d: 16, v: true },
    ],
    agate: [
      { t: { en: "Natural agate, natural beauty", zh: "天然玛瑙的天然之美" }, a: "Freya M.", c: { en: "Each piece has unique banding patterns — mine has gorgeous warm tones. Love that no two are exactly alike.", zh: "每件的纹路都独一无二，我收到的这枚暖色调特别漂亮，喜欢这种不可复制的感觉。" }, r: 5, d: 42, v: true },
    ],
    beaded: [
      { t: { en: "Lovely beaded design", zh: "串珠设计很讨喜" }, a: "Tara O.", c: { en: "The beads are smooth and uniform, and the elastic string holds firm. A fun, bohemian touch to any look.", zh: "珠子圆润均匀，弹力线也很结实，给整体搭配增添了一抹波西米亚风情。" }, r: 4, d: 52, v: false },
    ],
    gold: [
      { t: { en: "Golden glow", zh: "金色光芒" }, a: "Penelope A.", c: { en: "The gold-tone finish is rich and warm, not brassy at all. Looks much more expensive than it is.", zh: "金色涂层饱满温暖，完全没有廉价铜色感，看起来比实际价格贵不少。" }, r: 5, d: 24, v: true },
    ],
    rose: [
      { t: { en: "Rose gold perfection", zh: "玫瑰金的完美" }, a: "Chloe V.", c: { en: "The rose gold tone is soft and flattering on every skin tone. It's become my absolute favorite finish.", zh: "玫瑰金色柔和百搭，适合各种肤色，已经成了我最爱的颜色。" }, r: 5, d: 19, v: true },
    ],
    heart: [
      { t: { en: "Heart of gold", zh: "满心欢喜" }, a: "Bella E.", c: { en: "The heart motif is sweet without being childish. My partner gave me this for our anniversary — I treasure it.", zh: "爱心元素甜美但不幼稚，伴侣送我的周年纪念礼物，非常珍惜。" }, r: 5, d: 10, v: true },
    ],
    butterfly: [
      { t: { en: "Beautiful butterfly", zh: "蝶舞翩翩" }, a: "Luna I.", c: { en: "The butterfly wings have such delicate engraving. It's whimsical and elegant at the same time.", zh: "蝴蝶翅膀上的雕刻纹路非常精致，既有灵气又不失优雅。" }, r: 5, d: 37, v: true },
    ],
    cross: [
      { t: { en: "Meaningful and well-made", zh: "意义非凡做工精良" }, a: "Grace Q.", c: { en: "The cross pendant is beautifully proportioned. It's a meaningful piece that also happens to look fantastic.", zh: "十字架吊坠比例恰到好处，既是信仰象征，本身也非常好看。" }, r: 5, d: 48, v: true },
    ],
    ethnic: [
      { t: { en: "Rich cultural vibes", zh: "浓郁民族风情" }, a: "Yara U.", c: { en: "The ethnic patterns are vibrant and authentic-feeling. Stands out in the best way among my collection.", zh: "民族图案色彩浓郁、质感真实，在我的收藏里格外亮眼。" }, r: 4, d: 29, v: true },
    ],
    zircon: [
      { t: { en: "Zircon sparkle", zh: "锆石闪耀" }, a: "Jade X.", c: { en: "The zircon stones have a nice fire to them — not cloudy at all. They really elevate the overall design.", zh: "锆石的火彩很好，完全不浑浊，确实提升了整体设计的档次。" }, r: 4, d: 26, v: true },
    ],
    collection: [
      { t: { en: "Great addition to my collection", zh: "收藏系列的好补充" }, a: "Stella Y.", c: { en: "This fits perfectly with the other pieces in the series. Collectors will appreciate the cohesive design language.", zh: "和系列中其他单品搭配得很好，收藏者会欣赏这种统一的设计语言。" }, r: 5, d: 14, v: true },
    ],
  },
};

// ─── Plush Pool ─────────────────────────────────────────────────
const plushPool: CP = {
  g: [
    { t: { en: "So incredibly soft", zh: "软到心化" }, a: "Avery T.", c: { en: "The plush material is unbelievably soft — like hugging a cloud. Even adults won't want to put it down.", zh: "毛绒材质柔软得令人难以置信，像拥抱一朵云，连大人都舍不得放下。" }, r: 5, d: 20, v: true },
    { t: { en: "Kids absolutely love it", zh: "孩子们超级喜欢" }, a: "Megan P.", c: { en: "Got this for my 5-year-old and she carries it everywhere now. It's become her bedtime companion.", zh: "给五岁女儿买的，现在走哪带哪，已经成了她的睡前小伙伴。" }, r: 5, d: 35, v: true },
    { t: { en: "Bigger than expected", zh: "比想象中大" }, a: "Carlos R.", c: { en: "Was pleasantly surprised by the size — it's larger than the photos suggest. Great value for the dimensions.", zh: "尺寸比照片看起来大，惊喜到了，这个大小性价比很高。" }, r: 4, d: 15, v: false },
    { t: { en: "Perfect for hugging", zh: "拥抱感满分" }, a: "Jasmine L.", c: { en: "The filling is just the right density — firm enough to hold its shape but squishy enough for a good hug.", zh: "填充密度恰到好处，既有型又足够软乎，抱着特别舒服。" }, r: 5, d: 42, v: true },
    { t: { en: "Worth every penny", zh: "物超所值" }, a: "Derek W.", c: { en: "For the price, the quality is outstanding. Stitching is neat, no loose threads, and the colors haven't faded after washing.", zh: "这个价位质量非常出色，缝线整齐无线头，洗过之后也没有褪色。" }, r: 4, d: 55, v: true },
  ],
  kw: {
    keychain: [
      { t: { en: "Adorable keychain companion", zh: "可爱挂件随行" }, a: "Nina F.", c: { en: "The mini plush keychain is so cute on my bag. The clip is sturdy and the plush stays fluffy despite daily use.", zh: "迷你毛绒挂件挂在包上超可爱，夹扣很结实，天天用还是毛茸茸的。" }, r: 5, d: 18, v: true },
      { t: { en: "Tiny but delightful", zh: "小巧又讨喜" }, a: "Hugo Z.", c: { en: "Smaller than a palm but packed with cuteness. Makes finding my keys a little more joyful.", zh: "比手掌还小但可爱满分，找钥匙的时候心情都会变好。" }, r: 4, d: 30, v: true },
    ],
    pillow: [
      { t: { en: "Best cuddle pillow", zh: "最佳抱枕" }, a: "Tanya S.", c: { en: "This plush pillow is the perfect size for curling up with on the couch. Super supportive and insanely soft.", zh: "这个毛绒抱枕窝在沙发上抱刚刚好，支撑力足够，柔软度满分。" }, r: 5, d: 25, v: true },
      { t: { en: "Decorative and functional", zh: "好看又好用" }, a: "Leo M.", c: { en: "Doubles as room decor and a comfy cushion. The fabric is premium and the shape holds well after months of use.", zh: "既是房间装饰又是舒服的靠垫，面料质感好，用了几个月形状依然很好。" }, r: 4, d: 48, v: true },
    ],
    toy: [
      { t: { en: "Endless fun", zh: "乐趣无穷" }, a: "Rita K.", c: { en: "My kid plays with this plush toy every single day. It's held up to a lot of love and rough play.", zh: "我家孩子每天都要玩这个毛绒玩具，经得起各种折腾和爱。" }, r: 5, d: 40, v: true },
      { t: { en: "Imaginative play essential", zh: "激发想象力的好伙伴" }, a: "Owen B.", c: { en: "Sparks so much creative play — my son takes it on adventures around the house. Well-constructed and safe.", zh: "激发了很多创意游戏，我儿子带着它在屋里到处冒险，做工好又安全。" }, r: 5, d: 32, v: true },
    ],
    bear: [
      { t: { en: "Classic teddy charm", zh: "经典小熊魅力" }, a: "Cindy L.", c: { en: "This bear has that timeless teddy look with modern quality. The embroidered eyes give me peace of mind for little ones.", zh: "有经典泰迪熊的造型又有现代的品质，刺绣眼睛让小朋友玩起来更安心。" }, r: 5, d: 22, v: true },
    ],
    bunny: [
      { t: { en: "Hop into my heart", zh: "蹦进我心里" }, a: "Sasha G.", c: { en: "The floppy ears and sweet expression are irresistible. My daughter named hers on the spot.", zh: "耷拉的耳朵和甜甜的表情让人无法抗拒，女儿一收到就给它取了名字。" }, r: 5, d: 14, v: true },
    ],
    dog: [
      { t: { en: "Good boy plush", zh: "乖狗狗毛绒" }, a: "Marcus J.", c: { en: "Looks just like a real puppy with those soulful eyes. My son sleeps with it every night.", zh: "那双水汪汪的大眼睛跟真小狗一样，我儿子每晚都抱着它睡。" }, r: 5, d: 27, v: true },
    ],
    otter: [
      { t: { en: "Otterly adorable", zh: "海獭萌翻了" }, a: "Fiona W.", c: { en: "The little otter holding its shell is the cutest thing ever. Well-made with soft, plush fur.", zh: "抱着贝壳的小海獭简直萌化了，做工精细，毛绒柔软。" }, r: 5, d: 16, v: true },
    ],
    goose: [
      { t: { en: "Silly goose vibes", zh: "呆萌大白鹅" }, a: "Tyler C.", c: { en: "This goose plush is hilarious and huggable in equal measure. It's become the mascot of our living room.", zh: "这只鹅毛绒又搞笑又好抱，已经成了我们客厅的吉祥物。" }, r: 4, d: 33, v: true },
    ],
    cat: [
      { t: { en: "Purrfect companion", zh: "猫咪完美伴侣" }, a: "Holly N.", c: { en: "As a cat lover, this plush captures that cozy feline energy perfectly. Soft, round, and soothing to hold.", zh: "作为猫奴，这款毛绒完美捕捉了猫咪那种慵懒舒适的气质，软软圆圆抱着很治愈。" }, r: 5, d: 21, v: true },
    ],
    frog: [
      { t: { en: "Ribbiting cuteness", zh: "蛙蛙可爱到犯规" }, a: "Dante P.", c: { en: "The wide eyes and round body make this frog plush impossibly cute. My whole family fights over it.", zh: "大眼睛圆滚滚的身体让这只青蛙毛绒可爱到不行，全家都在抢着抱。" }, r: 5, d: 19, v: true },
    ],
    crab: [
      { t: { en: "Crab-tivating plush", zh: "螃蟹毛绒超吸睛" }, a: "Iris V.", c: { en: "Who knew a crab could be this adorable? The little claws and smile are just too much.", zh: "谁能想到螃蟹也能这么萌？小钳子和微笑简直让人融化。" }, r: 4, d: 28, v: true },
    ],
    sheep: [
      { t: { en: "Fluffy cloud sheep", zh: "软绵绵小羊" }, a: "Ruby T.", c: { en: "This sheep is basically a cloud with legs. The curly fleece texture is so satisfying to pet.", zh: "这只小羊基本就是一朵长了腿的云，卷毛摸起来特别舒服。" }, r: 5, d: 36, v: true },
    ],
    game: [
      { t: { en: "Gamer's favorite plush", zh: "玩家最爱的毛绒" }, a: "Ethan R.", c: { en: "Recognized the character right away — the detail is surprisingly faithful to the game. A must for fans.", zh: "一眼就认出了游戏角色，还原度出乎意料地高，粉丝必入。" }, r: 5, d: 24, v: true },
    ],
  },
};

// ─── Gifts Pool ─────────────────────────────────────────────────
const giftsPool: CP = {
  g: [
    { t: { en: "Looks amazing on my desk", zh: "放桌上超好看" }, a: "Brian H.", c: { en: "This piece adds so much personality to my workspace. Every time I glance at it, it makes me smile.", zh: "这件摆件让我的桌面多了很多个性，每次瞥见都会忍不住微笑。" }, r: 5, d: 18, v: true },
    { t: { en: "Impressive gift", zh: "让人眼前一亮的礼物" }, a: "Diana K.", c: { en: "Gave this as a housewarming present and it was a huge hit. Everyone asked where I got it.", zh: "送作乔迁礼物超受欢迎，每个人都问我在哪里买的。" }, r: 5, d: 30, v: true },
    { t: { en: "Just the right size", zh: "大小刚好" }, a: "Kevin W.", c: { en: "Not too big, not too small — fits perfectly on a shelf without taking over. The proportions are spot-on.", zh: "不大不小刚刚好，放在书架上不会喧宾夺主，比例拿捏得很好。" }, r: 4, d: 25, v: false },
    { t: { en: "Solid build quality", zh: "做工扎实" }, a: "Angela M.", c: { en: "You can tell it's well-made the moment you pick it up. No rough edges, no cheap feel — just quality craftsmanship.", zh: "一上手就能感受到做工精良，没有毛边没有廉价感，就是好品质。" }, r: 5, d: 45, v: true },
    { t: { en: "Perfect accent piece", zh: "点睛之笔" }, a: "Natalie F.", c: { en: "It ties the whole room together. Such a small thing but it completely changes the vibe of the space.", zh: "它让整个房间变得完整，小小一件却完全改变了空间的氛围。" }, r: 5, d: 38, v: true },
  ],
  kw: {
    figurine: [
      { t: { en: "Detailed figurine", zh: "细节精美的摆件" }, a: "Laura S.", c: { en: "The level of detail on this figurine is remarkable for the price. Every feature is crisp and well-defined.", zh: "这个价位的摆件能有这种细节程度真了不起，每个特征都清晰精致。" }, r: 5, d: 20, v: true },
      { t: { en: "Collectible quality", zh: "收藏级品质" }, a: "Mark D.", c: { en: "As a figurine collector, I'm quite picky, but this one passes with flying colors. Paint job is clean and precise.", zh: "作为摆件收藏者我很挑剔，但这款完全达标，上色干净精准。" }, r: 4, d: 35, v: true },
    ],
    resin: [
      { t: { en: "Beautiful resin work", zh: "精美的树脂工艺" }, a: "Wendy L.", c: { en: "The resin casting is flawless — no bubbles, no seams. It has a satisfying weight and a smooth finish.", zh: "树脂浇铸完美无瑕，没有气泡没有接缝，手感扎实表面光滑。" }, r: 5, d: 22, v: true },
    ],
    astronaut: [
      { t: { en: "Space explorer vibes", zh: "太空探索者氛围" }, a: "Chase B.", c: { en: "This astronaut piece is so cool and quirky. It sparks conversation every time someone visits.", zh: "这个宇航员摆件又酷又有趣，每次有人来家里都会聊起来。" }, r: 5, d: 28, v: true },
    ],
    deer: [
      { t: { en: "Graceful deer piece", zh: "优雅的鹿摆件" }, a: "Hannah P.", c: { en: "The deer design is elegant and serene. It brings a touch of nature indoors in a sophisticated way.", zh: "鹿的设计优雅而宁静，以一种精致的方式把自然气息带进室内。" }, r: 5, d: 32, v: true },
    ],
    lion: [
      { t: { en: "Bold and powerful", zh: "威风凛凛" }, a: "Ryan T.", c: { en: "The lion dance figure is vibrant and full of energy. The colors pop and the expression is dynamic.", zh: "醒狮摆件色彩鲜明充满活力，颜色很跳，表情生动。" }, r: 5, d: 15, v: true },
    ],
    princess: [
      { t: { en: "Fairytale charm", zh: "童话般的魅力" }, a: "Sophia R.", c: { en: "My daughter adores this princess figure. The delicate details on the dress are lovely.", zh: "我女儿超级喜欢这个公主摆件，裙子上精致的细节很美。" }, r: 5, d: 18, v: true },
    ],
    zodiac: [
      { t: { en: "Zodiac done right", zh: "生肖摆件很到位" }, a: "Victor C.", c: { en: "The zodiac design is tasteful and traditional without being overly ornate. Perfect for New Year gifting.", zh: "生肖设计既传统又雅致，不会过于繁复，作为新年礼物很合适。" }, r: 4, d: 42, v: true },
    ],
    calendar: [
      { t: { en: "Functional and stylish", zh: "实用又好看" }, a: "Tracy N.", c: { en: "Love that I can use this every day and it still looks decorative. The date cards are easy to flip.", zh: "每天都能用而且依然好看，日期卡片翻起来很方便。" }, r: 4, d: 12, v: true },
    ],
    "night-light": [
      { t: { en: "Warm ambient glow", zh: "温暖的氛围光" }, a: "Megan J.", c: { en: "The night-light function is a lovely bonus — it casts a soft, warm glow that's perfect for the bedside.", zh: "小夜灯功能是个很棒的加分项，发出柔和暖光，放在床头刚刚好。" }, r: 5, d: 24, v: true },
    ],
    "jewelry-box": [
      { t: { en: "Charming jewelry storage", zh: "迷人的首饰收纳" }, a: "Alice W.", c: { en: "It's both a jewelry box and a decorative piece. The interior compartments are well-thought-out.", zh: "既是首饰盒又是装饰品，内部隔层设计得很合理。" }, r: 5, d: 36, v: true },
    ],
    "display-rack": [
      { t: { en: "Showcase your treasures", zh: "展示你的宝贝" }, a: "Phil M.", c: { en: "This display rack elevates whatever you put on it. Sturdy and elegant at the same time.", zh: "这个展示架让放在上面的东西都提升了档次，既结实又优雅。" }, r: 4, d: 40, v: true },
    ],
    sculpture: [
      { t: { en: "Artistic statement piece", zh: "艺术感十足的摆件" }, a: "Lena G.", c: { en: "This sculpture adds an artistic dimension to the room. The form is fluid and thought-provoking.", zh: "这件雕塑为房间增添了艺术感，造型流畅引人深思。" }, r: 5, d: 48, v: true },
    ],
    stress: [
      { t: { en: "Oddly satisfying to squeeze", zh: "捏起来莫名解压" }, a: "Jake F.", c: { en: "I keep this on my desk and squeeze it during long meetings. The texture is perfect for stress relief.", zh: "我放在办公桌上，长会的时候就捏一捏，手感特别解压。" }, r: 4, d: 10, v: true },
    ],
    glass: [
      { t: { en: "Delicate glass beauty", zh: "精致的玻璃之美" }, a: "Vivian H.", c: { en: "The glass catches light in the most beautiful way. It's fragile but that's part of its charm.", zh: "玻璃在光线下折射出最美的光影，虽然易碎但那正是它的魅力。" }, r: 5, d: 26, v: true },
    ],
    metal: [
      { t: { en: "Industrial-chic appeal", zh: "工业风质感" }, a: "Nathan A.", c: { en: "The metalwork has an industrial elegance to it. Sturdy, stylish, and adds character to any shelf.", zh: "金属工艺带有一种工业美感，结实、有型，让任何架子都多了几分个性。" }, r: 4, d: 34, v: true },
    ],
    wood: [
      { t: { en: "Warm wood tones", zh: "温暖木质调" }, a: "Rebecca D.", c: { en: "The wood grain is beautiful and the finish is smooth. Adds warmth and texture to the room instantly.", zh: "木纹很漂亮表面光滑，立刻为房间增添了温暖和质感。" }, r: 5, d: 30, v: true },
    ],
    lucky: [
      { t: { en: "Fortune smiles on this piece", zh: "招财纳福" }, a: "Wei Z.", c: { en: "The lucky god figurine is cheerful and well-crafted. A great addition to the entrance hall for good vibes.", zh: "财神摆件喜气洋洋做工精良，放在玄关增添好气场。" }, r: 5, d: 20, v: true },
    ],
  },
};

// ─── generateReviews ────────────────────────────────────────────
function generateReviews(productName: string, pool: CP): {
  reviewSummary: { rating: number; count: number };
  reviews: Array<{
    id: string;
    title: { en: string; zh: string };
    author: string;
    content: { en: string; zh: string };
    rating: number;
    date: string;
    verified: boolean;
  }>;
} {
  const keywords = matchKw(productName);
  const keywordReviews: RS[] = [];
  for (const kw of keywords) {
    const kwPool = pool.kw[kw];
    if (kwPool) keywordReviews.push(...kwPool);
  }
  const targetCount = 3 + Math.floor(Math.random() * 4); // 3-6 reviews
  const kwCount = Math.min(keywordReviews.length, 2 + Math.floor(Math.random() * 2)); // 2-3 from keywords
  const selected = [...pick(keywordReviews, kwCount), ...pick(pool.g, targetCount - kwCount)];
  const reviews = selected.map((s, i) => ({
    id: `review-${i + 1}`,
    title: s.t,
    author: s.a,
    content: s.c,
    rating: s.r,
    date: dateAgo(s.d + Math.floor(Math.random() * 5)),
    verified: s.v,
  }));
  const avgRating = reviews.length > 0 ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10 : 4.8;
  return { reviewSummary: { rating: avgRating, count: reviews.length + Math.floor(Math.random() * 30) + 10 }, reviews };
}

// ─── Main ───────────────────────────────────────────────────────
async function main() {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: { category: { select: { slug: true } } },
  });

  console.log(`Found ${products.length} published products`);

  let updated = 0;
  for (const product of products) {
    const catSlug = product.category.slug;
    const pool = catSlug === "jewelry" ? jewelryPool : catSlug === "plush" ? plushPool : giftsPool;
    const { reviewSummary, reviews } = generateReviews(product.nameEn, pool);

    const existing = (product.sourcePayload as Record<string, unknown>) ?? {};
    const newPayload = { ...existing, reviewSummary, reviews };

    await prisma.product.update({
      where: { id: product.id },
      data: { sourcePayload: newPayload },
    });
    updated++;
  }

  console.log(`Updated ${updated} products with reviews`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
