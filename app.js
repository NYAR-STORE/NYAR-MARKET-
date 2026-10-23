'use strict';
/* ============================================================
   NYAR MARKET v3.0 — Global B2B2C Platform
   app.js — المحرك الكامل
   الأقسام:
   01. الثوابت والإعدادات (أسواق، عملات، شحن، محافظ، محافظات)
   02. قاموس الترجمة AR/EN
   03. إدارة الحالة والتخزين
   04. محرك اللغة والاتجاه
   05. محرك العملات والأسعار
   06. أدوات عامة (توست، نوافذ)
   07. المصادقة والحسابات
   08. عرض المنتجات والفلاتر وعروض الفلاش
   09. تفاصيل المنتج والمفضلة
   10. السلة
   11. إتمام الطلب (الدفع الهجين + الشحن المزدوج)
   12. طلبات المشتري
   13. دليل المتاجر وصفحة التاجر
   14. لوحة تحكم البائع
   15. لوحة مدير المنصة
   16. المساعد الصوتي n8n (بدون تعارض Shadow DOM)
   17. وضع ذوي الهمم (نطق + تباين + تكبير)
   18. التهيئة
   ============================================================ */

/* ============================================================
   01. الثوابت والإعدادات
   ============================================================ */

// العملات: السعر الأساسي المخزن بالدولار الأمريكي (USD)
const CURRENCIES = {
    YER: { rate: 530,  symbolAr: 'ر.ي',  symbolEn: 'YER', decimals: 0 },
    USD: { rate: 1,    symbolAr: '$',    symbolEn: '$',   decimals: 2 },
    SAR: { rate: 3.75, symbolAr: 'ر.س',  symbolEn: 'SAR', decimals: 2 },
    AED: { rate: 3.67, symbolAr: 'د.إ',  symbolEn: 'AED', decimals: 2 }
};

// الأسواق (الدول)
const MARKETS = {
    YE:   { flag: '🇾🇪', currency: 'YER' },
    SA:   { flag: '🇸🇦', currency: 'SAR' },
    AE:   { flag: '🇦🇪', currency: 'AED' },
    INTL: { flag: '🌍', currency: 'USD' }
};

// خيارات الشحن لكل سوق (التكلفة بالدولار)
const SHIPPING_OPTIONS = {
    YE: [
        { id: 'ye_local',    costUSD: 4,  daysKey: 'ship12' },
        { id: 'ye_national', costUSD: 9,  daysKey: 'ship25' }
    ],
    SA: [
        { id: 'sa_std', costUSD: 12, daysKey: 'ship58' },
        { id: 'sa_exp', costUSD: 25, daysKey: 'ship35' }
    ],
    AE: [
        { id: 'ae_std', costUSD: 10, daysKey: 'ship47' },
        { id: 'ae_exp', costUSD: 22, daysKey: 'ship24' }
    ],
    INTL: [
        { id: 'intl_std', costUSD: 20, daysKey: 'ship715' },
        { id: 'intl_exp', costUSD: 40, daysKey: 'ship48' }
    ]
};

// محافظ اليمن الإلكترونية + الدفع عند الاستلام
const YE_PAYMENTS = [
    { id: 'jib',      nameAr: 'جيب',     nameEn: 'Jib Wallet',   img: 'https://i.postimg.cc/6QLk53zy/f9ba7cf1-950f-499b-a4ea-3a1f604ec2a9.jpg', number: '777000001' },
    { id: 'krimi',    nameAr: 'كريمي',    nameEn: 'Al-Kuraimi',   img: 'https://i.postimg.cc/Hx0XNGp6/5f0c2d23-13d0-46d2-aef4-6d6aedfe5f1f.png', number: '777000002' },
    { id: 'onecash',  nameAr: 'ون كاش',   nameEn: 'One Cash',     img: 'https://i.postimg.cc/7ZgH0qXX/224c2578-ad80-4e8c-bf28-83d9e1f4f6fa.jpg', number: '777000003' },
    { id: 'floosak',  nameAr: 'فلوسك',    nameEn: 'Floosak',      img: 'https://i.postimg.cc/QxcCkgdT/d4de8d61-dab3-4546-b7dd-7d16e6cc2499.jpg', number: '777000004' },
    { id: 'mahfadti', nameAr: 'محفظتي',   nameEn: 'Mahfadti',     img: 'https://i.postimg.cc/m2W2Dcyk/2b2b38d2-582b-4f09-b8e8-dbba02fd0ca0.jpg', number: '777000005' },
    { id: 'cod',      nameAr: 'عند الاستلام', nameEn: 'Cash on Delivery', icon: '💵', number: null }
];

// طرق الدفع العالمية (واجهات)
const INTL_PAYMENTS = [
    { id: 'visa',       nameAr: 'فيزا',        nameEn: 'Visa',        icon: '💳' },
    { id: 'mastercard', nameAr: 'ماستركارد',   nameEn: 'MasterCard',  icon: '💳' },
    { id: 'paypal',     nameAr: 'باي بال',     nameEn: 'PayPal',      icon: '🅿️' },
    { id: 'applepay',   nameAr: 'آبل باي',     nameEn: 'Apple Pay',   icon: '' }
];

// محافظات اليمن ومديرياتها الرئيسية
const YEMEN_GOVS = [
    { ar: 'أمانة العاصمة صنعاء', en: "Sana'a City", districts: ['الصافية','السبعين','التحرير','شعوب','بني الحارث','الوحدة','آزال','معين','الثورة','الأصبحي'] },
    { ar: 'عدن', en: 'Aden', districts: ['كريتر','المعلا','التواهي','خور مكسر','الشيخ عثمان','دار سعد','المنصورة','البريقة'] },
    { ar: 'تعز', en: 'Taiz', districts: ['القاهرة','المظفر','صالة','الشاماتين','التعزية','جبل حبشي','المخا'] },
    { ar: 'الحديدة', en: 'Hodeidah', districts: ['الحالي','الحوك','الميناء','باجل','الزيدية','بيت الفقيه'] },
    { ar: 'إب', en: 'Ibb', districts: ['الظهار','المشنة','الرياشية','جبلة','يريم','السدة','النادرة'] },
    { ar: 'ذمار', en: 'Dhamar', districts: ['ذمار المدينة','ميفعة عنس','جهران','عتمة','الحداء'] },
    { ar: 'حضرموت', en: 'Hadramout', districts: ['المكلا','سيئون','تريم','شبام','الشحر','غيل باوزير'] },
    { ar: 'لحج', en: 'Lahij', districts: ['الحوطة','تبن','يافع','طور الباحة','المسيمير'] },
    { ar: 'أبين', en: 'Abyan', districts: ['زنجبار','جعار','لودر','مودية'] },
    { ar: 'الضالع', en: "Dhale'a", districts: ['الضالع المدينة','قاع طبقة','دمت','جبن','الحشا'] },
    { ar: 'شبوة', en: 'Shabwah', districts: ['عتق','حبان','بيحان','الروضة','ميفعة'] },
    { ar: 'مأرب', en: 'Marib', districts: ['مدينة مأرب','صرواح','الوادي','مدغل','رغوان'] },
    { ar: 'الجوف', en: 'Al-Jawf', districts: ['الحزم','المطمة','خب والشعف','الغيل'] },
    { ar: 'عمران', en: 'Amran', districts: ['عمران المدينة','حرف سفيان','خارف','ريدة','ذيبين'] },
    { ar: 'صعدة', en: "Sa'dah", districts: ['صعدة المدينة','سحار','مجز','كتاف','رازح'] },
    { ar: 'حجة', en: 'Hajjah', districts: ['حجة المدينة','عبس','حرض','ميدي','مستبأ'] },
    { ar: 'المحويت', en: 'Al-Mahwit', districts: ['المحويت المدينة','شبام كوكبان','الطويلة','حفاش'] },
    { ar: 'البيضاء', en: 'Al-Bayda', districts: ['البيضاء المدينة','رداع','مكيراس','السوادية'] },
    { ar: 'المهرة', en: 'Al-Mahrah', districts: ['الغيضة','سيحوت','قشن','حوف'] },
    { ar: 'سقطرى', en: 'Socotra', districts: ['حديبو','قلنسية'] },
    { ar: 'ريمة', en: 'Raymah', districts: ['الجبين','مزهر','كسمة','بلاد الطعام'] }
];

const CATEGORIES = [
    { value: 'electronics', ar: 'إلكترونيات', en: 'Electronics', icon: '📱' },
    { value: 'fashion',     ar: 'أزياء',      en: 'Fashion',     icon: '👗' },
    { value: 'home',        ar: 'المنزل',     en: 'Home',        icon: '🏠' },
    { value: 'sports',      ar: 'رياضة',      en: 'Sports',      icon: '⚽' },
    { value: 'perfumes',    ar: 'عطور وبخور', en: 'Perfumes',    icon: '🌸' },
    { value: 'honey',       ar: 'عسل يمني',   en: 'Yemeni Honey', icon: '🍯' }
];

const COUPONS = { 'NYAR10': 10, 'NYAR20': 20, 'NYAR50': 50, 'WELCOME': 15 };

const ADMIN_CREDENTIALS = { email: 'admin@nyarmarket.com', password: 'abdu2018aaNYAR' };

/* ============================================================
   02. قاموس الترجمة AR / EN
   ============================================================ */
