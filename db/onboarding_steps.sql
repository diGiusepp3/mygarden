CREATE TABLE IF NOT EXISTS onboarding_steps (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    step_key VARCHAR(64) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(32) NOT NULL,
    route VARCHAR(32) NOT NULL,
    action_label VARCHAR(64) NOT NULL,
    sort_order INT NOT NULL,
    points INT NOT NULL DEFAULT 1,
    is_ai_step TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_onboarding_step_key (step_key),
    KEY idx_onboarding_sort_order (sort_order),
    KEY idx_onboarding_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO onboarding_steps (
    step_key,
    title,
    description,
    category,
    route,
    action_label,
    sort_order,
    points,
    is_ai_step
)
WITH RECURSIVE seq AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 120
)
SELECT
    CONCAT('step_', LPAD(n, 3, '0')) AS step_key,
    CASE
        WHEN n <= 10 THEN CONCAT('Profile step ', n)
        WHEN n <= 20 THEN CONCAT('Garden step ', n - 10)
        WHEN n <= 35 THEN CONCAT('Layout step ', n - 20)
        WHEN n <= 50 THEN CONCAT('Plant flow step ', n - 35)
        WHEN n <= 60 THEN CONCAT('Greenhouse step ', n - 50)
        WHEN n <= 70 THEN CONCAT('Task step ', n - 60)
        WHEN n <= 80 THEN CONCAT('AI coach step ', n - 70)
        WHEN n <= 90 THEN CONCAT('UI polish step ', n - 80)
        WHEN n <= 100 THEN CONCAT('Dev step ', n - 90)
        ELSE CONCAT('Bonus step ', n - 100)
    END AS title,
    CASE
        WHEN n <= 10 THEN CONCAT('Help the user finish the account basics step ', n, '.')
        WHEN n <= 20 THEN CONCAT('Guide the user to create and name a garden at step ', n, '.')
        WHEN n <= 35 THEN CONCAT('Guide bed placement, sizing and layout at step ', n, '.')
        WHEN n <= 50 THEN CONCAT('Guide plant creation, assignment and harvesting at step ', n, '.')
        WHEN n <= 60 THEN CONCAT('Guide greenhouse creation and ventilation at step ', n, '.')
        WHEN n <= 70 THEN CONCAT('Guide task creation and task completion at step ', n, '.')
        WHEN n <= 80 THEN CONCAT('Use AI to coach the user with step ', n, '.')
        WHEN n <= 90 THEN CONCAT('Improve the visual UI polish at step ', n, '.')
        WHEN n <= 100 THEN CONCAT('Improve the dev workflow at step ', n, '.')
        ELSE CONCAT('Extra bonus and mastery step ', n, '.')
    END AS description,
    CASE
        WHEN n <= 10 THEN 'profile'
        WHEN n <= 20 THEN 'garden'
        WHEN n <= 35 THEN 'layout'
        WHEN n <= 50 THEN 'plants'
        WHEN n <= 60 THEN 'greenhouse'
        WHEN n <= 70 THEN 'tasks'
        WHEN n <= 80 THEN 'ai'
        WHEN n <= 90 THEN 'ui'
        WHEN n <= 100 THEN 'dev'
        ELSE 'mastery'
    END AS category,
    CASE
        WHEN n <= 10 THEN 'account'
        WHEN n <= 20 THEN 'gardens'
        WHEN n <= 35 THEN 'editor'
        WHEN n <= 50 THEN 'plants'
        WHEN n <= 60 THEN 'greenhouses'
        WHEN n <= 70 THEN 'tasks'
        WHEN n <= 80 THEN 'dev'
        WHEN n <= 90 THEN 'dashboard'
        WHEN n <= 100 THEN 'dev'
        ELSE 'dashboard'
    END AS route,
    CASE
        WHEN n <= 10 THEN 'Open profile'
        WHEN n <= 20 THEN 'Open gardens'
        WHEN n <= 35 THEN 'Open editor'
        WHEN n <= 50 THEN 'Open plants'
        WHEN n <= 60 THEN 'Open greenhouses'
        WHEN n <= 70 THEN 'Open tasks'
        WHEN n <= 80 THEN 'Open coach'
        WHEN n <= 90 THEN 'Open UI'
        WHEN n <= 100 THEN 'Open dev'
        ELSE 'Open mastery'
    END AS action_label,
    n AS sort_order,
    CASE
        WHEN n <= 10 THEN 1
        WHEN n <= 20 THEN 2
        WHEN n <= 35 THEN 3
        WHEN n <= 50 THEN 3
        WHEN n <= 60 THEN 2
        WHEN n <= 70 THEN 2
        WHEN n <= 80 THEN 2
        WHEN n <= 90 THEN 1
        WHEN n <= 100 THEN 2
        ELSE 1
    END AS points,
    CASE
        WHEN n BETWEEN 71 AND 80 THEN 1
        WHEN n BETWEEN 81 AND 90 THEN 0
        WHEN n BETWEEN 91 AND 100 THEN 0
        ELSE 0
    END AS is_ai_step
FROM seq;
