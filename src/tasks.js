export const DEFAULT_REGION_ID = 'lakeside';

// The paper map remains the source for broad navigation. These are the
// simulated phone regions used when a team reaches a new part of the park.
export const REGIONS = Object.freeze({
  lakeside: {
    id: 'lakeside',
    area: 'Lakeside',
    areaZh: '湖畔区',
    mapZones: ['Pet Zone', 'Gardening Zone', 'Touch Spot']
  },
  south: {
    id: 'south',
    area: 'Music Meadow',
    areaZh: '音乐草地',
    mapZones: ['Amphitheatre', 'Rest Zone']
  },
  east: {
    id: 'east',
    area: 'Discovery Garden',
    areaZh: '探索花园',
    mapZones: ['VR Zone', 'Drawing Zone', 'Kids Zone']
  }
});

export const TASKS = Object.freeze({
  dog: {
    id: 'dog',
    kind: 'task',
    regionId: DEFAULT_REGION_ID,
    area: 'Pet Zone',
    areaZh: '宠物区',
    title: 'Meet a Friendly Dog',
    titleZh: '友善的小狗',
    instruction: 'Say hello and gently pet the friendly dog together.',
    instructionZh: '一起向小狗打招呼，轻轻摸摸它。',
    points: 10,
    star: 'Kindness Star',
    starZh: '温柔之星',
    icon: 'dog',
    illustration: './assets/illustrations/task-dog.png'
  },
  flowers: {
    id: 'flowers',
    kind: 'task',
    regionId: DEFAULT_REGION_ID,
    area: 'Gardening Zone',
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
  },
  'staff-hug': {
    id: 'staff-hug',
    kind: 'task',
    regionId: DEFAULT_REGION_ID,
    area: 'Touch Spot',
    areaZh: '问候点',
    title: 'Hug a Staff Friend',
    titleZh: '和工作人员抱抱',
    instruction: 'Share a warm hello and a hug with an activity staff member.',
    instructionZh: '和活动工作人员打个招呼，给彼此一个拥抱。',
    points: 12,
    star: 'Warmth Star',
    starZh: '温暖之星',
    icon: 'pair',
    illustration: './assets/illustrations/task-staff-hug.png'
  },
  'tree-hug': {
    id: 'tree-hug',
    kind: 'task',
    regionId: 'south',
    area: 'Rest Zone',
    areaZh: '休息区',
    title: 'Hug a Big Tree',
    titleZh: '抱抱大树',
    instruction: 'Find a big tree and give it a gentle team hug.',
    instructionZh: '找到一棵大树，和它来一个温柔的拥抱。',
    points: 12,
    star: 'Forest Star',
    starZh: '森林之星',
    icon: 'tree',
    illustration: './assets/illustrations/task-tree-hug.png'
  },
  concert: {
    id: 'concert',
    kind: 'task',
    regionId: 'south',
    area: 'Amphitheatre',
    areaZh: '音乐剧场',
    title: "Hear Momo-san's Little Concert",
    titleZh: '听一次小桃桑的音乐会',
    instruction: "Take a seat and listen to Momo-san's little park concert.",
    instructionZh: '坐下来，听一次小桃桑的公园音乐会。',
    points: 15,
    star: 'Music Star',
    starZh: '音乐之星',
    icon: 'music',
    illustration: './assets/illustrations/task-concert.png'
  },
  'tree-rest': {
    id: 'tree-rest',
    kind: 'task',
    regionId: 'south',
    area: 'Rest Zone',
    areaZh: '休息区',
    title: 'Rest Under a Big Tree',
    titleZh: '在大树下休息五分钟',
    instruction: 'Lie down under a big tree and rest for five quiet minutes.',
    instructionZh: '在大树下躺下来，安静休息五分钟。',
    points: 12,
    star: 'Breeze Star',
    starZh: '微风之星',
    icon: 'walk',
    illustration: './assets/illustrations/task-tree-rest.png'
  },
  vr: {
    id: 'vr',
    kind: 'task',
    regionId: 'east',
    area: 'VR Zone',
    areaZh: 'VR体验区',
    title: 'Try a VR Adventure',
    titleZh: '体验一次 VR',
    instruction: 'Put on the headset and take one playful journey in VR.',
    instructionZh: '戴上设备，体验一次轻松有趣的 VR。',
    points: 15,
    star: 'Wonder Star',
    starZh: '奇想之星',
    icon: 'sparkle',
    illustration: './assets/illustrations/task-vr.png'
  },
  'plant-drawing': {
    id: 'plant-drawing',
    kind: 'task',
    regionId: 'east',
    area: 'Drawing Zone',
    areaZh: '绘画区',
    title: 'Draw a Little Plant',
    titleZh: '画一株植物',
    instruction: 'Draw one little plant and leave it on the activity wall.',
    instructionZh: '画一株小小的植物，留在活动画板上。',
    points: 12,
    star: 'Imagination Star',
    starZh: '想象之星',
    icon: 'flower',
    illustration: './assets/illustrations/task-plant-drawing.png'
  },
  seesaw: {
    id: 'seesaw',
    kind: 'task',
    regionId: 'east',
    area: 'Kids Zone',
    areaZh: '儿童区',
    title: 'Play Seesaw Together',
    titleZh: '和小朋友一起玩翘翘板',
    instruction: 'Take turns and share a happy seesaw ride with the children.',
    instructionZh: '和小朋友轮流玩一次开心的翘翘板。',
    points: 12,
    star: 'Play Star',
    starZh: '玩耍之星',
    icon: 'pair',
    illustration: './assets/illustrations/task-seesaw.png'
  }
});

const EGG_REGIONS = Object.values(REGIONS);
export const EGG_TASKS = Object.freeze(Object.fromEntries(
  EGG_REGIONS.flatMap((region, index) => {
    const count = 2;
    return Array.from({ length: count }, (_, eggIndex) => {
      const id = `egg-${region.id}-${eggIndex + 1}`;
      return [id, {
        id,
        kind: 'egg',
        regionId: region.id,
        area: region.area,
        areaZh: region.areaZh,
        title: 'Find a Hidden Egg',
        titleZh: '寻找彩蛋',
        instruction: 'Follow the signal, find the hidden NFC egg, and let its Star join your sky.',
        instructionZh: '跟着探测信号找到藏起来的 NFC 彩蛋，再让它的星星加入你们的星空。',
        points: 8,
        star: 'Discovery Star',
        starZh: '发现之星',
        icon: 'egg',
        eggNumber: eggIndex + 1,
        illustration: './assets/illustrations/task-egg.png',
        label: `Egg ${index + 1}-${eggIndex + 1}`
      }];
    });
  })
));

export const ALL_TASKS = Object.freeze({ ...TASKS, ...EGG_TASKS });

export function getTasksForRegion(regionId = DEFAULT_REGION_ID) {
  return Object.values(ALL_TASKS).filter(task => task.regionId === regionId);
}

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
