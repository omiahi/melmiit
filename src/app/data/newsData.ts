export interface Article {
  id: string;
  category: {
    en: string;
    mn: string;
  };
  categorySlug: string;
  title: {
    en: string;
    mn: string;
  };
  excerpt: {
    en: string;
    mn: string;
  };
  author: {
    en: string;
    mn: string;
  };
  time: string;
  imageUrl?: string;
  fullContent?: {
    en: string;
    mn: string;
  };
}

export const featuredArticle: Article = {
  id: '1',
  category: {
    en: 'Breaking News',
    mn: 'Яаралтай мэдээ'
  },
  categorySlug: 'world',
  title: {
    en: 'Global Climate Summit Reaches Historic Agreement on Carbon Emissions',
    mn: 'Дэлхийн уур амьсгалын дээд хэмжээний уулзалт нүүрстөрөгчийн ялгарлын түүхэн гэрээнд хүрлээ'
  },
  excerpt: {
    en: 'World leaders from over 150 nations have agreed to reduce carbon emissions by 50% by 2035, marking the most ambitious climate action plan to date.',
    mn: '150 гаруй улсын удирдагчид 2035 он гэхэд нүүрстөрөгчийн ялгарлыг 50%-иар бууруулахаар тохиролцсон нь өнөөг хүртэл хамгийн том уур амьсгалын арга хэмжээ юм.'
  },
  author: {
    en: 'Sarah Chen',
    mn: 'Сара Чэнь'
  },
  time: '2h ago',
  imageUrl: 'https://images.unsplash.com/photo-1627593561679-e03e500cf40a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudGFsJTIwY2xpbWF0ZSUyMGNoYW5nZXxlbnwxfHx8fDE3Njk3OTcxNjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  fullContent: {
    en: 'In a historic moment for global environmental policy, leaders from over 150 nations have signed the most ambitious climate agreement to date at the Global Climate Summit in Geneva. The landmark accord commits signatories to reducing carbon emissions by 50% by 2035, with an ultimate goal of achieving net-zero emissions by 2050.\n\nThe agreement, reached after two weeks of intensive negotiations, includes binding commitments for both developed and developing nations, with a tiered approach that accounts for different economic capacities. Developed nations will provide $500 billion in climate financing to support the transition in developing countries.\n\n"This is a watershed moment in human history," said Summit Chair Dr. Maria Rodriguez. "For the first time, we have unanimous agreement on the scale and urgency of action needed to address the climate crisis."\n\nThe accord includes provisions for renewable energy development, forest conservation, and the phase-out of fossil fuel subsidies by 2030. Independent climate scientists have praised the agreement as "finally matching the scale of the crisis we face."',
    mn: 'Женев хотод болсон Дэлхийн уур амьсгалын дээд хэмжээний уулзалтад 150 гаруй улсын удирдагчид хамгийн том уур амьсгалын гэрээнд гарын үсэг зурж, дэлхийн байгаль орчны бодлогын түүхэнд чухал үйл явдал болов. Энэхүү чухал гэрээгээр гарын үсэг зурагчид 2035 он гэхэд нүүрстөрөгчийн ялгарлыг 50 хувиар бууруулж, 2050 он гэхэд цэвэр тэг ялгарал хүрэхээр амласан.\n\nХоёр долоо хоног эрчимтэй хэлэлцээ хийсний эцэст хүрсэн энэхүү гэрээ нь хөгжингүй болон хөгжиж буй орнуудын аль алинд нь хүчин төгөлдөр амлалт агуулж, эдийн засгийн өөр өөр чадавхийг харгалзан шаталсан хандлагатай.\n\nХөгжингүй орнууд хөгжиж буй орнуудын шилжилтийг дэмжихийн тулд 500 тэрбум долларын уур амьсгалын санхүүжилт үзүүлнэ.\n\n"Энэ бол хүн төрөлхтний түүхэнд чухал мөч" гэж дээд хэмжээний уулзалтын дарга доктор Мариа Родригес хэллээ. "Анх удаа уур амьсгалын хямралыг шийдвэрлэхэд шаардлагатай арга хэмжээний цар хүрээ, яаралтай байдлын талаар санал нэгдлээ."'
  }
};

