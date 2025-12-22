-- Исправление тестового шаблона открытки
-- Заменяем "ывавыаыава" на правильный текст с плейсхолдером

UPDATE CardTemplate 
SET 
  name = 'С днем рождения!',
  textTemplate = 'С днем рождения, {name}!
Пусть этот день будет ярким и незабываемым!',
  fontSize = 36,
  fontColor = '#FFFFFF',
  textX = 50,
  textY = 150
WHERE textTemplate = 'ывавыаыава' 
   OR textTemplate LIKE '%ывавыаыава%';

-- Проверяем результат
SELECT id, name, textTemplate, fontSize, fontColor, textX, textY 
FROM CardTemplate 
WHERE textTemplate LIKE '%{name}%';