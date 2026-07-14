-- Seed Universities
INSERT INTO public.universities (id, code, name, logo_url, headquarters) VALUES
('11111111-1111-1111-1111-111111111111', 'PRSU', 'Pt. Ravishankar Shukla University', 'https://osdqszlyyhetdnlargrn.supabase.co/storage/v1/object/public/institutes%20_images/prsu/prsu_uni_img.jpeg', 'Raipur'),
('22222222-2222-2222-2222-222222222222', 'CSVTU', 'Chhattisgarh Swami Vivekanand Technical University', NULL, 'Bhilai'),
('33333333-3333-3333-3333-333333333333', 'AMITY', 'Amity University Chhattisgarh', NULL, 'Raipur'),
('44444444-4444-4444-4444-444444444444', 'KALINGA', 'Kalinga University', NULL, 'Naya Raipur'),
('55555555-5555-5555-5555-555555555555', 'NAGARJUNA', 'Government Nagarjuna Science College', 'https://osdqszlyyhetdnlargrn.supabase.co/storage/v1/object/public/institutes%20_images/prsu/nagarjun_uni_img.jpg', 'Raipur')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    headquarters = EXCLUDED.headquarters;

-- Seed Colleges
-- Note: Amity and Kalinga have no entries here, which will trigger the auto-skip college logic.
INSERT INTO public.colleges (id, university_id, code, name, is_autonomous, district, address) VALUES
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'SAGEMMC', 'Swami Atmanand Government English Medium Model College (SAGEMMC)', false, 'Raipur', 'Atari, Raipur')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    is_autonomous = EXCLUDED.is_autonomous,
    district = EXCLUDED.district,
    address = EXCLUDED.address;

-- Seed Courses
-- PRSU Courses
INSERT INTO public.courses (id, university_id, college_id, code, name, degree_level) VALUES
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', NULL, 'BCA', 'Bachelor of Computer Applications', 'UG'),
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', NULL, 'BSC', 'Bachelor of Science', 'UG'),
-- CSVTU Courses
('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', NULL, 'BTECH_CSE', 'B.Tech in Computer Science & Engineering', 'UG'),
-- Amity Courses (Directly under Amity University)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', NULL, 'BCA', 'Bachelor of Computer Applications', 'UG'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', NULL, 'MBA', 'Master of Business Administration', 'PG'),
-- Kalinga Courses (Directly under Kalinga University)
('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', NULL, 'BTECH_CSE', 'B.Tech in Computer Science & Engineering', 'UG'),
-- Nagarjuna Science College Courses (which is treated as a university/autonomous layer)
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', NULL, 'BSC', 'Bachelor of Science', 'UG')
ON CONFLICT DO NOTHING;

-- Seed Papers
INSERT INTO public.papers (id, university_id, college_id, course_id, semester, examination_session, exam_type, curriculum_scheme, subject_code, subject_name, file_path, file_size_bytes, download_count, is_published) VALUES
-- Paper 1: BCA Sem 1 Discrete Math (PRSU -> Atmanand College)
('da698f77-7684-4efe-a1c5-d44a79efd2ee', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'Semester 1', 'Nov-Dec 2025', 'Regular', 'CBCS', 'BCA-101', 'Discrete Mathematics', 'prsu/atmanand atari/bca/sem 1/2025/bca-1-sem-discrete-mathematics-j-2205-jan-2026.pdf', 1048576, 12, true),
-- Paper 2: BCA Sem 2 Data Structures (PRSU -> Atmanand College)
('ea708f77-7684-4efe-a1c5-d44a79efd2ef', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'Semester 2', 'May-June 2025', 'Regular', 'CBCS', 'BCA-102', 'Data Structure', 'prsu/atmanand atari/bca/sem 2/2025/bca-2-sem-data-structure-i-2253-june-2025.pdf', 2048576, 45, true),
-- Paper 3: BSC Sem 4 Chemistry (Nagarjuna Science College)
('fa808f77-7684-4efe-a1c5-d44a79efd2f0', '55555555-5555-5555-5555-555555555555', NULL, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Semester 4', 'May-June 2026', 'Regular', 'NEP-2020', 'BSC-404', 'Chemistry', 'science clg/bsc/sem 4/2026/CB-404_Digital_OCR_Draft.pdf', 3048576, 8, true)
ON CONFLICT (id) DO NOTHING;