export const mainArticles: Article[] = [
  {
    id: '2',
    category: {
      en: 'Politics',
      mn: 'Улс төр'
    },
    categorySlug: 'politics',
    title: {
      en: 'European Union Proposes New Digital Privacy Regulations',
      mn: 'Европын холбоо дижитал нууцлалын шинэ зохицуулалтыг санал болгов'
    },
    excerpt: {
      en: 'The proposed framework aims to give citizens more control over their personal data and impose stricter penalties on companies that violate privacy standards.',
      mn: 'Санал болгож буй хүрээ нь иргэдэд өөрсдийн хувийн мэдээлэлд илүү хяналт тавих, нууцлалын стандартыг зөрчсөн компаниудад илүү хатуу шийтгэл оногдуулах зорилготой.'
    },
    author: {
      en: 'Marcus Weber',
      mn: 'Маркус Вебер'
    },
    time: '4h ago',
    imageUrl: 'https://images.unsplash.com/photo-1758138258458-64ee0fbdef4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnRlcm5hdGlvbmFsJTIwcG9saXRpY3MlMjBtZWV0aW5nfGVufDF8fHx8MTc2OTc5NzE2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    fullContent: {
      en: 'The European Union has unveiled comprehensive new regulations aimed at protecting digital privacy rights in an increasingly connected world. The proposed Digital Privacy Framework represents the most significant update to EU privacy law since the implementation of GDPR in 2018.\n\nUnder the new rules, tech companies operating in the EU will be required to provide users with clearer information about data collection and usage. Companies must obtain explicit consent before collecting any personal data, and users will have the right to access, modify, or delete their data at any time.\n\nThe regulations also introduce strict penalties for violations. Companies found to be in breach could face fines of up to 6% of their global annual revenue, a significant increase from current GDPR penalties. The framework includes special protections for minors and vulnerable populations.\n\n"Digital privacy is a fundamental right," said EU Commissioner for Digital Affairs Dr. Helena Schmidt. "These new regulations ensure that citizens maintain control over their personal information in the digital age."',
      mn: 'Европын холбоо улам бүр холбогдсон ертөнцөд дижитал нууцлалын эрхийг хамгаалах зорилготой иж бүрэн шинэ зохицуулалтыг танилцууллаа. Санал болгож буй дижитал нууцлалын хүрээ нь 2018 онд GDPR-ийг хэрэгжүүлснээс хойш ЕХ-ны нууцлалын хуульд хийсэн хамгийн чухал шинэчлэл юм.\n\nШинэ дүрмийн дагуу ЕХ-нд үйл ажиллагаа явуулж буй технологийн компаниуд хэрэглэгчдэд мэдээлэл цуглуулах, ашиглах талаар илүү тодорхой мэдээлэл өгөх шаардлагатай болно. Компаниуд аливаа хувийн мэдээлэл цуглуулахаасаа өмнө тодорхой зөвшөөрөл авах ёстой бөгөөд хэрэглэгчид өөрсдийн мэдээллийг хүссэн үедээ нэвтрэх, засах эсвэл устгах эрхтэй.\n\nЗохицуулалтад зөрчлийн хатуу шийтгэлийг нэвтрүүлж байна. Зөрчил гаргасан компаниуд дэлхийн жилийн орлогынхоо 6 хүртэлх хувийн торгууль ногдуулж болно.'
    }
  },
  {
    id: '3',
    category: {
      en: 'Technology',
      mn: 'Технологи'
    },
    categorySlug: 'technology',
    title: {
      en: 'AI Breakthrough: New Model Achieves Human-Level Reasoning',
      mn: 'Хиймэл оюун ухааны нээлт: Шинэ загвар хүний түвшний сэтгэлгээнд хүрлээ'
    },
    excerpt: {
      en: 'Researchers at leading tech institutes have developed an AI system capable of complex reasoning and problem-solving at unprecedented levels.',
      mn: 'Тэргүүлэх технологийн хүрээлэнгүүдийн судлаачид урьд өмнө байгаагүй түвшинд нарийн төвөгтэй сэтгэлгээ, асуудал шийдвэрлэх чадвартай хиймэл оюун ухааны системийг бүтээжээ.'
    },
    author: {
      en: 'Dr. Emily Zhang',
      mn: 'Доктор Эмили Жан'
    },
    time: '6h ago',
    imageUrl: 'https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwYXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZXxlbnwxfHx8fDE3Njk3OTcxNjR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export const secondaryArticles: Article[] = [
  {
    id: '4',
    category: {
      en: 'Business',
      mn: 'Бизнес'
    },
    categorySlug: 'business',
    title: {
      en: 'Major Tech Companies Announce Joint Investment in Green Energy',
      mn: 'Томоохон технологийн компаниуд ногоон эрчим хүчинд хамтарсан хөрөнгө оруулалт зарлалаа'
    },
    excerpt: {
      en: 'A consortium of technology giants commits $100 billion to renewable energy infrastructure over the next decade.',
      mn: 'Технологийн аварга компаниудын консорциум дараагийн 10 жилд сэргээгдэх эрчим хүчний дэд бүтэцэд 100 тэрбум доллар зарцуулахаар амлалаа.'
    },
    author: {
      en: 'James Morrison',
      mn: 'Жэймс Моррисон'
    },
    time: '8h ago',
    imageUrl: 'https://images.unsplash.com/photo-1762166463122-0274060863f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNpdHlzY2FwZSUyMG1vZGVybnxlbnwxfHx8fDE3Njk3OTcxNjN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '5',
    category: {
      en: 'Culture',
      mn: 'Соёл'
    },
    categorySlug: 'culture',
    title: {
      en: 'Venice Biennale Opens with Record International Participation',
      mn: 'Венецийн биеннале олон улсын оролцоотой дээд амжилттай нээлтээ хийлээ'
    },
    excerpt: {
      en: 'The prestigious art festival welcomes artists from 90 countries, showcasing diverse perspectives on contemporary global issues.',
      mn: 'Нэр хүндтэй урлагийн наадам 90 орны уран бүтээлчдийг хүлээн авч, орчин үеийн дэлхийн асуудлуудын талаар олон янзын үзэл бодлыг харуулж байна.'
    },
    author: {
      en: 'Isabella Rossi',
      mn: 'Изабелла Росси'
    },
    time: '10h ago',
    imageUrl: 'https://images.unsplash.com/photo-1761124739933-009df5603fbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGZlc3RpdmFsJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzY5NzczNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export const sidebarArticles: Article[] = [
  {
    id: '6',
    category: {
      en: 'Opinion',
      mn: 'Санал'
    },
    categorySlug: 'opinion',
    title: {
      en: 'The Future of Democracy in the Digital Age',
      mn: 'Дижитал эринд ардчиллын ирээдүй'
    },
    excerpt: {
      en: '',
      mn: ''
    },
    author: {
      en: 'Prof. Michael Lee',
      mn: 'Профессор Майкл Ли'
    },
    time: '12h ago'
  },
  {
    id: '7',
    category: {
      en: 'World',
      mn: 'Дэлхий'
    },
    categorySlug: 'world',
    title: {
      en: 'Asia-Pacific Nations Strengthen Trade Agreements',
      mn: 'Ази Номхон далайн орнууд худалдааны гэрээгээ бэхжүүллээ'
    },
    excerpt: {
      en: '',
      mn: ''
    },
    author: {
      en: 'Yuki Tanaka',
      mn: 'Юки Танака'
    },
    time: '14h ago'
  },
  {
    id: '8',
    category: {
      en: 'Science',
      mn: 'Шинжлэх ухаан'
    },
    categorySlug: 'science',
    title: {
      en: 'Quantum Computing Reaches New Milestone',
      mn: 'Квант тооцоолол шинэ түвшинд хүрлээ'
    },
    excerpt: {
      en: '',
      mn: ''
    },
    author: {
      en: 'Dr. Anita Patel',
      mn: 'Доктор Анита Пател'
    },
    time: '16h ago'
  },
  {
    id: '9',
    category: {
      en: 'Sports',
      mn: 'Спорт'
    },
    categorySlug: 'sports',
    title: {
      en: 'Olympic Committee Announces New Sustainability Initiatives',
      mn: 'Олимпын хороо тогтвортой байдлын шинэ санаачлагуудыг зарлалаа'
    },
    excerpt: {
      en: '',
      mn: ''
    },
    author: {
      en: 'Carlos Martinez',
      mn: 'Карлос Мартинез'
    },
    time: '18h ago'
  },
  {
    id: '10',
    category: {
      en: 'Health',
      mn: 'Эрүүл мэнд'
    },
    categorySlug: 'health',
    title: {
      en: 'New Study Reveals Benefits of Mediterranean Diet',
      mn: 'Шинэ судалгаа Газар дундын тэнгисийн хоолны дэглэмийн ашиг тусыг илрүүллээ'
    },
    excerpt: {
      en: '',
      mn: ''
    },
    author: {
      en: 'Dr. Sofia Kowalski',
      mn: 'Доктор София Ковальски'
    },
    time: '20h ago'
  }
];