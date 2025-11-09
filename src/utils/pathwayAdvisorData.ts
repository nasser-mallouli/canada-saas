export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea',
  'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
  'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

export const EDUCATION_LEVELS = [
  { value: 'Less than High School', label: 'Less than High School / Secondary School' },
  { value: 'High School', label: 'High School Diploma / Secondary School' },
  { value: 'Certificate', label: 'Certificate / Diploma (1 year)' },
  { value: 'Diploma', label: 'Diploma (2 years)' },
  { value: 'Advanced Diploma', label: 'Advanced Diploma / Associate Degree (3 years)' },
  { value: 'Bachelor', label: 'Bachelor\'s Degree (3-4 years)' },
  { value: 'Post-Graduate Diploma', label: 'Post-Graduate Diploma / Certificate' },
  { value: 'Master', label: 'Master\'s Degree' },
  { value: 'PhD', label: 'Doctoral Degree (PhD)' },
  { value: 'Professional Degree', label: 'Professional Degree (MD, JD, DDS, etc.)' }
];

export const FIELDS_OF_STUDY = [
  'Accounting', 'Actuarial Science', 'Aerospace Engineering', 'Agriculture', 'Anthropology', 'Architecture',
  'Art and Design', 'Artificial Intelligence', 'Automotive Engineering', 'Aviation', 'Biochemistry', 'Biology',
  'Biomedical Engineering', 'Biotechnology', 'Business Administration', 'Business Analytics', 'Chemical Engineering',
  'Chemistry', 'Civil Engineering', 'Communications', 'Computer Engineering', 'Computer Science', 'Construction Management',
  'Criminology', 'Culinary Arts', 'Cybersecurity', 'Data Science', 'Dentistry', 'Economics', 'Education',
  'Electrical Engineering', 'Electronics', 'Energy Engineering', 'Environmental Science', 'Fashion Design', 'Film and Media',
  'Finance', 'Food Science', 'Forestry', 'Game Development', 'Genetics', 'Geography', 'Geology', 'Graphic Design',
  'Health Administration', 'History', 'Hospitality Management', 'Human Resources', 'Industrial Engineering', 'Information Technology',
  'Interior Design', 'International Relations', 'Journalism', 'Kinesiology', 'Law', 'Library Science', 'Linguistics',
  'Management', 'Marine Biology', 'Marketing', 'Mathematics', 'Mechanical Engineering', 'Medical Laboratory Technology',
  'Medicine', 'Meteorology', 'Microbiology', 'Music', 'Nanotechnology', 'Nursing', 'Nutrition', 'Occupational Therapy',
  'Operations Management', 'Optometry', 'Petroleum Engineering', 'Pharmacy', 'Philosophy', 'Physical Therapy', 'Physics',
  'Political Science', 'Project Management', 'Psychology', 'Public Administration', 'Public Health', 'Public Relations',
  'Radiology', 'Real Estate', 'Renewable Energy', 'Robotics', 'Social Work', 'Sociology', 'Software Engineering',
  'Sports Management', 'Statistics', 'Supply Chain Management', 'Telecommunications', 'Theater', 'Tourism', 'Translation',
  'Urban Planning', 'Veterinary Medicine', 'Web Development', 'Wildlife Management', 'Other'
];

export const PATHWAY_GOALS = [
  {
    id: 'study',
    emoji: '🎓',
    label: 'Study in Canada',
    description: 'Get a study permit for college or university'
  },
  {
    id: 'work',
    emoji: '💼',
    label: 'Work Temporarily',
    description: 'Work permit with a job offer'
  },
  {
    id: 'pr',
    emoji: '🏠',
    label: 'Immigrate Permanently (PR)',
    description: 'Permanent residence through Express Entry or PNP'
  },
  {
    id: 'quebec',
    emoji: '🇫🇷',
    label: 'Move to Quebec',
    description: 'Quebec-specific immigration programs'
  },
  {
    id: 'citizenship',
    emoji: '🍁',
    label: 'Become a Citizen',
    description: 'For current permanent residents'
  },
  {
    id: 'all',
    emoji: '🔍',
    label: 'Explore All Options',
    description: 'Not sure yet, show me everything'
  }
];

export const LANGUAGE_TESTS = {
  english: [
    { value: 'IELTS Academic', label: 'IELTS Academic (for Study)' },
    { value: 'IELTS General', label: 'IELTS General Training (for PR/Work)' },
    { value: 'CELPIP', label: 'CELPIP General' },
    { value: 'TOEFL', label: 'TOEFL iBT' },
    { value: 'PTE', label: 'PTE Academic' }
  ],
  french: [
    { value: 'TEF', label: 'TEF Canada' },
    { value: 'TCF', label: 'TCF Canada' }
  ]
};

export const MARITAL_STATUS = ['Single', 'Married', 'Common-law', 'Divorced', 'Widowed'];

export const CANADIAN_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

export const FRENCH_LEVELS = [
  { value: 'None', label: 'No French Knowledge' },
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate (Required for Quebec)' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Proficient' }
];
