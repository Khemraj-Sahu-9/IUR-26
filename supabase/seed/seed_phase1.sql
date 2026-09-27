-- Phase 1: Seed Demo Data
-- Essential Community Medicines Catalog
INSERT INTO public.medicines (id, name, generic_name, unit, active) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Paracetamol 500mg', 'Paracetamol', 'tablets', true),
  ('11111111-1111-1111-1111-111111111102', 'ORS Sachet 20.5g', 'Oral Rehydration Salts', 'sachet', true),
  ('11111111-1111-1111-1111-111111111103', 'Iron Folic Acid (IFA)', 'Ferrous Sulphate + Folic Acid', 'tablets', true),
  ('11111111-1111-1111-1111-111111111104', 'Zinc Sulphate 20mg', 'Zinc Sulphate Dispersible', 'tablets', true),
  ('11111111-1111-1111-1111-111111111105', 'Albendazole 400mg', 'Albendazole Chewable', 'tablets', true),
  ('11111111-1111-1111-1111-111111111106', 'Nishchay Pregnancy Test Kit', 'hCG Test Strip', 'kit', true)
ON CONFLICT (id) DO NOTHING;

-- Central PHC Medicine Stock
INSERT INTO public.medicine_stock (id, medicine_id, location, quantity, minimum_quantity) VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Central PHC Depot', 2500, 500),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'Central PHC Depot', 80, 200),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'Central PHC Depot', 1800, 300),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'Central PHC Depot', 45, 150),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 'Central PHC Depot', 600, 100),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111106', 'Central PHC Depot', 200, 50)
ON CONFLICT (id) DO NOTHING;
