-- Remove the "Missed A Spot" company to avoid confusion
DELETE FROM companies 
WHERE id = '42c7be25-3f12-4a25-93e7-53ace283dab6' 
AND name = 'Missed A Spot';