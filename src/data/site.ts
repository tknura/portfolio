export const site = {
  name: 'Tomasz Knura',
  title: 'Who the f*** is Tomasz Knura? (dev)',
  description:
    'Frontend engineer. Design-minded. A little too invested in how that button feels. Meet Tomasz Knura through work and interactive experiments.',
  themeColor: '#e3e7e9',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap',
} as const;

export const navigation = [
  { href: '#work', label: 'The work', index: '01' },
  { href: '#play', label: 'The playground', index: '02' },
  { href: '#about', label: 'The human', index: '03' },
] as const;
