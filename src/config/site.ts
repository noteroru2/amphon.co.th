export const site = {
  name: 'อำพล เทรดดิ้ง',
  alternateName: ['Amphon.co.th', 'AMPHON TRADING', 'อำพล เทรดดิ้ง', 'ร้านอำพล เทรดดิ้ง'],
  title: 'Amphon.co.th',
  description:
    'อำพล เทรดดิ้ง รับซื้อสินค้าไอทีมือสองทั่วภาคอีสาน โน๊ตบุ๊ค iPhone iPad MacBook คอมพิวเตอร์ กล้อง ประเมินราคาฟรี นัดรับถึงที่ จ่ายเงินทันที',
  url: 'https://amphon.co.th',
  locale: 'th_TH',
  language: 'th-TH',
  phone: '064-257-9353',
  phoneTel: '+66642579353',
  line: 'https://line.me/ti/p/~@webuy',
  lineId: '@webuy',
  facebook: 'https://www.facebook.com/Amphontrading',
  email: 'amphontrading@gmail.com',
  image: '/images/og/og-home.webp',
  defaultOgImage: '/images/og/og-home.webp',
  logo: '/images/brand/amphon-trading-logo.webp',
  hasMap: 'https://maps.app.goo.gl/krv97o14jPTRrnpW8',
  address: {
    street: '740/8 ถนนชยางกูร',
    locality: 'ตำบลในเมือง อำเภอเมืองอุบลราชธานี',
    region: 'อุบลราชธานี',
    postalCode: '34000',
    country: 'TH',
  },
  geo: {
    latitude: 15.2386,
    longitude: 104.8477,
    region: 'TH-34',
  },
  openingHours: ['Mo-Su 09:00-21:00'],
  priceRange: '฿฿',
  currenciesAccepted: 'THB',
  paymentAccepted: ['Cash', 'Bank Transfer', 'PromptPay'],
  foundingDate: '2020',
  knowsAbout: [
    'รับซื้อโน๊ตบุ๊ค',
    'รับซื้อ iPhone',
    'รับซื้อ iPad',
    'รับซื้อ MacBook',
    'รับซื้อคอมพิวเตอร์',
    'รับซื้อคอมบริษัท',
    'รับซื้อกล้อง',
    'รับซื้อสินค้ามือสอง',
    'รับซื้ออุปกรณ์ไอที',
    'รับซื้อสินค้าไอทีภาคอีสาน',
  ],
  isanProvinces: [
    'อุบลราชธานี',
    'ขอนแก่น',
    'นครราชสีมา',
    'อุดรธานี',
    'บุรีรัมย์',
    'สุรินทร์',
    'ศรีสะเกษ',
    'ยโสธร',
    'อำนาจเจริญ',
    'มหาสารคาม',
    'ร้อยเอ็ด',
    'กาฬสินธุ์',
    'สกลนคร',
    'นครพนม',
    'มุกดาหาร',
    'ชัยภูมิ',
    'เลย',
    'หนองบัวลำภู',
    'หนองคาย',
    'บึงกาฬ',
  ],
  provinceGeo: {
    อุบลราชธานี: { latitude: 15.2287, longitude: 104.8564 },
    ขอนแก่น: { latitude: 16.4322, longitude: 102.8236 },
    นครราชสีมา: { latitude: 14.9799, longitude: 102.0978 },
    อุดรธานี: { latitude: 17.4138, longitude: 102.7872 },
    ศรีสะเกษ: { latitude: 15.1186, longitude: 104.3220 },
    ยโสธร: { latitude: 15.7940, longitude: 104.1452 },
    ร้อยเอ็ด: { latitude: 16.0538, longitude: 103.6520 },
    บุรีรัมย์: { latitude: 14.9930, longitude: 103.1029 },
    สุรินทร์: { latitude: 14.8820, longitude: 103.4936 },
    อำนาจเจริญ: { latitude: 15.8656, longitude: 104.6258 },
    มหาสารคาม: { latitude: 16.1851, longitude: 103.3009 },
    กาฬสินธุ์: { latitude: 16.4314, longitude: 103.5058 },
    สกลนคร: { latitude: 17.1554, longitude: 104.1348 },
    นครพนม: { latitude: 17.3920, longitude: 104.7731 },
    มุกดาหาร: { latitude: 16.5429, longitude: 104.7231 },
    ชัยภูมิ: { latitude: 15.8068, longitude: 102.0318 },
    เลย: { latitude: 17.4860, longitude: 101.7224 },
    หนองบัวลำภู: { latitude: 17.2218, longitude: 102.4260 },
    หนองคาย: { latitude: 17.8782, longitude: 102.7420 },
    บึงกาฬ: { latitude: 18.3609, longitude: 103.6522 },
  },
  contactPoint: [
    {
      contactType: 'customer service',
      telephone: '+66642579353',
      areaServed: 'TH',
      availableLanguage: ['th', 'Thai'],
    },
    {
      contactType: 'sales',
      url: 'https://line.me/ti/p/~@webuy',
      areaServed: 'TH',
      availableLanguage: ['th', 'Thai'],
    },
  ],
  sameAs: [
    'https://www.facebook.com/Amphontrading',
    'https://line.me/ti/p/~@webuy',
    'https://amphontd.com',
  ],
} as const;

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type ProvinceName = keyof typeof site.provinceGeo;
