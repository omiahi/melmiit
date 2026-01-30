export interface Comment {
  id: string;
  author: {
    en: string;
    mn: string;
  };
  time: string;
  content: {
    en: string;
    mn: string;
  };
  likes: number;
  replies: number;
}

// Comments organized by article ID
export const articleComments: Record<string, Comment[]> = {
  '1': [
    {
      id: '1-1',
      author: {
        en: 'David Thompson',
        mn: 'Дэвид Томпсон'
      },
      time: '2h ago',
      content: {
        en: 'This is a significant step forward for international cooperation on climate issues. The binding commitments and financial support for developing nations show real progress beyond previous agreements.',
        mn: 'Энэ нь уур амьсгалын асуудлаар олон улсын хамтын ажиллагааны хувьд томоохон алхам юм. Хөгжиж буй орнуудын хувьд санхүүгийн дэмжлэг болон хүчин төгөлдөр амлалт өмнөх гэрээнүүдээс илүү ахиц дэвшил гаргасныг харуулж байна.'
      },
      likes: 234,
      replies: 12
    },
    {
      id: '1-2',
      author: {
        en: 'Maria Santos',
        mn: 'Мариа Сантос'
      },
      time: '4h ago',
      content: {
        en: 'While this agreement is encouraging, I hope we see concrete action rather than just promises. The timeline for 2035 is ambitious, but accountability measures will be crucial for success.',
        mn: 'Энэхүү гэрээ урам зориг өгч байгаа ч зөвхөн амлалт биш бодит үйл ажиллагааг харахыг найдаж байна. 2035 оны хугацаа нь том зорилт боловч амжилтад хүрэхийн тулд хариуцлагын арга хэмжээ чухал байх болно.'
      },
      likes: 189,
      replies: 8
    },
    {
      id: '1-3',
      author: {
        en: 'Raj Kumar',
        mn: 'Раж Кумар'
      },
      time: '6h ago',
      content: {
        en: 'As someone from a developing nation, I\'m pleased to see the financial support included in this agreement. Climate change affects us disproportionately, and this assistance will be vital for our transition to renewable energy.',
        mn: 'Хөгжиж буй орны хүний хувьд энэ гэрээнд санхүүгийн дэмжлэг багтсанд сэтгэл хангалуун байна. Уур амьсгалын өөрчлөлт бидэнд илүү их нөлөөлж байгаа тул энэхүү тусламж нь сэргээгдэх эрчим хүч рүү шилжих хувьд маш чухал байх болно.'
      },
      likes: 156,
      replies: 15
    },
    {
      id: '1-4',
      author: {
        en: 'Emma Wilson',
        mn: 'Эмма Вилсон'
      },
      time: '8h ago',
      content: {
        en: 'The phase-out of fossil fuel subsidies by 2030 is particularly important. These subsidies have long been a barrier to clean energy adoption. Looking forward to seeing how countries implement this.',
        mn: '2030 он гэхэд шатахуун түлшний татаасыг зогсоох нь онцгой чухал. Эдгээр татаас нь цэвэр эрчим хүчийг нэвтрүүлэхэд саад болж ирсэн. Улс орнууд үүнийг хэрхэн хэрэгжүүлэхийг харахыг тэсэн ядан хүлээж байна.'
      },
      likes: 98,
      replies: 5
    }
  ],
  '2': [
    {
      id: '2-1',
      author: {
        en: 'Sophie Anderson',
        mn: 'Софи Андерсон'
      },
      time: '3h ago',
      content: {
        en: 'Finally, the EU is taking digital privacy seriously. The 6% penalty is significant enough to make tech giants think twice before violating user rights.',
        mn: 'Эцэст нь ЕХ дижитал нууцлалыг нухацтай авч үзэж байна. 6%-ийн торгууль нь технологийн аварга компаниудыг хэрэглэгчийн эрхийг зөрчихөөс өмнө дахин бодоход хангалттай.'
      },
      likes: 167,
      replies: 9
    },
    {
      id: '2-2',
      author: {
        en: 'Hans Mueller',
        mn: 'Ханс Мюллер'
      },
      time: '5h ago',
      content: {
        en: 'This is a good start, but implementation will be key. We need strong enforcement mechanisms to ensure companies actually comply with these regulations.',
        mn: 'Энэ бол сайн эхлэл боловч хэрэгжилт нь гол зүйл байх болно. Компаниуд эдгээр журмыг бодитоор дагаж мөрдөхийн тулд хүчтэй хэрэгжүүлэх механизм хэрэгтэй.'
      },
      likes: 143,
      replies: 6
    },
    {
      id: '2-3',
      author: {
        en: 'Nina Patel',
        mn: 'Нина Пател'
      },
      time: '7h ago',
      content: {
        en: 'The special protections for minors are particularly welcome. Children need extra safeguards in the digital world.',
        mn: 'Малчдад зориулсан тусгай хамгаалалт онцгой сайхан юм. Хүүхдүүд дижитал ертөнцөд нэмэлт хамгаалалт хэрэгтэй.'
      },
      likes: 201,
      replies: 11
    }
  ],
  '3': [
    {
      id: '3-1',
      author: {
        en: 'Alex Chen',
        mn: 'Алекс Чэнь'
      },
      time: '1h ago',
      content: {
        en: 'This AI breakthrough is remarkable, but we need to have serious discussions about ethical implications and safety measures before widespread deployment.',
        mn: 'Энэхүү хиймэл оюун ухааны нээлт гайхалтай боловч өргөн хүрээнд нэвтрүүлэхээс өмнө ёс зүйн үр дагавар болон аюулгүй байдлын талаар ноцтой ярилцах хэрэгтэй.'
      },
      likes: 312,
      replies: 24
    },
    {
      id: '3-2',
      author: {
        en: 'Lisa Roberts',
        mn: 'Лиза Робертс'
      },
      time: '3h ago',
      content: {
        en: 'Human-level reasoning in AI is exciting but also concerning. We must ensure proper safeguards are in place.',
        mn: 'Хиймэл оюун ухаанд хүний түвшний сэтгэлгээ сонирхолтой боловч санаа зовоож байна. Зохих хамгаалалтыг бүрдүүлэх ёстой.'
      },
      likes: 245,
      replies: 18
    }
  ],
  '4': [
    {
      id: '4-1',
      author: {
        en: 'Michael Green',
        mn: 'Майкл Грин'
      },
      time: '2h ago',
      content: {
        en: '$100 billion is a massive investment. It\'s encouraging to see tech companies taking responsibility for environmental impact.',
        mn: '100 тэрбум доллар бол асар их хөрөнгө оруулалт юм. Технологийн компаниуд байгаль орчинд үзүүлэх нөлөөллийн хариуцлагыг хүлээж байгаа нь урам зориг өгч байна.'
      },
      likes: 178,
      replies: 7
    },
    {
      id: '4-2',
      author: {
        en: 'Sarah Lee',
        mn: 'Сара Ли'
      },
      time: '4h ago',
      content: {
        en: 'Actions speak louder than words. Let\'s see if they follow through on these commitments over the next decade.',
        mn: 'Үйлдэл үгнээс чанга. Ирэх 10 жилд эдгээр амлалтаа биелүүлэх эсэхийг харцгаая.'
      },
      likes: 156,
      replies: 10
    }
  ],
  '5': [
    {
      id: '5-1',
      author: {
        en: 'Antonio Rossi',
        mn: 'Антонио Росси'
      },
      time: '1h ago',
      content: {
        en: 'The Venice Biennale never disappoints. The diversity of perspectives this year is truly remarkable.',
        mn: 'Венецийн биеннале хэзээ ч урам хугалдаггүй. Энэ жилийн олон талт үзэл бодол үнэхээр гайхалтай.'
      },
      likes: 89,
      replies: 4
    },
    {
      id: '5-2',
      author: {
        en: 'Yuki Tanaka',
        mn: 'Юки Танака'
      },
      time: '5h ago',
      content: {
        en: 'Art has the power to unite people across cultures. Events like this are more important than ever.',
        mn: 'Урлаг нь соёл иргэншлийг дамнасан хүмүүсийг нэгтгэх хүчтэй. Ийм арга хемжээ урьд өмнө байгаагүй чухал болж байна.'
      },
      likes: 134,
      replies: 8
    }
  ]
};