const I18N = {
    tagline:        { ar: 'GLOBAL B2B2C MARKETPLACE', en: 'GLOBAL B2B2C MARKETPLACE' },
    marketYE:       { ar: '🇾🇪 اليمن', en: '🇾🇪 Yemen' },
    marketSA:       { ar: '🇸🇦 السعودية', en: '🇸🇦 Saudi Arabia' },
    marketAE:       { ar: '🇦🇪 الإمارات', en: '🇦🇪 UAE' },
    marketINTL:     { ar: '🌍 دول العالم', en: '🌍 Worldwide' },
    login:          { ar: 'تسجيل', en: 'Sign in' },
    logout:         { ar: 'خروج', en: 'Sign out' },
    sell:           { ar: 'بيع معنا', en: 'Sell' },
    tabHome:        { ar: 'الرئيسية', en: 'Home' },
    tabStore:       { ar: 'المتجر', en: 'Shop' },
    tabStores:      { ar: 'المتاجر', en: 'Stores' },
    tabCart:        { ar: 'السلة', en: 'Cart' },
    tabOrders:      { ar: 'طلباتي', en: 'My Orders' },
    tabVendor:      { ar: 'لوحة البائع', en: 'Vendor Panel' },
    tabAdmin:       { ar: 'المدير', en: 'Admin' },
    shopNow:        { ar: 'تسوق الآن', en: 'Shop Now' },
    categories:     { ar: 'الأقسام الرئيسية', en: 'Main Categories' },
    flashDeals:     { ar: 'عروض الفلاش', en: 'Flash Deals' },
    featured:       { ar: 'منتجات مميزة', en: 'Featured Products' },
    bestSellers:    { ar: 'الأكثر مبيعاً', en: 'Best Sellers' },
    onSale:         { ar: 'عروض خاصة', en: 'Special Offers' },
    storesDirectory:{ ar: 'دليل المتاجر والتجار', en: 'Stores Directory' },
    storeProducts:  { ar: 'منتجات المتجر', en: 'Store Products' },
    cartTitle:      { ar: 'حقيبة المشتريات', en: 'Shopping Bag' },
    myOrders:       { ar: 'طلباتي', en: 'My Orders' },
    searchPh:       { ar: '🔍 بحث عن منتج أو تاجر...', en: '🔍 Search products or vendors...' },
    allPrices:      { ar: 'كل الأسعار', en: 'All Prices' },
    allRatings:     { ar: 'كل التقييمات', en: 'All Ratings' },
    fourPlus:       { ar: '4 نجوم فأكثر', en: '4 stars & up' },
    threePlus:      { ar: '3 نجوم فأكثر', en: '3 stars & up' },
    allCategories:  { ar: 'كل الفئات', en: 'All Categories' },
    addToCart:      { ar: '🛒 أضف للسلة', en: '🛒 Add to Cart' },
    outOfStock:     { ar: '🚫 نفذ المخزون', en: '🚫 Out of Stock' },
    badgeSale:      { ar: 'تخفيض', en: 'SALE' },
    badgeNew:       { ar: 'جديد', en: 'NEW' },
    badgeBest:      { ar: 'الأفضل', en: 'BEST' },
    badgeFlash:     { ar: 'فلاش', en: 'FLASH' },
    reviews:        { ar: 'تقييم', en: 'reviews' },
    verifiedSeller: { ar: 'بائع موثق', en: 'Verified Seller' },
    visitStore:     { ar: 'زيارة المتجر ←', en: 'Visit Store →' },
    deliveryFromVendor: { ar: '🚀 توصيل من التاجر مباشرة', en: '🚀 Direct delivery from vendor' },
    emptyCart:      { ar: 'السلة فارغة', en: 'Your cart is empty' },
    subtotal:       { ar: 'المجموع الفرعي', en: 'Subtotal' },
    discount:       { ar: 'الخصم', en: 'Discount' },
    shipping:       { ar: 'الشحن', en: 'Shipping' },
    total:          { ar: 'الإجمالي', en: 'Total' },
    proceedCheckout:{ ar: 'إتمام الطلب بأمان', en: 'Secure Checkout' },
    checkoutTitle:  { ar: 'إتمام الطلب', en: 'Checkout' },
    orderSummary:   { ar: '📦 ملخص الطلب', en: '📦 Order Summary' },
    fullName:       { ar: 'الاسم الكامل *', en: 'Full Name *' },
    fullNamePh:     { ar: 'أدخل اسمك الكامل', en: 'Enter your full name' },
    phone:          { ar: 'رقم الهاتف *', en: 'Phone Number *' },
    shippingCountry:{ ar: 'دولة الشحن *', en: 'Shipping Country *' },
    governorate:    { ar: 'المحافظة *', en: 'Governorate *' },
    selectGov:      { ar: 'اختر المحافظة', en: 'Select governorate' },
    district:       { ar: 'المديرية / الحي *', en: 'District *' },
    selectDistrict: { ar: 'اختر المديرية', en: 'Select district' },
    street:         { ar: 'الشارع / العنوان *', en: 'Street / Address *' },
    landmark:       { ar: 'أقرب معلم (اختياري)', en: 'Nearest landmark (optional)' },
    city:           { ar: 'المدينة *', en: 'City *' },
    intlAddress:    { ar: 'العنوان الدولي *', en: 'International Address *' },
    postalCode:     { ar: 'الرمز البريدي *', en: 'Postal Code *' },
    countryName:    { ar: 'اسم الدولة *', en: 'Country Name *' },
    shippingMethod: { ar: 'طريقة الشحن *', en: 'Shipping Method *' },
    paymentMethod:  { ar: 'طريقة الدفع *', en: 'Payment Method *' },
    couponPh:       { ar: 'كود خصم (مثال: NYAR10)', en: 'Coupon code (e.g. NYAR10)' },
    apply:          { ar: 'تطبيق', en: 'Apply' },
    confirmOrder:   { ar: '✅ تأكيد الطلب', en: '✅ Place Order' },
    checkoutLegalNote: { ar: 'بإتمامك الطلب فأنت توافق على', en: 'By placing your order you agree to the' },
    terms:          { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
    privacy:        { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    returnsPolicy:  { ar: 'سياسة الاسترجاع (48 ساعة)', en: 'Returns Policy (48h)' },
    // الشحن — المدد
    ship12:  { ar: 'خلال 1-2 أيام', en: '1-2 days' },
    ship25:  { ar: 'خلال 2-5 أيام', en: '2-5 days' },
    ship24:  { ar: 'خلال 2-4 أيام', en: '2-4 days' },
    ship35:  { ar: 'خلال 3-5 أيام', en: '3-5 days' },
    ship47:  { ar: 'خلال 4-7 أيام', en: '4-7 days' },
    ship48:  { ar: 'خلال 4-8 أيام', en: '4-8 days' },
    ship58:  { ar: 'خلال 5-8 أيام', en: '5-8 days' },
    ship715: { ar: 'خلال 7-15 يوم', en: '7-15 days' },
    shipLocal:    { ar: 'توصيل محلي داخل المحافظة', en: 'Local delivery (same governorate)' },
    shipNational: { ar: 'توصيل بين المحافظات', en: 'Inter-governorate delivery' },
    shipStdIntl:  { ar: 'شحن دولي قياسي', en: 'Standard International' },
    shipExpIntl:  { ar: 'شحن دولي سريع', en: 'Express International' },
    // الدفع
    payWalletNote: { ar: 'سيتم تحويل المبلغ إلى حساب المنصة، وبعد التأكيد تُحوّل أرباح التاجر تلقائياً.', en: 'Transfer to the platform wallet; vendor earnings are released after confirmation.' },
    payIntlNote:   { ar: 'دفع آمن ومشفر عبر بوابات الدفع العالمية.', en: 'Secure encrypted payment via global gateways.' },
    codNote:       { ar: 'ادفع نقداً عند استلام طلبك من مندوب التوصيل.', en: 'Pay in cash when your order is delivered.' },
    walletStep1: { ar: 'افتح تطبيق المحفظة', en: 'Open your wallet app' },
    walletStep2: { ar: 'حوّل المبلغ', en: 'Transfer the amount' },
    walletStep3: { ar: 'إلى الرقم', en: 'To the number' },
    walletStep4: { ar: 'اكتب في الملاحظات', en: 'Write in the notes' },
    // المصادقة
    loginTitle:    { ar: 'تسجيل الدخول', en: 'Sign In' },
    emailPh:       { ar: 'البريد الإلكتروني', en: 'Email address' },
    passwordPh:    { ar: 'كلمة المرور', en: 'Password' },
    loginBtn:      { ar: 'دخول', en: 'Sign In' },
    createAccount: { ar: 'إنشاء حساب جديد', en: 'Create new account' },
    registerTitle: { ar: 'إنشاء حساب', en: 'Create Account' },
    namePh:        { ar: 'الاسم الكامل', en: 'Full name' },
    roleBuyer:     { ar: 'مشتري', en: 'Buyer' },
    roleVendor:    { ar: 'تاجر / بائع', en: 'Vendor / Seller' },
    registerBtn:   { ar: 'إنشاء الحساب', en: 'Create Account' },
    // تسجيل التاجر
    vendorRegTitle: { ar: 'تسجيل تاجر جديد', en: 'New Vendor Registration' },
    businessInfo:   { ar: '📋 معلومات النشاط التجاري', en: '📋 Business Information' },
    ownerNamePh:    { ar: 'اسم مالك النشاط*', en: 'Owner name*' },
    storeNamePh:    { ar: 'اسم المتجر', en: 'Store name' },
    businessAddress:{ ar: '📍 عنوان النشاط', en: '📍 Business Address' },
    streetPh:       { ar: 'الشارع / الحي*', en: 'Street / District*' },
    vendorWallets:  { ar: '📱 المحافظ الإلكترونية (لاستلام الأرباح)', en: '📱 E-Wallets (to receive earnings)' },
    registerVendorBtn: { ar: 'تسجيل التاجر', en: 'Register Vendor' },
    // لوحة البائع
    vendorDashboard:   { ar: 'لوحة تحكم البائع', en: 'Vendor Dashboard' },
    completedOrders:   { ar: 'الطلبات المكتملة', en: 'Completed Orders' },
    netEarnings:       { ar: 'صافي الأرباح', en: 'Net Earnings' },
    platformCommission:{ ar: 'عمولة المنصة', en: 'Platform Commission' },
    myProducts:        { ar: 'منتجاتي', en: 'My Products' },
    addProduct:        { ar: 'إضافة منتج جديد', en: 'Add New Product' },
    prodNamePh:        { ar: 'اسم المنتج', en: 'Product name' },
    prodPricePh:       { ar: 'السعر (دولار $)', en: 'Price (USD $)' },
    prodIconPh:        { ar: 'أيقونة (إيموجي) مثال: 📱', en: 'Icon (emoji) e.g. 📱' },
    prodDescPh:        { ar: 'وصف المنتج', en: 'Product description' },
    publishProduct:    { ar: 'نشر المنتج في السوق', en: 'Publish to Market' },
    myProductsList:    { ar: '📋 منتجاتي', en: '📋 My Products' },
    myOrdersList:      { ar: '📊 طلبات متجري', en: '📊 My Store Orders' },
    storeSettings:     { ar: '⚙️ إعدادات المتجر', en: '⚙️ Store Settings' },
    storeLogoPh:       { ar: 'شعار المتجر (إيموجي) 🏪', en: 'Store logo (emoji) 🏪' },
    saveSettings:      { ar: 'حفظ الإعدادات', en: 'Save Settings' },
    markShipped:       { ar: '🚚 تم الشحن', en: '🚚 Mark Shipped' },
    markDelivered:     { ar: '✅ تم التسليم', en: '✅ Mark Delivered' },
    // لوحة المدير
    adminPanel:        { ar: 'لوحة مدير المنصة', en: 'Platform Admin Panel' },
    users:             { ar: 'المستخدمون', en: 'Users' },
    vendors:           { ar: 'التجار', en: 'Vendors' },
    orders:            { ar: 'الطلبات', en: 'Orders' },
    nyarCommission:    { ar: 'عمولات NYAR', en: 'NYAR Commissions' },
    commissionSettings:{ ar: 'إعدادات عمولة المنصة', en: 'Platform Commission Settings' },
    updateRate:        { ar: 'تحديث النسبة', en: 'Update Rate' },
    exportData:        { ar: 'تصدير البيانات', en: 'Export Data' },
    createFlashDeal:   { ar: 'إنشاء عرض فلاش', en: 'Create Flash Deal' },
    flashDiscountPh:   { ar: 'نسبة الخصم %', en: 'Discount %' },
    flashHoursPh:      { ar: 'المدة بالساعات', en: 'Duration (hours)' },
    launchDeal:        { ar: 'إطلاق العرض', en: 'Launch Deal' },
    manageVendors:     { ar: '📋 إدارة التجار', en: '📋 Manage Vendors' },
    allOrders:         { ar: '📊 جميع الطلبات', en: '📊 All Orders' },
    payouts:           { ar: '💸 تحويلات التجار', en: '💸 Vendor Payouts' },
    block:             { ar: '🚫 حظر', en: '🚫 Block' },
    activate:          { ar: '✅ تفعيل', en: '✅ Activate' },
    verify:            { ar: '⭐ توثيق', en: '⭐ Verify' },
    unverify:          { ar: 'إلغاء التوثيق', en: 'Unverify' },
    confirmPayment:    { ar: 'تأكيد الدفع', en: 'Confirm Payment' },
    markPaid:          { ar: 'تم التحويل', en: 'Mark Transferred' },
    // الفوتر
    footerAbout:    { ar: 'منصة تجارة إلكترونية عالمية متعددة التجار، تربط التاجر بالمشتري في اليمن والخليج والعالم مع دفع هجين وشحن ذكي.', en: 'A global multi-vendor marketplace connecting sellers and buyers across Yemen, the Gulf, and the world with hybrid payments and smart shipping.' },
    footerLinks:    { ar: 'روابط سريعة', en: 'Quick Links' },
    footerLegal:    { ar: 'الشؤون القانونية', en: 'Legal' },
    footerMarkets:  { ar: 'الأسواق والدفع', en: 'Markets & Payments' },
    footerPayments: { ar: 'اليمن: جيب، كريمي، ون كاش، فلوسك، محفظتي، والدفع عند الاستلام.\nعالمياً: Visa، MasterCard، PayPal، Apple Pay.', en: 'Yemen: Jib, Al-Kuraimi, One Cash, Floosak, Mahfadti & Cash on Delivery.\nWorldwide: Visa, MasterCard, PayPal, Apple Pay.' },
    becomeVendor:   { ar: 'كن تاجراً', en: 'Become a Vendor' },
    rights:         { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },
    // ذوي الهمم
    a11yTitle:      { ar: '♿ وضع ذوي الهمم', en: '♿ Accessibility Mode' },
    a11ySpeech:     { ar: 'القراءة الصوتية', en: 'Voice Reading' },
    a11yContrast:   { ar: 'التباين العالي', en: 'High Contrast' },
    a11yLargeText:  { ar: 'تكبير النصوص', en: 'Large Text' },
    // حالات الطلب
    stPending:   { ar: '⏳ قيد الانتظار', en: '⏳ Pending' },
    stPaid:      { ar: '💰 مدفوع', en: '💰 Paid' },
    stShipped:   { ar: '🚚 تم الشحن', en: '🚚 Shipped' },
    stCompleted: { ar: '✅ مكتمل', en: '✅ Completed' },
    stCancelled: { ar: '❌ ملغي', en: '❌ Cancelled' },
    // رسائل النظام
    msgLoginOk:        { ar: 'تم تسجيل الدخول بنجاح!', en: 'Signed in successfully!' },
    msgLoginFail:      { ar: 'بيانات الدخول غير صحيحة', en: 'Invalid credentials' },
    msgFillAll:        { ar: 'يرجى ملء جميع الحقول المطلوبة', en: 'Please fill all required fields' },
    msgEmailExists:    { ar: 'البريد مسجل مسبقاً', en: 'Email already registered' },
    msgRegisterOk:     { ar: 'تم إنشاء الحساب بنجاح!', en: 'Account created successfully!' },
    msgVendorOk:       { ar: 'تم تسجيل نشاطك التجاري بنجاح!', en: 'Your business was registered!' },
    msgNeedLogin:      { ar: 'يرجى تسجيل الدخول أولاً', en: 'Please sign in first' },
    msgNeedVendor:     { ar: 'يرجى تسجيل الدخول كتاجر', en: 'Please sign in as a vendor' },
    msgBlocked:        { ar: 'حسابك محظور، تواصل مع الإدارة', en: 'Your account is blocked, contact admin' },
    msgAddedWish:      { ar: 'تمت الإضافة للمفضلة ❤️', en: 'Added to wishlist ❤️' },
    msgRemovedWish:    { ar: 'تمت الإزالة من المفضلة', en: 'Removed from wishlist' },
    msgAddedCart:      { ar: 'تمت الإضافة إلى السلة 🛒', en: 'Added to cart 🛒' },
    msgCartEmpty:      { ar: 'السلة فارغة!', en: 'Cart is empty!' },
    msgCouponOk:       { ar: 'تم تطبيق كود الخصم 🎉', en: 'Coupon applied 🎉' },
    msgCouponBad:      { ar: 'كود الخصم غير صالح', en: 'Invalid coupon code' },
    msgSelectPayment:  { ar: 'يرجى اختيار طريقة الدفع', en: 'Please select a payment method' },
    msgSelectShipping: { ar: 'يرجى اختيار طريقة الشحن', en: 'Please select a shipping method' },
    msgOrderPlaced:    { ar: 'تم تقديم الطلب بنجاح!', en: 'Order placed successfully!' },
    msgProductAdded:   { ar: 'تم نشر المنتج بنجاح!', en: 'Product published!' },
    msgProductDeleted: { ar: 'تم حذف المنتج', en: 'Product deleted' },
    msgSettingsSaved:  { ar: 'تم حفظ الإعدادات بنجاح', en: 'Settings saved' },
    msgCommissionOk:   { ar: 'تم تحديث العمولة', en: 'Commission updated' },
    msgInvalidRate:    { ar: 'نسبة غير صالحة', en: 'Invalid rate' },
    msgPaymentConfirmed: { ar: 'تم تأكيد الدفع وتوزيع الأرباح', en: 'Payment confirmed & earnings distributed' },
    msgFlashCreated:   { ar: 'تم إطلاق عرض الفلاش ⚡', en: 'Flash deal launched ⚡' },
    msgNoMic:          { ar: 'عذراً، متصفحك لا يدعم التعرف الصوتي', en: 'Sorry, your browser does not support speech recognition' },
    msgMicError:       { ar: 'تأكد من السماح للمتصفح بالوصول للميكروفون', en: 'Please allow microphone access' },
    msgA11yOn:         { ar: 'تم تفعيل وضع ذوي الهمم والقراءة الصوتية بنجاح', en: 'Accessibility mode and voice reading activated' },
    msgA11yOff:        { ar: 'تم إيقاف وضع القراءة الصوتية', en: 'Voice reading disabled' },
    msgNoOrders:       { ar: 'لا توجد طلبات بعد', en: 'No orders yet' },
    msgNoProducts:     { ar: 'لا توجد منتجات', en: 'No products' },
    msgWelcomeA11y:    { ar: 'مرحباً بك في منصة نيار ماركت. منصة تجارة إلكترونية عالمية متعددة التجار. استخدم التبويبات العلوية للتنقل بين المتجر والسلة وطلباتك.', en: 'Welcome to NYAR MARKET, a global multi-vendor marketplace. Use the top tabs to navigate.' },
    msgExportOk:       { ar: 'تم تصدير جميع البيانات 📥', en: 'All data exported 📥' },
    msgAdminWelcome:   { ar: '👑 مرحباً بك في لوحة المدير', en: '👑 Welcome to the admin panel' },
    msgInvalidPhone:   { ar: 'يرجى إدخال رقم هاتف صحيح', en: 'Please enter a valid phone number' },
    orderNumber:       { ar: 'رقم الطلب', en: 'Order No.' },
    qty:               { ar: 'الكمية', en: 'Qty' },
    products:          { ar: 'منتج', en: 'products' },
    sales:             { ar: 'مبيعات', en: 'sales' },
    days:              { ar: 'يوم', en: 'day', },
    hoursLeft:         { ar: 'ساعة', en: 'h' },
    minutesLeft:       { ar: 'دقيقة', en: 'm' },
    secondsLeft:       { ar: 'ثانية', en: 's' },
    endsIn:            { ar: 'ينتهي خلال', en: 'Ends in' },
    emptyStoreMsg:     { ar: 'لا توجد نتائج مطابقة', en: 'No matching results' }
};

/* ============================================================
   03. إدارة الحالة والتخزين
   ============================================================ */
const DB_KEYS = {
    products: 'nyar3_products', users: 'nyar3_users', orders: 'nyar3_orders',
    cart: 'nyar3_cart', wishlist: 'nyar3_wishlist', user: 'nyar3_user',
    settings: 'nyar3_settings', payouts: 'nyar3_payouts'
};

function dbGet(key, fallback) {
    try { const v = localStorage.getItem(DB_KEYS[key]); return v !== null ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
}
function dbSet(key, value) {
    try { localStorage.setItem(DB_KEYS[key], JSON.stringify(value)); } catch (e) { /* مساحة ممتلئة */ }
}

// البيانات التجريبية الأولية (الأسعار بالدولار USD)
const SEED_PRODUCTS = [
    { id: 1,  title: 'سماعات الرأس السينمائية Pro', titleEn: 'Cinematic Headphones Pro', price: 120, originalPrice: 200, icon: '🎧', category: 'electronics', rating: 4.8, reviews: 234, vendorId: 1, badge: 'sale', description: 'سماعات احترافية بتقنية إلغاء الضوضاء النشطة وصوت محيطي.', descriptionEn: 'Professional headphones with active noise cancellation.', inStock: true, featured: true, bestSeller: true, onSale: true, flash: null },
    { id: 2,  title: 'ساعة النخبة الذكية Ultra', titleEn: 'Elite Smart Watch Ultra', price: 210, originalPrice: 350, icon: '⌚', category: 'electronics', rating: 4.9, reviews: 567, vendorId: 2, badge: 'best', description: 'ساعة ذكية متطورة بشاشة AMOLED وتتبع صحي متكامل.', descriptionEn: 'Advanced smartwatch with AMOLED display.', inStock: true, featured: true, bestSeller: true, onSale: false, flash: null },
    { id: 3,  title: 'خازن طاقة شمسي 50000mAh', titleEn: 'Solar Power Bank 50000mAh', price: 85, originalPrice: 120, icon: '🔋', category: 'electronics', rating: 4.6, reviews: 189, vendorId: 1, badge: 'new', description: 'خازن طاقة محمول بشحن شمسي سريع مثالي للسفر.', descriptionEn: 'Portable solar power bank, perfect for travel.', inStock: true, featured: false, bestSeller: true, onSale: true, flash: null },
    { id: 4,  title: 'طقم أزياء رجالي فاخر', titleEn: 'Luxury Men Suit Set', price: 320, originalPrice: 500, icon: '👔', category: 'fashion', rating: 4.7, reviews: 89, vendorId: 2, badge: 'sale', description: 'بدلة كاملة من أفخم الأقمشة الإيطالية.', descriptionEn: 'Full suit made of premium Italian fabrics.', inStock: true, featured: true, bestSeller: false, onSale: true, flash: null },
    { id: 5,  title: 'جهاز تدليك منزلي ذكي', titleEn: 'Smart Home Massager', price: 150, originalPrice: 180, icon: '💆', category: 'home', rating: 4.5, reviews: 156, vendorId: 1, badge: 'best', description: 'جهاز تدليك بتحكم ذكي عبر التطبيق.', descriptionEn: 'Massage device with smart app control.', inStock: false, featured: true, bestSeller: false, onSale: false, flash: null },
    { id: 6,  title: 'حذاء رياضي احترافي', titleEn: 'Pro Running Shoes', price: 95, originalPrice: 130, icon: '👟', category: 'sports', rating: 4.4, reviews: 312, vendorId: 2, badge: 'new', description: 'حذاء جري بتقنية امتصاص الصدمات.', descriptionEn: 'Running shoes with shock absorption.', inStock: true, featured: false, bestSeller: true, onSale: false, flash: null },
    { id: 7,  title: 'روبوت مطبخ ذكي', titleEn: 'Smart Kitchen Robot', price: 450, originalPrice: 600, icon: '🤖', category: 'home', rating: 4.9, reviews: 78, vendorId: 1, badge: 'best', description: 'روبوت مطبخ يقوم بالطبخ أوتوماتيكياً.', descriptionEn: 'Automatic cooking kitchen robot.', inStock: true, featured: true, bestSeller: false, onSale: true, flash: null },
    { id: 8,  title: 'نظارة واقع افتراضي VR Pro', titleEn: 'VR Pro Headset', price: 280, originalPrice: 380, icon: '🥽', category: 'electronics', rating: 4.7, reviews: 445, vendorId: 2, badge: 'new', description: 'نظارة VR بدقة 4K مع مكتبة ألعاب ضخمة.', descriptionEn: '4K VR headset with huge game library.', inStock: true, featured: true, bestSeller: true, onSale: false, flash: null },
    { id: 9,  title: 'عسل سدر يمني أصلي (1 كجم)', titleEn: 'Pure Yemeni Sidr Honey (1kg)', price: 55, originalPrice: 70, icon: '🍯', category: 'honey', rating: 4.9, reviews: 120, vendorId: 3, badge: 'best', description: 'عسل سدر يمني طبيعي 100% من وادي دوعن بحضرموت.', descriptionEn: '100% natural Sidr honey from Wadi Doan.', inStock: true, featured: true, bestSeller: true, onSale: true, flash: null },
    { id: 10, title: 'بخور عود ملكي فاخر', titleEn: 'Royal Oud Incense', price: 35, originalPrice: 48, icon: '🌸', category: 'perfumes', rating: 4.8, reviews: 89, vendorId: 3, badge: 'sale', description: 'بخور عود فاخر معطر بالمسك والعنبر.', descriptionEn: 'Luxury oud incense with musk and amber.', inStock: true, featured: true, bestSeller: false, onSale: true, flash: null },
    { id: 11, title: 'شاشة ألعاب منحنية 32 بوصة', titleEn: '32" Curved Gaming Monitor', price: 390, originalPrice: 480, icon: '🖥️', category: 'electronics', rating: 4.6, reviews: 203, vendorId: 2, badge: 'new', description: 'شاشة ألعاب 165Hz بدقة 2K واستجابة 1ms.', descriptionEn: '165Hz 2K gaming monitor, 1ms response.', inStock: true, featured: false, bestSeller: false, onSale: true, flash: null },
    { id: 12, title: 'عطر العود الملكي الخليجي', titleEn: 'Gulf Royal Oud Perfume', price: 140, originalPrice: 190, icon: '🧴', category: 'perfumes', rating: 4.9, reviews: 340, vendorId: 3, badge: 'best', description: 'عطر شرقي فاخر يدوم أكثر من 12 ساعة.', descriptionEn: 'Luxury oriental perfume lasting 12+ hours.', inStock: true, featured: true, bestSeller: true, onSale: false, flash: null }
];

const SEED_VENDORS = [
    { id: 1, name: 'مؤسسة دبي التجارية', email: 'dubai@vendor.com', password: 'vendor123', role: 'vendor', status: 'active', verified: true,
      vendorProfile: { fullName: 'أحمد الحميري', storeName: 'شركة دبي للإلكترونيات', storeNameEn: 'Dubai Electronics Co.', logo: '🏪', businessType: 'electronics', address: { city: 'عدن', street: 'المعلا - الشارع الرئيسي' }, wallets: { jib: '777111001', krimi: '777111002' } } },
    { id: 2, name: 'مجموعة الخليج', email: 'gulf@vendor.com', password: 'vendor123', role: 'vendor', status: 'active', verified: true,
      vendorProfile: { fullName: 'سارة المطيري', storeName: 'مورد الخليج المعتمد', storeNameEn: 'Gulf Certified Supplier', logo: '🏬', businessType: 'fashion', address: { city: 'صنعاء', street: 'شارع حدة' }, wallets: { jib: '777222001', krimi: '777222002' } } },
    { id: 3, name: 'مناحل وعطور اليمن', email: 'yemen@vendor.com', password: 'vendor123', role: 'vendor', status: 'active', verified: false,
      vendorProfile: { fullName: 'خالد باوزير', storeName: 'مناحل حضرموت وعطورها', storeNameEn: 'Hadramout Apiaries & Perfumes', logo: '🍯', businessType: 'honey', address: { city: 'حضرموت', street: 'المكلا - الديس' }, wallets: { jib: '777333001', krimi: '777333002' } } }
];

// الحالة العامة
let platformProducts = dbGet('products', null) || JSON.parse(JSON.stringify(SEED_PRODUCTS));
let users            = dbGet('users', null) || JSON.parse(JSON.stringify(SEED_VENDORS));
let orders           = dbGet('orders', []);
let payouts          = dbGet('payouts', []);
let cart             = dbGet('cart', []);
let wishlist         = dbGet('wishlist', []);
let currentUser      = dbGet('user', null);
let appSettings      = dbGet('settings', {
    commissionRate: 10, currency: 'YER', market: 'YE', lang: 'ar',
    darkMode: true, a11y: { speech: false, contrast: false, largeText: false }
});

let currentView = 'home';
let appliedCoupon = null;
let checkoutState = { shippingId: null, paymentId: null };
let activeShopVendorId = null;
let flashTimerInterval = null;

function saveState() {
    dbSet('products', platformProducts);
    dbSet('users', users);
    dbSet('orders', orders);
    dbSet('payouts', payouts);
    dbSet('cart', cart);
    dbSet('wishlist', wishlist);
    dbSet('user', currentUser);
    dbSet('settings', appSettings);
}

function initializeAdminAccount() {
    if (!users.find(u => u.role === 'admin')) {
        users.push({ id: 0, name: 'مدير المنصة', email: ADMIN_CREDENTIALS.email, password: ADMIN_CREDENTIALS.password, role: 'admin', status: 'active', verified: true });
        saveState();
    }
}

/* ============================================================
   04. محرك اللغة والاتجاه (RTL / LTR)
   ============================================================ */
function t(key) {
    const entry = I18N[key];
    if (!entry) return key;
    return entry[appSettings.lang] || entry.ar || key;
}

function applyI18n() {
    const lang = appSettings.lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('langBtnText').textContent = lang === 'ar' ? 'EN' : 'ع';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });
    const authSpan = document.querySelector('#authBtn [data-i18n]');
    if (authSpan) authSpan.textContent = currentUser ? t('logout') : t('login');
}

function toggleLanguage() {
    appSettings.lang = appSettings.lang === 'ar' ? 'en' : 'ar';
    saveState();
    applyI18n();
    renderDynamicTexts();
    switchView(currentView);
    renderAll();
}

function renderDynamicTexts() {
    renderBannerMarketChip();
    fillCategorySelects();
    fillGovSelects();
}

/* ============================================================
   05. محرك العملات والأسعار (الأساس: USD)
   ============================================================ */
function convertPrice(usd) {
    const cur = CURRENCIES[appSettings.currency] || CURRENCIES.YER;
    return usd * cur.rate;
}

function formatPrice(usd) {
    const cur = CURRENCIES[appSettings.currency] || CURRENCIES.YER;
    const value = convertPrice(usd);
    const formatted = value.toLocaleString('en-US', { minimumFractionDigits: cur.decimals, maximumFractionDigits: cur.decimals });
    const symbol = appSettings.lang === 'ar' ? cur.symbolAr : cur.symbolEn;
    if (appSettings.currency === 'USD') return `${symbol}${formatted}`;
    return `${formatted} ${symbol}`;
}

// السعر الفعلي بعد خصم الفلاش (إن كان نشطاً)
function effectivePrice(product) {
    if (product.flash && product.flash.endsAt > Date.now()) {
        return product.price * (1 - product.flash.pct / 100);
    }
    return product.price;
}

function isFlashActive(product) {
    return !!(product.flash && product.flash.endsAt > Date.now());
}

function changeCurrency() {
    appSettings.currency = document.getElementById('currencySelect').value;
    saveState();
    renderAll();
    if (currentView === 'cart') { renderCart(); updateCartSummary(); }
    if (currentView === 'orders') renderBuyerOrders();
    if (currentView === 'vendor') { loadVendorStats(); renderVendorOrders(); }
    if (currentView === 'admin') { loadAdminStats(); renderAdminOrdersList(); renderAdminPayouts(); }
}

function changeMarket() {
    appSettings.market = document.getElementById('marketSelect').value;
    // اقتراح عملة السوق تلقائياً
    const suggested = MARKETS[appSettings.market].currency;
    appSettings.currency = suggested;
    document.getElementById('currencySelect').value = suggested;
    saveState();
    renderBannerMarketChip();
    renderAll();
    showToast(`${t('shippingCountry').replace(' *','')}: ${t('market' + appSettings.market)}`);
}

function renderBannerMarketChip() {
    const chip = document.getElementById('bannerMarketChip');
    if (chip) chip.innerHTML = `${MARKETS[appSettings.market].flag} ${t('market' + appSettings.market)} · ${appSettings.currency}`;
}

/* ============================================================
   06. أدوات عامة (توست، نوافذ، هروب HTML)
   ============================================================ */
function esc(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${esc(msg)}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
    if (appSettings.a11y.speech) speakText(msg);
}

function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('active'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('active'); }

function toggleTheme() {
    appSettings.darkMode = !appSettings.darkMode;
    document.body.classList.toggle('light-mode', !appSettings.darkMode);
    document.getElementById('themeIcon').className = appSettings.darkMode ? 'fas fa-moon' : 'fas fa-sun';
    saveState();
}

function getVendorById(vendorId) { return users.find(u => u.id === vendorId && u.role === 'vendor'); }
function getProductById(id) { return platformProducts.find(p => p.id === id); }
function getCategoryName(value) {
    const c = CATEGORIES.find(x => x.value === value);
    return c ? (appSettings.lang === 'ar' ? c.ar : c.en) : value;
}
function getProductTitle(p) { return appSettings.lang === 'ar' ? p.title : (p.titleEn || p.title); }
function getProductDesc(p) { return appSettings.lang === 'ar' ? p.description : (p.descriptionEn || p.description); }
function getVendorStoreName(vendorId, fallback) {
    const v = getVendorById(vendorId);
    if (v && v.vendorProfile) return appSettings.lang === 'ar' ? v.vendorProfile.storeName : (v.vendorProfile.storeNameEn || v.vendorProfile.storeName);
    return fallback || '';
}
function orderStatusLabel(status) {
    const map = { pending: 'stPending', paid: 'stPaid', shipped: 'stShipped', completed: 'stCompleted', cancelled: 'stCancelled' };
    return t(map[status] || 'stPending');
}

/* ============================================================
   07. المصادقة والحسابات
   ============================================================ */
function handleAuthClick() {
    if (currentUser) {
        currentUser = null;
        saveState();
        updateMenuVisibility();
        applyI18n();
        switchView('home');
        showToast(t('logout'));
    } else {
        openModal('loginModal');
    }
}

function handleVendorClick() {
    if (!currentUser) { openModal('registerModal'); return; }
    if (currentUser.role === 'vendor') { switchView('vendor'); return; }
    openModal('vendorRegisterModal');
}

function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { showToast(t('msgLoginFail'), 'error'); return; }
    if (user.status === 'blocked') { showToast(t('msgBlocked'), 'error'); return; }
    currentUser = user;
    saveState();
    closeModal('loginModal');
    updateMenuVisibility();
    applyI18n();
    renderAll();
    showToast(t('msgLoginOk'));
}

