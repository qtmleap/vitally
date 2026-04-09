-- CreateTable
CREATE TABLE "meal_templates" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "name" TEXT NOT NULL,
    "meal_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "meal_template_items" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "template_id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    CONSTRAINT "meal_template_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "meal_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meal_template_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
