export const TASKS = {
  dog: {
    id: 'dog',
    area: 'Lakeside',
    areaZh: '湖畔区',
    title: 'Meet a Friendly Dog',
    titleZh: '友善的小狗',
    instruction: 'Say hello and gently pet the friendly dog together.',
    instructionZh: '一起向小狗打招呼，轻轻摸摸它。',
    points: 10,
    star: 'Kindness Star',
    starZh: '温柔之星',
    icon: 'paw',
    illustration: './assets/illustrations/task-dog.png'
  },
  flowers: {
    id: 'flowers',
    area: 'Garden',
    areaZh: '花园区',
    title: 'Water the Flowers',
    titleZh: '给花浇水',
    instruction: 'Give the garden flowers a little water together.',
    instructionZh: '一起为花园里的花浇一点水。',
    points: 10,
    star: 'Garden Star',
    starZh: '花园之星',
    icon: 'watering',
    illustration: './assets/illustrations/task-flowers.png'
  }
};

export const MOCK_OUTDOOR_STATUS = Object.freeze({
  temperatureCelsius: 24,
  steps: 3248,
  updatedAt: '10:24'
});

export const COMMUNITY_TEAMS = [
  { name: 'Maple Team', stars: 4 },
  { name: 'Lake Team', stars: 3 },
  { name: 'Bridge Team', stars: 2 }
];