function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    if (!name || !email || !password) { showToast(t('msgFillAll'), 'error'); return; }
    if (users.find(u => u.email === email)) { showToast(t('msgEmailExists'), 'error'); return; }
    const newUser = { id: Date.now(), name, email, password, role: 'buyer', status: 'active', verified: false, createdAt: new Date().toISOString() };
    users.push(newUser);
    currentUser = newUser;
    saveState();
    updateMenuVisibility();
    applyI18n();
    closeModal('registerModal');
    if (role === 'vendor') { openModal('vendorRegisterModal'); }
    else { showToast(t('msgRegisterOk')); renderAll(); }
}

function registerVendor() {
    const fullName = document.getElementById('vendorFullName').value.trim();
    const storeName = document.getElementById('vendorStoreNameReg').value.trim();
    const businessType = document.getElementById('vendorBusinessType').value;
    const city = document.getElementById('vendorCity').value;
    const street = document.getElementById('vendorStreet').value.trim();
    const jib = document.getElementById('vendorJibWalletReg').value.trim();
    const krimi = document.getElementById('vendorKrimiWalletReg').value.trim();
    if (!fullName || !storeName || !businessType || !city || !street) { showToast(t('msgFillAll'), 'error'); return; }
    if (!currentUser) { showToast(t('msgNeedLogin'), 'error'); return; }
    currentUser.vendorProfile = { fullName, storeName, storeNameEn: storeName, logo: '🏪', businessType, address: { city, street }, wallets: { jib, krimi } };
    currentUser.role = 'vendor';
    saveState();
    updateMenuVisibility();
    closeModal('vendorRegisterModal');
    showToast(t('msgVendorOk'));
    switchView('vendor');
}

