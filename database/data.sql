delete from appointments;
delete from doctors;
delete from patients;

insert into patients
  (id, name, zip, phone, email)
values
  (1, 'Angela Martin', '01821', '206-455-7225', 'monkey@example.net'),
  (2, 'Dwight Schrute', '02143', '555-102-3087', 'recyclops@example.net'),
  (3, 'Jim Halpert', '98823', '617-234-5678', 'bigtuna@example.net'),
  (4, 'Kelly Kapoor', '12345', '555-781-6723', 'businessb@example.net'),
  (5, 'Kevin Malone', '12345', '555-123-3345', 'cookiemonster@example.net'),
  (6, 'Michael Scott', '12345', '555-987-2345', 'scarn@example.net'),
  (7, 'Oscar Martinez', '12345', '555-555-5555', 'actually@example.net'),
  (8, 'Pam Beesly', '02474', '509-213-9901', 'pampam@example.net'),
  (9, 'Ryan Howard', '88642', '274-754-2798', 'temp@example.net'),
  (10, 'Toby Flenderson', '99891', '555-278-0870', 'ss@example.net');

insert into doctors
  (id, name, phone, email)
values
  (1, 'Benjamin Pierce', '03785', 'hawkeye@example.net'),
  (2, 'Beverly Crusher', '90747', 'gates@example.net'),
  (3, 'Doogie Howser', '91311', 'neil@example.net'),
  (4, 'Leonard McCoy', '50201', 'bones@example.net'),
  (5, 'Michaela Quinn', '50028', 'drmike@example.net'),
  (6, 'Miranda Bailey', '98134', 'chief@example.net');

insert into bills
  (id, patient_id, summary, amount)
values
  (1, 1, 'Knee surgery', 200);
