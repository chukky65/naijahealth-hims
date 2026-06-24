import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "myPortal": "My Portal",
        "appointments": "Appointments",
        "billing": "Billing",
        "departments": "Departments",
        "pharmacy": "Pharmacy",
        "patients": "Patients",
        "staff": "Staff",
        "analytics": "AI & Analytics",
        "auditLog": "Audit Log",
        "settings": "Settings",
        "commandCenter": "Command Center",
        "darkMode": "Dark Mode",
        "lightMode": "Light Mode",
        "signOut": "Sign Out"
      },
      "appointments": {
        "title": "Appointments",
        "subtitle": "Schedule and manage patient visits.",
        "newAppointment": "New Appointment",
        "calendar": "Calendar",
        "scheduleFor": "Schedule for",
        "noAppointments": "No appointments scheduled for this day.",
        "failedToLoad": "Failed to load appointments."
      },
      "patients": {
        "title": "Patient Registry",
        "subtitle": "Manage patient flow, medical history, and records.",
        "export": "Export Report",
        "addPatient": "Add Patient",
        "activeInpatients": "Active Inpatients",
        "outpatientQueue": "Outpatient Queue",
        "criticalEmergency": "Critical / Emergency",
        "recentRegistry": "Recent Patient Registry",
        "searchPlaceholder": "Search patients..."
      },
      "billing": {
        "title": "Billing & Claims",
        "subtitle": "Manage patient invoices, payments, and NHIA claims.",
        "export": "Export",
        "newInvoice": "New Invoice",
        "totalOutstanding": "Total Outstanding",
        "pendingClaims": "Pending NHIA Claims",
        "revenue": "Revenue Today",
        "invoiceId": "Invoice ID",
        "patient": "Patient",
        "date": "Date",
        "amount": "Amount",
        "type": "Type",
        "status": "Status"
      },
      "dashboard": {
        "title": "Executive Dashboard",
        "subtitle": "Overview of NaijaHealth Hospital operations and AI insights.",
        "totalPatients": "Total Patients Today",
        "avgWaitTime": "Avg Wait Time",
        "bedOccupancy": "Bed Occupancy",
        "criticalAlerts": "Critical Alerts",
        "requiresImmediate": "Requires immediate action",
        "depPatientVol": "Departmental Patient Volume",
        "aiIntelligence": "AI Intelligence Layer",
        "active": "Active",
        "restricted": "Detailed performance analytics require executive access."
      }
    }
  },
  pcm: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "myPortal": "My Area",
        "appointments": "Appointments",
        "billing": "Money Mata",
        "departments": "Departments",
        "pharmacy": "Drug Store",
        "patients": "Patients",
        "staff": "Workers",
        "analytics": "AI & See Far",
        "auditLog": "History Book",
        "settings": "Settings",
        "commandCenter": "Main Base",
        "darkMode": "Dark Mode",
        "lightMode": "Light Mode",
        "signOut": "Comot"
      },
      "appointments": {
        "title": "Appointments",
        "subtitle": "Arrange and manage patient visit.",
        "newAppointment": "New Appointment",
        "calendar": "Calendar",
        "scheduleFor": "Schedule for",
        "noAppointments": "No appointment for this day.",
        "failedToLoad": "E fail to load appointments."
      },
      "patients": {
        "title": "Patient Book",
        "subtitle": "See how patients dey move, their sickness history, and details.",
        "export": "Download Book",
        "addPatient": "Add Patient",
        "activeInpatients": "Patients inside Hospital",
        "outpatientQueue": "Patients Wey Dey Wait",
        "criticalEmergency": "Emergency / Serious",
        "recentRegistry": "New Patients",
        "searchPlaceholder": "Find patient..."
      },
      "billing": {
        "title": "Billing & Claims",
        "subtitle": "Manage patient money, payment, and NHIA claims.",
        "export": "Export",
        "newInvoice": "New Invoice",
        "totalOutstanding": "Money wey remain",
        "pendingClaims": "Pending NHIA Claims",
        "revenue": "Money for Today",
        "invoiceId": "Invoice ID",
        "patient": "Patient",
        "date": "Date",
        "amount": "Amount",
        "type": "Type",
        "status": "Status"
      },
      "dashboard": {
        "title": "Oga Dashboard",
        "subtitle": "See how NaijaHealth Hospital dey run and AI advice.",
        "totalPatients": "All Patients Today",
        "avgWaitTime": "Waiting Time",
        "bedOccupancy": "Bed space wey full",
        "criticalAlerts": "Danger Alerts",
        "requiresImmediate": "E need action now now",
        "depPatientVol": "Patients per Department",
        "aiIntelligence": "AI Sense Level",
        "active": "Dey Work",
        "restricted": "Na only oga dem fit see this one."
      }
    }
  },
  ha: {
    translation: {
      "nav": {
        "dashboard": "Allon Gudanarwa",
        "myPortal": "Wajena",
        "appointments": "Ganawa",
        "billing": "Kudi",
        "departments": "Sashe-Sashe",
        "pharmacy": "Kantin Magani",
        "patients": "Marasa Lafiya",
        "staff": "Ma'aikata",
        "analytics": "AI & Bincike",
        "auditLog": "Tarihin Ayyuka",
        "settings": "Saituna",
        "commandCenter": "Cibiyar Kula",
        "darkMode": "Yanayin Duhu",
        "lightMode": "Yanayin Haske",
        "signOut": "Fita"
      },
      "appointments": {
        "title": "Ganawa",
        "subtitle": "Tsara da gudanar da ziyarar marasa lafiya.",
        "newAppointment": "Sabon Ganawa",
        "calendar": "Kalandar",
        "scheduleFor": "Tsari don",
        "noAppointments": "Babu ganawa a wannan ranar.",
        "failedToLoad": "An kasa loda ganawa."
      },
      "patients": {
        "title": "Rijistar Marasa Lafiya",
        "subtitle": "Kula da shige da ficen marasa lafiya da tarihin lafiyarsu.",
        "export": "Fitar da Rahoto",
        "addPatient": "Saka Mara Lafiya",
        "activeInpatients": "Masu Kwanciya a Asibiti",
        "outpatientQueue": "Masu Jiran Ganin Likita",
        "criticalEmergency": "Gaggawa",
        "recentRegistry": "Rijistar Marasa Lafiya na Baya-Bayan Nan",
        "searchPlaceholder": "Nemi mara lafiya..."
      },
      "billing": {
        "title": "Kudi & Karbar Bashi",
        "subtitle": "Kula da rasit din marasa lafiya, biya, da kudaden NHIA.",
        "export": "Fitar",
        "newInvoice": "Sabon Rasit",
        "totalOutstanding": "Jimlar Bashi",
        "pendingClaims": "Kudaden NHIA na jiran biya",
        "revenue": "Kudaden Yau",
        "invoiceId": "Lambar Rasit",
        "patient": "Mara Lafiya",
        "date": "Rana",
        "amount": "Kudi",
        "type": "Iri",
        "status": "Matsayi"
      },
      "dashboard": {
        "title": "Allon Gudanarwa",
        "subtitle": "Bayani akan ayyukan asibitin NaijaHealth da basirar AI.",
        "totalPatients": "Jimlar Marasa Lafiya Yau",
        "avgWaitTime": "Matsakaicin Lokacin Jira",
        "bedOccupancy": "Cikowar Gado",
        "criticalAlerts": "Muhimman Gargadi",
        "requiresImmediate": "Yana bukatar daukar mataki nan take",
        "depPatientVol": "Yawan Marasa Lafiya a Sashe",
        "aiIntelligence": "Basirar AI",
        "active": "Mai aiki",
        "restricted": "Kawai shugabanni ne zasu iya ganin wannan."
      }
    }
  },
  yo: {
    translation: {
      "nav": {
        "dashboard": "Agbegbe Alakoso",
        "myPortal": "Aaye Mi",
        "appointments": "Ipade",
        "billing": "Owó",
        "departments": "Awon Eka",
        "pharmacy": "Ile Oogun",
        "patients": "Awon Alaisan",
        "staff": "Awon Osise",
        "analytics": "AI & Itupale",
        "auditLog": "Iwe Iroyin",
        "settings": "Eto",
        "commandCenter": "Agbegbe Iṣakoso",
        "darkMode": "Ipo Okunkun",
        "lightMode": "Ipo Imole",
        "signOut": "Jade"
      },
      "appointments": {
        "title": "Ipade",
        "subtitle": "Ṣeto ati ṣakoso awọn abẹwo alaisan.",
        "newAppointment": "Ipade Tuntun",
        "calendar": "Kàlẹndà",
        "scheduleFor": "Iṣeto fun",
        "noAppointments": "Ko si ipade ti a ṣeto fun ọjọ yii.",
        "failedToLoad": "Kuna lati fifuye awọn ipade."
      },
      "patients": {
        "title": "Iforukọsilẹ Alaisan",
        "subtitle": "Ṣakoso bi awọn alaisan ṣe wọle, itan iṣoogun, ati awọn igbasilẹ.",
        "export": "Ṣe igbasilẹ Iroyin",
        "addPatient": "Fi Alaisan Kun",
        "activeInpatients": "Awọn alaisan ti o wa ninu ile iwosan",
        "outpatientQueue": "Awọn Alaisan ti Nreti",
        "criticalEmergency": "Pajawiri",
        "recentRegistry": "Iforukọsilẹ Alaisan Tuntun",
        "searchPlaceholder": "Wa alaisan..."
      },
      "billing": {
        "title": "Isanwo & Ibere Owó",
        "subtitle": "Ṣakoso awọn iwe isanwo alaisan, isanwo, ati awọn ibeere NHIA.",
        "export": "Firanṣẹ",
        "newInvoice": "Iwe Isanwo Tuntun",
        "totalOutstanding": "Apapo Owo ti o ku",
        "pendingClaims": "Awọn ibeere NHIA ti n reti",
        "revenue": "Owo Tita Loni",
        "invoiceId": "Nọmba Iwe Isanwo",
        "patient": "Alaisan",
        "date": "Ọjọ",
        "amount": "Iye owo",
        "type": "Iru",
        "status": "Ipo"
      },
      "dashboard": {
        "title": "Agbegbe Alakoso",
        "subtitle": "Akojopo bi ile iwosan NaijaHealth se n sise ati ogbon AI.",
        "totalPatients": "Apapo Awon Alaisan Loni",
        "avgWaitTime": "Akoko Iduro",
        "bedOccupancy": "Aaye Ibusun",
        "criticalAlerts": "Ikilo Pataki",
        "requiresImmediate": "O nilo igbese lẹsẹkẹsẹ",
        "depPatientVol": "Iye Alaisan Ni Eka Kan",
        "aiIntelligence": "Ogbon AI",
        "active": "Nṣiṣẹ",
        "restricted": "Awon oga nikan lo le ri eyi."
      }
    }
  },
  ig: {
    translation: {
      "nav": {
        "dashboard": "Ihu Nchịkwa",
        "myPortal": "Ebe M",
        "appointments": "Ọmụma",
        "billing": "Ụgwọ",
        "departments": "Ngalaba",
        "pharmacy": "Ụlọ Ọgwụ",
        "patients": "Ndị Ọrịa",
        "staff": "Ndị Ọrụ",
        "analytics": "AI & Nnyocha",
        "auditLog": "Akụkọ Ihe Mere Eme",
        "settings": "Nhazi",
        "commandCenter": "Ebe Isi Nchịkwa",
        "darkMode": "Ọnọdụ Ọchịchịrị",
        "lightMode": "Ọnọdụ Ìhè",
        "signOut": "Pụọ"
      },
      "appointments": {
        "title": "Ọmụma",
        "subtitle": "Hazie ma jikwaa nleta ndị ọrịa.",
        "newAppointment": "Ọmụma Ọhụrụ",
        "calendar": "Kalenda",
        "scheduleFor": "Usoro maka",
        "noAppointments": "Enweghị ọmụma akwadoro maka ụbọchị a.",
        "failedToLoad": "Ọ kụrụ afọ n'ala ibu ọmụma."
      },
      "patients": {
        "title": "Ndebanye Aha Onye Ọrịa",
        "subtitle": "Jikwaa ngagharị onye ọrịa, akụkọ ihe mere eme ahụike, na ndekọ.",
        "export": "Bupụ Akụkọ",
        "addPatient": "Tinye Onye Ọrịa",
        "activeInpatients": "Ndị Ọrịa nọ n'ụlọ ọgwụ",
        "outpatientQueue": "Ndị Ọrịa Na-eche",
        "criticalEmergency": "Ọnọdụ Mberede",
        "recentRegistry": "Ndebanye Aha Ndị Ọrịa Ọhụrụ",
        "searchPlaceholder": "Chọọ onye ọrịa..."
      },
      "billing": {
        "title": "Nkwụghachi & Azịza",
        "subtitle": "Jikwaa akwụkwọ ọnụahịa onye ọrịa, ịkwụ ụgwọ, na nkwụghachi NHIA.",
        "export": "Zipu",
        "newInvoice": "Akwụkwọ Ọnụahịa Ọhụrụ",
        "totalOutstanding": "Mkpokọta Ego Fọdụrụ",
        "pendingClaims": "Akwụkwọ nkwụghachi NHIA Na-echere",
        "revenue": "Ego Taa",
        "invoiceId": "Akaụntụ Ọnụahịa",
        "patient": "Onye Ọrịa",
        "date": "Ụbọchị",
        "amount": "Ego",
        "type": "Ụdị",
        "status": "Ọkwa"
      },
      "dashboard": {
        "title": "Ihu Nchịkwa",
        "subtitle": "Nchịkọta otu ụlọ ọgwụ NaijaHealth si arụ ọrụ na amamihe AI.",
        "totalPatients": "Ndị Ọrịa Nile Taa",
        "avgWaitTime": "Oge Nchere",
        "bedOccupancy": "Ihe Nndina",
        "criticalAlerts": "Ịdọ Aka ná Ntị Dị Mkpa",
        "requiresImmediate": "Chọrọ ime ihe ngwa ngwa",
        "depPatientVol": "Ọnụọgụ Ndị Ọrịa Na Ngalaba",
        "aiIntelligence": "Amamihe AI",
        "active": "Na-arụ ọrụ",
        "restricted": "Naanị ndị isi nwere ike ịhụ nke a."
      }
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use
    fallbackLng: "en",

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