function updateMenuVisibility() {
    const adminTab = document.querySelector('.tab-item[data-view="admin"]');
    const vendorTab = document.querySelector('.tab-item[data-view="vendor"]');
    if (adminTab) adminTab.style.display = (currentUser && currentUser.role === 'admin') ? '' : 'none';
    if (vendorTab) vendorTab.style.display = (currentUser && (currentUser.role === 'vendor' || currentUser.role === 'admin')) ? '' : 'none';
}

/* ============================================================
   08. عرض المنتجات والفلاتر وعروض الفلاش
   ============================================================ */
function renderProductCard(product) {
    const flash = isFlashActive(product);
    const price = effectivePrice(product);
    let badgeHTML = '';
    if (flash) badgeHTML = `<span class="product-badge flash">⚡ ${t('badgeFlash')} -${product.flash.pct}%</span>`;
    else if (product.badge === 'sale') badgeHTML = `<span class="product-badge sale">${t('badgeSale')}</span>`;
    else if (product.badge === 'new') badgeHTML = `<span class="product-badge new">${t('badgeNew')}</span>`;
    else if (product.badge === 'best') badgeHTML = `<span class="product-badge best">${t('badgeBest')}</span>`;

    const vendor = getVendorById(product.vendorId);
    const vendorName = getVendorStoreName(product.vendorId, 'NYAR');
    const verifiedIcon = vendor && vendor.verified ? '<i class="fas fa-check-circle verified-icon" title="' + t('verifiedSeller') + '"></i>' : '';
    const isWishlisted = wishlist.includes(product.id);
    const originalShown = flash ? product.price : product.originalPrice;

    return `
        <div class="cyber-product-card" onclick="openProductDetail(${product.id})">
            <div class="image-premium-zone">
                ${product.icon}
                ${badgeHTML}
                <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation();toggleWishlist(${product.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="info-premium-zone">
                <span class="vendor-tag" onclick="event.stopPropagation();openShop(${product.vendorId})"><i class="fas fa-store"></i> ${esc(vendorName)} ${verifiedIcon}</span>
                <div class="premium-title">${esc(getProductTitle(product))}</div>
                <div class="rating-stars">${'★'.repeat(Math.floor(product.rating))} <span>(${product.reviews})</span></div>
                <div class="price-row">
                    <span class="premium-price-tag">${formatPrice(price)}</span>
                    ${originalShown > price ? `<span class="original-price">${formatPrice(originalShown)}</span>` : ''}
                </div>
                ${product.inStock
                    ? `<button class="action-buy-btn" onclick="event.stopPropagation();addToCart(${product.id})">${t('addToCart')}</button>`
                    : `<button class="action-buy-btn" disabled>${t('outOfStock')}</button>`}
            </div>
        </div>`;
}

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    grid.innerHTML = CATEGORIES.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.value}')">
            <div class="cat-icon">${cat.icon}</div>
            <div class="cat-name">${appSettings.lang === 'ar' ? cat.ar : cat.en}</div>
        </div>`).join('');
}

function fillCategorySelects() {
    const opts = `<option value="all">${t('allCategories')}</option>` +
        CATEGORIES.map(c => `<option value="${c.value}">${c.icon} ${appSettings.lang === 'ar' ? c.ar : c.en}</option>`).join('');
    const filterCat = document.getElementById('filterCategory');
    if (filterCat) filterCat.innerHTML = opts;
    const vProdCat = document.getElementById('vProdCategory');
    if (vProdCat) vProdCat.innerHTML = CATEGORIES.map(c => `<option value="${c.value}">${c.icon} ${appSettings.lang === 'ar' ? c.ar : c.en}</option>`).join('');
    const vBizType = document.getElementById('vendorBusinessType');
    if (vBizType) vBizType.innerHTML = `<option value="">${appSettings.lang === 'ar' ? 'نوع النشاط*' : 'Business type*'}</option>` +
        CATEGORIES.map(c => `<option value="${c.value}">${c.icon} ${appSettings.lang === 'ar' ? c.ar : c.en}</option>`).join('');
}

function fillGovSelects() {
    const vendorCity = document.getElementById('vendorCity');
    if (vendorCity) {
        vendorCity.innerHTML = `<option value="">${appSettings.lang === 'ar' ? 'المحافظة*' : 'Governorate*'}</option>` +
            YEMEN_GOVS.map(g => `<option value="${g.ar}">${appSettings.lang === 'ar' ? g.ar : g.en}</option>`).join('');
    }
}

function renderFeaturedProducts() {
    const grid = document.getElementById('featuredProducts');
    if (grid) grid.innerHTML = platformProducts.filter(p => p.featured).slice(0, 8).map(renderProductCard).join('') || emptyMsg();
}
function renderBestSellerProducts() {
    const grid = document.getElementById('bestSellerProducts');
    if (grid) grid.innerHTML = platformProducts.filter(p => p.bestSeller).slice(0, 8).map(renderProductCard).join('') || emptyMsg();
}
function renderOnSaleProducts() {
    const grid = document.getElementById('onSaleProducts');
    if (grid) grid.innerHTML = platformProducts.filter(p => p.onSale).slice(0, 8).map(renderProductCard).join('') || emptyMsg();
}

function emptyMsg() {
    return `<p style="color:var(--text-muted);padding:2rem;text-align:center;grid-column:1/-1;">${t('emptyStoreMsg')}</p>`;
}

// ===== عروض الفلاش =====
function renderFlashDeals() {
    const section = document.getElementById('flashSection');
    const grid = document.getElementById('flashProducts');
    if (!section || !grid) return;
    // تنظيف العروض المنتهية
    platformProducts.forEach(p => { if (p.flash && p.flash.endsAt <= Date.now()) p.flash = null; });
    const flashProducts = platformProducts.filter(isFlashActive);
    if (flashProducts.length === 0) { section.style.display = 'none'; clearInterval(flashTimerInterval); return; }
    section.style.display = 'block';
    grid.innerHTML = flashProducts.map(renderProductCard).join('');
    startFlashCountdown(flashProducts);
}

function startFlashCountdown(flashProducts) {
    clearInterval(flashTimerInterval);
    const nearest = Math.min(...flashProducts.map(p => p.flash.endsAt));
    const tick = () => {
        const box = document.getElementById('flashCountdown');
        if (!box) { clearInterval(flashTimerInterval); return; }
        const diff = nearest - Date.now();
        if (diff <= 0) { clearInterval(flashTimerInterval); renderFlashDeals(); renderAll(); return; }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        box.innerHTML = `<span style="color:var(--text-muted);font-size:12px;font-weight:700;">${t('endsIn')}:</span>` +
            [ [h, t('hoursLeft')], [m, t('minutesLeft')], [s, t('secondsLeft')] ].map(([v, l]) =>
                `<span style="text-align:center;"><span class="flash-time-box">${String(v).padStart(2, '0')}</span><br><span class="flash-time-label">${l}</span></span>`
            ).join('');
    };
    tick();
    flashTimerInterval = setInterval(tick, 1000);
}

// ===== المتجر والفلاتر =====
function renderStoreProducts(filtered = null) {
    const grid = document.getElementById('storeProductsGrid');
    if (!grid) return;
    const list = filtered || platformProducts;
    grid.innerHTML = list.length ? list.map(renderProductCard).join('') : emptyMsg();
}

function applyFilters() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const category = document.getElementById('filterCategory')?.value || 'all';
    const priceRange = document.getElementById('filterPrice')?.value || 'all';
    const rating = document.getElementById('filterRating')?.value || 'all';
    let filtered = platformProducts;
    if (searchTerm) {
        filtered = filtered.filter(p =>
            (p.title && p.title.toLowerCase().includes(searchTerm)) ||
            (p.titleEn && p.titleEn.toLowerCase().includes(searchTerm)) ||
            getVendorStoreName(p.vendorId, '').toLowerCase().includes(searchTerm));
    }
    if (category !== 'all') filtered = filtered.filter(p => p.category === category);
    if (priceRange !== 'all') {
        const parts = priceRange.split('-').map(Number);
        filtered = filtered.filter(p => p.price >= parts[0] && p.price <= parts[1]);
    }
    if (rating !== 'all') filtered = filtered.filter(p => p.rating >= parseFloat(rating));
    renderStoreProducts(filtered);
    if (currentView !== 'store') switchView('store');
}

function filterByCategory(catValue) {
    const sel = document.getElementById('filterCategory');
    if (sel) sel.value = catValue;
    switchView('store');
    applyFilters();
}

function renderAll() {
    renderCategories();
    renderFlashDeals();
    renderFeaturedProducts();
    renderBestSellerProducts();
    renderOnSaleProducts();
    renderStoreProducts();
    renderStoresDirectory();
    updateCartBadge();
}

/* ============================================================
   09. تفاصيل المنتج والمفضلة
   ============================================================ */
function openProductDetail(productId) {
    const product = getProductById(productId);
    if (!product) return;
    const price = effectivePrice(product);
    const originalShown = isFlashActive(product) ? product.price : product.originalPrice;

    document.getElementById('productMainEmoji').textContent = product.icon;
    document.getElementById('productDetailTitle').textContent = getProductTitle(product);
    document.getElementById('productDetailRating').innerHTML = '★'.repeat(Math.floor(product.rating)) + ` <span>(${product.reviews} ${t('reviews')})</span>`;
    document.getElementById('productDetailPrice').textContent = formatPrice(price);
    const origEl = document.getElementById('productDetailOriginalPrice');
    if (originalShown > price) { origEl.textContent = formatPrice(originalShown); origEl.style.display = 'inline'; }
    else origEl.style.display = 'none';
    document.getElementById('productDetailDescription').textContent = getProductDesc(product) || '';
    document.getElementById('deliveryEstimate').textContent = t('deliveryFromVendor');

    // بطاقة التاجر
    const vendor = getVendorById(product.vendorId);
    let vendorHtml = '';
    if (vendor && vendor.vendorProfile) {
        const p = vendor.vendorProfile;
        vendorHtml = `
            <div class="vendor-profile-card">
                <div style="display:flex;gap:1rem;align-items:center;margin-bottom:0.6rem;flex-wrap:wrap;">
                    <div style="width:52px;height:52px;background:linear-gradient(135deg,#D4AF37,#8B6914);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">${p.logo || '🏪'}</div>
                    <div style="flex:1;min-width:160px;">
                        <strong>${esc(appSettings.lang === 'ar' ? p.storeName : (p.storeNameEn || p.storeName))}</strong>
                        ${vendor.verified ? `<span class="verified-badge" style="margin-inline-start:6px;"><i class="fas fa-check-circle"></i> ${t('verifiedSeller')}</span>` : ''}
                        <br><span style="color:var(--text-muted);font-size:12px;">${getCategoryName(p.businessType)} · 📍 ${esc(p.address?.city || '')}</span>
                    </div>
                </div>
                <button class="mini-btn blue" onclick="closeModal('productModal');openShop(${vendor.id})">${t('visitStore')}</button>
            </div>`;
    }
    document.getElementById('vendorCardContainer').innerHTML = vendorHtml;

    const btn = document.getElementById('btnAddToCart');
    if (product.inStock) {
        btn.textContent = t('addToCart');
        btn.disabled = false;
        btn.onclick = () => { addToCart(product.id); closeModal('productModal'); };
    } else {
        btn.textContent = t('outOfStock');
        btn.disabled = true;
        btn.onclick = null;
    }
    openModal('productModal');
}

function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index > -1) { wishlist.splice(index, 1); showToast(t('msgRemovedWish')); }
    else { wishlist.push(productId); showToast(t('msgAddedWish')); }
    saveState();
    renderAll();
}

/* ============================================================
   10. السلة
   ============================================================ */
function addToCart(productId) {
    const product = getProductById(productId);
    if (!product || !product.inStock) { showToast(t('outOfStock'), 'error'); return; }
    const existing = cart.find(i => i.productId === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ productId, quantity: 1 });
    saveState();
    updateCartBadge();
    showToast(t('msgAddedCart'));
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartSubtotal() {
    return cart.reduce((sum, item) => {
        const product = getProductById(item.productId);
        return sum + (product ? effectivePrice(product) * item.quantity : 0);
    }, 0);
}

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text-muted);"><i class="fas fa-shopping-cart" style="font-size:4rem;opacity:0.3;"></i><p style="margin-top:1rem;">${t('emptyCart')}</p></div>`;
        return;
    }
    container.innerHTML = cart.map((item, index) => {
        const product = getProductById(item.productId);
        if (!product) return '';
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${product.icon} ${esc(getProductTitle(product))}</strong><br>
                    <span style="color:var(--text-muted);font-size:12px;">${esc(getVendorStoreName(product.vendorId, 'NYAR'))}</span>
                </div>
                <div class="cart-item-actions">
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="updateCartQty(${index}, this.value)">
                    <span style="font-weight:900;color:#D4AF37;">${formatPrice(effectivePrice(product) * item.quantity)}</span>
                    <button class="remove-btn" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
    }).join('');
}

