
import { Scene } from './types';

export const INITIAL_SCENES: Record<string, Scene> = {
  welcome: {
    id: 'welcome',
    title: 'Внезапный дохoд',
    description: 'Вы просыпаетесь и видите SMS: на ваш счет поступило 500 000 рублей. Неизвестный перевод. Ваша первая мысль в теле?',
    choices: [
      { id: 'c1', text: 'Ой, ошибка! Надо вернуть, а то накажут.', feedback: 'За этим может стоять страх наказания за успех.', beliefKey: 'fear_of_punishment', nextSceneId: 'dinner' },
      { id: 'c2', text: 'Ух ты! Наконец-то я куплю то, что хотел(а)!', feedback: 'Радость — это хорошо, но нет ли в этом импульсивного слива ресурса?', beliefKey: 'impulse_spend', nextSceneId: 'dinner' },
      { id: 'c3', text: 'Тихо, никому не скажу. Деньги любят тишину.', feedback: 'Убеждение, что деньги — это опасность, которую нужно скрывать.', beliefKey: 'money_is_danger', nextSceneId: 'dinner' }
    ]
  },
  dinner: {
    id: 'dinner',
    title: 'Ужин с критиком',
    description: 'Вы в ресторане. Ваш близкий человек говорит: "Честным трудом больших денег не заработаешь. Все богачи — воры".',
    choices: [
      { id: 'd1', text: 'Согласиться: "Да, ты прав, лучше быть бедным, но честным".', feedback: 'Ложная связка "Бедность = Порядочность".', beliefKey: 'poverty_is_virtue', nextSceneId: 'promotion' },
      { id: 'd2', text: 'Промолчать, чувствуя комок в горле.', feedback: 'Подавление своего права на достаток из-за страха конфликта.', beliefKey: 'fear_of_conflict', nextSceneId: 'promotion' },
      { id: 'd3', text: 'Спокойно сказать: "Деньги — это просто инструмент в руках человека".', feedback: 'Взрослая позиция и рефрейминг.', beliefKey: 'money_is_tool', nextSceneId: 'promotion' }
    ]
  },
  promotion: {
    id: 'promotion',
    title: 'Шанс на рост',
    description: 'Вам предлагают возглавить крупный проект с зарплатой в три раза выше текущей. Но ответственности тоже станет больше.',
    choices: [
      { id: 'p1', text: 'Отказаться: "Я еще не готов(а), мне нужно поучиться".', feedback: 'Классический синдром самозванца.', beliefKey: 'imposter_syndrome', nextSceneId: 'shopping' },
      { id: 'p2', text: 'Согласиться, но начать работать по 18 часов в сутки.', feedback: 'Установка "Деньги даются только тяжелым, изнурительным трудом".', beliefKey: 'hard_work_only', nextSceneId: 'shopping' },
      { id: 'p3', text: 'Согласиться и нанять помощников.', feedback: 'Навык делегирования и расширение финансовой емкости.', beliefKey: 'capacity_expansion', nextSceneId: 'shopping' }
    ]
  },
  shopping: {
    id: 'shopping',
    title: 'Покупка мечты',
    description: 'Вы заходите в дорогой бутик. Вам очень нравится вещь, она вам по карману, но на ценнике — сумма, которую ваши родители зарабатывали за полгода.',
    choices: [
      { id: 's1', text: 'Уйти: "Это слишком дорого, я не имею права так тратить".', feedback: 'Лояльность семейному сценарию дефицита.', beliefKey: 'family_loyalty', nextSceneId: 'end' },
      { id: 's2', text: 'Купить, но потом неделю корить себя за расточительство.', feedback: 'Токсичное чувство вины после получения удовольствия.', beliefKey: 'guilt_after_pleasure', nextSceneId: 'end' },
      { id: 's3', text: 'Купить и поблагодарить себя за этот подарок.', feedback: 'Разрешение себе иметь лучшее без чувства вины.', beliefKey: 'self_permission', nextSceneId: 'end' }
    ]
  }
};
