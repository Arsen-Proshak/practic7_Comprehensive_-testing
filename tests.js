'use strict';

/**
 * Набір ізольованих модульних тестів (Unit Assertions)
 * Не змінює DOM та не створює глобальних побічних ефектів
 */
function runUnitTests() {
  // 1. Тестування функції validateInput(value)
  console.assert(
    validateInput('JavaScript ES6+') === true,
    'Test 1.1 Failed: валідний непорожній рядок має повертати true'
  );
  console.assert(
    validateInput('') === false,
    'Test 1.2 Failed: порожній рядок має повертати false'
  );
  console.assert(
    validateInput('     ') === false,
    'Test 1.3 Failed: рядок лише з пробілів має повертати false'
  );
  console.assert(
    validateInput(null) === false && validateInput(12345) === false,
    'Test 1.4 Failed: некоректний тип даних (null/number) має повертати false'
  );

  // 2. Тестування функції isValidState(stateName)
  console.assert(
    isValidState('loading') === true && isValidState('empty') === true,
    'Test 2.1 Failed: системні стани loading та empty мають бути валідними'
  );
  console.assert(
    isValidState('unknown_state') === false && isValidState('') === false,
    'Test 2.2 Failed: неіснуючий або порожній стан має повертати false'
  );

  // 3. Тестування чистої функції фільтрації filterModulesList(list, query)
  const mockData = [
    { id: 1, tag: 'CSS', title: 'Design Tokens', description: 'Variables' },
    { id: 2, tag: 'JS', title: 'Screen States', description: 'Async UI' }
  ];

  console.assert(
    filterModulesList(mockData, 'tokens').length === 1,
    'Test 3.1 Failed: пошук за словом "tokens" має повертати 1 елемент'
  );
  console.assert(
    filterModulesList(mockData, '   ').length === 2,
    'Test 3.2 Failed: пошук із самими пробілами має повертати весь початковий список'
  );
  console.assert(
    filterModulesList(mockData, 'nonexistent_xyz').length === 0,
    'Test 3.3 Failed: неіснуючий запит має повертати порожній масив'
  );

  console.info('[QA] Усі модульні тести успішно пройдено!');
}

runUnitTests();