function updateCartQty(index, qty) {
    const quantity = parseInt(qty, 10);
    if (isNaN(quantity) || quantity < 1) { removeFromCart(index); return; }
    cart[index].quantity = quantity;
    saveState();
    updateCartBadge();
    updateCartSummary();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveState();
    updateCartBadge();
    renderCart();
    updateCartSummary();
}

function applyCoupon() {
    const code = (document.getElementById('couponInput')?.value || '').trim().toUpperCase();
    if (COUPONS[code]) { appliedCoupon = { code, discount: COUPONS[code] }; showToast(t('msgCouponOk')); }
    else { appliedCoupon = null; showToast(t('msgCouponBad'), 'error'); }
    updateCartSummary();
    renderCheckoutPriceSummary();
}

function currentShippingCost() {
    const opts = SHIPPING_OPTIONS[appSettings.market] || SHIPPING_OPTIONS.INTL;
    return opts[0].costUSD;
}

function updateCartSummary() {
    const summary = document.getElementById('cartSummary');
    if (!summary) return;
    if (cart.length === 0) { summary.innerHTML = ''; return; }
    const subtotal = cartSubtotal();
    const discount = appliedCoupon ? subtotal * appliedCoupon.discount / 100 : 0;
    const shipping = currentShippingCost();
    const total = subtotal - discount + shipping;
    summary.innerHTML = `
        <div class="summary-card">
            <div class="summary-line"><span>${t('subtotal')}</span><strong>${formatPrice(subtotal)}</strong></div>
            ${appliedCoupon ? `<div class="summary-line" style="color:var(--accent-green);"><span>${t('discount')} (${appliedCoupon.code})</span><strong>-${formatPrice(discount)}</strong></div>` : ''}
            <div class="summary-line"><span>${t('shipping')} (${t('market' + appSettings.market)})</span><strong>${formatPrice(shipping)}</strong></div>
            <hr style="border-color:var(--border-gold);margin:0.6rem 0;">
            <div class="summary-line summary-total"><span>${t('total')}</span><span>${formatPrice(total)}</span></div>
        </div>`;
}

