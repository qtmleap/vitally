-- 食品マスタ
CREATE TABLE foods (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name       TEXT NOT NULL,
  calories   REAL NOT NULL,
  protein    REAL NOT NULL DEFAULT 0,
  fat        REAL NOT NULL DEFAULT 0,
  carbs      REAL NOT NULL DEFAULT 0,
  serving    TEXT NOT NULL DEFAULT '1食分',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 食事記録
CREATE TABLE meals (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date       TEXT NOT NULL,
  meal_type  TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id    TEXT NOT NULL REFERENCES foods(id),
  quantity   REAL NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 運動記録
CREATE TABLE exercises (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  date          TEXT NOT NULL,
  name          TEXT NOT NULL,
  duration_min  INTEGER NOT NULL,
  calories      REAL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_meals_date ON meals(date);
CREATE INDEX idx_exercises_date ON exercises(date);
CREATE INDEX idx_foods_name ON foods(name);
