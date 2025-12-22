-- Расширяем таблицу BirthdayPreferences новыми настройками предпочтений
ALTER TABLE birthday_preferences ADD COLUMN receive_in_app BOOLEAN DEFAULT 1;
ALTER TABLE birthday_preferences ADD COLUMN reminder_days_before INTEGER DEFAULT 7;
ALTER TABLE birthday_preferences ADD COLUMN send_time TIME DEFAULT '09:00';
ALTER TABLE birthday_preferences ADD COLUMN show_birthday_public BOOLEAN DEFAULT 1;
ALTER TABLE birthday_preferences ADD COLUMN allow_card_personalization BOOLEAN DEFAULT 1;