/* ============================================================
   11. إتمام الطلب — الدفع الهجين والشحن المزدوج
   ============================================================ */
function openCheckout() {
    if (cart.length === 0) { showToast(t('msgCartEmpty'), 'error'); return; }
    appliedCoupon = appliedCoupon || null;
    checkoutState = { shippingId: null, paymentId: null };

    // ملخص المنتجات
    document.getElementById('checkoutItemsList').innerHTML = cart.map(item => {
        const p = getProductById(item.productId);
        if (!p) return '';
        return `<div style="display:flex;justify-content:space-between;padding:0.35rem 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span>${p.icon} ${esc(getProductTitle(p))} × ${item.quantity}</span>
            <strong style="color:#D4AF37;">${formatPrice(effectivePrice(p) * item.quantity)}</strong>
        </div>`;
    }).join('');

    // تعيين دولة الشحن للسوق الحالي
    document.getElementById('coCountry').value = appSettings.market;
    renderCheckoutAddress();
    openModal('checkoutModal');
}

// بناء حقول العنوان حسب الدولة
function renderCheckoutAddress() {
    const country = document.getElementById('coCountry').value;
    const box = document.getElementById('checkoutAddressFields');
    if (country === 'YE') {
        box.innerHTML = `
            <div class="form-grid">
                <div>
                    <label class="input-label">${t('governorate')}</label>
                    <select id="coGov" class="luxury-input" onchange="fillCheckoutDistricts()">
                        <option value="">${t('selectGov')}</option>
                        ${YEMEN_GOVS.map((g, i) => `<option value="${i}">${appSettings.lang === 'ar' ? g.ar : g.en}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="input-label">${t('district')}</label>
                    <select id="coDistrict" class="luxury-input"><option value="">${t('selectDistrict')}</option></select>
                </div>
            </div>
            <input type="text" id="coStreet" class="luxury-input" placeholder="${t('street')}">
            <input type="text" id="coLandmark" class="luxury-input" placeholder="${t('landmark')}">`;
    } else {
        const countryField = country === 'INTL'
            ? `<input type="text" id="coCountryName" class="luxury-input" placeholder="${t('countryName')}">` : '';
        box.innerHTML = `
            ${countryField}
            <div class="form-grid">
                <div>
                    <label class="input-label">${t('city')}</label>
                    <input type="text" id="coCity" class="luxury-input" placeholder="${t('city').replace(' *','')}">
                </div>
                <div>
                    <label class="input-label">${t('postalCode')}</label>
                    <input type="text" id="coPostal" class="luxury-input" placeholder="00000">
                </div>
            </div>
            <input type="text" id="coStreet" class="luxury-input" placeholder="${t('intlAddress')}">`;
    }
    renderCheckoutShipping(country);
    renderCheckoutPayments(country);
    renderCheckoutPriceSummary();
}

function fillCheckoutDistricts() {
    const govIndex = document.getElementById('coGov').value;
    const distSel = document.getElementById('coDistrict');
    if (govIndex === '' || !YEMEN_GOVS[govIndex]) {
        distSel.innerHTML = `<option value="">${t('selectDistrict')}</option>`;
        return;
    }
    distSel.innerHTML = `<option value="">${t('selectDistrict')}</option>` +
        YEMEN_GOVS[govIndex].districts.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
}

// خيارات الشحن حسب الدولة
function renderCheckoutShipping(country) {
    const box = document.getElementById('checkoutShippingOptions');
    const opts = SHIPPING_OPTIONS[country] || SHIPPING_OPTIONS.INTL;
    const nameKey = { ye_local: 'shipLocal', ye_national: 'shipNational' };
    box.innerHTML = opts.map((o, i) => {
        const label = nameKey[o.id] ? t(nameKey[o.id]) : (o.id.endsWith('exp') ? t('shipExpIntl') : t('shipStdIntl'));
        return `
        <label style="display:flex;align-items:center;gap:0.7rem;background:var(--bg-deep);border:1px solid var(--border-gold);border-radius:var(--radius-md);padding:0.8rem;margin-bottom:0.5rem;cursor:pointer;min-height:44px;">
            <input type="radio" name="coShipping" value="${o.id}" ${i === 0 ? 'checked' : ''} onchange="selectCheckoutShipping('${o.id}')">
            <span style="flex:1;color:var(--text-pure);font-size:13px;font-weight:700;">🚚 ${label} <small style="color:var(--text-muted);">(${t(o.daysKey)})</small></span>
            <strong style="color:#D4AF37;">${formatPrice(o.costUSD)}</strong>
        </label>`;
    }).join('');
    checkoutState.shippingId = opts[0].id;
}

function selectCheckoutShipping(id) {
    checkoutState.shippingId = id;
    renderCheckoutPriceSummary();
}

// طرق الدفع حسب الدولة (هجين)
function renderCheckoutPayments(country) {
    const box = document.getElementById('checkoutPaymentOptions');
    document.getElementById('paymentInstructions').style.display = 'none';
    if (country === 'YE') {
        box.innerHTML = YE_PAYMENTS.map(w => `
            <div class="wallet-btn" data-pay="${w.id}" onclick="selectCheckoutPayment('${w.id}', 'YE')">
                ${w.img ? `<img src="${w.img}" alt="${esc(w.nameAr)}">` : `<span class="pay-icon">${w.icon}</span>`}
                ${appSettings.lang === 'ar' ? w.nameAr : w.nameEn}
            </div>`).join('');
    } else {
        box.innerHTML = INTL_PAYMENTS.map(w => `
            <div class="wallet-btn" data-pay="${w.id}" onclick="selectCheckoutPayment('${w.id}', 'INTL')">
                <span class="pay-icon">${w.icon}</span>
                ${appSettings.lang === 'ar' ? w.nameAr : w.nameEn}
            </div>`).join('');
    }
    checkoutState.paymentId = null;
}

function selectCheckoutPayment(payId, group) {
    checkoutState.paymentId = payId;
    document.querySelectorAll('#checkoutPaymentOptions .wallet-btn').forEach(b => b.classList.remove('selected'));
    const btn = document.querySelector(`#checkoutPaymentOptions .wallet-btn[data-pay="${payId}"]`);
    if (btn) btn.classList.add('selected');

    const instr = document.getElementById('paymentInstructions');
    if (group === 'YE') {
        const wallet = YE_PAYMENTS.find(w => w.id === payId);
        if (payId === 'cod') {
            instr.textContent = '💵 ' + t('codNote');
        } else {
            instr.textContent = `📱 ${t('payWalletNote')}\n1. ${t('walletStep1')} (${appSettings.lang === 'ar' ? wallet.nameAr : wallet.nameEn})\n2. ${t('walletStep2')}\n3. ${t('walletStep3')}: ${wallet.number}`;
        }
    } else {
        instr.textContent = '🔒 ' + t('payIntlNote');
    }
    instr.style.display = 'block';
}

function getCheckoutShippingCost() {
    const country = document.getElementById('coCountry').value;
    const opts = SHIPPING_OPTIONS[country] || SHIPPING_OPTIONS.INTL;
    const opt = opts.find(o => o.id === checkoutState.shippingId) || opts[0];
    return opt.costUSD;
}

function renderCheckoutPriceSummary() {
    const box = document.getElementById('checkoutPriceSummary');
    if (!box) return;
    const subtotal = cartSubtotal();
    const discount = appliedCoupon ? subtotal * appliedCoupon.discount / 100 : 0;
    const shipping = getCheckoutShippingCost();
    const total = subtotal - discount + shipping;
    box.innerHTML = `
        <div class="summary-line"><span>${t('subtotal')}</span><strong>${formatPrice(subtotal)}</strong></div>
        ${appliedCoupon ? `<div class="summary-line" style="color:var(--accent-green);"><span>${t('discount')} (${appliedCoupon.code})</span><strong>-${formatPrice(discount)}</strong></div>` : ''}
        <div class="summary-line"><span>${t('shipping')}</span><strong>${formatPrice(shipping)}</strong></div>
        <hr style="border-color:var(--border-gold);margin:0.5rem 0;">
        <div class="summary-line summary-total"><span>${t('total')}</span><span>${formatPrice(total)}</span></div>`;
}

// تقديم الطلب النهائي
function placeOrder() {
    if (cart.length === 0) { showToast(t('msgCartEmpty'), 'error'); return; }

    const name = document.getElementById('coName').value.trim();
    const phone = document.getElementById('coPhone').value.trim();
    const country = document.getElementById('coCountry').value;

    if (!name || !phone) { showToast(t('msgFillAll'), 'error'); return; }
    if (!/^[0-9+\s-]{7,15}$/.test(phone)) { showToast(t('msgInvalidPhone'), 'error'); return; }

    let address = {};
    if (country === 'YE') {
        const govIndex = document.getElementById('coGov').value;
        const district = document.getElementById('coDistrict').value;
        const street = document.getElementById('coStreet').value.trim();
        const landmark = document.getElementById('coLandmark').value.trim();
        if (govIndex === '' || !district || !street) { showToast(t('msgFillAll'), 'error'); return; }
        const gov = YEMEN_GOVS[govIndex];
        address = { country: 'YE', gov: appSettings.lang === 'ar' ? gov.ar : gov.en, district, street, landmark };
    } else {
        const city = document.getElementById('coCity').value.trim();
        const postal = document.getElementById('coPostal').value.trim();
        const street = document.getElementById('coStreet').value.trim();
        const countryName = country === 'INTL' ? document.getElementById('coCountryName').value.trim() : t('market' + country);
        if (!city || !postal || !street || !countryName) { showToast(t('msgFillAll'), 'error'); return; }
        address = { country, countryName, city, postal, street };
    }

    if (!checkoutState.shippingId) { showToast(t('msgSelectShipping'), 'error'); return; }
    if (!checkoutState.paymentId) { showToast(t('msgSelectPayment'), 'error'); return; }

    const subtotal = cartSubtotal();
    const discount = appliedCoupon ? subtotal * appliedCoupon.discount / 100 : 0;
    const shipping = getCheckoutShippingCost();
    const total = subtotal - discount + shipping;

    const order = {
        id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
        code: 'NYAR-' + String(orders.length + 1001),
        buyerId: currentUser ? currentUser.id : null,
        customerName: name,
        customerPhone: phone,
        address,
        market: country,
        items: cart.map(i => {
            const p = getProductById(i.productId);
            return { productId: i.productId, title: p ? p.title : '', icon: p ? p.icon : '📦', vendorId: p ? p.vendorId : null, price: p ? effectivePrice(p) : 0, quantity: i.quantity };
        }),
        subtotal: +subtotal.toFixed(2),
        discount: +discount.toFixed(2),
        shipping: +shipping.toFixed(2),
        total: +total.toFixed(2),
        currency: appSettings.currency,
        paymentMethod: checkoutState.paymentId,
        paymentStatus: checkoutState.paymentId === 'cod' ? 'cod' : 'pending',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    orders.push(order);
    cart = [];
    const usedCoupon = appliedCoupon;
    appliedCoupon = null;
    saveState();
    updateCartBadge();
    closeModal('checkoutModal');

    // رسالة النجاح مع تعليمات المحفظة اليمنية
    let extraHtml = '';
    const wallet = YE_PAYMENTS.find(w => w.id === order.paymentMethod);
    if (wallet && wallet.number) {
        extraHtml = `<hr><p style="color:#D4AF37;font-weight:800;">⚡ ${appSettings.lang === 'ar' ? 'تعليمات الدفع عبر' : 'Payment instructions via'} ${appSettings.lang === 'ar' ? wallet.nameAr : wallet.nameEn}:</p>
            <p>1. ${t('walletStep1')}</p>
            <p>2. ${t('walletStep2')}: <strong>${formatPrice(order.total)}</strong></p>
            <p>3. ${t('walletStep3')}: <strong style="color:#D4AF37;">${wallet.number}</strong></p>
            <p>4. ${t('walletStep4')}: <strong>${order.code}</strong></p>`;
    } else if (order.paymentMethod === 'cod') {
        extraHtml = `<p style="color:var(--accent-green);margin-top:0.5rem;">💵 ${t('codNote')}</p>`;
    } else {
        extraHtml = `<p style="color:var(--accent-green);margin-top:0.5rem;">🔒 ${t('payIntlNote')}</p>`;
    }

    Swal.fire({
        title: '✅ ' + t('msgOrderPlaced'),
        html: `<div style="text-align:${appSettings.lang === 'ar' ? 'right' : 'left'};">
                <p><strong>${t('orderNumber')}:</strong> ${order.code}</p>
                <p><strong>${t('total')}:</strong> ${formatPrice(order.total)}</p>
                ${extraHtml}
               </div>`,
        icon: 'success',
        confirmButtonColor: '#D4AF37'
    });
    switchView('orders');
}

/* ============================================================
   12. طلبات المشتري
   ============================================================ */
function renderBuyerOrders() {
    const box = document.getElementById('buyerOrdersList');
    if (!box) return;
    // المشتري يرى طلباته؛ غير المسجل يرى آخر الطلبات من هذا الجهاز
    const myOrders = currentUser
        ? orders.filter(o => o.buyerId === currentUser.id || !o.buyerId)
        : orders;
    if (myOrders.length === 0) { box.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:2rem;">${t('msgNoOrders')}</p>`; return; }
    box.innerHTML = myOrders.slice().reverse().map(o => `
        <div class="admin-row">
            <div style="flex:1;min-width:220px;">
                <strong style="color:#D4AF37;">${o.code}</strong>
                <span class="status-pill ${o.status}" style="margin-inline-start:8px;">${orderStatusLabel(o.status)}</span>
                <br>
                <span style="color:var(--text-muted);font-size:12px;">
                    ${o.items.map(i => `${i.icon} ${esc(i.title)} ×${i.quantity}`).join(' · ')}
                </span><br>
                <span style="color:var(--text-dim);font-size:11px;">${new Date(o.createdAt).toLocaleDateString(appSettings.lang === 'ar' ? 'ar' : 'en')} · ${esc(o.address.gov || o.address.city || '')}</span>
            </div>
            <div style="text-align:end;">
                <strong style="color:#D4AF37;">${formatPrice(o.total)}</strong><br>
                <span class="status-pill ${o.paymentStatus === 'paid' ? 'paid' : (o.paymentStatus === 'cod' ? 'shipped' : 'pending')}">
                    ${o.paymentStatus === 'paid' ? t('stPaid') : (o.paymentStatus === 'cod' ? '💵 COD' : t('stPending'))}
                </span>
            </div>
        </div>`).join('');
}
