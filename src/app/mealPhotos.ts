import type { Meal } from './data';

export type MealPhoto = {
  url: string;
  alt: string;
  source: string;
  credit?: string;
  match: 'exact' | 'close';
};

export const mealPhotoRegistry: Record<string, MealPhoto> = {
  efr: {
    url: 'https://images.unsplash.com/photo-1578160112054-954a67602b88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Egg Fried Rice',
    source: 'Unsplash',
    match: 'close',
  },
  csf: {
    url: 'https://images.unsplash.com/photo-1628025114288-1693ac3bcac1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Chicken Stir Fry',
    source: 'Unsplash',
    match: 'close',
  },
  pp: {
    url: 'https://images.unsplash.com/photo-1649952399680-21b9f6aceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Pasta Primavera',
    source: 'Unsplash',
    match: 'close',
  },
  sal: {
    url: 'https://images.unsplash.com/photo-1614627293113-e7e68163d958?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Lemon Salmon',
    source: 'Unsplash',
    match: 'close',
  },
  'veg-omelette': {
    url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Veggie Omelette',
    source: 'Unsplash',
    match: 'close',
  },
  'berry-smoothie': {
    url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Berry Power Smoothie',
    source: 'Unsplash',
    match: 'close',
  },
  'tomato-soup': {
    url: 'https://images.unsplash.com/photo-1620791144170-8a443bf37a33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Tomato Basil Soup',
    source: 'Unsplash',
    match: 'close',
  },
  'yogurt-parfait': {
    url: 'https://images.unsplash.com/photo-1550594645-25c5bd703258?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Berry Yogurt Parfait',
    source: 'Unsplash',
    match: 'close',
  },
  'salmon-tacos': {
    url: 'https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Salmon Tacos',
    source: 'Unsplash',
    match: 'close',
  },
  'broccoli-cheddar-soup': {
    url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Broccoli Cheddar Soup',
    source: 'Unsplash',
    match: 'close',
  },
  'veggie-stir-fry': {
    url: 'https://images.unsplash.com/photo-1634864572865-1cf8ff8bd23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Rainbow Veggie Stir Fry',
    source: 'Unsplash',
    match: 'close',
  },
  'quick-carbonara': {
    url: 'https://images.unsplash.com/photo-1633337474564-1d9478ca4e2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Quick Carbonara',
    source: 'Unsplash',
    match: 'close',
  },
  'coconut-curry': {
    url: 'https://images.unsplash.com/photo-1708782344490-9026aaa5eec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Coconut Curry Chicken',
    source: 'Unsplash',
    match: 'close',
  },
  'med-bowl': {
    url: 'https://images.unsplash.com/photo-1673960802455-ec189a6207e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Mediterranean Power Bowl',
    source: 'Unsplash',
    match: 'close',
  },
  'honey-mustard-chicken': {
    url: 'https://images.unsplash.com/photo-1668838195568-6a336797587f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Honey Mustard Chicken',
    source: 'Unsplash',
    match: 'close',
  },
  frittata: {
    url: 'https://images.unsplash.com/photo-1646579933415-92109f9805df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80',
    alt: 'Garden Frittata',
    source: 'Unsplash',
    match: 'close',
  },
  'cm-italian-spaghetti-bolognese': {
    url: 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg',
    alt: 'Spaghetti Bolognese',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-mexican-migas': {
    url: 'https://www.themealdb.com/images/media/meals/xd9aj21740432378.jpg',
    alt: 'Migas',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-thai-pad-thai': {
    url: 'https://www.themealdb.com/images/media/meals/rg9ze01763479093.jpg',
    alt: 'Pad Thai',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-thai-tom-kha-gai': {
    url: 'https://www.themealdb.com/images/media/meals/ol2xxt1763582263.jpg',
    alt: 'Tom Kha Gai',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-thai-pad-see-ew': {
    url: 'https://www.themealdb.com/images/media/meals/uuuspp1468263334.jpg',
    alt: 'Pad See Ew',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-japanese-sesame-cucumber-salad': {
    url: 'https://www.themealdb.com/images/media/meals/93iok31766436070.jpg',
    alt: 'Sesame Cucumber Salad',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-mediterranean-moussaka': {
    url: 'https://www.themealdb.com/images/media/meals/ctg8jd1585563097.jpg',
    alt: 'Moussaka',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-mediterranean-shakshuka': {
    url: 'https://www.themealdb.com/images/media/meals/g373701551450225.jpg',
    alt: 'Shakshuka',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-american-clam-chowder': {
    url: 'https://www.themealdb.com/images/media/meals/rvtvuw1511190488.jpg',
    alt: 'Clam Chowder',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-indian-lamb-rogan-josh': {
    url: 'https://www.themealdb.com/images/media/meals/vvstvq1487342592.jpg',
    alt: 'Lamb Rogan Josh',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-indian-tandoori-chicken': {
    url: 'https://www.themealdb.com/images/media/meals/qptpvt1487339892.jpg',
    alt: 'Tandoori Chicken',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-chinese-kung-pao-chicken': {
    url: 'https://www.themealdb.com/images/media/meals/1525872624.jpg',
    alt: 'Kung Pao Chicken',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-chinese-hot-and-sour-soup': {
    url: 'https://www.themealdb.com/images/media/meals/1529445893.jpg',
    alt: 'Hot and Sour Soup',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-chinese-egg-drop-soup': {
    url: 'https://www.themealdb.com/images/media/meals/1529446137.jpg',
    alt: 'Egg Drop Soup',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-chinese-egg-foo-young': {
    url: 'https://www.themealdb.com/images/media/meals/47y6ii1765658818.jpg',
    alt: 'Egg Foo Young',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-french-coq-au-vin': {
    url: 'https://www.themealdb.com/images/media/meals/qstyvs1505931190.jpg',
    alt: 'Coq au Vin',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-french-beef-bourguignon': {
    url: 'https://www.themealdb.com/images/media/meals/vtqxtu1511784197.jpg',
    alt: 'Beef Bourguignon',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-french-ratatouille': {
    url: 'https://www.themealdb.com/images/media/meals/wrpwuu1511786491.jpg',
    alt: 'Ratatouille',
    source: 'TheMealDB',
    match: 'exact',
  },
  'cm-french-french-onion-soup': {
    url: 'https://www.themealdb.com/images/media/meals/xvrrux1511783685.jpg',
    alt: 'French Onion Soup',
    source: 'TheMealDB',
    match: 'exact',
  },
};

export function getMealPhoto(meal: Meal): MealPhoto | null {
  return mealPhotoRegistry[meal.id] ?? null;
}
